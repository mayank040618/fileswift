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
import { runCleanup } from './services/cleanup';
import { startWorker } from './worker';

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
        console.log('[Boot] Registering Plugins (Sync)...');

        // 3. Register Plugins (Synchronous Registration)
        // Standard static imports ensure all code is loaded BEFORE we try to listen.
        // This eliminates "Async Gaps" where the server is alive but routes are missing.

        await server.register(cors, {
            origin: [
                'https://fileswift.in',
                'https://www.fileswift.in',
                'https://fileswift-app.vercel.app',
                'http://localhost:3000',
            ],
            credentials: true,
        });

        await server.register(multipart, {
            limits: {
                fileSize: (parseInt(process.env.MAX_UPLOAD_SIZE_MB || '50') * 1024 * 1024),
                files: 100
            }
        });

        await server.register(helmet, { global: true });
        server.addHook('preHandler', rateLimitMiddleware);

        // Register Routes
        await server.register(healthRoutes);
        await server.register(healthGsRoutes);
        await server.register(downloadRoutes);
        await server.register(uploadRoutes);
        await server.register(uploadDirectRoutes);
        await server.register(chunkUploadRoutes);
        await server.register(toolRoutes);
        await server.register(waitlistRoutes);
        await server.register(feedbackRoutes);

        console.log('[Boot] Server Ready to Listen');

        // 4. LISTEN (Barrier)
        // Mandatory Fix: Strict Port Binding on 0.0.0.0
        const port = Number(process.env.PORT || 8080);
        await server.listen({ port, host: '0.0.0.0' });

        console.log(`[Boot] Server listening on ${port}`);

        // 5. Background Systems (Post-Boot)
        // Strictly after listen
        setInterval(runCleanup, 10 * 60 * 1000);

        // Detached Worker Start
        console.log('[Boot] Starting Worker...');
        startWorker().catch(err => console.error('[Worker] Failed to start:', err));

    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

start();
