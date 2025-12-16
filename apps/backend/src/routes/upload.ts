import { FastifyInstance } from "fastify";
import { isValidToolId } from "../services/toolRegistry";
import { createJob, getJob } from "../services/queue";
import fs from 'fs';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
import { uploadState } from "../services/uploadState";
import { rateLimit } from "../services/rateLimit";



export default async function uploadRoutes(fastify: FastifyInstance) {

    // --- Health Endpoint ---
    // --- Health Endpoint (Upload Only) ---
    fastify.get("/api/health/upload", async (_req, reply) => {
        // 1. Check if Temp Dir is writable
        try {
            // We use os.tmpdir() or UPLOAD_DIR
            const testFile = path.join(os.tmpdir(), `health-${Date.now()}`);
            fs.writeFileSync(testFile, 'ok');
            fs.unlinkSync(testFile);
        } catch (e) {
            return reply.code(503).send({ uploadReady: false, error: "Temp dir not writable" });
        }

        return {
            uploadReady: true,
            maxFileSizeMB: parseInt(process.env.MAX_UPLOAD_SIZE_MB || '50'),
            timeoutSeconds: 120,
            streaming: true
        };
    });

    // --- Health Endpoint (Process Readiness) ---
    fastify.get("/api/health/process", async (_req, _reply) => {
        // Identify what tools are needed
        // We can piggyback on existing health-gs logic or re-import
        try {
            const { checkTools } = await import('../utils/cli-checks');
            const status = await checkTools(false);
            const isReady = status.ghostscript || status.qpdf || status.libreoffice;

            return {
                processReady: isReady,
                details: status
            };
        } catch (e) {
            return { processReady: false, error: "Tool check failed" };
        }
    });

    // --- Status Endpoint ---
    fastify.get("/api/upload-status/:uploadId", async (req, reply) => {
        const uploadId = (req.params as any).uploadId;
        const state = await uploadState.get(uploadId);

        if (!state) {
            return reply.code(404).send({ error: "Upload session not found" });
        }

        // If we have a jobId, we can also check the job status if needed,
        // but for now let's just return the state (which contains jobId).
        // The frontend can switch to polling job status once it sees 'processing' + jobId.
        return state;
    });

    // --- Download Endpoint (Secure) ---
    fastify.get("/api/download/:token", async (req, reply) => {
        const token = (req.params as any).token;
        const filePath = await uploadState.verifyDownloadToken(token);

        console.log(`[Download] Token: ${token}, Path: ${filePath}, Exists: ${filePath ? fs.existsSync(filePath) : 'N/A'}`);

        if (!filePath || !fs.existsSync(filePath)) {
            return reply.code(410).send({ error: "Download link expired or invalid" });
        }

        const filename = path.basename(filePath);
        const stream = fs.createReadStream(filePath);

        reply.header('Content-Disposition', `attachment; filename="${filename}"`);
        return reply.send(stream);
    });

    // --- Upload Endpoint ---
    fastify.post("/api/upload", async (req, reply) => {
        console.log("Upload endpoint mounted at /api/upload");
        const userAgent = (req.headers['user-agent'] || '').toLowerCase();

        // 1. Bot Protection - DISABLED (Unrestricted Mode)
        // if (userAgent.includes('curl') || userAgent.includes('python') || userAgent.includes('bot') || userAgent.includes('crawler')) {
        //    return reply.code(403).send({ error: "Access denied", code: "BOT_DETECTED" });
        // }

        const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip;
        // Content-Length is useful for rate limiting check but not reliable for streaming progress often
        const contentLengthHeader = req.headers['content-length'];
        const contentLength = contentLengthHeader ? parseInt(contentLengthHeader) : 0;

        // 2. Rate Limiting (Fair Usage) - DISABLED FOR DEBUGGING
        // rateLimit.trackAttempt(ip);
        // const limitResult = rateLimit.check(ip, contentLength);

        // if (limitResult.blocked) {
        //     return reply.code(429).send({
        //         error: "Fair usage limit reached (25 uploads/hour). Please try again later.",
        //         code: "UPLOAD_HOURLY_LIMIT_REACHED",
        //         retryAfterMinutes: limitResult.remaining
        //     });
        // }

        // if (limitResult.delay > 0) {
        //     // Soft Limit Throttling
        //     await new Promise(resolve => setTimeout(resolve, limitResult.delay));
        // }

        const requestId = req.id;
        const uploadId = uuidv4();

        // Initialize State
        await uploadState.set(uploadId, {
            status: 'uploading',
            progress: 0
        });

        req.log.info({ msg: 'Upload started', uploadId, requestId, contentLength, userAgent, ip });

        let toolId: string | null = null;
        let jobData: any = {};
        const uploadedKeys: { filename: string; key: string }[] = [];
        // We no longer track tempFiles for cleanup here, as storage layer handles it (or S3 cleanup policy)

        try {
            const parts = req.parts();

            // Handle Client Abort
            req.raw.on('aborted', async () => {
                req.log.warn({ msg: 'Upload aborted by client', uploadId });
                await uploadState.set(uploadId, { status: 'failed', error: 'Upload aborted', errorCode: 'NETWORK_ABORT' });
            });

            const { pipeline } = await import('stream/promises');

            for await (const part of parts) {
                if (part.type === 'file') {
                    // Check max files limit
                    const maxFiles = parseInt(process.env.MAX_UPLOAD_FILES || '100');
                    if (uploadedKeys.length >= maxFiles) {
                        part.file.resume(); // Skip
                        continue;
                    }

                    const safeName = part.filename.replace(/[^a-zA-Z0-9.-]/g, '_').substring(0, 50);
                    const tempFilePath = path.join(os.tmpdir(), `upload-${uploadId}-${safeName}`);

                    req.log.info({ msg: `Buffering to local disk`, filename: safeName, tempPath: tempFilePath, uploadId });

                    try {
                        // Stream to local disk (Fast & Reliable for Mobile)
                        await pipeline(part.file, fs.createWriteStream(tempFilePath));
                        uploadedKeys.push({ filename: safeName, key: tempFilePath });
                    } catch (err: any) {
                        req.log.error({ msg: "Local Buffer Failed", error: err });
                        if (err.message === 'File too large') throw { code: 'UPLOAD_FILE_TOO_LARGE' };
                        throw err;
                    }
                } else {
                    if (part.fieldname === 'toolId') toolId = part.value as string;
                    else if (part.fieldname === 'data') {
                        try {
                            jobData = JSON.parse(part.value as string);
                        } catch (e) { /* ignore */ }
                    }
                }
            }

            // STRICT VALIDATION (Moved after loop) - but we must handle "missing toolId" gracefully
            // Often toolId comes AFTER files in multipart, so we only check here.

            if (!toolId || toolId === 'default') {
                // If we uploaded files but got no toolID, we should probably delete them? 
                // For now, let's just fail. local temp files will be cleaned up by OS eventually or we can add cleanup.
                req.log.error({ msg: 'Missing or Invalid Tool ID', uploadId, toolId });
                await uploadState.set(uploadId, { status: 'failed', error: 'Missing Tool ID', errorCode: 'INVALID_REQUEST' });
                return reply.code(400).send({ error: "Tool ID is required", code: "MISSING_TOOL_ID" });
            }

            if (!isValidToolId(toolId)) {
                throw new Error(`Invalid Tool ID: '${toolId}'`);
            }

            if (uploadedKeys.length === 0) {
                await uploadState.set(uploadId, { status: 'failed', error: 'No files', errorCode: 'NO_FILES' });
                return reply.code(400).send({ error: "No files uploaded" });
            }

            req.log.info({ msg: 'Upload completed (Buffered Locally)', uploadId, fileCount: uploadedKeys.length });

            // Create Job
            req.log.info({ msg: 'Creating Job...', uploadId, toolId });

            // Note: inputFiles now contains LOCAL PATHS
            const job = await createJob({
                toolId,
                inputFiles: uploadedKeys.map(k => ({ filename: k.filename, path: k.key })),
                storageMode: 'local', // Explicitly Local
                data: jobData
            });
            req.log.info({ msg: 'Job Created', uploadId, jobId: job.id });

            // Update State
            await uploadState.set(uploadId, {
                status: 'processing',
                jobId: job.id,
                progress: 100
            });

            // Increment Usage Count (Successful only) - DISABLED
            // rateLimit.incrementSuccess(ip, contentLength);

            req.log.info({ msg: 'Sending 202 Response', uploadId, jobId: job.id });
            // Reply with 202 and IDs
            return reply.code(202).send({
                uploadId,
                jobId: job.id,
                status: "processing", // We jumped specifically to processing since we finished upload
                message: "Upload accepted"
            });

        } catch (error: any) {
            req.log.error({ msg: 'Upload failed', uploadId, code: error.code, message: error.message });

            let code = "INTERNAL_RETRYABLE";
            let status = 500;
            let msg = "Internal Upload Error";

            if (error.code === 'FST_PARTS_LIMIT' || error.code === 'FST_FILES_LIMIT' || error.code === 'FST_FIELDS_LIMIT') {
                code = "UPLOAD_LIMIT_EXCEEDED";
                status = 413;
                msg = "Upload limits exceeded";
            } else if (error.code === 'FST_REQ_FILE_TOO_LARGE' || error.code === 'UPLOAD_FILE_TOO_LARGE') {
                code = "UPLOAD_LIMIT_EXCEEDED";
                status = 413;
                msg = "File too large (Max 50MB)";
            } else if (error.message?.includes('stream') || error.message?.includes('premature close') || error.code === 'NETWORK_ABORT') {
                code = "NETWORK_ABORT";
                status = 400;
                msg = "Network interruption during upload";
            }

            await uploadState.set(uploadId, { status: 'failed', error: msg, errorCode: code });
            return reply.code(status).send({ error: msg, code });
        }
    });

    // --- Job Status Endpoint (Legacy/Job Polling) ---
    fastify.get("/api/jobs/:jobId/status", async (req, reply) => {
        const jobId = (req.params as any).jobId;

        try {
            // Retrieve job from queue
            const job = await getJob(jobId);

            if (!job) {
                return reply.code(404).send({ error: "Job not found" });
            }

            const isCompleted = await job.isCompleted();
            const isFailed = await job.isFailed();

            if (isCompleted) {
                const result = job.returnvalue;
                let downloadUrl = '#'; // Fallback
                let fileName = 'result';

                if (result) {
                    let finalPath = '';

                    if (result.resultKey) {
                        // If using Cloud Storage, prefer the pre-calculated downloadUrl (Signed URL)
                        const isCloudStorage = process.env.STORAGE_PROVIDER === 's3' || process.env.STORAGE_PROVIDER === 'r2';

                        if (isCloudStorage && result.downloadUrl && result.downloadUrl.startsWith('http')) {
                            downloadUrl = result.downloadUrl;
                        }
                        // If resultKey is explicitly a URL (legacy/external), use it
                        else if (result.resultKey.startsWith('http')) {
                            downloadUrl = result.resultKey;
                        } else {
                            // Local File Path -> Generate Secure Token
                            finalPath = result.resultKey;
                            const token = await uploadState.createDownloadToken(finalPath);
                            const apiUrl = (process.env.PUBLIC_API_URL || 'http://localhost:8080').replace(/\/$/, '');
                            downloadUrl = `${apiUrl}/api/download/${token}`;
                        }
                    } else if (result.downloadUrl) {
                        downloadUrl = result.downloadUrl; // Fallback
                    }

                    if (result.resultKey) fileName = path.basename(result.resultKey);
                }

                return {
                    id: jobId,
                    status: "completed",
                    progress: 100,
                    downloadUrl, // Tokenized or direct URL
                    fileName,
                    result: { ...result, downloadUrl } // Include downloadUrl in result for convenience
                };
            } else if (isFailed) {
                return { id: jobId, status: "failed", error: job.failedReason };
            } else {
                return { id: jobId, status: "processing", progress: 50 };
            }

        } catch (e) {
            req.log.error(e);
            return reply.code(500).send({ error: "Failed to check job status" });
        }
    });


}
