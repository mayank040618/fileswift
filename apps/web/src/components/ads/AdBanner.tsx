'use client';
// AdSense Auto Ads handles placement — this component only renders if a real slot ID is provided.

import React, { useEffect } from 'react';

export const AdBanner = React.memo(function AdBanner({ dataAdSlot }: { dataAdSlot?: string }) {

    const [isDev, setIsDev] = React.useState(false);

    useEffect(() => {
        if (process.env.NODE_ENV === 'development' || (typeof window !== 'undefined' && window.location.hostname === 'localhost')) {
            setIsDev(true);
            return;
        }
        // Only push ad if we have a real slot ID
        if (dataAdSlot) {
            try {
                // @ts-ignore
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            } catch (e) {
                console.error("AdSense Error:", e);
            }
        }
    }, [dataAdSlot]);

    if (isDev) {
        return (
            <div className="mx-auto my-6 flex h-[90px] w-full max-w-[728px] items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-100 text-slate-400 dark:border-slate-700 dark:bg-slate-800">
                AdBanner Placeholder
            </div>
        );
    }

    // Don't render empty boxes when no real slot ID is provided — Auto Ads handles placement
    if (!dataAdSlot) return null;

    return (
        <div className="mx-auto my-6 flex justify-center overflow-hidden min-h-[90px]">
            <ins className="adsbygoogle"
                style={{ display: 'block', width: '100%', maxWidth: '728px', height: '90px' }}
                data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "ca-pub-5583723279396814"}
                data-ad-slot={dataAdSlot}
                data-ad-format="auto"
                data-full-width-responsive="true"></ins>
        </div>
    );
});
