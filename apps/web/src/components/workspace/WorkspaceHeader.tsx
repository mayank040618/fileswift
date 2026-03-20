'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FileText, SquarePen, PanelLeft, ChevronDown } from 'lucide-react';
import { ProfileMenu } from './ProfileMenu';
import { SettingsModal } from './SettingsModal';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';

interface WorkspaceHeaderProps {
    userEmail: string;
    planType: string;
    fullName: string;
}

export function WorkspaceHeader({ userEmail, planType, fullName }: WorkspaceHeaderProps) {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [activeSettingsTab, setActiveSettingsTab] = useState<'general' | 'personalization' | 'data'>('general');
    const [displayName, setDisplayName] = useState(fullName);
    const clearChat = useWorkspaceStore((s) => s.clearChat);
    const toggleSidebar = useWorkspaceStore((s) => s.toggleSidebar);

    const displayInitial = (displayName || userEmail)?.[0]?.toUpperCase() || 'U';

    return (
        <>
            <header className="fixed top-0 left-0 right-0 h-14 flex items-center px-3 sm:px-5 z-[60] bg-white/70 dark:bg-[#0A0A0A]/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/[0.06]">
                <div className="flex items-center w-full">
                    {/* Left: Logo + New Chat */}
                    <div className="flex items-center gap-1">
                        {/* Sidebar Toggle — ChatGPT style */}
                        <button
                            onClick={toggleSidebar}
                            className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/[0.06] dark:hover:bg-white/[0.08] transition-all active:scale-95"
                            title="Toggle sidebar"
                            aria-label="Toggle sidebar"
                        >
                            <PanelLeft size={18} strokeWidth={2} />
                        </button>

                        {/* New Chat Button — ChatGPT style */}
                        <button
                            onClick={clearChat}
                            className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/[0.06] dark:hover:bg-white/[0.08] transition-all active:scale-95"
                            title="New chat"
                            aria-label="New chat"
                        >
                            <SquarePen size={18} strokeWidth={2} />
                        </button>

                        <div className="w-[1px] h-4 bg-slate-200 dark:bg-white/10 mx-1 hidden sm:block" />

                        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-90">
                            <div className="bg-blue-600 p-1.5 rounded-xl shadow-lg shadow-blue-600/20">
                                <FileText className="text-white w-4 h-4" strokeWidth={2.5} />
                            </div>
                            <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight hidden sm:inline">
                                FileSwift<span className="text-blue-600 dark:text-blue-400">AI</span>
                            </span>
                        </Link>
                    </div>

                    {/* Right: Profile */}
                    <div className="ml-auto flex items-center">
                        <div className="relative">
                            <button 
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-2 p-1.5 pl-2 rounded-xl border border-slate-200/50 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-all group"
                                aria-label="Toggle profile menu"
                            >
                                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white shadow-lg shadow-blue-500/20">
                                    {displayInitial}
                                </div>
                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 hidden sm:block">
                                    {planType === 'PRO_ACTIVE' ? 'Pro' : planType === 'STUDENT' ? 'Student' : 'Free'}
                                </span>
                                <ChevronDown size={14} className={`text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <ProfileMenu 
                                isOpen={isProfileOpen} 
                                onClose={() => setIsProfileOpen(false)} 
                                userEmail={userEmail}
                                planType={planType}
                                fullName={displayName}
                                 onSettingsOpen={(tab) => {
                                    setIsProfileOpen(false);
                                    setActiveSettingsTab(tab);
                                    setIsSettingsOpen(true);
                                }}
                            />
                        </div>
                    </div>
                </div>
            </header>

            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                currentName={displayName}
                onNameUpdate={(newName) => setDisplayName(newName)}
                defaultTab={activeSettingsTab}
            />
        </>
    );
}
