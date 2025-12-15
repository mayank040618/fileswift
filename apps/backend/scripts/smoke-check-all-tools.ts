
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';
import sharp from 'sharp';
import { PDFDocument } from 'pdf-lib'; // Avoid if possible, use base64

const API_URL = process.env.API_URL || 'http://localhost:8080';
const TMP_DIR = path.join(__dirname, '../../temp_smoke_test');

if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

// Minimal Valid PDF (Base64)
const PDF_BASE64 = "JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZSAvQ2F0YWxvZwogIC9QYWdlcyAyIDAgUgo+PgplbmRvYmoKCjIgMCBvYmoKPDwKICAvVHlwZSAvUGFnZXwKICAvTWVkaWFCb3ggWyAxMDAgMTAwIDEwMCAxMDAgXQogIC9Db3VudCAxCiAgL0tpZHMgWyAzIDAgUiBdCj4+CmVuZG9iagoKMyAwIG9iago8PAogIC9UeXBlIC9QYWdlCiAgL1BhcmVudCAyIDAgUgogIC9SZXNvdXJjZXMgPDwKICAgIC9Gb250IDw8CiAgICAgIC9GMSA0IDAgUHVibGljCiAgICA+PgogID4+CiAgL0NvbnRlbnRzIDUgMCBSCj4+CmVuZG9iagoKNCAwIG9iago8PAogIC9UeXBlIC9Gb250CiAgL1N1YnR5cGUgL1R5cGUxCiAgL0Jhc2VGb250IC9IZWx2ZXRpY2EKPj4KZW5kb2JqCgo1IDAgb2JqCjw8IC9MZW5ndGggMjIgPj4Kc3RyZWFtCkJUCi9GMSAxMiBUZgoxMCA1MCBUZAooSGVsbG8gV29ybGQpIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoKCnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxMCAwMDAwMCBuIAowMDAwMDAwMDYwIDAwMDAwIG4gCjAwMDAwMDAxNTcgMDAwMDAgbiAKMDAwMDAwMDI1NSAwMDAwMCBuIAowMDAwMDAwMzQ0IDAwMDAwIG4gCnRyYWlsZXIKPDwKICAvU2l6ZSA2CiAgL1Jvb3QgMSAwIFIKPj4Kc3RhcnR4cmVmCjQxMgolJUVPRgo=";

// Minimal DOCX (Base64 - "Hello World")
const DOCX_BASE64 = "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";

// Minimal ONE PIXEL PNG
const PNG_BASE64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

async function generateAssets() {
    fs.writeFileSync(path.join(TMP_DIR, 'test.pdf'), Buffer.from(PDF_BASE64, 'base64'));
    fs.writeFileSync(path.join(TMP_DIR, 'test.docx'), Buffer.from(DOCX_BASE64, 'base64'));
    fs.writeFileSync(path.join(TMP_DIR, 'test.png'), Buffer.from(PNG_BASE64, 'base64'));

    // Orientation Test Image (200x100, Orientation 6 -> 100x200 Visual)
    await sharp({
        create: { width: 200, height: 100, channels: 3, background: { r: 0, g: 255, b: 0 } }
    })
        .withMetadata({ orientation: 6 })
        .jpeg()
        .toFile(path.join(TMP_DIR, 'orientation-test.jpg'));

    console.log('[Setup] Assets generated.');
}

async function checkHealth() {
    try {
        const res = await axios.get(`${API_URL}/api/health/upload`);
        if (res.status === 200 && res.data.uploadReady === true) {
            console.log('✅ Health Check Passed');
            return true;
        }
        throw new Error(`Health Check Failed: ${res.status} ${JSON.stringify(res.data)}`);
    } catch (e: any) {
        console.error(`❌ Health Check Error: ${e.message}`);
        return false;
    }
}

async function runToolTest(toolId: string, filename: string) {
    const filePath = path.join(TMP_DIR, filename);
    console.log(`\nTesting [${toolId}] with ${filename}...`);

    try {
        const form = new FormData();
        form.append('files', fs.createReadStream(filePath));
        form.append('toolId', toolId);

        // Upload
        const uploadRes = await axios.post(`${API_URL}/upload`, form, {
            headers: { ...form.getHeaders() }
        });

        const { jobId } = uploadRes.data;
        if (!jobId) throw new Error("No Job ID returned");
        process.stdout.write(`  Job ${jobId} `);

        // Poll
        let status = 'processing';
        let attempts = 0;
        let result = null;

        while (status !== 'completed' && status !== 'failed' && attempts < 40) { // 40s timeout
            await new Promise(r => setTimeout(r, 1000));
            try {
                const jobRes = await axios.get(`${API_URL}/api/jobs/${jobId}/status`);
                status = jobRes.data.status;
                result = jobRes.data;
                process.stdout.write('.');
            } catch (e: any) {
                if (e.response?.status !== 404) process.stdout.write('E');
            }
            attempts++;
        }
        console.log('');

        if (status !== 'completed') {
            throw new Error(`Job failed: ${result?.error || status}`);
        }

        // Verify Download
        if (!result.downloadUrl) throw new Error("No download URL");

        const dlRes = await axios.get(result.downloadUrl, { responseType: 'arraybuffer' });
        if (dlRes.status !== 200) throw new Error("Download failed");

        if (toolId === 'image-to-pdf' && filename.includes('orientation')) {
            const pdfDoc = await PDFDocument.load(dlRes.data);
            const page = pdfDoc.getPages()[0];
            const { width, height } = page.getSize();
            console.log(`  [Verify] PDF Page Size: ${width}x${height}`);

            // Expect A4 Portrait (595.28 x 841.89)
            // Allow small float variance
            const A4_W = 595.28;
            const A4_H = 841.89;

            if (Math.abs(width - A4_W) > 2 || Math.abs(height - A4_H) > 2) {
                throw new Error(`Incorrect formatting! Expected A4 Portrait (~${A4_W}x${A4_H}), got ${width}x${height}`);
            }
        }

        console.log(`  ✅ Success`);
        return true;

    } catch (e: any) {
        console.error(`  ❌ Failed: ${e.message}`);
        return false;
    }
}

async function main() {
    await generateAssets();

    if (!await checkHealth()) process.exit(1);

    const tests = [
        { tool: 'compress-pdf', file: 'test.pdf' },
        { tool: 'pdf-to-word', file: 'test.pdf' },
        { tool: 'doc-to-pdf', file: 'test.docx' },
        { tool: 'rotate-pdf', file: 'test.pdf' },
        { tool: 'image-resizer', file: 'test.png' },
        { tool: 'image-compressor', file: 'test.png' },
        { tool: 'image-to-pdf', file: 'orientation-test.jpg' },
    ];

    let passed = 0;
    for (const t of tests) {
        if (await runToolTest(t.tool, t.file)) passed++;
    }

    console.log(`\nSummary: ${passed}/${tests.length} passed.`);
    // fs.rmSync(TMP_DIR, { recursive: true, force: true });

    if (passed !== tests.length) process.exit(1);
}

main();
