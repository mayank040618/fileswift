
export interface UploadProgress {
    loaded: number;
    total: number;
    percent: number;
}

export class DirectUploader {
    private file: File;
    private toolId: string;
    private apiBase: string;
    private uploadId: string | null = null;
    // private abortController: AbortController | null = null; // Removed to fix build error

    constructor(file: File, toolId: string, apiBase: string) {
        this.file = file;
        this.toolId = toolId;
        this.apiBase = apiBase;
    }

    async start(onProgress: (p: UploadProgress) => void, data?: any): Promise<{ jobId: string; uploadId: string }> {
        // 1. INIT
        console.log('[DirectUpload] Initializing...');
        const initRes = await fetch(`${this.apiBase}/api/upload/init`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                filename: this.file.name,
                contentType: this.file.type || 'application/octet-stream',
                size: this.file.size,
                toolId: this.toolId
            })
        });

        if (!initRes.ok) throw new Error('Failed to initialize upload');
        const initData = await initRes.json();

        this.uploadId = initData.uploadId;
        const uploadUrl = initData.uploadUrl;
        const method = initData.method || 'PUT';
        const headers = initData.requiredHeaders || {};

        // 2. UPLOAD (Binary)
        console.log('[DirectUpload] Uploading binary...', { url: uploadUrl });

        await this.uploadBinary(uploadUrl, method, headers, onProgress);

        // 3. CONFIRM
        console.log('[DirectUpload] Confirming...');
        const confirmRes = await fetch(`${this.apiBase}/api/upload/confirm`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                uploadId: this.uploadId,
                toolId: this.toolId,
                key: initData.key,
                filename: this.file.name,
                data: data || {}
            })
        });

        if (!confirmRes.ok) throw new Error('Failed to create job');
        const confirmData = await confirmRes.json();

        return { jobId: confirmData.jobId, uploadId: this.uploadId! };
    }

    private uploadBinary(url: string, method: string, headers: Record<string, string>, onProgress: (p: UploadProgress) => void): Promise<void> {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open(method, url);

            // Apply Headers
            Object.entries(headers).forEach(([k, v]) => {
                xhr.setRequestHeader(k, v as string);
            });

            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                    const percent = Math.round((e.loaded / e.total) * 100);
                    onProgress({ loaded: e.loaded, total: e.total, percent });
                }
            };

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve();
                } else {
                    reject(new Error(`Upload failed: ${xhr.statusText}`));
                }
            };

            xhr.onerror = () => reject(new Error('Network Error'));
            xhr.ontimeout = () => reject(new Error('Timeout'));

            // this.abortController = new AbortController(); // Removed
            xhr.send(this.file);
        });
    }

    abort() {
        console.warn('[DirectUpload] Abort requested (Not fully implemented on XHR yet)');
    }
}
