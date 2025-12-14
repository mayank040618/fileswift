const axios = require('axios');

const baseUrl = 'http://localhost:3000/tools';
const tools = [
    'compress-pdf',
    'merge-pdf',
    'rotate-pdf',
    'split-pdf',
    'pdf-to-image',
    'pdf-to-word',
    'doc-to-pdf',
    'image-compressor',
    'image-resizer',
    'image-to-pdf',
    'ai-summary',
    'ai-notes',
    'ai-translate',
    'ai-rewrite'
];

async function checkRoutes() {
    console.log('Checking Tool Routes...');
    let failures = [];

    for (const tool of tools) {
        try {
            const url = `${baseUrl}/${tool}`;
            const res = await axios.get(url);
            if (res.status === 200) {
                console.log(`✅ [${tool}] - OK`);
            } else {
                console.error(`❌ [${tool}] - Status ${res.status}`);
                failures.push(tool);
            }
        } catch (e) {
            console.error(`❌ [${tool}] - Failed: ${e.message}`, e.code);
            failures.push(tool);
        }
    }

    if (failures.length > 0) {
        console.error('\nFailures:', failures);
        process.exit(1);
    } else {
        console.log('\nAll routes verified successfully.');
    }
}

checkRoutes();
