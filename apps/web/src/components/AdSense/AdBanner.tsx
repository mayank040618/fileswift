'use client';

import React, { useEffect } from 'react';
import { useAdSense, getAdClient } from './AdSenseLoader';

export const AdBanner = ({ slot }: { slot?: string }) => {
    const { pushAd, isConfigured } = useAdSense();

    useEffect(() => {
        if (isConfigured) {
            pushAd();
        }
    }, [isConfigured]);

    if (!isConfigured) {
        // Safe Fallback / Placeholder for Admin
        if (process.env.NODE_ENV === 'development') {
            return (
                <div className="w-full h-24 bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-sm">
                    AdSense Banner Placeholder (No ID Set)
                </div>
            );
        }
        return null;
    }

    return (
        <div className="w-full flex justify-center my-4 overflow-hidden">
            <ins
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client={getAdClient()}
                data-ad-slot={slot || "1234567890"} // Replace with real default if available
                data-ad-format="auto"
                data-full-width-responsive="true"
            />
        </div>
    );
};
