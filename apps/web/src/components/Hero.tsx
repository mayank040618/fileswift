'use client';

import Link from 'next/link';

export function Hero() {
    return (
        <section className="relative overflow-hidden py-24 sm:py-32 lg:pb-40">
            {/* Background Gradients */}
            {/* Background Gradients */}
            {/* Background Gradients */}
            <div
                className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-[800px] h-[500px] bg-blue-400/20 rounded-full blur-[60px] animate-blob"
                style={{ animationDelay: '0s' }}
            />
            <div
                className="absolute top-20 right-0 -z-10 w-[600px] h-[600px] bg-cyan-400/10 rounded-full blur-[60px] animate-blob"
                style={{ animationDelay: '5s' }}
            />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
                <div className="text-center max-w-3xl mx-auto">
                    <h1
                        className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-6xl mb-6 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300"
                    >
                        Master Your Files with <br className="hidden sm:block" />
                        <span className="text-blue-600 dark:text-blue-500 relative inline-block">
                            Super Speed
                            <svg className="absolute w-full h-2 -bottom-1.5 left-0 text-blue-400/50 dark:text-blue-500/30 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="2" fill="none" />
                            </svg>
                        </span>
                    </h1>

                    <p
                        className="text-lg leading-8 text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto"
                    >
                        Proactive intelligence for your documents. Summarize, extract insights, and converse with your files securely.
                    </p>

                    <div
                        className="flex items-center justify-center gap-4 flex-col sm:flex-row"
                    >
                        <Link
                            href="/pricing"
                            className="rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-500 hover:shadow-blue-500/50 hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto text-center"
                        >
                            View Plans & Pricing
                        </Link>
                        <Link
                            href="/workspace"
                            className="rounded-xl bg-slate-900 dark:bg-black px-8 py-3.5 text-sm font-semibold text-yellow-500 border border-yellow-500/30 shadow-lg shadow-yellow-500/10 hover:bg-slate-800 hover:border-yellow-500/50 hover:shadow-yellow-500/30 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 w-full sm:w-auto"
                        >
                            <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09l2.846.813-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                            </svg>
                            Explore FileSwiftAI Pro
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
