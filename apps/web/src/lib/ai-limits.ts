import { db } from '@/lib/db';
import { currentUser } from '@clerk/nextjs/server';

export const AI_LIMITS = {
    FREE: 5,
    STUDENT: 50,
    PRO_ACTIVE: 500,
} as const;

export type PlanType = keyof typeof AI_LIMITS;

export async function checkAILimit() {
    const user = await currentUser();
    if (!user) {
        return { allowed: false, error: 'Unauthorized', status: 401 };
    }

    const dbUser = await db.user.findUnique({
        where: { id: user.id }
    });

    if (!dbUser) {
        // Should be created by layout, but fallback just in case
        return { allowed: false, error: 'User not found in database', status: 404 };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastRequest = dbUser.last_request_date ? new Date(dbUser.last_request_date).setHours(0, 0, 0, 0) : null;
    
    let requestsToday = dbUser.ai_requests_today;
    
    // Reset if it's a new day
    if (lastRequest !== today.getTime()) {
        requestsToday = 0;
    }

    const limit = AI_LIMITS[dbUser.plan_type as PlanType] || AI_LIMITS.FREE;

    if (requestsToday >= limit) {
        return { 
            allowed: false, 
            error: 'Daily AI limit reached. Upgrade your plan for more requests.', 
            status: 429 
        };
    }

    return { 
        allowed: true, 
        userId: dbUser.id, 
        requestsToday, 
        plan: dbUser.plan_type.toLowerCase() as any 
    };
}

export async function incrementAIUsage(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dbUser = await db.user.findUnique({ where: { id: userId } });
    if (!dbUser) return;

    const lastRequest = dbUser.last_request_date ? new Date(dbUser.last_request_date).setHours(0, 0, 0, 0) : null;

    if (lastRequest !== today.getTime()) {
        await db.user.update({
            where: { id: userId },
            data: {
                ai_requests_today: 1,
                last_request_date: new Date(),
            }
        });
    } else {
        await db.user.update({
            where: { id: userId },
            data: {
                ai_requests_today: { increment: 1 },
                last_request_date: new Date(),
            }
        });
    }
}
