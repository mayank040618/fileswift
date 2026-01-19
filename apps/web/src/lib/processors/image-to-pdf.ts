import { PDFDocument } from 'pdf-lib';
import type { ProcessorResult } from './index';

/**
 * Convert images to a single PDF
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

            const arrayBuffer = await file.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);

            let image;
            const mimeType = file.type.toLowerCase();

            try {
                if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
                    image = await pdfDoc.embedJpg(uint8Array);
                } else if (mimeType === 'image/png') {
                    image = await pdfDoc.embedPng(uint8Array);
                } else {
                    // For other formats, convert to PNG via canvas
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    const img = new Image();

                    const pngBlob = await new Promise<Blob | null>((resolve) => {
                        img.onload = () => {
                            canvas.width = img.width;
                            canvas.height = img.height;
                            ctx?.drawImage(img, 0, 0);
                            canvas.toBlob(resolve, 'image/png');
                        };
                        img.onerror = () => resolve(null);
                        img.src = URL.createObjectURL(file);
                    });

                    if (!pngBlob) {
                        return { success: false, error: `Failed to convert ${file.name} to PNG` };
                    }

                    const pngBuffer = await pngBlob.arrayBuffer();
                    image = await pdfDoc.embedPng(new Uint8Array(pngBuffer));
                }
            } catch (embedError: any) {
                console.error(`Failed to embed ${file.name}:`, embedError);
                return { success: false, error: `Failed to process ${file.name}: ${embedError.message}` };
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
            filename: 'images.pdf',
            originalSize: totalOriginalSize,
            finalSize: blob.size
        };
    } catch (error: any) {
        console.error('Images to PDF error:', error);
        return { success: false, error: error.message || 'Failed to create PDF from images' };
    }
}
