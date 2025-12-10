'use client';

import React, { useState, useEffect } from 'react';
import { X, Cookie } from 'lucide-react';

export const ConsentBanner = () => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        // Check local storage / cookie
        const consent = getConsent();
        if (consent === 'pending') {
            setShow(true);
        }
    }, []);

    const handleConsent = (type: 'granted' | 'denied') => {
        setCookie('ads_consent', type, 365);
        setShow(false);
        if (type === 'granted') {
            window.location.reload(); // Reload to activate ads immediately
        }
    };

    if (!show) return null;

    return (
        <div className="fixed bottom-0 sm:bottom-4 left-0 sm:left-4 right-0 sm:right-auto max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-none sm:rounded-xl p-6 z-[60]">
            <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/40 text-blue-600 rounded-lg">
                    <Cookie size={24} />
                </div>
                <button onClick={() => setShow(false)} className="text-slate-400 hover:text-slate-600">
                    <X size={20} />
                </button>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                We value your privacy
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                We use cookies and third-party ads (Google AdSense) to provide free tools.
                Do you consent to personalized ads?
            </p>

            <div className="space-y-3">
                <button
                    onClick={() => handleConsent('granted')}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                    Accept Personalized Ads
                </button>
                <button
                    onClick={() => handleConsent('denied')}
                    className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors"
                >
                    Use Non-Personalized Only
                </button>
                <div className="text-center pt-2">
                    <a href="/privacy-policy" className="text-xs text-slate-400 hover:underline">
                        Read Privacy Policy
                    </a>
                </div>
            </div>
        </div>
    );
};

function getConsent() {
    if (typeof document === 'undefined') return 'pending';
    const match = document.cookie.match(new RegExp('(^| )ads_consent=([^;]+)'));
    return match ? match[2] : 'pending';
}

function setCookie(name: string, value: string, days: number) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
}
