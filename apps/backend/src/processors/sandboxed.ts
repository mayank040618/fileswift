import { executeJob } from '../services/jobProcessor';
import { Job } from 'bullmq';

// Default export is required for BullMQ sandboxed processor
export default async function (job: Job) {
    return await executeJob(job as any);
}
