'use client';

import React, { useEffect } from 'react';
import { useAdSense, getAdClient } from './AdSenseLoader';

export const AdSquare = ({ slot }: { slot?: string }) => {
    const { pushAd, isConfigured } = useAdSense();

    useEffect(() => {
        if (isConfigured) {
            pushAd();
        }
    }, [isConfigured]);

    if (!isConfigured) {
        if (process.env.NODE_ENV === 'development') {
            return (
                <div className="w-[300px] h-[250px] bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-sm">
                    AdSquare Placeholder
                </div>
            );
        }
        return null;
    }

    return (
        <div className="flex justify-center my-4">
            <ins
                className="adsbygoogle"
                style={{ display: 'inline-block', width: '300px', height: '250px' }}
                data-ad-client={getAdClient()}
                data-ad-slot={slot || "5555555555"}
            />
        </div>
    );
};
