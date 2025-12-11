import './polyfills';
import { Worker } from 'bullmq';
import { config } from 'dotenv';

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


const startWorker = async () => {
    // If mock queue is enabled in env, we might want to skip starting the real Redis worker
    // to avoid connection errors if Redis isn't running.
    // However, if the user WANTS to run with Redis but has MOCK_QUEUE set for some reason, 
    // we should respect that constraint.
    // Given the previous context, we want to allow Local Dev without Redis to work via the API/MockQueue path.
    // So this worker process is actually optional or supplementary for Redis mode.

    if (process.env.USE_MOCK_QUEUE === 'true') {
        console.log("Worker skipped (Mock Queue enabled)");
        return;
    }

    try {
        const worker = new Worker('file-processing', async job => {
            console.log(`Processing job ${job.id} for tool ${job.data.toolId}`);
            try {
                // Use shared processor logic
                // Dynamic import not strictly necessary if we are in async function but fine
                const { executeJob } = await import('./services/jobProcessor');
                return await executeJob(job as any);
            } catch (e) {
                console.error("Job Execution Failed", e);
                throw e;
            }
        }, { connection });

        worker.on('completed', job => {
            console.log(`Job ${job.id} completed`);
        });

        worker.on('failed', (job, err) => {
            console.error(`Job ${job?.id} failed: ${err.message}`);
        });

        console.log("Worker started with Redis connection");
    } catch (e) {
        console.warn("Failed to start worker (Redis likely missing)");
    }
};

startWorker();
