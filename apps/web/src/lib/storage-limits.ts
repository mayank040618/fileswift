import { db } from '@/lib/db';
import { currentUser } from '@clerk/nextjs/server';

export const STORAGE_LIMITS = {
    FREE: 100 * 1024 * 1024,      // 100 MB
    STUDENT: 1.5 * 1024 * 1024 * 1024, // 1.5 GB
    PRO_ACTIVE: 5 * 1024 * 1024 * 1024,   // 5.0 GB
} as const;

export type PlanType = keyof typeof STORAGE_LIMITS;

export async function checkStorageLimit(additionalBytes: number = 0) {
    const user = await currentUser();
    if (!user) {
        return { allowed: false, error: 'Unauthorized', status: 401 };
    }

    const dbUser = await db.user.findUnique({
        where: { id: user.id },
        include: {
            documents: true
        }
    });

    if (!dbUser) {
        return { allowed: false, error: 'User not found', status: 404 };
    }

    const currentUsage = dbUser.documents.reduce((acc, doc) => acc + doc.size, 0);
    const limit = STORAGE_LIMITS[dbUser.plan_type as PlanType] || STORAGE_LIMITS.FREE;

    if (currentUsage + additionalBytes > limit) {
        return { 
            allowed: false, 
            error: `Storage limit reached (${(limit / (1024 * 1024)).toFixed(0)}MB). Delete files to free up space.`, 
            status: 429 
        };
    }

    return { 
        allowed: true, 
        userId: dbUser.id, 
        currentUsage, 
        limit 
    };
}
