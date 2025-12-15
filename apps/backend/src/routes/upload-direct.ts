import { FastifyInstance } from "fastify";
import { createJob } from "../services/queue";
import { getUploadUrl } from "../services/storage";
import { uploadState } from "../services/uploadState";
import { rateLimit } from "../services/rateLimit";
import path from 'path';
import fs from 'fs';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
import util from 'util';
import { pipeline } from 'stream';

const pump = util.promisify(pipeline);
const LOCAL_UPLOAD_DIR = process.env.UPLOAD_DIR ? path.join(process.cwd(), process.env.UPLOAD_DIR) : path.join(os.tmpdir(), 'fileswift-uploads');

export default async function directUploadRoutes(fastify: FastifyInstance) {

    // Allow raw binary streaming for all content types within this plugin scope
    fastify.addContentTypeParser('*', (req, payload, done) => {
        done(null, payload);
    });

    // 1. INIT: Get Presigned URL
    fastify.post("/api/upload/init", async (req, reply) => {
        const { filename, contentType, size, toolId } = req.body as any;

        if (!filename || !size || !toolId) {
            return reply.code(400).send({ error: "Missing required fields (filename, size, toolId)" });
        }

        const { isToolIdValid } = await import('../config/toolRegistry');
        if (!isToolIdValid(toolId)) {
            return reply.code(400).send({ error: `Invalid Tool ID: ${toolId}` });
        }

        const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip;

        // Rate Limit Check (Start of flow)
        rateLimit.trackAttempt(ip);
        const limitResult = rateLimit.check(ip, size);
        if (limitResult.blocked) {
            return reply.code(429).send({ error: "Rate limit exceeded", retryAfter: limitResult.remaining });
        }

        const uploadId = uuidv4();
        // Sanitize filename for storage key
        const safeName = filename.replace(/[^a-zA-Z0-9.-]/g, '_').substring(0, 50);
        const key = `${Date.now()}-${uploadId}-${safeName}`;

        try {
            const { url, method, headers } = await getUploadUrl(key, contentType || 'application/octet-stream');

            uploadState.set(uploadId, {
                status: 'uploading',
                progress: 0,
                jobId: undefined
            });

            return {
                uploadId,
                key,
                uploadUrl: url,
                method,
                requiredHeaders: headers
            };
        } catch (e: any) {
            req.log.error(e);
            return reply.code(500).send({ error: "Failed to generate upload URL" });
        }
    });

    // 2. BINARY UPLOAD (Local Fallback Only)
    // If we are using S3, this route is NOT used (client uploads to S3 directly).
    // If we are Local, client PUTs here.
    fastify.put("/api/upload/binary/:key", async (req, reply) => {
        const key = (req.params as any).key;

        // Ensure local dir exists
        if (!fs.existsSync(LOCAL_UPLOAD_DIR)) {
            fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });
        }

        const filePath = path.join(LOCAL_UPLOAD_DIR, key);
        const writeStream = fs.createWriteStream(filePath);

        req.log.info({ msg: 'Receiving binary stream', key });

        try {
            await pump(req.raw, writeStream);
            return reply.send({ status: 'ok' });
        } catch (e: any) {
            req.log.error({ msg: 'Binary upload failed', error: e.message });
            return reply.code(500).send({ error: "Stream failed" });
        }
    });

    // 3. CONFIRM: Trigger Job
    fastify.post("/api/upload/confirm", async (req, reply) => {
        const { uploadId, toolId, key, filename, data } = req.body as any;

        if (!uploadId || !toolId || !key) {
            return reply.code(400).send({ error: "Missing confirmation details" });
        }

        const { isToolIdValid } = await import('../config/toolRegistry');
        if (!isToolIdValid(toolId)) {
            return reply.code(400).send({ error: `Invalid Tool ID: ${toolId} (Registry Check)` });
        }

        // Validate File Exists (Stat S3 or Local)
        // For efficiency, we assume if client says "done", and we find it, it's good.
        // We'll trust the jobProcessor to actually fetch/move it.
        // But for "Binary Fallback", we should check local FS quick.

        const isS3 = (process.env.STORAGE_PROVIDER === 's3' || process.env.STORAGE_PROVIDER === 'r2');
        let localPath: string | undefined;

        if (!isS3) {
            localPath = path.join(LOCAL_UPLOAD_DIR, key);
            if (!fs.existsSync(localPath)) {
                return reply.code(400).send({ error: "File not found on server" });
            }
        }

        // Create Job
        req.log.info({ msg: 'Confirming Upload -> Creating Job', uploadId, toolId });

        try {
            const job = await createJob({
                toolId,
                inputFiles: [{ filename: filename || key, path: localPath || '' }], // If S3, path is ignored by processor? Wait, processor needs Key for S3.
                // We need to update JobData interface to support 'key' for bulk or single.
                // existing 'key' input is supported.
                key: isS3 ? key : undefined,
                filename: filename || key,
                path: localPath, // If local
                data: data || {}
            });

            uploadState.set(uploadId, {
                status: 'processing',
                jobId: job.id,
                progress: 100
            });

            return reply.code(202).send({
                jobId: job.id,
                status: 'processing',
                uploadId
            });

        } catch (e: any) {
            req.log.error({ msg: 'Job creation failed', error: e.message });
            return reply.code(500).send({ error: "Failed to create job" });
        }
    });
}
