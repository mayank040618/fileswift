/**
 * /api/summarize — Document summarization endpoint.
 *
 * Uses the AIOrchestrator with a specialized system prompt.
 * No more duplicate provider setup or direct API calls.
 */

import { NextRequest, NextResponse } from 'next/server';
import { executeAI } from '@/lib/ai/AIOrchestrator';
import { AIError } from '@/lib/ai/errors';
import type { UserPlan } from '@/lib/ai/types';

interface SummarizeRequest {
    text: string;
    mode?: 'brief' | 'detailed' | 'bullets';
    plan?: UserPlan;
}

const MODE_INSTRUCTIONS: Record<string, string> = {
    brief: 'Provide a concise 2-3 sentence summary capturing the main point.',
    detailed:
        'Provide a comprehensive summary covering all key topics, main arguments, and conclusions. Use 3-5 paragraphs.',
    bullets: 'Summarize the document as 5-10 bullet points, each capturing a key takeaway.',
};

export async function POST(request: NextRequest) {
    try {
        const { text, mode = 'brief', plan = 'pro' }: SummarizeRequest = await request.json();

        if (!text || text.trim().length === 0) {
            return NextResponse.json(
                { error: { code: 'AI_INVALID_INPUT', message: 'No text provided.', retryable: false } },
                { status: 400 }
            );
        }

        const userId = request.headers.get('x-session-id') || 'anonymous';

        const systemPrompt = `You are an expert document summarizer. Analyze the provided document and ${MODE_INSTRUCTIONS[mode] || MODE_INSTRUCTIONS.brief}`;

        const result = await executeAI({
            userId,
            plan,
            mode: 'standard', // Summarization uses standard mode
            prompt: text,
            systemPrompt,
        });

        return NextResponse.json({
            summary: result.output,
            metadata: result.metadata,
        });
    } catch (err) {
        if (err instanceof AIError) {
            return NextResponse.json(
                { error: err.toJSON() },
                { status: err.statusCode }
            );
        }

        console.error('[API /summarize] Unexpected error:', err);
        return NextResponse.json(
            {
                error: {
                    code: 'AI_PROVIDER_ERROR',
                    message: 'Failed to summarize document.',
                    retryable: true,
                },
            },
            { status: 500 }
        );
    }
}
