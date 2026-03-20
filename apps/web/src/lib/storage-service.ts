import fs from "fs/promises";
import path from "path";
import { db } from "@/lib/db";

export type StorageProvider = 'LOCAL' | 'R2';

export interface UploadOptions {
    userId: string;
    file: File;
    prefix?: string;
}

class StorageService {
    private provider: StorageProvider = (process.env.STORAGE_PROVIDER as StorageProvider) || 'LOCAL';

    async upload({ userId, file, prefix = 'uploads' }: UploadOptions) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const timestamp = Date.now();
        const safeName = file.name.replace(/\s+/g, "_");
        const storageKey = `${timestamp}-${safeName}`;

        if (this.provider === 'LOCAL') {
            const uploadDir = path.join(process.cwd(), "public", prefix);
            const uploadPath = path.join(uploadDir, storageKey);

            // Ensure directory exists
            try {
                await fs.access(uploadDir);
            } catch {
                await fs.mkdir(uploadDir, { recursive: true });
            }

            await fs.writeFile(uploadPath, buffer);
            
            return {
                storageKey,
                fileName: file.name,
                url: `/public/${prefix}/${storageKey}`
            };
        }

        if (this.provider === 'R2') {
            // TODO: Implement R2/S3 upload logic using @aws-sdk/client-s3
            throw new Error("R2 Provider not implemented yet");
        }

        throw new Error(`Unsupported storage provider: ${this.provider}`);
    }

    async delete(storageKey: string, prefix = 'uploads') {
        if (this.provider === 'LOCAL') {
            const filePath = path.join(process.cwd(), "public", prefix, storageKey);
            try {
                await fs.unlink(filePath);
                return true;
            } catch (error) {
                console.error(`[STORAGE_DELETE_ERROR] Could not delete ${storageKey}:`, error);
                return false;
            }
        }

        if (this.provider === 'R2') {
            // TODO: Implement R2 delete
            throw new Error("R2 Provider not implemented yet");
        }

        return false;
    }

    getDownloadPath(storageKey: string, prefix = 'uploads') {
        if (this.provider === 'LOCAL') {
            return path.join(process.cwd(), "public", prefix, storageKey);
        }
        // For R2 would return a signed URL or public URL
        return null;
    }
}

export const storageService = new StorageService();
