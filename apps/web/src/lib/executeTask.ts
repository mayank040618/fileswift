/**
 * Engine-agnostic task execution layer.
 * Single entry point for all workspace actions.
 */

import { filesToPayload, validateFiles, type FilePayload } from './fileUtils';
import { getOrCreateSessionId } from './session';

export interface TaskRequest {
    type: 'ai' | 'compress' | 'convert';
    prompt?: string;
    files?: File[];
}

export interface TaskResult {
    success: boolean;
    output: string;
    metadata?: {
        tokensUsed?: number;
        engine?: string;
    };
    error?: string;
}

/**
 * Execute a workspace task.
 * Validates files, converts to payloads, and calls the appropriate API.
 */
export async function executeTask(request: TaskRequest): Promise<TaskResult> {
    const { type, prompt, files } = request;

    // Validate that we have some input
    if (!prompt?.trim() && (!files || files.length === 0)) {
        return { success: false, output: '', error: 'Please provide a prompt or upload a file.' };
    }

    // Validate files if present
    if (files && files.length > 0) {
        const validation = validateFiles(files, 'free'); // TODO: detect user tier
        if (!validation.valid) {
            return { success: false, output: '', error: validation.errors.join('\n') };
        }
    }

    // Route to the appropriate handler
    switch (type) {
        case 'ai':
            return executeAI(prompt, files);
        case 'compress':
        case 'convert':
            // Future: route to compress/convert APIs
            return { success: false, output: '', error: `"${type}" is not yet implemented.` };
        default:
            return { success: false, output: '', error: `Unknown task type: ${type}` };
    }
}

/**
 * Execute AI task — converts files and calls /api/ai/execute
 */
async function executeAI(prompt?: string, files?: File[]): Promise<TaskResult> {
    let filePayloads: FilePayload[] = [];

    if (files && files.length > 0) {
        try {
            filePayloads = await filesToPayload(files);
        } catch (err) {
            return {
                success: false,
                output: '',
                error: `Failed to process files: ${err instanceof Error ? err.message : 'Unknown error'}`,
            };
        }
    }

    const sessionId = getOrCreateSessionId();

    try {
        const response = await fetch('/api/ai/execute', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-ID': sessionId,
            },
            body: JSON.stringify({
                prompt: prompt?.trim() || '',
                files: filePayloads,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            const errorMsg = typeof data.error === 'object' 
                ? data.error.message || JSON.stringify(data.error)
                : data.error || `Server error (${response.status})`;
                
            return {
                success: false,
                output: '',
                error: errorMsg,
            };
        }

        const outputStr = typeof data.output === 'object'
            ? data.output.message || JSON.stringify(data.output)
            : data.output || '';

        return {
            success: true,
            output: outputStr,
            metadata: data.metadata,
        };
    } catch (err) {
        return {
            success: false,
            output: '',
            error: err instanceof Error ? err.message : 'Network error. Please try again.',
        };
    }
}
