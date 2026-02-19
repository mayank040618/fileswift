'use client';

import { motion } from 'framer-motion';
import { Icons } from './Icons';

const features = [
    {
        title: '100% Secure & Private',
        desc: 'All file processing happens securely. Your files are automatically deleted from our servers after 1 hour. We never read or store your sensitive data.',
        icon: Icons.Lock
    },
    {
        title: 'Lightning Fast AI',
        desc: 'Powered by advanced compression algorithms and high-speed servers, tasks like PDF compression and format conversion finish in seconds.',
        icon: Icons.Zap
    },
    {
        title: 'Completely Free',
        desc: 'No hidden fees, watermarks, or sign-up requirements. Access all our premium PDF and Image tools for free, anytime, anywhere.',
        icon: Icons.CreditCard
    }
];

const faqs = [
    {
        q: 'Is FileSwift really free to use?',
        a: 'Yes! All our tools including PDF Compressor, Image Resizer, and Converters are completely free to use without any limits.'
    },
    {
        q: 'Are my files safe?',
        a: 'Absolutely. We use strict privacy protocols. Files are transferred via secure SSL connection and are permanently deleted from our servers 1 hour after processing.'
    },
    {
        q: 'Do I need to install any software?',
        a: 'No. FileSwift is a cloud-based web application. You can use all our tools directly from your browser on any device (Windows, Mac, iPhone, Android).'
    },
    {
        q: 'Can I process multiple files at once?',
        a: 'Yes, most of our tools notably the Bulk Image Resizer and PDF Compressor support batch processing, allowing you to work with multiple files simultaneously.'
    }
];

const keywords = [
    "Compress PDF", "PDF to Word", "Image Resizer", "Merge PDF", "Rotate PDF",
    "JPG to PDF", "PDF to JPG", "Word to PDF", "Online PDF Tools", "Free PDF Converter",
    "Reduce PDF Size", "Compress Images Online", "Bulk Image Resizer"
];

export function SeoSection() {
    return (
        <section className="py-24 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                {/* Why Choose Us */}
                <div className="mb-20">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl mb-6">
                            Why Choose FileSwift?
                        </h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400">
                            We provide the fastest, most secure, and completely free online file tools. No installation required.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {features.map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800"
                            >
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-6">
                                    <feature.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                    {feature.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl mb-12 text-center">
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-6">
                        {faqs.map((faq, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
                            >
                                <div className="p-6">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                                        {faq.q}
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-400">
                                        {faq.a}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Keyword Block (SEO Only - Visual but subtle) */}
                <div className="mt-24 pt-10 border-t border-slate-200 dark:border-slate-800 text-center">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Popular Tools</h3>
                    <div className="flex flex-wrap justify-center gap-3">
                        {keywords.map((k, i) => (
                            <span key={i} className="text-xs text-slate-500 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                                {k}
                            </span>
                        ))}
                    </div>

                    <p className="mt-8 text-sm text-slate-400 max-w-2xl mx-auto">
                        FileSwift is your all-in-one PDF and Image solution.
                        Whether you need to <strong>Compress PDF</strong>, <strong>Convert PDF to Word</strong>, or <strong>Resize Images</strong>,
                        our tools are free, fast, and secure. We respect your privacy—all files are deleted from our servers automatically after 1 hour.
                    </p>
                </div>

            </div>
        </section>
    );
}
