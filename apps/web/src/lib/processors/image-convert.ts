// Client-side image format converter (JPG↔PNG, HEIC→JPG)
import { type ProcessorResult } from './index';

/**
 * Convert an image file to a target format using Canvas API.
 * Supports: jpg-to-png, png-to-jpg, heic-to-jpg
 */
export async function convertImageFormat(
    file: File,
    targetFormat: 'png' | 'jpeg',
    quality: number = 0.92,
    onProgress?: (progress: number) => void
): Promise<ProcessorResult> {
    try {
        onProgress?.(10);

        // Create an image element
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);

        await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = objectUrl;
        });

        onProgress?.(40);

        // Draw to canvas
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');

        if (!ctx) throw new Error('Canvas context not available');

        // For JPEG output, fill white background (no transparency)
        if (targetFormat === 'jpeg') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(objectUrl);

        onProgress?.(70);

        // Convert canvas to blob
        const mimeType = targetFormat === 'png' ? 'image/png' : 'image/jpeg';
        const blob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob(
                (b) => b ? resolve(b) : reject(new Error('Canvas conversion failed')),
                mimeType,
                targetFormat === 'jpeg' ? quality : undefined
            );
        });

        onProgress?.(90);

        // Generate output filename
        const baseName = file.name.replace(/\.[^/.]+$/, '');
        const ext = targetFormat === 'png' ? 'png' : 'jpg';
        const filename = `${baseName}.${ext}`;

        return {
            success: true,
            blob,
            filename,
            originalSize: file.size,
            finalSize: blob.size,
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message || 'Image conversion failed',
        };
    }
}
