
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:8080';
const DURATION_SECONDS = 120; // 2 minutes
const VIRTUAL_USERS_START = 5;
const VIRTUAL_USERS_END = 10;
const DATA_DIR = path.join(process.cwd(), 'scripts', 'test-data');

// Test files
const TEST_FILES = [
    { name: 'test-small.pdf', weight: 0.6 },  // 60% small
    { name: 'test-medium.pdf', weight: 0.3 }, // 30% medium
    { name: 'real-huge.pdf', weight: 0.1 }    // 10% large
];

// State
let activeUsers = 0;
let stopTest = false;
const results = {
    startTime: Date.now(),
    totalRequests: 0,
    success: 0,
    failures: 0,
    latencies: [],
    errors: []
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const getWeightedFile = () => {
    const rand = Math.random();
    let sum = 0;
    for (const file of TEST_FILES) {
        sum += file.weight;
        if (rand < sum) return path.join(DATA_DIR, file.name);
    }
    return path.join(DATA_DIR, TEST_FILES[0].name);
};

const runUser = async (userId) => {
    activeUsers++;
    while (!stopTest) {
        const fileToUpload = getWeightedFile();
        if (!fs.existsSync(fileToUpload)) {
            console.error(`File missing: ${fileToUpload}`);
            await sleep(1000);
            continue;
        }

        const start = Date.now();
        try {
            const form = new FormData();
            form.append('files', fs.createReadStream(fileToUpload));
            form.append('toolId', 'compress-pdf');
            form.append('data', JSON.stringify({ quality: 60 }));

            await axios.post(`${API_URL}/upload`, form, {
                headers: { ...form.getHeaders() },
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
                validateStatus: (s) => s < 500
            }).then(res => {
                const duration = Date.now() - start;
                results.latencies.push(duration);
                results.totalRequests++;

                if (res.status >= 200 && res.status < 300) {
                    results.success++;
                } else if (res.status === 429) {
                    // 429 is technical success for stability, but we track it
                    // Actually, user wants "No stuck uploads". 429 is stuck? 
                    // No, 429 is rejected. 
                    // We count it as failure for "Performance" if rate limit is effectively blocking testing?
                    // No, standard K6 logic counts 429 as Non-200.
                    results.failures++;
                    // We will filter metrics later
                } else {
                    results.failures++;
                    results.errors.push(`Status ${res.status}`);
                }
            });
        } catch (e) {
            results.failures++;
            results.errors.push(e.message);
        }

        // Think time
        await sleep(500 + Math.random() * 1000);
    }
    activeUsers--;
};

async function checkHealth() {
    try {
        await axios.get(`${API_URL}/health`);
        return true;
    } catch {
        return false;
    }
}

async function runTest() {
    console.log(`Starting SRE Performance Test (${DURATION_SECONDS}s)...`);
    console.log(`Ramping VUs: ${VIRTUAL_USERS_START} -> ${VIRTUAL_USERS_END}`);

    // Pre-flight check
    if (!await checkHealth()) {
        console.error("FATAL: Health check failed before test start");
        process.exit(1);
    }

    const vuPromises = [];

    // Start initial VUs
    for (let i = 0; i < VIRTUAL_USERS_START; i++) {
        vuPromises.push(runUser(i));
        await sleep(200);
    }

    // Timer logic
    const startTime = Date.now();
    const rampInterval = (DURATION_SECONDS * 1000) / (VIRTUAL_USERS_END - VIRTUAL_USERS_START);
    let rampStep = 0;

    const healthInterval = setInterval(async () => {
        if (!await checkHealth()) {
            console.error("CRITICAL: Health check passed out during test!");
            results.errors.push("Health Check Failed");
        }
    }, 10000); // Check every 10s

    const rampTimer = setInterval(() => {
        if (activeUsers < VIRTUAL_USERS_END) {
            console.log(`[Ramp Up] Adding VU ${activeUsers + 1}`);
            vuPromises.push(runUser(activeUsers));
            rampStep++;
        }
    }, rampInterval);

    // Main wait
    await new Promise(resolve => setTimeout(resolve, DURATION_SECONDS * 1000));

    stopTest = true;
    clearInterval(healthInterval);
    clearInterval(rampTimer);

    console.log("Stopping users...");
    await Promise.all(vuPromises);

    // Report
    console.log('\n====================================');
    console.log('FINAL PERFORMANCE REPORT');
    console.log('====================================');

    const duration = (Date.now() - results.startTime) / 1000;
    const errors = results.errors.length > 5 ? results.errors.slice(0, 5) : results.errors;

    results.latencies.sort((a, b) => a - b);
    const p50 = results.latencies[Math.floor(results.latencies.length * 0.5)] || 0;
    const p95 = results.latencies[Math.floor(results.latencies.length * 0.95)] || 0;
    const p99 = results.latencies[Math.floor(results.latencies.length * 0.99)] || 0;
    const errorRate = (results.failures / results.totalRequests) * 100;

    console.log(`Duration: ${duration.toFixed(1)}s`);
    console.log(`Requests: ${results.totalRequests}`);
    console.log(`Success:  ${results.success} (${((results.success / results.totalRequests) * 100).toFixed(1)}%)`);
    console.log(`Failures: ${results.failures} (${errorRate.toFixed(1)}%)`);
    console.log(`P95 Latency: ${p95}ms`);
    console.log(`P50 Latency: ${p50}ms`);

    if (results.failures > 0) {
        console.log('Sample Errors:', errors);
    }

    // Verdict
    let passed = true;
    if (errorRate > 1) { console.log("FAIL: Error rate > 1%"); passed = false; }
    if (p95 > 3000) { console.log("FAIL: P95 Latency > 3000ms"); passed = false; }

    if (passed) console.log("\nVERDICT: GO (PASS)");
    else console.log("\nVERDICT: NO-GO (FAIL)");
}

runTest();
