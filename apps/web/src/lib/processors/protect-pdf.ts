import { PDFDocument } from 'pdf-lib-plus-encrypt';
import type { ProcessorResult } from './index';

export async function protectPDF(
    files: File[],
    password?: string,
    onProgress?: (progress: number) => void
): Promise<ProcessorResult> {
    if (files.length === 0) {
        return { success: false, error: 'No files provided for protection' };
    }

    if (!password) {
        return { success: false, error: 'Password is required to protect PDF' };
    }

    try {
        if (onProgress) onProgress(10);

        const file = files[0];
        const arrayBuffer = await file.arrayBuffer();

        if (onProgress) onProgress(30);

        // Load the document
        // We use full read/write capabilities here
        const pdfDoc = await PDFDocument.load(arrayBuffer);

        if (onProgress) onProgress(60);

        // Encrypt the document using pdf-lib-plus-encrypt
        pdfDoc.encrypt({
            userPassword: password,
            ownerPassword: password, // Setting owner password same as user for simplicity, or omit if not needed
            permissions: {
                printing: 'highResolution',
                modifying: false,
                copying: false,
                annotating: false,
                fillingForms: false,
                contentAccessibility: true,
                documentAssembly: false
            }
        });

        const protectedPdfBytes = await pdfDoc.save({ useObjectStreams: false });

        if (onProgress) onProgress(90);

        const blob = new Blob([protectedPdfBytes as any], { type: 'application/pdf' });

        // Generate a new filename with an indicator
        const originalName = file.name;
        const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
        const newFilename = `${nameWithoutExt}-protected.pdf`;

        if (onProgress) onProgress(100);

        return {
            success: true,
            blob,
            filename: newFilename,
            originalSize: file.size,
            finalSize: blob.size,
        };
    } catch (error) {
        console.error('Error protecting PDF:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error protecting PDF file',
        };
    }
}
