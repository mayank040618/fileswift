import { PDFDocument } from 'pdf-lib';
import type { ProcessorResult } from './index';

/**
 * Merge multiple PDF files into a single PDF
 * Runs entirely in the browser using pdf-lib
 */
export async function mergePDFs(
    files: File[],
    onProgress?: (progress: number) => void
): Promise<ProcessorResult> {
    try {
        if (files.length < 2) {
            return { success: false, error: 'Need at least 2 PDFs to merge' };
        }

        // Create a new PDF document
        const mergedPdf = await PDFDocument.create();
        let totalPages = 0;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const arrayBuffer = await file.arrayBuffer();

            try {
                const pdf = await PDFDocument.load(arrayBuffer);
                const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                pages.forEach(page => mergedPdf.addPage(page));
                totalPages += pages.length;
            } catch (e) {
                console.error(`Error loading PDF ${file.name}:`, e);
                return { success: false, error: `Failed to load ${file.name}. Is it a valid PDF?` };
            }

            // Report progress
            onProgress?.(Math.round(((i + 1) / files.length) * 100));
        }

        // Save the merged PDF
        const mergedPdfBytes = await mergedPdf.save();
        const blob = new Blob([new Uint8Array(mergedPdfBytes).buffer.slice(0)], { type: 'application/pdf' });

        return {
            success: true,
            blob,
            filename: 'merged.pdf',
            originalSize: files.reduce((acc, f) => acc + f.size, 0),
            finalSize: blob.size
        };
    } catch (error: any) {
        console.error('Merge PDF error:', error);
        return { success: false, error: error.message || 'Failed to merge PDFs' };
    }
}
