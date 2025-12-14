const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:8080';

async function runTest() {
    console.log('🚀 Starting Backend Verification for All Tools...\n');
    let failures = [];

    const tools = [
        { id: 'compress-pdf', input: 'test-assets/test.pdf', type: 'pdf' },
        { id: 'merge-pdf', input: 'test-assets/test.pdf', type: 'pdf' },
        { id: 'rotate-pdf', input: 'test-assets/test.pdf', type: 'pdf', data: { angle: 90 } },
        { id: 'split-pdf', input: 'test-assets/test.pdf', type: 'pdf' },
        { id: 'pdf-to-image', input: 'test-assets/test.pdf', type: 'pdf' },
        { id: 'pdf-to-word', input: 'test-assets/test.pdf', type: 'pdf' },
        // { id: 'doc-to-pdf', input: 'test-assets/test.docx' }, // Need docx asset
        { id: 'image-resizer', input: 'test-assets/test.jpg', type: 'image', data: { width: 100 } },
        { id: 'image-compressor', input: 'test-assets/test.jpg', type: 'image', data: { quality: 50 } },
        { id: 'image-to-pdf', input: 'test-assets/test.jpg', type: 'image' },
        // AI Tools (may fail without key, but let's try if enabled)
        // { id: 'ai-summary', input: 'test-assets/test.pdf' } 
    ];

    for (const tool of tools) {
        process.stdout.write(`Testing [${tool.id}]... `);
        try {
            if (!fs.existsSync(tool.input)) {
                throw new Error(`Input file ${tool.input} missing`);
            }

            const formData = new FormData();
            formData.append('files', fs.createReadStream(tool.input));
            formData.append('toolId', tool.id);
            if (tool.data) {
                formData.append('data', JSON.stringify(tool.data));
            }

            // 1. Submit Job -> /upload
            const submitRes = await axios.post(`${BASE_URL}/upload`, formData, {
                headers: { ...formData.getHeaders() }
            });
            const jobId = submitRes.data.jobId; // Response is { jobId, status, ... }

            // 2. Poll Result -> /api/jobs/:id/status
            let status = 'pending';
            let retries = 0;
            while (['pending', 'processing', 'queued', 'waiting'].includes(status) && retries < 20) {
                await new Promise(r => setTimeout(r, 1000));
                const jobRes = await axios.get(`${BASE_URL}/api/jobs/${jobId}/status`);
                status = jobRes.data.status;

                if (status === 'completed') {
                    console.log('✅ PASS');
                    break;
                } else if (status === 'failed') {
                    throw new Error(`Job Failed: ${jobRes.data.error || 'Unknown error'}`);
                }
                retries++;
            }
            if (status !== 'completed') throw new Error('Timeout');

        } catch (e) {
            console.log('❌ FAIL');
            console.error(`  -> ${e.message}`);
            if (e.response) console.error(`  -> Status: ${e.response.status}, Data:`, e.response.data);
            failures.push(tool.id);
        }
    }

    console.log('\n--- Summary ---');
    if (failures.length === 0) {
        console.log('✅ All tested tools are FUNCTIONAL.');
    } else {
        console.log(`❌ Failed: ${failures.join(', ')}`);
        process.exit(1);
    }
}

runTest();
