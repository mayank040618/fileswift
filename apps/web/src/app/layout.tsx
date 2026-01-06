import '../../polyfills/domMatrix';
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";


const inter = Inter({ subsets: ["latin"] });


export const metadata: Metadata = {
    metadataBase: new URL('https://www.fileswift.in'),
    title: "FileSwift - AI Powered File Tools",
    description: "Compress PDF, Convert to Word, Remove Backgrounds and more. Free online AI file tools.",
    keywords: ["pdf compressor", "pdf to word", "remove background", "ai file tools", "image to pdf"],
    authors: [{ name: "FileSwift" }],
    openGraph: {
        title: "FileSwift - AI Powered File Tools",
        description: "Compress PDF, Convert to Word, Remove Backgrounds and more.",
        url: 'https://www.fileswift.in',
        siteName: 'FileSwift',
        images: [
            {
                url: 'https://www.fileswift.in/og-image.png', // We will need to create this later or use a default
                width: 1200,
                height: 630,
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: "FileSwift - AI Powered File Tools",
        description: "Compress, convert, and edit files with AI precision.",
        images: ['https://www.fileswift.in/og-image.png'],
    },
    verification: {
        google: '9I9NOWPy481Ul2kqc1rXvdRF2KjfbMMw4TlfxW6p5L0',
    },
    appleWebApp: {
        capable: true,
        title: "FileSwift",
        statusBarStyle: "black-translucent",
    },
    alternates: {
        canonical: './',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    icons: {
        icon: '/icons/icon-192x192.png',
        shortcut: '/icons/icon-192x192.png',
        apple: '/icons/icon-512x512.png',
    },
};

export const viewport: Viewport = {
    themeColor: "#0f172a",
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Providers } from './providers';
import { AdFooter } from '@/components/AdSense/AdFooter';
import { Footer } from '@/components/Footer';
import { ConsentBanner } from '@/components/ConsentBanner';
import { SplashScreen } from '@/components/SplashScreen';

import { GoogleAnalytics } from '@/components/Analytics';

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>): JSX.Element {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                {/* Google AdSense Verification Script */}
                <script
                    async
                    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5583723279396814"
                    crossOrigin="anonymous"
                ></script>
            </head>
            <body className={inter.className}>
                <Providers>
                    {children}
                    {/* Sticky Ad Footer */}
                    <div className="hidden md:block">
                        <AdFooter />
                    </div>
                    <Footer />
                </Providers>
                <ConsentBanner />
                <Analytics />
                <SpeedInsights />
                <SplashScreen />
                <GoogleAnalytics />

                {/* JSON-LD Structured Data for SEO */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "WebApplication",
                            "name": "FileSwift",
                            "url": "https://www.fileswift.in",
                            "applicationCategory": "ProductivityApplication",
                            "operatingSystem": "Any",
                            "offers": {
                                "@type": "Offer",
                                "price": "0",
                                "priceCurrency": "USD"
                            },
                            "featureList": "PDF Compression, Image Resizing, Format Conversion",
                            "screenshot": "https://www.fileswift.in/og-image.png"
                        })
                    }}
                />

            </body>
        </html>
    );
}
