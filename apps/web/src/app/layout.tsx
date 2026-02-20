import '../polyfills/domMatrix';
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google"; // Disabled: network timeout blocks dev server
import "./globals.css";

// Using system font stack instead of Google Fonts for dev
// Revert to `next/font/google` Inter before deploying to production
const inter = Inter({ subsets: ["latin"] });


export const metadata: Metadata = {
    metadataBase: new URL('https://www.fileswift.in'),
    title: "FileSwift - Free Online PDF Compressor, Converter & Editor",
    description: "FileSwift is a free, privacy-first online platform to compress PDFs, resize images, and convert files securely. No signup required, fast processing.",
    keywords: ["pdf compressor", "pdf to word", "remove background", "ai file tools", "image to pdf", "private pdf tools", "client-side file processing", "no upload file tools", "secure online converter"],
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
        languages: {
            'en-US': 'https://www.fileswift.in',
            'x-default': 'https://www.fileswift.in',
        },
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
import { Footer } from '@/components/Footer';
import { ConsentBanner } from '@/components/ConsentBanner';
import { SplashScreen } from '@/components/SplashScreen';
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister';

import { GoogleAnalytics } from '@/components/Analytics';
import JsonLd from '@/components/JsonLd';

import Script from 'next/script';

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>): JSX.Element {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <Script
                    async
                    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5583723279396814"
                    crossOrigin="anonymous"
                    strategy="lazyOnload"
                />
            </head>
            <body className={inter.className}>
                <Providers>
                    {children}

                    <Footer />
                </Providers>
                <ConsentBanner />
                <Analytics />
                <SpeedInsights />
                <SplashScreen />
                <GoogleAnalytics />
                <ServiceWorkerRegister />

                {/* JSON-LD Structured Data for SEO */}
                <JsonLd />



            </body>
        </html>
    );
}
