'use client';

import React, { useEffect, useState } from 'react';
import { useAdSense, getAdClient } from './AdSenseLoader';
import { X } from 'lucide-react';

export const AdFooter = ({ slot }: { slot?: string }) => {
    const { pushAd, isConfigured } = useAdSense();
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        if (isConfigured && visible) {
            pushAd();
        }
    }, [isConfigured, visible]);

    if (!visible) return null;

    if (!isConfigured) {
        if (process.env.NODE_ENV === 'development') {
            return (
                <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 p-4 z-50 text-center text-xs text-slate-400">
                    Sticky Ad Placeholder
                </div>
            );
        }
        return null;
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 shadow-lg z-50">
            <button
                onClick={() => setVisible(false)}
                className="absolute -top-6 right-2 bg-slate-200 dark:bg-slate-700 rounded-t-lg p-1 text-slate-500 hover:text-red-500"
            >
                <X size={16} />
            </button>
            <div className="flex justify-center p-2">
                <ins
                    className="adsbygoogle"
                    style={{ display: 'inline-block', width: '728px', height: '90px' }}
                    data-ad-client={getAdClient()}
                    data-ad-slot={slot || "9876543210"}
                />
            </div>
        </div>
    );
};
