'use client';

import { useState, Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { trackEvent } from '@/utils/analytics';
import { Icons } from './Icons';

interface ComingSoonModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

export function ComingSoonModal({ isOpen, setIsOpen }: ComingSoonModalProps) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [count, setCount] = useState<number | null>(null);

    useEffect(() => {
        if (isOpen) {
            trackEvent('coming_soon_open');
            // Optional: Fetch waitlist count
            const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
            fetch(`${API_BASE}/api/waitlist/count`)
                .then(res => res.json())
                .then(data => setCount(data.count))
                .catch(() => { });
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setStatus('error');
            setMessage('Please enter a valid email address.');
            return;
        }

        setLoading(true);
        setStatus('idle');
        setMessage('');

        try {
            const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
            const res = await fetch(`${API_BASE}/api/waitlist`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, source: 'homepage_coming_soon' })
            });
            const data = await res.json();

            if (!res.ok) {
                if (res.status === 409) {
                    setStatus('success');
                    setMessage("You're already on the list! We'll keep you posted.");
                    trackEvent('coming_soon_waitlist_signup', { duplicate: true });
                } else {
                    throw new Error(data.error || 'Something went wrong');
                }
            } else {
                setStatus('success');
                setMessage("Thanks — you're on the list. We'll email you early access.");
                trackEvent('coming_soon_waitlist_signup', { success: true });
                setEmail('');
            }
        } catch (error: any) {
            setStatus('error');
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={() => setIsOpen(false)}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-8 text-left align-middle shadow-2xl transition-all border border-slate-100 dark:border-slate-800">

                                {/* Header */}
                                <Dialog.Title as="h3" className="text-2xl font-bold leading-6 text-slate-900 dark:text-white flex items-center gap-2">
                                    <span className="text-amber-500"><Icons.Wand2 className="w-6 h-6" /></span>
                                    Coming Soon — Pro Features
                                </Dialog.Title>

                                <div className="mt-2">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        These advanced tools will unlock with our Pro Plan. Join the waitlist to get early access and launch discounts.
                                    </p>
                                </div>

                                {/* Features Grid */}
                                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm text-slate-700 dark:text-slate-300">
                                    <div>
                                        <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">AI Document Tools</h4>
                                        <ul className="space-y-2">
                                            <FeatureItem title="Chat with PDF" desc="Ask questions and extract insights." />
                                            <FeatureItem title="PDF Summarizer" desc="Get concise TL;DRs and summaries." />
                                            <FeatureItem title="MCQ Generator" desc="Create study questions automatically." />
                                            <FeatureItem title="AI Rewrite" desc="Reword sections for clarity or tone." />
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-violet-600 dark:text-violet-400 mb-2">AI Image & PDF Power</h4>
                                        <ul className="space-y-2">
                                            <FeatureItem title="Image Upscaler" desc="Enhance low-res photos up to 4x." />
                                            <FeatureItem title="Remove Background" desc="Instant diverse background removal." />
                                            <FeatureItem title="Translate PDF" desc="Translate docs preserving layout." />
                                            <FeatureItem title="Advanced OCR" desc="Extract text from scans accurately." />
                                        </ul>
                                    </div>
                                </div>

                                {/* Waitlist Form */}
                                <div className="mt-8 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                                        <input
                                            type="email"
                                            required
                                            placeholder="Enter your email address"
                                            className="flex-1 rounded-lg border-slate-300 bg-white dark:bg-slate-950 dark:border-slate-700 dark:text-white px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            disabled={status === 'success'}
                                        />
                                        <button
                                            type="submit"
                                            disabled={loading || status === 'success'}
                                            className="bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px]"
                                        >
                                            {loading ? (
                                                <Icons.Loader2 className="w-5 h-5 animate-spin" />
                                            ) : status === 'success' ? (
                                                <>Joined <Icons.Check className="w-4 h-4 ml-2" /></>
                                            ) : (
                                                'Join Waitlist'
                                            )}
                                        </button>
                                    </form>

                                    {/* Status Messages */}
                                    {status === 'success' && (
                                        <p className="mt-3 text-sm text-green-600 dark:text-green-400 font-medium animate-fade-in">
                                            {message}
                                        </p>
                                    )}
                                    {status === 'error' && (
                                        <p className="mt-3 text-sm text-red-600 dark:text-red-400 font-medium animate-fade-in">
                                            {message}
                                        </p>
                                    )}

                                    <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                                        <span>We’ll never spam. Unsubscribe anytime.</span>
                                        {count !== null && count > 5 && (
                                            <span>Join {count} people waiting</span>
                                        )}
                                    </div>
                                </div>

                                <button
                                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <Icons.X className="w-6 h-6" />
                                </button>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}

function FeatureItem({ title, desc }: { title: string, desc: string }) {
    return (
        <li className="flex items-start gap-2">
            <Icons.Check className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            <span>
                <span className="font-medium text-slate-900 dark:text-white">{title}</span>
                <span className="mx-1 text-slate-300">|</span>
                <span className="opacity-80">{desc}</span>
            </span>
        </li>
    );
}
