
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';

export const createTempDir = async (prefix: string = 'fileswift-'): Promise<string> => {
    const tmpDir = path.join(os.tmpdir(), `${prefix}${uuidv4()}`);
    await fs.ensureDir(tmpDir); // Recursive creation
    return tmpDir;
};

export const cleanTempDir = async (dirPath: string): Promise<void> => {
    try {
        if (dirPath && dirPath.startsWith(os.tmpdir())) {
            // Safety check: only delete if in tmpdir
            await fs.remove(dirPath);
        }
    } catch (e) {
        console.error(`[FS] Failed to clean temp dir ${dirPath}`, e);
    }
};
