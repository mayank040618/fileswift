import { NextResponse } from 'next/server';
import { checkAILimit, incrementAIUsage } from '@/lib/ai-limits';
import { executeAI } from '@/lib/ai/AIOrchestrator';

export async function POST(request: Request) {
    try {
        const limitCheck = await checkAILimit();
        if (!limitCheck.allowed) {
            return NextResponse.json({ error: limitCheck.error }, { status: limitCheck.status });
        }

        const body = await request.json();
        const { message, files, mode = 'standard' } = body;

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        // Execute AI via orchestrator
        const aiResponse = await executeAI({
            userId: limitCheck.userId!,
            plan: limitCheck.plan as any,
            mode: mode as any,
            prompt: message,
            files: files || [],
        });

        if (!aiResponse.success) {
            return NextResponse.json({ error: 'AI failed to process message' }, { status: 500 });
        }

        // Acknowledge usage
        await incrementAIUsage(limitCheck.userId!);

        return NextResponse.json({
            success: true,
            response: aiResponse.output,
            metadata: aiResponse.metadata,
            requestsToday: limitCheck.requestsToday! + 1
        });
    } catch (error: any) {
        console.error('[API Chat] Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
