'use client';

import React, { useEffect } from 'react';

export const AdSquare = React.memo(function AdSquare({ dataAdSlot }: { dataAdSlot?: string }) {
    const [isDev, setIsDev] = React.useState(false);

    useEffect(() => {
        if (process.env.NODE_ENV === 'development' || (typeof window !== 'undefined' && window.location.hostname === 'localhost')) {
            setIsDev(true);
            return;
        }
        if (dataAdSlot) {
            try {
                // @ts-ignore
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            } catch (e) { console.error(e); }
        }
    }, [dataAdSlot]);

    if (isDev) {
        return (
            <div className="mx-auto my-4 flex h-[250px] w-[300px] items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-100 text-slate-400 dark:border-slate-700 dark:bg-slate-800">
                AdSquare Placeholder
            </div>
        );
    }

    // Don't render empty boxes when no real slot ID is provided — Auto Ads handles placement
    if (!dataAdSlot) return null;

    return (
        <div className="mx-auto my-6 flex justify-center overflow-hidden min-h-[250px]">
            <ins className="adsbygoogle"
                style={{ display: 'block', width: '300px', height: '250px' }}
                data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "ca-pub-5583723279396814"}
                data-ad-slot={dataAdSlot}
                data-ad-format="rectangle"
                data-full-width-responsive="true"></ins>
        </div>
    );
});
