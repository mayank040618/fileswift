
import { imageProcessors } from '../src/processors/image';
import { fileProcessors } from '../src/processors/file';
import { documentProcessors } from '../src/processors/document';

console.log('[Headless Check] Loading Processors...');

try {
    const all = [...imageProcessors, ...fileProcessors, ...documentProcessors];
    console.log(`[Headless Check] Loaded ${all.length} processors.`);

    // Check for obvious browser globals leaking into global scope
    if (typeof (global as any).window !== 'undefined') {
        throw new Error("FAIL: 'window' is defined in global scope!");
    }
    if (typeof (global as any).document !== 'undefined') {
        throw new Error("FAIL: 'document' is defined in global scope!");
    }
    if (typeof (global as any).DOMMatrix !== 'undefined') {
        // We removed it, so it should be undefined unless Node added it natively (Node 22??)
        // Actually Node doesn't have it standard yet.
        console.warn("WARN: DOMMatrix is defined. If this is native Node, it's okay. If polyfill, BAD.");
    }

    console.log('[Headless Check] SUCCESS - No immediate crash on import.');
    process.exit(0);
} catch (e: any) {
    console.error('[Headless Check] CRITICAL FAIL:', e.message);
    process.exit(1);
}
