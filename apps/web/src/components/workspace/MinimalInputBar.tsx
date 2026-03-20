'use client';

import React, { useState, useRef } from 'react';
import { Plus, ArrowRight, X, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore, THEME_COLORS } from '@/store/useThemeStore';
import { useWorkspaceStore, generateMessageId } from '@/store/useWorkspaceStore';
import { executeTask } from '@/lib/executeTask';
import { toast } from 'sonner';
import { ActionCards } from './ActionCards';

export function MinimalInputBar() {
    const [isFocused, setIsFocused] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const activeColorName = useThemeStore((state) => state.activeColorName);
    const activeColorDef = THEME_COLORS[activeColorName];

    const { files, addFiles, removeFile, clearFiles, addMessage, processing, setProcessing, setError } = useWorkspaceStore();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            addFiles(Array.from(e.target.files));
        }
        e.target.value = '';
    };

    const hasInput = inputValue.trim().length > 0 || files.length > 0;

    const handleSubmit = async (e?: React.FormEvent | React.MouseEvent, overridePrompt?: string) => {
        if (e) e.preventDefault();
        const prompt = overridePrompt || inputValue.trim();
        if ((!hasInput && !overridePrompt) || processing) return;

        const currentFiles = [...files];
        const attachmentNames = currentFiles.map(f => f.name);

        // 1. Add user message instantly
        addMessage({
            id: generateMessageId(),
            role: 'user',
            content: prompt || `[Uploaded ${currentFiles.length} file(s)]`,
            attachments: attachmentNames.length > 0 ? attachmentNames : undefined,
            timestamp: Date.now(),
        });

        // 2. Clear input and files
        setInputValue('');
        clearFiles();

        // 3. Set processing state
        setProcessing(true);
        setError(null);

        try {
            // 4. Upload files to persistent cloud storage first
            if (currentFiles.length > 0) {
                for (const file of currentFiles) {
                    const formData = new FormData();
                    formData.append('file', file);
                    const uploadRes = await fetch('/api/storage/upload', {
                        method: 'POST',
                        body: formData,
                    });
                    if (!uploadRes.ok) {
                        const errorMsg = await uploadRes.text();
                        throw new Error(`Upload failed for ${file.name}: ${errorMsg}`);
                    }
                }
                toast.success(`${currentFiles.length} file(s) saved to cloud storage.`);
            }

            // 5. Execute AI task
            const result = await executeTask({
                type: 'ai',
                prompt: prompt || undefined,
                files: currentFiles.length > 0 ? currentFiles : undefined,
            });

            if (result.success) {
                // 6. Add assistant response
                addMessage({
                    id: generateMessageId(),
                    role: 'assistant',
                    content: result.output,
                    timestamp: Date.now(),
                });
            } else {
                setError(result.error || 'Something went wrong.');
                toast.error(result.error || 'Failed to get AI response.');
            }
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Unexpected error.';
            setError(msg);
            toast.error(msg);
        } finally {
            // 7. Re-enable input
            setProcessing(false);
        }
    };

    return (
        <motion.div
            className="w-full relative z-20"
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
        >
            <AnimatePresence>
                {files.length > 0 && !processing && (
                    <ActionCards
                        files={files}
                        onSelectAction={(prompt) => handleSubmit(undefined, prompt)}
                    />
                )}
            </AnimatePresence>
            <form
                onSubmit={handleSubmit}
                className={clsx(
                    "relative flex items-center w-full min-h-[64px] rounded-[28px] transition-all duration-300 ease-out backdrop-blur-[24px] backdrop-saturate-[160%]",
                    isFocused
                        ? "bg-black/[0.04] dark:bg-white/[0.08] border border-black/10 dark:border-white/20 shadow-[0_0_0_1px_rgba(0,0,0,0.02),0_12px_48px_rgba(0,0,0,0.1),0_0_20px_rgba(59,130,246,0.05)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_48px_rgba(0,0,0,0.5),0_0_20px_rgba(59,130,246,0.1)]"
                        : "bg-black/[0.02] dark:bg-white/[0.04] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] border border-black/[0.05] dark:border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.4)]"
                )}
            >
                {/* Top Edge Light */}
                <div className="absolute inset-x-0 top-0 h-1/2 dark:bg-gradient-to-b dark:from-white/[0.08] dark:to-transparent rounded-t-[28px] pointer-events-none" />

                {/* Left: Add File */}
                <div className="pl-4 sm:pl-3 pr-2 py-3 flex items-center justify-center shrink-0">
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={processing}
                        className="w-11 h-11 rounded-full flex items-center justify-center text-slate-500 hover:text-[var(--theme-accent)] hover:bg-[var(--theme-accent)]/10 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Add file"
                        aria-label="Add file"
                    >
                        <Plus size={24} strokeWidth={1.5} />
                    </button>
                    <input
                        type="file"
                        multiple
                        hidden
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".pdf,.txt,.csv,.json,.md,.doc,.docx,.png,.jpg,.jpeg,.gif,.webp"
                    />
                </div>

                {/* Input Field */}
                <div className="flex-1 flex flex-wrap items-center gap-2 relative h-full py-3 min-w-0">
                    {/* File chips */}
                    {files.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 overflow-hidden pl-1">
                            {files.map((file, idx) => (
                                <div key={`${file.name}-${idx}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/10 text-xs text-slate-700 dark:text-slate-300 border border-black/5 dark:border-white/10 max-w-[150px]">
                                    <span className="truncate">{file.name}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeFile(file.name)}
                                        className="hover:text-red-500 transition-colors p-0.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 shrink-0"
                                        title="Remove file"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        disabled={processing}
                        placeholder={processing ? 'Analyzing document...' : 'Ask FileSwift...'}
                        className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-base sm:text-lg text-foreground placeholder:text-slate-500 font-normal px-2 disabled:opacity-60 disabled:animate-pulse"
                        aria-label="Main input prompt"
                    />
                </div>

                {/* Right: Send / Loading */}
                <div className="pr-5 sm:pr-4 pl-2 py-3 flex items-center justify-center shrink-0">
                    {processing ? (
                        <div className="w-10 h-10 rounded-full flex items-center justify-center">
                            <Loader2 size={20} className="animate-spin text-slate-400" />
                        </div>
                    ) : (
                        <button
                            type="submit"
                            disabled={!hasInput}
                            className={clsx(
                                "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 relative z-10",
                                hasInput
                                    ? `${activeColorDef.bgClass} text-white shadow-lg shadow-[var(--theme-accent)]/20 hover:scale-105 active:scale-95`
                                    : "text-slate-400 bg-transparent hover:bg-black/5 dark:hover:bg-white/5 cursor-not-allowed opacity-50"
                            )}
                            title="Submit prompt"
                            aria-label="Submit prompt"
                        >
                            <ArrowRight size={20} strokeWidth={2.5} className={hasInput ? activeColorDef.contrastTextClass : ""} />
                        </button>
                    )}
                </div>
            </form>
        </motion.div>
    );
}
