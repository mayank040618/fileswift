import './config/env';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';

const server = Fastify({
    logger: true
});

import { healthRoutes } from './routes/health';
import { downloadRoutes } from './routes/download';

import uploadRoutes from './routes/upload';
import toolRoutes from './routes/tools';
import waitlistRoutes from './routes/waitlist';

const start = async () => {
    try {
        // Plugins
        await server.register(cors, {
            origin: '*',
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            credentials: true
        });
        const maxUploadSize = process.env.MAX_UPLOAD_FILESIZE
            ? parseInt(process.env.MAX_UPLOAD_FILESIZE)
            : (parseInt(process.env.MAX_UPLOAD_SIZE_MB || '100') * 1024 * 1024);

        await server.register(multipart, {
            limits: {
                fileSize: maxUploadSize,
                files: parseInt(process.env.MAX_UPLOAD_FILES || '100')
            }
        });

        // Middleware
        const { rateLimitMiddleware } = await import('./middleware/rateLimit');
        server.addHook('preHandler', rateLimitMiddleware);

        // Register Routes
        await server.register(healthRoutes);
        const { healthGsRoutes } = await import('./routes/health-gs');
        await server.register(healthGsRoutes);
        await server.register(downloadRoutes);
        await server.register(uploadRoutes);
        // await server.register(aiRoutes); // AI Disabled
        await server.register(toolRoutes);
        await server.register(waitlistRoutes);

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
