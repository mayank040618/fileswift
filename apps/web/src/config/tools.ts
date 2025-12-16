export interface Tool {
    id: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    slug: string;
    type: 'document' | 'image' | 'file';
    ai?: boolean;
    keywords?: string[];
    content?: {
        features: string[];
        howTo: string[];
        benefits: string[];
        faq?: { question: string; answer: string }[];
    };
    longDescription?: string;
    comingSoon?: boolean;
}

export const TOOLS: Tool[] = [
    // 1. Compress PDF
    {
        id: 'compress-pdf',
        title: 'Compress PDF Online',
        description: 'Reduce file size efficiently.',
        icon: 'Minimize2',
        color: 'bg-red-500',
        slug: '/tools/compress-pdf',
        type: 'file',
        keywords: ['compress pdf', 'reduce pdf size', 'compress small pdf', 'pdf compressor free', 'shrink pdf', 'optimize pdf', 'compress pdf file', 'reduce pdf file size'],
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
                    question: 'Is FileSwift free?',
                    answer: 'Yes, FileSwift is a 100% free PDF compressor. You can compress unlimited files without any hidden costs or watermarks.'
                },
                {
                    question: 'Can I compress small PDFs?',
                    answer: 'Yes! Our smart algorithm analyzes your file. If it\'s already optimized, we\'ll tell you. If it can be smaller, we compress it.'
                },
                {
                    question: 'Is it safe to compress my PDF online?',
                    answer: 'Absolutely. We use 256-bit SSL encryption for file transfers. Your files are never read by humans and are permanently deleted from our servers after 1 hour.'
                },
                {
                    question: 'Why didn’t my PDF size reduce?',
                    answer: 'Some PDFs are already highly optimized or contain content that cannot be compressed further without quality loss (like already compressed JPEGs). FileSwift respects your quality settings to avoid blurry documents.'
                }
            ]
        },
        longDescription: `
## Best Free Online PDF Compressor

FileSwift is the fastest and most secure way to **compress PDF** files online. whether you need to **reduce PDF size** for email attachments, government portal uploads, or simply to save storage space, our smart compression engine delivers the perfect balance between file size and quality.

### Why Choose FileSwift to Compress PDF?

Unlike other tools that upload your data to third-party servers, FileSwift processes your files with privacy as a priority. We understand that your documents may contain sensitive information. That's why we enforce a strict **1-hour auto-deletion policy**. Once you download your file, it is gone from our system forever.

### Understanding PDF Compression

Our tool gives you control. You can choose:
- **High Compression**: Great for text documents and situations where file size matters most.
- **Medium Compression**: The perfect balance for most business documents containing images and text.
- **Low Compression**: Best for high-quality presentations where visual fidelity is critical.

### "My PDF didn't get smaller?"

We believe in honesty. If you upload a **small PDF** that is already optimized, our engine will detect it and may skip compression to prevent accidental quality loss or file size increase. We won't give you a "fake" compression result. If your file can be smaller, we will make it smaller.
`
    },
    // 2. Image Compressor
    {
        id: 'image-compressor',
        title: 'Image Compressor (JPG, PNG, WEBP)',
        description: 'Reduce image size without quality loss.',
        icon: 'Minimize2',
        color: 'bg-pink-500',
        slug: '/tools/image-compressor',
        type: 'image',
        keywords: ['image compressor online', 'compress jpg', 'compress png', 'reduce image size', 'optimize images', 'image optimizer', 'resize image online'],
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
            ],
            faq: [
                {
                    question: 'How does the Image Compressor work?',
                    answer: 'Our tool intelligently scans your image and selectively reduces the number of colors and pixels that the human eye cannot perceive, significantly dragging down file size without noticeable quality loss.'
                },
                {
                    question: 'Does it support Bulk Compression?',
                    answer: 'Yes! You can select or drag and drop up to 100 images at once. FileSwift will process them in parallel and let you download them all as a ZIP file.'
                }
            ]
        },
        longDescription: `
## Professional Online Image Compressor

Need to **compress JPG**, PNG, or WEBP files? FileSwift offers a powerful **image compressor online** that reduces file size by up to 80% while keeping your images looking crisp and clear.

### Speed Up Your Website

Large images slow down websites, hurting your SEO and user experience. Use FileSwift to **optimize images** before uploading them to your blog, e-commerce store, or portfolio. Our tool removes unnecessary metadata and optimizes compression layers to give you the smallest file possible.

### Privacy & Security

Your photos are yours. Whether they are personal memories or professional assets, we treat them with strict confidentiality. All processing happens on secure servers, and images are wiped automatically after 1 hour. No sign-up is required, so you don't need to share your email to get started.

### Formats Supported
- **JPG/JPEG**: Best for photographs and realistic images.
- **PNG**: Ideal for graphics, screenshots, and images with transparent backgrounds.
- **WEBP**: The modern web standard for high-performance images.
`
    },
    // 3. Image to PDF
    {
        id: 'image-to-pdf',
        title: 'Image to PDF Converter (JPG, PNG)',
        description: 'Convert images to a single PDF.',
        icon: 'FileSymlink',
        color: 'bg-teal-500',
        slug: '/tools/image-to-pdf',
        type: 'image',
        keywords: ['image to pdf', 'jpg to pdf', 'png to pdf', 'convert photo to pdf', 'combine images to pdf', 'jpeg to pdf', 'pictures to pdf'],
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
            ],
            faq: [
                {
                    question: 'Can I combine JPG and PNG in one PDF?',
                    answer: 'Yes! You can mix different image formats (JPG, PNG, WEBP) and they will all be merged into a single, seamless PDF document.'
                },
                {
                    question: 'Does it reduce image quality?',
                    answer: 'By default, we maintain high resolution for your photos. We optimize the container format but preserve the visual fidelity of your uploaded images.'
                }
            ]
        },
        longDescription: `
## Convert JPG & PNG to PDF Instantly

Turn your photo gallery into professional documents with FileSwift's **Image to PDF** converter. Whether you need to compile scanned receipts for an expense report or create a digital portfolio from your design work, our tool handles it all.

### Drag, Drop, Organize

The order matters. That's why we built an intuitive drag-and-drop interface that lets you rearrange your photos exactly how you want them to appear in the final PDF file.

### Why convert images to PDF?
- **Universal Compatibility**: PDFs look the same on every device, unlike images which might display differently.
- **Easy Sharing**: Send one file instead of twenty separate image attachments.
- **Professional Presentation**: Clean presentation for client deliverables or official documentation.
`
    },
    // 4. PDF to Word
    {
        id: 'pdf-to-word',
        title: 'PDF to Word Converter (OCR)',
        description: 'Convert PDF to editable Docx.',
        icon: 'FileType2',
        color: 'bg-blue-600',
        slug: '/tools/pdf-to-word',
        type: 'file',
        keywords: ['pdf to word', 'pdf to docx', 'convert pdf to word editable', 'pdf to text', 'pdf converter to word', 'edit pdf in word'],
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
            ],
            faq: [
                {
                    question: 'Will the Word doc look like my PDF?',
                    answer: 'Our advanced conversion engine strives to preserve the exact layout, including tables, headings, and images. However, complex layouts may require minor adjustments in Word.'
                },
                {
                    question: 'Can I edit the converted file?',
                    answer: 'Yes! The output is a standard .docx file which is fully editable in Microsoft Word, Google Docs, or any other word processor.'
                }
            ]
        },
        longDescription: `
## Best PDF to Word Converter

Unlock your documents with the most accurate **PDF to Word** converter. Stop retyping text manually. FileSwift instantly transforms static PDF files into editable DOCX documents, allowing you to copy, edit, and repurpose content with ease.

### Preserving Your Layout

One of the biggest challenges in PDF conversion is keeping the formatting intact. FileSwift uses advanced document analysis to recognize paragraphs, lists, and tables, ensuring that your new Word document looks as close to the original PDF as possible.

### Safe & Secure

Business contracts, legal documents, and personal resumes—we handle them all with maximum security. Your files are processed in an encrypted environment and are automatically deleted from our servers after differentiation.
`
    },
    // 5. Merge PDFs
    {
        id: 'merge-pdf',
        title: 'Merge PDFs - Combine PDF Files',
        description: 'Combine multiple PDFs into one.',
        icon: 'Combine',
        color: 'bg-orange-500',
        slug: '/tools/merge-pdf',
        type: 'file',
        keywords: ['merge pdf', 'combine pdf', 'join pdf', 'stitch pdf', 'bind pdf', 'merge pdf files online', 'combine multiple pdfs'],
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
            ],
            faq: [
                {
                    question: 'Is there a limit to how many files I can merge?',
                    answer: 'Currently, you can merge up to 20 files at once for free. This limit ensures fast processing speeds for all users.'
                },
                {
                    question: 'Can I change the order?',
                    answer: 'Yes! Use the drag-and-drop feature to arrange your files in the exact sequence you want them to appear in the final document.'
                }
            ]
        },
        longDescription: `
## Merge PDF Files Online

Combine reports, invoices, and chapters into one organized document with our **Merge PDF** tool. It's the easiest way to join multiple PDF files into a single, cohesive document.

### Organized & Efficient

Don't send 10 separate attachments in an email. Stitch them together. Whether you are a student compiling assignments or a professional organizing project files, FileSwift makes it simple to tidy up your digital workspace.
`
    },
    // 6. Rotate PDF
    {
        id: 'rotate-pdf',
        title: 'Rotate PDF Pages',
        description: 'Rotate pages permanently.',
        icon: 'RotateCw',
        color: 'bg-lime-600',
        slug: '/tools/rotate-pdf',
        type: 'file',
        keywords: ['rotate pdf', 'turn pdf', 'change pdf orientation', 'fix upside down pdf', 'rotate pdf pages online', 'save rotated pdf'],
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
            ],
            faq: [
                {
                    question: 'Does this permanently rotate the file?',
                    answer: 'Yes. Unlike simply rotating the view in a PDF reader, FileSwift permanently saves the rotation so the file opens correctly on every device.'
                }
            ]
        },
        longDescription: `
## Rotate PDF Pages

Scanned a document upside down? Downloaded a form that's stuck in landscape mode? Use FileSwift to **rotate PDF** pages permanently.

### Fix Scanned Documents

A common problem with bulk scanning is having random pages oriented incorrectly. Our tool fixes this in seconds, ensuring your document looks professional and is easy to read without requiring your recipients to crane their necks.
`
    },
    // 7. Image Resizer
    {
        id: 'image-resizer',
        title: 'Image Resizer Online',
        description: 'Resize images by pixel or percentage.',
        icon: 'Scaling',
        color: 'bg-purple-500',
        slug: '/tools/image-resizer',
        type: 'image',
        keywords: ['resize image', 'change image size', 'resize photo', 'scale image', 'resize jpg', 'resize png', 'image dimensions changer'],
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
            ],
            faq: [
                {
                    question: 'Will my image look pixelated?',
                    answer: 'We use high-quality resampling algorithms. However, if you enlarge a small image significantly, some loss of sharpness is inevitable. Reducing size always produces crisp results.'
                }
            ]
        },
        longDescription: `
## Resize Images Online

Need a photo to fit specific dimensions for your website, social media, or government form? FileSwift's **Online Image Resizer** lets you change the width and height of any image in pixels.

### Maintain Aspect Ratio

Don't stretch or distort your photos. Our tool allows you to lock the aspect ratio, so when you change the width, the height adjusts automatically to keep your image looking natural.
`
    },
    // 8. Bulk Image Resizer
    {
        id: 'bulk-image-resizer',
        title: 'Bulk Image Resizer',
        description: 'Resize multiple images at once.',
        icon: 'Images', // Lucide 'Images' or similar, falling back to 'Copy' or 'Layers' if unavailable, will check Icons.tsx
        color: 'bg-indigo-500',
        slug: '/tools/bulk-image-resizer',
        type: 'image',
        keywords: ['bulk resize images', 'batch image resizer', 'resize multiple photos', 'mass image resizer', 'batch photo editor'],
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
            ],
            faq: [
                {
                    question: 'How many images can I resize at once?',
                    answer: 'You can resize up to 50 images in a single batch for free. This is ideal for photographers and e-commerce managers.'
                }
            ]
        },
        longDescription: `
## Bulk Image Resizer

Resizing 50 photos one by one is a waste of time. With our **Bulk Image Resizer**, you can upload an entire folder of product photos, event snaps, or wallpapers and resize them all to a uniform size in seconds.

### Perfect for E-Commerce

Running an online store? Uniformity is key. Use our tool to ensure every product image on your catalog has the exact same dimensions, giving your shop a polished, professional look.
`
    },
    // 9. PDF to Image
    {
        id: 'pdf-to-image',
        title: 'PDF to Image (PDF to JPG)',
        description: 'Convert PDF pages to JPG/PNG.',
        icon: 'Image',
        color: 'bg-cyan-500',
        slug: '/tools/pdf-to-image',
        type: 'file',
        keywords: ['pdf to image', 'pdf to jpg', 'pdf to png', 'convert pdf pages to images', 'extract images from pdf'],
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
            ],
            faq: [
                {
                    question: 'Can I choose between JPG and PNG?',
                    answer: 'Yes. JPG is smaller and good for photos, while PNG is better for text and diagrams as it preserves sharpness better.'
                }
            ]
        },
        longDescription: `
## PDF to Image Converter

Sometimes you need a PDF page as an image file. Whether it's to share on Instagram, insert into a PowerPoint slide, or just to view on a device that doesn't support PDF, FileSwift's **PDF to Image** converter gets the job done.

### Extract Every Page

Our tool goes through your entire PDF document and converts each individual page into a high-quality image file. You can then download all the images in a single ZIP file for convenience.
`
    },
    // 10. Word to PDF
    {
        id: 'doc-to-pdf',
        title: 'Word to PDF Converter',
        description: 'Convert DOCX/DOC to PDF.',
        icon: 'FileText',
        color: 'bg-indigo-600',
        slug: '/tools/doc-to-pdf',
        type: 'file',
        keywords: ['word to pdf', 'docx to pdf', 'doc to pdf', 'convert word to pdf', 'ms word to pdf', 'save docx as pdf'],
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
            ],
            faq: [
                {
                    question: 'Are old .doc files supported?',
                    answer: 'Yes, we support both the modern .docx format and the legacy .doc format used by older versions of Microsoft Word.'
                }
            ]
        },
        longDescription: `
## Word to PDF Converter

Make your documents professional and portable. Convert Microsoft Word documents to **PDF format** to ensure they look exactly the same on every computer, tablet, and smartphone.

### Why PDF?

Word documents can shift layout depending on the version of Office being used. PDFs are fixed. By converting **Word to PDF**, you lock in your fonts, images, and formatting so your resume or contract looks perfect every time.
`
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
