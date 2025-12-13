const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const axios = require('axios');
const FormData = require('form-data');
const crypto = require('crypto');

const API_URL = 'http://localhost:8080';
const ASSETS_DIR = path.join(__dirname, '../stress-assets');

// Configuration
// User asked for "upto 100 pdf ... run this test 5 times"
// Interpretation: Run a total volume of 100 PDFs processed.
// We will do this in batches to avoid local resource exhaustion.
const TOTAL_JOBS = 100;
const BATCH_SIZE = 5;

if (!fs.existsSync(ASSETS_DIR)) fs.mkdirSync(ASSETS_DIR, { recursive: true });

// Helper: Create Dummy PDF
async function createPdf(name, pages, sizeMb) {
    const filePath = path.join(ASSETS_DIR, name);
    if (fs.existsSync(filePath)) return filePath; // Cache

    console.log(`[Gen] Creating ${name} (${pages} pages)...`);
    const doc = await PDFDocument.create();

    for (let i = 0; i < pages; i++) {
        const page = doc.addPage([600, 800]);
        page.drawText(`Stress Test Page ${i + 1} / ${pages}`, { x: 50, y: 700, size: 20 });
    }

    const pdfBytes = await doc.save();
    fs.writeFileSync(filePath, pdfBytes);
    return filePath;
}

const TEMPLATES = [
    { name: 'tiny.pdf', pages: 5, size: 0.1 },
    { name: 'small.pdf', pages: 15, size: 1 },
    { name: 'medium.pdf', pages: 30, size: 5 },
    { name: 'large.pdf', pages: 60, size: 20 },
    { name: 'heavy.pdf', pages: 100, size: 50 },
];

async function submitJob(filePath) {
    const form = new FormData();
    form.append('toolId', 'compress-pdf');
    form.append('files', fs.createReadStream(filePath));
    form.append('data', JSON.stringify({ quality: 60 }));

    try {
        const start = Date.now();
        const res = await axios.post(`${API_URL}/upload`, form, { headers: form.getHeaders() });
        const jobId = res.data.jobId;

        // Poll
        let status = 'processing';
        let result = null;
        let attempts = 0;

        while (['processing', 'uploading', 'queued'].includes(status) && attempts < 300) { // 150s timeout
            await new Promise(r => setTimeout(r, 500));
            const s = await axios.get(`${API_URL}/api/jobs/${jobId}/status`);
            status = s.data.status;
            result = s.data;
            attempts++;
        }

        if (status !== 'completed') throw new Error(`Job ${jobId} failed or timed out: ${result?.error}`);

        // Verify
        const dlUrl = result.downloadUrl.startsWith('http') ? result.downloadUrl : `${API_URL}/api/download/${result.resultKey}`;
        const pdfRes = await axios.get(dlUrl, { responseType: 'arraybuffer' });
        const outDoc = await PDFDocument.load(pdfRes.data);
        const outPages = outDoc.getPageCount();

        // Check input pages
        const inBuffer = fs.readFileSync(filePath);
        const inDoc = await PDFDocument.load(inBuffer);
        const inPages = inDoc.getPageCount();

        const duration = Date.now() - start;

        if (inPages !== outPages) throw new Error(`Page Mismatch! In: ${inPages}, Out: ${outPages}`);

        return { success: true, duration, pages: outPages };

    } catch (e) {
        return { success: false, error: e.message };
    }
}

async function runBatch(batchId, jobsInBatch) {
    console.log(`\n=== BATCH ${batchId} (${jobsInBatch.length} jobs) ===`);
    const promises = [];
    const stats = { success: 0, fail: 0, totalTime: 0 };

    for (let i = 0; i < jobsInBatch.length; i++) {
        const tpl = jobsInBatch[i];
        const p = submitJob(path.join(ASSETS_DIR, tpl.name))
            .then(res => {
                if (res.success) {
                    process.stdout.write('✅');
                    stats.success++;
                    stats.totalTime += res.duration;
                } else {
                    process.stdout.write('❌');
                    console.error(`\n[Fail] ${tpl.name}: ${res.error}`);
                    stats.fail++;
                }
            });
        promises.push(p);
        await new Promise(r => setTimeout(r, 100)); // Slight stagger
    }

    await Promise.all(promises);
    return stats;
}

(async () => {
    console.log("Generating Assets...");
    for (const t of TEMPLATES) await createPdf(t.name, t.pages, t.size);

    let totalSuccess = 0;
    let totalFail = 0;
    const start = Date.now();

    for (let i = 0; i < TOTAL_JOBS; i += BATCH_SIZE) {
        const batchId = Math.floor(i / BATCH_SIZE) + 1;

        // Select random templates for this batch
        const batchTemplates = [];
        for (let j = 0; j < BATCH_SIZE; j++) {
            batchTemplates.push(TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)]);
        }

        const stats = await runBatch(batchId, batchTemplates);
        totalSuccess += stats.success;
        totalFail += stats.fail;

        // Cool down between batches to let GC run
        if (i + BATCH_SIZE < TOTAL_JOBS) await new Promise(r => setTimeout(r, 1000));
    }

    console.log(`\n\n✨ TEST COMPLETE ✨`);
    console.log(`Total Jobs: ${TOTAL_JOBS}`);
    console.log(`Success: ${totalSuccess}`);
    console.log(`Fail: ${totalFail}`);
    console.log(`Total Duration: ${((Date.now() - start) / 1000).toFixed(1)}s`);

    if (totalFail > 0) process.exit(1);
    process.exit(0);
})();
