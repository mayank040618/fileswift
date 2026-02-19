import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        const width = formData.get('width') ? parseInt(formData.get('width') as string) : null;
        const height = formData.get('height') ? parseInt(formData.get('height') as string) : null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        let pipeline = sharp(buffer);

        if (width || height) {
            pipeline = pipeline.resize({
                width: width || undefined,
                height: height || undefined,
                fit: 'fill', // Force dimensions if both provided
                withoutEnlargement: false
            });
        }

        const resizedBuffer = await pipeline.toBuffer();

        // Determine content type (preserve original or default to intended)
        // Sharp handles this automatically unless forced.
        // We'll return as the same type if possible or specific.

        return new NextResponse(resizedBuffer as unknown as BodyInit, {
            headers: {
                'Content-Type': file.type || 'image/jpeg',
                'Content-Disposition': `attachment; filename="resized-${file.name}"`
            }
        });

    } catch (error: any) {
        console.error('Resize error:', error);
        return NextResponse.json({ error: error.message || 'Failed to resize image' }, { status: 500 });
    }
}
