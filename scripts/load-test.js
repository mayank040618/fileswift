
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const API_URL = process.env.API_URL || 'http://localhost:8080';
const FILE_PATH = path.join(process.cwd(), 'valid_test.pdf');

if (!fs.existsSync(FILE_PATH)) {
    console.error(`Test file not found at ${FILE_PATH}`);
    process.exit(1);
}

const fileBuffer = fs.readFileSync(FILE_PATH);

const metrics = {
    requests: 0,
    errors: 0,
    latencies: []
};

const makeRequest = async () => {
    const start = Date.now();
    try {
        const form = new FormData();
        form.append('files', fileBuffer, 'load_test.pdf');
        form.append('toolId', 'compress-pdf');
        form.append('data', JSON.stringify({ quality: 50 }));

        await axios.post(`${API_URL}/upload`, form, {
            headers: {
                ...form.getHeaders(),
                'x-load-test': 'stress-test-secret'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500
        });

        metrics.latencies.push(Date.now() - start);
    } catch (e) {
        metrics.errors++;
    } finally {
        metrics.requests++;
    }
};

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const runStage = async (name, users, durationSeconds) => {
    console.log(`\n=== Starting Stage: ${name} (${users} users, ${durationSeconds}s) ===`);
    const endTime = Date.now() + (durationSeconds * 1000);
    const promises = [];

    for (let i = 0; i < users; i++) {
        promises.push((async () => {
            while (Date.now() < endTime) {
                await makeRequest();
                await sleep(100);
            }
        })());
    }

    await Promise.all(promises);
};

const printMetrics = () => {
    const latencies = metrics.latencies.sort((a, b) => a - b);
    const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
    const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length || 0;
    const errorRate = (metrics.errors / metrics.requests) * 100;

    console.log('\n--- Test Results ---');
    console.log(`Total Requests: ${metrics.requests}`);
    console.log(`Errors: ${metrics.errors} (${errorRate.toFixed(2)}%)`);
    console.log(`Avg Latency: ${avg.toFixed(2)}ms`);
    console.log(`P95 Latency: ${p95}ms`);

    if (errorRate > 0.5) {
        console.error('FAIL: Error rate > 0.5%');
    } else {
        console.log('PASS: Error rate acceptable');
    }

    if (p95 > 2000) {
        console.error('FAIL: P95 Latency > 2000ms');
    } else {
        console.log('PASS: Latency acceptable');
    }
};

const main = async () => {
    // Warm-up: 10 users, 5s
    await runStage('Warm-up', 10, 5);

    // Normal: 50 users, 10s
    await runStage('Normal', 50, 10);

    // Spike: 100 users, 5s (Reduced duration for time)
    await runStage('Spike', 100, 5);

    printMetrics();
};

main();
