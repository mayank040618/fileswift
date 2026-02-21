'use client';

import Script from 'next/script';

export function AdsterraSocialBar() {
    // Default to the provided script URL if SID is not present, or use a flexible URL
    const scriptSrc = process.env.NEXT_PUBLIC_ADSTERRA_SCRIPT_URL || "https://inspiredalarmslower.com/2d/57/4d/2d574d148901613740167fe89daba47a.js";

    return (
        <Script
            id="adsterra-social-bar"
            src={scriptSrc}
            strategy="lazyOnload"
            onError={(e) => {
                console.error('Adsterra script failed to load', e);
            }}
        />
    );
}
