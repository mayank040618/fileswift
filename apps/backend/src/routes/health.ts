
import { FastifyInstance } from "fastify";

export async function healthRoutes(fastify: FastifyInstance) {
    const startTime = Date.now();

    fastify.get('/health', async () => {
        return {
            status: 'ok',
            uptime: Math.floor((Date.now() - startTime) / 1000),
            timestamp: new Date().toISOString()
        };
    });
}
