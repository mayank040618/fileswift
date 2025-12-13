const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');

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

const FILE_PATH = path.join(__dirname, '../dummy.pdf');
const ITERATIONS = 3; // Reduced for quick smoke check

// Ensure dummy file exists
async function ensureDummyPdf() {
    if (!fs.existsSync(FILE_PATH)) {
        console.log("Creating dummy PDF...");
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage();
        page.drawText('This is a dummy PDF for compression testing. ' + 'A'.repeat(5000)); // Add some weight
        const pdfBytes = await pdfDoc.save();
        fs.writeFileSync(FILE_PATH, pdfBytes);
    }
}

async function checkHealth() {
    console.log(`\n--- 1. Testing /api/health/gs ---`, colors.yellow);
    try {
        const res = await axios.get(`${API_URL}/api/health/gs`);
        log(`✅ Health Check Passed: ${JSON.stringify(res.data)}`, colors.green);

        if (!res.data.ghostscript) console.warn(colors.red + "⚠️ Ghostscript NOT detected!" + colors.reset);
        if (!res.data.qpdf) console.warn(colors.red + "⚠️ QPDF NOT detected!" + colors.reset);
    } catch (e) {
        console.error('[Health] Failed to reach health endpoint', e.message);
        process.exit(1);
    }
}

async function runTest(i, quality = 'medium') {
    console.log(`\n--- Iteration ${i + 1}/${ITERATIONS} [Quality: ${quality}] ---`);
    const form = new FormData();
    form.append('toolId', 'compress-pdf');
    form.append('files', fs.createReadStream(FILE_PATH));
    form.append('data', JSON.stringify({ quality }));

    try {
        const uploadRes = await axios.post(`${API_URL}/upload`, form, {
            headers: { ...form.getHeaders() }
        });

        const jobId = uploadRes.data.jobId;
        console.log(`[Job] Created Job ID: ${jobId}`);

        // Poll
        let status = 'processing';
        let attempts = 0;
        let result = null;

        while (['processing', 'uploading', 'queued'].includes(status)) {
            await sleep(1000);
            const statusRes = await axios.get(`${API_URL}/api/jobs/${jobId}/status`);
            status = statusRes.data.status;
            result = statusRes.data;
            process.stdout.write('.');
            attempts++;
            if (attempts > 35) throw new Error("Timeout polling job (>35s)");
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
        console.log(`[Download] Received ${dlRes.data.length} bytes (Original: ${fs.statSync(FILE_PATH).size})`);

        if (dlRes.data.length === 0) throw new Error("Downloaded empty file");

        const ratio = (dlRes.data.length / fs.statSync(FILE_PATH).size * 100).toFixed(2);
        console.log(`[Stats] Compression Ratio: ${ratio}%`);

        // In real scenario we would check logs, but here we just ensure success.
        // If ratio > 100 on dummy file, it means we might have tried QPDF and it was also big, but logic handled it?
        // Actually for dummy files, they are often already small.

        console.log(`[Success] Iteration ${i + 1} Passed.`);
    } catch (e) {
        console.error(`[Fail] Iteration ${i + 1} Failed:`, e.message);
        if (e.response && e.response.data) console.error('Response:', e.response.data);
        process.exit(1);
    }
}

async function main() {
    console.log("Starting Robust PDF Compression Smoke Test...");
    await ensureDummyPdf();
    await checkHealth();

    // Test different qualities
    await runTest(0, 'low');   // High compression
    await sleep(1000);
    await runTest(1, 'medium'); // Balanced
    await sleep(1000);
    await runTest(2, 'high');  // Best quality (Low compression)

    console.log(colors.green + "\nAll iterations passed successfully!" + colors.reset);
}

main();
