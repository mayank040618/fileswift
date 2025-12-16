import { getRedisClient } from './redis-retry';

interface UploadStatus {
    status: 'accepted' | 'uploading' | 'processing' | 'completed' | 'failed' | 'failed_recoverable';
    uploadId: string;
    jobId?: string;
    progress?: number;
    error?: string;
    errorCode?: string;
    updatedAt: number;
}

interface DownloadToken {
    path: string;
    expires: number;
}

const PREFIX_STATUS = 'fs:status:';
const PREFIX_TOKEN = 'fs:token:';

export const redisPersistence = {
    saveUploadStatus: async (id: string, state: UploadStatus) => {
        const client = getRedisClient();
        if (!client) return; // Should not happen if confirmed connected, but safe guard

        const key = `${PREFIX_STATUS}${id}`;
        // Expire in 24 hours
        await client.setex(key, 24 * 60 * 60, JSON.stringify(state));
    },

    getUploadStatus: async (id: string): Promise<UploadStatus | null> => {
        const client = getRedisClient();
        if (!client) return null;

        const data = await client.get(`${PREFIX_STATUS}${id}`);
        if (!data) return null;
        try {
            return JSON.parse(data);
        } catch {
            return null;
        }
    },

    saveDownloadToken: async (token: string, data: DownloadToken) => {
        const client = getRedisClient();
        if (!client) return;

        const key = `${PREFIX_TOKEN}${token}`;
        // TTL based on expire time, but let's just use strict 1 hour for Redis TTL too
        const ttlSeconds = Math.ceil((data.expires - Date.now()) / 1000);
        if (ttlSeconds > 0) {
            await client.setex(key, ttlSeconds, JSON.stringify(data));
        }
    },

    getDownloadToken: async (token: string): Promise<DownloadToken | null> => {
        const client = getRedisClient();
        if (!client) return null;

        const data = await client.get(`${PREFIX_TOKEN}${token}`);
        if (!data) return null;
        try {
            return JSON.parse(data);
        } catch {
            return null;
        }
    },

    deleteDownloadToken: async (token: string) => {
        const client = getRedisClient();
        if (!client) return;
        await client.del(`${PREFIX_TOKEN}${token}`);
    }
};
