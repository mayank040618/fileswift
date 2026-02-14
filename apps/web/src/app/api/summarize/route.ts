import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const XAI_API_KEY = process.env.XAI_API_KEY || '';

const client = new OpenAI({
    apiKey: XAI_API_KEY,
    baseURL: 'https://api.x.ai/v1',
});

interface SummarizeRequest {
    text: string;
    mode?: 'brief' | 'detailed' | 'bullets';
}

function buildPrompt(text: string, mode: string): string {
    const modeInstructions: Record<string, string> = {
        brief: 'Provide a concise 2-3 sentence summary capturing the main point.',
        detailed: 'Provide a comprehensive summary covering all key topics, main arguments, and conclusions. Use 3-5 paragraphs.',
        bullets: 'Summarize the document as 5-10 bullet points, each capturing a key takeaway.',
    };

    return `You are an expert document summarizer. Analyze the following document and ${modeInstructions[mode] || modeInstructions.brief}

DOCUMENT:
${text}

SUMMARY:`;
}

function getMockSummary(mode: string): string {
    const mocks: Record<string, string> = {
        brief: 'This document discusses important topics that require attention. The main points include key findings and recommendations for action.',
        detailed: 'This document provides a comprehensive overview of the subject matter.\n\nThe first section covers the background and context, establishing the foundation for the discussion.\n\nKey findings are presented in the middle sections, supported by evidence and analysis.\n\nThe document concludes with actionable recommendations and next steps.',
        bullets: '• Key finding #1: Important insight from the document\n• Key finding #2: Another significant point\n• Key finding #3: Supporting evidence discovered\n• Key finding #4: Critical conclusion reached\n• Key finding #5: Recommended action to take',
    };
    return mocks[mode] || mocks.brief;
}

export async function POST(request: NextRequest) {
    try {
        const { text, mode = 'brief' }: SummarizeRequest = await request.json();

        if (!text || text.trim().length === 0) {
            return NextResponse.json(
                { error: 'No text provided' },
                { status: 400 }
            );
        }

        // Limit text to ~15000 chars to stay within token limits
        const truncatedText = text.slice(0, 15000);

        // If no API key, return mock data for testing
        if (!XAI_API_KEY) {
            console.warn('No XAI_API_KEY set, returning mock summary');
            return NextResponse.json({
                summary: getMockSummary(mode),
                isMock: true
            });
        }

        const prompt = buildPrompt(truncatedText, mode);

        const response = await client.chat.completions.create({
            model: 'grok-3-fast',
            messages: [
                { role: 'user', content: prompt }
            ],
            temperature: 0.3,
            max_tokens: 1024,
        });

        const summary = response.choices[0]?.message?.content || 'Unable to generate summary.';

        return NextResponse.json({ summary });
    } catch (error: any) {
        console.error('Summarization error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to summarize document' },
            { status: 500 }
        );
    }
}
