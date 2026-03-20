'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export default function BillingPage() {
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'error' | 'manual'>('loading');

    useEffect(() => {
        const fetchPortalUrl = async () => {
            try {
                const res = await fetch('/api/billing/portal');
                const data = await res.json();

                if (data.url) {
                    window.location.href = data.url;
                    return;
                }

                if (data.error === 'RAZORPAY_MANUAL') {
                    setStatus('manual');
                    return;
                }

                throw new Error("No billing portal found");
            } catch (error) {
                console.error("Billing portal error:", error);
                setStatus('error');
                toast.error("Could not open billing portal automatically.");
                setTimeout(() => router.push('/workspace'), 3000);
            }
        };

        fetchPortalUrl();
    }, [router]);

    if (status === 'manual') {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0A0A0A] p-6">
                <div className="max-w-md w-full bg-white dark:bg-[#111111] p-8 rounded-3xl border border-slate-200 dark:border-white/5 shadow-xl text-center">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <MessageSquare className="w-8 h-8 text-blue-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Manage Your Plan</h1>
                    <p className="text-slate-500 dark:text-slate-400 mb-8">
                        For Indian accounts, subscription adjustments are currently handled via support for maximum security.
                    </p>
                    <div className="space-y-3">
                        <a 
                            href="mailto:support@fileswift.in" 
                            className="w-full flex items-center justify-center py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                        >
                            Contact Support
                        </a>
                        <button 
                            onClick={() => router.push('/workspace')}
                            className="w-full py-3 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-white/5"
                        >
                            Back to Workspace
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0A0A0A]">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                <div className="text-center px-6">
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Connecting to Billing...</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Please wait while we connect you to your secure portal.</p>
                </div>
            </div>
        </div>
    );
}
