import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Free Online File Tools – PDF Compressor, Image Converter & More | FileSwift',
    description: 'Free online tools to compress PDFs, convert images to PDF, resize photos, merge documents, and more. No signup required. Fast, secure, and works on any device.',
    keywords: [
        'free pdf tools',
        'online file converter',
        'compress pdf online',
        'image to pdf converter',
        'pdf compressor free',
        'resize image online',
        'merge pdf files',
        'convert jpg to pdf',
        'pdf tools online free',
        'image compressor'
    ],
    alternates: {
        canonical: 'https://fileswift.in/tools',
    },
    openGraph: {
        title: 'Free Online File Tools – PDF Compressor, Image Converter & More | FileSwift',
        description: 'Free online tools to compress PDFs, convert images to PDF, resize photos, merge documents, and more. No signup required.',
        type: 'website',
        url: 'https://fileswift.in/tools',
        siteName: 'FileSwift',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Free Online File Tools | FileSwift',
        description: 'Compress PDFs, convert images, resize photos and more. 100% free, no signup required.',
    }
};

export default function ToolsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
