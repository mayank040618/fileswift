
import Redis from 'ioredis';

// Singleton Redis Client
let redisClient: Redis | null = null;

export const getRedisClient = () => {
    return redisClient;
};

export async function connectRedisWithRetry() {
    console.log('[REDIS] Initializing connection logic...');

    // Config
    const url = process.env.REDIS_URL;
    const host = process.env.REDIS_HOST || 'localhost';
    const port = parseInt(process.env.REDIS_PORT || '6379');

    // IORedis automatically retries, but we want to be explicit about "Waiting for Ready"
    // Also we want to ensure we don't crash on initial connect failure if lazy.
    // However, for this "Retry Loop" pattern, we can use IORedis's built-in retry strategy 
    // BUT we want to log attempts as requested.

    const createConfig = () => {
        if (url) return url;
        return {
            host,
            port,
            retryStrategy: (times: number) => {
                const delay = Math.min(times * 100, 3000);
                console.log(`[REDIS] Reconnecting in ${delay}ms...`);
                return delay;
            },
            maxRetriesPerRequest: null // Required for BullMQ usage if shared
        };
    };

    redisClient = new Redis(createConfig() as any, {
        lazyConnect: true // Important: Don't connect immediately in constructor
    });

    redisClient.on('error', (err) => {
        console.error('[REDIS] Client Error', err);
    });

    redisClient.on('connect', () => {
        console.log('[REDIS] Connected');
    });

    redisClient.on('ready', () => {
        console.log('[REDIS] Connection Ready');
    });

    let attempt = 0;
    while (true) {
        try {
            attempt++;
            if (redisClient.status !== 'ready' && redisClient.status !== 'connecting' && redisClient.status !== 'connect') {
                await redisClient.connect();
            }
            // Wait for ready state? 
            // IORedis connect() resolves when connected.

            console.log('[REDIS] Connection Init Complete');
            return;
        } catch (err) {
            console.error(`[REDIS] Failed to connect (Attempt ${attempt})`, err);
            // Non-blocking wait
            await new Promise(r => setTimeout(r, 2000));
        }
    }
}
