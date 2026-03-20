'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Cloud, FileText, Trash2, Search } from 'lucide-react';
import { useThemeStore, THEME_COLORS } from '@/store/useThemeStore';

interface HistoryPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

const mockHistory = [
    { id: '1', name: 'Annual_Report_2023.pdf', type: 'PDF', date: '2 hours ago' },
    { id: '2', name: 'Project_Proposal_Final.docx', type: 'DOCX', date: 'Yesterday' },
    { id: '3', name: 'Product_Mockup_V2.png', type: 'Image', date: 'Mar 1, 2024' },
];

export function HistoryPanel({ isOpen, onClose }: HistoryPanelProps) {
    const activeColorName = useThemeStore((state) => state.activeColorName);
    const activeColorDef = THEME_COLORS[activeColorName];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-[60]"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300, mass: 0.8 }}
                        className="fixed top-0 left-0 bottom-0 w-80 sm:w-96 bg-white/80 dark:bg-black/80 backdrop-blur-3xl border-r border-black/5 dark:border-white/5 z-[70] shadow-[20px_0_50px_rgba(0,0,0,0.05)] dark:shadow-[20px_0_50px_rgba(0,0,0,0.5)] flex flex-col"
                    >
                        <div className="p-6 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
                                <Clock size={20} className="text-blue-600 dark:text-blue-500" />
                                Workspace History
                            </h2>
                            <button
                                onClick={onClose}
                                className={`p-2 hover:${activeColorDef.bgClass}/10 rounded-full text-slate-400 hover:${activeColorDef.textClass} transition-colors`}
                                title="Close History"
                                aria-label="Close History"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Search in History */}
                        <div className="px-6 py-4">
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-500 transition-colors" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search documents..."
                                    className="w-full bg-black/[0.03] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-black/10 dark:border-white/20 focus:ring-1 focus:ring-blue-600/20 dark:focus:ring-blue-500/20 transition-all font-medium"
                                />
                            </div>
                        </div>

                        {/* Content Sections */}
                        <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-6">

                            {/* Recent Activity */}
                            <section>
                                <div className="px-2 mb-3">
                                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Recent Activity</h3>
                                </div>
                                <div className="space-y-1">
                                    {mockHistory.map((item) => (
                                        <button
                                            key={item.id}
                                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-black/[0.03] dark:hover:bg-white/[0.03] text-left group transition-all border border-transparent hover:border-black/5 dark:hover:border-white/5"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-black/[0.05] dark:bg-white/[0.05] flex items-center justify-center text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:scale-105 transition-all border border-black/5 dark:border-white/5 group-hover:border-black/10 dark:group-hover:border-white/10">
                                                <FileText size={20} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-900 dark:text-slate-200 truncate">{item.name}</p>
                                                <p className="text-xs text-slate-500">Edited {item.date}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </section>

                            {/* Saved in Cloud */}
                            <section>
                                <div className="px-2 mb-3 flex items-center justify-between">
                                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cloud Storage</h3>
                                    <span className="text-[10px] text-black font-bold bg-white px-1.5 py-0.5 rounded">PRO</span>
                                </div>
                                <div className={`p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-center relative overflow-hidden group hover:border-${activeColorName === 'white' ? 'black/20 dark:border-white/20' : activeColorName + '-500/30'} transition-colors`}>
                                    <Cloud className={`mx-auto ${activeColorDef.textClass} mb-2`} size={32} />
                                    <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">Upgrade to Cloud</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Store files permanently and access them anywhere.</p>
                                    <button className={`w-full py-2.5 ${activeColorDef.bgClass} ${activeColorDef.contrastTextClass} hover:opacity-90 text-xs font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)]`}>
                                        View Plans
                                    </button>
                                </div>
                            </section>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-black/10 dark:border-white/10 bg-slate-50 dark:bg-black/20">
                            <button className={`w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-slate-500 dark:text-slate-400 hover:${activeColorDef.textClass} hover:${activeColorDef.bgClass}/10 rounded-xl transition-all`}>
                                <Trash2 size={16} />
                                Clear Workspace
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
