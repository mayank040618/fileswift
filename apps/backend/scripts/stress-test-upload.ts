
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const API_URL = process.env.API_URL || 'http://localhost:8080';
const CONCURRENT_UPLOADS = 50;
const TMP_FILE = path.join(__dirname, '../../temp_stress_test.bin');

// 1. Create dummy file (100KB)
if (!fs.existsSync(TMP_FILE)) {
    fs.writeFileSync(TMP_FILE, Buffer.alloc(100 * 1024));
}

async function uploadFile(i: number) {
    try {
        const form = new FormData();
        form.append('files', fs.createReadStream(TMP_FILE));
        form.append('toolId', 'compress-pdf'); // Use valid toolId

        const start = Date.now();
        const res = await axios.post(`${API_URL}/upload`, form, {
            headers: { ...form.getHeaders() },
            validateStatus: () => true // Don't throw on error
        });
        const duration = Date.now() - start;

        return {
            id: i,
            status: res.status,
            duration,
            error: res.data?.error || res.statusText
        };
    } catch (e: any) {
        return { id: i, status: 'NET_ERR', error: e.message };
    }
}

async function main() {
    console.log(`Starting Stress Test: ${CONCURRENT_UPLOADS} concurrent uploads...`);

    const promises = [];
    for (let i = 0; i < CONCURRENT_UPLOADS; i++) {
        promises.push(uploadFile(i));
    }

    const results = await Promise.all(promises);

    const success = results.filter(r => r.status >= 200 && r.status < 300);
    const rateLimited = results.filter(r => r.status === 429 || (r.error && r.error.includes('limit')));
    const failed = results.filter(r => (r.status < 200 || r.status >= 300) && r.status !== 429);

    console.log(`\nResults:`);
    console.log(`✅ Success: ${success.length}`);
    console.log(`⚠️ Rate Limited: ${rateLimited.length} (Expected > 0)`);
    console.log(`❌ Failed: ${failed.length}`);

    if (failed.length > 0) {
        console.log('Sample Failures:', failed.slice(0, 5));
    }

    // Stability Check
    console.log('\nChecking Server Health...');
    try {
        const health = await axios.get(`${API_URL}/api/health/upload`);
        if (health.status === 200) console.log('✅ Server is healthy');
        else console.error('❌ Server unhealthy');
    } catch (e: any) {
        console.error('❌ Server unreachable');
    }

    fs.unlinkSync(TMP_FILE);
}

main();
