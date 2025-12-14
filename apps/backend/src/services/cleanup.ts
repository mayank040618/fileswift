import fs from 'fs-extra';
import path from 'path';
import os from 'os';

const TEMP_DIR = path.join(os.tmpdir(), 'fileswift');
const UPLOAD_DIR = path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads');
const TTL_SECONDS = parseInt(process.env.TTL_UPLOAD_SECONDS || '3600');
const TTL_MS = TTL_SECONDS * 1000;

export const runCleanup = async () => {
    const cleanDir = async (dir: string) => {
        try {
            if (!await fs.pathExists(dir)) return;

            const files = await fs.readdir(dir);
            const now = Date.now();
            let count = 0;

            for (const file of files) {
                // Skip .gitkeep or special files
                if (file.startsWith('.')) continue;

                const filePath = path.join(dir, file);
                try {
                    const stats = await fs.stat(filePath);
                    if (now - stats.mtimeMs > TTL_MS) {
                        await fs.remove(filePath);
                        count++;
                    }
                } catch (e) {
                    // Ignore errors for individual files
                }
            }
            if (count > 0) console.log(`[Cleanup] Removed ${count} expired items from ${dir}`);
        } catch (e) {
            console.error(`[Cleanup] Error cleaning ${dir}:`, e);
        }
    };

    await Promise.all([
        cleanDir(TEMP_DIR),
        cleanDir(UPLOAD_DIR)
    ]);
};
