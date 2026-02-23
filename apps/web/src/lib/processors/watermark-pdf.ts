import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import type { ProcessorResult } from './index';

/**
 * Add a text watermark to all pages of a PDF
 * Runs entirely in the browser using pdf-lib
 */
export async function watermarkPDF(
    files: File[],
    watermarkText: string,
    onProgress?: (progress: number) => void
): Promise<ProcessorResult> {
    try {
        if (files.length === 0) {
            return { success: false, error: 'No files provided' };
        }

        if (!watermarkText || watermarkText.trim() === '') {
            return { success: false, error: 'Watermark text is required' };
        }

        const file = files[0]; // Process one file at a time for watermarking
        const arrayBuffer = await file.arrayBuffer();

        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const helveticaFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        const pages = pdfDoc.getPages();

        for (let i = 0; i < pages.length; i++) {
            const page = pages[i];
            const { width, height } = page.getSize();

            // Calculate a reasonable text size based on page width
            const textSize = Math.min(width / 10, 80);

            // Measure text width to center it
            const textWidth = helveticaFont.widthOfTextAtSize(watermarkText, textSize);
            const textHeight = helveticaFont.heightAtSize(textSize);

            // Calculate center position
            const x = width / 2;
            const y = height / 2;

            // Draw text rotated at 45 degrees across the center
            page.drawText(watermarkText, {
                x: x - (textWidth / 2) * Math.cos(Math.PI / 4) + (textHeight / 2) * Math.sin(Math.PI / 4),
                y: y - (textWidth / 2) * Math.sin(Math.PI / 4) - (textHeight / 2) * Math.cos(Math.PI / 4),
                size: textSize,
                font: helveticaFont,
                color: rgb(0.5, 0.5, 0.5), // Gray color
                opacity: 0.3, // Light transparency
                rotate: degrees(45),
            });

            // Report progress per page
            onProgress?.(Math.round(((i + 1) / pages.length) * 100));
        }

        // Save the watermarked PDF
        const watermarkedPdfBytes = await pdfDoc.save();
        const blob = new Blob([new Uint8Array(watermarkedPdfBytes).buffer.slice(0)], { type: 'application/pdf' });

        return {
            success: true,
            blob,
            filename: `watermarked_${file.name}`,
            originalSize: file.size,
            finalSize: blob.size
        };
    } catch (error: any) {
        console.error('Watermark PDF error:', error);
        return { success: false, error: error.message || 'Failed to watermark PDF' };
    }
}
