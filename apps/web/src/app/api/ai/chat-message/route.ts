
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Keys
const SARVAM_API_KEY = process.env.SARVAM_API_KEY || '';
const XAI_API_KEY = process.env.XAI_API_KEY || '';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

// Determine config based on available keys
let apiKey = OPENAI_API_KEY;
let baseURL: string | undefined = undefined;
let model = 'gpt-3.5-turbo'; // Default fallback

if (SARVAM_API_KEY) {
    apiKey = SARVAM_API_KEY;
    baseURL = 'https://api.sarvam.ai/v1';
    model = 'sarvam-m';
} else if (XAI_API_KEY) {
    apiKey = XAI_API_KEY;
    baseURL = 'https://api.x.ai/v1';
    model = 'grok-3-fast';
}

const client = new OpenAI({
    apiKey: apiKey || 'dummy', // Prevent crash if no key, handle in handler
    baseURL,
});

interface ChatRequest {
    message: string;
    context?: string; // Extracted PDF text
    fileId?: string; // For future server-side RAG
}

export async function POST(request: NextRequest) {
    try {
        const { message, context }: ChatRequest = await request.json();

        if (!message) {
            return NextResponse.json(
                { error: 'No message provided' },
                { status: 400 }
            );
        }

        // Limit context to prevent token overflow (~30k chars is safe for most large models)
        // Grok has 128k context but let's be safe.
        const truncatedContext = context ? context.slice(0, 50000) : '';

        // System prompt to guide the AI behavior
        const systemPrompt = `You are a helpful AI assistant built into FileSwift.
        Your goal is to answer questions about the user's uploaded document.
        
        CONTEXT FROM DOCUMENT:
        ${truncatedContext}
        
        INSTRUCTIONS:
        1. Answer the user's question based strictly on the provided context.
        2. If the answer is not in the document, say "I couldn't find that information in the document."
        3. Be concise and professional.
        4. If the context is empty, answer generally but mention you don't have document access.
        `;

        // If no API key, return mock response
        if (!apiKey) {
            return NextResponse.json({
                response: `[Mock AI] I received your message: "${message}". Since no API key is configured, I cannot analyze the document content (${truncatedContext.length} chars).`,
                isMock: true
            });
        }

        const response = await client.chat.completions.create({
            model: model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: message }
            ],
            temperature: 0.5,
            max_tokens: 1024,
        });

        const aiMessage = response.choices[0]?.message?.content || 'I encountered an error generating a response.';

        return NextResponse.json({ response: aiMessage });

    } catch (error: any) {
        console.error('AI Chat error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to process chat message' },
            { status: 500 }
        );
    }
}
