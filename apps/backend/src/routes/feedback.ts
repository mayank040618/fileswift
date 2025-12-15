
import { FastifyInstance } from "fastify";
import fs from 'fs-extra';
import path from 'path';

// Simple text-based feedback log
const FEEDBACK_FILE = path.join(process.cwd(), 'logs', 'feedback.jsonl');

export default async function feedbackRoutes(fastify: FastifyInstance) {
    // Ensure logs dir exists
    await fs.ensureDir(path.join(process.cwd(), 'logs'));

    fastify.post('/api/feedback', async (req, reply) => {
        const { toolId, helpful } = req.body as { toolId: string, helpful: boolean };

        if (typeof toolId !== 'string' || typeof helpful !== 'boolean') {
            return reply.code(400).send({ error: 'Invalid input' });
        }

        const entry = JSON.stringify({
            timestamp: new Date().toISOString(),
            toolId,
            helpful,
            ip: (req as any).ip
        });

        // Fire and forget append
        fs.appendFile(FEEDBACK_FILE, entry + '\n', (err) => {
            if (err) req.log.error({ msg: 'Feedback log failed', err });
        });

        return { status: 'recorded' };
    });
}
