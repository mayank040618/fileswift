import { FastifyReply, FastifyRequest } from "fastify";

// Simple in-memory rate limiter
const ipCounts: Record<string, { count: number, reset: number }> = {};
const LIMIT = 10000; // Increased for dev/testing
const WINDOW = 3600 * 1000;

export const rateLimitMiddleware = async (req: FastifyRequest, reply: FastifyReply) => {
    // Skip for pro users (mock check)
    const isPro = req.headers['x-user-tier'] === 'pro';
    if (isPro) return;

    const ip = req.ip;
    const now = Date.now();

    if (!ipCounts[ip] || now > ipCounts[ip].reset) {
        ipCounts[ip] = { count: 1, reset: now + WINDOW };
    } else {
        ipCounts[ip].count++;
        if (ipCounts[ip].count > LIMIT) {
            console.log(`[RateLimit] IP ${ip} exceeded limit (${ipCounts[ip].count}). Blocking.`);
            reply.code(429).send({ error: "Rate limit exceeded. Upgrade to Pro for unlimited access." });
            return;
        }
    }
};
