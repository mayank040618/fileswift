
import { ProcessorResult } from './index';

export async function removeBackground(
    file: File,
    onProgress?: (progress: number) => void
): Promise<ProcessorResult> {
    try {
        // Dynamic import to avoid SSR issues
        // Dynamic import to avoid SSR issues
        if (typeof window === 'undefined') {
            throw new Error('Background removal can only be run in the browser.');
        }
        const imgly = await import('@imgly/background-removal');

        // Configuration to force download of assets if needed or use public path
        const config = {
            progress: (key: string, current: number, total: number) => {
                const percent = Math.round((current / total) * 100);
                if (key.includes('model') || key.includes('wasm')) {
                    // Downloading assets phase (0-50%)
                    onProgress?.(Math.round(percent / 2));
                } else {
                    // Processing phase (50-100%)
                    onProgress?.(50 + Math.round(percent / 2));
                }
            },
            debug: true
        };

        const blob = await imgly.removeBackground(file, config);

        return {
            success: true,
            blob: blob,
            filename: `nobg-${file.name.replace(/\.[^/.]+$/, "")}.png`,
            originalSize: file.size,
            finalSize: blob.size
        };

    } catch (error: any) {
        console.error('Background removal error:', error);
        return {
            success: false,
            error: error.message || 'Failed to remove background'
        };
    }
}
