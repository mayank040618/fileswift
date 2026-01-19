import imageCompression from 'browser-image-compression';
import type { ProcessorResult } from './index';

/**
 * Compress a single image
 */
export async function compressImage(
    file: File,
    quality: number = 75,
    onProgress?: (progress: number) => void
): Promise<ProcessorResult> {
    try {
        onProgress?.(10);

        // Map quality (0-100) to maxSizeMB
        // Higher quality = larger max size
        const maxSizeMB = quality >= 80 ? 2 : quality >= 50 ? 1 : 0.5;
        const maxWidthOrHeight = quality >= 80 ? 4096 : quality >= 50 ? 2048 : 1920;

        const options = {
            maxSizeMB,
            maxWidthOrHeight,
            useWebWorker: true,
            onProgress: (p: number) => onProgress?.(10 + Math.round(p * 0.8)),
        };

        const compressedFile = await imageCompression(file, options);
        const blob = new Blob([compressedFile], { type: compressedFile.type });

        onProgress?.(100);

        // Generate output filename
        const ext = file.name.split('.').pop() || 'jpg';
        const baseName = file.name.replace(/\.[^/.]+$/, '');
        const filename = `${baseName}_compressed.${ext}`;

        return {
            success: true,
            blob,
            filename,
            originalSize: file.size,
            finalSize: blob.size
        };
    } catch (error: any) {
        console.error('Compress image error:', error);
        return { success: false, error: error.message || 'Failed to compress image' };
    }
}

/**
 * Compress multiple images
 * Returns array of compressed blobs
 */
export async function compressImages(
    files: File[],
    quality: number = 75,
    onProgress?: (progress: number) => void
): Promise<ProcessorResult> {
    try {
        const blobs: Blob[] = [];
        const filenames: string[] = [];
        let totalOriginal = 0;
        let totalFinal = 0;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const result = await compressImage(file, quality, (p) => {
                const baseProgress = (i / files.length) * 100;
                const fileProgress = (p / 100) * (100 / files.length);
                onProgress?.(Math.round(baseProgress + fileProgress));
            });

            if (result.success && result.blob) {
                blobs.push(result.blob);
                filenames.push(result.filename || file.name);
                totalOriginal += result.originalSize || file.size;
                totalFinal += result.finalSize || result.blob.size;
            } else {
                return { success: false, error: `Failed to compress ${file.name}: ${result.error}` };
            }
        }

        return {
            success: true,
            blobs,
            filenames,
            originalSize: totalOriginal,
            finalSize: totalFinal
        };
    } catch (error: any) {
        console.error('Compress images error:', error);
        return { success: false, error: error.message || 'Failed to compress images' };
    }
}
