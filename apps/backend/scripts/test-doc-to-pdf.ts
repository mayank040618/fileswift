
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const API_URL = process.env.API_URL || 'http://localhost:8080';

async function testDocToPdf() {
    console.log('[Test] Starting Doc to PDF verification...');

    const sourcePath = path.join(__dirname, '..', 'valid_test.doc');
    // Ensure the file exists
    if (!fs.existsSync(sourcePath)) {
        // Create it if it doesn't exist, just for the test
        fs.writeFileSync(sourcePath, 'Dummy content for doc conversion test');
    }

    const form = new FormData();
    form.append('files', fs.createReadStream(sourcePath));
    form.append('toolId', 'doc-to-pdf'); // Correct ID

    try {
        console.log('[Upload] Sending file...');
        const res = await axios.post(`${API_URL}/api/upload`, form, {
            headers: { ...form.getHeaders() }
        });

        console.log('[Upload] Response:', res.data);
        const { jobId } = res.data;

        if (!jobId) throw new Error('No jobId received');

        console.log(`[Status] Polling job ${jobId}...`);

        let status = 'processing';
        let attempts = 0;

        while (status === 'processing' && attempts < 20) {
            await new Promise(r => setTimeout(r, 1000));
            try {
                const statusRes = await axios.get(`${API_URL}/api/jobs/${jobId}/status`);
                status = statusRes.data.status;
                console.log(`[Status] ${status} (${statusRes.data.progress || 0}%)`);

                if (status === 'completed') {
                    console.log('[Success] Job completed! Download URL:', statusRes.data.downloadUrl);
                    return;
                }
                if (status === 'failed') {
                    console.error('[Failed] Job failed:', statusRes.data.error);
                    process.exit(1);
                }
            } catch (pollErr: any) {
                console.warn(`[Poll Warning] ${pollErr.message}`);
                // Continue polling if 404 or network hiccup, but here backend should be stable
            }
            attempts++;
        }
        console.error('[Timeout] Job timed out');
        process.exit(1);

    } catch (e: any) {
        console.error('[Error]', e.response?.data || e.message);
        process.exit(1);
    }
}

testDocToPdf();
