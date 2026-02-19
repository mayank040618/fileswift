import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    console.log('[Image Resize] Request received');
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        const width = formData.get('width') ? parseInt(formData.get('width') as string) : undefined;
        const height = formData.get('height') ? parseInt(formData.get('height') as string) : undefined;

        if (!file) {
            console.error('[Image Resize] No file provided');
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        console.log(`[Image Resize] Processing file: ${file.name}, Size: ${file.size}, Target: ${width}x${height}`);

        const buffer = Buffer.from(await file.arrayBuffer());

        console.log('[Image Resize] Importing sharp...');
        let sharp;
        try {
            // @ts-ignore
            sharp = (await import('sharp')).default;
        } catch (importError: any) {
            console.error('[Image Resize] Failed to load sharp module:', importError);
            return NextResponse.json(
                { error: `Server configuration error: ${importError.message}` },
                { status: 500 }
            );
        }

        if (!sharp) {
            console.error('[Image Resize] Sharp module loaded but default export is missing');
            return NextResponse.json(
                { error: 'Server configuration error: Image processor failed to load' },
                { status: 500 }
            );
        }

        console.log('[Image Resize] Sharp imported successfully. Creating pipeline...');
        let pipeline = sharp(buffer);

        if (width || height) {
            console.log(`[Image Resize] Resizing to ${width}x${height}`);
            pipeline = pipeline.resize({
                width: width || undefined,
                height: height || undefined,
                fit: 'inside',
                withoutEnlargement: true,
            });
        }

        console.log('[Image Resize] Converting to buffer...');
        const resizedBuffer = await pipeline.toBuffer();

        console.log(`[Image Resize] Success. Output size: ${resizedBuffer.length}`);

        return new NextResponse(resizedBuffer as unknown as BodyInit, {
            headers: {
                'Content-Type': file.type || 'image/jpeg',
                'Content-Disposition': `attachment; filename="resized-${file.name}"`,
            },
        });

    } catch (error: any) {
        console.error('[Image Resize] Processing error:', error);
        return NextResponse.json(
            { error: 'Image processing failed', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
