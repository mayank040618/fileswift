export type SummaryMode = 'brief' | 'detailed' | 'bullets';

export interface SummarizeResult {
    success: boolean;
    summary?: string;
    error?: string;
    isMock?: boolean;
}

/**
 * Extract text content from a PDF file
 * Uses dynamic import to avoid SSR issues
 */
export async function extractTextFromPDF(file: File): Promise<{ success: boolean; text?: string; error?: string }> {
    try {
        // Dynamic import to avoid SSR issues
        const pdfjsLib = await import('pdfjs-dist');

        // Configure worker
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
                // @ts-ignore
                .map((item: any) => item.str)
                .join(' ');
            fullText += pageText + '\n\n';
        }

        if (!fullText.trim()) {
            return {
                success: false,
                error: 'No text found in PDF. The document might be image-based or empty.'
            };
        }

        return { success: true, text: fullText.trim() };
    } catch (error: any) {
        console.error('PDF extraction error:', error);
        return {
            success: false,
            error: error.message || 'Failed to extract text from PDF'
        };
    }
}

/**
 * Summarize PDF content using the AI API
 */
export async function summarizePDF(
    file: File,
    mode: SummaryMode = 'brief',
    onProgress?: (status: string) => void
): Promise<SummarizeResult> {
    try {
        // Step 1: Extract text
        onProgress?.('Extracting text from PDF...');
        const extraction = await extractTextFromPDF(file);

        if (!extraction.success || !extraction.text) {
            return { success: false, error: extraction.error };
        }

        // Step 2: Send to API for summarization
        onProgress?.('Generating AI summary...');
        const response = await fetch('/api/summarize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: extraction.text, mode }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `API error: ${response.status}`);
        }

        const data = await response.json();

        return {
            success: true,
            summary: data.summary,
            isMock: data.isMock
        };
    } catch (error: any) {
        console.error('Summarization error:', error);
        return {
            success: false,
            error: error.message || 'Failed to summarize PDF'
        };
    }
}
