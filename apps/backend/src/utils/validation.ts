import fs from 'fs-extra';

/**
 * Validates if a file is a PDF by checking its magic bytes (%PDF)
 * Reads the first 1024 bytes to find the header.
 */
export async function isValidPdf(filePath: string): Promise<boolean> {
    try {
        const exists = await fs.pathExists(filePath);
        if (!exists) return false;

        const fd = await fs.open(filePath, 'r');
        const buffer = Buffer.alloc(10); // Check first 10 bytes is enough for %PDF
        await fs.read(fd, buffer, 0, 10, 0);
        await fs.close(fd);

        // PDF Header usually starts with %PDF-
        // regex to check for %PDF- at start
        const header = buffer.toString('utf8');
        return header.includes('%PDF-');
    } catch (e) {
        console.error(`[validation] Failed to check PDF validity for ${filePath}:`, e);
        return false;
    }
}

/**
 * Sanitizes a filename to prevent shell injection and path traversal.
 * Removes non-alphanumeric characters except -_.
 */
export function sanitizeFilename(filename: string): string {
    return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
}
