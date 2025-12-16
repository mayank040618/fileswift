// Standalone Worker Logic (Lazy Loaded)
import path from 'path';
import { runCleanup } from './services/cleanup';

// NOTE: We do NOT import BullMQ or Redis here at the top level.
// This ensures that importing this file in index.ts is safe and instant.

export const startWorker = async () => {
    console.log("🔄 Starting background worker...");

    try {
        // 1. Lazy Import Dependencies
        const { Worker } = await import('bullmq');
        const { config } = await import('dotenv');
        config();

        // 2. Resolve Connection Config (Lazy)
        const getConnectionConfig = () => {
            if (process.env.REDIS_URL) {
                try {
                    const url = new URL(process.env.REDIS_URL);
                    return {
                        host: url.hostname,
                        port: parseInt(url.port || '6379'),
                        username: url.username,
                        password: url.password,
                        ...(url.protocol === 'rediss:' ? { tls: { rejectUnauthorized: false } } : {})
                    };
                } catch (e) {
                    console.error('Invalid REDIS_URL', e);
                }
            }
            return {
                host: process.env.REDIS_HOST || 'localhost',
                port: parseInt(process.env.REDIS_PORT || '6379'),
            };
        };
        const connection = getConnectionConfig();

        // 3. Skip if Mock (Optional)
        if (process.env.USE_MOCK_QUEUE === 'true') {
            console.log("Worker skipped (Mock Queue enabled)");
            return;
        }

        // 4. Initialize Worker
        const processorPath = path.join(__dirname, 'processors', 'sandboxed' + (path.extname(__filename) === '.ts' ? '.ts' : '.js'));

        const worker = new Worker('file-processing', processorPath, {
            connection,
            concurrency: 5,
            limiter: { max: 10, duration: 1000 },
            lockDuration: 30000,
        });

        worker.on('active', job => console.log(`[JOB ACTIVE] ${job.id} (Tool: ${job.data.toolId})`));
        worker.on('completed', job => console.log(`[JOB COMPLETED] ${job.id}`));
        worker.on('failed', (job, err) => console.error(`[JOB FAILED] ${job?.id} - Error: ${err.message}`));

        console.log("✅ Worker running (Redis Connected)");

        // 5. Start Cleanup Service (Background)
        setInterval(() => {
            runCleanup().catch(err => console.error('[Cleanup] Failed', err));
        }, 10 * 60 * 1000);

        // Initial cleanup run
        runCleanup().catch(() => { });

        // Graceful Shutdown
        const shutdown = async () => {
            console.log('[Worker] Closing...');
            await worker.close();
        };
        process.on('SIGTERM', shutdown);

    } catch (e) {
        console.error("❌ Worker failed to start", e);
        // Important: We do NOT exit specificially here, we let the main server keep running
    }
};
