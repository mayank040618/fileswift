
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

const TMP_DIR = path.join(os.tmpdir(), 'fileswift');
const MAX_AGE_MS = 60 * 60 * 1000; // 1 Hour

async function cleanup() {
    console.log(`[Cleanup] Checking ${TMP_DIR} for old files...`);

    if (!await fs.pathExists(TMP_DIR)) {
        console.log("[Cleanup] Output directory does not exist yet.");
        return;
    }

    const files = await fs.readdir(TMP_DIR);
    let deletedCount = 0;
    const now = Date.now();

    for (const file of files) {
        try {
            const filePath = path.join(TMP_DIR, file);
            const stats = await fs.stat(filePath);

            if (now - stats.mtimeMs > MAX_AGE_MS) {
                await fs.remove(filePath);
                deletedCount++;
                console.log(`[Cleanup] Deleted old job dir: ${file}`);
            }
        } catch (e) {
            console.error(`[Cleanup] Failed to specific file ${file}`, e);
        }
    }

    console.log(`[Cleanup] Finished. Deleted ${deletedCount} item(s).`);
}

cleanup().catch(console.error);
