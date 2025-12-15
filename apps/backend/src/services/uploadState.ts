import { persistence } from './persistence';
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

interface DownloadToken {
    path: string;
    expires: number;
}

// Load initial state
const persisted = persistence.load();
const statusStore = new Map<string, UploadStatus>(persisted ? persisted.status : []);
const tokenStore = new Map<string, DownloadToken>(persisted ? persisted.tokens : []);

console.log(`[UploadState] Recovered ${statusStore.size} uploads and ${tokenStore.size} tokens`);

// Mark stuck 'uploading' as failed on startup
for (const [id, state] of statusStore.entries()) {
    if (state.status === 'uploading') {
        state.status = 'failed';
        state.error = 'Upload interrupted (Server Restart)';
        state.errorCode = 'NETWORK_ABORT';
        statusStore.set(id, state);
    }
}

const saveState = () => {
    persistence.save({
        status: Array.from(statusStore.entries()),
        tokens: Array.from(tokenStore.entries())
    });
};

// Cleanup old statuses every 1 hour
setInterval(() => {
    const now = Date.now();
    let changed = false;
    for (const [key, value] of statusStore.entries()) {
        if (now - value.updatedAt > 24 * 3600 * 1000) { // Keep for 24 hours for resume
            statusStore.delete(key);
            changed = true;
        }
    }
    for (const [key, value] of tokenStore.entries()) {
        if (now > value.expires) {
            tokenStore.delete(key);
            changed = true;
        }
    }
    if (changed) saveState();
}, 3600 * 1000);

// Save immediately on startup to persist the cleanup of stuck uploads
saveState();

export const uploadState = {
    set: (id: string, state: Partial<UploadStatus>) => {
        const existing = statusStore.get(id) || {
            uploadId: id,
            status: 'accepted',
            updatedAt: Date.now()
        };
        statusStore.set(id, { ...existing, ...state, updatedAt: Date.now() });
        saveState();
    },
    get: (id: string) => statusStore.get(id),
    delete: (id: string) => {
        statusStore.delete(id);
        saveState();
    },
    createDownloadToken: (filePath: string): string => {
        const token = uuidv4();
        // Valid for 1 hour
        tokenStore.set(token, { path: filePath, expires: Date.now() + 3600 * 1000 });
        saveState();
        return token;
    },
    verifyDownloadToken: (token: string): string | null => {
        const data = tokenStore.get(token);
        if (!data) return null;
        if (Date.now() > data.expires) {
            tokenStore.delete(token);
            saveState();
            return null;
        }
        return data.path;
    }
};
