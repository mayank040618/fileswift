
import { FastifyInstance } from "fastify";
import fs from 'fs-extra';
import path from 'path';

export async function downloadRoutes(fastify: FastifyInstance) {
    // Original plan had /api/download/:fileKey, but strictly we are now using /api/download/:jobId/:filename
    // to map to the temp storage structure
    // Use wildcard for filename to handle special chars/spaces reliably
    fastify.get('/api/download/:jobId/*', async (req, reply) => {
        const { jobId, '*': rawFilename } = req.params as { jobId: string, '*': string };
        const filename = decodeURIComponent(rawFilename);

        // Security: Prevent directory traversal
        // Naive check `filename.includes('..')` blocks valid files like "report..pdf"
        // We use path.normalize to check if it tries to escape directory

        // Construct strict base path for this job
        // const jobDir = path.join(process.cwd(), 'uploads', 'jobs', jobId); // unused
        // We expect file to be in jobDir or jobDir/outputs

        // Simple regex check for traversal characters ONLY (start of string or after slash)
        // But better is to just rely on resolved paths below.
        if (filename.includes('/') || filename.includes('\\')) {
            // We usually only allow single filename in this route segment due to wildcard behavior ??
            // Actually wildcard matches "path/to/file", so we might get slashes if nested? 
            // BUT our system produces flat output keys mostly.
            // Safe bet: reject slashes if we expect flat filenames.

            // However, to be 100% safe against ".." even without slashes (if that were possible? no, traversing requires slash)
            // Let's just trust resolve logic.
        }

        // Fix: Use process.cwd()/uploads/jobs to match jobProcessor.ts
        // Align with jobProcessor.ts storage logic
        const baseDir = process.env.UPLOAD_DIR
            ? path.join(process.cwd(), process.env.UPLOAD_DIR)
            : path.join(require('os').tmpdir(), 'fileswift-uploads');
        const jobsBaseDir = path.join(baseDir, 'jobs');

        // Try 'outputs' dir first
        const outputsDir = path.join(jobsBaseDir, jobId, 'outputs');
        let filePath = path.join(outputsDir, filename);

        // Resolve absolute path
        let resolvedPath = path.resolve(filePath);

        // Security Check: Must lie within jobsBaseDir/jobId
        // We allow reading from job root or outputs
        const allowedRoot = path.resolve(path.join(jobsBaseDir, jobId));

        if (!resolvedPath.startsWith(allowedRoot)) {
            console.warn(`[Download] Blocked traversal attempt: ${filename} -> ${resolvedPath}`);
            return reply.code(400).send({ error: "Invalid path" });
        }

        console.log(`[Download] Checking path: ${filePath}`);

        if (!await fs.pathExists(filePath)) {
            // Fallback: try root of job dir (for legacy/simple cases)
            const rootPath = path.join(jobsBaseDir, jobId, filename);
            // Verify root path security too
            const resolvedRootPath = path.resolve(rootPath);
            if (!resolvedRootPath.startsWith(allowedRoot)) {
                return reply.code(400).send({ error: "Invalid path" });
            }

            console.log(`[Download] Not found in outputs. Checking root: ${rootPath}`);
            filePath = rootPath;

            if (!await fs.pathExists(filePath)) {
                console.log(`[Download] File NOT FOUND at either location.`);
                return reply.code(404).send({ error: "File not found" });
            }
        }

        const stats = await fs.stat(filePath);

        // Create a safe ASCII filename for fallback
        // Remove non-ascii and unsafe chars
        const safeFilename = filename.replace(/[^\x20-\x7E]|[",;]/g, '_');

        // Determine MIME type based on extension
        const ext = path.extname(filename).toLowerCase();
        const mimeTypes: Record<string, string> = {
            '.pdf': 'application/pdf',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            '.doc': 'application/msword',
            '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            '.zip': 'application/zip',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
        };
        const contentType = mimeTypes[ext] || 'application/octet-stream';

        reply
            .header('Content-Disposition', `attachment; filename="${safeFilename}"; filename*=UTF-8''${encodeURIComponent(filename)}`)
            .header('Content-Length', stats.size)
            .header('Content-Type', contentType);

        const stream = fs.createReadStream(filePath);
        return reply.send(stream);
    });
}
