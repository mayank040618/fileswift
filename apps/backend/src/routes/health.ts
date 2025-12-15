import { FastifyInstance } from "fastify";
import { fileQueue } from "../services/queue";
import os from 'os';

export async function healthRoutes(fastify: FastifyInstance) {
    const startTime = Date.now();

    // 1. INFRASTRUCTURE HEALTH (Railway/K8s Probe) - ALWAYS 200
    fastify.get('/health', async (_req, reply) => {
        return reply.status(200).send({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // 2. APP LOGIC HEALTH (Deep Check)
    fastify.get('/api/health/system', async (req, reply) => {
        let redisStatus = 'unknown';

        try {
            // Check if it's a real BullMQ instance
            if ((fileQueue as any).client) {
                // Check ioredis status
                const status = (fileQueue as any).client.status;
                redisStatus = status === 'ready' ? 'connected' : status;

                // Double check with a ping if it says ready
                if (status === 'ready') {
                    await (fileQueue as any).client.ping();
                }
            } else {
                redisStatus = 'mock-local'; // MockQueue
            }
        } catch (e) {
            req.log.error({ err: e }, 'Health check failed');
            redisStatus = 'error';
        }

        const isHealthy = redisStatus !== 'error';
        const healthInfo = {
            status: isHealthy ? 'ok' : 'degraded',
            uptime: Math.floor((Date.now() - startTime) / 1000),
            timestamp: new Date().toISOString(),
            service: 'backend',
            version: process.env.npm_package_version || '0.0.0',
            checks: {
                redis: redisStatus,
            },
            system: {
                memory: process.memoryUsage().rss,
                load: os.loadavg()[0],
                freeMem: os.freemem()
            }
        };

        if (!isHealthy) {
            reply.code(503);
        }

        return healthInfo;
    });
}
