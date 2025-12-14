
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const API_URL = 'http://localhost:8080';
const DATA_DIR = path.join(process.cwd(), 'scripts', 'test-data');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function checkJobStatus(jobId) {
    let retries = 20;
    while (retries > 0) {
        try {
            const res = await axios.get(`${API_URL}/api/jobs/${jobId}/status`);
            if (res.data.status === 'completed') return res.data;
            if (res.data.status === 'failed') throw new Error(res.data.error || 'Job failed');
        } catch (e) {
            console.log(`Polling error: ${e.message}`);
        }
        await sleep(1000);
        retries--;
    }
    throw new Error('Job timed out');
}

async function testFile(filename) {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) {
        console.log(`Skipping ${filename} (not found)`);
        return;
    }

    const fileSize = fs.statSync(filePath).size;
    console.log(`\nTesting ${filename} (${(fileSize / 1024).toFixed(2)} KB)...`);

    const form = new FormData();
    form.append('files', fs.createReadStream(filePath));
    form.append('toolId', 'compress-pdf');
    form.append('data', JSON.stringify({ quality: 50 }));

    try {
        const uploadRes = await axios.post(`${API_URL}/upload`, form, {
            headers: form.getHeaders(),
            validateStatus: s => s < 500
        });

        if (!uploadRes.data.jobId) {
            console.error('Upload failed:', uploadRes.data);
            return;
        }

        const jobResult = await checkJobStatus(uploadRes.data.jobId);
        const meta = jobResult.result.metadata;

        console.log(`Result: Action=${meta.action} | Original=${meta.originalSize} | Final=${meta.finalSize}`);

        let passed = false;
        if (fileSize < 500 * 1024) {
            if (meta.action === 'skipped_small') passed = true;
        } else {
            // Larger files should be compressed OR skipped_optimized
            if (meta.action === 'compressed' || meta.action === 'skipped_optimized') passed = true;
            // Ensure no inflation
            if (meta.finalSize > meta.originalSize) {
                console.error('FAILURE: Inflation detected!');
                passed = false;
            }
        }

        console.log(passed ? '✅ PASS' : '❌ FAIL');

    } catch (e) {
        console.error('Test Error:', e.message);
    }
}

async function run() {
    console.log('--- Smart Compression Verification ---');
    await testFile('test-small.pdf');
    await testFile('test-medium.pdf');
    await testFile('real-huge.pdf');
}

run();
