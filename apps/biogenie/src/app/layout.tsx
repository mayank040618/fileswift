import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://biogenie-ochre.vercel.app'),
  title: "BioGenie - AI Bio & Caption Generator | Instagram, LinkedIn, Twitter",
  description: "Create viral bios and captions in seconds with AI. Free Instagram bio generator, LinkedIn summary writer, Twitter bio creator, and caption generator with hashtags.",
  keywords: [
    "instagram bio generator",
    "linkedin bio generator",
    "twitter bio generator",
    "caption generator",
    "ai bio writer",
    "instagram bio ideas",
    "bio for instagram",
    "linkedin summary generator",
    "free bio generator",
    "social media bio",
    "tinder bio generator",
    "aesthetic bio generator"
  ],
  authors: [{ name: "BioGenie" }],
  openGraph: {
    title: "BioGenie - AI Bio & Caption Generator",
    description: "Create viral bios and captions in seconds with AI. Free for Instagram, LinkedIn, Twitter & more.",
    url: 'https://biogenie-ochre.vercel.app',
    siteName: 'BioGenie',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "BioGenie - AI Bio & Caption Generator",
    description: "Create viral bios and captions in seconds with AI ✨",
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google AdSense - Replace with your publisher ID */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5583723279396814"
          crossOrigin="anonymous"
        />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "BioGenie",
              "url": "https://biogenie-ochre.vercel.app",
              "applicationCategory": "UtilitiesApplication",
              "operatingSystem": "Any",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "INR"
              },
              "description": "AI-powered bio and caption generator for Instagram, LinkedIn, Twitter and more.",
              "featureList": "Instagram Bio Generator, LinkedIn Bio Generator, Twitter Bio Generator, Caption Generator, Hashtag Generator"
            })
          }}
        />
      </head>
      <body className={`${inter.variable} antialiased`}>
        {/* Animated Background */}
        <div className="gradient-bg" />
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        {children}
      </body>
    </html>
  );
}
