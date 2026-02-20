'use client';

import Script from 'next/script';

export const GoogleAnalytics = () => {
    const GA_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;

    if (!GA_ID) return null;

    return (
        <>
            <Script
                strategy="lazyOnload"
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            />
            <Script
                id="google-analytics"
                strategy="lazyOnload"
                dangerouslySetInnerHTML={{
                    __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `,
                }}
            />
        </>
    );
};
