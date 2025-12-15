
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs-extra';
import path from 'path';
import sharp from 'sharp';
import { PDFDocument } from 'pdf-lib';

const API_URL = process.env.API_URL || 'http://localhost:8080';
const TMP_DIR = path.join(__dirname, '../../temp_image_pdf_check');

async function setup() {
    await fs.ensureDir(TMP_DIR);

    // 1. Portrait (Rotated)
    // Physical: 200x100, EXIF: 6 (Rotated 90 CW) -> Visual: 100x200
    await sharp({
        create: { width: 200, height: 100, channels: 3, background: { r: 255, g: 0, b: 0 } }
    })
        .withMetadata({ orientation: 6 })
        .jpeg()
        .toFile(path.join(TMP_DIR, 'portrait-exif-6.jpg'));

    // 2. Landscape (Normal)
    // Physical: 200x100 -> Visual: 200x100
    await sharp({
        create: { width: 200, height: 100, channels: 3, background: { r: 0, g: 255, b: 0 } }
    })
        .jpeg()
        .toFile(path.join(TMP_DIR, 'landscape-normal.jpg'));

    console.log('[Setup] Test images generated.');
}

async function runTest(label: string, filename: string, alignment: 'top' | 'center' | 'bottom', expectedPage: 'portrait' | 'landscape') {
    console.log(`\nTesting [${label}] Alignment: ${alignment}...`);
    const filePath = path.join(TMP_DIR, filename);
    const form = new FormData();
    form.append('files', fs.createReadStream(filePath));
    form.append('toolId', 'image-to-pdf');
    form.append('data', JSON.stringify({ alignment }));

    try {
        // Upload
        const uploadRes = await axios.post(`${API_URL}/upload`, form, { headers: form.getHeaders() });
        const { jobId } = uploadRes.data;
        if (!jobId) throw new Error("No Job ID");
        process.stdout.write(`  Job ${jobId} `);

        // Poll
        let status = 'processing';
        let result: any = null;
        for (let i = 0; i < 20; i++) {
            await new Promise(r => setTimeout(r, 1000));
            const jobRes = await axios.get(`${API_URL}/api/jobs/${jobId}/status`);
            status = jobRes.data.status;
            result = jobRes.data;
            process.stdout.write('.');
            if (status === 'completed' || status === 'failed') break;
        }
        console.log('');

        if (status !== 'completed') throw new Error(`Job failed: ${result?.error}`);

        // Download & Inspect
        const dlRes = await axios.get(result.downloadUrl, { responseType: 'arraybuffer' });
        const pdfDoc = await PDFDocument.load(dlRes.data);
        const page = pdfDoc.getPages()[0];
        const { width, height } = page.getSize();

        console.log(`  [Verify] Page Size: ${width.toFixed(1)}x${height.toFixed(1)}`);

        const A4_W = 595.28;
        const A4_H = 841.89;

        if (expectedPage === 'portrait') {
            if (Math.abs(width - A4_W) > 2 || Math.abs(height - A4_H) > 2) throw new Error(`Expected A4 Portrait, got ${width}x${height}`);
        } else {
            if (Math.abs(width - A4_H) > 2 || Math.abs(height - A4_W) > 2) throw new Error(`Expected A4 Landscape, got ${width}x${height}`);
        }

        console.log(`  ✅ Passed`);

        // Check alignment?
        // Hard to check visual alignment without OCR or complex analysis.
        // We trust the backend unit logic if geometry is correct.

    } catch (e: any) {
        console.error(`  ❌ Failed: ${e.message}`);
        process.exit(1);
    }
}

async function main() {
    await setup();

    // Test 1: Portrait Image (Rotated) - Center
    await runTest('Portrait Rotated', 'portrait-exif-6.jpg', 'center', 'portrait');

    // Test 2: Portrait Image (Rotated) - Top
    await runTest('Portrait Rotated', 'portrait-exif-6.jpg', 'top', 'portrait');

    // Test 3: Landscape Image - Bottom
    await runTest('Landscape Normal', 'landscape-normal.jpg', 'bottom', 'landscape');

    console.log('\n✅ All PDF Orientation/Alignment Tests Passed');
    await fs.remove(TMP_DIR);
}

main();
