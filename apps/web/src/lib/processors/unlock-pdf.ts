import { PDFDocument } from 'pdf-lib-plus-encrypt';
import type { ProcessorResult } from './index';

export async function unlockPDF(
    files: File[],
    password?: string,
    onProgress?: (progress: number) => void
): Promise<ProcessorResult> {
    if (files.length === 0) {
        return { success: false, error: 'No files provided for unlocking' };
    }

    if (!password) {
        return { success: false, error: 'Password is required to unlock PDF' };
    }

    try {
        if (onProgress) onProgress(10);

        const file = files[0];
        const arrayBuffer = await file.arrayBuffer();

        if (onProgress) onProgress(30);

        // Load the document using the provided password
        let pdfDoc;
        try {
            pdfDoc = await PDFDocument.load(arrayBuffer, { password: password } as any);
        } catch (error: any) { // eslint-disable-line
            console.error("PDF load error:", error);
            // pdf-lib throws an error when the password is not provided or incorrect.
            // Check specifically for incorrect password errors based on pdf-lib's internals if needed, 
            // but generally, an error during load with a password implies it failed decryption.
            if (error.message && error.message.includes('password')) {
                return { success: false, error: 'Incorrect password. Unable to unlock PDF.' };
            }
            throw error; // Re-throw if it wasn't a password error
        }

        if (onProgress) onProgress(60);

        // By saving it without the `userPassword` or `ownerPassword` options, 
        // the encryption is completely removed from the newly saved file.
        const unlockedPdfBytes = await pdfDoc.save({ useObjectStreams: false });

        if (onProgress) onProgress(90);

        const blob = new Blob([unlockedPdfBytes as any], { type: 'application/pdf' });

        // Generate a new filename with an indicator
        const originalName = file.name;
        const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
        const newFilename = `${nameWithoutExt}-unlocked.pdf`;

        if (onProgress) onProgress(100);

        return {
            success: true,
            blob,
            filename: newFilename,
            originalSize: file.size,
            finalSize: blob.size,
        };
    } catch (error) {
        console.error('Error unlocking PDF:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error unlocking PDF file. Note: This tool removes known passwords, it does not crack them.',
        };
    }
}
