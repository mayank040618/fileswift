import { PDFDocument, PDFName, PDFDict, PDFStream } from 'pdf-lib';

/**
 * Runs OCR on an image-based PDF or raw Image file natively without external OS dependencies.
 * Extracts embedded images from the PDF using pdf-lib and sends them to Azure Vision OCR.
 */
export async function runOCR(file: { name: string; type: string; base64: string; size?: number }): Promise<string> {
    const isPro = true; // Assume Pro for now, or get from session
    const maxPages = isPro ? 50 : 20;

    let base64Images: string[] = [];

    if (file.type === 'application/pdf') {
        base64Images = await extractImagesFromPdf(file.base64, maxPages);
    } else if (file.type.startsWith('image/')) {
        base64Images.push(`data:${file.type};base64,${file.base64}`);
    } else {
        throw new Error(`Unsupported file type for OCR: ${file.type}`);
    }

    if (base64Images.length === 0) {
        throw new Error('No images could be extracted for OCR processing.');
    }

    let combinedText = '';

    // Process each image through Azure Vision Custom OCR
    for (let i = 0; i < base64Images.length; i++) {
        const ocrText = await performAzureVisionOCR(base64Images[i]);
        if (ocrText) {
            combinedText += `${ocrText}\n\n`;
        }
    }

    if (!combinedText.trim()) {
        throw new Error('OCR returned no text.');
    }

    return cleanText(combinedText);
}

/**
 * Cleans up OCR text artifacts safely.
 */
function cleanText(text: string): string {
    return text
        .replace(/\r\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n') // Collapse multiple newlines
        .replace(/^[^\w\n]{10,}/gm, '') // Remove heavy junk symbol lines
        .replace(/[^\x20-\x7E\n]/g, '') // Basic ascii filter for junk
        .trim();
}

/**
 * Extracts raw images from a PDF base64 format using pdf-lib.
 * This skips OS-level rendering dependencies by parsing embedded objects directly.
 */
async function extractImagesFromPdf(base64Pdf: string, maxPages: number): Promise<string[]> {
    const pdfBytes = Buffer.from(base64Pdf, 'base64');
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();

    const extractedImages: string[] = [];
    const limit = Math.min(pages.length, maxPages);

    for (let i = 0; i < limit; i++) {
        const page = pages[i];

        // Dig into page resources to find XObjects
        const resources = page.node.Resources();
        if (!resources) continue;

        const xObjects = resources.lookup(PDFName.of('XObject'), PDFDict);
        if (!xObjects) continue;

        const xObjectEntries = xObjects.entries();

        for (const [_, xObject] of xObjectEntries) {
            if (xObject instanceof PDFStream) {
                const subtype = xObject.dict.lookup(PDFName.of('Subtype'));
                if (subtype === PDFName.of('Image')) {
                    const filter = xObject.dict.lookup(PDFName.of('Filter'));

                    // Simple DCTDecode (JPEG) handling wrapper
                    if (filter === PDFName.of('DCTDecode')) {
                        const imageBytes = xObject.contents;
                        const base64Image = Buffer.from(imageBytes).toString('base64');
                        extractedImages.push(`data:image/jpeg;base64,${base64Image}`);
                        break; // Get one main image per page
                    }
                    else if (filter === PDFName.of('FlateDecode')) {
                        // For PNG/Lossless - more complex to decode natively without canvas, 
                        // but we will try to just wrap it and see if Vision can read raw Flate as PNG.
                        // (Usually requires zlib unzipping, but we will focus on DCTDecode for scanned PDFs)
                        // If we fail here, a more robust library like pdf2pic could be used.
                    }
                }
            }
        }
    }

    // Fallback: If no DCTDecode images found natively, we might need pdf2pic, 
    // but we'll try to just return the error gracefully.
    return extractedImages;
}

/**
 * Sends a single base64 image data URL to Azure Vision (GPT-4o-mini natively supports images).
 */
async function performAzureVisionOCR(dataUrl: string): Promise<string | null> {
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const apiKey = process.env.AZURE_AI_KEY;
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || 'o4-mini';

    if (!endpoint || !apiKey) return null;

    const aiUrl = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=2024-12-01-preview`;

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
                    content: 'You are an OCR assistant. Extract ALL text from the provided image exactly as it appears. Output ONLY the extracted text, nothing else.',
                },
                {
                    role: 'user',
                    content: [
                        { type: 'image_url', image_url: { url: dataUrl, detail: 'high' } },
                        { type: 'text', text: 'Extract all text from this image.' },
                    ],
                },
            ],
            max_completion_tokens: 4096,
        }),
    });

    if (!response.ok) {
        console.error('[runOCR] Azure vision error:', response.status, await response.text());
        return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
}
