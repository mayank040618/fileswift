
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const API_URL = 'https://fileswift-backend-production.up.railway.app';
const DATA_DIR = path.join(process.cwd(), 'scripts', 'test-data');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function checkJobStatus(jobId) {
    let retries = 30; // 30s timeout
    while (retries > 0) {
        try {
            const res = await axios.get(`${API_URL}/api/jobs/${jobId}/status`);
            process.stdout.write('.');
            if (res.data.status === 'completed') {
                console.log(' Completed!');
                return res.data;
            }
            if (res.data.status === 'failed') {
                console.log(' Failed!');
                throw new Error(res.data.error || 'Job failed');
            }
        } catch (e) {
            process.stdout.write('x');
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
    form.append('data', JSON.stringify({ quality: 50 })); // Match frontend defaults

    try {
        console.log(`Uploading to ${API_URL}...`);
        const uploadRes = await axios.post(`${API_URL}/upload`, form, {
            headers: form.getHeaders(),
            validateStatus: s => s < 500
        });

        if (!uploadRes.data.jobId) {
            console.error('Upload failed or returned no jobId:', uploadRes.data);
            return;
        }

        console.log(`Job ID: ${uploadRes.data.jobId}`);
        const jobResult = await checkJobStatus(uploadRes.data.jobId);
        const meta = jobResult.result.metadata;

        console.log(`Result: Action=${meta.action || 'processed'} | Original=${meta.originalSize} | Final=${meta.finalSize}`);

        if (jobResult.result.downloadUrl) {
            console.log(`Download URL: ${jobResult.result.downloadUrl}`);
            // Optional: Verify download link is reachable
            try {
                const dlHead = await axios.head(jobResult.result.downloadUrl);
                console.log(`Download Link Status: ${dlHead.status}`);
            } catch (e) {
                console.log(`Warning: Download Link verify failed: ${e.message}`);
            }
        }

        console.log('✅ PASS');

    } catch (e) {
        console.error('Test Error:', e.response ? e.response.data : e.message);
    }
}

async function run() {
    console.log('--- LIVE Verification (fileswift.in Backend) ---');
    console.log(`Backend: ${API_URL}`);
    // Only test small file for quick check
    await testFile('test-small.pdf');
}

run();
