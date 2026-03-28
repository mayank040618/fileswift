'use client';

import Script from 'next/script';

export const AdSenseLoader = () => {
    const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

    if (!ADSENSE_CLIENT) return null;

    return (
        <Script
            id="adsense-init"
            async
            strategy="afterInteractive"
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
        />
    );
};
