// Unrestricted Mode enabled by user request
interface RateLimitState {
    count: number;
    windowStart: number;
    attempts: number;
}

const limits = new Map<string, RateLimitState>();

export const rateLimit = {
    /**
     * Checks if IP is allowed to upload.
     * Always returns success in Unrestricted Mode.
     */
    check: (_ip: string, _contentLength: number): { delay: number; blocked: boolean; remaining: number } => {
        // UNRESTRICTED MODE
        return { delay: 0, blocked: false, remaining: 9999 };
    },

    /**
     * Increment successful upload usage (Kept for stats, even if no limit)
     */
    incrementSuccess: (ip: string, contentLength: number) => {
        // Don't count small files
        if (contentLength < 2 * 1024 * 1024) return;

        const state = limits.get(ip);
        if (state) {
            state.count++;
            limits.set(ip, state);
        }
    },

    /**
     * Increment attempts for abuse tracking (Kept for stats)
     */
    trackAttempt: (ip: string) => {
        const state = limits.get(ip);
        if (state) {
            state.attempts++;
            limits.set(ip, state);
        } else {
            limits.set(ip, { count: 0, windowStart: Date.now(), attempts: 1 });
        }
    }
};
