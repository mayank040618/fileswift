const fs = require('fs');
const path = require('path');

// Colors
const red = (msg) => `\x1b[31m${msg}\x1b[0m`;
const green = (msg) => `\x1b[32m${msg}\x1b[0m`;

console.log('Running AdSense Integration Smoke Check...');

// 1. Check for Hardcoded Credentials in Source
const sourceDir = path.join(__dirname, '../apps/web/src');
const filesToCheck = ['app/layout.tsx', 'components/AdSense/AdSenseLoader.tsx'];

let hasErrors = false;

function checkFileForSecrets(filePath) {
    const content = fs.readFileSync(path.join(sourceDir, filePath), 'utf8');

    // Check for hardcoded pub- IDs (weak regex, but catches obvious ones)
    if (content.match(/ca-pub-[0-9]{10,}/) && !content.includes('process.env.NEXT_PUBLIC')) {
        console.error(red(`[FAIL] Found potential hardcoded AdSense ID in ${filePath}`));
        hasErrors = true;
    } else {
        console.log(green(`[PASS] No hardcoded secrets in ${filePath}`));
    }
}

// 2. Check Environment Config usage
function checkEnvUsage(filePath) {
    const content = fs.readFileSync(path.join(sourceDir, filePath), 'utf8');
    if (!content.includes('process.env.NEXT_PUBLIC_ADSENSE_CLIENT')) {
        console.warn(`[WARN] ${filePath} does not accept env var for AdSense ID?`);
    } else {
        console.log(green(`[PASS] ${filePath} uses env var for ID`));
    }
}

try {
    checkFileForSecrets('app/layout.tsx');
    checkFileForSecrets('components/AdSense/AdSenseLoader.tsx');
    checkEnvUsage('components/AdSense/AdSenseLoader.tsx');

    if (hasErrors) {
        console.error(red('Smoke Check Failed!'));
        process.exit(1);
    } else {
        console.log(green('All Ad checks passed! ✅'));
    }
} catch (err) {
    console.error(red(`Error running checks: ${err.message}`));
    process.exit(1);
}
