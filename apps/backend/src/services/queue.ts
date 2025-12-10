import { Queue } from 'bullmq';

const connection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
};

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

let fileQueue: any;
try {
    // Forced MockQueue for local development without Redis
    if (process.env.USE_MOCK_QUEUE === 'true') {
        fileQueue = new MockQueue();
    } else {
        fileQueue = new Queue('file-processing', { connection });
    }
} catch (e) {
    console.warn("Failed to connect to Redis, falling back to Mock Queue");
    fileQueue = new MockQueue();
}

export { fileQueue };

export const createJob = async (data: { toolId: string; inputFiles?: { filename: string; path: string }[]; key?: string | null; filename?: string; path?: string; data?: any }) => {
    return await fileQueue.add('process-file', data);
};

export const getJob = async (jobId: string) => {
    return await fileQueue.getJob(jobId);
};
