


export interface UploadProgress {
    loaded: number;
    total: number;
    percent: number;
}

export type UploadStatus = 'idle' | 'uploading' | 'processing' | 'completed' | 'failed';

// --- Helpers ---

// Exponential Backoff with Jitter
// Delays: ~1s, ~2s, ~4s, ~8s... + Random 0-500ms
const calculateBackoff = (attempt: number): number => {
    const baseDelay = 1000 * Math.pow(2, attempt - 1); // 1s, 2s, 4s...
    const jitter = Math.random() * 500; // 0-500ms jitter
    return Math.min(baseDelay + jitter, 30000); // Max 30s delay
};

const logger = {
    info: (id: string, msg: string, data?: any) => console.log(`[Upload ${id.slice(0, 8)}] ℹ️ ${msg}`, data || ''),
    warn: (id: string, msg: string, data?: any) => console.warn(`[Upload ${id.slice(0, 8)}] ⚠️ ${msg}`, data || ''),
    error: (id: string, msg: string, data?: any) => console.error(`[Upload ${id.slice(0, 8)}] ❌ ${msg}`, data || '')
};

export class ChunkedUploader {
    private file: File;
    private uploadId: string;
    private toolId: string;
    private chunkSize = 1024 * 1024; // 1MB
    private apiBase: string;
    private maxRetries = 5; // Increased resilience
    private aborted = false;

    constructor(file: File, toolId: string, apiBase: string, uploadId?: string) {
        this.file = file;
        this.toolId = toolId;
        this.apiBase = apiBase;
        this.uploadId = uploadId || crypto.randomUUID();
        logger.info(this.uploadId, 'Initialized ChunkedUploader', { size: file.size, chunks: Math.ceil(file.size / this.chunkSize) });
    }

    async start(onProgress: (p: UploadProgress) => void, data?: any): Promise<{ jobId: string; uploadId: string }> {
        // 1. Check for resume
        const alreadyUploaded = await this.getUploadedChunks();
        if (alreadyUploaded.length > 0) {
            logger.info(this.uploadId, `Resuming. Already uploaded: ${alreadyUploaded.length} chunks`);
        }

        const totalChunks = Math.ceil(this.file.size / this.chunkSize);
        let uploaded = 0;

        // Calculate initial progress based on verified chunks
        alreadyUploaded.forEach(idx => {
            const start = idx * this.chunkSize;
            const end = Math.min(start + this.chunkSize, this.file.size);
            uploaded += (end - start);
        });

        // 2. Visibility Listener (Mobile Backgrounding)
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && !this.aborted && uploaded < this.file.size) {
                logger.info(this.uploadId, 'Tab visible. Connectivity check skipped (relying on retry loop).');
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        try {
            for (let i = 0; i < totalChunks; i++) {
                if (this.aborted) throw new Error('UPLOAD_CANCELLED');

                if (alreadyUploaded.includes(i)) {
                    continue; // Skip
                }

                const start = i * this.chunkSize;
                const end = Math.min(start + this.chunkSize, this.file.size);
                const chunk = this.file.slice(start, end);

                // Upload Chunk
                await this.uploadChunkWithRetry(chunk, i);

                uploaded += chunk.size;
                const percent = Math.round((uploaded / this.file.size) * 100);
                onProgress({ loaded: uploaded, total: this.file.size, percent });
            }

            // Complete
            logger.info(this.uploadId, 'All chunks sent. Completing upload...');
            return await this.completeUpload(totalChunks, data);

        } catch (e: any) {
            logger.error(this.uploadId, 'Upload flow failed', e.message);
            throw e;
        } finally {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        }
    }

    private async getUploadedChunks(): Promise<number[]> {
        try {
            // If new upload (no ID), nothing to resume
            // Currently calling code sets uploadId only if resuming, but here we enforce `this.uploadId` from constructor
            // ID is generated in constructor. If we want cross-session resume, we need localstorage management outside this class.
            // For now, this handles "retry within same session" or "network switch".

            const res = await fetch(`${this.apiBase}/api/upload/${this.uploadId}/chunks`);
            if (res.ok) {
                const data = await res.json();
                return data.chunks || [];
            }
        } catch (e) {
            logger.warn(this.uploadId, "Failed to check resume status", e);
        }
        return [];
    }

    abort() {
        this.aborted = true;
        logger.warn(this.uploadId, 'Upload aborted by user');
    }

    private async uploadChunkWithRetry(chunk: Blob, index: number) {
        let attempts = 0;
        while (attempts < this.maxRetries) {
            try {
                await this.uploadChunk(chunk, index);
                return;
            } catch (e: any) {
                attempts++;

                // Don't retry on 4xx (except 408/429)
                if (e.status && e.status >= 400 && e.status < 500 && ![408, 429].includes(e.status)) {
                    throw e;
                }

                if (attempts >= this.maxRetries) throw e;

                const delay = calculateBackoff(attempts);
                logger.warn(this.uploadId, `Chunk ${index} failed (Attempt ${attempts}/${this.maxRetries}). Retrying in ${Math.round(delay)}ms...`, e.message);
                await new Promise(r => setTimeout(r, delay));
            }
        }
    }

    private uploadChunk(chunk: Blob, index: number): Promise<void> {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', `${this.apiBase}/api/upload/chunk`);
            // xhr.timeout = 60000; // 60s per chunk

            const formData = new FormData();
            formData.append('uploadId', this.uploadId);
            formData.append('index', index.toString());
            formData.append('file', chunk);

            xhr.onload = () => {
                if (xhr.status === 200) {
                    resolve();
                } else {
                    const err: any = new Error(`Chunk upload failed: ${xhr.status}`);
                    err.status = xhr.status;
                    reject(err);
                }
            };

            xhr.onerror = () => reject(new Error('Network Error'));
            xhr.ontimeout = () => reject(new Error('Timeout'));

            xhr.send(formData);
        });
    }

    private async completeUpload(totalChunks: number, data?: any): Promise<{ jobId: string; uploadId: string }> {
        const res = await fetch(`${this.apiBase}/api/upload/complete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                uploadId: this.uploadId,
                toolId: this.toolId,
                filename: this.file.name,
                totalChunks,
                data: data || {}
            })
        });

        if (!res.ok) {
            let errorMsg = 'Merge Failed';
            try {
                const errJson = await res.json();
                errorMsg = errJson.error || errorMsg;
            } catch { }
            throw new Error(errorMsg);
        }

        const resData = await res.json();
        return { jobId: resData.jobId, uploadId: this.uploadId };
    }
}

export class XHRUploader {
    private files: File[];
    private toolId: string;
    private apiBase: string;
    private xhr: XMLHttpRequest | null = null;
    public uploadId: string;

    constructor(files: File[] | File, toolId: string, apiBase: string) {
        this.files = Array.isArray(files) ? files : [files];
        this.toolId = toolId;
        this.apiBase = apiBase;
        this.uploadId = crypto.randomUUID();
        logger.info(this.uploadId, 'Initialized XHRUploader', { count: this.files.length });
    }

    async start(onProgress: (p: UploadProgress) => void, data?: any): Promise<{ jobId: string; uploadId: string }> {
        let attempts = 0;
        const maxRetries = 3;

        while (attempts < maxRetries) {
            try {
                return await this.uploadAttempt(onProgress, data);
            } catch (error: any) {
                attempts++;

                // Don't retry on client errors (4xx) except 429
                if (error.status && error.status >= 400 && error.status < 500 && error.status !== 429) {
                    logger.error(this.uploadId, 'Fatal Client Error', error.message);
                    throw error;
                }

                if (attempts >= maxRetries) throw error;

                const delay = calculateBackoff(attempts);
                logger.warn(this.uploadId, `Upload failed (Attempt ${attempts}/${maxRetries}). Retrying in ${Math.round(delay)}ms...`, error.message);
                await new Promise(r => setTimeout(r, delay));
            }
        }
        throw new Error('Upload failed after retries');
    }

    private uploadAttempt(onProgress: (p: UploadProgress) => void, data?: any): Promise<{ jobId: string; uploadId: string }> {
        return new Promise((resolve, reject) => {
            this.xhr = new XMLHttpRequest();
            this.xhr.open('POST', `${this.apiBase}/api/upload`);
            this.xhr.timeout = 180000; // 3 minutes for desktop

            // Critical: Disable abort on visibility change handled by browser? 
            // We just ensure we don't call .abort() ourselves unless user clicks cancel.

            this.xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                    const percent = Math.round((e.loaded / e.total) * 100);
                    onProgress({ loaded: e.loaded, total: e.total, percent });
                }
            };

            this.xhr.onload = () => {
                if (this.xhr && this.xhr.status >= 200 && this.xhr.status < 300) {
                    try {
                        const res = JSON.parse(this.xhr.responseText);
                        logger.info(this.uploadId, 'Upload successful', { jobId: res.jobId });
                        resolve({ jobId: res.jobId, uploadId: res.uploadId });
                    } catch (e) {
                        reject(new Error('Invalid JSON response'));
                    }
                } else {
                    const err: any = new Error(this.xhr ? `Upload failed: ${this.xhr.statusText}` : 'Upload failed');
                    err.status = this.xhr ? this.xhr.status : 0;
                    reject(err);
                }
            };

            this.xhr.onerror = () => reject(new Error('Network Error')); // Status 0, so will retry
            this.xhr.ontimeout = () => reject(new Error('Connection Timeout'));
            this.xhr.onabort = () => reject(new Error('UPLOAD_CANCELLED'));

            const formData = new FormData();
            formData.append('toolId', this.toolId);
            formData.append('uploadId', this.uploadId);
            this.files.forEach(f => formData.append('files', f));
            if (data) {
                formData.append('data', JSON.stringify(data));
            }

            this.xhr.send(formData);
        });
    }

    abort() {
        if (this.xhr) {
            this.xhr.abort();
            logger.warn(this.uploadId, 'Upload aborted by user');
        }
    }
}
