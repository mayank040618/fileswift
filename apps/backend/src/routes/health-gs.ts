
import { FastifyInstance } from 'fastify';
import { getGsVersion, getQpdfVersion, findCli } from '../utils/cli-checks';

export async function healthGsRoutes(fastify: FastifyInstance) {
    fastify.get('/api/health/gs', async (request, reply) => {
        const { jobId } = request.query as { jobId?: string };

        // Debug: Inspect Queue State
        if (jobId) {
            const { fileQueue } = await import('../services/queue');
            if ((fileQueue as any).getJob) {
                const job = await (fileQueue as any).getJob(jobId);
                if (job) {
                    return {
                        jobId,
                        status: await job.isCompleted() ? 'completed' : (await job.isFailed() ? 'failed' : 'active'),
                        returnvalue: job.returnvalue,
                        failedReason: job.failedReason,
                        data: job.data,
                        timestamp: job.timestamp,
                        finishedOn: job.finishedOn
                    };
                }
                return { error: 'Job not found in queue' };
            }
        }

        const [gsVersion, qpdfVersion, sipsAvailable] = await Promise.all([
            getGsVersion(),
            getQpdfVersion(),
            findCli('sips')
        ]);

        if (!gsVersion && !qpdfVersion && !sipsAvailable) {
            // User requested clear 503 if unavailable (though strictly for GS, but we check both)
            // But if just GS missing, we might still have qpdf.
            // Requirement: "If no CLI available, return ... 503"
            // We'll interpret this as "If GS is missing" primarily, or maybe if BOTH.
            // But strict requirement text: "If no CLI available, return ... 503 ... Ghostscript not installed"
            // This implies GS is the primary concern.

            if (!gsVersion) {
                return reply.status(503).send({
                    error: 'compression_unavailable',
                    message: 'Ghostscript not installed. Install with `brew install ghostscript` or enable server-side compression.',
                    details: { qpdf: qpdfVersion || 'missing' }
                });
            }
        }

        const statusStr = gsVersion || sipsAvailable ? 'ok' : 'missing_tools';

        return {
            status: statusStr,
            ghostscript: gsVersion || 'missing',
            qpdf: qpdfVersion || 'missing',
            sips: sipsAvailable ? 'available' : 'missing'
        };
    });
}
