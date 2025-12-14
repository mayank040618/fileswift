
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk'; // Assuming chalk is available in devDependencies or we use console codes

// Simple color release
const green = (msg: string) => `\x1b[32m${msg}\x1b[0m`;
const red = (msg: string) => `\x1b[31m${msg}\x1b[0m`;
const yellow = (msg: string) => `\x1b[33m${msg}\x1b[0m`;

const BACKEND_ROOT = path.join(__dirname, '..');

async function main() {
    console.log(yellow("=== FileSwift Integrity Check ===\n"));

    let failed = false;

    // 1. JSON Validation
    console.log("1. Checking JSON Configuration Files...");
    const jsonFiles = [
        'package.json',
        'tsconfig.json',
        '../../package.json' // Root
    ];

    for (const file of jsonFiles) {
        const filePath = path.join(BACKEND_ROOT, file);
        try {
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf-8');
                JSON.parse(content);
                console.log(`  ✅ ${file} is valid JSON`);
            } else {
                console.log(yellow(`  ⚠️  ${file} not found (skipping)`));
            }
        } catch (e: any) {
            console.error(red(`  ❌ ${file} INVALID JSON: ${e.message}`));
            failed = true;
        }
    }

    // 2. TSC Check (Build)
    console.log("\n2. verifying TypeScript Build...");
    try {
        console.log("  Running 'tsc --noEmit'...");
        execSync('npx tsc --noEmit', { cwd: BACKEND_ROOT, stdio: 'pipe' });
        console.log(green("  ✅ TypeScript compiles successfully"));
    } catch (e: any) {
        console.error(red("  ❌ TypeScript Build Failed"));
        // Print only first few lines of error to avoid spam
        const output = e.stdout?.toString() || e.message;
        console.error(output.split('\n').slice(0, 10).join('\n'));
        failed = true;
    }

    // 3. Worker Compatibility Check
    console.log("\n3. Checking Production Worker Config...");
    const pkg = JSON.parse(fs.readFileSync(path.join(BACKEND_ROOT, 'package.json'), 'utf-8'));
    if (pkg.scripts['start:prod'] && pkg.scripts['start:prod'].includes('node dist/src/index.js')) {
        console.log(green("  ✅ 'start:prod' script is correctly configured for production"));
    } else {
        console.error(red("  ❌ 'start:prod' script missing or incorrect (Must use 'node dist/src/index.js')"));
        failed = true;
    }

    if (failed) {
        console.log(red("\n❌ VERIFICATION FAILED - DO NOT PUSH"));
        process.exit(1);
    } else {
        console.log(green("\n✅ VERIFICATION PASSED - SAFETY CHECK OK"));
    }
}

main();
