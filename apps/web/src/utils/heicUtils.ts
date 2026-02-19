import heic2any from 'heic2any';

/**
 * Checks if a file is an Apple HEIC/HEIF image format.
 */
export const isHeic = (file: File): boolean => {
    if (!file) return false;

    // Check MIME type first (Safari might provide this, Chrome might give empty string)
    if (file.type === 'image/heic' || file.type === 'image/heif') {
        return true;
    }

    // Fallback to extension check for browsers that don't recognize the MIME type
    const name = file.name.toLowerCase();
    return name.endsWith('.heic') || name.endsWith('.heif');
};

/**
 * Intercepts HEIC files and converts them to standard JPEGs.
 * If the file is not HEIC, it returns the original file.
 */
export const convertHeicToJpeg = async (file: File): Promise<File> => {
    if (!isHeic(file)) {
        return file; // No conversion needed
    }

    try {
        console.log(`Converting HEIC file: ${file.name}`);

        // heic2any returns Blob | Blob[] depending on 'multiple' option (disabled by default)
        const convertedBlob = await heic2any({
            blob: file,
            toType: 'image/jpeg',
            quality: 0.8 // Good balance of quality/speed for intermediaries
        }) as Blob;

        // Retain original filename but change extension to .jpeg
        const newFilename = file.name.replace(/\.hei[cf]$/i, '.jpeg');

        // Reconstruct a File object for consistency with other processors
        return new File([convertedBlob], newFilename, {
            type: 'image/jpeg',
            lastModified: Date.now()
        });

    } catch (error) {
        console.error(`Failed to convert HEIC image ${file.name}:`, error);
        throw new Error(`Failed to process HEIC file: ${file.name}. Ensure the file is not corrupted.`);
    }
};
