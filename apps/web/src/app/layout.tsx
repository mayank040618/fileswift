import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "sonner";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { AdSenseLoader } from "@/components/AdSense/AdSenseLoader";

const inter = Inter({ subsets: ["latin"] });


export const metadata: Metadata = {
    title: "FileSwift - Free Online PDF \u0026 Image Processing Tools",
    description: "Merge, compress, rotate, resize, convert and more. Fast, secure, and free online tools for PDFs and Images.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ClerkProvider>
            <html lang="en" suppressHydrationWarning>
                <body className={inter.className}>
                    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                        <Providers>
                            {children}
                            <Toaster position="bottom-right" />
                        </Providers>
                    </ThemeProvider>
                    <Analytics />
                    <SpeedInsights />
                    <AdSenseLoader />
                </body>
            </html>
        </ClerkProvider>
    );

}
