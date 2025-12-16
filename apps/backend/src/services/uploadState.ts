import { redisPersistence } from './redisPersistence';
import { v4 as uuidv4 } from 'uuid';

interface UploadStatus {
    status: 'accepted' | 'uploading' | 'processing' | 'completed' | 'failed' | 'failed_recoverable';
    uploadId: string;
    jobId?: string;
    progress?: number;
    error?: string;
    errorCode?: string;
    updatedAt: number;
}

export const uploadState = {
    set: async (id: string, state: Partial<UploadStatus>) => {
        // Optimistic / Fire-and-forget for speed if needed, but awaiting is safer for persistence
        const existing = await redisPersistence.getUploadStatus(id) || {
            uploadId: id,
            status: 'accepted',
            updatedAt: Date.now()
        };
        // @ts-ignore
        await redisPersistence.saveUploadStatus(id, { ...existing, ...state, updatedAt: Date.now() });
    },
    get: async (id: string) => {
        return await redisPersistence.getUploadStatus(id);
    },
    delete: async (id: string) => {
        // Redis TTL handles cleanup mostly, but we can expire immediately if needed. 
        // For now, let's just leave it to TTL or implement explicit del if critical.
    },
    createDownloadToken: async (filePath: string): Promise<string> => {
        const token = uuidv4();
        // Valid for 1 hour
        await redisPersistence.saveDownloadToken(token, { path: filePath, expires: Date.now() + 3600 * 1000 });
        return token;
    },
    verifyDownloadToken: async (token: string): Promise<string | null> => {
        const data = await redisPersistence.getDownloadToken(token);
        if (!data) return null;
        if (Date.now() > data.expires) {
            await redisPersistence.deleteDownloadToken(token);
            return null;
        }
        return data.path;
    }
};
