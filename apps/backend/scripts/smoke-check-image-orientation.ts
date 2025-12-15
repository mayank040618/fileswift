
import sharp from 'sharp';
import fs from 'fs-extra';
import path from 'path';
import { normalizeImage } from '../src/utils/normalizeImage';

const TMP_DIR = path.join(__dirname, '../../temp_orientation_check');

async function run() {
    console.log("=== Image Orientation Logic Verification ===");
    await fs.ensureDir(TMP_DIR);

    try {
        // 1. Create a Landscape Image (200x100)
        // Set Orientation: 6 (Rotated 90 CW). 
        // This means the "visual" image should be Portrait (100x200).
        const width = 200;
        const height = 100;

        const inputPath = path.join(TMP_DIR, 'input-orientation-6.jpg');

        await sharp({
            create: {
                width,
                height,
                channels: 3,
                background: { r: 255, g: 0, b: 0 }
            }
        })
            .withMetadata({ orientation: 6 })
            .jpeg()
            .toFile(inputPath);

        console.log(`[Setup] Created ${inputPath} (Physical: ${width}x${height}, EXIF: 6)`);

        // 2. Normalize
        console.log(`[Test] Running normalizeImage...`);
        const result = await normalizeImage(inputPath);

        // 3. Assertions
        console.log(`[Assert] Output Dimensions: ${result.width}x${result.height}`);

        // Expect dimensions to be swapped because it was rotated 90 deg
        if (result.width === 100 && result.height === 200) {
            console.log("✅ Dimensions correct (Rotated)");
        } else {
            console.error(`❌ Dimensions incorrect. Expected 100x200, got ${result.width}x${result.height}`);
            process.exit(1);
        }

        // Check Metadata
        const meta = await sharp(result.buffer).metadata();
        if (!meta.orientation) {
            console.log("✅ Orientation metadata stripped");
        } else {
            console.error(`❌ Metadata NOT stripped. Orientation: ${meta.orientation}`);
            process.exit(1);
        }

        console.log("=== Verification Passed ===");
    } catch (e) {
        console.error("Test Failed", e);
        process.exit(1);
    } finally {
        await fs.remove(TMP_DIR);
    }
}

run();
