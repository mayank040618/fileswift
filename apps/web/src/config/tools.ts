export interface Tool {
    id: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    slug: string;
    type: 'document' | 'image' | 'file';
    ai?: boolean;
    comingSoon?: boolean;
}

export const TOOLS: Tool[] = [
    // 1. Compress PDF
    {
        id: 'compress-pdf',
        title: 'Compress PDF',
        description: 'Reduce file size efficiently.',
        icon: 'Minimize2',
        color: 'bg-red-500',
        slug: '/tools/compress-pdf',
        type: 'file'
    },
    // 2. PDF to Word
    {
        id: 'pdf-to-word',
        title: 'PDF to Word',
        description: 'Convert PDF to editable Docx.',
        icon: 'FileType2',
        color: 'bg-blue-600',
        slug: '/tools/pdf-to-word',
        type: 'file'
    },
    // 3. Merge PDFs
    {
        id: 'merge-pdf',
        title: 'Merge PDFs',
        description: 'Combine multiple PDFs into one.',
        icon: 'Combine',
        color: 'bg-orange-500',
        slug: '/tools/merge-pdf',
        type: 'file'
    },
    // 4. Rotate PDF
    {
        id: 'rotate-pdf',
        title: 'Rotate PDF',
        description: 'Rotate pages permanently.',
        icon: 'RotateCw',
        color: 'bg-lime-600',
        slug: '/tools/rotate-pdf',
        type: 'file'
    },
    // 5. Image Resizer (NEW)
    {
        id: 'image-resizer',
        title: 'Image Resizer',
        description: 'Resize images by pixel or percentage.',
        icon: 'Scaling',
        color: 'bg-purple-500',
        slug: '/tools/image-resizer',
        type: 'image'
    },
    // 6. Image Compressor (NEW)
    {
        id: 'image-compressor',
        title: 'Image Compressor',
        description: 'Reduce image size without quality loss.',
        icon: 'Minimize2',
        color: 'bg-pink-500',
        slug: '/tools/image-compressor',
        type: 'image'
    },
    // 7. Bulk Image Resizer (NEW)
    {
        id: 'bulk-image-resizer',
        title: 'Bulk Image Resizer',
        description: 'Resize multiple images at once.',
        icon: 'Images', // Lucide 'Images' or similar, falling back to 'Copy' or 'Layers' if unavailable, will check Icons.tsx
        color: 'bg-indigo-500',
        slug: '/tools/bulk-image-resizer',
        type: 'image'
    },
    // 8. Image -> PDF (NEW)
    {
        id: 'image-to-pdf',
        title: 'Image to PDF',
        description: 'Convert images to a single PDF.',
        icon: 'FileSymlink',
        color: 'bg-teal-500',
        slug: '/tools/image-to-pdf',
        type: 'image'
    },
    // 9. PDF -> Image (NEW)
    {
        id: 'pdf-to-image',
        title: 'PDF to Image',
        description: 'Convert PDF pages to JPG/PNG.',
        icon: 'Image',
        color: 'bg-cyan-500',
        slug: '/tools/pdf-to-image',
        type: 'file'
    },
    // 10. Word -> PDF (NEW)
    {
        id: 'doc-to-pdf',
        title: 'Word to PDF',
        description: 'Convert DOCX/DOC to PDF.',
        icon: 'FileText',
        color: 'bg-indigo-600',
        slug: '/tools/doc-to-pdf',
        type: 'file'
    },

    // --- AI / Coming Soon Tools (Hidden or Muted) ---
    {
        id: 'ai-chat',
        title: 'Chat with PDF',
        description: 'Ask questions and extract insights.',
        icon: 'Bot',
        color: 'bg-slate-400',
        slug: '/tools/ai-chat',
        type: 'document',
        ai: true,
        comingSoon: true
    },
    {
        id: 'ai-summary',
        title: 'PDF Summarizer',
        description: 'Get concise summaries and TL;DRs.',
        icon: 'FileText',
        color: 'bg-slate-400',
        slug: '/tools/ai-summary',
        type: 'document',
        ai: true,
        comingSoon: true
    },
    {
        id: 'ai-mcq',
        title: 'MCQ Generator',
        description: 'Create multiple choice questions.',
        icon: 'ListChecks',
        color: 'bg-slate-400',
        slug: '/tools/ai-mcq',
        type: 'document',
        ai: true,
        comingSoon: true
    },
    {
        id: 'ai-notes',
        title: 'Notes Generator',
        description: 'Auto-generate structured notes.',
        icon: 'Notebook',
        color: 'bg-slate-400',
        slug: '/tools/ai-notes',
        type: 'document',
        ai: true,
        comingSoon: true
    },
    {
        id: 'ai-rewrite',
        title: 'AI Rewrite',
        description: 'Change tone or rewrite content.',
        icon: 'PenTool',
        color: 'bg-slate-400',
        slug: '/tools/ai-rewrite',
        type: 'document',
        ai: true,
        comingSoon: true
    },
    {
        id: 'ai-translate',
        title: 'Translate PDF',
        description: 'Translate docs preserving layout.',
        icon: 'Languages',
        color: 'bg-slate-400',
        slug: '/tools/ai-translate',
        type: 'document',
        ai: true,
        comingSoon: true
    },
    {
        id: 'remove-bg',
        title: 'Remove Background',
        description: 'Instantly remove backgrounds.',
        icon: 'ImageMinus',
        color: 'bg-slate-400',
        slug: '/tools/remove-bg',
        type: 'image',
        ai: true,
        comingSoon: true
    },
    {
        id: 'ai-upscale',
        title: 'Image Upscaler',
        description: 'Upscale images 4x.',
        icon: 'Scaling',
        color: 'bg-slate-400',
        slug: '/tools/ai-upscale',
        type: 'image',
        ai: true,
        comingSoon: true
    },
    {
        id: 'ai-enhance',
        title: 'Photo Enhancer',
        description: 'Restore blur and improve details.',
        icon: 'Wand2',
        color: 'bg-slate-400',
        slug: '/tools/ai-enhance',
        type: 'image',
        ai: true,
        comingSoon: true
    },
    {
        id: 'ai-colorize',
        title: 'Colorize Photo',
        description: 'Add colors to B&W photos.',
        icon: 'Palette',
        color: 'bg-slate-400',
        slug: '/tools/ai-colorize',
        type: 'image',
        ai: true,
        comingSoon: true
    }
];
