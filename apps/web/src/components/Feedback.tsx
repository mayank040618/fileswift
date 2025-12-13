'use client';

import React, { useState } from 'react';
import { Icons } from '@/components/Icons';

export const Feedback = React.memo(function Feedback() {
    const [status, setStatus] = useState<'idle' | 'submitted'>('idle');
    const [helpful, setHelpful] = useState<boolean | null>(null);

    const handleSubmit = (isHelpful: boolean) => {
        setHelpful(isHelpful);
        setStatus('submitted');
        // In a real app, send to analytics or backend
        console.log(`[Feedback] User found tool helpful: ${isHelpful}`);
    };

    if (status === 'submitted') {
        return (
            <div className="mt-12 text-center animate-in fade-in duration-500">
                <p className="text-slate-600 dark:text-slate-400 font-medium">
                    {helpful ? "Glad we could help!" : "Thanks for your feedback. We'll improve."}
                </p>
            </div>
        );
    }

    return (
        <div className="mt-16 border-t border-slate-200 dark:border-slate-800 pt-8 text-center">
            <h3 className="text-sm uppercase tracking-wide text-slate-500 font-bold mb-4">Was this tool helpful?</h3>
            <div className="flex justify-center gap-4">
                <button
                    onClick={() => handleSubmit(true)}
                    className="flex items-center gap-2 px-6 py-2 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-green-50 hover:border-green-200 hover:text-green-700 dark:hover:bg-green-900/20 dark:hover:text-green-400 transition-colors bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                >
                    <Icons.Check className="w-4 h-4" />
                    Yes
                </button>
                <button
                    onClick={() => handleSubmit(false)}
                    className="flex items-center gap-2 px-6 py-2 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-red-50 hover:border-red-200 hover:text-red-700 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                >
                    <Icons.X className="w-4 h-4" />
                    No
                </button>
            </div>
        </div>
    );
});
