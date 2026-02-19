// Client-side file processors for FileSwift
// These run entirely in the browser - no server needed!

export { mergePDFs } from './pdf-merge';
export { rotatePDF } from './pdf-rotate';
export { splitPDF } from './pdf-split';
export { imagesToPDF } from './image-to-pdf';
export { compressImage, compressImages } from './image-compress';
export { resizeImage, resizeImages } from './image-resize';
export { summarizePDF, extractTextFromPDF, type SummaryMode, type SummarizeResult } from './pdf-summarize';
export { convertImageFormat } from './image-convert';
// removeBackground is NOT exported here — it's dynamically imported in ToolClient
// to avoid bundling the 21MB @imgly/background-removal package on every page

// Types
export interface ProcessorResult {
    success: boolean;
    blob?: Blob;
    blobs?: Blob[];
    filename?: string;
    filenames?: string[];
    originalSize?: number;
    finalSize?: number;
    error?: string;
}

// List of tools that can be processed client-side
export const CLIENT_SIDE_TOOLS = [
    'merge-pdf',
    'rotate-pdf',
    'split-pdf',
    'image-to-pdf',
    'image-compressor',
    'image-resizer',
    'summarize-pdf',
    'resize-image-for-youtube-thumbnail',
    'resize-photo-for-resume',
    'resize-image-for-instagram',
    'resize-image-for-linkedin',
    'resize-image-for-facebook',
    'remove-background',
    'jpg-to-png',
    'png-to-jpg',
    'heic-to-jpg',
    'ai-chat',
] as const;

export type ClientSideTool = typeof CLIENT_SIDE_TOOLS[number];

export function isClientSideTool(toolId: string): toolId is ClientSideTool {
    return CLIENT_SIDE_TOOLS.includes(toolId as ClientSideTool);
}

