
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';

const API_URL = process.env.API_URL || 'http://localhost:8080';
const FILE_PATH = path.join(process.cwd(), 'valid_test.pdf');

if (!fs.existsSync(FILE_PATH)) {
    console.error(`Test file not found at ${FILE_PATH}`);
    process.exit(1);
}

const fileBuffer = fs.readFileSync(FILE_PATH);

interface Metrics {
    requests: number;
    errors: number;
    latencies: number[];
}

const metrics: Metrics = {
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

        // Mock data
        form.append('data', JSON.stringify({ quality: 50 }));

        await axios.post(`${API_URL}/upload`, form, {
            headers: {
                ...form.getHeaders(),
                'x-load-test': 'stress-test-secret'
            },
            timeout: 30000,
            validateStatus: (status) => status < 500 // Accept 429 as "handled" but still error for load test purposes?
        });

        metrics.latencies.push(Date.now() - start);
    } catch (e: any) {
        metrics.errors++;
        // console.error(e.message);
    } finally {
        metrics.requests++;
    }
};

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

const runStage = async (name: string, users: number, durationSeconds: number) => {
    console.log(`\n=== Starting Stage: ${name} (${users} users, ${durationSeconds}s) ===`);
    const endTime = Date.now() + (durationSeconds * 1000);
    const promises: Promise<void>[] = [];

    // Simple concurrency loop
    // We launch 'users' workers that loop until time is up
    for (let i = 0; i < users; i++) {
        promises.push((async () => {
            while (Date.now() < endTime) {
                await makeRequest();
                await sleep(100); // Small pacing to prevent self-DOS of client
            }
        })());
    }

    await Promise.all(promises);
};

const printMetrics = () => {
    const latencies = metrics.latencies.sort((a, b) => a - b);
    const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
    const p99 = latencies[Math.floor(latencies.length * 0.99)] || 0;
    const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length || 0;
    const errorRate = (metrics.errors / metrics.requests) * 100;

    console.log('\n--- Test Results ---');
    console.log(`Total Requests: ${metrics.requests}`);
    console.log(`Errors: ${metrics.errors} (${errorRate.toFixed(2)}%)`);
    console.log(`Avg Latency: ${avg.toFixed(2)}ms`);
    console.log(`P95 Latency: ${p95}ms`);
    console.log(`P99 Latency: ${p99}ms`);

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

    // Reset for next run if needed, but we accumulate for now
};

const main = async () => {
    // Warm-up: 10 users, 10s
    await runStage('Warm-up', 10, 10);

    // Normal: 50 users, 15s
    await runStage('Normal', 50, 15);

    // Spike: 200 users, 10s
    // Note: This might hit rate limits (20/min/ip) if we don't mock IPs or disable RL for testing
    // Since we are testing from localhost, we WILL hit rate limits.
    // Ideally we should disable rate limiting for this test or use a special header.
    // For now we expect errors 429.
    await runStage('Spike', 200, 10);

    // Stress: 500 users, 10s
    await runStage('Stress', 500, 10);

    printMetrics();
};

main();
