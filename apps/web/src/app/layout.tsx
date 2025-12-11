import '../../polyfills/domMatrix';
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "FileSwift - AI Powered File Tools",
    description: "Compress PDF, Convert to Word, Remove Backgrounds and more.",
    verification: {
        google: '3ggtYRuYG-jw7bzTSY5fUFvBcv-af5rTa3tIR1dXs0A',
    },
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
            </body>
        </html>
    );
}
