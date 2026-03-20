'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MinimalInputBar } from './MinimalInputBar';
import { useWorkspaceStore, type ChatMessage } from '@/store/useWorkspaceStore';
import { Bot, User, AlertCircle, FileText } from 'lucide-react';

const AI_GREETINGS = [
    "Where should we start?",
    "What would you like to explore today?",
    "How can I help accelerate your workflow?",
    "Ready to process some documents?",
    "Let's dive into your files.",
    "What insights can I find for you?",
    "How can I assist you right now?",
    "What's on your agenda today?",
    "Let's uncover some knowledge.",
    "Which document shall we analyze?",
    "Ready to extract some insights?",
    "Let's make quick work of your files.",
    "What challenge can I help solve today?",
    "Drop a file, and let's get started.",
    "How can we streamline your work?",
    "Let's parse, analyze, and learn.",
    "What data are we digging into?",
    "I'm ready when you are.",
    "Let's discover what's hidden in your documents.",
    "How can I boost your productivity today?",
    "Ready to transform your workflow?",
    "Let's summarize some complex ideas.",
    "What are we building today?",
    "Your AI assistant is standing by.",
    "Let's tackle your current project together.",
    "What information can I surface for you?",
    "Ready to conquer your inbox of documents?",
    "Let's find the answers you need.",
    "What mysteries shall we solve today?",
    "How can I simplify your tasks today?",
    "Let's turn your files into actionable data.",
    "What knowledge are you seeking?",
    "Ready to streamline your reading?",
    "Let's extract the key takeaways.",
    "What patterns can I find for you?",
    "Ready for your next big insight?",
    "Let's organize your intelligence.",
    "What document needs our attention?",
    "Ready to chat with your data?",
    "Let's unlock the value in your files.",
    "What insights are pending discovery?",
    "Ready to supercharge your analysis?",
    "Let's distill the important facts.",
    "What questions do you need answered?",
    "Ready to navigate your data?",
    "Let's map out the information.",
    "What text shall we conquer today?",
    "Ready to decode your documents?",
    "Let's turn raw data into wisdom."
];

interface WorkspaceCoreProps {
    firstName?: string;
}

export function WorkspaceCore({ firstName = 'there' }: WorkspaceCoreProps) {
    const { messages, processing, error } = useWorkspaceStore();
    const scrollRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const hasMessages = messages.length > 0;
    const [greeting, setGreeting] = useState("Where should we start?");

    // Deterministic rotating greeting every 2 days
    useEffect(() => {
        const cycleLength = 2; // Days per greeting
        const dayEpoch = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
        const cycleIndex = Math.floor(dayEpoch / cycleLength);
        const greetingIndex = cycleIndex % AI_GREETINGS.length;
        
        setGreeting(AI_GREETINGS[greetingIndex]);
    }, []);

    // Auto-scroll to bottom on new message or processing change
    useEffect(() => {
        const timer = setTimeout(() => {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 50);
        return () => clearTimeout(timer);
    }, [messages.length, processing]);

    return (
        <div className="flex-1 flex flex-col relative w-full h-full bg-white dark:bg-black overflow-hidden transition-colors duration-500">
            {/* ── Atmospheric Background ── */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 dark:bg-blue-600/5 rounded-full blur-[120px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-400/5 dark:bg-indigo-500/5 rounded-full blur-[80px]" />
                <div className="opacity-[0.03] dark:opacity-[0.03] select-none scale-[1.5] sm:scale-[2.5] flex items-center gap-4">
                    <FileText className="w-12 h-12 text-slate-900 dark:text-white" strokeWidth={1.5} />
                    <span className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white italic">
                        FileSwift<span className="text-blue-600 dark:text-blue-400">AI</span>
                    </span>
                </div>
            </div>


            {/* ── Idle State: Greeting ── */}
            {!hasMessages && (
                <div className="flex-1 flex flex-col w-full max-w-3xl mx-auto px-4 sm:px-6">
                    <motion.div
                        className="flex flex-col mt-12 sm:mt-0 sm:flex-1 sm:justify-center relative z-10"
                        initial="hidden"
                        animate="visible"
                        variants={{
                            hidden: { opacity: 0 },
                            visible: {
                                opacity: 1,
                                transition: { staggerChildren: 0.15, delayChildren: 0.1 },
                            },
                        }}
                    >
                        <div className="flex flex-col gap-2 mb-8 sm:mb-12">
                            <motion.h2
                                variants={{
                                    hidden: { opacity: 0, y: 15 },
                                    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.2, 0.8, 0.2, 1] } },
                                }}
                                className="text-3xl sm:text-4xl font-medium text-slate-400 dark:text-slate-500 tracking-tight"
                            >
                                Hi {firstName}
                            </motion.h2>
                            <motion.h1
                                variants={{
                                    hidden: { opacity: 0, y: 15 },
                                    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.2, 0.8, 0.2, 1] } },
                                }}
                                className="text-4xl sm:text-5xl font-semibold text-slate-900 dark:text-white tracking-tight"
                            >
                                {greeting}
                            </motion.h1>

                        </div>

                        {/* Desktop Input */}
                        <motion.div
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.2, 0.8, 0.2, 1] } },
                            }}
                            className="hidden sm:block w-full"
                        >
                            <MinimalInputBar />
                        </motion.div>
                    </motion.div>
                </div>
            )}

            {/* ── Active State: Chat Thread ── */}
            {hasMessages && (
                <div className="flex-1 flex flex-col w-full overflow-hidden">
                    {/* Scrollable Messages */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 sm:px-6 pt-20 pb-4">
                        <div className="max-w-3xl mx-auto space-y-6">
                            <AnimatePresence initial={false}>
                                {messages.map((msg) => (
                                    <MessageBubble key={msg.id} message={msg} />
                                ))}
                            </AnimatePresence>

                            {/* Processing indicator */}
                            {processing && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-start gap-3"
                                >
                                    <div className="w-8 h-8 rounded-full bg-blue-500/10 dark:bg-blue-400/10 flex items-center justify-center shrink-0 mt-0.5">
                                        <Bot size={16} className="text-blue-500 dark:text-blue-400" />
                                    </div>
                                    <div className="flex items-center gap-3 py-3 px-5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] backdrop-blur-md border border-black/5 dark:border-white/5 shadow-2xl shadow-blue-500/5">
                                        <div className="flex gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-500/40 animate-pulse" />
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-500/60 animate-pulse [animation-delay:200ms]" />
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-500/40 animate-pulse [animation-delay:400ms]" />
                                        </div>
                                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400 ml-1">Analyzing document...</span>
                                    </div>
                                </motion.div>
                            )}

                            {/* Error display */}
                            {error && !processing && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-start gap-3"
                                >
                                    <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                        <AlertCircle size={16} className="text-red-500" />
                                    </div>
                                    <div className="py-3 px-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-sm text-red-700 dark:text-red-300">
                                        {typeof error === 'string' ? error : (error as any)?.message || 'An unexpected error occurred.'}
                                    </div>
                                </motion.div>
                            )}

                            {/* Scroll anchor */}
                            <div ref={bottomRef} />
                        </div>
                    </div>

                    {/* Sticky Input at Bottom */}
                    <div className="hidden sm:block w-full max-w-3xl mx-auto px-4 sm:px-6 pb-6 pt-2">
                        <MinimalInputBar />
                    </div>
                </div>
            )}

            {/* Mobile Input Bar (always sticky at bottom) */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
                className="sm:hidden sticky bottom-0 left-0 right-0 w-full px-4 pb-6 pt-4 bg-background/80 backdrop-blur-md"
            >
                <MinimalInputBar />
            </motion.div>
        </div>
    );
}

// ── Message Bubble Component ────────────────────────────────────────
function MessageBubble({ message }: { message: ChatMessage }) {
    const isUser = message.role === 'user';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
            className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
        >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isUser
                ? 'bg-slate-100 dark:bg-white/10'
                : 'bg-blue-500/10 dark:bg-blue-400/10'
                }`}>
                {isUser
                    ? <User size={16} className="text-slate-500 dark:text-slate-300" />
                    : <Bot size={16} className="text-blue-600 dark:text-blue-400" />
                }
            </div>

            {/* Content */}
            <div className={`max-w-[80%] flex flex-col gap-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
                {/* File attachments */}
                {message.attachments && message.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-1">
                        {message.attachments.map((name, i) => (
                            <span
                                key={i}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-xs text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/20"
                            >
                                <FileText size={12} />
                                {name}
                            </span>
                        ))}
                    </div>
                )}

                {/* Message text */}
                <div className={`py-3 px-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm transition-all duration-300 ${isUser
                    ? 'bg-blue-600 dark:bg-blue-600/90 text-white rounded-tr-sm shadow-blue-900/10 dark:shadow-blue-900/20 border border-blue-500/20 dark:border-white/10'
                    : 'bg-black/[0.03] dark:bg-white/[0.03] backdrop-blur-md border border-black/5 dark:border-white/5 text-slate-800 dark:text-slate-200 rounded-tl-sm'
                    }`}>
                    {typeof message.content === 'string'
                        ? message.content
                        : (message.content as any)?.message || JSON.stringify(message.content)}
                </div>
            </div>
        </motion.div>
    );
}
