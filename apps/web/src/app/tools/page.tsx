import React from 'react';
import { FileText, Image as ImageIcon, Scissors, Settings, Zap, Compass, Activity, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

// NOTE: We could extract this data elsewhere later
const TOOLS = [
    {
        id: 'pdf-compressor',
        name: 'Smart PDF Compressor',
        description: 'Reduce file size while preserving document quality perfectly.',
        icon: <FileText size={24} />,
        category: 'Documents',
        status: 'Available',
        accentClass: 'text-blue-500 bg-blue-500/10'
    },
    {
        id: 'image-converter',
        name: 'Universal Image Converter',
        description: 'Convert between WebP, PNG, JPG, and AVIF formats instantly.',
        icon: <ImageIcon size={24} />,
        category: 'Media',
        status: 'Available',
        accentClass: 'text-emerald-500 bg-emerald-500/10'
    },
    {
        id: 'pdf-merge',
        name: 'Merge & Split PDF',
        description: 'Combine multiple documents or extract specific pages easily.',
        icon: <Scissors size={24} />,
        category: 'Documents',
        status: 'Popular',
        accentClass: 'text-violet-500 bg-violet-500/10'
    },
    {
        id: 'ocr-scanner',
        name: 'AI Text Extractor (OCR)',
        description: 'Pull editable text from scanned documents and images.',
        icon: <Activity size={24} />,
        category: 'AI Tools',
        status: 'beta',
        accentClass: 'text-rose-500 bg-rose-500/10'
    },
    {
        id: 'metadata-scrubber',
        name: 'Metadata Scrubber',
        description: 'Remove hidden data and EXIF info before sharing files.',
        icon: <ShieldCheck size={24} />,
        category: 'Security',
        status: 'Available',
        accentClass: 'text-orange-500 bg-orange-500/10'
    },
    {
        id: 'batch-renamer',
        name: 'Smart Batch Renamer',
        description: 'Rename hundreds of files instantly using AI patterns.',
        icon: <Settings size={24} />,
        category: 'Utility',
        status: 'Available',
        accentClass: 'text-cyan-500 bg-cyan-500/10'
    }
];

export default function ToolsDirectoryPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
    const query = typeof searchParams.q === 'string' ? searchParams.q : '';

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300 relative overflow-hidden before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.03),transparent_60%)] before:pointer-events-none before:z-0">
            {/* Header / Nav - Very minimal, back to workspace */}
            <header className="fixed top-0 left-0 right-0 h-16 flex items-center px-4 sm:px-6 z-50 bg-background/80 backdrop-blur-md border-b border-black/5 dark:border-white/5">
                <div className="flex items-center w-full max-w-6xl mx-auto">
                    <Link href="/workspace" className="flex items-center gap-2 group">
                        <Compass className="text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" size={18} />
                        <span className="font-semibold text-lg tracking-tight text-slate-900 dark:text-white hover:opacity-90 transition-opacity">
                            FileSwift<span className="text-slate-900/70 dark:text-white/70">AI</span>
                        </span>
                    </Link>
                    <div className="ml-auto flex items-center gap-3">
                        <div className="px-2.5 py-1 rounded bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center gap-1.5 shadow-sm">
                            <Zap size={14} className="text-yellow-500 fill-yellow-500 opacity-80" />
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-wider">PRO ACTIVE</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="relative z-10 pt-32 pb-24 px-4 sm:px-6 max-w-6xl mx-auto">
                <div className="mb-12">
                    <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
                        {query ? 'Select a Tool for your Prompt.' : 'Uncapped Tools.'}
                    </h1>

                    {query ? (
                        <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 mb-6 flex items-start gap-3 max-w-2xl">
                            <div className="mt-1 p-1.5 rounded-full bg-blue-500/10 text-blue-500">
                                <FileText size={16} />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Active Prompt</p>
                                <p className="text-sm font-medium text-slate-900 dark:text-white">&quot;{query}&quot;</p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl">
                            As a Pro member, you have unlimited access to our entire suite of intelligent file processing tools. Select a task below to get started.
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {TOOLS.map((tool) => (
                        <Link href={`/workspace`} key={tool.id} className="group relative p-6 rounded-2xl bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-black/5 dark:border-white/5 hover:bg-white dark:hover:bg-white/5 hover:border-black/10 dark:hover:border-white/10 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 rounded-xl ${tool.accentClass}`}>
                                    {tool.icon}
                                </div>
                                {tool.status && (
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border border-black/10 dark:border-white/10 ${tool.status === 'beta' ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10' :
                                        tool.status === 'Popular' ? 'text-rose-600 dark:text-rose-400 bg-rose-500/10' :
                                            'text-slate-500 dark:text-slate-400 bg-black/5 dark:bg-white/5'
                                        }`}>
                                        {tool.status}
                                    </span>
                                )}
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-blue-500 dark:group-hover:text-white transition-colors">
                                {tool.name}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                {tool.description}
                            </p>
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    );
}
