import { executeJob } from '../services/jobProcessor';
import { Job } from 'bullmq';

// Default export is required for BullMQ sandboxed processor
export default async function (job: Job) {
    try {
        console.log(`[Worker] Starting job ${job.id} processing...`);
        return await executeJob(job as any);
    } catch (error: any) {
        console.error(`[Worker] CRITICAL FAILURE Job ${job.id}:`, error);
        // Throwing error ensures BullMQ marks it as failed with this specific message
        throw new Error(error.message || "Unknown Worker Error");
    }
}
