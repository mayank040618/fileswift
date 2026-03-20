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
            prompt: 'Identify and extract any tabular data, financial figures, or lists from the attached document. Format the results as clean markdown tables. If no tables are found, return a structured list of key data points.',
            files: files || [],
        });

        if (!aiResponse.success) {
            return NextResponse.json({ error: 'AI failed to extract data' }, { status: 500 });
        }

        // Acknowledge usage
        await incrementAIUsage(limitCheck.userId!);

        return NextResponse.json({
            success: true,
            output: aiResponse.output,
            metadata: aiResponse.metadata,
            requestsToday: limitCheck.requestsToday! + 1
        });
    } catch (error: any) {
        console.error('[API Extract Tables] Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
