import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import type { ProcessorResult } from './index';

/**
 * Split a PDF into individual pages
 * Returns a ZIP file containing each page as a separate PDF
 */
export async function splitPDF(
    file: File,
    onProgress?: (progress: number) => void
): Promise<ProcessorResult> {
    try {
        onProgress?.(5);

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const pageCount = pdf.getPageCount();

        onProgress?.(15);

        if (pageCount < 2) {
            return { success: false, error: 'PDF must have at least 2 pages to split' };
        }

        const zip = new JSZip();
        const baseName = file.name.replace(/\.pdf$/i, '');

        for (let i = 0; i < pageCount; i++) {
            // Create a new PDF with just this page
            const singlePagePdf = await PDFDocument.create();
            const [page] = await singlePagePdf.copyPages(pdf, [i]);
            singlePagePdf.addPage(page);

            const pdfBytes = await singlePagePdf.save();
            zip.file(`${baseName}_page_${i + 1}.pdf`, pdfBytes);

            onProgress?.(15 + Math.round((i / pageCount) * 70));
        }

        onProgress?.(90);

        // Generate the ZIP file
        const zipBlob = await zip.generateAsync({ type: 'blob' });

        onProgress?.(100);

        return {
            success: true,
            blob: zipBlob,
            filename: `${baseName}_split.zip`,
            originalSize: file.size,
            finalSize: zipBlob.size
        };
    } catch (error: any) {
        console.error('Split PDF error:', error);
        return { success: false, error: error.message || 'Failed to split PDF' };
    }
}
