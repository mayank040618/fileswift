import { Tool } from './tools';

export interface SeoPage {
    id: string; // The URL slug
    targetToolId: string; // The actual tool to use
    title: string;
    description: string;
    keywords: string[];
    content: Tool['content'];
    longDescription: string;
}

export const SEO_PAGES: SeoPage[] = [
    // 1. Compress PDF for Email
    {
        id: 'compress-pdf-for-email',
        targetToolId: 'compress-pdf',
        title: 'Compress PDF for Email Attachment - Reduce File Size Online',
        description: 'Easily compress PDF files to send via email. Reduce PDF size below 25MB for Gmail, Outlook, and Yahoo. Free, fast, and secure.',
        keywords: ['compress pdf for email', 'reduce pdf size for email', 'shrink pdf for gmail', 'email pdf compressor', 'pdf size reducer for outlook'],
        content: {
            features: [
                'Email-Ready Size: Optimizes PDFs specifically to fit within standard 25MB email attachment limits.',
                'High Quality Text: Keeps text sharp so contracts and reports remain readable.',
                'Instant Processing: Compress and download in seconds before hitting "Send".',
                'Secure Handling: Files are deleted automatically after 1 hour.'
            ],
            howTo: [
                'Upload the PDF you want to email.',
                'Select "Medium" compression for the best balance of size and quality.',
                'Wait a moment for the file to be optimized.',
                'Download the smaller PDF and attach it to your email.'
            ],
            benefits: [
                'Bypass "File too large" errors from email providers.',
                'Send files faster to clients and colleagues.',
                'Avoid using third-party file transfer services.'
            ],
            faq: [
                {
                    question: 'How small will my PDF get?',
                    answer: 'We typically see reductions of 30-70% depending on the content. Our "High" compression mode is perfect for getting huge files under the 25MB limit.'
                },
                {
                    question: 'Will the recipient be able to read it?',
                    answer: 'Yes! We optimize specifically for screen reading. Text and important details remain clear, while unnecessary metadata is removed.'
                }
            ]
        },
        longDescription: `
## How to Compress PDF for Email

"The file you are trying to send exceeds the 25MB attachment limit." We've all seen that annoying message from Gmail or Outlook. FileSwift is here to fix it with our specialized **PDF Compressor for Email**.

### Why do emails reject large PDFs?

Most email providers like **Gmail**, **Outlook**, and **Yahoo** have a strict attachment limit, usually around **20MB to 25MB**. If your PDF contains high-resolution images or unoptimized data, it can easily exceed this cap.

### The Solution: Smart Compression

FileSwift analyzes your document and identifies parts that can be squeezed without hurting quality. By removing invisible metadata and optimizing images, we can shrink your document significantly, making it safe to attach and send.
`
    },
    // 2. Resize Image for Instagram
    {
        id: 'resize-image-for-instagram',
        targetToolId: 'image-resizer',
        title: 'Resize Image for Instagram (Story, Post, Reel)',
        description: 'Resize photos for Instagram Stories (1080x1920), Posts (1080x1080), and Profile Pictures. Free online image resizer for social media.',
        keywords: ['resize image for instagram', 'instagram photo resizer', 'crop photo for instagram story', 'resize for instagram bio', 'resize image 1080x1080'],
        content: {
            features: [
                'Instagram Presets: Perfect dimensions for Stories, Square Posts, and Portrait Posts.',
                'No Cropping Needed: Fit your entire photo without cutting off important details.',
                'High Resolution: Keep your photos crisp on Retina displays.',
                'Works on Mobile: Resize directly from your iPhone or Android.'
            ],
            howTo: [
                'Upload your photo (JPG or PNG).',
                'Enter 1080x1080 for a Square Post or 1080x1920 for a Story.',
                'Click "Process" to resize.',
                'Download and post to Instagram without auto-cropping.'
            ],
            benefits: [
                'Avoid blurry or pixelated uploads.',
                'Stop Instagram from awkwardly cropping your head/feet.',
                'Maintain a consistent, professional feed aesthetic.'
            ],
            faq: [
                {
                    question: 'What is the best size for Instagram Posts?',
                    answer: 'For a square post, use **1080x1080 pixels**. For a portrait (taller) post, use **1080x1350 pixels** to take up more screen space.'
                },
                {
                    question: 'What is the size for Instagram Stories?',
                    answer: 'Instagram Stories should be **1080x1920 pixels** (aspect ratio 9:16) for full-screen quality.'
                }
            ]
        },
        longDescription: `
## Resize Photos for Instagram

Tired of Instagram cropping your beautiful photos? Or maybe your uploaded Story looks blurry? The secret is uploading the **exact right pixel dimensions**. FileSwift's **Instagram Image Resizer** helps you prepare your content perfectly.

### The Magic Numbers for Instagram

Instagram compresses images aggressively. To get the best quality, you should feed it the exact dimensions it expects:
*   **Square Post**: 1080 x 1080 px
*   **Portrait Post**: 1080 x 1350 px (Best for engagement!)
*   **Landscape Post**: 1080 x 608 px
*   **Story / Reel Cover**: 1080 x 1920 px

### How to use this tool

Simply upload your image, type in the width and height you need (e.g., 1080 and 1350), and let FileSwift resize it. You can then save it to your phone and post it directly to the app with zero quality loss.
`
    },
    // 3. Convert Scanned PDF to Word
    {
        id: 'convert-scanned-pdf-to-word',
        targetToolId: 'pdf-to-word',
        title: 'Convert Scanned PDF to Word - Editable Text',
        description: 'Convert scanned PDF documents into editable Word files. Extract text from images and scans specifically for editing.',
        keywords: ['convert scanned pdf to word', 'ocr pdf to word', 'edit scanned document in word', 'extract text from scanned pdf'],
        content: {
            features: [
                'Handles Scans: Works on documents scanned from physical paper.',
                'Editable Output: Get a Word doc you can actually type in.',
                ' Layout Retention: Keeps the structure of the original scan.',
                'Privacy First: Your sensitive documents are safe.'
            ],
            howTo: [
                'Upload your scanned PDF file.',
                'Click "Convert" to initialize the text extraction.',
                'Wait for the processing to finish.',
                'Download your editable Word document.'
            ],
            benefits: [
                'Stop retyping documents manually.',
                'Digitize old paper records effortlessly.',
                'Fix errors in permanent hard copies.'
            ],
            faq: [
                {
                    question: 'Does this work on handwritten text?',
                    answer: 'It works best on printed text (typed letters, invoices). Handwriting recognition is experimental and may vary in accuracy.'
                },
                {
                    question: 'Is it free?',
                    answer: 'Yes, FileSwift allows you to convert scanned documents for free without needing expensive software like Adobe Acrobat Pro.'
                }
            ]
        },
        longDescription: `
## Convert Scanned PDFs to Editable Word Docs

We've all been there: someone sends you a **scanned picture of a document** and asks you to "make a few changes." You can't click on the text, you can't delete anything, and retyping the whole thing would take hours.

### Stop Retyping. Start Converting.

FileSwift's **Scanned PDF to Word** converter is designed to tackle this exact problem. By analyzing the visual patterns in your scanned file, we reconstruct the document in Microsoft Word format.

### Good for:
*   **Old Contracts**: Update terms on a contract that only exists on paper.
*   **Resumes**: Edit a resume that was saved as a flat image.
*   **Class Notes**: Turn photos of handouts into searchable digital notes.
`
    }
];
