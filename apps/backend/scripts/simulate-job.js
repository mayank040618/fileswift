const path = require('path');

async function simulate() {
    try {
        console.log("Loading compiled jobProcessor...");
        const { executeJob } = require('../dist/services/jobProcessor.js');

        console.log("Mocking Job...");
        const mockJob = {
            id: 'test-local-1',
            data: {
                toolId: 'compress-pdf', // Use a simple tool
                inputFiles: [], // Empty for now, just testing code loading/execution flow
                data: {}
            },
            updateProgress: async (p) => console.log(`Progress: ${p}%`),
            log: (msg) => console.log(`[JobLog] ${msg}`),
            isFailed: () => false,
            // Mock other BullMQ methods if needed
        };

        console.log("Executing Job...");
        await executeJob(mockJob);
        console.log("✅ Execute Job finished (it might fail due to missing files, but code loaded!)");

    } catch (e) {
        console.error("❌ Simulation Failed:", e);
        if (e.code === 'MODULE_NOT_FOUND') {
            console.error("Dependency missing in built artifact!");
        }
    }
}

simulate();
