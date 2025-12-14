
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const API_URL = 'http://localhost:8080';
const FILE_PATH = path.join(process.cwd(), 'scripts', 'test-data', 'test-small.pdf');

async function main() {
    console.log("Starting Rate Limit Verification (Expected 429s)...");
    let requests = 0;
    let rateLimited = 0;
    let success = 0;

    // Send 30 requests rapidly (Limit is 20/min)
    const promises = [];
    for (let i = 0; i < 30; i++) {
        promises.push((async () => {
            try {
                const form = new FormData();
                form.append('files', fs.createReadStream(FILE_PATH));
                form.append('toolId', 'compress-pdf');
                form.append('data', JSON.stringify({}));

                await axios.post(`${API_URL}/upload`, form, {
                    headers: form.getHeaders(),
                    validateStatus: s => s < 500
                }).then(res => {
                    requests++;
                    if (res.status === 429) rateLimited++;
                    else if (res.status < 300) success++;
                });
            } catch (e) {
                console.error(e.message);
            }
        })());
    }

    await Promise.all(promises);

    console.log(`Requests: ${requests}`);
    console.log(`Success: ${success}`);
    console.log(`Rate Limited: ${rateLimited}`);

    if (rateLimited > 0 && success <= 21) { // 21 because of async race? roughly 20.
        console.log("VERDICT: PASS (Rate Limiting Active)");
    } else {
        console.log("VERDICT: FAIL (No Rate Limiting Observed)");
    }
}

main();
