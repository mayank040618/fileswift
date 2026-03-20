'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Zap, ArrowRight, Shield, FileText, Image as ImageIcon,
    MessageSquare, ListPlus, FileOutput, Crop, Sparkles,
    LayoutDashboard, Type, UploadCloud, Cpu, Download, ScanSearch, CheckCircle2
} from 'lucide-react';
import { Footer } from "@/components/Footer";

export default function Home() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0A0A0A] flex flex-col selection:bg-blue-500/30">
            {/* Header / Nav */}
            <header className="fixed top-0 left-0 right-0 h-16 flex items-center px-4 sm:px-6 z-50 bg-white/70 dark:bg-[#0A0A0A]/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/[0.06]">
                <div className="flex items-center w-full max-w-7xl mx-auto">
                    <Link href="/" className="flex items-center gap-2 group">
                        <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white transition-opacity group-hover:opacity-80">
                            FileSwift<span className="text-blue-600 dark:text-blue-400">AI</span>
                        </span>
                    </Link>
                    <div className="ml-auto flex items-center gap-6">
                        <Link href="#tools" onClick={(e) => { e.preventDefault(); document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Tools</Link>
                        <Link href="/pricing" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Pricing</Link>
                        <Link href="/workspace" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors hidden sm:block">Sign In</Link>
                        <Link href="/workspace" className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                            Get Started
                        </Link>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center w-full">

                {/* 1. HERO SECTION */}
                <section className="relative w-full pt-40 pb-20 px-4 sm:px-6 flex flex-col items-center text-center overflow-hidden">
                    {/* Background Accents */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full -z-10 opacity-30 dark:opacity-20 pointer-events-none">
                        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full blur-[120px]" />
                        <div className="absolute top-40 right-10 w-80 h-80 bg-indigo-500 rounded-full blur-[150px]" />
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-6"
                    >
                        <Sparkles size={14} className="fill-current" />
                        Next-Gen Document AI
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 leading-[1.1] max-w-4xl"
                    >
                        AI Tools for PDFs, Images & Documents
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed"
                    >
                        Convert, compress, analyze and edit documents instantly using AI — all in one powerful workspace.
                    </motion.p>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.25 }}
                        className="text-[17px] font-medium text-slate-500 dark:text-slate-500 mt-2 mb-10 max-w-2xl leading-relaxed"
                    >
                        Free PDF tools and AI document analysis in one powerful workspace.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto z-10"
                    >
                        <Link href="/workspace" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-lg shadow-xl shadow-slate-900/10 dark:shadow-white/10 transition-all hover:-translate-y-1 hover:shadow-glow flex items-center justify-center gap-2">
                            Start Free <ArrowRight size={20} />
                        </Link>
                        <button onClick={(e) => { e.preventDefault(); document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' }); }} className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white dark:bg-[#111] text-slate-900 dark:text-white font-bold text-lg border border-slate-200 dark:border-white/10 shadow-sm transition-all hover:bg-slate-50 dark:hover:bg-white/5 flex items-center justify-center">
                            Explore Tools
                        </button>
                    </motion.div>

                    {/* Product Preview UI Fake */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.4 }}
                        className="mt-16 w-full max-w-5xl rounded-2xl border border-slate-200/50 dark:border-white/10 bg-white/50 dark:bg-[#111111]/80 backdrop-blur-xl shadow-2xl overflow-hidden"
                    >
                        <div className="h-12 border-b border-slate-200/50 dark:border-white/5 flex items-center px-4 gap-2 bg-slate-100/50 dark:bg-white/5">
                            <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700" />
                            <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700" />
                            <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700" />
                        </div>
                        <div className="aspect-[16/9] w-full bg-slate-50/50 dark:bg-[#0A0A0A]/50 p-8 flex items-center justify-center relative">
                            {/* Grid pattern background */}
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
                            <div className="flex flex-col items-center gap-4 z-10 bg-white/50 dark:bg-black/50 p-8 rounded-2xl backdrop-blur-md border border-slate-200/50 dark:border-white/5 shadow-xl">
                                <LayoutDashboard size={48} className="text-blue-500 opacity-80" />
                                <div className="h-4 w-64 bg-slate-200 dark:bg-white/10 rounded-full animate-pulse" />
                                <div className="h-4 w-48 bg-slate-200 dark:bg-white/10 rounded-full animate-pulse" />
                            </div>
                        </div>
                    </motion.div>
                </section>

                {/* 5. TRUST / SOCIAL PROOF SECTION (moved up slightly logically) */}
                <section className="w-full py-16 px-4 border-b border-slate-200/50 dark:border-white/[0.06]">
                    <div className="max-w-4xl mx-auto text-center flex flex-col items-center justify-center space-y-4">
                        <p className="text-xl sm:text-2xl font-semibold text-slate-700 dark:text-slate-300">
                            Trusted by users worldwide
                        </p>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            Thousands of files processed <span className="opacity-50 mx-1">•</span> Fast and secure cloud processing
                        </p>
                    </div>
                </section>

                {/* 3. HOW IT WORKS SECTION */}
                <section className="w-full py-24 px-4 sm:px-6">
                    <div className="max-w-7xl mx-auto text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-16">How it works in 3 simple steps</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto relative">
                            {/* Connecting Line */}
                            <div className="hidden md:block absolute top-[44px] left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent -z-10" />

                            <div className="flex flex-col items-center">
                                <div className="w-24 h-24 rounded-3xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400 shadow-sm border border-blue-100 dark:border-blue-500/20">
                                    <UploadCloud size={36} />
                                </div>
                                <h3 className="font-semibold text-xl text-slate-900 dark:text-white">Step 1</h3>
                                <p className="text-slate-600 dark:text-slate-400 mt-2 font-medium">Upload your file</p>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-24 h-24 rounded-3xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mb-6 text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-indigo-500/20">
                                    <Cpu size={36} />
                                </div>
                                <h3 className="font-semibold text-xl text-slate-900 dark:text-white">Step 2</h3>
                                <p className="text-slate-600 dark:text-slate-400 mt-2 font-medium">AI processes your document</p>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-24 h-24 rounded-3xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-6 text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-100 dark:border-emerald-500/20">
                                    <Download size={36} />
                                </div>
                                <h3 className="font-semibold text-xl text-slate-900 dark:text-white">Step 3</h3>
                                <p className="text-slate-600 dark:text-slate-400 mt-2 font-medium">Download results instantly</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. POPULAR TOOLS SECTION */}
                <section id="tools" className="w-full py-24 px-4 sm:px-6 bg-slate-100/50 dark:bg-[#111111]/30 border-y border-slate-200/50 dark:border-white/[0.06]">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl hover:text-blue-600 transition-colors">Popular PDF & Image Tools</h2>
                            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">Everything you need to manage your files in one reliable PDF converter and toolkit.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { icon: <FileOutput />, title: "Compress PDF", link: "/tools/compress-pdf", desc: "Reduce file size without losing quality.", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
                                { icon: <ListPlus />, title: "Merge PDF", link: "/tools/merge-pdf", desc: "Combine multiple PDFs into one document.", color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
                                { icon: <FileText />, title: "PDF to Word", link: "/tools/pdf-to-word", desc: "Convert PDFs to editable Word docs.", color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-500/10" },
                                { icon: <ImageIcon />, title: "PDF to Image", link: "/tools/pdf-to-image", desc: "Extract pages as high-quality images.", color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-500/10" },
                                { icon: <Type />, title: "Image to Text", link: "/tools/image-to-text", desc: "Extract text from images automatically.", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10" },
                                { icon: <Crop />, title: "Image Resizer", link: "/tools/image-resizer", desc: "Resize images to exact dimensions.", color: "text-pink-500", bg: "bg-pink-50 dark:bg-pink-500/10" },
                                { icon: <Sparkles />, title: "AI PDF Summary", link: "/tools/pdf-summary", desc: "Generate instant summaries with AI.", color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-500/10" },
                                { icon: <LayoutDashboard />, title: "Extract Tables", link: "/tools/extract-tables", desc: "Pull structured data from documents.", color: "text-cyan-500", bg: "bg-cyan-50 dark:bg-cyan-500/10" },
                            ].map((tool, i) => (
                                <Link href={tool.link} key={i} className="group p-6 rounded-2xl bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-lg hover:shadow-blue-500/5 dark:hover:shadow-blue-500/10 hover:border-blue-500/30 dark:hover:border-blue-500/40 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
                                    <div className={`w-12 h-12 rounded-xl ${tool.bg} flex items-center justify-center mb-4 ${tool.color} transition-transform duration-300 group-hover:scale-110`}>
                                        {tool.icon}
                                    </div>
                                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{tool.title}</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">{tool.desc}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 4. AI WORKSPACE SECTION */}
                <section className="w-full py-24 px-4 sm:px-6">
                    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
                        <div className="lg:w-1/2">
                            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-6">Your AI Workspace for Documents</h2>
                            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                                Go beyond traditional document AI tools. Our intelligent workspace understands context, extracts deep insights, and automates your workflows.
                            </p>
                            <ul className="space-y-6">
                                {[
                                    { icon: <MessageSquare className="text-blue-500" />, text: "Chat interactively with any PDF" },
                                    { icon: <Sparkles className="text-indigo-500" />, text: "Generate structured AI document summaries" },
                                    { icon: <ScanSearch className="text-emerald-500" />, text: "Extract hidden insights from complex reports" },
                                    { icon: <Type className="text-amber-500" />, text: "Automatic OCR and text extraction" },
                                ].map((feature, i) => (
                                    <li key={i} className="flex items-center gap-4 text-slate-700 dark:text-slate-300 font-medium">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center border border-slate-200 dark:border-white/5">
                                            {feature.icon}
                                        </div>
                                        {feature.text}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="lg:w-1/2 w-full">
                            <div className="relative rounded-2xl overflow-hidden border border-slate-200/50 dark:border-white/10 shadow-2xl bg-white dark:bg-[#111]">
                                <div className="absolute top-0 w-full h-10 bg-slate-100/80 dark:bg-white/5 flex items-center px-4 gap-2 border-b border-slate-200 dark:border-white/5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                                </div>
                                <div className="p-8 pt-16 flex flex-col gap-4">
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-blue-500 flex-shrink-0" />
                                        <div className="bg-slate-100 dark:bg-white/5 rounded-2xl p-4 flex-1 rounded-tl-none">
                                            <div className="h-3 w-3/4 bg-slate-300 dark:bg-slate-600/50 rounded-full mb-3" />
                                            <div className="h-3 w-1/2 bg-slate-300 dark:bg-slate-600/50 rounded-full" />
                                        </div>
                                    </div>
                                    <div className="flex gap-4 flex-row-reverse">
                                        <div className="w-8 h-8 rounded-full bg-indigo-500 flex-shrink-0" />
                                        <div className="bg-indigo-50 dark:bg-indigo-500/10 text-right rounded-2xl p-4 flex-1 items-end rounded-tr-none">
                                            <div className="h-3 w-full bg-indigo-200 dark:bg-indigo-500/30 rounded-full mb-3" />
                                            <div className="h-3 w-2/3 bg-indigo-200 dark:bg-indigo-500/30 rounded-full ml-auto" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 6. FEATURES SECTION */}
                <section className="w-full py-24 px-4 sm:px-6 bg-slate-50 dark:bg-[#111111]/30 border-y border-slate-200/50 dark:border-white/[0.06]">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[
                                { icon: <Zap />, title: "Lightning Fast Processing", desc: "Powered by edge computing for zero latency." },
                                { icon: <Shield />, title: "Secure File Handling", desc: "Bank-grade encryption for all documents." },
                                { icon: <Cpu />, title: "AI Document Analysis", desc: "Deep reasoning across text, tables, and images." },
                                { icon: <LayoutDashboard />, title: "Multiple File Formats", desc: "Supports PDF, DOCX, PNG, JPEG, and more." },
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col">
                                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400">
                                        {item.icon}
                                    </div>
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">{item.title}</h3>
                                    <p className="text-slate-600 dark:text-slate-400">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 7. PRICING PREVIEW SECTION */}
                <section className="w-full py-24 px-4 sm:px-6 text-center">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">Simple, transparent pricing</h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400 mb-12">Start for free, upgrade when you need uncapped power.</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto text-left mb-12">
                            <div className="p-8 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111] shadow-sm">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Student Plan</h3>
                                <div className="text-3xl font-extrabold text-slate-900 dark:text-white mb-6">₹49<span className="text-sm font-normal text-slate-500">/mo</span></div>
                                <ul className="space-y-3 mb-8 text-sm text-slate-600 dark:text-slate-400">
                                    <li className="flex gap-2 items-center"><CheckCircle2 size={16} className="text-blue-500" /> 50 AI requests/day</li>
                                    <li className="flex gap-2 items-center"><CheckCircle2 size={16} className="text-blue-500" /> Standard tools</li>
                                </ul>
                            </div>
                            <div className="p-8 rounded-3xl border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-500/5 shadow-inner relative overflow-hidden">
                                <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] uppercase tracking-bold font-bold px-3 py-1 rounded-bl-xl">Recommended</div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Pro Active</h3>
                                <div className="text-3xl font-extrabold text-slate-900 dark:text-white mb-6">₹149<span className="text-sm font-normal text-slate-500">/mo</span></div>
                                <ul className="space-y-3 mb-8 text-sm text-slate-600 dark:text-slate-400">
                                    <li className="flex gap-2 items-center"><CheckCircle2 size={16} className="text-indigo-500" /> 500 AI requests/day</li>
                                    <li className="flex gap-2 items-center"><CheckCircle2 size={16} className="text-indigo-500" /> Advanced AI models</li>
                                </ul>
                            </div>
                        </div>

                        <Link href="/pricing" className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-md hover:scale-105 transition-transform">
                            View Full Pricing
                        </Link>
                    </div>
                </section>

                {/* 8. FINAL CTA SECTION */}
                <section className="w-full py-24 px-4 sm:px-6 bg-gradient-to-b from-transparent to-blue-50 dark:to-blue-900/10 border-t border-slate-200/50 dark:border-white/[0.06]">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">Start using Fileswift today.</h2>
                        <p className="text-xl text-slate-600 dark:text-slate-400 mb-10">Join thousands of users converting and analyzing documents effortlessly.</p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link href="/workspace" className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-xl shadow-blue-500/20 transition-all hover:-translate-y-1 hover:shadow-glow">
                                Start Free
                            </Link>
                            <Link href="/pricing" className="px-8 py-4 rounded-xl bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold text-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                View Pricing
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
