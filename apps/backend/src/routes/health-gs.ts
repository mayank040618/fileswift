import { FastifyInstance } from "fastify";


export async function healthGsRoutes(fastify: FastifyInstance) {
    fastify.get("/api/health/gs", async (req, reply) => {
        const status = {
            ghostscript: false,
            qpdf: false,
            sips: false,
            gsVersion: null as string | null,
            qpdfVersion: null as string | null,
            error: null as string | null
        };

        try {
            const { checkTools } = await import('../utils/cli-checks');
            // Force check if 'refresh' query param present (optional but good for debugging)
            const force = (req.query as any)?.refresh === 'true';

            const toolStatus = await checkTools(force);

            status.ghostscript = toolStatus.ghostscript;
            status.qpdf = toolStatus.qpdf;
            (status as any).libreoffice = toolStatus.libreoffice;
            status.sips = toolStatus.sips;
            status.gsVersion = toolStatus.gsVersion;
            status.qpdfVersion = toolStatus.qpdfVersion;
            (status as any).libreofficeVersion = toolStatus.libreofficeVersion;
            // Readiness: True if at least one engine is available
            (status as any).compressionReady = status.ghostscript || status.qpdf;

            return status;
        } catch (e: any) {
            status.error = e.message;
            return reply.code(500).send(status);
        }
    });

    fastify.get("/api/health/pdf-compress", async (_req, reply) => {
        return reply.redirect('/api/health/gs');
    });
}
