import './config/env';
import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import helmet from "@fastify/helmet";
import { rateLimitMiddleware } from './middleware/rateLimit';

// Routes
import { healthRoutes } from './routes/health';
import { healthGsRoutes } from './routes/health-gs';
import { downloadRoutes } from './routes/download';
import uploadRoutes from './routes/upload';
import uploadDirectRoutes from './routes/upload-direct';
import chunkUploadRoutes from "./routes/upload-chunk";
import toolRoutes from './routes/tools';
import waitlistRoutes from './routes/waitlist';
import feedbackRoutes from './routes/feedback';

// Services
// NOTE: Worker and Cleanup are now moved to 'worker.ts' and run in a separate process.
// This ensures the HTTP server is pure and instant-start.

// STRICT PRODUCTION BOOT SEQUENCE
// 1. Initialize Server
const server = Fastify({
    logger: true,
    connectionTimeout: 180000,
    bodyLimit: 10485760,
});

// 2. Liveness Probe (Sync)
server.get('/health', (_req, reply) => {
    reply.send({ status: 'ok', timestamp: Date.now() });
});

const start = async () => {
    try {
        console.log('[Boot] Initializing...');

        // 3. Register Plugins (Non-Blocking)
        // We do NOT await these. Fastify queues them and resolves them during boot.
        // This ensures 'listen' is the FIRST blocking await.

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
        server.addHook('preHandler', rateLimitMiddleware);

        // Register Routes (Non-Blocking)
        server.register(healthRoutes);
        server.register(healthGsRoutes);
        server.register(downloadRoutes);
        server.register(uploadRoutes);
        server.register(uploadDirectRoutes);
        server.register(chunkUploadRoutes);
        server.register(toolRoutes);
        server.register(waitlistRoutes);
        server.register(feedbackRoutes);

        console.log('[Boot] Plugins Queued. Starting Server...');

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
