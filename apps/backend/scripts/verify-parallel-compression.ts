
import path from 'path';
import fs from 'fs-extra';
import { fileProcessors } from '../src/processors/file';

async function runVerification() {
    const testPdfPath = path.join(process.cwd(), 'uploads/1765358767140-dummy_test.pdf');
    if (!await fs.pathExists(testPdfPath)) {
        console.error("Test PDF not found at " + testPdfPath);
        process.exit(1);
    }

    // Create 10 copies
    const tempDir = path.join(process.cwd(), 'temp-verify-' + Date.now());
    await fs.ensureDir(tempDir);
    const outputDir = path.join(tempDir, 'output');
    await fs.ensureDir(outputDir);

    const inputs: string[] = [];
    for (let i = 0; i < 5; i++) {
        const dest = path.join(tempDir, `input-${i}.pdf`);
        await fs.copy(testPdfPath, dest);
        inputs.push(dest);
    }

    const processor = fileProcessors.find(p => p.id === 'compress-pdf');
    if (!processor) throw new Error("Processor not found");

    console.log(`Starting parallel compression verification with ${inputs.length} files...`);
    const start = Date.now();

    try {
        await processor.process({
            job: {
                id: 'verify-job-' + Date.now(),
                data: {
                    toolId: 'compress-pdf',
                    filename: 'verify.zip',
                    data: { quality: 75 } // Default quality
                }
            },
            localPath: inputs[0], // primary
            inputPaths: inputs,
            outputDir: outputDir
        });

        const end = Date.now();
        console.log(`Processed ${inputs.length} files in ${(end - start) / 1000} seconds.`);

        // simple heuristic: if it was purely sequential and each took X, total would be N*X.
        // With parallelism, it should be closer to max(X) or typically faster than sum.
        // But since we are copying mostly if tools fail (or running fast GS), the overhead might dominate.
        // However, this script proves it DOESN'T CRASH and handles multiple files.

    } catch (e) {
        console.error("Verification failed", e);
    } finally {
        await fs.remove(tempDir);
    }
}

runVerification();
