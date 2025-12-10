
const fs = require('fs');
const path = require('path');
const FormData = require('form-data'); // You might need to install this or use axios
const axios = require('axios');

const API_URL = 'http://localhost:8080';
const TEST_DIR = path.join(__dirname, 'test-assets');
if (!fs.existsSync(TEST_DIR)) fs.mkdirSync(TEST_DIR);

// Create dummy files
const createDummyFile = (name, size = 1024) => {
    const p = path.join(TEST_DIR, name);
    // Create valid PDF/Image content if possible or just random bytes
    // For PDF checks using pdf-lib, random bytes might fail.
    // We should copy real assets if available or mock basic headers.
    // For now, let's try to verify if we can source real files or use "text/plain" disguised.
    // Backend validation might check magic numbers.
    fs.writeFileSync(p, Buffer.alloc(size, 'a'));
    return p;
};

// We need REAL files for PDF/Image processors usually.
// Let's assume the user has some files or we create minimal valid ones.
// Minimal valid PDF header
const minimalPDF = Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 595 842]/Parent 2 0 R/Resources<<>>>>endobj xref 0 4 0000000000 65535 f 0000000010 00000 n 0000000060 00000 n 0000000117 00000 n trailer<</Size 4/Root 1 0 R>>startxref 223 %%EOF');

const createPdf = (name) => {
    const p = path.join(TEST_DIR, name);
    fs.writeFileSync(p, minimalPDF);
    return p;
}

// Minimal valid PNG (1x1 red pixel)
const minimalPNG = Buffer.from('89504e470d0a1a0a0000000d4948445200000001000000010802000000907753de0000000c4944415408d763f8cfc000000301010018dd8db00000000049454e44ae426082', 'hex');
const createPng = (name) => {
    const p = path.join(TEST_DIR, name);
    fs.writeFileSync(p, minimalPNG);
    return p;
}

async function runTest() {
    console.log("Creating test files...");
    const pdf1 = createPdf('test1.pdf');
    const pdf2 = createPdf('test2.pdf');
    const png1 = createPng('test1.png');
    const png2 = createPng('test2.png');

    // Test Bulk Image Resize
    console.log("\n--- Testing Bulk Image Resize (with duplicates) ---");
    // Upload png1 twice to test collision handling
    await testUploadAndProcess('bulk-image-resizer', [png1, png1, png2]);

    // Test Image Compression (Single)
    console.log("\n--- Testing Image Compression (Single) ---");
    // Should result in a single file
    // Pass quality via the 'data' JSON string as expected by ToolClient
    const jobData = { quality: 30 };
    // Note: testUploadAndProcess helper might need to accept extra data or we hack it manually
    // Just verifying basic robust flow first
    await testUploadAndProcess('image-compressor', [png1], undefined, jobData);


    // Test Merge PDF
    console.log("\n--- Testing Merge PDF ---");
    await testUploadAndProcess('merge-pdf', [pdf1, pdf2]);

    // Test Compress PDF (Low Quality / Screen)
    // Note: With SIPS fallback, this might result in larger file for text-only PDFs, but works for images.
    console.log("\n--- Testing Compress PDF (Low Quality q=10) ---");
    await testUploadAndProcess('compress-pdf', [pdf1], undefined, { quality: 10 });

    // Test Compress PDF (High Quality / Printer)
    console.log("\n--- Testing Compress PDF (High Quality q=90) ---");
    await testUploadAndProcess('compress-pdf', [pdf1], undefined, { quality: 90 });

    // Test Split PDF
    console.log("\n--- Testing Split PDF ---");
    await testUploadAndProcess('split-pdf', [pdf1]);

    // Test Rotate PDF (90 deg)
    console.log("\n--- Testing Rotate PDF (90 deg) ---");
    await testUploadAndProcess('rotate-pdf', [pdf1], undefined, { angle: 90 });

    // Test PDF to Image (Mac SIPS check)
    console.log("\n--- Testing PDF to Image ---");
    await testUploadAndProcess('pdf-to-image', [pdf1]);
}

async function testUploadAndProcess(toolId, files, callback, additionalData) {
    try {
        const form = new FormData();
        form.append('toolId', toolId);
        files.forEach(f => form.append('files', fs.createReadStream(f)));

        if (additionalData) {
            form.append('data', JSON.stringify(additionalData));
        }

        console.log(`Uploading ${files.length} files to /upload...`);
        const uploadRes = await axios.post(`${API_URL}/upload`, form, {
            headers: { ...form.getHeaders() }
        });

        const jobId = uploadRes.data.jobId;
        console.log(`Job Created: ${jobId}`);

        // Poll status
        let status = 'pending';
        let jobData;
        while (status === 'pending' || status === 'processing' || status === 'waiting') {
            await new Promise(r => setTimeout(r, 1000));
            const statusRes = await axios.get(`${API_URL}/api/jobs/${jobId}/status`);
            status = statusRes.data.status;
            jobData = statusRes.data;
            process.stdout.write('.');
        }
        console.log(`\nFinal Status: ${status}`);

        if (status === 'completed') {
            console.log(`Download URL: ${jobData.downloadUrl}`);
            // Verify Download
            const downloadRes = await axios.get(jobData.downloadUrl, { responseType: 'arraybuffer' });
            console.log(`Downloaded Bytes: ${downloadRes.data.length}`);
            if (downloadRes.data.length > 0) {
                console.log("✅ Success: Output file exists and is not empty.");
            } else {
                console.error("❌ Failed: Output file is empty.");
            }
        } else {
            console.error("❌ Job Failed:", jobData);
        }

    } catch (e) {
        console.error("❌ Error:", e.message);
        if (e.response) console.error("Response:", e.response.data);
    }
}

runTest();
