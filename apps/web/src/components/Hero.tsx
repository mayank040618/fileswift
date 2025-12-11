'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export function Hero() {
    return (
        <section className="relative overflow-hidden py-24 sm:py-32 lg:pb-40">
            {/* Background Gradients */}
            {/* Background Gradients */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 90, 0],
                    opacity: [0.3, 0.5, 0.3]
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    repeatType: "reverse"
                }}
                className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-[1000px] h-[500px] bg-blue-400/20 rounded-full blur-[100px]"
            />
            <motion.div
                animate={{
                    scale: [1, 1.5, 1],
                    x: [0, 100, 0],
                    opacity: [0.2, 0.4, 0.2]
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    repeatType: "reverse"
                }}
                className="absolute top-20 right-0 -z-10 w-[800px] h-[600px] bg-cyan-400/10 rounded-full blur-[80px]"
            />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
                <div className="text-center max-w-3xl mx-auto">

                    {/* <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-6 inline-flex items-center rounded-full bg-blue-50 dark:bg-slate-800 px-3 py-1 text-sm font-medium text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-slate-700 hover:bg-blue-100 transition-colors"
                    >
                        <span>✨ New AI Features Available</span>
                    </motion.div> */}

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-6xl mb-6 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300"
                    >
                        Master Your Files with <br className="hidden sm:block" />
                        <span className="text-blue-600 dark:text-blue-500 relative inline-block">
                            Super Speed
                            <svg className="absolute w-full h-3 -bottom-1 left-0 text-blue-200 dark:text-blue-900 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                            </svg>
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-lg leading-8 text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto"
                    >
                        Compress, merge, and convert PDFs securely in your browser.
                        Free online tools for all your document needs.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex items-center justify-center gap-x-6"
                    >
                        <Link
                            href="#tools"
                            className="rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-500 hover:shadow-blue-500/50 hover:-translate-y-1 transition-all duration-300"
                        >
                            Get Started for Free
                        </Link>

                    </motion.div>
                </div>
            </div>
        </section>
    );
}
