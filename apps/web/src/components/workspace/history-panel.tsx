'use client';

import React from 'react';
import { Clock, FileText, ChevronRight, Search, Calendar, Sparkles, TableProperties, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HistoryItem {
    id: string;
    name: string;
    action: string;
    date: string;
    type: 'summary' | 'table' | 'chat';
}

const mockHistory: HistoryItem[] = [
    { id: '1', name: 'report.pdf', action: 'AI Summary', date: 'Today', type: 'summary' },
    { id: '2', name: 'invoice.pdf', action: 'Table Extraction', date: 'Today', type: 'table' },
    { id: '3', name: 'proposal.pdf', action: 'Document Chat', date: 'Yesterday', type: 'chat' },
];

export function HistoryPanel() {
    return (
        <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-[#0A0A0A]">
            {/* Header */}
            <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-[#111]">
                <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <h2 className="font-semibold text-slate-900 dark:text-white">Workspace History</h2>
                </div>
            </div>

            {/* Search */}
            <div className="p-4">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-600 transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder="Search document actions..."
                        className="w-full bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-6">
                <section>
                    <div className="flex items-center gap-2 px-2 mb-3">
                        <Calendar size={14} className="text-slate-400" />
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today</h3>
                    </div>
                    <div className="space-y-2">
                        {mockHistory.filter(h => h.date === 'Today').map((item) => (
                            <HistoryCard key={item.id} item={item} />
                        ))}
                    </div>
                </section>

                <section>
                    <div className="flex items-center gap-2 px-2 mb-3">
                        <Calendar size={14} className="text-slate-400" />
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Yesterday</h3>
                    </div>
                    <div className="space-y-2">
                        {mockHistory.filter(h => h.date === 'Yesterday').map((item) => (
                            <HistoryCard key={item.id} item={item} />
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}

function HistoryCard({ item }: { item: HistoryItem }) {
    const icons = {
        summary: <Sparkles size={16} className="text-indigo-500" />,
        table: <TableProperties size={16} className="text-emerald-500" />,
        chat: <MessageSquare size={16} className="text-blue-500" />,
    };

    return (
        <motion.button
            whileHover={{ x: 4 }}
            className="w-full flex items-center gap-4 p-3.5 rounded-2xl bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 text-left group transition-all shadow-sm hover:shadow-md hover:border-blue-500/30"
        >
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                {icons[item.type]}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 overflow-hidden">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-blue-500 transition-colors">
                        {item.action}
                    </span>
                </div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{item.name}</p>
            </div>
            <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
        </motion.button>
    );
}
