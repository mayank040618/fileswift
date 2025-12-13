export interface Tool {
    id: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    slug: string;
    type: 'document' | 'image' | 'file';
    ai?: boolean;
    content?: {
        features: string[];
        howTo: string[];
        benefits: string[];
        faq?: { question: string; answer: string }[];
    };
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
        type: 'file',
        content: {
            features: [
                'Smart Compression Algorithms: Reduce PDF file size significantly while maintaining high visual quality.',
                'Secure Processing: All files are processed securely and deleted automatically after 1 hour.',
                'Fast & Efficient: Compress large PDF files in seconds directly in your browser.',
                'No Installation Required: Works on any device (Windows, Mac, Linux, Mobile) without installing software.'
            ],
            howTo: [
                'Click "Select Files" or drag & drop your PDF into the upload area.',
                'Adjust the compression level if needed (High, Medium, Low).',
                'Wait for the compression process to finish.',
                'Download your optimized PDF file instantly.'
            ],
            benefits: [
                'Send files faster via email by reducing attachment size.',
                'Save storage space on your device or cloud.',
                'Upload documents to portals with strict file size limits.'
            ],
            faq: [
                {
                    question: 'Is it safe to compress my PDF online?',
                    answer: 'Yes, absolutely. We use SSL encryption for file transfers, and your files are permanently deleted from our servers after 1 hour.'
                },
                {
                    question: 'How much can I reduce my PDF size?',
                    answer: 'Compression rates vary depending on the file content. Text-heavy PDFs can often be reduced by 50-80%, while image-heavy PDFs can see even greater reductions.'
                }
            ]
        }
    },
    // 2. PDF to Word
    {
        id: 'pdf-to-word',
        title: 'PDF to Word',
        description: 'Convert PDF to editable Docx.',
        icon: 'FileType2',
        color: 'bg-blue-600',
        slug: '/tools/pdf-to-word',
        type: 'file',
        content: {
            features: [
                'Accurate Conversion: Converts PDF to editable Word (DOCX) documents with high precision.',
                'Preserves Layout: Maintains original fonts, paragraphs, and tables as much as possible.',
                'OCR Technology: Extracts text from scanned PDFs (coming soon).',
                'Batch Processing: Convert multiple PDFs to Word documents at once.'
            ],
            howTo: [
                'Select the PDF file needed for conversion.',
                'Click "Convert" to start the process.',
                'The tool will automatically extract text and formatting.',
                'Download ease-to-edit Word document.'
            ],
            benefits: [
                'Edit locked PDF content easily in Microsoft Word.',
                'Repurpose content without retyping manually.',
                'Fix errors in finalized PDF documents.'
            ]
        }
    },
    // 3. Merge PDFs
    {
        id: 'merge-pdf',
        title: 'Merge PDFs',
        description: 'Combine multiple PDFs into one.',
        icon: 'Combine',
        color: 'bg-orange-500',
        slug: '/tools/merge-pdf',
        type: 'file',
        content: {
            features: [
                'Combine Multiple Files: Merge unlimited PDF files into a single document.',
                'Order Customization: Rearrange files locally before merging.',
                'Universal Compatibility: Merged files work on any PDF viewer.',
                '100% Free: No watermarks or page limits.'
            ],
            howTo: [
                'Upload all the PDF files you want to combine.',
                'Arrange them in the desired order.',
                'Click "Merge PDFs" to stitch them together.',
                'Download the single consolidated PDF file.'
            ],
            benefits: [
                'Keep related documents together (e.g., invoices, receipts).',
                'Create professional report portfolios from scattered files.',
                'Simplify sharing by sending one file instead of many.'
            ]
        }
    },
    // 4. Rotate PDF
    {
        id: 'rotate-pdf',
        title: 'Rotate PDF',
        description: 'Rotate pages permanently.',
        icon: 'RotateCw',
        color: 'bg-lime-600',
        slug: '/tools/rotate-pdf',
        type: 'file',
        content: {
            features: [
                'Permanent Rotation: Save the new orientation permanently, not just a view adjustment.',
                'Specific Angles: Rotate 90 degrees clockwise, counter-clockwise, or 180 degrees.',
                'Bulk Rotation: Rotate multiple files at the same time.',
                'Instant Preview: See the results immediately after processing.'
            ],
            howTo: [
                'Upload the PDF file that has the wrong orientation.',
                'Select the rotation angle (90°, 180°, 270°).',
                'Click "Process File" to apply the rotation.',
                'Download the corrected PDF.'
            ],
            benefits: [
                'Fix scanned documents that are upside down or sideways.',
                'Correct page orientation for professional presentation.',
                'Read documents comfortably on any device.'
            ]
        }
    },
    // 5. Image Resizer (NEW)
    {
        id: 'image-resizer',
        title: 'Image Resizer',
        description: 'Resize images by pixel or percentage.',
        icon: 'Scaling',
        color: 'bg-purple-500',
        slug: '/tools/image-resizer',
        type: 'image',
        content: {
            features: [
                'Custom Dimensions: Resize to specific Width and Height pixels.',
                'Aspect Ratio Maintenance: Option to preserve the original shape.',
                'Multiple Formats: Supports JPG, PNG, WEBP, and more.',
                'High Quality: Advanced resampling to prevent pixelation.'
            ],
            howTo: [
                'Upload your image file (JPG, PNG, etc).',
                'Enter your desired width or height in pixels.',
                'Leave one field empty to maintain aspect ratio automatically.',
                'Click "Process" and download your resized image.'
            ],
            benefits: [
                'Prepare images for social media posts (Instagram, Twitter).',
                'Optimize images for faster website loading.',
                'Meet specific upload requirements for government portals.'
            ]
        }
    },
    // 6. Image Compressor (NEW)
    {
        id: 'image-compressor',
        title: 'Image Compressor',
        description: 'Reduce image size without quality loss.',
        icon: 'Minimize2',
        color: 'bg-pink-500',
        slug: '/tools/image-compressor',
        type: 'image',
        content: {
            features: [
                'Lossless & Lossy Options: Choose between maximum quality or maximum compression.',
                'Bulk Compression: Compress multiple images (JPG, PNG, WEBP) simultaneously.',
                'Instant Preview: See the size reduction before you download.',
                'Privacy First: Images are processed securely and never shared.'
            ],
            howTo: [
                'Upload your images to the compressor.',
                'Select the compression quality level.',
                'Wait a moment for the AI to optimize your images.',
                'Download the smaller, lighter image files.'
            ],
            benefits: [
                'Improve website speed and SEO scores.',
                'Stay within email attachment size limits.',
                'Save bandwidth and storage on mobile devices.'
            ]
        }
    },
    // 7. Bulk Image Resizer (NEW)
    {
        id: 'bulk-image-resizer',
        title: 'Bulk Image Resizer',
        description: 'Resize multiple images at once.',
        icon: 'Images', // Lucide 'Images' or similar, falling back to 'Copy' or 'Layers' if unavailable, will check Icons.tsx
        color: 'bg-indigo-500',
        slug: '/tools/bulk-image-resizer',
        type: 'image',
        content: {
            features: [
                'Batch Processing: Resize dozens of images in one go.',
                'Uniform Output: Ensure all images have the exact same dimensions.',
                'Fast Processing: Powered by high-speed servers for rapid resizing.',
                'Cross-Format Support: Handle mixed batches of JPGs and PNGs.'
            ],
            howTo: [
                'Drag and drop common folders or select multiple images.',
                'Set the target width and height for all images.',
                'Start the batch process.',
                'Download all resized images in a ZIP file.'
            ],
            benefits: [
                'Save hours of manual work resizing photos one by one.',
                'Standardize product photos for e-commerce stores.',
                'Quickly prepare photo collections for digital albums.'
            ]
        }
    },
    // 8. Image -> PDF (NEW)
    {
        id: 'image-to-pdf',
        title: 'Image to PDF',
        description: 'Convert images to a single PDF.',
        icon: 'FileSymlink',
        color: 'bg-teal-500',
        slug: '/tools/image-to-pdf',
        type: 'image',
        content: {
            features: [
                'Combined PDF: Merge multiple images into a single PDF file.',
                'Layout Control: Auto-fit images to A4 or keep original size.',
                'Drag & Drop Reordering: Arrange images in the exact order you want.',
                'High Resolution: Preserves the clarity of your original photos.'
            ],
            howTo: [
                'Upload your JPG, PNG, or WEBP images.',
                'Reorder them by dragging thumbnails.',
                'Click "Convert to PDF" to generate the document.',
                'Download your new PDF album or document.'
            ],
            benefits: [
                'Create a shareable portfolio of your work.',
                'Submit scanned documents (ID, receipts) as a single file.',
                'Archive photos in a universal, non-editable format.'
            ]
        }
    },
    // 9. PDF -> Image (NEW)
    {
        id: 'pdf-to-image',
        title: 'PDF to Image',
        description: 'Convert PDF pages to JPG/PNG.',
        icon: 'Image',
        color: 'bg-cyan-500',
        slug: '/tools/pdf-to-image',
        type: 'file',
        content: {
            features: [
                'Extract Pages: Convert every page of a PDF into a separate image.',
                'High Quality Output: Get crisp JPG or PNG images.',
                'Secure & Fast: Processing happens quickly in the cloud.',
                'Zip Download: Get all pages conveniently in one ZIP archive.'
            ],
            howTo: [
                'Select the PDF file you wish to convert.',
                'Choose the output format (JPG or PNG).',
                'Start the conversion process.',
                'Download the ZIP file containing all page images.'
            ],
            benefits: [
                'Share specific PDF pages on social media.',
                'Insert PDF content into presentations or other documents.',
                'View PDF content on devices intended for images.'
            ]
        }
    },
    // 10. Word -> PDF (NEW)
    {
        id: 'doc-to-pdf',
        title: 'Word to PDF',
        description: 'Convert DOCX/DOC to PDF.',
        icon: 'FileText',
        color: 'bg-indigo-600',
        slug: '/tools/doc-to-pdf',
        type: 'file',
        content: {
            features: [
                'Universal Standard: Convert Word docs to the ISO-standard PDF format.',
                'Formatting Integrity: Keeps text, images, and formatting exactly as in the original.',
                'Privacy Guaranteed: Your sensitive documents are handled securely.',
                'Wide Compatibility: Supports .doc and .docx files.'
            ],
            howTo: [
                'Upload your Microsoft Word document.',
                'The tool automatically converts it to PDF.',
                'Wait for the conversion to complete.',
                'Download your professional PDF document.'
            ],
            benefits: [
                'Ensure your document looks the same on every device.',
                'Prevent accidental editing of your finalized text.',
                'Submit official documents in the required PDF format.'
            ]
        }
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
