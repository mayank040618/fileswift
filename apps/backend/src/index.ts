import './config/env';
import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import helmet from "@fastify/helmet";
import { rateLimitMiddleware } from './middleware/rateLimit';

// Route Imports (Static & Simple)
// We rely on the fact that these modules utilize LAZY initialization for ext. systems (Redis/Queue)
import { healthRoutes } from './routes/health';
import { healthGsRoutes } from './routes/health-gs';
import { downloadRoutes } from './routes/download';
import uploadRoutes from './routes/upload';
import uploadDirectRoutes from './routes/upload-direct';
import chunkUploadRoutes from "./routes/upload-chunk";
import toolRoutes from './routes/tools';
import waitlistRoutes from './routes/waitlist';
import feedbackRoutes from './routes/feedback';

// Services - Pure HTTP Server
// STRICT PRODUCTION BOOT SEQUENCE

// 1. Initialize Server
const server = Fastify({
    logger: true,
    connectionTimeout: 180000,
    bodyLimit: 10485760,
});

// 2. Healthcheck (MANDATORY FIX: Defined FIRST, Zero Dependencies)
server.get('/health', (_req, reply) => {
    reply.code(200).send({ ok: true });
});

const start = async () => {
    try {
        console.log('[Boot] Initializing...');

        // 3. Register Plugins
        // We do NOT await these. Fastify queues them.

        server.register(cors, {
            origin: [
                'https://fileswift.in',
                'https://www.fileswift.in',
                'https://fileswift-app.vercel.app',
                'http://localhost:3000',
            ],
            credentials: true,
        });

        server.register(multipart, {
            limits: {
                fileSize: (parseInt(process.env.MAX_UPLOAD_SIZE_MB || '50') * 1024 * 1024),
                files: 100
            }
        });

        server.register(helmet, { global: true });

        // Middleware Isolation (Skip /health explicitly)
        server.addHook('preHandler', async (req, reply) => {
            if (req.url === '/health' || req.url.startsWith('/health')) return;
            await rateLimitMiddleware(req, reply);
        });

        // Register Routes (Standard Static Registration)
        // Simple, Readable, Debuggable.
        await server.register(healthRoutes);
        await server.register(healthGsRoutes);
        await server.register(downloadRoutes);
        await server.register(uploadRoutes);
        await server.register(uploadDirectRoutes);
        await server.register(chunkUploadRoutes);
        await server.register(toolRoutes);
        await server.register(waitlistRoutes);
        await server.register(feedbackRoutes);

        console.log('[Boot] Routes Registered. Starting Server...');

        // 4. LISTEN (The First Barrier)
        // Mandatory Fix: Strict Port Binding on 0.0.0.0
        const port = Number(process.env.PORT || 8080);
        await server.listen({ port, host: '0.0.0.0' });

        console.log(`[Boot] Server listening on ${port} (Ready for Traffic)`);

    } catch (err) {
        console.error('[Boot] FATAL ERROR', err);
        process.exit(1);
    }
};

start();
