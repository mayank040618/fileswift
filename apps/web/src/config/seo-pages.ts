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
    },
    // 4. Resize Image for Passport Photo
    {
        id: 'resize-image-for-passport-photo',
        targetToolId: 'image-resizer',
        title: 'Resize Image for Passport Photo (2x2, 35x45mm)',
        description: 'Resize photos to exact passport and visa photo dimensions. US passport 2x2 inch, Indian passport 35x45mm, and more.',
        keywords: ['passport photo size', 'resize photo for passport', '2x2 photo', 'visa photo size', 'passport photo dimensions', '35x45mm photo', 'resize for visa application'],
        content: {
            features: [
                'Exact Dimensions: Resize to precise passport photo requirements.',
                'Multiple Standards: US (2x2 inch), India (35x45mm), UK (35x45mm), Schengen (35x45mm).',
                'High Resolution: Maintains photo quality for print.',
                'Face Detection: Helps position your face correctly within the frame.'
            ],
            howTo: [
                'Upload your photo (front-facing, neutral expression).',
                'Select your country or enter custom dimensions.',
                'Adjust crop position if needed.',
                'Download your passport-ready photo.'
            ],
            benefits: [
                'Save money by not visiting photo studios.',
                'Get instant results for urgent visa applications.',
                'Resize photos taken at home to official specifications.'
            ],
            faq: [
                {
                    question: 'What is the size for US passport photo?',
                    answer: 'US passport photos must be exactly **2 x 2 inches (51 x 51 mm)**. The head should be between 1 inch and 1-3/8 inches from the bottom of the chin to the top of the head.'
                },
                {
                    question: 'What size is Indian passport photo?',
                    answer: 'Indian passport photos require **35 x 45 mm** dimensions with 80% face coverage. The face should be clearly visible with a white background.'
                },
                {
                    question: 'Can I take passport photos at home?',
                    answer: 'Yes! Take a photo against a white background with good lighting, then use FileSwift to resize it to exact passport specifications.'
                }
            ]
        },
        longDescription: `
## Resize Photos for Passport & Visa Applications

Stop paying for expensive passport photo services.FileSwift helps you resize any photo to meet official passport and visa requirements for any country.

### Common Passport Photo Sizes

| Country | Size | Pixels(300 DPI) |
| ---------| ------| ------------------|
| USA | 2 x 2 inches | 600 x 600 px |
| India | 35 x 45 mm | 413 x 531 px |
| UK | 35 x 45 mm | 413 x 531 px |
| China | 33 x 48 mm | 390 x 567 px |
| Schengen | 35 x 45 mm | 413 x 531 px |

### Tips for Perfect Passport Photos
    - Use a ** white or light gray background **
        -   Face the camera directly with a ** neutral expression **
-   Ensure ** even lighting ** without shadows
    - Keep your head centered in the frame
        `
    },
    // 5. Compress PDF Under 100KB
    {
        id: 'compress-pdf-under-100kb',
        targetToolId: 'compress-pdf',
        title: 'Compress PDF to 100KB - Reduce PDF Size Online',
        description: 'Compress PDF files to under 100KB for government portals and job applications. Free online PDF compressor.',
        keywords: ['compress pdf to 100kb', 'reduce pdf to 100kb', 'pdf under 100kb', 'shrink pdf 100kb', 'compress pdf below 100kb', 'make pdf smaller 100kb'],
        content: {
            features: [
                'Target Size: Optimizes specifically for 100KB or smaller.',
                'Smart Compression: Balances quality and size automatically.',
                'Multiple Attempts: Tries different compression levels until target is reached.',
                'Secure: Files deleted after processing.'
            ],
            howTo: [
                'Upload your PDF that needs to be under 100KB.',
                'Select "Maximum" compression level.',
                'Wait for the optimization to complete.',
                'Download if size is under 100KB, or try again with a smaller source file.'
            ],
            benefits: [
                'Meet strict file size limits on government websites.',
                'Upload to job portals with 100KB limits.',
                'Send documents via forms with small size restrictions.'
            ],
            faq: [
                {
                    question: 'How do I compress a PDF to exactly 100KB?',
                    answer: 'Upload your file to FileSwift and use the maximum compression setting. If your file is originally very large with many images, you may need to reduce image quality or remove unnecessary pages first.'
                },
                {
                    question: 'Why do some websites require PDFs under 100KB?',
                    answer: 'Many government portals and job application sites have strict file size limits (often 100KB or 200KB) to manage server load and storage. These limits are common for certificate uploads.'
                }
            ]
        },
        longDescription: `
## Compress PDF to Under 100KB

Many government websites, job portals, and application forms require documents under 100KB.FileSwift's PDF compressor helps you meet these strict requirements.

### When You Need This
    -   ** Government portals **: Uploading certificates, ID proofs
        -   ** Job applications **: Resume and document uploads
            -   ** University forms **: Transcripts and certificates
                -   ** Bank applications **: KYC document submissions

### How to Get the Best Results
1.  Start with the ** highest compression ** setting
2.  If still too large, try removing unnecessary pages
3.  For image - heavy PDFs, consider converting to a text PDF
    `
    },
    // 6. Compress PDF Under 200KB
    {
        id: 'compress-pdf-under-200kb',
        targetToolId: 'compress-pdf',
        title: 'Compress PDF to 200KB - Free Online Tool',
        description: 'Reduce PDF file size to under 200KB for online submissions. Works on all browsers, no software needed.',
        keywords: ['compress pdf to 200kb', 'reduce pdf to 200kb', 'pdf under 200kb', 'shrink pdf 200kb', 'compress pdf below 200kb', 'make pdf smaller 200kb'],
        content: {
            features: [
                '200KB Target: Optimized compression for 200KB limit.',
                'Preview Size: See the compressed size before downloading.',
                'Quality Retention: Keeps text readable at 200KB.',
                'Fast Processing: Results in seconds.'
            ],
            howTo: [
                'Upload your PDF document.',
                'Select "High" compression setting.',
                'View the resulting file size.',
                'Download your compressed PDF under 200KB.'
            ],
            benefits: [
                'Meet 200KB upload limits on various portals.',
                'Upload documents faster with smaller files.',
                'Save storage space on cloud drives.'
            ],
            faq: [
                {
                    question: 'How small can I compress a PDF?',
                    answer: 'The minimum size depends on your original content. Text-only PDFs can compress significantly smaller than image-heavy documents. A 1-page text PDF can easily be under 50KB.'
                }
            ]
        },
        longDescription: `
## Compress PDF to Under 200KB

FileSwift helps you reduce PDF file size to meet 200KB limits common on many upload forms and application portals.

### Perfect For
    -   ** Certificate uploads **: Degree certificates, marksheets
        -   ** ID documents **: Scanned ID cards and proofs
            -   ** Form attachments **: Any portal with 200KB limits
                `
    },
    // 7. Resize Image for WhatsApp DP
    {
        id: 'resize-image-for-whatsapp-dp',
        targetToolId: 'image-resizer',
        title: 'Resize Image for WhatsApp DP (Profile Picture)',
        description: 'Resize photos to perfect WhatsApp profile picture size. Get the best quality DP without cropping issues.',
        keywords: ['whatsapp dp size', 'whatsapp profile picture size', 'resize for whatsapp dp', 'whatsapp dp dimensions', 'profile picture whatsapp', 'whatsapp dp photo size'],
        content: {
            features: [
                'Perfect Size: Resize to 500x500 pixels (optimal for WhatsApp).',
                'No Cropping: Full image visible in circular crop preview.',
                'Center Preview: See how your photo will look as a circle.',
                'High Quality: Maintains sharpness after upload.'
            ],
            howTo: [
                'Upload the photo you want as your WhatsApp DP.',
                'Enter 500 for both width and height.',
                'Position your face in the center.',
                'Download and set as your WhatsApp profile picture.'
            ],
            benefits: [
                'Get a sharp, clear profile picture.',
                'Avoid WhatsApp auto-cropping important parts.',
                'Make your DP look professional.'
            ],
            faq: [
                {
                    question: 'What is the best size for WhatsApp profile picture?',
                    answer: 'WhatsApp recommends **500 x 500 pixels** for profile pictures. While it accepts larger images, 500x500 is optimal for quality and quick loading.'
                },
                {
                    question: 'Why does my WhatsApp DP look blurry?',
                    answer: 'Blurry DPs usually result from uploading very small images that get stretched, or very large images that get heavily compressed. Use 500x500 for best results.'
                }
            ]
        },
        longDescription: `
## Resize Photos for WhatsApp Profile Picture

Get the perfect WhatsApp DP by resizing your photos to the optimal dimensions.Avoid blurry or awkwardly cropped profile pictures.

### Recommended Dimensions
    -   ** Optimal size **: 500 x 500 pixels
        -   ** Aspect ratio **: 1: 1(square)
            -   ** File format **: JPG or PNG

### Pro Tips
    - Keep your face ** centered ** since WhatsApp crops to a circle
        - Use photos with good ** lighting ** and contrast
            - Avoid text near edges as it may get cut off
                `
    },
    // 8. Compress Image for Email
    {
        id: 'compress-image-for-email',
        targetToolId: 'image-compressor',
        title: 'Compress Images for Email - Reduce Photo Size',
        description: 'Compress images to send via email without hitting attachment limits. Reduce photo file size while keeping quality.',
        keywords: ['compress image for email', 'reduce photo size for email', 'compress photo for email', 'email image compressor', 'shrink image for email', 'reduce image size for email attachment'],
        content: {
            features: [
                'Email-Ready: Compresses to sizes suitable for email attachments.',
                'Batch Processing: Compress multiple photos at once.',
                'Quality Presets: Choose from Low, Medium, High compression.',
                'All Formats: Works with JPG, PNG, and WEBP.'
            ],
            howTo: [
                'Upload the photos you want to email.',
                'Select "Medium" compression for the best balance.',
                'Download all compressed images.',
                'Attach to your email without size errors.'
            ],
            benefits: [
                'Avoid "file too large" errors in Gmail and Outlook.',
                'Send multiple photos in a single email.',
                'Faster upload and download times for recipients.'
            ],
            faq: [
                {
                    question: 'What size should images be for email?',
                    answer: 'For email, aim for images under 1MB each. Most email services (Gmail, Outlook) have a 25MB total attachment limit, so if sending multiple images, keep each under 2-3MB.'
                },
                {
                    question: 'Will compression affect image quality?',
                    answer: 'FileSwift uses smart compression that significantly reduces file size with minimal visible quality loss. For most email purposes, the difference is not noticeable.'
                }
            ]
        },
        longDescription: `
## Compress Images for Email Attachments

Stop getting "file too large" errors when emailing photos.FileSwift compresses your images to email - friendly sizes while keeping them looking great.

### Email Attachment Limits
    | Provider | Max Attachment |
| ----------| ---------------|
| Gmail | 25 MB |
| Outlook | 20 MB |
| Yahoo | 25 MB |
| iCloud | 20 MB |

### Best Practices
    - Compress photos to ** under 1MB each **
        -   Use JPG format for photos(smaller than PNG)
            - Send very large collections via cloud links instead
                `
    },
    // 9. Merge Multiple Images to PDF
    {
        id: 'merge-images-to-pdf',
        targetToolId: 'image-to-pdf',
        title: 'Merge Multiple Images into One PDF',
        description: 'Combine multiple photos into a single PDF document. Perfect for creating photo albums, portfolios, or document scans.',
        keywords: ['merge images to pdf', 'combine photos to pdf', 'multiple images to pdf', 'combine jpg to pdf', 'photo album pdf', 'join images into pdf'],
        content: {
            features: [
                'Unlimited Images: Merge as many photos as you need.',
                'Drag to Reorder: Arrange images in your preferred sequence.',
                'Page Fitting: Each image becomes a full page.',
                'High Resolution: Preserves original image quality.'
            ],
            howTo: [
                'Upload all the images you want to combine.',
                'Drag and drop to arrange the order.',
                'Click "Convert to PDF".',
                'Download your multi-page PDF.'
            ],
            benefits: [
                'Create digital photo albums as a single file.',
                'Compile scanned documents into one PDF.',
                'Share multiple photos as one easy-to-view document.'
            ],
            faq: [
                {
                    question: 'How many images can I merge into one PDF?',
                    answer: 'FileSwift allows you to merge unlimited images into a single PDF. Each image will become one page in the final document.'
                },
                {
                    question: 'Can I add images in a specific order?',
                    answer: 'Yes! After uploading, you can drag and drop to rearrange the images in any order before creating the PDF.'
                }
            ]
        },
        longDescription: `
## Merge Multiple Images into a Single PDF

FileSwift makes it easy to combine multiple photos or images into one PDF document.Perfect for creating portfolios, photo albums, or compiling scanned documents.

### Use Cases
    -   ** Photo albums **: Share vacation photos as a single file
        -   ** Document scans **: Combine multi - page scanned documents
            -   ** Portfolios **: Create a PDF portfolio from image files
                -   ** Receipts **: Compile expense receipts into one document
                    `
    },
    // 10. Convert Screenshot to PDF
    {
        id: 'convert-screenshot-to-pdf',
        targetToolId: 'image-to-pdf',
        title: 'Convert Screenshot to PDF - Save Screenshots as PDF',
        description: 'Convert screenshots to PDF format. Save mobile or desktop screenshots as PDF documents.',
        keywords: ['screenshot to pdf', 'convert screenshot to pdf', 'save screenshot as pdf', 'screen capture to pdf', 'screenshot to pdf converter'],
        content: {
            features: [
                'Any Screenshot: Works with phone, tablet, or desktop captures.',
                'Combine Multiple: Merge several screenshots into one PDF.',
                'Preserve Quality: Sharp text and images in the output.',
                'Instant Conversion: No waiting or processing delays.'
            ],
            howTo: [
                'Take a screenshot on your device.',
                'Upload the screenshot image to FileSwift.',
                'Click "Convert to PDF".',
                'Download your PDF document.'
            ],
            benefits: [
                'Document important conversations or transactions.',
                'Create PDF records of online receipts.',
                'Share screen captures as professional documents.'
            ],
            faq: [
                {
                    question: 'How do I convert a screenshot to PDF on iPhone?',
                    answer: 'Take a screenshot on your iPhone, then open FileSwift in Safari. Upload the screenshot and convert it to PDF. You can also merge multiple screenshots into one PDF.'
                },
                {
                    question: 'Can I convert a long screenshot to PDF?',
                    answer: 'Yes! FileSwift handles long or scrolling screenshots. Upload your full-page screenshot and it will convert to a properly sized PDF.'
                }
            ]
        },
        longDescription: `
## Convert Screenshots to PDF

Turn your screen captures into PDF documents for easy sharing and archiving.Works with screenshots from any device.

### Perfect For
    -   ** Documenting issues **: Save error messages or bugs as PDFs
        -   ** Receipts **: Convert online payment confirmations to PDF records
            -   ** Conversations **: Archive important chats or messages
                -   ** Tutorials **: Create PDF guides from step - by - step screenshots
                    `
    },
    // 11. Resize Image for LinkedIn
    {
        id: 'resize-image-for-linkedin',
        targetToolId: 'image-resizer',
        title: 'Resize Photo for LinkedIn Profile & Banner',
        description: 'Resize images for LinkedIn profile picture (400x400) and banner (1584x396). Professional photo resizing for LinkedIn.',
        keywords: ['linkedin photo size', 'linkedin profile picture size', 'linkedin banner size', 'resize for linkedin', 'linkedin cover photo dimensions', 'linkedin profile dimensions'],
        content: {
            features: [
                'Profile Picture: Resize to 400x400 pixels (recommended).',
                'Banner Image: Resize to 1584x396 pixels for cover photo.',
                'Preview: See how your image will appear on LinkedIn.',
                'Professional Quality: High-resolution output for business use.'
            ],
            howTo: [
                'Upload your professional headshot or banner image.',
                'Enter LinkedIn dimensions (400x400 for profile, 1584x396 for banner).',
                'Adjust crop position if needed.',
                'Download and upload to LinkedIn.'
            ],
            benefits: [
                'Look professional with properly sized profile photos.',
                'Avoid blurry or stretched images on your LinkedIn.',
                'Make a great first impression on recruiters.'
            ],
            faq: [
                {
                    question: 'What size should a LinkedIn profile picture be?',
                    answer: 'LinkedIn recommends **400 x 400 pixels** for profile pictures. The platform accepts images from 400x400 to 7680x4320 pixels, but 400x400 ensures the best display quality.'
                },
                {
                    question: 'What is the LinkedIn banner size?',
                    answer: 'LinkedIn background/banner images should be **1584 x 396 pixels**. This ensures your banner looks sharp on both desktop and mobile devices.'
                },
                {
                    question: 'How can I make my LinkedIn photo look professional?',
                    answer: 'Use a high-quality headshot with good lighting, a neutral background, and professional attire. Make sure to resize to 400x400 pixels for the best display quality.'
                }
            ]
        },
        longDescription: `
## Resize Images for LinkedIn

Make a professional impression with perfectly sized LinkedIn photos.FileSwift helps you resize profile pictures and banner images to LinkedIn's exact specifications.

### LinkedIn Image Dimensions

    | Image Type | Size | Aspect Ratio |
| ------------| ------| --------------|
| Profile Picture | 400 x 400 px | 1: 1 |
| Background Banner | 1584 x 396 px | 4: 1 |
| Company Logo | 300 x 300 px | 1: 1 |
| Post Image | 1200 x 627 px | ~2: 1 |

### Pro Tips for LinkedIn Photos
    - Use a ** professional headshot ** with good lighting
        - Choose a ** neutral, uncluttered background **
            -   Dress in ** professional attire **
                -   Make sure your face is ** clearly visible ** (takes up ~60 % of frame)
`
    },
    // 12. Resize Image for YouTube Thumbnail
    {
        id: 'resize-image-for-youtube-thumbnail',
        targetToolId: 'image-resizer',
        title: 'Resize Image for YouTube Thumbnail (1280x720)',
        description: 'Resize images to 1280x720 pixels for YouTube Thumbnails. Free online resizer for YouTube cover photos and thumbnails.',
        keywords: ['youtube thumbnail size', 'resize image for youtube', '1280x720 image converter', 'youtube thumbnail resizer', 'create youtube thumbnail size', 'resize picture for youtube'],
        content: {
            features: [
                'Perfect Size: One-click resize to 1280x720 pixels.',
                'High Quality: Keeps your thumbnail sharp and clear.',
                'No Cropping: Fit your entire image into the thumbnail frame.',
                'Fast Processing: Get your thumbnail ready in seconds.'
            ],
            howTo: [
                'Upload your image file.',
                'Enter 1280 for width and 720 for height.',
                'Click Process Image.',
                'Download your perfect YouTube thumbnail.'
            ],
            benefits: [
                'Increase click-through rates with professional thumbnails.',
                'Meet YouTube\'s exact size requirements.',
                'Avoid black bars or stretched images.'
            ],
            faq: [
                {
                    question: 'What is the best size for YouTube thumbnails?',
                    answer: 'The ideal size is **1280 x 720 pixels** (with a minimum width of 640 pixels). The aspect ratio should be 16:9.'
                },
                {
                    question: 'What file formats does YouTube accept?',
                    answer: 'YouTube accepts JPG, GIF, BMP, or PNG image formats. The file size must be under 2MB.'
                }
            ]
        },
        longDescription: `
## Resize Image for YouTube Thumbnail

Create the perfect YouTube thumbnail every time. FileSwift helps you resize any image to the recommended 1280x720 dimensions.

### Why Thumbnail Size Matters
*   **Visibility**: Correctly sized thumbnails look crisp on all devices
*   **CTR**: Professional thumbnails get more clicks
*   **Standards**: Meets standard 16:9 aspect ratio requirements

### YouTube Requirements
*   **Resolution**: 1280x720 (with min width of 640)
*   **Formats**: JPG, GIF, BMP, or PNG
*   **Size**: Under 2MB limit
*   **Ratio**: 16:9 is the best choice
`
    },
    // 13. Compress PDF for Bank Statement
    {
        id: 'compress-pdf-for-bank-statement',
        targetToolId: 'compress-pdf',
        title: 'Compress PDF for Bank Statement & Loan Application',
        description: 'Reduce PDF size for bank statements, loan applications, and financial documents. Secure, private compression for sensitive files.',
        keywords: ['compress bank statement pdf', 'reduce pdf size for loan', 'compress pdf for sbi', 'compress pdf for hdfc', 'financial document compressor', 'secure pdf compression'],
        content: {
            features: [
                '100% Private: Files processed locally in browser.',
                'High Compression: Reduce large statement files by up to 90%.',
                'Readable Text: Numbers and text remain crystal clear.',
                'Bank Ready: Ideal for SBI, HDFC, ICICI, and other bank uploads.'
            ],
            howTo: [
                'Select your bank statement PDF.',
                'Choose "Medium" or "High" compression.',
                'Wait for the secure local processing.',
                'Download the smaller file for upload.'
            ],
            benefits: [
                'Safely compress sensitive financial data.',
                'Upload easily to banking and loan portals.',
                'Keep records organized with smaller file sizes.'
            ],
            faq: [
                {
                    question: 'Is it safe to compress bank statements online?',
                    answer: 'With FileSwift, yes. We use **client-side processing**, meaning your file never leaves your computer. It is not uploaded to any server, ensuring 100% privacy.'
                },
                {
                    question: 'Will the numbers remain readable?',
                    answer: 'Absolutely. Our text optimization ensures that all numbers, dates, and transaction details remain sharp and legible.'
                }
            ]
        },
        longDescription: `
## Compress PDF Bank Statements Securely

Uploading bank statements for loans, visas, or tax returns? Portals often reject large PDF files. FileSwift allows you to compress these sensitive documents safely.

### Why Use FileSwift for Banking Docs?
*   **Privacy First**: Unlike other tools, we do NOT upload your file to a cloud server. Processing happens right on your device.
*   **High Clarity**: Financial documents need to be legible. We prioritize text sharpness.
*   **Universal Compatibility**: Works for standard statements from all major banks.

### Perfect For:
*   Home Loan Applications
*   Visa Financial Proofs
*   Tax Filing Uploads
*   KYC Documents
`
    },
    // 14. Resize Photo for Resume/CV
    {
        id: 'resize-photo-for-resume',
        targetToolId: 'image-resizer',
        title: 'Resize Photo for Resume & CV Online',
        description: 'Resize your professional photo for resumes and CVs. Create perfect square or passport-sized photos for job applications.',
        keywords: ['resume photo size', 'resize image for cv', 'professional photo resizer', 'cv photo maker', 'resize picture for job application', 'passport size photo for resume'],
        content: {
            features: [
                'Square Crop: Create 1:1 photos for modern resumes.',
                'Passport Size: Standard dimension presets available.',
                'Professional Look: Maintain high resolution.',
                'Easy Edits: Resize and crop in seconds.'
            ],
            howTo: [
                'Upload your professional headshot.',
                'Enter desired dimensions (e.g., 200x200 or 300x300).',
                'Process the image.',
                'Add the perfectly sized photo to your CV.'
            ],
            benefits: [
                'Make your resume look polished and professional.',
                'Avoid stretched or pixelated images.',
                'Fit photo placeholders perfectly.'
            ],
            faq: [
                {
                    question: 'What is the best photo size for a resume?',
                    answer: 'A standard square size like **200x200 pixels** or **300x300 pixels** works best for most modern resume templates.'
                },
                {
                    question: 'Should I include a photo on my resume?',
                    answer: 'It depends on the country. In many European and Asian countries, a photo is expected. In the US/UK, it is generally not required unless you are in acting or modeling.'
                }
            ]
        },
        longDescription: `
## Resize Photos for Professional Resumes

A blurry or badly cropped photo can ruin a great resume. Ensure your professional headshot looks its best with FileSwift.

### Recommended Sizes
*   **Square**: 300x300 px (Most common for digital CVs)
*   **Passport**: 35x45 mm (Standard for official documents)
*   **Small**: 150x150 px (For minimal templates)

### Tips for a Great Resume Photo
*   Wear professional attire
*   Use a neutral background
*   Smile naturally
*   Ensure good lighting on your face
`
    },
    // 15. Compress PDF to 1MB
    {
        id: 'compress-pdf-to-1mb',
        targetToolId: 'compress-pdf',
        title: 'Compress PDF to 1MB - Reduce File Size',
        description: 'Compress PDF files to under 1MB. High-quality compression for documents that need to meet 1MB upload limits.',
        keywords: ['compress pdf to 1mb', 'reduce pdf under 1mb', 'pdf compressor 1mb', 'shrink pdf 1mb', 'compress pdf file to 1mb', 'pdf size reducer 1mb'],
        content: {
            features: [
                'Target 1MB: Optimize files to fit under the 1MB limit.',
                'Balanced Compression: Good quality with significant size reduction.',
                'Fast & Free: Unlimited compressions.',
                'Works on Mobile: Compress directly from your phone.'
            ],
            howTo: [
                'Upload your PDF file.',
                'Select "Medium" or "High" compression.',
                'Check if the result is under 1MB.',
                'Download the optimized file.'
            ],
            benefits: [
                'Upload to portals with strict 1MB limits.',
                'Share easier via email and chat apps.',
                'Save space on your device.'
            ],
            faq: [
                {
                    question: 'Can I compress a 10MB file to 1MB?',
                    answer: 'It is often possible, especially if the file contains high-resolution images. Use the "High" compression setting for the best chance.'
                },
                {
                    question: 'Does this remove pages?',
                    answer: 'No, this tool only compresses the data (images, fonts). It keeps all pages intact. If you need to remove pages, use our Split PDF tool.'
                }
            ]
        },
        longDescription: `
## Compress PDF to Under 1MB

Many corporate portals, university submission sites, and email forms have a **1MB file size limit**. FileSwift makes it easy to shrink your documents to meet this requirement.

### How we achieve 1MB
*   **Image Downsampling**: Reducing excessive resolution of embedded photos
*   **Stream Compression**: Efficiently packing the PDF data structure
*   **Metadata Removal**: Stripping unseen data that adds weight

### Success Tips
*   Start with **Medium Compression** to preserve quality
*   If still over 1MB, switch to **High Compression**
*   For scanned docs, this works exceptionally well
`
    },
    // 16. Compress PDF to 2MB
    {
        id: 'compress-pdf-to-2mb',
        targetToolId: 'compress-pdf',
        title: 'Compress PDF to 2MB - Online PDF Reducer',
        description: 'Reduce PDF file size to under 2MB. Perfect for application forms and portals with 2MB or 5MB limits.',
        keywords: ['compress pdf to 2mb', 'reduce pdf size 2mb', 'pdf under 2mb', 'shrink pdf to 2mb', 'pdf compressor 2mb', 'resize pdf 2mb'],
        content: {
            features: [
                'Versatile Target: Get files under the common 2MB limit.',
                'High Quality: Often indistinguishable from original.',
                'No Watermark: Professional output for free.',
                'Batch Capable: Compress multiple files (coming soon).'
            ],
            howTo: [
                'Upload your PDF document.',
                'Choose "Balanced" compression.',
                'Verify the size is under 2MB.',
                'Download and use.'
            ],
            benefits: [
                'Perfect for most government and corporate forms.',
                'Retain excellent image quality.',
                'Quick fix for "File Too Large" errors.'
            ],
            faq: [
                {
                    question: 'Is 2MB a common limit?',
                    answer: 'Yes, 2MB is a very standard limit for job applications, visa forms, and university portals.'
                },
                {
                    question: 'What if my file is still larger than 2MB?',
                    answer: 'Try increasing the compression level to "High". If that fails, consider splitting the document into two parts.'
                }
            ]
        },
        longDescription: `
## Compress PDF to Under 2MB

The **2MB limit** is arguably the most common restriction on the web for document uploads. FileSwift's compression algorithm is tuned to help you hit this target without sacrificing document quality.

### Why 2MB?
Many systems set a 2MB cap to ensure fast server performance and prevent storage overload.

### What compresses well?
*   Reports with photos
*   Scanned documents
*   Presentation slides exported to PDF
*   Brochures and flyers
`
    }
];
