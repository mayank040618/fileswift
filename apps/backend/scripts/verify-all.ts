
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';
import { PDFDocument } from 'pdf-lib';

const API_URL = 'http://localhost:8080';
const TMP_DIR = path.join(__dirname, '../../temp_test');

if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR);

const TEST_PDF = path.join(TMP_DIR, 'test.pdf');
const TEST_IMG = path.join(TMP_DIR, 'test.png');

// 1. Generate Assets
async function generateAssets() {
    // PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    page.drawText('Smoke Test Content for FileSwift', { x: 50, y: 700 });
    fs.writeFileSync(TEST_PDF, await pdfDoc.save());

    // Image (1x1 pixel PNG)
    const pngBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
    fs.writeFileSync(TEST_IMG, pngBuffer);
}

async function runTest(toolId: string, filePath: string) {
    console.log(`\nTesting [${toolId}]...`);
    try {
        // Upload
        const form = new FormData();
        form.append('file', fs.createReadStream(filePath));

        // Some tools might need options, but defaults should work for smoke
        const uploadRes = await axios.post(`${API_URL}/api/tools/${toolId}/upload`, form, {
            headers: { ...form.getHeaders() }
        });

        const { jobId } = uploadRes.data;
        if (!jobId) throw new Error('No Job ID returned');
        console.log(`  Job ID: ${jobId}`);

        // Poll
        let status = 'processing';
        let result = null;
        let attempts = 0;

        while (status !== 'completed' && status !== 'failed' && attempts < 30) {
            await new Promise(r => setTimeout(r, 1000));
            const jobRes = await axios.get(`${API_URL}/api/jobs/${jobId}`);
            status = jobRes.data.status;
            result = jobRes.data;
            process.stdout.write('.');
            attempts++;
        }
        console.log('');

        if (status !== 'completed') {
            throw new Error(`Job failed or timed out. Status: ${status}`);
        }

        // Verify Download
        const downloadUrl = result.downloadUrl;
        if (!downloadUrl) throw new Error('No download URL');

        const dlRes = await axios.get(downloadUrl, { responseType: 'arraybuffer' });
        if (dlRes.status !== 200) throw new Error(`Download failed: ${dlRes.status}`);
        if (dlRes.data.length === 0) throw new Error('Downloaded file is empty');

        console.log(`  ✅ Success! Output size: ${dlRes.data.length} bytes`);
        return true;

    } catch (e: any) {
        console.error(`  ❌ Failed: ${e.message}`);
        if (e.response?.data) console.error('  Server Error:', JSON.stringify(e.response.data));
        return false;
    }
}

async function main() {
    console.log('=== Starting Smoke Tests ===');
    await generateAssets();

    // PDF Tools
    await runTest('pdf-to-word', TEST_PDF);
    await runTest('compress-pdf', TEST_PDF);
    await runTest('rotate-pdf', TEST_PDF);
    await runTest('ai-summary', TEST_PDF); // Might return OCR warning if mocked PDF has no text extractable by pdf-parse? PDFLib added text should be extractable.

    // Image Tools
    await runTest('image-converter', TEST_IMG);
    await runTest('compress-image', TEST_IMG);

    // Cleanup
    // fs.rmSync(TMP_DIR, { recursive: true, force: true });
}

main();
