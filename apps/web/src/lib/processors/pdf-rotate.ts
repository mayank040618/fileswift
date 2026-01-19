import { PDFDocument, degrees } from 'pdf-lib';
import type { ProcessorResult } from './index';

/**
 * Rotate all pages in a PDF by the specified angle
 * @param angle - Rotation angle: 90, 180, or 270 degrees
 */
export async function rotatePDF(
    file: File,
    angle: 90 | 180 | 270 = 90,
    onProgress?: (progress: number) => void
): Promise<ProcessorResult> {
    try {
        onProgress?.(10);

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);

        onProgress?.(30);

        const pages = pdf.getPages();
        const totalPages = pages.length;

        for (let i = 0; i < totalPages; i++) {
            const page = pages[i];
            const currentRotation = page.getRotation().angle;
            page.setRotation(degrees(currentRotation + angle));
            onProgress?.(30 + Math.round((i / totalPages) * 50));
        }

        onProgress?.(85);

        const rotatedPdfBytes = await pdf.save();
        const blob = new Blob([new Uint8Array(rotatedPdfBytes).buffer.slice(0)], { type: 'application/pdf' });

        onProgress?.(100);

        // Generate filename based on rotation
        const baseName = file.name.replace(/\.pdf$/i, '');

        return {
            success: true,
            blob,
            filename: `${baseName}_rotated_${angle}.pdf`,
            originalSize: file.size,
            finalSize: blob.size
        };
    } catch (error: any) {
        console.error('Rotate PDF error:', error);
        return { success: false, error: error.message || 'Failed to rotate PDF' };
    }
}
