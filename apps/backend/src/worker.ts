// import './polyfills'; // Removed: Browser polyfills crash Node workers
import { Worker } from 'bullmq';
import { config } from 'dotenv';
import path from 'path';

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
        const processorPath = path.join(__dirname, 'processors', 'sandboxed' + (path.extname(__filename) === '.ts' ? '.ts' : '.js'));

        const worker = new Worker('file-processing', processorPath, {
            connection,
            concurrency: 5,
            limiter: {
                max: 10,
                duration: 1000
            },
            lockDuration: 30000, // 30s lock
        });

        worker.on('active', job => {
            console.log(`[JOB ACTIVE] ${job.id} (Tool: ${job.data.toolId})`);
        });

        worker.on('completed', job => {
            console.log(`[JOB COMPLETED] ${job.id}`);
        });

        worker.on('failed', (job, err) => {
            console.error(`[JOB FAILED] ${job?.id} - Error: ${err.message}`);
        });

        console.log(`Worker started with Redis connection (Sandboxed, Concurrency: 5)`);
    } catch (e) {
        console.warn("Failed to start worker (Redis likely missing or path error)", e);
    }
};

startWorker();
