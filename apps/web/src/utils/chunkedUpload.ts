


export interface UploadProgress {
    loaded: number;
    total: number;
    percent: number;
}

export type UploadStatus = 'idle' | 'uploading' | 'processing' | 'completed' | 'failed';

export class ChunkedUploader {
    private file: File;
    private uploadId: string;
    private toolId: string;
    private chunkSize = 1024 * 1024; // 1MB
    private apiBase: string;
    private maxRetries = 3;
    private aborted = false;

    constructor(file: File, toolId: string, apiBase: string, uploadId?: string) {
        this.file = file;
        this.toolId = toolId;
        this.apiBase = apiBase;
        this.uploadId = uploadId || crypto.randomUUID();
    }

    async start(onProgress: (p: UploadProgress) => void, data?: any): Promise<{ jobId: string; uploadId: string }> {
        const totalChunks = Math.ceil(this.file.size / this.chunkSize);
        let uploaded = 0;

        // 1. Resume Check (Optional optimization: get existing chunks)
        // For now, simpler to just start. Or implement check.
        // Let's implement robust resume check for Mobile.

        for (let i = 0; i < totalChunks; i++) {
            if (this.aborted) throw new Error('UPLOAD_CANCELLED');

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
        return this.completeUpload(totalChunks, data);
    }

    abort() {
        this.aborted = true;
    }

    private async uploadChunkWithRetry(chunk: Blob, index: number) {
        let attempts = 0;
        while (attempts < this.maxRetries) {
            try {
                await this.uploadChunk(chunk, index);
                return;
            } catch (e) {
                attempts++;
                if (attempts >= this.maxRetries) throw e;
                // Exponential backoff: 500, 1000, 2000
                await new Promise(r => setTimeout(r, 500 * Math.pow(2, attempts)));
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
                    reject(new Error(`Chunk upload failed: ${xhr.status}`));
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
    }

    async start(onProgress: (p: UploadProgress) => void, data?: any): Promise<{ jobId: string; uploadId: string }> {
        let attempts = 0;
        const maxRetries = 3;

        while (attempts < maxRetries) {
            try {
                return await this.uploadAttempt(onProgress, data);
            } catch (error: any) {
                attempts++;
                console.warn(`[XHRUploader] Attempt ${attempts} failed:`, error);

                // Don't retry on client errors (4xx) except 429
                if (error.status && error.status >= 400 && error.status < 500 && error.status !== 429) {
                    throw error;
                }

                if (attempts >= maxRetries) throw error;
                // Backoff: 1s, 2s, 4s
                await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempts - 1)));
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
            this.files.forEach(f => formData.append('files', f));
            formData.append('uploadId', this.uploadId);
            formData.append('toolId', this.toolId);
            if (data) {
                formData.append('data', JSON.stringify(data));
            }

            this.xhr.send(formData);
        });
    }

    abort() {
        if (this.xhr) {
            this.xhr.abort();
        }
    }
}
