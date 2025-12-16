
import { startWorker } from './worker';
import { connectRedisWithRetry } from './services/redis-retry';
import { FastifyInstance } from 'fastify';

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

export async function registerAppRoutes(server: FastifyInstance) {
    console.log('[BOOT] Registering Routes...');
    // Register Routes (These are fast and MUST be before listen)
    await server.register(healthRoutes);
    await server.register(healthGsRoutes);
    await server.register(downloadRoutes);
    await server.register(uploadRoutes);
    await server.register(uploadDirectRoutes);
    await server.register(chunkUploadRoutes);
    await server.register(toolRoutes);
    await server.register(waitlistRoutes);
    await server.register(feedbackRoutes);
    console.log('[BOOT] Routes Registered.');
}

export async function startBackgroundServices() {
    console.log('[BOOT] Initializing background infra...');

    // 2. Heavy IO Services
    console.log('[BOOT] Connecting to Infra...');
    // connectRedisWithRetry handles its own non-throw loop
    // We await it if we want to ensure Redis is up before Worker starts
    // But since this is post-listen, it's fine.
    await connectRedisWithRetry();

    // 3. Worker
    console.log('[BOOT] Starting Worker...');
    startWorker().catch(err => console.error('[WORKER] Failed to start', err));

    console.log('[BOOT] Background services ready');
}
