import { PDFDocument } from 'pdf-lib';
import type { ProcessorResult } from './index';

// Maximum canvas dimension to prevent browser crashes
const MAX_CANVAS_DIMENSION = 4096;

/**
 * Get MIME type from file extension as fallback
 */
function getMimeTypeFromExtension(filename: string): string {
    const ext = filename.toLowerCase().split('.').pop();
    const mimeMap: Record<string, string> = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'bmp': 'image/bmp',
        'tiff': 'image/tiff',
        'tif': 'image/tiff',
        'heic': 'image/heic',
        'heif': 'image/heif',
    };
    return mimeMap[ext || ''] || 'image/unknown';
}

/**
 * Load image and optionally resize if too large
 */
async function loadAndResizeImage(file: File): Promise<{ blob: Blob; width: number; height: number } | null> {
    return new Promise((resolve) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);

            let { width, height } = img;
            let needsResize = false;

            // Check if image exceeds max dimensions
            if (width > MAX_CANVAS_DIMENSION || height > MAX_CANVAS_DIMENSION) {
                needsResize = true;
                const scale = Math.min(MAX_CANVAS_DIMENSION / width, MAX_CANVAS_DIMENSION / height);
                width = Math.floor(width * scale);
                height = Math.floor(height * scale);
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                resolve(null);
                return;
            }

            // Use high-quality image smoothing for resized images
            if (needsResize) {
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
            }

            ctx.drawImage(img, 0, 0, width, height);

            // Convert to JPEG for better compatibility and smaller size
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve({ blob, width, height });
                    } else {
                        // Fallback to PNG if JPEG fails
                        canvas.toBlob(
                            (pngBlob) => {
                                resolve(pngBlob ? { blob: pngBlob, width, height } : null);
                            },
                            'image/png'
                        );
                    }
                },
                'image/jpeg',
                0.92
            );
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            resolve(null);
        };

        img.src = url;
    });
}

/**
 * Convert images to a single PDF
 * Supports: JPEG, PNG, WebP, GIF, BMP, TIFF, and high-resolution document images
 */
export async function imagesToPDF(
    files: File[],
    onProgress?: (progress: number) => void
): Promise<ProcessorResult> {
    try {
        if (files.length === 0) {
            return { success: false, error: 'No images provided' };
        }

        onProgress?.(5);

        const pdfDoc = await PDFDocument.create();
        let totalOriginalSize = 0;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            totalOriginalSize += file.size;

            // Get MIME type - use file.type or fallback to extension
            let mimeType = file.type.toLowerCase();
            if (!mimeType || mimeType === 'application/octet-stream') {
                mimeType = getMimeTypeFromExtension(file.name);
            }

            let image;

            try {
                // Try direct embedding for JPEG and PNG first (most efficient)
                if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
                    try {
                        const arrayBuffer = await file.arrayBuffer();
                        image = await pdfDoc.embedJpg(new Uint8Array(arrayBuffer));
                    } catch {
                        // If direct embed fails, use canvas conversion
                        const result = await loadAndResizeImage(file);
                        if (!result) {
                            return { success: false, error: `Failed to process ${file.name}` };
                        }
                        const buffer = await result.blob.arrayBuffer();
                        image = await pdfDoc.embedJpg(new Uint8Array(buffer));
                    }
                } else if (mimeType === 'image/png') {
                    try {
                        const arrayBuffer = await file.arrayBuffer();
                        image = await pdfDoc.embedPng(new Uint8Array(arrayBuffer));
                    } catch {
                        // If direct embed fails (e.g., too large), use canvas conversion
                        const result = await loadAndResizeImage(file);
                        if (!result) {
                            return { success: false, error: `Failed to process ${file.name}` };
                        }
                        const buffer = await result.blob.arrayBuffer();
                        // Use JPEG for resized images (better compatibility)
                        if (result.blob.type === 'image/jpeg') {
                            image = await pdfDoc.embedJpg(new Uint8Array(buffer));
                        } else {
                            image = await pdfDoc.embedPng(new Uint8Array(buffer));
                        }
                    }
                } else {
                    // For all other formats (WebP, GIF, BMP, TIFF, HEIC, etc.)
                    // Convert via canvas
                    const result = await loadAndResizeImage(file);
                    if (!result) {
                        return {
                            success: false,
                            error: `Failed to convert ${file.name}. The image format may not be supported by your browser.`
                        };
                    }

                    const buffer = await result.blob.arrayBuffer();
                    if (result.blob.type === 'image/jpeg') {
                        image = await pdfDoc.embedJpg(new Uint8Array(buffer));
                    } else {
                        image = await pdfDoc.embedPng(new Uint8Array(buffer));
                    }
                }
            } catch (embedError: any) {
                console.error(`Failed to embed ${file.name}:`, embedError);
                return {
                    success: false,
                    error: `Failed to process ${file.name}: ${embedError.message || 'Unknown error'}`
                };
            }

            // Add page with image dimensions
            const page = pdfDoc.addPage([image.width, image.height]);
            page.drawImage(image, {
                x: 0,
                y: 0,
                width: image.width,
                height: image.height,
            });

            onProgress?.(5 + Math.round((i + 1) / files.length * 85));
        }

        onProgress?.(95);

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([new Uint8Array(pdfBytes).buffer.slice(0)], { type: 'application/pdf' });

        onProgress?.(100);

        return {
            success: true,
            blob,
            filename: files.length === 1 ? `${files[0].name.replace(/\.[^/.]+$/, '')}.pdf` : 'images.pdf',
            originalSize: totalOriginalSize,
            finalSize: blob.size
        };
    } catch (error: any) {
        console.error('Images to PDF error:', error);
        return { success: false, error: error.message || 'Failed to create PDF from images' };
    }
}
