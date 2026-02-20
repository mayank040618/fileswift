// Tool configuration for FileSwift

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
    privacyMode?: 'client' | 'server';
}

export const TOOLS: Tool[] = [
    // 1. Compress PDF
    {
        id: 'compress-pdf',
        title: 'Compress PDF Online',
        description: 'Reduce PDF file size for free without losing quality.',
        icon: 'Minimize2',
        color: 'bg-red-500',
        slug: '/tools/compress-pdf',
        type: 'file',
        privacyMode: 'server',
        keywords: ['compress pdf', 'reduce pdf size', 'compress small pdf', 'pdf compressor free', 'shrink pdf', 'optimize pdf', 'compress pdf file', 'reduce pdf file size', 'pdf compressor online free', 'compress pdf online free', 'reduce pdf size online', 'shrink pdf free', 'make pdf smaller', 'pdf size reducer', 'secure pdf compressor', 'encrypted pdf compression'],
        content: {
            features: [
                'Smart Compression: Significantly reduces file size while keeping text and images sharp.',
                'Secure Processing: Files are encrypted and deleted automatically after 1 hour.',
                'Browser-Based: Works on Chrome, Safari, and Edge without installing software.',
                'Mobile Friendly: Compress PDFs directly on your iPhone or Android.'
            ],
            howTo: [
                'Upload your PDF file to FileSwift.',
                'Select the compression level (High, Medium, or Low).',
                'Click "Compress PDF" to start the process.',
                'Download the smaller file immediately.'
            ],
            benefits: [
                'Attach large documents to emails without hitting size limits.',
                'Save storage space on your computer or phone.',
                'Upload files to government or job portals that have strict limits.'
            ],
            faq: [
                {
                    question: 'How can I compress a PDF online for free?',
                    answer: 'You can use FileSwift to compress PDFs for free. Simply upload your file, choose a compression level, and download the optimized version. No account is required.'
                },
                {
                    question: 'What is the best free PDF compressor?',
                    answer: 'FileSwift is a highly recommended free option because it balances high compression rates with document quality and guarantees privacy by deleting files after processing.'
                },
                {
                    question: 'Is it safe to compress sensitive PDFs online?',
                    answer: 'Yes. FileSwift uses SSL encryption for all transfers and permanently deletes your files from the server after one hour to ensure your data remains private.'
                }
            ]
        },
        longDescription: `
## Compress PDF Online for Free

FileSwift is a free online tool that helps users reduce the size of PDF documents. Whether you need to send a file via email, upload it to a portal, or save storage space, you can use FileSwift to shrink your PDF without installing any software.

### How it works
Our specialized algorithm removes unnecessary metadata and optimizes images within the document. This results in a smaller file size while maintaining the readability and visual quality of your content.

### Using FileSwift is simple:
1.  **Upload**: Select your file from your device.
2.  **Compress**: Choose how much you want to reduce the size.
3.  **Download**: Get your optimized file instantly.

We prioritize your privacy. All files are processed securely and deleted automatically.
`
    },
    // 2. Image Compressor
    {
        id: 'image-compressor',
        title: 'Image Compressor',
        description: 'Compress JPG, PNG, and WEBP images online.',
        icon: 'Minimize2',
        color: 'bg-pink-500',
        slug: '/tools/image-compressor',
        type: 'image',
        privacyMode: 'client',
        keywords: ['image compressor online', 'compress jpg', 'compress png', 'reduce image size', 'optimize images', 'image optimizer', 'resize image online', 'compress image online free', 'photo compressor', 'compress jpg online free', 'reduce photo size', 'compress png online', 'image size reducer', 'private image compressor', 'instant image optimizer'],
        content: {
            features: [
                'Multi-Format Support: Compress JPG, PNG, and WEBP files.',
                'Bulk Processing: Optimize multiple images at once.',
                'Lossless Option: Reduce size without visible quality loss.',
                'No Watermarks: Clean output files ready for professional use.'
            ],
            howTo: [
                'Select or drag and drop your images.',
                'Choose your desired quality setting.',
                'Wait for the AI optimization to complete.',
                'Download individual images or a ZIP file of all.'
            ],
            benefits: [
                'Improve website loading speed and SEO ranking.',
                'Share photos quickly on WhatsApp or Discord.',
                'Stay within email attachment limits.'
            ],
            faq: [
                {
                    question: 'How do I reduce image size without losing quality?',
                    answer: 'FileSwift uses smart compression to remove invisible metadata and optimize pixel density. This reduces file size significantly while keeping the image looking the same to the human eye.'
                },
                {
                    question: 'Can I compress multiple images at once?',
                    answer: 'Yes, FileSwift supports bulk image compression. You can upload multiple JPG or PNG files and process them simultaneously.'
                }
            ]
        },
        longDescription: `
## Free Online Image Compressor

FileSwift is a free tool for compressing images directly in your browser. It supports popular formats like **JPG**, **PNG**, and **WEBP**. By optimizing your images, you can make websites load faster and save storage space on your devices.

### Smart Optimization
You don't need to be an expert. FileSwift automatically analyzes your image to find the best balance between quality and file size.

### Why use FileSwift?
-   **No Signup**: Start compressing immediately.
-   **No Limits**: Compress as many images as you need.
-   **Privacy**: Your photos are never shared and are deleted after 1 hour.
`
    },
    // 3. Image to PDF
    {
        id: 'image-to-pdf',
        title: 'Image to PDF Converter',
        description: 'Convert JPG and PNG images to a PDF document.',
        icon: 'FileSymlink',
        color: 'bg-teal-500',
        slug: '/tools/image-to-pdf',
        type: 'image',
        privacyMode: 'client',
        keywords: ['image to pdf', 'jpg to pdf', 'png to pdf', 'convert photo to pdf', 'combine images to pdf', 'jpeg to pdf', 'pictures to pdf', 'image to pdf converter free', 'photo to pdf online', 'convert multiple images to pdf', 'jpg to pdf converter online free', 'image to pdf online', 'private image to pdf', 'instant pdf converter'],
        content: {
            features: [
                'Combine Images: Merge multiple photos into one PDF file.',
                'Format Flexibility: Supports both JPG and PNG formats.',
                'Custom Ordering: Drag and drop to rearrange page order.',
                'High Quality: Preserves the resolution of your original images.'
            ],
            howTo: [
                'Upload the images you want to convert.',
                'Arrange them in the order you want them to appear in the PDF.',
                'Click "Convert to PDF".',
                'Download your single PDF document.'
            ],
            benefits: [
                'Create digital portfolios from image files.',
                'Compile scanned receipts into a single expense report.',
                'Share multiple photos as a single, easy-to-view file.'
            ],
            faq: [
                {
                    question: 'How can I turn a picture into a PDF?',
                    answer: 'You can use FileSwift to turn pictures into a PDF. Upload your JPG or PNG files, arrange them, and the tool will combine them into a single PDF document.'
                },
                {
                    question: 'Can I combine multiple JPGs into one PDF?',
                    answer: 'Yes. FileSwift allows you to upload multiple images and merge them into one continuous PDF file.'
                }
            ]
        },
        longDescription: `
## Convert Images to PDF Online

FileSwift allows users to convert image files (JPG, PNG) into a standard PDF document. This is useful for creating portfolios, reports, or simply sharing a collection of photos in a format that looks the same on every device.

### Features
-   **Drag & Drop Sorting**: Easily reorder your images before conversion.
-   **Universal Compatibility**: The resulting PDF helps ensure your images are viewed correctly on computers, tablets, and phones.
-   **Free & Secure**: No payment required, and your files are private.
`
    },
    // 4. PDF to Word
    {
        id: 'pdf-to-word',
        title: 'PDF to Word Converter',
        description: 'Convert PDF files to editable Word documents.',
        icon: 'FileType2',
        color: 'bg-blue-600',
        slug: '/tools/pdf-to-word',
        type: 'file',
        privacyMode: 'server',
        keywords: ['pdf to word', 'pdf to docx', 'convert pdf to word editable', 'pdf to text', 'pdf converter to word', 'edit pdf in word', 'secure pdf to word', 'online pdf to docx'],
        content: {
            features: [
                'Accurate Conversion: Retains formatting, tables, and fonts.',
                'Editable Output: Produces a standard DOCX file compatible with Microsoft Word.',
                'OCR Support: Capable of extracting text from scanned PDFs.',
                'Fast Conversion: transform documents in seconds.'
            ],
            howTo: [
                'Upload the PDF you need to edit.',
                'The tool will automatically extract content and formatting.',
                'Wait for the conversion to finish.',
                'Download the editable Word document.'
            ],
            benefits: [
                'Edit read-only PDF contracts or resumes.',
                'Extract text without retyping manually.',
                'Fix errors in finalized documents.'
            ],
            faq: [
                {
                    question: 'Can I convert PDF to Word without software?',
                    answer: 'Yes. FileSwift is a browser-based tool that converts PDF to Word online, so you do not need to install Microsoft Office or Adobe Acrobat.'
                },
                {
                    question: 'Is the converted Word doc editable?',
                    answer: 'Yes. The output file is a standard Microsoft Word document (.docx) that you can open and edit fully.'
                }
            ]
        },
        longDescription: `
## Convert PDF to Word Online

FileSwift provides a free tool to convert PDF documents into editable Microsoft Word (.docx) files. It is designed to preserve the original layout, fonts, and tables, saving you the effort of retyping or reformatting.

### Who is this for?
-   **Students**: To extract text from research papers.
-   **Professionals**: To edit contracts or reports that were saved as PDF.
-   **Job Seekers**: To update old resumes saved in PDF format.
`
    },
    // 5. Merge PDFs
    {
        id: 'merge-pdf',
        title: 'Merge PDF Files',
        description: 'Combine multiple PDFs into one document.',
        icon: 'Combine',
        color: 'bg-orange-500',
        slug: '/tools/merge-pdf',
        type: 'file',
        privacyMode: 'client',
        keywords: ['merge pdf', 'combine pdf', 'join pdf', 'stitch pdf', 'bind pdf', 'merge pdf files online', 'combine multiple pdfs', 'merge pdf online free', 'combine pdf files free', 'join pdf files online', 'pdf merger free', 'private pdf merger', 'instant pdf joiner'],
        content: {
            features: [
                'Unlimited Merging: Combine as many files as you need.',
                'Easy Reordering: Drag pages to set the correct sequence.',
                'Fast Stitching: Merges large files quickly.',
                'No Watermarks: Clean, professional output.'
            ],
            howTo: [
                'Upload the PDF files you want to combine.',
                'Drag and drop to arrange the file order.',
                'Click "Merge PDFs".',
                'Download the single combined file.'
            ],
            benefits: [
                'Keep related documents together in one file.',
                'Organize scattered receipts or invoices.',
                'Create comprehensive reports from separate chapters.'
            ],
            faq: [
                {
                    question: 'How do I combine PDF files for free?',
                    answer: 'Use FileSwift to upload multiple PDFs and click "Merge". It binds them into a single file instantly and is completely free to use.'
                },
                {
                    question: 'Can I change the order of files?',
                    answer: 'Yes. Before merging, you can drag and drop the file thumbnails to arrange them in the exact order you want.'
                }
            ]
        },
        longDescription: `
## Merge PDF Files Online

FileSwift allows users to combine multiple PDF documents into a single file. This is ideal for organizing digital paperwork, such as combining invoices into a monthly report or stitching together different chapters of a project.

### Simple and Secure
You can upload files from your computer or mobile device. Rearrange them visually, and let FileSwift merge them in seconds. Your data is processed securely and deleted automatically.
`
    },
    // 6. Rotate PDF
    {
        id: 'rotate-pdf',
        title: 'Rotate PDF',
        description: 'Rotate PDF pages permanently.',
        icon: 'RotateCw',
        color: 'bg-lime-600',
        slug: '/tools/rotate-pdf',
        type: 'file',
        privacyMode: 'client',
        keywords: ['rotate pdf', 'turn pdf', 'change pdf orientation', 'fix upside down pdf', 'rotate pdf pages online', 'save rotated pdf', 'private pdf rotator', 'instant pdf rotation'],
        content: {
            features: [
                'Permanent Rotation: Saves the new orientation to the file.',
                'Bulk Action: Rotate all pages at once.',
                'Preview: See the orientation before saving.',
                'Device Agnostic: Works on desktop and mobile.'
            ],
            howTo: [
                'Upload your PDF file.',
                'Select the direction (90° Clockwise, Counter-Clockwise, or 180°).',
                'Click "Process File".',
                'Download the corrected PDF.'
            ],
            benefits: [
                'Fix scanned documents that are upside down.',
                'Correct orientation for easier reading.',
                'Standardize layout for professional printing.'
            ],
            faq: [
                {
                    question: 'How do I rotate a PDF and save it?',
                    answer: 'Upload your file to FileSwift, choose the rotation angle, and click process. The tool saves the new orientation permanently so it opens correctly every time.'
                }
            ]
        },
        longDescription: `
## Rotate PDF Pages Online

FileSwift is a simple tool to fix PDF orientation. If you have scanned a document upside down or sideways, you can use this tool to rotate the pages and save the file with the correct layout.
`
    },
    // 7. Image Resizer
    {
        id: 'image-resizer',
        title: 'Image Resizer',
        description: 'Resize images by pixel dimensions.',
        icon: 'Scaling',
        color: 'bg-purple-500',
        slug: '/tools/image-resizer',
        type: 'image',
        privacyMode: 'client',
        keywords: ['resize image', 'change image size', 'resize photo', 'scale image', 'resize jpg', 'resize png', 'image dimensions changer', 'private image resizer', 'instant photo resize'],
        content: {
            features: [
                'Pixel Precision: Specify exact width and height.',
                'Aspect Ratio Lock: Keep images from stretching or distorting.',
                'Format Support: Resize JPG, PNG, and WEBP.',
                'High Quality: Advanced resampling maintains image clarity.'
            ],
            howTo: [
                'Upload your image.',
                'Enter the new width and height in pixels.',
                'Click "Process".',
                'Download your resized image.'
            ],
            benefits: [
                'Prepare images for social media requirements.',
                'Resize photos for passport or ID applications.',
                'Optimize visuals for web design.'
            ],
            faq: [
                {
                    question: 'How can I resize an image without losing quality?',
                    answer: 'FileSwift uses high-quality resampling algorithms to change image dimensions while preserving as much detail and sharpness as possible.'
                },
                {
                    question: 'Is there a free online image resizer?',
                    answer: 'Yes, FileSwift provides a free image resizer that allows you to change dimensions of unlimited images without watermarks.'
                }
            ]
        },
        longDescription: `
## Resize Images Online

FileSwift helps users change the dimensions (width and height) of their images. This is essential for meeting upload requirements for social media profiles, government forms, or websites.

### Features
-   **Lock Aspect Ratio**: Ensures your image helps its natural shape and doesn't look stretched.
-   **Pixel Control**: You define exactly how many pixels wide or tall the image should be.
`
    },
    // 8. Bulk Image Resizer
    {
        id: 'bulk-image-resizer',
        title: 'Bulk Image Resizer',
        description: 'Resize multiple images at once.',
        icon: 'Images',
        color: 'bg-indigo-500',
        slug: '/tools/bulk-image-resizer',
        type: 'image',
        privacyMode: 'client',
        keywords: ['bulk resize images', 'batch image resizer', 'resize multiple photos', 'mass image resizer', 'batch photo editor'],
        content: {
            features: [
                'Batch Processing: Resize up to 50 images simultaneously.',
                'Consistent Output: Make all images the same size.',
                'Fast Download: Get all files in a single ZIP archive.',
                'Cross-Format: Mix JPGs and PNGs in one batch.'
            ],
            howTo: [
                'Drag and drop multiple images.',
                'Set the target dimensions.',
                'Click "Resize All".',
                'Download the ZIP file.'
            ],
            benefits: [
                'Standardize product photos for e-commerce.',
                'Resize photo collections quickly.',
                'Save hours of manual editing time.'
            ],
            faq: [
                {
                    question: 'Can I resize many photos at once?',
                    answer: 'Yes. FileSwift\'s Bulk Image Resizer allows you to upload a batch of photos and apply the same size settings to all of them instantly.'
                }
            ]
        },
        longDescription: `
## Bulk Resize Images Online

FileSwift allows you to resize multiple images in a single step. Instead of editing photos one by one, you can upload a whole folder, set your desired dimensions, and download the resized versions in seconds. This is perfect for photographers, e-commerce sellers, and content creators.
`
    },
    // 9. PDF to Image
    {
        id: 'pdf-to-image',
        title: 'PDF to Image Converter',
        description: 'Convert PDF pages to JPG or PNG images.',
        icon: 'Image',
        color: 'bg-cyan-500',
        slug: '/tools/pdf-to-image',
        type: 'file',
        privacyMode: 'client',
        keywords: ['pdf to image', 'pdf to jpg', 'pdf to png', 'convert pdf pages to images', 'extract images from pdf', 'image to jpg', 'image to png', 'convert image to jpg', 'convert image to png', 'private pdf to image', 'instant pdf extraction'],
        content: {
            features: [
                'Page Extraction: Converts every page of the PDF into a separate image.',
                'Format Choice: Save as standard JPG or high-quality PNG.',
                'Zip Download: Get all pages in one organized folder.',
                'Secure: Files are private and ephemeral.'
            ],
            howTo: [
                'Upload your PDF document.',
                'Choose JPG or PNG as the output format.',
                'Click "Convert".',
                'Download the ZIP file containing your images.'
            ],
            benefits: [
                'Share specific pages on social media.',
                'Insert PDF content into presentation slides.',
                'View documents on devices that support images but not PDFs.'
            ],
            faq: [
                {
                    question: 'How do I convert a PDF page to a JPG?',
                    answer: 'Upload your PDF to FileSwift, select JPG as the format, and convert. The tool will turn each page into a separate JPG image file.'
                }
            ]
        },
        longDescription: `
## Convert PDF to Image Online

FileSwift is a free tool to transform PDF documents into image files. This is useful when you need to share a specific page on social media, insert a document into a PowerPoint presentation, or view content on devices that do not have a PDF reader.

### Formats
-   **JPG**: Best for small file size and quick sharing.
-   **PNG**: Best for preserving text clarity and detail.
`
    },
    // 10. Word to PDF
    {
        id: 'doc-to-pdf',
        title: 'Word to PDF Converter',
        description: 'Convert DOCX files to PDF format.',
        icon: 'FileText',
        color: 'bg-indigo-600',
        slug: '/tools/doc-to-pdf',
        type: 'file',
        privacyMode: 'server',
        keywords: ['word to pdf', 'docx to pdf', 'doc to pdf', 'convert word to pdf', 'ms word to pdf', 'save docx as pdf', 'secure word to pdf', 'online doc to pdf converter'],
        content: {
            features: [
                'Universal Standard: Converts Word docs to ISO-standard PDF.',
                'Layout Preservation: Keeps text, fonts, and images in place.',
                'Secure: Secure handling of sensitive business documents.',
                'Legacy Support: Works with both .docx and .doc files.'
            ],
            howTo: [
                'Upload your Microsoft Word document.',
                'The tool converts it to PDF automatically.',
                'Download the PDF file.'
            ],
            benefits: [
                'Ensure your document looks the same on all devices.',
                'Prevent accidental editing of your content.',
                'Submit resume or legal documents in the standard format.'
            ],
            faq: [
                {
                    question: 'How do I save a Word doc as PDF online?',
                    answer: 'Simply upload your Word document to FileSwift. It will automatically convert the file to PDF format, which you can then download and share.'
                }
            ]
        },
        longDescription: `
## Convert Word to PDF Online

FileSwift allows users to convert Microsoft Word documents into PDF files. Converting to PDF ensures that your document's formatting remains locked and looks exactly the same on any computer, tablet, or smartphone.

### Why use FileSwift?
-   **Reliable**: Preserves your original layout.
-   **Fast**: Conversion takes just a few seconds.
-   **Free**: Convert documents without any cost or subscription.
`
    },
    /*
        // 11. AI PDF Summarizer (NEW)
        {
            id: 'summarize-pdf',
            title: 'AI PDF Summarizer',
            description: 'Get instant AI-powered summaries of any PDF document.',
            icon: 'Sparkles',
            color: 'bg-violet-500',
            slug: '/tools/summarize-pdf',
            type: 'file',
            ai: true,
            keywords: ['summarize pdf', 'pdf summary', 'ai pdf summarizer', 'extract key points', 'document summary', 'pdf to text summary', 'ai document reader'],
            content: {
                features: [
                    'AI-Powered: Uses advanced language models to understand context and meaning.',
                    'Multiple Modes: Choose brief, detailed, or bullet-point summaries.',
                    'Fast Processing: Get summaries in seconds, not minutes.',
                    'Secure: Your documents are processed privately and deleted after use.'
                ],
                howTo: [
                    'Upload your PDF document.',
                    'Select summary mode (Brief, Detailed, or Bullet Points).',
                    'Click "Summarize" to generate your AI summary.',
                    'Copy or download your summary.'
                ],
                benefits: [
                    'Save hours of reading time on long documents.',
                    'Quickly understand contracts, research papers, or reports.',
                    'Extract key points for meetings or presentations.'
                ],
                faq: [
                    {
                        question: 'How does the AI summarizer work?',
                        answer: 'FileSwift uses advanced AI models to read and understand your PDF content. It identifies the most important information and generates a coherent summary that captures the key points.'
                    },
                    {
                        question: 'Is my document data kept private?',
                        answer: 'Yes. Your PDF content is processed securely and is not stored or used for training. The document text is deleted immediately after generating the summary.'
                    },
                    {
                        question: 'What types of PDFs can be summarized?',
                        answer: 'Any PDF with selectable text can be summarized. This includes contracts, research papers, reports, articles, and ebooks. Scanned image-only PDFs may not work unless they have OCR text.'
                    }
                ]
            },
            longDescription: `
    ## AI PDF Summarizer
    
    FileSwift's AI PDF Summarizer helps you quickly understand the content of any document. Whether you're dealing with a 50-page research paper or a lengthy contract, our AI extracts the key information and presents it in an easy-to-read format.
    
    ### Three Summary Modes
    -   **Brief**: A 2-3 sentence overview of the main point.
    -   **Detailed**: A comprehensive multi-paragraph summary covering all key topics.
    -   **Bullet Points**: Key takeaways listed as easy-to-scan bullet points.
    
    ### Perfect For
    -   Students researching multiple papers
    -   Professionals reviewing contracts
    -   Anyone who wants to save time reading long documents
    `
        },
    */
    // 12. Remove Background (AI)
    {
        id: 'remove-background',
        title: 'Remove Background from Image',
        description: 'Remove image background instantly with AI. Get transparent PNG in seconds.',
        icon: 'Eraser',
        color: 'bg-rose-500',
        slug: '/tools/remove-background',
        type: 'image',
        ai: true,
        privacyMode: 'client',
        keywords: ['remove background', 'bg remover', 'background eraser', 'transparent png', 'remove bg from photo', 'background remover online free', 'cut out image background', 'make image transparent', 'ai', 'fast', 'speedy', 'private', 'secure'],
        content: {
            features: [
                'AI-Powered: Uses advanced machine learning to detect and remove backgrounds automatically.',
                'Transparent Output: Get a clean PNG with transparent background.',
                'Works on People & Objects: Handles portraits, products, logos, and more.',
                'High Resolution: Maintains original image quality up to 4K.'
            ],
            howTo: [
                'Upload your image (JPG, PNG, or WEBP).',
                'AI automatically detects the subject and removes the background.',
                'Preview the result with a transparent or colored background.',
                'Download your transparent PNG image.'
            ],
            benefits: [
                'Create professional product photos for e-commerce.',
                'Make profile pictures with clean backgrounds.',
                'Design marketing materials without hiring a photographer.'
            ],
            faq: [
                {
                    question: 'How do I remove the background from an image for free?',
                    answer: 'Upload your image to FileSwift and our AI will automatically detect and remove the background. You get a transparent PNG file for free, no signup required.'
                },
                {
                    question: 'Can I remove background from product photos?',
                    answer: 'Yes! FileSwift works great for product photography. Upload your product image and get a clean, transparent background perfect for Amazon, eBay, or Shopify listings.'
                },
                {
                    question: 'What image formats are supported?',
                    answer: 'You can upload JPG, PNG, and WEBP images. The output is always a high-quality PNG with transparent background.'
                }
            ]
        },
        longDescription: `
## Remove Background from Image Online

FileSwift's AI Background Remover instantly removes backgrounds from any image. Whether you need transparent product photos, clean profile pictures, or cutouts for design projects, our tool delivers professional results in seconds.

### How It Works
Our AI model analyzes your image to identify the main subject—person, product, animal, or object—and precisely removes everything else. The result is a clean PNG with a transparent background.

### Perfect For
-   **E-commerce sellers**: Clean product photos for Amazon, eBay, Shopify
-   **Social media creators**: Professional profile pictures and thumbnails
-   **Designers**: Quick cutouts for marketing materials and presentations
`
    },
    // 13. Split PDF
    {
        id: 'split-pdf',
        title: 'Split PDF',
        description: 'Split PDF into separate pages or extract specific pages.',
        icon: 'Scissors',
        color: 'bg-amber-500',
        slug: '/tools/split-pdf',
        type: 'file',
        privacyMode: 'client',
        keywords: ['split pdf', 'separate pdf pages', 'extract pdf pages', 'divide pdf', 'pdf splitter', 'split pdf online free', 'extract pages from pdf', 'break pdf into pages', 'private pdf splitter', 'instant pdf split'],
        content: {
            features: [
                'Page Selection: Choose specific pages to extract.',
                'Split by Range: Extract pages 1-5, 10-15, etc.',
                'Single Page Export: Save each page as a separate PDF.',
                'Preview Pages: See thumbnails before splitting.'
            ],
            howTo: [
                'Upload your PDF document.',
                'Select the pages you want to extract.',
                'Choose to split into individual files or a single combined file.',
                'Download your split PDF files.'
            ],
            benefits: [
                'Extract only the pages you need from large documents.',
                'Share specific sections without sending the entire file.',
                'Organize documents by separating chapters or sections.'
            ],
            faq: [
                {
                    question: 'How do I split a PDF into separate pages?',
                    answer: 'Upload your PDF to FileSwift, select "Split All Pages" option, and each page will be saved as a separate PDF file. Download them individually or as a ZIP.'
                },
                {
                    question: 'Can I extract specific pages from a PDF?',
                    answer: 'Yes! You can select specific pages (e.g., pages 2, 5, and 8) or ranges (e.g., pages 1-10) to extract into a new PDF file.'
                }
            ]
        },
        longDescription: `
## Split PDF Online

FileSwift allows you to split PDF documents into individual pages or extract specific page ranges. This is useful when you only need certain pages from a long document.

### Features
-   **Visual Selection**: See page thumbnails and click to select
-   **Range Support**: Enter page ranges like "1-5, 8, 12-15"
-   **Batch Download**: Get all split files in a single ZIP
`
    },
    // 14. JPG to PNG
    {
        id: 'jpg-to-png',
        title: 'JPG to PNG Converter',
        description: 'Convert JPG images to PNG format with transparency support.',
        icon: 'ArrowRightLeft',
        color: 'bg-sky-500',
        slug: '/tools/jpg-to-png',
        type: 'image',
        privacyMode: 'client',
        keywords: ['jpg to png', 'jpeg to png', 'convert jpg to png', 'jpg to png converter online', 'change jpg to png', 'jpeg to png free', 'private jpg to png', 'instant image conversion'],
        content: {
            features: [
                'Lossless Conversion: Preserves full image quality.',
                'Transparency Ready: PNG format supports transparent backgrounds.',
                'Batch Processing: Convert multiple JPGs at once.',
                'Original Resolution: Maintains exact pixel dimensions.'
            ],
            howTo: [
                'Upload your JPG or JPEG image.',
                'The tool automatically converts it to PNG format.',
                'Download your PNG file instantly.'
            ],
            benefits: [
                'Get transparent background support for graphics.',
                'Better quality for images with text or sharp edges.',
                'Compatible with all design software and web platforms.'
            ],
            faq: [
                {
                    question: 'Why convert JPG to PNG?',
                    answer: 'PNG supports transparent backgrounds and lossless compression, making it better for logos, graphics, and images with text. JPGs lose quality each time they are edited.'
                },
                {
                    question: 'Is the conversion free?',
                    answer: 'Yes, FileSwift offers unlimited free JPG to PNG conversions with no watermarks or signup required.'
                }
            ]
        },
        longDescription: `
## Convert JPG to PNG Online

FileSwift converts your JPG images to PNG format instantly. PNG is ideal when you need transparent backgrounds or want to preserve image quality for editing.

### When to Use PNG
-   **Logos and graphics**: Sharp edges stay crisp
-   **Images with text**: No compression artifacts
-   **Transparency needed**: Cut out backgrounds later
`
    },
    // 15. PNG to JPG
    {
        id: 'png-to-jpg',
        title: 'PNG to JPG Converter',
        description: 'Convert PNG images to JPG format for smaller file sizes.',
        icon: 'ArrowRightLeft',
        color: 'bg-emerald-500',
        slug: '/tools/png-to-jpg',
        type: 'image',
        privacyMode: 'client',
        keywords: ['png to jpg', 'png to jpeg', 'convert png to jpg', 'png to jpg converter', 'change png to jpeg', 'png to jpg online free', 'private png to jpg', 'instant image optimization'],
        content: {
            features: [
                'Smaller File Size: JPG compression reduces file size significantly.',
                'Quality Control: Choose compression level from 1-100.',
                'Batch Conversion: Process multiple PNGs simultaneously.',
                'White Background: Replaces transparency with white.'
            ],
            howTo: [
                'Upload your PNG image.',
                'Select the quality level (higher = better quality, larger file).',
                'Download your compressed JPG file.'
            ],
            benefits: [
                'Reduce file size for faster uploads and sharing.',
                'Compatible with all devices and platforms.',
                'Perfect for photos and images without transparency needs.'
            ],
            faq: [
                {
                    question: 'Why convert PNG to JPG?',
                    answer: 'JPG files are much smaller than PNGs, making them faster to upload, share, and load on websites. Use JPG for photos where transparency is not needed.'
                },
                {
                    question: 'What happens to transparent areas?',
                    answer: 'Transparent areas in PNG files will be replaced with a white background when converted to JPG, since JPG does not support transparency.'
                }
            ]
        },
        longDescription: `
## Convert PNG to JPG Online

FileSwift converts PNG images to JPG format for smaller file sizes. This is perfect when you need to reduce image size for web uploads, email attachments, or storage.

### Benefits of JPG
-   **Smaller files**: 50-80% smaller than PNG for photos
-   **Universal support**: Works everywhere
-   **Adjustable quality**: Balance size vs. quality
`
    },
    // 16. HEIC to JPG
    {
        id: 'heic-to-jpg',
        title: 'HEIC to JPG Converter',
        description: 'Convert iPhone HEIC photos to JPG format. Works on all devices.',
        icon: 'Smartphone',
        color: 'bg-blue-500',
        slug: '/tools/heic-to-jpg',
        type: 'image',
        privacyMode: 'client',
        keywords: ['heic to jpg', 'heic to jpeg', 'convert heic to jpg', 'iphone photo converter', 'heic converter', 'heic to jpg online free', 'open heic on windows', 'heic to jpg converter online', 'private heic to jpg', 'instant iphone photo conversion'],
        content: {
            features: [
                'iPhone Compatible: Converts HEIC/HEIF photos taken on iPhone.',
                'High Quality: Preserves original photo quality.',
                'Batch Conversion: Convert multiple HEIC files at once.',
                'Works Everywhere: Output JPG works on Windows, Android, and all browsers.'
            ],
            howTo: [
                'Upload your HEIC files from iPhone or Mac.',
                'FileSwift automatically converts them to JPG.',
                'Download JPG files that work on any device.'
            ],
            benefits: [
                'Open iPhone photos on Windows PC.',
                'Share photos with Android users.',
                'Upload photos to websites that dont support HEIC.'
            ],
            faq: [
                {
                    question: 'What is HEIC format?',
                    answer: 'HEIC (High Efficiency Image Container) is Apple\'s image format used on iPhones. It offers smaller file sizes than JPG but isn\'t supported on Windows and many websites.'
                },
                {
                    question: 'How do I convert HEIC to JPG on Windows?',
                    answer: 'Simply upload your HEIC file to FileSwift using any browser. We convert it to JPG instantly, which you can then download and open on Windows without any special software.'
                },
                {
                    question: 'Is the quality reduced?',
                    answer: 'FileSwift preserves the original quality when converting HEIC to JPG. The output file will look identical to the original.'
                }
            ]
        },
        longDescription: `
## Convert HEIC to JPG Online

FileSwift converts Apple's HEIC photos to universal JPG format. If you've taken photos on an iPhone and need to open them on Windows, share with Android users, or upload to a website, this tool is for you.

### Why HEIC Causes Problems
iPhones save photos in HEIC format by default to save storage. However, HEIC is not supported by:
-   **Windows**: Requires special codecs
-   **Android**: Most apps can't open HEIC
-   **Websites**: Many upload forms reject HEIC

### The Solution
Upload your HEIC files here and get standard JPG files that work everywhere.
`
    },
    // 17. PDF to Excel
    {
        id: 'pdf-to-excel',
        title: 'PDF to Excel Converter',
        description: 'Convert PDF tables to editable Excel spreadsheets.',
        icon: 'Table',
        color: 'bg-green-600',
        slug: '/tools/pdf-to-excel',
        type: 'file',
        privacyMode: 'server',
        keywords: ['pdf to excel', 'pdf to xlsx', 'convert pdf to excel', 'extract table from pdf', 'pdf to spreadsheet', 'pdf to excel converter free', 'convert pdf table to excel'],
        content: {
            features: [
                'Table Detection: Automatically finds and extracts tables.',
                'Accurate Formatting: Preserves rows, columns, and cell data.',
                'Multiple Tables: Extracts all tables from multi-page PDFs.',
                'Excel Format: Output as .xlsx compatible with Microsoft Excel.'
            ],
            howTo: [
                'Upload your PDF containing tables or data.',
                'The tool scans and extracts tabular data.',
                'Review the extracted tables.',
                'Download as an Excel (.xlsx) file.'
            ],
            benefits: [
                'Edit PDF data in Excel without retyping.',
                'Analyze financial reports and invoices.',
                'Create charts and formulas from extracted data.'
            ],
            faq: [
                {
                    question: 'Can this convert any PDF to Excel?',
                    answer: 'This tool works best for PDFs containing structured tables. Unstructured text or images will not convert well to spreadsheet format.'
                },
                {
                    question: 'Is the converted Excel editable?',
                    answer: 'Yes! The output is a standard .xlsx file that you can open and edit in Microsoft Excel, Google Sheets, or any spreadsheet software.'
                }
            ]
        },
        longDescription: `
## Convert PDF to Excel Online

FileSwift extracts tables from PDF documents and converts them to editable Excel spreadsheets. Stop manually retyping data from PDF reports.

### Best For
-   **Financial reports**: Extract numbers for analysis
-   **Invoices**: Import line items into your accounting software
-   **Data tables**: Any PDF with structured tabular data
`,
        comingSoon: true
    },
    /*
        // 18. AI Notes Generator
        {
            id: 'ai-notes',
            title: 'AI Notes Generator',
            description: 'Transform any PDF document into structured, easy-to-read study notes.',
            icon: 'FileText',
            color: 'bg-indigo-500',
            slug: '/tools/ai-notes',
            type: 'file',
            ai: true,
            keywords: ['ai notes', 'pdf to notes', 'structured notes generator', 'study notes ai', 'meeting notes from pdf'],
            content: {
                features: [
                    'Structured Output: Automatically organizes notes into topics and bullet points.',
                    'Key Takeaways: Highlights the most important information first.',
                    'Multilingual Support: Works with documents in major Indian and global languages.',
                    'Downloadable: Export your notes to multiple formats.'
                ],
                howTo: [
                    'Upload your PDF document.',
                    'The AI analyzes and structures the content.',
                    'Review the generated notes on screen.',
                    'Download or copy for your study/meetings.'
                ],
                benefits: [
                    'Focus on learning instead of manual note-taking.',
                    'Quickly review long documents before exams or meetings.',
                    'Standardize notes across different document types.'
                ],
                faq: [
                    {
                        question: 'Can I generate notes from handwritten PDFs?',
                        answer: 'The tool works best on typed, digital PDFs. Scanned documents with clear text also work well via our integrated OCR logic.'
                    }
                ]
            },
            longDescription: `
    ## AI Notes Generator
    Generate professional, structured notes from any PDF document instantly. Our AI reads through the entire file and organizes information into logical topics, headings, and bullet points.
    
    ### Why use AI for notes?
    Manually taking notes from a 20-page document can take hours. FileSwift does it in seconds, ensuring you don't miss any critical details while providing a clear structure for review.
    `
        },
        // 19. AI Document Rewriter
        {
            id: 'ai-rewrite',
            title: 'AI Document Rewriter',
            description: 'Rewrite and improve the tone of your documents while preserving the meaning.',
            icon: 'PencilLine',
            color: 'bg-orange-600',
            slug: '/tools/ai-rewrite',
            type: 'file',
            ai: true,
            keywords: ['ai rewriter', 'improve text', 'change tone of document', 'rewrite pdf', 'professional text rewriter'],
            content: {
                features: [
                    'Tone Selection: Choose between Professional, Casual, Formal, or Creative tones.',
                    'Grammar Fix: Automatically corrects errors while rewriting.',
                    'Meaning Preservation: Changes the words, but keeps your original message intact.',
                    'Instant Preview: See the original and rewritten text side-by-side.'
                ],
                howTo: [
                    'Upload the PDF you want to rewrite.',
                    'Select your desired tone and style.',
                    'Click "Rewrite" to process with AI.',
                    'Download the improved document.'
                ],
                benefits: [
                    'Make your emails and reports sound more professional.',
                    'Improve the flow and readability of your writing.',
                    'Save time on manual editing and proofreading.'
                ],
                faq: [
                    {
                        question: 'Will it change the meaning of my document?',
                        answer: 'No. The AI is instructed to preserve the core facts and meaning while only optimizing the expression and tone.'
                    }
                ]
            },
            longDescription: `
    ## AI Document Rewriter
    FileSwift's AI Rewriter helps you polish your documents. Whether you need to make a casual draft sound professional or simplify a complex report, our AI-powered tool provides high-quality rewrites in seconds.
    `
        },
        // 20. AI PDF Translator
        {
            id: 'ai-translate',
            title: 'AI PDF Translator',
            description: 'Translate PDF documents into over 50 languages with context-aware AI.',
            icon: 'Languages',
            color: 'bg-blue-500',
            slug: '/tools/ai-translate',
            type: 'file',
            ai: true,
            keywords: ['translate pdf', 'hi-tech pdf translator', 'multilingual pdf', 'contextual translation', 'ai translator'],
            content: {
                features: [
                    'Contextual Accuracy: Understands idioms and technical terms.',
                    'Global Language Support: Supports 50+ languages including Hindi, Spanish, French, etc.',
                    'Layout Preservation: Translates text while keeping the layout.',
                    'Fast & Secure: Professional quality translation in seconds.'
                ],
                howTo: [
                    'Upload your PDF document.',
                    'Select the target language.',
                    'Click "Translate".',
                    'Download your translated text/document.'
                ],
                benefits: [
                    'Read documents in your native language.',
                    'Expand your reach by translating marketing materials.',
                    'Understand legal and technical papers from abroad.'
                ],
                faq: [
                    {
                        question: 'How accurate is the AI translation?',
                        answer: 'Our translation uses Sarvam-M and GPT-4o models, which provide much higher accuracy and better flow than traditional word-for-word translators.'
                    }
                ]
            },
            longDescription: `
    ## AI PDF Translator
    Break language barriers with FileSwift's AI-powered translator. We use state-of-the-art multilingual models like Sarvam-M to provide translations that are not just accurate, but sound natural in the target language.
    `
        },
    */
    // 21. YouTube Thumbnail Resizer (SEO Specialized)
    {
        id: 'resize-image-for-youtube-thumbnail',
        title: 'YouTube Thumbnail Resizer',
        description: 'Resize any image to the perfect 1280x720 YouTube thumbnail size.',
        icon: 'Video',
        color: 'bg-red-600',
        slug: '/tools/resize-image-for-youtube-thumbnail',
        type: 'image',
        privacyMode: 'client',
        keywords: ['youtube thumbnail resizer', '1280x720 resizer', 'youtube size converter'],
        content: {
            features: [
                'One-Click Resize: Instantly scales to 1280x720.',
                'High Quality: Preserves sharpness for better click-through rates.',
                'No Cropping: Adapts your image to the 16:9 aspect ratio.',
                'Fast & Free: Get your thumbnail ready in seconds.'
            ],
            howTo: [
                'Upload your thumbnail image.',
                'The tool automatically sets the YouTube dimensions.',
                'Click "Process" and download.'
            ],
            benefits: [
                'Meet YouTube standards every time.',
                'Increase video views with clear thumbnails.',
                'Zero technical skills required.'
            ],
            faq: [
                {
                    question: 'What is the best format for YouTube thumbnails?',
                    answer: 'YouTube accepts JPG, PNG, and WEBP. We recommend PNG for maximum clarity.'
                }
            ]
        },
        longDescription: `
## YouTube Thumbnail Resizer
FileSwift helps creators optimize their videos by providing an instant 1280x720 resizer. Don't let a blurry or badly sized thumbnail lower your views.
`
    },
    // 22. Bank Statement PDF Compressor
    {
        id: 'compress-pdf-for-bank-statement',
        title: 'Compress Bank Statement',
        description: 'Securely reduce the size of bank statements for loan and visa applications.',
        icon: 'Lock',
        color: 'bg-emerald-600',
        slug: '/tools/compress-pdf-for-bank-statement',
        type: 'file',
        privacyMode: 'server',
        keywords: ['compress bank statement', 'secure pdf compression', 'bank pdf reducer', 'private bank statement compressor', 'no upload bank statement tool'],
        content: {
            features: [
                'Privacy First: Processing happens securely on your device.',
                'Clear Text: Numbers and transaction details remain perfectly readable.',
                'Small Size: Easily fit under 1MB or 2MB bank limits.',
                'Verified: Works with all major Indian and international banks.'
            ],
            howTo: [
                'Upload your bank statement PDF.',
                'Select "Medium" compression for best readability.',
                'Process securely and download.'
            ],
            benefits: [
                'Successful uploads to banking and visa portals.',
                '100% data privacy for your sensitive financial info.',
                'Avoid rejection due to large file sizes.'
            ],
            faq: [
                {
                    question: 'Is my data shared with anyone?',
                    answer: 'No. FileSwift uses client-side processing for sensitive documents whenever possible, and we never store your data.'
                }
            ]
        },
        longDescription: `
## Secure Bank Statement Compressor
FileSwift's specialized compressor ensures your sensitive financial documents are small enough for portal uploads while maintaining 100% legibility of every transaction.
`
    },
    // 23. Resume Photo Resizer
    {
        id: 'resize-photo-for-resume',
        title: 'Resume Photo Resizer',
        description: 'Resize your professional headshot for resumes and CV templates.',
        icon: 'UserCircle',
        color: 'bg-blue-400',
        slug: '/tools/resize-photo-for-resume',
        type: 'image',
        privacyMode: 'client',
        keywords: ['resume photo resizer', 'cv photo size', 'professional headshot resizer'],
        content: {
            features: [
                'Standard Presets: 2x2 inch, 3.5x4.5 cm, and square modes.',
                'Square Crop: Ideal for modern digital CV designs.',
                'Sharp Output: Ensure you look professional and clear.',
                'Mobile Ready: Take a photo on your phone and resize instantly.'
            ],
            howTo: [
                'Upload your headshot.',
                'Choose your resume format or custom size.',
                'Position and crop your face.',
                'Download and add to your resume.'
            ],
            benefits: [
                'First impressions count—ensure your photo looks professional.',
                'Meet official document size requirements.',
                'Save money on professional photo studio visits.'
            ],
            faq: [
                {
                    question: 'What is the standard size for a resume photo?',
                    answer: 'Many modern resumes use a 300x300 pixel square photo, while official CVs often use 3.5x4.5 cm.'
                }
            ]
        },
        longDescription: `
## Professional Resume Photo Resizer
A badly sized photo can make a great resume look unprofessional. FileSwift helps you get the perfect crop and resolution for your headshot in seconds.
`
    },
    /*
        // 24. Chat with PDF
        {
            id: 'ai-chat',
            title: 'Chat with PDF',
            description: 'Upload a PDF and ask questions about its content using AI.',
            icon: 'MessageSquare',
            color: 'bg-indigo-600',
            slug: '/tools/ai-chat',
            type: 'file',
            ai: true,
            keywords: ['chat with pdf', 'ai pdf chat', 'ask pdf questions', 'analyze pdf with ai', 'pdf gpt'],
            content: {
                features: [
                    'Instant Answers: Ask anything about your document.',
                    'AI Analysis: Powered by advanced language models.',
                    'Secure: Your document is analyzed in-memory and not stored.',
                    'Free: Unlimited questions for your documents.'
                ],
                howTo: [
                    'Upload your PDF document.',
                    'Wait for the AI to read the file.',
                    'Type your question in the chat box.',
                    'Get instant answers based on the document content.'
                ],
                benefits: [
                    'Quickly find information in long reports.',
                    'Summarize specific sections on demand.',
                    'Clarify complex concepts within the document.'
                ],
                faq: [
                    {
                        question: 'Is the chat private?',
                        answer: 'Yes. We process the document text securely and do not store your files or conversations.'
                    }
                ]
            },
            longDescription: `
    ## Chat with PDF Online
    
    FileSwift's AI Chat allows you to have a conversation with your PDF documents. Instead of reading through pages of text, simply ask a question and get an instant answer based on the file's content.
    
    ### How it works
    1. **Upload**: Select your PDF file.
    2. **Read**: Our AI extracts the text from your document.
    3. **Chat**: You ask questions, and the AI answers using the document as knowledge.
    `
        }
    */
];
