// script/smoke-check-dommatrix.js
const { exec } = require('child_process');

console.log('Running DOMMatrix Availability Check...');

// We run a tiny node script that imports the backend index (or just the polyfill) 
// BUT typically specialized environments load index.ts. 
// Let's just run a node process that imports the polyfill and asserts validity.

const cmd = `./apps/backend/node_modules/.bin/tsx apps/backend/src/polyfills/dom.ts`;

exec(cmd, (err, stdout, stderr) => {
    if (err) {
        console.error('❌ Check Failed:', stderr);
        process.exit(1);
    }
    if (stdout.includes('SUCCESS') || stdout.includes('DOMMatrix defined globally')) {
        console.log('✅ ' + stdout.trim());
        process.exit(0);
    } else {
        console.error('❓ Unexpected Output:', stdout);
        process.exit(1);
    }
});
