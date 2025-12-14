const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const axios = require('axios');
const FormData = require('form-data');

const API_URL = 'http://localhost:8080';
const OUT_DIR = path.join(__dirname, '../test-assets');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR);

async function createPdf(name, pages) {
    const doc = await PDFDocument.create();
    for (let i = 0; i < pages; i++) {
        const page = doc.addPage([500, 500]);
        page.drawText(`Page ${i + 1} of ${name} - Verification Check`, { x: 50, y: 450 });
    }
    const bytes = await doc.save();
    const filePath = path.join(OUT_DIR, name);
    fs.writeFileSync(filePath, bytes);
    return filePath;
}

async function getPageCount(buffer) {
    const doc = await PDFDocument.load(buffer);
    return doc.getPageCount();
}

async function runTest() {
    console.log("--- Reliability Test: Page Count Integrity ---");

    // 1. Create a 20-page PDF (Large enough to trigger parallel mode)
    // 20 pages > 5 page threshold.
    const inputPages = 20;
    const filePath = await createPdf('reliability_test.pdf', inputPages);
    console.log(`[Setup] Created ${inputPages}-page PDF at ${filePath}`);

    const form = new FormData();
    form.append('toolId', 'compress-pdf');
    form.append('files', fs.createReadStream(filePath));
    form.append('data', JSON.stringify({ quality: 50 })); // Aggressive compression

    try {
        console.log("[Job] Uploading...");
        const uploadRes = await axios.post(`${API_URL}/upload`, form, { headers: form.getHeaders() });
        const jobId = uploadRes.data.jobId;
        console.log(`[Job] ID: ${jobId}`);

        let status = 'processing';
        let result = null;
        while (['processing', 'uploading', 'queued'].includes(status)) {
            await new Promise(r => setTimeout(r, 500));
            try {
                const s = await axios.get(`${API_URL}/api/jobs/${jobId}/status`);
                status = s.data.status;
                result = s.data;
                process.stdout.write('.');
            } catch (e) {
                console.log("Status check retry...");
            }
        }
        console.log('');

        if (status === 'completed') {
            console.log(`✅ Job Completed.`);
            const downloadUrl = result.downloadUrl.startsWith('http')
                ? result.downloadUrl
                : `${API_URL}/api/download/${result.resultKey}`;

            console.log(`[Verify] Downloading result from ${downloadUrl}...`);
            const res = await axios.get(downloadUrl, { responseType: 'arraybuffer' });

            const outputPages = await getPageCount(res.data);
            console.log(`[Verify] Input Pages: ${inputPages} | Output Pages: ${outputPages}`);

            if (inputPages === outputPages) {
                console.log("🎉 SUCCESS: Page count matches exactly!");
                process.exit(0);
            } else {
                console.error("❌ FAILURE: Page count mismatch!");
                console.error(`Expected: ${inputPages}, Got: ${outputPages}`);
                process.exit(1);
            }
        } else {
            console.error(`❌ Job Failed: ${result.error}`);
            process.exit(1);
        }

    } catch (e) {
        console.error("❌ Test Exception:", e.message);
        if (e.response) console.error(e.response.data);
        process.exit(1);
    }
}

runTest();
