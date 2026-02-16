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

                    {/* <div
                        className="mb-6 inline-flex items-center rounded-full bg-blue-50 dark:bg-slate-800 px-3 py-1 text-sm font-medium text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-slate-700 hover:bg-blue-100 transition-colors"
                    >
                        <span>✨ New AI Features Available</span>
                    </div> */}

                    <h1
                        className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-6xl mb-6 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300"
                    >
                        Master Your Files with <br className="hidden sm:block" />
                        <span className="text-blue-600 dark:text-blue-500 relative inline-block">
                            Super Speed
                            <svg className="absolute w-full h-3 -bottom-1 left-0 text-blue-200 dark:text-blue-900 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                            </svg>
                        </span>
                    </h1>

                    <p
                        className="text-lg leading-8 text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto"
                    >
                        Compress, merge, and convert PDFs securely in your browser.
                        Free online tools for all your document needs.
                    </p>

                    <div
                        className="flex items-center justify-center gap-x-6"
                    >
                        <Link
                            href="#tools"
                            className="rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-500 hover:shadow-blue-500/50 hover:-translate-y-1 transition-all duration-300"
                        >
                            Get Started for Free
                        </Link>

                    </div>

                    <div
                        className="mt-10 flex items-center justify-center gap-6 text-sm text-slate-500 dark:text-slate-400"
                    >
                        <div className="flex items-center gap-2">
                            <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Free forever
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            No signup
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Mobile ready
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
