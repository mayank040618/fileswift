import type { Queue as QueueType } from 'bullmq';

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

// Simple in-memory mock for development without Redis
const mockJobStore = new Map<string, any>();

class MockQueue {
    async add(name: string, data: any) {
        const id = 'local-job-' + Date.now();
        const job = {
            id,
            data,
            timestamp: Date.now(),
            failedReason: undefined as string | undefined,
            finishedOn: undefined as number | undefined,
            returnvalue: null as any,
            isCompleted: () => Promise.resolve(!!job.returnvalue),
            isFailed: () => Promise.resolve(!!job.failedReason),
            isActive: () => Promise.resolve(false), // Instant finish in mock
        };
        mockJobStore.set(id, job);

        console.log(`[MockQueue] Added job ${name} (${id})`, data);

        // Simulate processing in background (but locally real)
        const processMockJob = async () => {
            console.log(`[MockQueue] Starting execution for ${id}...`);
            try {
                const { executeJob } = await import("./jobProcessor");
                const result = await executeJob(job as any);

                job.finishedOn = Date.now();
                job.returnvalue = result;
            } catch (e) {
                job.finishedOn = Date.now();
                // @ts-ignore
                job.failedReason = e.message;
            } finally {
                mockJobStore.set(id, job);
            }
        };

        // Fire and forget (async)
        processMockJob();

        return job;
    }

    async getJob(jobId: string) {
        return mockJobStore.get(jobId) || null;
    }
}

// Lazy Lazy Lazy
let fileQueueInstance: any = null;

const initializeQueue = async () => {
    if (fileQueueInstance) return fileQueueInstance;

    try {
        if (process.env.USE_MOCK_QUEUE === 'true') {
            console.log("[Queue] Using Mock Queue");
            fileQueueInstance = new MockQueue();
        } else {
            console.log("[Queue] Initializing BullMQ Connection...");
            const { Queue } = await import('bullmq');
            fileQueueInstance = new Queue('file-processing', {
                connection,
                defaultJobOptions: {
                    attempts: 3,
                    backoff: { type: 'exponential', delay: 1000 },
                    removeOnComplete: 100,
                    removeOnFail: 500
                }
            });
        }
    } catch (e) {
        console.warn("[Queue] Init failed, falling back to mock", e);
        fileQueueInstance = new MockQueue();
    }
    return fileQueueInstance;
};

// Export lazy getter
export const getFileQueue = async () => initializeQueue();

// Wrapper for job creation (this will trigger init if needed)
export const createJob = async (data: { toolId: string; inputFiles?: { filename: string; path: string }[]; key?: string | null; filename?: string; path?: string; data?: any }) => {
    const queue = await getFileQueue();
    return await queue.add('process-file', data);
};


export const getJob = async (jobId: string) => {
    const queue = await getFileQueue();
    return await queue.getJob(jobId);
};
