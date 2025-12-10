'use client';

import { useEffect } from 'react';

declare global {
    interface Window {
        adsbygoogle: any[];
    }
}

const ADSENSE_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

export const AdSenseLoader = {
    init: () => {
        if (typeof window === 'undefined') return;
        if (!ADSENSE_ID) return;
        if (window.document.getElementById('adsense-script')) return;

        // Check for consent (if required)
        const consent = getConsent();
        if (process.env.NEXT_PUBLIC_ADSENSE_LOAD_CONSENT_REQUIRED === 'true' && consent === 'denied') {
            console.log('AdSense blocked by consent');
            return;
        }

        // Sanitize ID to ensure it works whether user includes 'ca-pub-' or not
        const cleanId = ADSENSE_ID.replace(/^ca-pub-/, '');

        const script = document.createElement('script');
        script.id = 'adsense-script';
        script.async = true;
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-${cleanId}`;
        script.crossOrigin = 'anonymous';
        document.head.appendChild(script);
    }
};

// Helper to get the full client ID (always starts with ca-pub-)
export const getAdClient = () => {
    if (!ADSENSE_ID) return '';
    const cleanId = ADSENSE_ID.replace(/^ca-pub-/, '');
    return `ca-pub-${cleanId}`;
};

export const useAdSense = () => {
    useEffect(() => {
        AdSenseLoader.init();
    }, []);

    const pushAd = () => {
        try {
            if (ADSENSE_ID && typeof window !== 'undefined') {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            }
        } catch (err) {
            console.error('AdSense error:', err);
        }
    };

    return { pushAd, isConfigured: !!ADSENSE_ID };
};

// Simple cookie helper
function getConsent(): 'granted' | 'denied' | 'pending' {
    if (typeof document === 'undefined') return 'pending';
    const match = document.cookie.match(new RegExp('(^| )ads_consent=([^;]+)'));
    if (match) return match[2] as any;
    return 'pending';
}
