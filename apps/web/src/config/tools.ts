import { Tool } from './tools';

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
        description: 'Reduce PDF file size for free without losing quality.',
        icon: 'Minimize2',
        color: 'bg-red-500',
        slug: '/tools/compress-pdf',
        type: 'file',
        keywords: ['compress pdf', 'reduce pdf size', 'compress small pdf', 'pdf compressor free', 'shrink pdf', 'optimize pdf', 'compress pdf file', 'reduce pdf file size'],
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
        keywords: ['image compressor online', 'compress jpg', 'compress png', 'reduce image size', 'optimize images', 'image optimizer', 'resize image online'],
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
        keywords: ['image to pdf', 'jpg to pdf', 'png to pdf', 'convert photo to pdf', 'combine images to pdf', 'jpeg to pdf', 'pictures to pdf'],
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
        keywords: ['pdf to word', 'pdf to docx', 'convert pdf to word editable', 'pdf to text', 'pdf converter to word', 'edit pdf in word'],
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
        keywords: ['merge pdf', 'combine pdf', 'join pdf', 'stitch pdf', 'bind pdf', 'merge pdf files online', 'combine multiple pdfs'],
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
        keywords: ['rotate pdf', 'turn pdf', 'change pdf orientation', 'fix upside down pdf', 'rotate pdf pages online', 'save rotated pdf'],
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
        keywords: ['resize image', 'change image size', 'resize photo', 'scale image', 'resize jpg', 'resize png', 'image dimensions changer'],
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
        keywords: ['pdf to image', 'pdf to jpg', 'pdf to png', 'convert pdf pages to images', 'extract images from pdf'],
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
        keywords: ['word to pdf', 'docx to pdf', 'doc to pdf', 'convert word to pdf', 'ms word to pdf', 'save docx as pdf'],
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
    }
];
