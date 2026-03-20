'use client';

import React, { useState } from 'react';
import { Sparkles, MessageSquare, ArrowRight, Loader2, List, TableProperties, Lightbulb, CheckSquare, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { FilePayload } from '@/lib/fileUtils';

export function AICopilot({ activeFile }: { activeFile?: FilePayload }) {
    const [inputValue, setInputValue] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const suggestedPrompts = [
        { icon: <List size={14} />, label: "Summarize", endpoint: '/api/ai/summarize' },
        { icon: <Lightbulb size={14} />, label: "Extract Key Points", endpoint: '/api/ai/summarize' },
        { icon: <TableProperties size={14} />, label: "Extract Tables", endpoint: '/api/ai/extract-tables' },
        { icon: <MessageSquare size={14} />, label: "Explain Section", endpoint: '/api/ai/chat' },
    ];

    const handlePromptClick = async (label: string, endpoint: string = '/api/ai/chat') => {
        setIsAnalyzing(true);
        setError(null);
        setInputValue(label);

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: label,
                    prompt: label, // for summarize
                    mode: 'standard',
                    files: activeFile ? [activeFile] : []
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'AI analysis failed');
            }

            setResult(data);
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setIsAnalyzing(false);
            setInputValue('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;
        await handlePromptClick(inputValue);
    };

    return (
        <div className="w-[400px] flex-shrink-0 flex flex-col h-full bg-slate-50 dark:bg-[#0A0A0A] relative z-20 shadow-[-10px_0_20px_-10px_rgba(0,0,0,0.05)]">
            {/* Header */}
            <div className="h-14 flex items-center px-6 border-b border-slate-200 dark:border-white/10 bg-white/50 dark:bg-[#111]/50 backdrop-blur-md sticky top-0 z-10 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-500" />
                    <h2 className="font-semibold text-slate-900 dark:text-white">AI Copilot</h2>
                </div>
            </div>

            {/* Chat/Output Area */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                <AnimatePresence mode="wait">
                    {!result && !isAnalyzing ? (
                        <motion.div 
                            key="idle"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-col items-center justify-center h-full text-center space-y-4 px-4 pb-20 mt-20"
                        >
                            <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mb-2">
                                <Sparkles className="w-8 h-8 text-indigo-500" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">How can I help you?</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Ask a question, extract data, or summarize this document.
                            </p>
                        </motion.div>
                    ) : isAnalyzing ? (
                        <motion.div 
                            key="analyzing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center p-8 space-y-4 mt-12"
                        >
                            <div className="w-12 h-12 rounded-full border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center bg-white dark:bg-[#111] shadow-xl shadow-indigo-500/10 relative">
                                <Loader2 className="w-6 h-6 text-indigo-500 animate-spin absolute" />
                            </div>
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 animate-pulse">
                                Analyzing document...
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="result"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4 pb-4"
                        >
                            {error && (
                                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm flex gap-3">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {result && (
                                <div className="rounded-xl bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 p-5 shadow-sm space-y-3">
                                    <div className="flex items-center justify-between text-indigo-500 font-semibold text-xs uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <Sparkles size={14} />
                                            <span>AI Response</span>
                                        </div>
                                        {result.metadata && (
                                            <span className="text-slate-400 font-normal">
                                                {result.metadata.latencyMs}ms
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed prose prose-slate dark:prose-invert max-w-none">
                                        {/* Use a simple markdown parser or just newline to br for now */}
                                        {(result.summary || result.response || result.output || '').split('\n').map((line: string, i: number) => (
                                            <p key={i} className={line.trim() === '' ? 'h-2' : 'mb-2 last:mb-0'}>
                                                {line}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white/50 dark:bg-[#111]/50 backdrop-blur-md border-t border-slate-200 dark:border-white/10 relative z-20 flex-shrink-0">
                <div className="flex gap-2 w-full overflow-x-auto pb-3 scrollbar-hide no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                    {suggestedPrompts.map((prompt, i) => (
                        <button 
                            key={i}
                            disabled={isAnalyzing}
                            onClick={() => handlePromptClick(prompt.label, prompt.endpoint)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap hover:border-indigo-500/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {prompt.icon}
                            {prompt.label}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="relative mt-1">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask anything about your document..."
                        disabled={isAnalyzing}
                        className="w-full bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all disabled:opacity-50"
                    />
                    <button 
                        type="submit"
                        title="Send Message"
                        aria-label="Send Message"
                        disabled={!inputValue.trim() || isAnalyzing}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ring-offset-1 dark:ring-offset-black"
                    >
                        <ArrowRight size={16} />
                    </button>
                </form>
                <div className="text-center mt-2">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        AI can make mistakes. Check important info.
                    </span>
                </div>
            </div>
        </div>
    );
}
