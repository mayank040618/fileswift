import './config/env';
import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import helmet from "@fastify/helmet";
import { rateLimitMiddleware } from './middleware/rateLimit';

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

        // Register Routes (Dynamic Importing with Safe Wrappers)

        // Named Exports need wrapper: m -> { default: m.NamedConfig }
        server.register(import('./routes/health').then(m => ({ default: m.healthRoutes })));
        server.register(import('./routes/health-gs').then(m => ({ default: m.healthGsRoutes })));
        server.register(import('./routes/download').then(m => ({ default: m.downloadRoutes })));

        // Default Exports work directly
        server.register(import('./routes/upload'));
        server.register(import('./routes/upload-direct'));
        server.register(import('./routes/upload-chunk'));
        server.register(import('./routes/tools'));
        server.register(import('./routes/waitlist'));
        server.register(import('./routes/feedback'));

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
