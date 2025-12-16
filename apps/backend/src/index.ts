// Services - Pure HTTP Server
// STRICT PRODUCTION BOOT SEQUENCE
import './config/env';
import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import helmet from "@fastify/helmet";
import { rateLimitMiddleware } from './middleware/rateLimit';
import { initBackgroundServices } from './background';

// 1. Initialize Server (Bare metal)
const server = Fastify({
    logger: true,
    connectionTimeout: 180000,
    bodyLimit: 10485760,
});

// 2. HEALTHCHECK — MUST BE INSTANT (Priority #1)
// ❗ RULE: Nothing async is allowed before app.listen()
server.get('/health', async () => {
    return { status: 'ok' }; // Standardized response
});

const start = async () => {
    try {
        const PORT = Number(process.env.PORT || 8080);
        console.log('[Boot] HTTP Server init...');

        // 3. Register Critical Middleware (Fast & Required for security)
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
            limits: { fileSize: (parseInt(process.env.MAX_UPLOAD_SIZE_MB || '50') * 1024 * 1024), files: 100 }
        });
        await server.register(helmet, { global: true });

        // Rate limit middleware hook
        server.addHook('preHandler', async (req, reply) => {
            if (req.url === '/health' || req.url.startsWith('/health')) return;
            // rateLimitMiddleware is purely in-memory/fs, we assume it's safe.
            // If it uses Redis, it must duplicate check logic safely.
            await rateLimitMiddleware(req, reply);
        });

        // 4. BIND TO PORT FIRST (NON-NEGOTIABLE)
        // 🚨 CRITICAL: bind FIRST
        await server.listen({ port: PORT, host: '0.0.0.0' });
        console.log('[BOOT] HTTP server listening on', PORT);

        // 5. START BACKGROUND SERVICES (Async / Non-Blocking)
        // ⬇️ EVERYTHING below must be async & non-blocking
        initBackgroundServices(server).catch(err => {
            console.error('[BOOT] Background init failed', err);
        });

    } catch (err) {
        console.error('[Boot] FATAL ERROR', err);
        process.exit(1);
    }
};

start();
