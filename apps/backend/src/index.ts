import './config/env';
console.log('Starting Backend Server...'); // Force log 1

import Fastify, { FastifyInstance } from "fastify";
console.log('Imported Fastify'); // Force log 2

import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import helmet from '@fastify/helmet';

console.log('Imported Core Plugins');

import { healthRoutes } from './routes/health';
import { downloadRoutes } from './routes/download';
import uploadRoutes from './routes/upload';
import chunkUploadRoutes from "./routes/upload-chunk";
import toolRoutes from './routes/tools';
import waitlistRoutes from './routes/waitlist';
console.log('Imported Route Modules');

// import './worker'; // REMOVED: Managed manually after server start

// Initialize Fastify
const server: FastifyInstance = Fastify({
    logger: true,
    connectionTimeout: 180000, // 3 minutes for mobile network resilience
    bodyLimit: 10485760, // 10 MB default for JSON, multipart overrides this
});

// 1. STRICT LIVENESS PROBE (Must be first, no deps, synchronous)
server.get('/health', (_req, reply) => {
    reply.code(200).send({ ok: true });
});
console.log('Mounted /health');

const start = async () => {
    try {
        try {
            // Register Middleware
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
            console.log('Registered CORS');

            const maxUploadSize = process.env.MAX_UPLOAD_FILESIZE
                ? parseInt(process.env.MAX_UPLOAD_FILESIZE)
                : (parseInt(process.env.MAX_UPLOAD_SIZE_MB || '50') * 1024 * 1024); // Default 50MB

            await server.register(multipart, {
                limits: {
                    fileSize: maxUploadSize,
                    fieldNameSize: 100,
                    fieldSize: 10 * 1024 * 1024,
                    files: parseInt(process.env.MAX_UPLOAD_FILES || '100'),
                    headerPairs: 2000
                }
            });
            console.log('Registered Multipart');

            // Security Headers
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
            console.log('Registered Helmet');

            // Rate Limit Middleware
            const { rateLimitMiddleware } = await import('./middleware/rateLimit');
            server.addHook('preHandler', rateLimitMiddleware);
            console.log('Registered Rate Limit');

            // Register Routes
            await server.register(healthRoutes);
            console.log('Registered Health Routes');
            const { healthGsRoutes } = await import('./routes/health-gs');
            await server.register(healthGsRoutes);
            console.log('Registered Health GS Routes');
            await server.register(downloadRoutes);
            await server.register(uploadRoutes);
            console.log('Registered Upload Routes');
            const { default: uploadDirectRoutes } = await import('./routes/upload-direct');
            await server.register(uploadDirectRoutes);
            await server.register(chunkUploadRoutes);
            await server.register(toolRoutes);
            await server.register(waitlistRoutes);
            const { default: feedbackRoutes } = await import('./routes/feedback');
            await server.register(feedbackRoutes);
            console.log('Registered All Routes');

            // Cleanup Schedule (every 10 minutes)
            const { runCleanup } = await import('./services/cleanup');
            setInterval(runCleanup, 10 * 60 * 1000);

            // Start
            const port = process.env.PORT ? parseInt(process.env.PORT) : 8080;
            await server.listen({ port, host: '0.0.0.0' });
            console.log(`Server listening on ${port}`);

            // Start Worker Separately (Non-blocking)
            import('./worker').then(({ startWorker }) => {
                console.log('[Startup] Starting worker process...');
                startWorker().catch(err => {
                    console.error('[Startup] Worker failed to start', err);
                    // Do NOT exit process, API must remain live
                });
            }).catch(err => {
                console.error('[Startup] Failed to load worker module', err);
            });
        } catch (err) {
            server.log.error(err);
            process.exit(1);
        }
    };

    start();
