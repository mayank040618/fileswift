
interface RateLimitState {
    count: number;
    windowStart: number;
    attempts: number; // For abuse detection
}

const limits = new Map<string, RateLimitState>();
const WINDOW_MS = 60 * 60 * 1000; // 1 Hour

export const rateLimit = {
    /**
     * Checks if IP is allowed to upload.
     * @returns number of milliseconds to wait (0 = allowed, >0 = throttle, -1 = block)
     */
    check: (ip: string, contentLength: number): { delay: number; blocked: boolean; remaining: number } => {
        // Size Exemption: Files < 2MB are free
        if (contentLength < 2 * 1024 * 1024) {
            return { delay: 0, blocked: false, remaining: 25 };
        }

        const now = Date.now();
        let state = limits.get(ip);

        if (!state) {
            state = { count: 0, windowStart: now, attempts: 0 };
            limits.set(ip, state);
        }

        // Reset Window if needed
        if (now - state.windowStart > WINDOW_MS) {
            state.count = 0;
            state.attempts = 0;
            state.windowStart = now;
            limits.set(ip, state);
        }

        // Abuse Check (Attempts > 60/hr)
        if (state.attempts > 60) {
            return { delay: 30000, blocked: false, remaining: 0 }; // Silent delay 30s
        }

        // Count limits (Successful uploads only, but we check current count)
        // Soft Limit: 25
        // Hard Limit: 35

        if (state.count >= 35) {
            const minutesRemaining = Math.ceil((WINDOW_MS - (now - state.windowStart)) / 60000);
            return { delay: -1, blocked: true, remaining: minutesRemaining };
        }

        if (state.count >= 25) {
            // Throttling: 10s delay
            return { delay: 10000, blocked: false, remaining: 0 };
        }

        return { delay: 0, blocked: false, remaining: 25 - state.count };
    },

    /**
     * Increment successful upload usage
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
     * Increment attempts for abuse tracking
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
