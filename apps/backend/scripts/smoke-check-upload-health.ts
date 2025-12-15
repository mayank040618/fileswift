
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const API_BASE = process.env.API_URL || 'http://localhost:8080';

async function run() {
    console.log('[Smoke] Testing Health Checks...');

    // 1. Check Upload Health (Should be TRUE)
    try {
        const res = await axios.get(`${API_BASE}/api/health/upload`);
        if (!res.data.uploadReady) throw new Error('Upload health reported false!');
        console.log('✅ Upload Health: OK (Ready)');
    } catch (e: any) {
        throw new Error(`Upload health check failed: ${e.message}`);
    }

    // 2. Check Process Health (Should be TRUE locally, but logic accepts FALSE)
    try {
        const res = await axios.get(`${API_BASE}/api/health/process`);
        console.log(`ℹ️ Process Health: ${res.data.processReady ? 'OK' : 'Degraded (Warning)'}`);
        if (!res.data.processReady) {
            console.log('   Details:', res.data.details);
        }
    } catch (e: any) {
        console.warn(`⚠️ Process health endpoint failed (Warn only): ${e.message}`);
    }

    // 3. Verify Frontend Logic Simulation
    // Frontend allows upload if #1 is OK, regardless of #2.
    // We already verified #1 is OK.

    console.log('✅ Health Check Smoke Test Passed');
}

run().catch(e => {
    console.error('❌ Test Failed:', e.message);
    process.exit(1);
});
