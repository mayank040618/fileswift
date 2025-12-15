import { FastifyInstance } from "fastify";
import { fileQueue } from "../services/queue";
import os from 'os';

export async function healthRoutes(fastify: FastifyInstance) {
    const startTime = Date.now();


    // 1. INFRASTRUCTURE HEALTH (Railway/K8s Probe) - LIVENESS
    // MUST ALWAYS return 200. Only proves the process is running.
    fastify.get('/health', async (_req, reply) => {
        return reply.status(200).send({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // 2. READINESS CHECK (Traffic Gate) - TRAFFIC GATE
    // Load Balancers check this to see if we can accept traffic.
    // Fails if Redis is down or Queue is broken.
    fastify.get('/ready', async (_req, reply) => {
        let isReady = false;
        try {
            if ((fileQueue as any).client) {
                const status = (fileQueue as any).client.status;
                isReady = status === 'ready';
            } else {
                isReady = true; // Mock Queue is always ready
            }
        } catch (e) {
            isReady = false;
        }

        if (!isReady) {
            return reply.status(503).send({ ready: false, reason: 'Redis/Queue unavailable' });
        }
        return reply.status(200).send({ ready: true });
    });

    // 3. APPLICATION STATE (Frontend/Admin) - SYSTEM TRUTH
    // Used by pollers to see deep stats.
    fastify.get('/status', async (_req, _reply) => {
        let redisStatus = 'unknown';
        let queueDepth = 0;

        try {
            if ((fileQueue as any).client) {
                redisStatus = (fileQueue as any).client.status;
                queueDepth = await (fileQueue as any).count(); // Get job count
            } else {
                redisStatus = 'mock-local';
            }
        } catch (e) {
            redisStatus = 'error';
        }

        return {
            service: 'fileswift-backend',
            uptime: Math.floor((Date.now() - startTime) / 1000),
            version: process.env.npm_package_version || '0.0.0',
            redis: redisStatus,
            queueDepth,
            system: {
                memory: process.memoryUsage().rss
            }
        };
    });

    // Deprecated: Deep checks moved to /status and /ready
    // Keeping for temporary backward compatibility if any
    fastify.get('/api/health/system', async (_req, reply) => {
        return reply.redirect('/status');
    });
}
