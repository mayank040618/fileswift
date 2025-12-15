
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const API_URL = process.env.API_URL || 'http://localhost:8080';

async function testDocToPdf() {
    console.log('[Test] Starting Doc to PDF verification...');

    // Create dummy DOCX (minimal valid zip/xml structure or just text if backend uses libreoffice which handles text too, 
    // but better to use the one we created or a simple text file renamed to .docx if converter supports it)
    // Actually, LibreOffice might fail on garbage .docx.
    // Let's rely on the file 'dummy_doc.docx' if it exists, or create a simple txt file and try converting it (if tool supports it)
    // or just use the dummy_doc.docx I created on Desktop.

    const filePath = path.join(process.cwd(), 'dummy_test.docx');
    // Minimal valid docx is hard to generate from string. 
    // Let's create a simple text file and verify 'pdf-to-word' or 'doc-to-pdf'.
    // If 'doc-to-pdf' expects strictly docx, garbage might fail.
    // Let's try to upload the 'dummy_doc.docx' I created earlier if I can read it.
    // I previously created `/Users/mayankraj/Desktop/fileswift/dummy_doc.docx`.

    const sourcePath = path.join(__dirname, '..', 'valid_test.doc');
    if (!fs.existsSync(sourcePath)) {
        console.error('❌ Source valid_test.doc not found!');
        process.exit(1);
    }

    const form = new FormData();
    form.append('files', fs.createReadStream(sourcePath));
    form.append('toolId', 'doc-to-pdf'); // Correct ID

    try {
        console.log('[Upload] Sending file...');
        const res = await axios.post(`${API_URL}/upload`, form, {
            headers: { ...form.getHeaders() }
        });

        console.log('[Upload] Response:', res.data);
        const { jobId } = res.data;

        if (!jobId) throw new Error('No jobId received');

        console.log(`[Status] Polling job ${jobId}...`);

        let status = 'processing';
        let attempts = 0;

        while (status === 'processing' && attempts < 20) {
            await new Promise(r => setTimeout(r, 1000));
            const statusRes = await axios.get(`${API_URL}/api/jobs/${jobId}/status`);
            status = statusRes.data.status;
            console.log(`[Status] ${status}`);
            if (status === 'completed') {
                console.log('[Success] Job completed! Download URL:', statusRes.data.downloadUrl);
                return;
            }
            if (status === 'failed') {
                console.error('[Failed] Job failed:', statusRes.data.error);
                process.exit(1);
            }
            attempts++;
        }
        console.error('[Timeout] Job timed out');
        process.exit(1);

    } catch (e) {
        console.error('[Error]', e.response?.data || e.message);
        process.exit(1);
    }
}

testDocToPdf();
