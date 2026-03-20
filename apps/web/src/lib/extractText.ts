/**
 * Server-side text extraction from uploaded files.
 * Used by the /api/ai/execute route.
 */

export interface ExtractedFile {
    fileName: string;
    type: string;
    extractedText: string;
}

interface FileInput {
    name: string;
    type: string;
    base64: string;
}

/**
 * Extract text from uploaded files based on their type.
 */
export async function extractTextFromFiles(files: FileInput[]): Promise<ExtractedFile[]> {
    const results: ExtractedFile[] = [];

    for (const file of files) {
        try {
            let text = '';

            if (file.type === 'application/pdf') {
                // Try basic text extraction first
                text = extractPdfTextBasic(file.base64);
                
                // Note: We don't call performOCR for PDFs here anymore. 
                // AIOrchestrator handles the high-fidelity runOCR fallback if this text is insufficient.
            } else if (file.type.startsWith('text/') || isTextType(file.type)) {
                text = Buffer.from(file.base64, 'base64').toString('utf-8');
            } else if (file.type.startsWith('image/')) {
                // Use OCR for images
                const ocrText = await performOCR(file.base64, file.type);
                if (ocrText) {
                    text = ocrText;
                } else {
                    text = `[Image file: ${file.name}. OCR could not extract text.]`;
                }
            } else {
                // Try to decode as text
                try {
                    text = Buffer.from(file.base64, 'base64').toString('utf-8');
                    const nonPrintable = text.split('').filter(c => {
                        const code = c.charCodeAt(0);
                        return code < 32 && code !== 9 && code !== 10 && code !== 13;
                    }).length;
                    if (nonPrintable > text.length * 0.1) {
                        text = `[Binary file: ${file.name} (${file.type}). Cannot extract text content.]`;
                    }
                } catch {
                    text = `[Unsupported file type: ${file.name} (${file.type})]`;
                }
            }

            // Fallback for any case where text is completely empty
            if (!text || text.trim() === '') {
                text = `[File: ${file.name} (${file.type}). Content could not be extracted.]`;
            }

            results.push({ fileName: file.name, type: file.type, extractedText: text });
        } catch (err) {
            results.push({
                fileName: file.name,
                type: file.type,
                extractedText: `[Error extracting ${file.name}: ${err instanceof Error ? err.message : 'Unknown error'}]`,
            });
        }
    }

    return results;
}

/**
 * Perform OCR using Azure Document Intelligence (Read API).
 * Falls back gracefully if not configured.
 */
async function performOCR(base64Data: string, mimeType: string): Promise<string | null> {
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const apiKey = process.env.AZURE_AI_KEY;

    if (!endpoint || !apiKey) {
        return null;
    }

    try {
        // Use Azure OpenAI's vision capability via chat completions
        // Send the file as a base64 image to GPT-4o mini for OCR
        const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || 'o4-mini';
        const aiUrl = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=2024-12-01-preview`;

        // For PDFs, we'll describe what we need; for images, send directly
        const dataUrl = `data:${mimeType};base64,${base64Data}`;

        const response = await fetch(aiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': apiKey,
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: 'system',
                        content: 'You are an OCR assistant. Extract ALL text from the provided image/document exactly as it appears. Preserve the structure, headings, bullet points, and formatting. Output ONLY the extracted text, nothing else.',
                    },
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'image_url',
                                image_url: { url: dataUrl, detail: 'high' },
                            },
                            {
                                type: 'text',
                                text: 'Extract all text from this image/document. Preserve structure and formatting.',
                            },
                        ],
                    },
                ],
                max_completion_tokens: 4096,
            }),
        });

        if (!response.ok) {
            console.error('[OCR] Azure vision error:', response.status);
            return null;
        }

        const data = await response.json();
        const extractedText = data.choices?.[0]?.message?.content;

        if (extractedText && extractedText.trim().length > 10) {
            return extractedText.trim();
        }

        return null;
    } catch (err) {
        console.error('[OCR] Error:', err);
        return null;
    }
}

/**
 * Check if a MIME type is a text-based type.
 */
function isTextType(mimeType: string): boolean {
    const textTypes = [
        'application/json',
        'application/xml',
        'application/javascript',
        'application/x-javascript',
        'application/csv',
        'application/x-yaml',
    ];
    return textTypes.includes(mimeType) || mimeType.endsWith('+xml') || mimeType.endsWith('+json');
}

/**
 * Basic PDF text extraction using raw buffer parsing.
 * Extracts text streams from the PDF binary without external dependencies.
 * For complex PDFs, consider adding `pdf-parse` package for better results.
 */
function extractPdfTextBasic(base64Data: string): string {
    try {
        const buffer = Buffer.from(base64Data, 'base64');
        const pdfString = buffer.toString('latin1');

        // Extract text between BT/ET markers (PDF text objects)
        const textParts: string[] = [];
        // More resilient BT...ET matching (handles various newlines/whitespace)
        const btRegex = /BT[\s\r\n]([\s\S]*?)ET/g;
        let match;

        while ((match = btRegex.exec(pdfString)) !== null) {
            const block = match[1];

            // Match text operators: Tj, TJ, ' and "
            // Tj = show string, TJ = show array of strings
            // Also matching ' (move and show) and " (set spacing and show)
            const tjRegex = /\(([^)]*)\)\s*(Tj|['"])/g;
            let tjMatch;
            while ((tjMatch = tjRegex.exec(block)) !== null) {
                const decoded = decodePdfString(tjMatch[1]);
                if (decoded.trim()) textParts.push(decoded);
            }

            // TJ arrays: [(text) num (text) ...]
            const tjArrayRegex = /\[(.*?)\]\s*TJ/g;
            let tjArrMatch;
            while ((tjArrMatch = tjArrayRegex.exec(block)) !== null) {
                const arrayContent = tjArrMatch[1];
                const strRegex = /\(([^)]*)\)/g;
                let strMatch;
                const parts: string[] = [];
                while ((strMatch = strRegex.exec(arrayContent)) !== null) {
                    parts.push(decodePdfString(strMatch[1]));
                }
                if (parts.length > 0) textParts.push(parts.join(''));
            }
        }

        const result = textParts.join(' ').replace(/\s+/g, ' ').trim();

        if (!result || result.trim().length === 0) {
            return '[PDF text extraction returned empty. This PDF might be image-based or use unsupported text encoding.]';
        }

        // Truncate very long PDFs to avoid token limits
        const MAX_LENGTH = 50000; // ~12k tokens
        if (result.length > MAX_LENGTH) {
            return result.substring(0, MAX_LENGTH) + '\n\n[... text truncated due to length. First 50,000 characters shown.]';
        }

        return result;
    } catch (err) {
        return `[Failed to parse PDF: ${err instanceof Error ? err.message : 'Unknown error'}]`;
    }
}

/**
 * Decode PDF escape sequences in strings.
 */
function decodePdfString(str: string): string {
    return str
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t')
        .replace(/\\\\/g, '\\')
        .replace(/\\([()])/g, '$1')
        .replace(/\\(\d{3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)));
}
