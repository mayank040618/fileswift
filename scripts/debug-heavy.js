const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const axios = require('axios');
const FormData = require('form-data');

const API_URL = 'http://localhost:8080';
const OUT_DIR = path.join(__dirname, '../debug-assets');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

async function createHeavyPdf() {
    const doc = await PDFDocument.create();
    for (let i = 0; i < 100; i++) {
        const page = doc.addPage([500, 500]);
        page.drawText(`Page ${i + 1}`, { x: 50, y: 450 });
    }
    const bytes = await doc.save();
    const filePath = path.join(OUT_DIR, 'heavy_debug.pdf');
    fs.writeFileSync(filePath, bytes);
    return filePath;
}

async function run() {
    const filePath = await createHeavyPdf();
    console.log(`Created ${filePath}`);
    const inDoc = await PDFDocument.load(fs.readFileSync(filePath));
    console.log(`Input Pages: ${inDoc.getPageCount()}`);

    const form = new FormData();
    form.append('toolId', 'compress-pdf');
    form.append('files', fs.createReadStream(filePath));
    form.append('data', JSON.stringify({ quality: 50 }));

    try {
        console.log("Uploading...");
        const res = await axios.post(`${API_URL}/upload`, form, { headers: form.getHeaders() });
        const jobId = res.data.jobId;
        console.log(`Job: ${jobId}`);

        let status = 'processing';
        let result;
        while (['processing', 'queued'].includes(status)) {
            await new Promise(r => setTimeout(r, 1000));
            const s = await axios.get(`${API_URL}/api/jobs/${jobId}/status`);
            status = s.data.status;
            result = s.data;
            process.stdout.write('.');
        }
        console.log('');

        if (status === 'completed') {
            const dl = result.downloadUrl.startsWith('http') ? result.downloadUrl : `${API_URL}/api/download/${result.resultKey}`;
            const pdfRes = await axios.get(dl, { responseType: 'arraybuffer' });
            const outDoc = await PDFDocument.load(pdfRes.data);
            console.log(`Output Pages: ${outDoc.getPageCount()}`);
        } else {
            console.error('Failed', result);
        }

    } catch (e) {
        console.error(e);
    }
}

run();
