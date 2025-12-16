
import './config/env';
import Fastify from "fastify";

// STRICT FAIL-OPEN ARCHITECTURE
// 1. Initialize Server
const server = Fastify({
    logger: true,
    connectionTimeout: 180000,
    bodyLimit: 10485760,
});

// 2. LIVENESS PROBE (Synchronous, Zero Deps)
// This MUST be available immediately.
server.get('/health', (_req, reply) => {
    reply.send({ status: 'ok', timestamp: Date.now() });
});

const start = async () => {
    try {
        console.log('[Boot] Initializing...');

        // 3. REGISTER PLUGINS (Non-Blocking / Parallel)
        // We do NOT await these one-by-one to maximize boot speed.
        // Fastify will resolve them in parallel before opening the port.

        // precise import order is less important than speed here, 
        // validating that we are "Fail Open" means we listen ASAP.

        server.register(import("@fastify/cors"), {
            origin: [
                'https://fileswift.in',
                'https://www.fileswift.in',
                'https://fileswift-app.vercel.app',
                'http://localhost:3000',
            ],
            credentials: true,
        });

        server.register(import("@fastify/multipart"), {
            limits: {
                fileSize: (parseInt(process.env.MAX_UPLOAD_SIZE_MB || '50') * 1024 * 1024),
                files: 100
            }
        });

        server.register(import('@fastify/helmet'), { global: true });

        // Middleware
        import('./middleware/rateLimit').then(m => server.addHook('preHandler', m.rateLimitMiddleware));

        // Routes - Registering promises allows Fastify to boot while loading IO
        server.register(import('./routes/health').then(m => ({ default: m.healthRoutes })));
        server.register(import('./routes/health-gs').then(m => ({ default: m.healthGsRoutes })));
        server.register(import('./routes/download').then(m => ({ default: m.downloadRoutes })));
        server.register(import('./routes/upload')); // default export
        server.register(import('./routes/upload-chunk')); // default export
        server.register(import('./routes/upload-direct')); // default export
        server.register(import('./routes/tools')); // default export
        server.register(import('./routes/waitlist')); // default export
        server.register(import('./routes/feedback')); // default export

        // 4. LISTEN (The Barrier)
        // Fastify waits for the plugin graph to resolve, then opens the port.
        const port = Number(process.env.PORT || 8080);
        await server.listen({ port, host: '0.0.0.0' });

        console.log(`[Boot] Server listening on ${port} (Ready for Traffic)`);

        // 5. BACKGROUND SYSTEMS (Post-Listen)
        // These MUST start AFTER the server is taking traffic.

        // Cleanup Service
        import('./services/cleanup').then(({ runCleanup }) => {
            setInterval(runCleanup, 10 * 60 * 1000);
        });

        // Worker Service (Detached)
        import('./worker').then(({ startWorker }) => {
            console.log('[Boot] Starting Background Worker...');
            startWorker().catch(err => console.error('[Worker] Start failed', err));
        });

    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

start();
