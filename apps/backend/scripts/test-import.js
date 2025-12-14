const path = require('path');

async function test() {
    try {
        console.log("Attempting to require ../dist/processors/sandboxed.js");
        const processor = require('../dist/processors/sandboxed.js');
        console.log("✅ Success! Processor loaded:", processor);

        if (processor.default) {
            console.log("Has default export:", processor.default);
        }
    } catch (e) {
        console.error("❌ Failed to require processor:", e);
        process.exit(1);
    }
}

test();
