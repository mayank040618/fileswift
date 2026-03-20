/**
 * Execution Logger — structured observability for every AI call.
 * Outputs structured JSON to console (ready for future DB/analytics pipeline).
 */

import type { ExecutionLog } from './types';

/**
 * Log an AI execution event.
 * Currently writes to console as structured JSON.
 * Future: push to database (ToolExecutions table) or analytics service.
 */
export function logExecution(log: ExecutionLog): void {
    const entry = {
        ...log,
        _source: 'FileSwiftAI',
        _version: '2.0',
    };

    if (log.success) {
        console.log('[AI:OK]', JSON.stringify(entry));
    } else {
        console.warn('[AI:FAIL]', JSON.stringify(entry));
    }
}

/**
 * Create a timer for measuring latency.
 */
export function createTimer(): { elapsed: () => number } {
    const start = Date.now();
    return {
        elapsed: () => Date.now() - start,
    };
}
