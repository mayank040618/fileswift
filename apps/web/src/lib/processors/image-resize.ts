import type { ProcessorResult } from './index';

/**
 * Resize a single image using Server-Side API
 */
export async function resizeImage(
    file: File,
    targetWidth?: number,
    targetHeight?: number,
    onProgress?: (progress: number) => void
): Promise<ProcessorResult> {
    try {
        onProgress?.(10);

        const formData = new FormData();
        formData.append('file', file);
        if (targetWidth) formData.append('width', targetWidth.toString());
        if (targetHeight) formData.append('height', targetHeight.toString());

        onProgress?.(30);

        const response = await fetch('/api/process/image-resize', {
            method: 'POST',
            body: formData,
        });

        onProgress?.(60);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Server processing failed');
        }

        const blob = await response.blob();
        if (!blob) throw new Error('Empty response from server');

        // Get filename from header or generate one
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = file.name;
        if (contentDisposition) {
            const match = contentDisposition.match(/filename="(.+)"/);
            if (match && match[1]) {
                filename = match[1];
            }
        }

        // If filename from server is just "resized-image.png" or similar generic, maybe stick to derived name?
        // But let's rely on server or client naming. 
        // Client-side code in ToolClient usually ignores filename from result if it generates its own?
        // But result.filename is used.

        // Generate filename if server didn't provide specific one based on dims (API set it to resized-filename)
        // Let's refine it here if needed, or trust API.

        onProgress?.(100);

        return {
            success: true,
            blob,
            filename,
            originalSize: file.size,
            finalSize: blob.size
        };

    } catch (error: any) {
        console.error('Resize error:', error);
        return { success: false, error: error.message || 'Failed to resize image' };
    }
}

/**
 * Resize multiple images
 */
export async function resizeImages(
    files: File[],
    targetWidth?: number,
    targetHeight?: number,
    onProgress?: (progress: number) => void
): Promise<ProcessorResult> {
    try {
        const blobs: Blob[] = [];
        const filenames: string[] = [];
        let totalOriginal = 0;
        let totalFinal = 0;

        // Process sequentially to avoid overwhelming server or parallel with limit?
        // Sequential is safer for progress tracking.
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const result = await resizeImage(file, targetWidth, targetHeight, (p) => {
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
                return { success: false, error: `Failed to resize ${file.name}: ${result.error}` };
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
        return { success: false, error: error.message || 'Failed to resize images' };
    }
}
