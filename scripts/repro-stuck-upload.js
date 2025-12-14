const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const BASE_URL = 'http://localhost:8080';

async function createLargeAssets() {
    console.log('Generating 3 x 3MB Images...');
    const buffer = await sharp({
        create: {
            width: 1000,
            height: 1000,
            channels: 4,
            background: { r: 0, g: 0, b: 255, alpha: 1 }
        }
    })
        .png()
        .toBuffer();

    // Write 3 copies
    fs.writeFileSync('test-assets/img1.png', buffer);
    fs.writeFileSync('test-assets/img2.png', buffer);
    fs.writeFileSync('test-assets/img3.png', buffer);
    console.log('✅ Assets created.');
}

async function runTest() {
    await createLargeAssets();

    console.log('🚀 Starting Repro Test (Image to PDF - 3 Files)...');

    const formData = new FormData();
    formData.append('toolId', 'image-to-pdf'); // Ensure toolId is first for safety
    formData.append('files', fs.createReadStream('test-assets/img1.png'));
    formData.append('files', fs.createReadStream('test-assets/img2.png'));
    formData.append('files', fs.createReadStream('test-assets/img3.png'));
    formData.append('data', JSON.stringify({ format: 'pdf' }));

    try {
        console.log('Post starting...');
        const start = Date.now();
        const submitRes = await axios.post(`${BASE_URL}/upload`, formData, {
            headers: { ...formData.getHeaders() },
            maxBodyLength: Infinity,
            maxContentLength: Infinity
        });
        console.log(`✅ Upload Completed in ${(Date.now() - start) / 1000}s`);
        console.log(`✅ Upload Completed in ${(Date.now() - start) / 1000}s`);
        const jobId = submitRes.data.jobId;
        console.log(`Job ID: ${jobId}, Waiting for completion...`);

        let status = 'pending';
        while (['pending', 'processing', 'queued'].includes(status)) {
            await new Promise(r => setTimeout(r, 1000));
            const statusRes = await axios.get(`${BASE_URL}/api/jobs/${jobId}/status`);
            status = statusRes.data.status;
            if (status === 'failed') {
                console.error('❌ Job Failed:', statusRes.data);
                throw new Error(statusRes.data.error);
            }
        }
        console.log('✅ Job Completed Successfully!');
        console.log('Result:', (await axios.get(`${BASE_URL}/api/jobs/${jobId}/status`)).data);
    } catch (e) {
        console.error('❌ Upload Failed');
        console.error(e.message, e.code);
        if (e.response) {
            console.error('Status:', e.response.status);
            console.error('Data:', JSON.stringify(e.response.data, null, 2));
        }
    }
}

runTest();
