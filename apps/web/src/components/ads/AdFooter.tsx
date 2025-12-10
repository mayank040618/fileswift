'use client';

import React, { useEffect, useState } from 'react';

export function AdFooter() {
    const [isVisible, setIsVisible] = useState(true);

    const [isDev, setIsDev] = useState(false);

    useEffect(() => {
        if (process.env.NODE_ENV === 'development' || (typeof window !== 'undefined' && window.location.hostname === 'localhost')) {
            setIsDev(true);
            return;
        }

        try {
            // @ts-ignore
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) { }
    }, []);

    if (!isVisible) return null;

    if (isDev) {
        return (
            <div className="fixed bottom-0 left-0 right-0 z-50 flex h-[100px] items-center justify-center bg-slate-100 border-t border-slate-300">
                <span className="text-slate-500">AdFooter Placeholder (Sticky)</span>
                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute top-2 right-4 text-xs bg-slate-200 px-2 py-1 rounded hover:bg-slate-300"
                >
                    Close
                </button>
            </div>
        );
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center bg-white/95 backdrop-blur border-t border-slate-200 dark:bg-slate-900/95 dark:border-slate-800 py-2">
            <div className="relative w-full max-w-[728px] text-center">
                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute -top-6 right-0 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 pr-2">
                    Close [X]
                </button>
                <ins className="adsbygoogle"
                    style={{ display: 'inline-block', width: '728px', height: '90px' }}
                    data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "ca-pub-0000000000000000"}
                    data-ad-slot="0000000000"></ins>
            </div>
        </div>
    );
}
