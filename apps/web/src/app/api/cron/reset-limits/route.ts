import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * /api/cron/reset-limits
 * 
 * Secure cron job endpoint to reset daily AI request quotas.
 * Should be triggered daily via Vercel Cron or a similar scheduler.
 */
export async function GET(req: Request) {
    const authHeader = req.headers.get('authorization');

    // Simple secret token check to prevent abuse
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        console.log('[CRON] Starting daily AI usage reset...');

        const result = await db.user.updateMany({
            data: {
                ai_requests_today: 0
            }
        });

        console.log(`[CRON] Successfully reset limits for ${result.count} users.`);

        return NextResponse.json({
            success: true,
            resetCount: result.count,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('[CRON] Error resetting AI limits:', error);
        return NextResponse.json({
            success: false,
            error: 'Database reset failed'
        }, { status: 500 });
    }
}
