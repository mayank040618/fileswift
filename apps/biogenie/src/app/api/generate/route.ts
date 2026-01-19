import { NextRequest, NextResponse } from 'next/server';

// Gemini API integration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

interface GenerateRequest {
    type: 'instagram' | 'linkedin' | 'twitter' | 'caption';
    // Instagram
    profession?: string;
    vibe?: string;
    interests?: string;
    includeEmojis?: boolean;
    // LinkedIn
    jobTitle?: string;
    industry?: string;
    experience?: string;
    skills?: string;
    tone?: string;
    // Twitter
    personality?: string;
    niche?: string;
    whatYouDo?: string;
    // Caption
    contentType?: string;
    mood?: string;
    context?: string;
    hashtagCount?: number;
}

function buildPrompt(data: GenerateRequest): string {
    const { type } = data;

    switch (type) {
        case 'instagram':
            return `You are an expert Instagram bio writer. Generate 5 unique, creative Instagram bios based on these details:

Profession: ${data.profession}
Vibe: ${data.vibe} (make it ${data.vibe === 'funny' ? 'witty and humorous' : data.vibe === 'aesthetic' ? 'soft, minimal, and aesthetic' : data.vibe === 'professional' ? 'clean and professional' : data.vibe === 'bold' ? 'confident and edgy' : 'cute and adorable'})
Interests: ${data.interests || 'not specified'}
Include emojis: ${data.includeEmojis ? 'Yes, use relevant emojis' : 'No emojis'}

Requirements:
- Each bio should be under 150 characters
- Make them unique and memorable
- Match the requested vibe perfectly
- Use line breaks where appropriate (use | or • as separators)
- Don't use generic phrases like "Living my best life"

Output format: Return exactly 5 bios, separated by |||. No numbering, no explanations.`;

        case 'linkedin':
            return `You are an expert LinkedIn profile writer. Generate 3 unique LinkedIn summaries/about sections based on these details:

Job Title: ${data.jobTitle}
Industry: ${data.industry}
Experience Level: ${data.experience || 'not specified'}
Key Skills: ${data.skills || 'not specified'}
Tone: ${data.tone} (${data.tone === 'professional' ? 'formal and polished' : data.tone === 'friendly' ? 'warm and approachable' : data.tone === 'confident' ? 'bold and assertive' : 'narrative storytelling style'})

Requirements:
- Each summary should be 150-250 words
- Include a compelling opening hook
- Highlight the person's value proposition
- Include a call to action at the end
- Sound authentic, not robotic or generic
- Use proper LinkedIn formatting

Output format: Return exactly 3 summaries, separated by |||. No numbering, no explanations.`;

        case 'twitter':
            return `You are an expert Twitter/X bio writer known for creating viral profiles. Generate 5 unique Twitter bios based on these details:

Personality: ${data.personality}
Niche: ${data.niche}
What they do: ${data.whatYouDo || 'not specified'}
Include emojis: ${data.includeEmojis ? 'Yes, use clever emojis' : 'No emojis'}

Requirements:
- MUST be under 160 characters each (Twitter limit)
- Make them witty, memorable, and personality-driven
- Match the ${data.personality} personality perfectly
- Use clever wordplay or humor where appropriate
- Avoid clichés like "Dreamer" or "Lover of life"
- Consider using formats like: "Title | Interest | Quirk" or punchy one-liners

Output format: Return exactly 5 bios, separated by |||. No numbering, no explanations.`;

        case 'caption':
            return `You are a viral social media caption writer. Generate 5 unique Instagram/social media captions based on these details:

Content Type: ${data.contentType}
Mood: ${data.mood}
Context: ${data.context || 'general post'}
Hashtag Count: ${data.hashtagCount || 5}
Include emojis: ${data.includeEmojis ? 'Yes, use relevant emojis' : 'No emojis'}

Requirements:
- Create engaging, scroll-stopping captions
- Match the ${data.mood} mood perfectly
- Include exactly ${data.hashtagCount || 5} relevant hashtags at the end
- Vary the lengths (some short and punchy, some longer with story)
- Don't be generic or boring
- Make people want to like, comment, and share

Output format: Return exactly 5 captions with hashtags, separated by |||. No numbering, no explanations.`;

        default:
            return '';
    }
}

async function generateWithGemini(prompt: string): Promise<string[]> {
    // If no API key, return mock data for testing
    if (!GEMINI_API_KEY) {
        console.warn('No GEMINI_API_KEY set, returning mock data');
        return getMockData();
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [
                {
                    parts: [
                        {
                            text: prompt,
                        },
                    ],
                },
            ],
            generationConfig: {
                temperature: 0.9,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048,
            },
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        console.error('Gemini API error:', error);
        throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Split by ||| separator and clean up
    const results = text
        .split('|||')
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0);

    return results;
}

function getMockData(): string[] {
    return [
        "Coffee ☕ | Code 💻 | Chaos 🌪️\nBuilding the future one bug at a time",
        "Student by day, dreamer always ✨\nTech enthusiast | Chai lover | 20",
        "Making pixels pretty since '99 🎨\n@biogenie.app made this bio",
        "Professional overthinker 🧠\nPart-time adulting, full-time memes",
        "Plot twist: I'm actually a cat 🐱\nJust here for the chaos fr"
    ];
}

export async function POST(request: NextRequest) {
    try {
        const data: GenerateRequest = await request.json();

        if (!data.type) {
            return NextResponse.json(
                { error: 'Type is required' },
                { status: 400 }
            );
        }

        const prompt = buildPrompt(data);

        if (!prompt) {
            return NextResponse.json(
                { error: 'Invalid type' },
                { status: 400 }
            );
        }

        const results = await generateWithGemini(prompt);

        return NextResponse.json({ results });
    } catch (error) {
        console.error('Generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate', results: getMockData() },
            { status: 500 }
        );
    }
}
