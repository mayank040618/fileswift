import { spawnWithTimeout } from "./spawnWithTimeout";

interface ToolStatus {
    ghostscript: boolean;
    qpdf: boolean;
    sips: boolean;
    gsVersion: string | null;
    qpdfVersion: string | null;
    checked: boolean;
    timestamp: number;
}

let cachedStatus: ToolStatus = {
    ghostscript: false,
    qpdf: false,
    sips: false,
    gsVersion: null,
    qpdfVersion: null,
    checked: false,
    timestamp: 0
};

export const checkTools = async (force = false): Promise<ToolStatus> => {
    // Return cached if checked within last 5 minutes and not forced
    if (!force && cachedStatus.checked && (Date.now() - cachedStatus.timestamp < 5 * 60 * 1000)) {
        return cachedStatus;
    }

    const status: ToolStatus = { ...cachedStatus, checked: true, timestamp: Date.now() };

    // Check Ghostscript
    try {
        const gs = await spawnWithTimeout('gs', ['--version'], {}, 2000);
        if (gs.code === 0) {
            status.ghostscript = true;
            status.gsVersion = gs.stdout.trim();
        } else {
            status.ghostscript = false;
            status.gsVersion = null;
        }
    } catch {
        status.ghostscript = false;
        status.gsVersion = null;
    }

    // Check QPDF
    try {
        const qpdf = await spawnWithTimeout('qpdf', ['--version'], {}, 2000);
        if (qpdf.code === 0) {
            status.qpdf = true;
            status.qpdfVersion = qpdf.stdout.split('\n')[0].trim();
        } else {
            status.qpdf = false;
            status.qpdfVersion = null;
        }
    } catch {
        status.qpdf = false;
        status.qpdfVersion = null;
    }

    // Check SIPS
    if (process.platform === 'darwin') {
        try {
            const sips = await spawnWithTimeout('sips', ['--version'], {}, 2000);
            if (sips.code === 0 || (sips.stdout && sips.stdout.includes('sips'))) {
                status.sips = true;
            }
        } catch { status.sips = false; }
    } else {
        status.sips = false;
    }

    cachedStatus = status;
    return status;
};

// Auto-check on import (optional, but good for startup logs)
// checkTools().then(s => console.log('[Tools] System tools detected:', { gs: s.ghostscript, qpdf: s.qpdf }));
