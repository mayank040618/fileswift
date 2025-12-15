
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';

const API_URL = process.env.API_URL || 'http://localhost:8080';

async function checkHealth() {
    try {
        const res = await axios.get(`${API_URL}/api/health/upload`);
        console.log('[Health] Check:', res.data);
        if (!res.data.uploadReady) throw new Error("Upload not ready");
    } catch (e) {
        console.error('[Health] Failed:', e.message);
        process.exit(1);
    }
}

async function uploadFile() {
    console.log('[Upload] Starting...');
    const form = new FormData();
    const filePath = path.join(__dirname, 'test-file.txt');

    // Create dummy file
    fs.writeFileSync(filePath, 'Hello World ' + Date.now());

    form.append('files', fs.createReadStream(filePath));
    form.append('toolId', 'default');

    try {
        const headers = form.getHeaders();
        // Add Content-Length
        const stat = fs.statSync(filePath);
        // Approximation of full body size for check, axios handles it usually but we can be explicit if needed.
        // But FormData handles it.

        const res = await axios.post(`${API_URL}/upload`, form, {
            headers: { ...headers },
            timeout: 10000 // 10s
        });

        console.log('[Upload] Success:', res.data);

        if (!res.data.uploadId || !res.data.jobId) {
            throw new Error("Missing uploadId or jobId");
        }

        // Poll Status using UploadId
        console.log(`[Status] Polling UploadStatus for ${res.data.uploadId}...`);
        const statusRes = await axios.get(`${API_URL}/api/upload-status/${res.data.uploadId}`);
        console.log('[Status] Result:', statusRes.data);

        if (statusRes.data.status !== 'processing' && statusRes.data.status !== 'completed') {
            throw new Error("Expected status processing or completed");
        }

    } catch (e) {
        console.error('[Upload] Failed:', e.response?.data || e.message);
        process.exit(1);
    } finally {
        fs.unlinkSync(filePath);
    }
}

async function run() {
    await checkHealth();
    await uploadFile();
    console.log('✅ Smoke Check Passed');
}

run();
