/**
 * File validation and conversion utilities for workspace uploads.
 */

const LIMITS = {
    free: { maxFileSize: 10 * 1024 * 1024, maxFiles: 3 },   // 10MB, 3 files
    pro: { maxFileSize: 50 * 1024 * 1024, maxFiles: 10 },   // 50MB, 10 files
} as const;

type Tier = keyof typeof LIMITS;

export interface FilePayload {
    name: string;
    type: string;
    base64: string;
    size: number;
}

export interface ValidationResult {
    valid: boolean;
    errors: string[];
}

/**
 * Validate files against tier limits.
 */
export function validateFiles(files: File[], tier: Tier = 'free'): ValidationResult {
    const limits = LIMITS[tier];
    const errors: string[] = [];

    if (files.length > limits.maxFiles) {
        errors.push(`Maximum ${limits.maxFiles} files allowed (${tier} tier). You selected ${files.length}.`);
    }

    for (const file of files) {
        if (file.size > limits.maxFileSize) {
            const maxMB = Math.round(limits.maxFileSize / (1024 * 1024));
            const fileMB = (file.size / (1024 * 1024)).toFixed(1);
            errors.push(`"${file.name}" is ${fileMB}MB — max ${maxMB}MB per file (${tier} tier).`);
        }
    }

    return { valid: errors.length === 0, errors };
}

/**
 * Convert a File to base64 string.
 */
export function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            // Strip the data URL prefix (e.g. "data:application/pdf;base64,")
            const base64 = result.split(',')[1] || result;
            resolve(base64);
        };
        reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
        reader.readAsDataURL(file);
    });
}

/**
 * Convert File[] to FilePayload[] for API submission.
 */
export async function filesToPayload(files: File[]): Promise<FilePayload[]> {
    return Promise.all(
        files.map(async (file) => ({
            name: file.name,
            type: file.type || 'application/octet-stream',
            base64: await fileToBase64(file),
            size: file.size,
        }))
    );
}
