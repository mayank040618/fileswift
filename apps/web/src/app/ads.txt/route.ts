import { NextResponse } from 'next/server';

export async function GET() {
    const adSenseContent = `google.com, pub-5583723279396814, DIRECT, f08c47fec0942fa0`;

    return new NextResponse(adSenseContent, {
        headers: {
            'Content-Type': 'text/plain',
            'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200',
        },
    });
}
