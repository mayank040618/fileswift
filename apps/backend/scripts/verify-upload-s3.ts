
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

async function testUpload() {
    const API_URL = 'http://localhost:8080/api/upload';
    console.log('Testing Upload to:', API_URL);

    // Create a dummy PDF
    const dummyPath = path.join(__dirname, 'test.pdf');
    fs.writeFileSync(dummyPath, '%PDF-1.4\nDummy PDF content for testing streaming upload.\n%%EOF');

    const form = new FormData();
    form.append('toolId', 'compress-pdf'); // Valid tool
    form.append('files', fs.createReadStream(dummyPath));
    form.append('data', JSON.stringify({ quality: 75 }));

    const startTime = Date.now();

    try {
        const response = await axios.post(API_URL, form, {
            headers: {
                ...form.getHeaders(),
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
        });

        const endTime = Date.now();
        const duration = endTime - startTime;

        console.log('Response Status:', response.status);
        console.log('Response Data:', response.data);
        console.log('Duration:', duration, 'ms');

        if (response.status === 202 && response.data.uploadId) {
            console.log('✅ PASS: Server responded with 202 Accepted + Upload ID');
        } else {
            console.error('❌ FAIL: Unexpected response status or missing uploadId');
            process.exit(1);
        }

        if (duration > 500) {
            console.warn('⚠️ WARNING: Response took > 500ms. Is it truly async streaming?');
        } else {
            console.log('✅ PASS: Fast response (<500ms)');
        }

    } catch (error: any) {
        console.error('❌ ERROR:', error.response ? error.response.data : error.message);
        process.exit(1);
    } finally {
        fs.unlinkSync(dummyPath);
    }
}

testUpload();
