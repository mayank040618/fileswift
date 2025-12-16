import './config/env';
import Fastify, { FastifyInstance } from "fastify";

// STRICT: No other top-level imports that could block or side-effect
console.log('[Boot] Initializing Fastify...');

// Initialize Fastify
const server: FastifyInstance = Fastify({
    logger: true,
    connectionTimeout: 180000,
    bodyLimit: 10485760,
});

// 1. STRICT LIVENESS PROBE (Must be first, no deps, synchronous)
server.get('/health', (_req, reply) => {
    reply.code(200).send({ ok: true });
});

const start = async () => {
    try {
        // 2. LOAD PLUGINS & ROUTES
        // Fastify requires all plugins to be registered BEFORE listening.
        // We relied on the Lazy Queue fix to ensure these registers are instant.
        console.log('[Boot] Loading plugins & routes...');

        // Register Middleware
        const cors = (await import("@fastify/cors")).default;
        await server.register(cors, {
            origin: [
                'https://fileswift.in',
                'https://www.fileswift.in',
                'https://fileswift-app.vercel.app',
                'http://localhost:3000',
                'http://127.0.0.1:3000'
            ],
            methods: ['POST', 'GET', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Content-Length', 'X-Upload-Id', 'Content-Range'],
            credentials: true,
        });

        const multipart = (await import("@fastify/multipart")).default;
        const maxUploadSize = process.env.MAX_UPLOAD_FILESIZE
            ? parseInt(process.env.MAX_UPLOAD_FILESIZE)
            : (parseInt(process.env.MAX_UPLOAD_SIZE_MB || '50') * 1024 * 1024);

        await server.register(multipart, {
            limits: {
                fileSize: maxUploadSize,
                fieldNameSize: 100,
                fieldSize: 10 * 1024 * 1024,
                files: parseInt(process.env.MAX_UPLOAD_FILES || '100'),
                headerPairs: 2000
            }
        });

        const helmet = (await import('@fastify/helmet')).default;
        await server.register(helmet, {
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    scriptSrc: ["'self'", "'unsafe-inline'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    imgSrc: ["'self'", "data:", "blob:"],
                }
            },
            global: true
        });

        // Rate Limit
        const { rateLimitMiddleware } = await import('./middleware/rateLimit');
        server.addHook('preHandler', rateLimitMiddleware);

        // Routes
        const { healthRoutes } = await import('./routes/health');
        await server.register(healthRoutes);

        const { healthGsRoutes } = await import('./routes/health-gs');
        await server.register(healthGsRoutes);

        const { downloadRoutes } = await import('./routes/download');
        await server.register(downloadRoutes);

        const uploadRoutes = (await import('./routes/upload')).default;
        await server.register(uploadRoutes);

        const { default: uploadDirectRoutes } = await import('./routes/upload-direct');
        await server.register(uploadDirectRoutes);

        const chunkUploadRoutes = (await import("./routes/upload-chunk")).default;
        await server.register(chunkUploadRoutes);

        const toolRoutes = (await import('./routes/tools')).default;
        await server.register(toolRoutes);

        const waitlistRoutes = (await import('./routes/waitlist')).default;
        await server.register(waitlistRoutes);

        const feedbackRoutes = (await import('./routes/feedback')).default;
        await server.register(feedbackRoutes);

        // Schedules
        const { runCleanup } = await import('./services/cleanup');
        setInterval(runCleanup, 10 * 60 * 1000);

        console.log('[Boot] App Ready (All routes loaded)');

        // 4. LISTEN (Now that everything is registered)
        const port = process.env.PORT ? parseInt(process.env.PORT) : 8080;
        await server.listen({ port, host: '0.0.0.0' });
        console.log(`[Boot] Server listening on ${port}`);

        // 5. START WORKER
        import('./worker').then(({ startWorker }) => {
            console.log('[Boot] Starting worker process...');
            startWorker().catch(err => console.error('[Startup] Worker failed to start', err));
        }).catch(err => console.error('[Startup] Failed to load worker module', err));

    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

start();
