import '../../polyfills/domMatrix';
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";


const inter = Inter({ subsets: ["latin"] });


export const metadata: Metadata = {
    title: "FileSwift - AI Powered File Tools",
    description: "Compress PDF, Convert to Word, Remove Backgrounds and more. Free online AI file tools.",
    keywords: ["pdf compressor", "pdf to word", "remove background", "ai file tools", "image to pdf"],
    authors: [{ name: "FileSwift" }],
    openGraph: {
        title: "FileSwift - AI Powered File Tools",
        description: "Compress PDF, Convert to Word, Remove Backgrounds and more.",
        url: 'https://fileswift-web.vercel.app',
        siteName: 'FileSwift',
        images: [
            {
                url: 'https://fileswift-web.vercel.app/og-image.png', // We will need to create this later or use a default
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
        images: ['https://fileswift-web.vercel.app/og-image.png'],
    },
    verification: {
        google: '3ggtYRuYG-jw7bzTSY5fUFvBcv-af5rTa3tIR1dXs0A',
    },
    appleWebApp: {
        capable: true,
        title: "FileSwift",
        statusBarStyle: "black-translucent",
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
import { Providers } from './providers';
import { AdFooter } from '@/components/AdSense/AdFooter';
import { ConsentBanner } from '@/components/ConsentBanner';
import { SplashScreen } from '@/components/SplashScreen';

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
                    <script
                        async
                        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
                        crossOrigin="anonymous"
                    ></script>
                )}
            </head>
            <body className={inter.className}>
                <Providers>
                    {children}
                    {/* Sticky Ad Footer */}
                    <div className="hidden md:block">
                        <AdFooter />
                    </div>
                </Providers>
                <ConsentBanner />
                <Analytics />
                <SplashScreen />

                {/* Google Analytics 4 */}
                <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID}`}></script>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', '${process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID}');
                        `
                    }}
                />

                {/* JSON-LD Structured Data for SEO */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "WebApplication",
                            "name": "FileSwift",
                            "url": "https://fileswift-web.vercel.app",
                            "applicationCategory": "ProductivityApplication",
                            "operatingSystem": "Any",
                            "offers": {
                                "@type": "Offer",
                                "price": "0",
                                "priceCurrency": "USD"
                            },
                            "featureList": "PDF Compression, Image Resizing, Format Conversion",
                            "screenshot": "https://fileswift-web.vercel.app/og-image.png"
                        })
                    }}
                />
                <div dangerouslySetInnerHTML={{
                    __html: `
                        <script type="text/javascript" src="https://pl28245074.effectivegatecpm.com/10/5e/5a/105e5ace5fcbfe09f20fcbf0e6ceee6d.js"></script>
                    `
                }} />
            </body>
        </html>
    );
}
