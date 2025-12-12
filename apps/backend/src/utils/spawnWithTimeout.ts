import { spawn, SpawnOptions } from 'child_process';
import treeKill from 'tree-kill';

export interface SpawnResult {
    stdout: string;
    stderr: string;
    code: number | null;
    timedOut: boolean;
}

const DEFAULT_TIMEOUT = parseInt(process.env.PDF_COMPRESSION_TIMEOUT_MS || '30000');

/**
 * Spawns a child process with a strict timeout.
 * - Captures stdout/stderr (truncated to 50KB to avoid excessive memory usage).
 * - Kills the ENTIRE process tree on timeout using 'tree-kill'.
 * - Returns { timedOut: true } if timeout occurred.
 */
export function spawnWithTimeout(
    command: string,
    args: string[],
    options: SpawnOptions = {},
    timeoutMs: number = DEFAULT_TIMEOUT
): Promise<SpawnResult> {
    return new Promise((resolve, reject) => {
        console.log(`[spawn] Starting: ${command} ${args.join(' ')}`);
        const child = spawn(command, args, { ...options, shell: false }); // shell: false for safety
        console.log(`[spawn] PID: ${child.pid}`);

        let stdout = '';
        let stderr = '';
        let timedOut = false;
        let completed = false;

        // Safety cap for logs
        const MAX_LOG_SIZE = 50 * 1024; // 50KB

        if (child.stdout) {
            child.stdout.on('data', (data) => {
                if (stdout.length < MAX_LOG_SIZE) stdout += data.toString();
            });
        }

        if (child.stderr) {
            child.stderr.on('data', (data) => {
                if (stderr.length < MAX_LOG_SIZE) stderr += data.toString();
            });
        }

        const timer = setTimeout(() => {
            if (completed) return;
            timedOut = true;
            if (child.pid) {
                treeKill(child.pid, 'SIGKILL', (err) => {
                    if (err) console.error(`[spawnWithTimeout] Failed to kill ${child.pid}:`, err);
                });
            }
            // We resolve (not reject) to allow caller cleanup handles
            resolve({
                stdout,
                stderr: stderr + '\n[spawnWithTimeout] Process timed out and was killed.',
                code: null,
                timedOut: true
            });
        }, timeoutMs);

        child.on('close', (code) => {
            if (timedOut) return; // Already handled
            completed = true;
            clearTimeout(timer);
            resolve({
                stdout,
                stderr,
                code,
                timedOut: false
            });
        });

        child.on('error', (err) => {
            if (timedOut) return;
            completed = true;
            clearTimeout(timer);
            reject(err);
        });
    });
}
