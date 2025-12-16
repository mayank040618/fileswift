// Standalone Worker Process
import { Worker } from 'bullmq';
import { config } from 'dotenv';
import path from 'path';
import { runCleanup } from './services/cleanup';

config();

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

export const startWorker = async () => {
    if (process.env.USE_MOCK_QUEUE === 'true') {
        console.log("Worker skipped (Mock Queue enabled)");
        return;
    }

    try {
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

        console.log(`[Worker] Started with Redis connection (Sandboxed, Concurrency: 5)`);

        // Graceful Shutdown
        const shutdown = async () => {
            console.log('[Worker] Closing...');
            await worker.close();
            process.exit(0);
        };
        process.on('SIGTERM', shutdown);
        process.on('SIGINT', shutdown);

    } catch (e) {
        console.warn("Failed to start worker (Redis likely missing or path error)", e);
    }
};

// Execute if running directly
if (require.main === module) {
    console.log("[Worker Process] Booting...");

    // Start Cleanup Service (Cron)
    setInterval(runCleanup, 10 * 60 * 1000);
    console.log("[Worker Process] Cleanup Service Scheduled");

    // Start Queue Worker
    startWorker().catch(err => {
        console.error("[Worker Process] Fatal Error", err);
        process.exit(1);
    });
}
