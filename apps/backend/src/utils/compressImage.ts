
import sharp from 'sharp';

interface CompressionResult {
    buffer: Buffer;
    format: string;
    originalSize: number;
    compressedSize: number;
    skippedCompression: boolean;
}

export const compressImage = async (inputBuffer: Buffer, originalFilename?: string, qualityInput?: number): Promise<CompressionResult> => {
    const originalSize = inputBuffer.length;
    let pipeline = sharp(inputBuffer);
    const metadata = await pipeline.metadata();
    const format = metadata.format || 'jpeg';

    // Sharp strips metadata by default unless withMetadata() is called. 
    // So we don't need to do anything to remove it.

    // Cast format to string to avoid strict enum mismatch issues with 'heic'
    const formatStr = (format as string).toLowerCase();

    // Map Slider (0-100) to Sharp Quality (Safe Range)
    // The user slider goes from 5 (Max Compression) to 95 (Min Compression)
    // Quality < 30 often makes text unreadable. We map [5, 95] -> [SafeMin, SafeMax]

    // Helper to map ranges
    const mapRange = (val: number, inMin: number, inMax: number, outMin: number, outMax: number) => {
        return outMin + (val - inMin) * (outMax - outMin) / (inMax - inMin);
    };

    const qInputRaw = qualityInput !== undefined ? parseInt(String(qualityInput)) : 75;
    // Clamp input just in case
    const qIn = Math.max(5, Math.min(95, qInputRaw));

    let quality = 80; // Default fallback

    // Apply Format Specific Options
    if (formatStr === 'jpeg' || formatStr === 'jpg') {
        // Map 5-95 -> 40-95 (Below 40 is usually too blocky for text)
        quality = Math.round(mapRange(qIn, 5, 95, 40, 95));

        pipeline = pipeline.jpeg({
            quality: quality,
            chromaSubsampling: '4:2:0',
            mozjpeg: true,
            progressive: true
        });
    } else if (formatStr === 'png') {
        // PNG Palette quality: Map 5-95 -> 40-100
        quality = Math.round(mapRange(qIn, 5, 95, 40, 100));

        pipeline = pipeline.png({
            compressionLevel: 9,
            palette: true,
            quality: quality
        });
    } else if (formatStr === 'webp') {
        // WebP: Map 5-95 -> 50-95
        quality = Math.round(mapRange(qIn, 5, 95, 50, 95));
        pipeline = pipeline.webp({ quality: quality });
    } else if (formatStr === 'heif' || formatStr === 'heic') {
        // HEIC -> JPEG: Map 5-95 -> 40-95
        quality = Math.round(mapRange(qIn, 5, 95, 40, 95));
        pipeline = pipeline.toFormat('jpeg', { quality: quality });
    } else {
        // Fallback: Map 5-95 -> 40-95
        quality = Math.round(mapRange(qIn, 5, 95, 40, 95));
        pipeline = pipeline.toFormat('jpeg', { quality: quality });
    }

    const compressedBuffer = await pipeline.toBuffer();
    const compressedSize = compressedBuffer.length;

    console.log(`[Compress] ${originalFilename || 'image'} | In: ${originalSize} | Out: ${compressedSize} | Format: ${format} | Q: ${quality}`);

    if (compressedSize >= originalSize) {
        console.log(`[Compress] Skipped: Output larger than input. Returning original.`);
        return {
            buffer: inputBuffer,
            format: formatStr,
            originalSize,
            compressedSize: originalSize,
            skippedCompression: true
        };
    }

    return {
        buffer: compressedBuffer,
        format: formatStr === 'heif' || formatStr === 'heic' ? 'jpeg' : formatStr,
        originalSize,
        compressedSize,
        skippedCompression: false
    };
};
