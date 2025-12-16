
import { startWorker } from './worker';
import { connectRedisWithRetry } from './services/redis-retry';
import { FastifyInstance } from 'fastify';

// Route Imports removed to ensure Lazy Loading
// This prevents one bad dependency from crashing the entire boot sequence before Health Check

export async function registerAppRoutes(server: FastifyInstance) {
    console.log('[BOOT] Registering Routes (Async/Dynamic)...');

    try {
        // Register Routes (These are fast and MUST be before listen)

        // Health Routes (Priority)
        const { healthRoutes } = await import('./routes/health');
        await server.register(healthRoutes);

        const { healthGsRoutes } = await import('./routes/health-gs');
        await server.register(healthGsRoutes);

        const { downloadRoutes } = await import('./routes/download');
        await server.register(downloadRoutes);

        // Upload Routes (Heavy dependencies like Queue/BullMQ load here)
        const { default: uploadRoutes } = await import('./routes/upload');
        await server.register(uploadRoutes);

        const { default: uploadDirectRoutes } = await import('./routes/upload-direct');
        await server.register(uploadDirectRoutes);

        const { default: chunkUploadRoutes } = await import("./routes/upload-chunk");
        await server.register(chunkUploadRoutes);

        const { default: toolRoutes } = await import('./routes/tools');
        await server.register(toolRoutes);

        const { default: waitlistRoutes } = await import('./routes/waitlist');
        await server.register(waitlistRoutes);

        const { default: feedbackRoutes } = await import('./routes/feedback');
        await server.register(feedbackRoutes);

        console.log('[BOOT] Routes Registered Successfully.');
    } catch (e) {
        console.error('[BOOT] CRITICAL: Failed to register routes', e);
        // We do NOT rethrow here if we want to keep /health alive,
        // BUT if routes fail, the app is useless.
        // However, keeping it alive allows us to see logs in Railway!
        // So we log error and proceed.
    }
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
