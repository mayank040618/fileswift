import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        hasPublishableKey: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
        hasSecretKey: !!process.env.CLERK_SECRET_KEY,
        clerkKeys: Object.keys(process.env).filter(key => key.includes('CLERK')),
        nodeEnv: process.env.NODE_ENV,
        port: process.env.PORT,
    });
}
