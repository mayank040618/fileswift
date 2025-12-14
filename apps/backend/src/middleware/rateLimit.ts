import { FastifyRequest, FastifyReply } from 'fastify';
import Redis from 'ioredis';

// Rate limit configuration
const WINDOW_SIZE_IN_SECONDS = 60;
const MAX_REQUESTS_PER_WINDOW = 60; // 60 requests per minute per IP
const REDIS_KEY_PREFIX = 'rate-limit:';

let redis: Redis | null = null;

// Initialize Redis connection
const getRedisClient = () => {
    if (!redis) {
        const connection = process.env.REDIS_URL ||
            `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`;

        console.log(`[RateLimit] Connecting to Redis at ${connection.split('@')[1] || 'localhost'}...`);

        redis = new Redis(connection, {
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
            maxRetriesPerRequest: 1
        });

        redis.on('error', (err) => {
            console.error('[RateLimit] Redis error:', err.message);
        });
    }
    return redis;
};

export async function rateLimitMiddleware(req: FastifyRequest, reply: FastifyReply) {
    // Skip rate limiting for health checks and static assets if any
    if (req.url.startsWith('/api/health') || req.method === 'OPTIONS') {
        return;
    }

    // Allow Load Testing Bypass
    if (process.env.LOAD_TEST_KEY && req.headers['x-load-test'] === process.env.LOAD_TEST_KEY) {
        return;
    }

    try {
        const client = getRedisClient();
        if (client.status !== 'ready') {
            // Fail open if Redis is down, but log it
            req.log.warn('[RateLimit] Redis not ready, skipping rate limit check');
            return;
        }

        const ip = req.headers['x-forwarded-for'] || req.ip || 'unknown';
        const key = `${REDIS_KEY_PREFIX}${ip}`;

        // Atomic increment and expire
        const commands = client.multi()
            .incr(key)
            .ttl(key);

        const results = await commands.exec();

        if (!results) {
            throw new Error('Redis transaction failed');
        }

        const [incrErr, currentCount] = results[0];
        const [, ttl] = results[1];

        if (incrErr) throw incrErr;

        // If key is new (no TTL), set expiration
        if (ttl === -1) {
            await client.expire(key, WINDOW_SIZE_IN_SECONDS);
        }

        const count = currentCount as number;

        reply.header('X-RateLimit-Limit', MAX_REQUESTS_PER_WINDOW);
        reply.header('X-RateLimit-Remaining', Math.max(0, MAX_REQUESTS_PER_WINDOW - count));

        if (count > MAX_REQUESTS_PER_WINDOW) {
            req.log.warn({ ip, count }, 'Rate limit exceeded');
            reply.code(429).send({
                error: 'Too Many Requests',
                message: 'You have exceeded the request limit. Please try again later.',
                retryAfter: WINDOW_SIZE_IN_SECONDS
            });
            // Stop processing
            return reply;
        }

    } catch (error) {
        req.log.error({ err: error }, 'Rate limit middleware error');
        // Fail open to avoid blocking legitimate traffic during Redis issues
    }
}
