/**
 * Token estimation, budget enforcement, and document trimming.
 * Prevents token overflow errors before they reach the provider.
 */

import { AIError } from './errors';
import type { PlanLimits } from './types';

/** Approximate tokens from character count (~4 chars per token) */
export function estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
}

/**
 * Enforce token budget for a given plan.
 * If the input exceeds the plan's max, trim it with a truncation notice.
 * Returns the (possibly trimmed) text and whether trimming occurred.
 */
export function enforceTokenBudget(
    text: string,
    limits: PlanLimits
): { text: string; trimmed: boolean; estimatedTokens: number } {
    const estimated = estimateTokens(text);

    if (estimated <= limits.maxInputTokens) {
        return { text, trimmed: false, estimatedTokens: estimated };
    }

    // Trim to fit: convert token limit back to approximate character count
    const maxChars = limits.maxInputTokens * 4;
    const trimmedText =
        text.substring(0, maxChars) +
        '\n\n[... Document trimmed to fit processing limits. ' +
        `Showing first ~${limits.maxInputTokens.toLocaleString()} tokens.]`;

    return {
        text: trimmedText,
        trimmed: true,
        estimatedTokens: limits.maxInputTokens,
    };
}

/**
 * Validate that the request doesn't exceed hard limits.
 * Throws AIError if the raw input is completely empty or absurdly large.
 */
export function validateInputSize(text: string, limits: PlanLimits): void {
    // Empty input is handled elsewhere (AIOrchestrator validates prompt + files)
    // Here we guard against absurd payloads (e.g., 500MB base64 string)
    const estimatedMB = text.length / (1024 * 1024);
    if (estimatedMB > limits.maxFileSizeMB * 2) {
        throw new AIError(
            'AI_TOKEN_OVERFLOW',
            `Document payload is too large (${estimatedMB.toFixed(1)}MB). Maximum allowed: ${limits.maxFileSizeMB}MB.`
        );
    }
}
