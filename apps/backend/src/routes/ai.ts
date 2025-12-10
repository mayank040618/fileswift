import { FastifyInstance } from 'fastify';
import { createJob } from '../services/queue';

export default async function aiRoutes(fastify: FastifyInstance) {
    // Generic AI Tool Handler
    const handleAiTool = (toolId: string) => async (req: any, _reply: any) => {
        // Some tools might just take text input, others file uploads.
        // For now, let's assume this endpoint initiates a job, similar to /upload,
        // but maybe with more JSON body options.

        // Actually, the requirement mentions specific endpoints: /api/ai/summarize, etc.
        // We can map them.

        const body = req.body || {};
        const { fileKey, text, options } = body;

        // If fileKey is provided, it means file was already uploaded via /upload endpoint 
        // and we are just queuing the AI task on it.
        // If not, maybe it's a direct text task.

        const jobId = await createJob({
            toolId,
            key: fileKey, // can be null for text-only tools
            data: { text, options }
        });

        return { jobId, status: 'queued' };
    };

    fastify.post('/api/ai/summarize', handleAiTool('ai-summary'));
    fastify.post('/api/ai/pdf-chat', handleAiTool('ai-chat'));
    fastify.post('/api/ai/mcq', handleAiTool('ai-mcq'));
    fastify.post('/api/ai/notes', handleAiTool('ai-notes'));
    fastify.post('/api/ai/rewrite', handleAiTool('ai-rewrite'));
    fastify.post('/api/ai/translate', handleAiTool('ai-translate'));

    // Image Tools
    fastify.post('/api/ai/remove-bg', handleAiTool('remove-bg'));
    fastify.post('/api/ai/upscale', handleAiTool('ai-upscale'));
    fastify.post('/api/ai/enhance', handleAiTool('ai-enhance'));
    fastify.post('/api/ai/colorize', handleAiTool('ai-colorize'));
    fastify.post('/api/ai/remove-watermark', handleAiTool('ai-watermark-remover'));
    fastify.post('/api/ai/inpaint-remove-object', handleAiTool('ai-object-remover'));

    // Endpoint for Chat Interaction (Sync)
    fastify.post('/api/ai/chat-message', async (req: any, reply: any) => {
        const { jobId, message, history: _history } = req.body;
        // In this architecture, we need to read the indexed text (created by ai-chat job)
        // We'll mock the retrieval by assuming we can read {jobId}-index.txt if locally stored, 
        // or re-download it.

        reply.send({ response: `[AI] Mock response to "${message}". (Real implementation would fetch text for job ${jobId})` });
    });
}
