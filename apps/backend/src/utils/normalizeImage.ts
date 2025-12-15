
import sharp from 'sharp';

interface NormalizedImage {
    buffer: Buffer;
    format: 'png' | 'jpeg';
    width: number;
    height: number;
}

/**
 * Normalizes an image by:
 * 1. Rotating it based on EXIF Orientation tag.
 * 2. Stripping all metadata (EXIF/XMP).
 * 3. Converting to a standard format (JPEG or PNG).
 */
export async function normalizeImage(input: Buffer | string): Promise<NormalizedImage> {
    const pipeline = sharp(input)
        .rotate(); // Auto-rotate based on EXIF (strip metadata is default)

    const metadata = await pipeline.metadata();
    const format = metadata.format === 'png' ? 'png' : 'jpeg';

    if (format === 'jpeg') {
        pipeline.jpeg({ quality: 90 });
    } else {
        pipeline.png({ compressionLevel: 6 });
    }

    const buffer = await pipeline.toBuffer();
    const info = await sharp(buffer).metadata();

    return {
        buffer,
        format: format,
        width: info.width!,
        height: info.height!
    };
}
