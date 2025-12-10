import fs from 'fs-extra';
import path from 'path';
import os from 'os';

const TEMP_DIR = path.join(os.tmpdir(), 'fileswift');
const TTL_SECONDS = parseInt(process.env.TTL_UPLOAD_SECONDS || '3600');
const TTL_MS = TTL_SECONDS * 1000;

export const runCleanup = async () => {
    try {
        if (!await fs.pathExists(TEMP_DIR)) return;

        const files = await fs.readdir(TEMP_DIR);
        const now = Date.now();
        let count = 0;

        for (const file of files) {
            const filePath = path.join(TEMP_DIR, file);
            // We expect directories here for each job
            try {
                const stats = await fs.stat(filePath);
                if (now - stats.mtimeMs > TTL_MS) {
                    await fs.remove(filePath);
                    count++;
                }
            } catch (e) {
                // Ignore errors for individual files (race conditions etc)
            }
        }
        if (count > 0) console.log(`[Cleanup] Removed ${count} expired job directories.`);
    } catch (e) {
        console.error("[Cleanup] Error:", e);
    }
};
