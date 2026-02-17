import { ToolProcessor } from '../processors/types';
import {
    summarizeProcessor,
    notesProcessor,
    rewriteProcessor,
    translateProcessor,
    docToPdfProcessor
} from '../processors/document';
import {
    imageResizerProcessor,
    imageCompressorProcessor,
    bulkImageResizerProcessor,
    imageToPdfProcessor,
    removeBgProcessor
} from '../processors/image';
import {
    compressPdfProcessor,
    pdfToWordProcessor,
    mergePdfProcessor,
    rotatePdfProcessor,
    splitPdfProcessor,
    pdfToImageProcessor
} from '../processors/file';

export const TOOL_PROCESSORS: Record<string, ToolProcessor> = {
    // PDF Tools
    'compress-pdf': compressPdfProcessor,
    'pdf-to-word': pdfToWordProcessor,
    'merge-pdf': mergePdfProcessor,
    'rotate-pdf': rotatePdfProcessor,
    'split-pdf': splitPdfProcessor,
    'pdf-to-image': pdfToImageProcessor,
    'doc-to-pdf': docToPdfProcessor,

    // Image Tools
    'image-compressor': imageCompressorProcessor,
    'image-resizer': imageResizerProcessor,
    'bulk-image-resizer': bulkImageResizerProcessor,
    'image-to-pdf': imageToPdfProcessor,
    'remove-bg': removeBgProcessor,

    // AI Tools
    'ai-summary': summarizeProcessor,
    'ai-notes': notesProcessor,
    'ai-rewrite': rewriteProcessor,
    'ai-translate': translateProcessor,

    // Aliases: specialized tools mapped to parent processors
    'compress-pdf-for-bank-statement': compressPdfProcessor,
    'compress-pdf-for-email': compressPdfProcessor,
    'compress-pdf-to-1mb': compressPdfProcessor,
    'compress-pdf-under-200kb': compressPdfProcessor,
    'resize-image-for-youtube-thumbnail': imageResizerProcessor,
    'resize-photo-for-resume': imageResizerProcessor,
    'resize-image-for-instagram': imageResizerProcessor,
    'resize-image-for-linkedin': imageResizerProcessor,
    'resize-image-for-facebook': imageResizerProcessor,
    'convert-scanned-pdf-to-word': pdfToWordProcessor,
    'convert-pdf-to-word-online': pdfToWordProcessor,

    // Explicitly NO 'default' key here.
    // If a tool is not in this list, it is INVALID.
};

export type ToolId = keyof typeof TOOL_PROCESSORS;

export const isValidToolId = (id: string): id is ToolId => {
    return id in TOOL_PROCESSORS;
};

export const getProcessor = (id: string): ToolProcessor => {
    const processor = TOOL_PROCESSORS[id];
    if (!processor) {
        throw new Error(`CRITICAL FAILURE: No processor registered for tool '${id}'`);
    }
    return processor;
};
