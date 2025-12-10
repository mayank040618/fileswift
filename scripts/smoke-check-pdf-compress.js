
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Colors
const colors = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    cyan: "\x1b[36m"
};

const log = (msg, color = colors.reset) => console.log(`${color}${msg}${colors.reset}`);
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const FILE_PATH = path.join(__dirname, '../dummy.pdf'); // Ensure this exists
const ITERATIONS = 5;

// Ensure dummy file exists
if (!fs.existsSync(FILE_PATH)) {
    console.log("Creating dummy PDF...");
    // Ideally copy a real one, but for now we need a valid PDF structure or the tool checks fail.
    // If not exists, we fail. The previous setup had 'dummy.pdf'.
    if (!fs.existsSync(FILE_PATH)) {
        console.error("Error: dummy.pdf not found in root. Please provide a test PDF.");
        process.exit(1);
    }
}

async function checkHealth() {
    console.log(`\n--- 1. Testing /api/health/gs ---`, colors.yellow);
    try {
        const res = await axios.get(`${API_URL}/api/health/gs`);
        log(`✅ Health Check Passed: ${JSON.stringify(res.data)}`, colors.green);
        console.log('[Health] GS Check:', res.data);
        if (!res.data.ghostscript && !res.data.qpdf) {
            console.warn('[Warning] No compression tools detected on backend!');
        }
    } catch (e) {
        console.error('[Health] Failed to reach health endpoint', e.message);
        process.exit(1);
    }
}

async function runTest(i) {
    console.log(`\n--- Iteration ${i + 1}/${ITERATIONS} ---`);
    const form = new FormData();
    form.append('toolId', 'compress-pdf');
    form.append('files', fs.createReadStream(FILE_PATH));
    form.append('data', JSON.stringify({ quality: 10 })); // Low quality -> Triggers SIPS on Mac

    try {
        console.log('[Upload] Sending file...');
        const uploadRes = await axios.post(`${API_URL}/upload`, form, {
            headers: { ...form.getHeaders() }
        });

        const jobId = uploadRes.data.jobId;
        console.log(`[Job] Created Job ID: ${jobId}`);

        // Poll
        let status = 'processing';
        let attempts = 0;
        let result = null;

        while (status === 'processing' || status === 'uploading' || status === 'queued') {
            await sleep(1000);
            const statusRes = await axios.get(`${API_URL}/api/jobs/${jobId}/status`);
            status = statusRes.data.status;
            result = statusRes.data;
            process.stdout.write('.');
            attempts++;
            if (attempts > 60) throw new Error("Timeout polling job");
        }
        console.log(`\n[Job] Finished with status: ${status}`);

        if (status !== 'completed') {
            throw new Error(`Job failed: ${JSON.stringify(result)}`);
        }

        // Verify Download
        const downloadUrl = result.downloadUrl;
        if (!downloadUrl) throw new Error("No download URL");

        console.log(`[Download] Fetching ${downloadUrl}`);
        const dlRes = await axios.get(downloadUrl, { responseType: 'arraybuffer' });
        console.log(`[Download] Received ${dlRes.data.length} bytes`);

        if (dlRes.data.length === 0) throw new Error("Downloaded empty file");

        console.log(`[Success] Iteration ${i + 1} Passed.`);
    } catch (e) {
        console.error(`[Fail] Iteration ${i + 1} Failed:`, e.message);
        if (e.response) console.error('Response:', e.response.data);
        process.exit(1); // Fail fast
    }
}

async function main() {
    console.log("Starting Robust PDF Compression Smoke Test...");
    await checkHealth();

    for (let i = 0; i < ITERATIONS; i++) {
        await runTest(i);
        await sleep(2000); // Cool down
    }

    console.log("\nAll iterations passed successfully!");
}

main();
