// Services - Pure HTTP Server
// STRICT PRODUCTION BOOT SEQUENCE

import './config/env';
import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import helmet from "@fastify/helmet";
import { rateLimitMiddleware } from './middleware/rateLimit';

// Services (Lazy Start)
import { startWorker } from './worker';

// Route Imports
import { healthRoutes } from './routes/health';
import { healthGsRoutes } from './routes/health-gs';
import { downloadRoutes } from './routes/download';
import uploadRoutes from './routes/upload';
import uploadDirectRoutes from './routes/upload-direct';
import chunkUploadRoutes from "./routes/upload-chunk";
import toolRoutes from './routes/tools';
import waitlistRoutes from './routes/waitlist';
import feedbackRoutes from './routes/feedback';

// 1. Initialize Server
const server = Fastify({
    logger: true,
    connectionTimeout: 180000,
    bodyLimit: 10485760,
});

// 2. HEALTHCHECK — MUST BE INSTANT (Priority #1)
server.get('/health', async (_req, reply) => {
    return { ok: true };
});

const start = async () => {
    try {
        console.log('[Boot] Initializing...');

        // 3. Register Plugins
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

        // Middleware Isolation (Skip /health explicitly)
        server.addHook('preHandler', async (req, reply) => {
            if (req.url === '/health' || req.url.startsWith('/health')) return;
            await rateLimitMiddleware(req, reply);
        });

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

        console.log('[Boot] Routes Registered.');

        // 4. START SERVER FIRST (NON-NEGOTIABLE)
        const port = Number(process.env.PORT || 8080);

        await server.listen({ port, host: '0.0.0.0' });

        console.log(`🚀 Server listening on port ${port}`);

        // 5. START WORKER AFTER SERVER IS LIVE
        console.log('🔄 Triggering Background Worker...');
        startWorker().catch(err => {
            console.error('❌ Worker failed to start', err);
            // We do NOT crash the server. HTTP must remain active.
        });

    } catch (err) {
        console.error('[Boot] FATAL ERROR', err);
        process.exit(1);
    }
};

start();
