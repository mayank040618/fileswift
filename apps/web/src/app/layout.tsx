import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "FileSwift - AI Powered File Tools",
    description: "Compress PDF, Convert to Word, Remove Backgrounds and more.",
};

import { Providers } from './providers';
import { AdFooter } from '@/components/ads/AdFooter';
import { GoogleAdsense } from '@/components/ads/GoogleAdsense';

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <Providers>
                    {children}
                    {/* Sticky Ad Footer */}
                    <div className="hidden md:block">
                        <AdFooter />
                    </div>
                </Providers>
                <GoogleAdsense pId={process.env.NEXT_PUBLIC_ADSENSE_CLIENT || ''} />
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
