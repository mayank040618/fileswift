/**
 * Response Processor — validates and sanitizes all AI output.
 * Never sends raw LLM output to the frontend.
 */

/**
 * Process raw AI model output into a safe, clean response.
 */
export function processResponse(raw: string): string {
    if (!raw || !raw.trim()) {
        return 'No response was generated. Please try again.';
    }

    let processed = raw;

    // 1. Remove accidental JSON/code block wrappers if the output is pure text
    processed = stripWrappedCodeBlocks(processed);

    // 2. Remove hallucinated system/internal markers
    processed = removeInternalMarkers(processed);

    // 3. Clean up excessive whitespace
    processed = processed
        .replace(/\n{4,}/g, '\n\n\n')   // Collapse 4+ newlines to 3
        .replace(/[ \t]+$/gm, '')         // Trailing whitespace per line
        .trim();

    // 4. Safety: ensure output isn't suspiciously short (model may have errored)
    if (processed.length < 5) {
        return 'The AI returned an incomplete response. Please try again.';
    }

    return processed;
}

/**
 * Strip wrapping ```json or ```markdown blocks if the entire response is wrapped.
 * Keeps internal code blocks intact.
 */
function stripWrappedCodeBlocks(text: string): string {
    const trimmed = text.trim();

    // Only strip if the ENTIRE response is a single code block
    const match = trimmed.match(/^```(?:json|markdown|text|plaintext)?\s*\n([\s\S]*?)\n```\s*$/);
    if (match) {
        return match[1].trim();
    }

    return text;
}

/**
 * Remove internal LLM markers that shouldn't reach the user.
 */
function removeInternalMarkers(text: string): string {
    return text
        .replace(/^(SYSTEM|ASSISTANT|USER):\s*/gim, '')     // Role prefixes
        .replace(/\[INTERNAL\][\s\S]*?\[\/INTERNAL\]/gi, '') // Internal blocks
        .replace(/<!--[\s\S]*?-->/g, '')                      // HTML comments
        .replace(/<\|.*?\|>/g, '');                            // Model special tokens
}
