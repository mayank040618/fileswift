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
        const { files, mode = 'standard' } = body;

        // Execute AI via orchestrator
        const aiResponse = await executeAI({
            userId: limitCheck.userId!,
            plan: limitCheck.plan as any,
            mode: mode as any,
            prompt: 'Please provide a comprehensive summary of the attached document. Include key sections, overall purpose, and any critical dates or figures. Format the response neatly with markdown.',
            files: files || [],
        });

        if (!aiResponse.success) {
            return NextResponse.json({ error: 'AI failed to process document' }, { status: 500 });
        }

        // Acknowledge usage
        await incrementAIUsage(limitCheck.userId!);

        return NextResponse.json({
            success: true,
            summary: aiResponse.output,
            metadata: aiResponse.metadata,
            requestsToday: limitCheck.requestsToday! + 1
        });
    } catch (error: any) {
        console.error('[API Summarize] Critical Error:', error);
        
        const status = error.statusCode || 500;
        const message = error.message || 'Internal Server Error';
        
        return NextResponse.json({ 
            error: message,
            code: error.code || 'UNKNOWN'
        }, { status });
    }
}
