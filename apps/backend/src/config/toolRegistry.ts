export const VALID_TOOL_IDS = [
    'compress-pdf',
    'image-compressor',
    'image-to-pdf',
    'pdf-to-word',
    'merge-pdf',
    'rotate-pdf',
    'image-resizer',
    'bulk-image-resizer',
    'pdf-to-image',
    'doc-to-pdf',
    // AI Tools (Coming Soon but valid IDs)
    'ai-chat',
    'ai-summary',
    'ai-mcq',
    'ai-notes',
    'ai-rewrite',
    'ai-translate',
    'remove-bg',
    'ai-upscale',
    'ai-enhance',
    'ai-colorize'
] as const;

export type ToolId = typeof VALID_TOOL_IDS[number];

export const isToolIdValid = (id: string): id is ToolId => {
    return VALID_TOOL_IDS.includes(id as ToolId);
};
