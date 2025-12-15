
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const API_URL = process.env.API_URL || 'http://localhost:8080';

async function testMobileChunkedUpload() {
    console.log('[Mobile] Starting Chunked Upload Verification...');

    // 1. Create a > 1MB dummy file
    const filePath = path.join(__dirname, 'mobile-test.bin');
    const buffer = Buffer.alloc(2.5 * 1024 * 1024); // 2.5MB
    buffer.fill('X');
    fs.writeFileSync(filePath, buffer);

    const uploadId = uuidv4();
    const chunkSize = 1024 * 1024; // 1MB
    const totalChunks = Math.ceil(buffer.length / chunkSize);

    console.log(`[Mobile] ID: ${uploadId}, Chunks: ${totalChunks}`);

    try {
        // 2. Upload Chunks
        for (let i = 0; i < totalChunks; i++) {
            const start = i * chunkSize;
            const end = Math.min(start + chunkSize, buffer.length);
            const chunkBuffer = buffer.subarray(start, end);

            // Retrying logic simulation
            let attempts = 0;
            while (attempts < 3) {
                try {
                    const form = new FormData();
                    form.append('uploadId', uploadId);
                    form.append('index', i.toString());
                    form.append('file', chunkBuffer, { filename: 'blob' });

                    // Simulate flaky network randomly (skip 1st attempt of 2nd chunk)
                    if (i === 1 && attempts === 0) {
                        console.log(`[Mobile] Simulating network drop for chunk ${i}...`);
                        throw new Error("Simulated Network Error");
                    }

                    await axios.post(`${API_URL}/api/upload/chunk`, form, {
                        headers: { ...form.getHeaders() }
                    });
                    console.log(`[Mobile] Chunk ${i}/${totalChunks - 1} Uploaded`);
                    break;
                } catch (e) {
                    attempts++;
                    console.log(`[Mobile] Retry ${attempts} for chunk ${i}`);
                    if (attempts >= 3) throw e;
                    await new Promise(r => setTimeout(r, 500));
                }
            }
        }

        // 3. Complete
        console.log('[Mobile] Sending Complete...');
        const res = await axios.post(`${API_URL}/api/upload/complete`, {
            uploadId,
            toolId: 'compress-pdf',
            filename: 'mobile-test.bin',
            totalChunks
        });

        const { jobId } = res.data;
        console.log(`[Mobile] Completed. Job ID: ${jobId}`);

        // 4. Poll
        let status = 'processing';
        while (status === 'processing') {
            const s = await axios.get(`${API_URL}/api/jobs/${jobId}/status`);
            status = s.data.status;
            console.log(`[Status] ${status}`);
            if (status === 'completed' || status === 'failed') break;
            await new Promise(r => setTimeout(r, 1000));
        }

    } catch (e) {
        console.error('[Failed]', e.message);
        if (e.response) console.error(e.response.data);
    } finally {
        fs.unlinkSync(filePath);
    }
}

testMobileChunkedUpload();
