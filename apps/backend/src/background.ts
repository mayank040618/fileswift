
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

export async function initBackgroundServices(server: FastifyInstance) {
    console.log('[BOOT] Initializing background services...');

    // 1. Redis (Critical for Queue, but non-blocking for partial functionality)
    // We start the connection loop, but we don't necessarily await it strictly if we want routes to work partly? 
    // BUT the user said "Redis exists but must NEVER block HTTP startup".
    // And "Redis can be down and app still boots".
    // So we await the connection loop? The user's template awaits `connectRedisWithRetry()`.
    // Since `connectRedisWithRetry` loops forever until success, awaiting it means we block *other background services* (like Worker) until Redis is up.
    // That is fine, as long as `listen()` has already happened.

    // We probably want to register routes *first* so API is usable (returning errors) instead of 404s.
    // Wait, if I register routes *after* listen, they are live immediately.

    console.log('[BOOT] Registering Routes...');
    // Register Routes (These are fast)
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

    // 2. Heavy IO Services
    console.log('[BOOT] Connecting to Infra...');
    await connectRedisWithRetry();

    // 3. Worker
    console.log('[BOOT] Starting Worker...');
    startWorker().catch(err => console.error('[WORKER] Failed to start', err));

    console.log('[BOOT] Background services ready');
}
