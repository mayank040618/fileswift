
import { FastifyInstance } from "fastify";
import fs from 'fs';
import path from 'path';
import os from 'os';
import util from 'util';
import { pipeline, finished } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import { createJob } from "../services/queue";
import { uploadState } from "../services/uploadState";
import { rateLimit } from "../services/rateLimit";

const pump = util.promisify(pipeline);
const streamFinished = util.promisify(finished);
const UPLOAD_DIR = process.env.UPLOAD_DIR || os.tmpdir();

export default async function chunkUploadRoutes(fastify: FastifyInstance) {

    // Helper: Atomic Metadata Update
    const updateMetadata = (uploadId: string, index: number) => {
        const metaPath = path.join(UPLOAD_DIR, 'chunks', uploadId, 'metadata.json');
        let meta: { chunks: number[] } = { chunks: [] };
        if (fs.existsSync(metaPath)) {
            try { meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8')); } catch { }
        }
        if (!meta.chunks.includes(index)) {
            meta.chunks.push(index);
            // Atomic write
            const tempPath = `${metaPath}.tmp`;
            fs.writeFileSync(tempPath, JSON.stringify(meta));
            fs.renameSync(tempPath, metaPath);
        }
    };

    // POST /api/upload/chunk
    // Handles a single 1MB chunk with persistent tracking
    fastify.post('/api/upload/chunk', async (req, reply) => {
        let uploadId = '';
        let index = -1;
        let fileSaved = false;

        try {
            const parts = req.parts();
            let chunkPath = '';

            for await (const part of parts) {
                if (part.type === 'file') {
                    if (!uploadId || index === -1) { } // Expect fields first

                    if (!uploadId) throw { code: 'MISSING_UPLOAD_ID', message: 'Upload ID missing' };

                    const chunkDir = path.join(UPLOAD_DIR, 'chunks', uploadId);
                    if (!fs.existsSync(chunkDir)) fs.mkdirSync(chunkDir, { recursive: true });

                    chunkPath = path.join(chunkDir, `part-${index}`);
                    await pump(part.file, fs.createWriteStream(chunkPath));

                    // Verify file is not empty
                    const stats = fs.statSync(chunkPath);
                    if (stats.size === 0) {
                        fs.unlinkSync(chunkPath);
                        throw new Error("Empty chunk received");
                    }

                    fileSaved = true;

                } else {
                    if (part.fieldname === 'uploadId') uploadId = part.value as string;
                    if (part.fieldname === 'index') index = parseInt(part.value as string);
                }
            }

            if (!fileSaved) throw { code: 'NO_FILE', message: 'No file chunk received' };

            // Update Metadata atomically
            updateMetadata(uploadId, index);

            return reply.send({ status: 'ok', index });

        } catch (e: any) {
            req.log.error({ msg: 'Chunk upload failed', error: e.message, uploadId, index });
            return reply.code(400).send({ error: e.message, code: e.code || 'CHUNK_ERROR' });
        }
    });

    // POST /api/upload/complete
    // Merges chunks and starts job
    fastify.post('/api/upload/complete', async (req, reply) => {
        const { uploadId, toolId, filename, totalChunks, data } = req.body as any;

        if (!uploadId || !toolId || toolId === 'default' || !filename || !totalChunks) {
            return reply.code(400).send({ error: "Missing fields or invalid toolId", code: "INVALID_REQUEST" });
        }

        const chunkDir = path.join(UPLOAD_DIR, 'chunks', uploadId);
        const finalPath = path.join(UPLOAD_DIR, `${uploadId}-${filename}`);

        try {
            // 1. Verify all chunks exist
            for (let i = 0; i < totalChunks; i++) {
                const p = path.join(chunkDir, `part-${i}`);
                if (!fs.existsSync(p)) {
                    return reply.code(400).send({ error: `Missing chunk ${i}`, code: 'MISSING_CHUNK' });
                }
            }

            // 2. Merge
            req.log.info({ msg: 'Merging chunks', uploadId, chunks: totalChunks });

            const writeStream = fs.createWriteStream(finalPath);

            for (let i = 0; i < totalChunks; i++) {
                const p = path.join(chunkDir, `part-${i}`);
                const data = fs.readFileSync(p);
                writeStream.write(data);
                fs.unlinkSync(p); // Cleanup chunk immediately
            }
            writeStream.end();

            // Wait for file to be fully written
            await streamFinished(writeStream);

            // Cleanup dir recursively (includes metadata.json)
            try {
                if (fs.rmSync) {
                    fs.rmSync(chunkDir, { recursive: true, force: true });
                } else {
                    // Node 12 fallback (unlikely needed but safe)
                    fs.rmdirSync(chunkDir, { recursive: true });
                }
            } catch (e) { /* ignore cleanup errors */ }

            // 3. Rate Limit check
            const stats = fs.statSync(finalPath);
            rateLimit.incrementSuccess((req as any).ip, stats.size);

            // 4. Create Job
            const job = await createJob({
                toolId,
                inputFiles: [{ filename, path: finalPath }],
                data: data || {}
            });

            // 5. Update State
            uploadState.set(uploadId, {
                status: 'processing',
                jobId: job.id,
                progress: 100
            });

            return reply.send({
                uploadId,
                jobId: job.id,
                status: 'processing'
            });

        } catch (e: any) {
            req.log.error({ msg: 'Merge failed', error: e.message, uploadId });
            return reply.code(500).send({ error: "Merge failed" });
        }
    });

    // GET /api/upload/:uploadId/chunks
    // Check which chunks provided
    fastify.get('/api/upload/:uploadId/chunks', async (req, reply) => {
        const { uploadId } = req.params as any;
        const chunkDir = path.join(UPLOAD_DIR, 'chunks', uploadId);

        if (fs.existsSync(chunkDir)) {
            const metaPath = path.join(chunkDir, 'metadata.json');
            if (fs.existsSync(metaPath)) {
                try {
                    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
                    return { chunks: meta.chunks.sort((a: number, b: number) => a - b) };
                } catch { }
            }

            // Fallback to legacy file listing
            const files = fs.readdirSync(chunkDir);
            const indexes = files
                .filter(f => f.startsWith('part-'))
                .map(f => parseInt(f.replace('part-', '')))
                .sort((a, b) => a - b);
            return { chunks: indexes };
        }

        return { chunks: [] };
    });
}
