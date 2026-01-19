import type { ProcessorResult } from './index';

/**
 * Resize a single image using Canvas API
 */
export async function resizeImage(
    file: File,
    targetWidth?: number,
    targetHeight?: number,
    onProgress?: (progress: number) => void
): Promise<ProcessorResult> {
    return new Promise((resolve) => {
        try {
            onProgress?.(10);

            const img = new Image();
            const url = URL.createObjectURL(file);

            img.onload = async () => {
                try {
                    onProgress?.(30);

                    let newWidth = targetWidth || img.width;
                    let newHeight = targetHeight || img.height;

                    // Maintain aspect ratio if only one dimension provided
                    if (targetWidth && !targetHeight) {
                        const ratio = img.height / img.width;
                        newHeight = Math.round(targetWidth * ratio);
                    } else if (targetHeight && !targetWidth) {
                        const ratio = img.width / img.height;
                        newWidth = Math.round(targetHeight * ratio);
                    }

                    onProgress?.(50);

                    // Create canvas and draw resized image
                    const canvas = document.createElement('canvas');
                    canvas.width = newWidth;
                    canvas.height = newHeight;

                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        resolve({ success: false, error: 'Failed to create canvas context' });
                        return;
                    }

                    // Use high quality scaling
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    ctx.drawImage(img, 0, 0, newWidth, newHeight);

                    onProgress?.(70);

                    // Determine output format
                    const mimeType = file.type || 'image/jpeg';
                    const quality = mimeType === 'image/png' ? undefined : 0.92;

                    canvas.toBlob(
                        (blob) => {
                            URL.revokeObjectURL(url);

                            if (!blob) {
                                resolve({ success: false, error: 'Failed to create image blob' });
                                return;
                            }

                            onProgress?.(100);

                            const ext = file.name.split('.').pop() || 'jpg';
                            const baseName = file.name.replace(/\.[^/.]+$/, '');
                            const filename = `${baseName}_${newWidth}x${newHeight}.${ext}`;

                            resolve({
                                success: true,
                                blob,
                                filename,
                                originalSize: file.size,
                                finalSize: blob.size
                            });
                        },
                        mimeType,
                        quality
                    );
                } catch (error: any) {
                    URL.revokeObjectURL(url);
                    resolve({ success: false, error: error.message || 'Failed to resize image' });
                }
            };

            img.onerror = () => {
                URL.revokeObjectURL(url);
                resolve({ success: false, error: 'Failed to load image' });
            };

            img.src = url;
        } catch (error: any) {
            resolve({ success: false, error: error.message || 'Failed to resize image' });
        }
    });
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
