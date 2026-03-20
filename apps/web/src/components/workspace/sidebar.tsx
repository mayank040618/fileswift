'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
    Sparkles, 
    MessageSquare, 
    TableProperties, 
    Crown,
    Database,
    Clock,
    ChevronRight,
    Files
} from 'lucide-react';

import { useWorkspaceStore } from '@/store/useWorkspaceStore';

interface SidebarProps {
    planType: string;
    requestsUsed: number;
    requestsLimit: number;
    storageUsed: number;
}

// Mock history for sidebar - in real app this would come from a store/API
const sidebarHistory = [
    { id: '1', name: 'Annual Report Analysis', action: 'Summary', date: 'Today', type: 'summary' },
    { id: '2', name: 'Revenue Data Export', action: 'Extraction', date: 'Today', type: 'table' },
    { id: '3', name: 'Product Proposal Q4', action: 'Chat', date: 'Yesterday', type: 'chat' },
];

export function Sidebar({ planType, requestsUsed, requestsLimit, storageUsed }: SidebarProps) {
    const pathname = usePathname();
    const isSidebarOpen = useWorkspaceStore((state) => state.isSidebarOpen);

    // Plan-aware limits
    const limits = {
        history: planType === 'PRO_ACTIVE' ? 50 : planType === 'STUDENT' ? 10 : 3,
        storage: planType === 'PRO_ACTIVE' ? 5120 : planType === 'STUDENT' ? 1536 : 100, // MB
    };

    const storagePercent = Math.min((storageUsed / limits.storage) * 100, 100);
    const usagePercent = Math.min((requestsUsed / requestsLimit) * 100, 100);

    const planLabels: Record<string, string> = {
        'FREE': 'Free Plan',
        'STUDENT': 'Student Pro',
        'PRO_ACTIVE': 'Pro Member'
    };

    const currentPlanLabel = planLabels[planType] || 'Free Plan';

    const getIcon = (type: string) => {
        switch (type) {
            case 'summary': return <Sparkles size={14} className="text-indigo-400" />;
            case 'table': return <TableProperties size={14} className="text-emerald-400" />;
            default: return <MessageSquare size={14} className="text-blue-400" />;
        }
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300"
                    onClick={() => useWorkspaceStore.getState().toggleSidebar()}
                />
            )}

            <aside 
                className={`h-screen border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0A0A0A] flex-shrink-0 z-40 transition-all duration-300 ease-in-out fixed md:relative ${
                    isSidebarOpen ? 'w-64 border-r opacity-100' : 'w-0 border-r-0 opacity-0 overflow-hidden'
                }`}
            >
            <div className="w-64 h-full flex flex-col items-stretch overflow-hidden">
                {/* Logo */}
                <div className="h-14 flex items-center px-4 border-b border-slate-200/50 dark:border-white/5 shrink-0">
                    <Link href="/" className="flex items-center gap-2 group">
                        <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white transition-opacity group-hover:opacity-80">
                            FileSwift<span className="text-blue-600 dark:text-blue-400">AI</span>
                        </span>
                    </Link>
                </div>

                {/* Recent Chats Section */}
                <div className="flex-1 overflow-y-auto px-2 py-4 space-y-6">
                    <section>
                        <div className="px-3 mb-2">
                            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Navigation</h3>
                            <Link
                                href="/workspace/storage"
                                className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all group ${
                                    pathname === '/workspace/storage' 
                                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                <Files size={14} className={pathname === '/workspace/storage' ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'} />
                                <span className="text-xs font-medium">Cloud Files</span>
                            </Link>
                        </div>
                    </section>

                    <section>
                        <div className="flex items-center justify-between px-3 mb-3 mt-6">
                            <div className="flex items-center gap-2">
                                <Clock size={14} className="text-slate-400" />
                                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Recent Chats</h3>
                            </div>
                            <span className="text-[9px] font-bold text-slate-400 bg-black/5 dark:bg-white/5 px-1.5 py-0.5 rounded uppercase">
                                {sidebarHistory.length}/{limits.history}
                            </span>
                        </div>
                        
                        <div className="space-y-0.5">
                            {sidebarHistory.slice(0, limits.history).map((item) => (
                                <Link
                                    key={item.id}
                                    href={`/workspace/history/${item.id}`}
                                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-all group"
                                >
                                    <span className="shrink-0 scale-90 opacity-70 group-hover:opacity-100 transition-opacity">
                                        {getIcon(item.type)}
                                    </span>
                                    <span className="text-xs font-medium truncate flex-1">{item.name}</span>
                                    <ChevronRight size={12} className="opacity-0 group-hover:opacity-50 transition-opacity -translate-x-1 group-hover:translate-x-0" />
                                </Link>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Resource Usage & Plan */}
                <div className="p-3 bg-white dark:bg-[#0D0D0D] border-t border-slate-200 dark:border-white/5">
                    <div className="mb-4 px-1">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{currentPlanLabel}</span>
                            <Crown size={12} className="text-amber-500 fill-amber-500/20" />
                        </div>
                        
                        <div className="space-y-4">
                            {/* AI Requests */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-[11px]">
                                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                                        <Sparkles size={11} />
                                        <span>AI Requests</span>
                                    </div>
                                    <span className="font-bold text-slate-900 dark:text-white">{requestsUsed}/{requestsLimit}</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full transition-all duration-700 ${
                                            usagePercent > 90 ? 'bg-red-500' : usagePercent > 70 ? 'bg-amber-500' : 'bg-blue-600'
                                        }`}
                                        style={{ width: `${usagePercent}%` }}
                                    />
                                </div>
                            </div>

                            {/* Cloud Storage */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-[11px]">
                                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                                        <Database size={11} />
                                        <span>Cloud Storage</span>
                                    </div>
                                    <span className="font-bold text-slate-900 dark:text-white">
                                        {storageUsed >= 1024 ? `${(storageUsed/1024).toFixed(1)}GB` : `${storageUsed}MB`} / {limits.storage >= 1024 ? `${(limits.storage/1024).toFixed(1)}GB` : `${limits.storage}MB`}
                                    </span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full bg-indigo-500 transition-all duration-700`}
                                        style={{ width: `${storagePercent}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {planType !== 'PRO_ACTIVE' ? (
                        <Link 
                            href="/pricing"
                            className="w-full flex items-center justify-center py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold transition-all hover:opacity-90 active:scale-95 shadow-lg shadow-black/5 dark:shadow-white/5"
                        >
                            Upgrade Plan
                        </Link>
                    ) : (
                        <Link 
                            href="/account/billing"
                            className="w-full flex items-center justify-center py-2.5 rounded-xl bg-black/5 dark:bg-white/5 text-slate-600 dark:text-slate-400 text-xs font-bold transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-95"
                        >
                            Manage Plan
                        </Link>
                    )}
                </div>
            </div>
        </aside>
      </>
    );
}
