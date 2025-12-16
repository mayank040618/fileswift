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
        console.log('[Boot] Initializing...');

        // 3. Register Plugins (Robust Mode)
        // We wrap steps in try-catch to ensure one bad plugin doesn't kill the whole server.

        try {
            console.log('[Boot] Registering Core Middleware...');
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
            console.log('[Boot] Core Middleware Registered');
        } catch (e) {
            console.error('[Boot] CRITICAL: Core Middleware Failed', e);
            // We continue, but this is bad.
        }

        // Register Routes (Granular Checks)
        const safeRegister = async (name: string, plugin: any) => {
            try {
                // console.log(`[Boot] Registering ${name}...`);
                await server.register(plugin);
            } catch (e) {
                console.error(`[Boot] FAILED to register ${name}`, e);
            }
        };

        await safeRegister('Health (App)', healthRoutes);
        await safeRegister('Health (GS)', healthGsRoutes);
        await safeRegister('Download', downloadRoutes);
        await safeRegister('Upload (Main)', uploadRoutes);
        await safeRegister('Upload (Direct)', uploadDirectRoutes);
        await safeRegister('Upload (Chunk)', chunkUploadRoutes);
        await safeRegister('Tools', toolRoutes);
        await safeRegister('Waitlist', waitlistRoutes);
        await safeRegister('Feedback', feedbackRoutes);

        console.log('[Boot] All Routes Processed');

        // 4. LISTEN (Barrier)
        const port = Number(process.env.PORT || 8080);
        console.log(`[Boot] Attempting to listen on ${port}...`);

        await server.listen({ port, host: '0.0.0.0' });

        console.log(`[Boot] Server listening on ${port} (Ready for Traffic)`);

        // 5. Background Systems (Post-Boot)
        try {
            setInterval(runCleanup, 10 * 60 * 1000);
            console.log('[Boot] Starting Worker...');
            startWorker().catch(err => console.error('[Worker] Failed to start:', err));
        } catch (e) {
            console.error('[Boot] Background Systems Error', e);
        }

    } catch (err) {
        console.error('[Boot] FATAL ERROR', err);
        process.exit(1);
    }
};

start();
