import { ProcessorResult } from './index';
import { convertHeicToJpeg } from '@/utils/heicUtils';

export const resizeImage = async (
    rawFile: File,
    options: {
        width?: number;
        height?: number;
    }
): Promise<ProcessorResult> => {
    return new Promise(async (resolve, reject) => {
        try {
            // Intercept and convert HEIC files
            const file = await convertHeicToJpeg(rawFile);

            const currentUrl = URL.createObjectURL(file);
            const img = new Image();

            img.onload = () => {
                const canvas = document.createElement('canvas');
                let targetWidth = options.width || img.width;
                let targetHeight = options.height || img.height;

                if (options.width && !options.height) {
                    targetHeight = Math.round(img.height * (options.width / img.width));
                } else if (options.height && !options.width) {
                    targetWidth = Math.round(img.width * (options.height / img.height));
                }

                canvas.width = targetWidth;
                canvas.height = targetHeight;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    throw new Error('Failed to get canvas context');
                }

                ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

                canvas.toBlob(
                    (blob) => {
                        URL.revokeObjectURL(currentUrl);
                        if (blob) {
                            resolve({ success: true, blob });
                        } else {
                            reject(new Error('Failed to create blob from canvas'));
                        }
                    },
                    file.type || 'image/png',
                    1.0
                );
            };

            img.onerror = () => {
                URL.revokeObjectURL(currentUrl);
                reject(new Error('Failed to load image'));
            };

            img.src = currentUrl;
        } catch (error) {
            reject(error);
        }
    });
};

export const resizeImages = async (
    files: File[],
    options: {
        width?: number;
        height?: number;
    }
): Promise<ProcessorResult[]> => {
    return Promise.all(files.map((file) => resizeImage(file, options)));
};
