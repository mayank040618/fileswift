import { FastifyInstance } from 'fastify';
import { createJob } from '../services/queue';

export default async function toolRoutes(fastify: FastifyInstance) {
    fastify.post('/api/tools/execute', async (req: any, _reply: any) => {
        const { toolId, fileKey, files, options } = req.body;

        // Supports single fileKey or multiple 'files' (keys)
        // If 'files' is present, we pass it in data.

        const job = await createJob({
            toolId,
            key: fileKey || (files && files[0]), // Use first file as primary key for worker convenience
            data: {
                keys: files || (fileKey ? [fileKey] : []),
                options
            },
            filename: 'execution-request' // Placeholder
        });

        return { jobId: job.id, status: 'queued' };
    });
}
