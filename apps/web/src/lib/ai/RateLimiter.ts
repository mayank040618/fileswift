/**
 * Per-user rate limiting and concurrency control.
 *
 * Daily limits are stored in the database (PostgreSQL via Prisma).
 * Concurrent execution limits are kept in-memory per-instance (to prevent browser-side spam).
 */

import { AIError } from './errors';
import type { PlanLimits } from './types';
import { db } from '@/lib/db';

// In-memory bucket for concurrency ONLY
const concurrencyBuckets = new Map<string, number>();

// Lifetime Admin Accounts
export const ADMIN_EMAILS = [
    'mayankrajjha07@gmail.com',
    'mehandibhaskar26@gmail.com'
];

/**
 * Check if the user is allowed to make a new AI request.
 * Throws AIError if rate limited or concurrency exceeded.
 */
export async function acquireSlot(userId: string, limits: PlanLimits): Promise<void> {
    // 1. Fetch User (Database)
    // We fetch current usage and the last request date to handle auto-reset fallback
    const user = await db.user.findUnique({
        where: { id: userId },
        select: {
            ai_requests_today: true,
            last_request_date: true,
            plan_type: true,
            email: true
        }
    });

    if (!user) {
        throw new AIError('AI_INVALID_USER', 'User account not found.');
    }

    const activeRequests = concurrencyBuckets.get(userId) || 0;

    // Bypass for Admins (Both concurrency and daily)
    if (ADMIN_EMAILS.includes(user.email)) {
        concurrencyBuckets.set(userId, activeRequests + 1);
        return;
    }

    // 2. Check concurrent limit (In-memory)
    if (activeRequests >= limits.maxConcurrent) {
        throw new AIError('AI_CONCURRENCY_LIMIT');
    }

    const now = new Date();
    const lastRequestDate = user.last_request_date ? new Date(user.last_request_date) : null;

    // Simple date comparison for fallback reset (if cron fails)
    const isToday = lastRequestDate &&
        lastRequestDate.getUTCFullYear() === now.getUTCFullYear() &&
        lastRequestDate.getUTCMonth() === now.getUTCMonth() &&
        lastRequestDate.getUTCDate() === now.getUTCDate();

    const currentUsage = isToday ? user.ai_requests_today : 0;

    if (limits.dailyRequestLimit !== -1 && currentUsage >= limits.dailyRequestLimit) {
        throw new AIError(
            'AI_RATE_LIMITED',
            `Daily limit reached (${limits.dailyRequestLimit} requests). Upgrade your plan for more.`
        );
    }

    // 3. Increment usage and reserve slot
    // We use a transaction or parallel updates to ensure accuracy
    await db.user.update({
        where: { id: userId },
        data: {
            ai_requests_today: currentUsage + 1,
            last_request_date: now
        }
    });

    concurrencyBuckets.set(userId, activeRequests + 1);
}

/**
 * Release a concurrency slot after a request completes (success or failure).
 * Must always be called in a finally block.
 */
export function releaseSlot(userId: string): void {
    const activeRequests = concurrencyBuckets.get(userId) || 0;
    if (activeRequests > 0) {
        concurrencyBuckets.set(userId, activeRequests - 1);
    }
}

/** Get remaining daily requests (for metadata) */
export async function getRemainingRequests(userId: string, limits: PlanLimits): Promise<number> {
    if (limits.dailyRequestLimit === -1) return -1;

    const user = await db.user.findUnique({
        where: { id: userId },
        select: { ai_requests_today: true, last_request_date: true, email: true }
    });

    if (!user) return 0;

    // Bypass for Admins
    if (ADMIN_EMAILS.includes(user.email)) return -1;

    const now = new Date();
    const lastRequestDate = user.last_request_date ? new Date(user.last_request_date) : null;
    const isToday = lastRequestDate &&
        lastRequestDate.getUTCFullYear() === now.getUTCFullYear() &&
        lastRequestDate.getUTCMonth() === now.getUTCMonth() &&
        lastRequestDate.getUTCDate() === now.getUTCDate();

    const currentUsage = isToday ? user.ai_requests_today : 0;
    return Math.max(0, limits.dailyRequestLimit - currentUsage);
}

