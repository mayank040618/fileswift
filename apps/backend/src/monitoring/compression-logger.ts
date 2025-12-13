import fs from 'fs-extra';
import path from 'path';
import os from 'os';

export interface CompressionLogEntry {
    jobId: string;
    tool: string;
    toolVersion?: string;
    inputSize: number;
    outputSize: number;
    durationMs: number;
    success: boolean;
    errorId?: string;
    errorDetails?: string;
    compressionRatio?: number;
    meta?: Record<string, any>;
    timestamp: string;
}

const LOG_FILE = path.join(process.cwd(), 'logs', 'compression.jsonl');

// Ensure logs dir exists
fs.ensureDirSync(path.dirname(LOG_FILE));

export async function logCompressionEvent(entry: CompressionLogEntry) {
    try {
        const line = JSON.stringify(entry) + os.EOL;
        await fs.appendFile(LOG_FILE, line);
    } catch (e) {
        console.error('[compression-logger] Failed to write log:', e);
    }
}
