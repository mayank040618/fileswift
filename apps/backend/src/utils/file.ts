import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';

/**
 * Creates a unique temporary directory for a job.
 * Uses OS temp dir + 'fileswift' prefix.
 */
export async function makeTempDir(prefix: string = 'job'): Promise<string> {
    const tmpBase = os.tmpdir();
    const dirName = `fileswift-${prefix}-${uuidv4()}`;
    const dirPath = path.join(tmpBase, dirName);
    await fs.ensureDir(dirPath);
    return dirPath;
}

/**
 * Safely removes a directory and all contents.
 * Swallows errors to prevent crashing on cleanup (just logs).
 */
export async function removeDir(dirPath: string): Promise<void> {
    try {
        if (dirPath && await fs.pathExists(dirPath)) {
            await fs.remove(dirPath);
        }
    } catch (e) {
        console.warn(`[file-util] Failed to cleanup temp dir ${dirPath}:`, e);
    }
}
