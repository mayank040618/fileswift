import { FastifyInstance } from "fastify";
import { createJob } from "../services/queue";
import util from 'util';
import { pipeline } from 'stream';
import fs from 'fs';
import path from 'path';
import { Transform } from 'stream';

const pump = util.promisify(pipeline);

export default async function uploadRoutes(fastify: FastifyInstance) {
    // Limits should be configured at plugin registration level for fastify-multipart
    // But since we can't easily change index.ts right now without more context,
    // we will rely on manual check or global config.
    fastify.post("/upload", async (req, reply) => {
        const parts = req.parts();
        let toolId = 'default';
        let jobData: any = {};
        const uploadedFiles: { filename: string; path: string }[] = [];

        // Allow overriding limit via env, else default 100
        const maxFiles = parseInt(process.env.MAX_UPLOAD_FILES || '100');

        for await (const part of parts) {
            if (part.type === 'file') {
                if (uploadedFiles.length >= maxFiles) {
                    // Stop processing further files if limit reached
                    // Note: This simply ignores excess files for now or could throw error
                    continue;
                }

                // Sanitize filename: Remove special chars, spaces, and truncate.
                const safeName = part.filename.replace(/[^a-zA-Z0-9.-]/g, '_').substring(0, 50);
                const uploadDir = path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads');

                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }

                const tempPath = path.join(uploadDir, `upload-${Date.now()}-${Math.random().toString(36).substring(7)}-${safeName}`);

                // Zero-Trust: Validate Magic Bytes ONLY for PDF-expecting tools
                const toolsExpectingPdf = ['compress-pdf', 'merge-pdf', 'split-pdf', 'rotate-pdf', 'pdf-to-image', 'pdf-to-word', 'ai-summary', 'ai-notes', 'ai-rewrite', 'ai-translate'];

                const checkPdf = new Transform({
                    transform(chunk, _encoding, callback) {
                        // @ts-ignore
                        if (!this.headerChecked) {
                            // @ts-ignore
                            this.headerChecked = true;

                            // Only validate if we are sure it expects a PDF
                            if (toolsExpectingPdf.includes(toolId)) {
                                const header = chunk.toString('utf8', 0, 4);
                                if (header !== '%PDF') {
                                    return callback(new Error('Invalid file type: Not a PDF'));
                                }
                            }
                        }
                        callback(null, chunk);
                    }
                });

                try {
                    console.log(`[Upload] Streaming ${part.filename} to ${tempPath}`);
                    await pump(part.file, checkPdf, fs.createWriteStream(tempPath));

                    uploadedFiles.push({
                        filename: safeName,
                        path: tempPath
                    });
                } catch (err: any) {
                    console.error(`[Upload] Failed to save ${part.filename}:`, err.message);
                    // Cleanup partial file
                    if (fs.existsSync(tempPath)) {
                        fs.unlinkSync(tempPath);
                    }
                    // If invalid type, we should probably abort the whole request or at least warn
                    if (err.message.includes('Not a PDF')) {
                        // We can choose to return immediately or just skip this file.
                        // For security, let's skip but note it.
                        continue;
                    }
                    throw err; // unexpected error
                }
            } else {
                if (part.fieldname === 'toolId') {
                    toolId = part.value as string;
                } else if (part.fieldname === 'data') {
                    try {
                        jobData = JSON.parse(part.value as string);
                    } catch (e) {
                        req.log.warn({ err: e }, 'Failed to parse data field');
                    }
                }
            }
        }

        console.log(`[Upload] Processed ${uploadedFiles.length} files for tool: ${toolId}`);

        if (uploadedFiles.length === 0) {
            return reply.code(400).send({ error: "No files uploaded" });
        }

        try {
            console.log(`[Upload] Files saved to disk`);

            const job = await createJob({
                toolId,
                // Pass array of files
                inputFiles: uploadedFiles,
                data: jobData
            });

            reply.code(202).send({
                jobId: job.id,
                status: "queued",
                fileCount: uploadedFiles.length
            });
        } catch (e: any) {
            req.log.error(e);
            reply.code(500).send({ error: "Upload failed" });
        }
    });

    fastify.get("/api/jobs/:jobId/status", async (req, reply) => {
        const jobId = (req.params as any).jobId;

        try {
            // Retrieve job from queue (Mock or Real)
            // We need to export getJob from service
            const { getJob } = await import("../services/queue");
            const job = await getJob(jobId);

            if (!job) {
                return reply.code(404).send({ error: "Job not found" });
            }

            const isCompleted = await job.isCompleted();
            const isFailed = await job.isFailed();

            if (isCompleted) {
                const result = job.returnvalue;
                // Generate Download URL
                // If resultKey is a full URL (R2), use it.
                // If it's a filename, construct our API download URL.
                let downloadUrl = '#';
                let fileName = 'result';

                if (result) {
                    if (result.downloadUrl) {
                        downloadUrl = result.downloadUrl;
                    } else if (result.resultKey) {
                        if (result.resultKey.startsWith('http')) {
                            downloadUrl = result.resultKey;
                        } else {
                            // Fallback for legacy
                            const apiUrl = (process.env.PUBLIC_API_URL || 'http://localhost:8080').replace(/\/$/, '');
                            downloadUrl = `${apiUrl}/api/download/${result.resultKey}`;
                        }
                    }
                    if (result.resultKey) fileName = result.resultKey;
                }

                return {
                    id: jobId,
                    status: "completed",
                    progress: 100,
                    downloadUrl,
                    fileName,
                    result
                };
            } else if (isFailed) {
                return { id: jobId, status: "failed", error: job.failedReason };
            } else {
                return { id: jobId, status: "processing", progress: 50 };
            }

        } catch (e) {
            console.error(e);
            return reply.code(500).send({ error: "Failed to check job status" });
        }
    });
}
