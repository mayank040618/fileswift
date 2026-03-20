/**
 * /api/ai/execute — Main AI execution endpoint.
 *
 * ALL AI logic is delegated to the AIOrchestrator.
 * This route only handles HTTP parsing and response formatting.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { executeAI } from '@/lib/ai/AIOrchestrator';
import { AIError } from '@/lib/ai/errors';
import { db } from '@/lib/db';
import type { AIMode, UserPlan, FileInput } from '@/lib/ai/types';

export async function POST(request: NextRequest) {
    try {
        const { userId: clerkUserId } = auth();

        if (!clerkUserId) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            prompt,
            files,
            mode = 'standard',
        } = body as {
            prompt?: string;
            files?: FileInput[];
            mode?: AIMode;
        };

        // Fetch user plan directly from DB (secure, cannot be spoofed by frontend)
        const user = await db.user.findUnique({
            where: { id: clerkUserId },
            select: { plan_type: true }
        });

        if (!user) {
            return NextResponse.json({ success: false, error: 'User not found in database' }, { status: 404 });
        }

        const plan = user.plan_type.toLowerCase() as UserPlan;

        // Delegate EVERYTHING to the orchestrator
        const result = await executeAI({
            userId: clerkUserId,
            plan,
            mode,
            prompt: prompt || '',
            files,
        });


        return NextResponse.json({
            success: true,
            output: result.output,
            metadata: result.metadata,
        });
    } catch (err) {
        // Structured error handling — never leak internals
        if (err instanceof AIError) {
            return NextResponse.json(
                { success: false, error: err.toJSON() },
                { status: err.statusCode }
            );
        }

        console.error('[API /ai/execute] Unexpected error:', err);
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'AI_PROVIDER_ERROR',
                    message: 'An unexpected error occurred. Please try again.',
                    retryable: true,
                },
            },
            { status: 500 }
        );
    }
}
