import { spawnWithTimeout } from './spawnWithTimeout';

// Cache results for 30s to prevent spamming spawn
interface CacheEntry {
    result: string | null;
    timestamp: number;
}

const checkCache: Record<string, CacheEntry> = {};
const CACHE_TTL = 30000;

async function getCachedCheck(cliName: string, checkFn: () => Promise<string | null>): Promise<string | null> {
    const now = Date.now();
    const entry = checkCache[cliName];
    if (entry && (now - entry.timestamp < CACHE_TTL)) {
        return entry.result;
    }
    const result = await checkFn();
    checkCache[cliName] = { result, timestamp: now };
    return result;
}

export const findCli = async (cmd: string): Promise<boolean> => {
    return !!(await getCachedCheck(cmd, async () => {
        try {
            // 'which' is fast, but we use strict timeout
            const { stdout, code } = await spawnWithTimeout('which', [cmd], {}, 2000);
            return code === 0 && stdout.trim() ? 'yes' : null;
        } catch {
            return null;
        }
    }));
};

export const getGsVersion = async (): Promise<string | null> => {
    return getCachedCheck('gs', async () => {
        try {
            const { stdout } = await spawnWithTimeout('gs', ['--version'], {}, 2000);
            return stdout.trim() || null;
        } catch {
            return null;
        }
    });
};

export const getQpdfVersion = async (): Promise<string | null> => {
    return getCachedCheck('qpdf', async () => {
        try {
            const { stdout } = await spawnWithTimeout('qpdf', ['--version'], {}, 2000);
            // qpdf version output can be verbose, take first line
            return stdout.split('\n')[0].trim() || null;
        } catch {
            return null;
        }
    });
};
