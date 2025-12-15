import './polyfills/dom'; // MUST BE FIRST
import './config/env';
import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import helmet from '@fastify/helmet';

import { healthRoutes } from './routes/health';
import { downloadRoutes } from './routes/download';
import uploadRoutes from './routes/upload';
import chunkUploadRoutes from "./routes/upload-chunk";
import toolRoutes from './routes/tools';
import waitlistRoutes from './routes/waitlist';
import './worker'; // Start Worker

// Initialize Fastify
const server: FastifyInstance = Fastify({
    logger: true,
    connectionTimeout: 180000, // 3 minutes for mobile network resilience
    bodyLimit: 10485760, // 10 MB default for JSON, multipart overrides this
});

const start = async () => {
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

        // Rate Limit Middleware
        const { rateLimitMiddleware } = await import('./middleware/rateLimit');
        server.addHook('preHandler', rateLimitMiddleware);

        // Register Routes
        await server.register(healthRoutes);
        const { healthGsRoutes } = await import('./routes/health-gs');
        await server.register(healthGsRoutes);
        await server.register(downloadRoutes);
        await server.register(uploadRoutes);
        await server.register(chunkUploadRoutes);
        await server.register(toolRoutes);
        await server.register(waitlistRoutes);
        const { default: feedbackRoutes } = await import('./routes/feedback');
        await server.register(feedbackRoutes);

        // Cleanup Schedule (every 10 minutes)
        const { runCleanup } = await import('./services/cleanup');
        setInterval(runCleanup, 10 * 60 * 1000);

        // Start
        const port = process.env.PORT ? parseInt(process.env.PORT) : 8080;
        await server.listen({ port, host: '0.0.0.0' });
        console.log(`Server listening on ${port}`);
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

start();
