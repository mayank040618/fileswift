'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, 
    User, 
    Check, 
    Loader2, 
    Settings, 
    Palette, 
    Trash2, 
    ShieldCheck, 
    Sun, 
    Moon, 
    Monitor,
    ChevronRight,
    Download,
    UserX
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useThemeStore, THEME_COLORS, ThemeColorName } from '@/store/useThemeStore';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentName: string;
    onNameUpdate: (newName: string) => void;
    defaultTab?: TabId;
}

type TabId = 'general' | 'personalization' | 'data';

export function SettingsModal({ isOpen, onClose, currentName, onNameUpdate, defaultTab = 'general' }: SettingsModalProps) {
    const [activeTab, setActiveTab] = useState<TabId>(defaultTab);
    const [name, setName] = useState(currentName);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');
    
    const { theme, setTheme } = useTheme();
    const activeColorName = useThemeStore((state) => state.activeColorName);
    const setThemeColor = useThemeStore((state) => state.setThemeColor);
    const clearChat = useWorkspaceStore((state) => state.clearChat);

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setName(currentName);
            setSaved(false);
            setError('');
            if (defaultTab) {
                setActiveTab(defaultTab);
            }
        }
    }, [isOpen, currentName, defaultTab]);

    const handleSaveName = async () => {
        if (!name.trim()) {
            setError('Please enter a name');
            return;
        }
        if (name.trim().length > 50) {
            setError('Name must be 50 characters or less');
            return;
        }

        setSaving(true);
        setError('');

        try {
            const res = await fetch('/api/user/update-name', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim() }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to update name');
                return;
            }

            onNameUpdate(data.name);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const tabs = [
        { id: 'general', label: 'General', icon: <Settings size={18} /> },
        { id: 'personalization', label: 'Personalization', icon: <User size={18} /> },
        { id: 'data', label: 'Data Controls', icon: <ShieldCheck size={18} /> },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    
                    {/* Modal Container */}
                    <div className="fixed inset-0 z-[85] flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="w-full max-w-2xl bg-white dark:bg-[#0D0D0D] rounded-3xl border border-slate-200 dark:border-white/10 shadow-3xl overflow-hidden flex flex-col sm:flex-row h-[550px] pointer-events-auto"
                        >
                            {/* Left Sidebar */}
                            <div className="w-full sm:w-64 bg-slate-50 dark:bg-black/40 border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-white/5 p-4 flex flex-col">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 px-2 hidden sm:block">Settings</h2>
                                
                                <nav className="space-y-1">
                                    {tabs.map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id as TabId)}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                                                activeTab === tab.id 
                                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                                                    : 'text-slate-500 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                                            }`}
                                        >
                                            {tab.icon}
                                            <span className="text-sm font-medium">{tab.label}</span>
                                        </button>
                                    ))}
                                </nav>

                                <div className="mt-auto pt-4 border-t border-slate-200 dark:border-white/5 hidden sm:block">
                                    <p className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">FileSwiftAI v1.0</p>
                                </div>
                            </div>

                            {/* Main Content Area */}
                            <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#0D0D0D]">
                                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200/50 dark:border-white/5 shrink-0">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                        {tabs.find(t => t.id === activeTab)?.label}
                                    </h3>
                                    <button
                                        onClick={onClose}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                                        aria-label="Close settings"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={activeTab}
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            transition={{ duration: 0.2 }}
                                            className="space-y-8"
                                        >
                                            {activeTab === 'general' && (
                                                <div className="space-y-8">
                                                    {/* Theme Section */}
                                                    <section>
                                                        <div className="flex items-center gap-2 mb-4">
                                                            <Sun size={16} className="text-slate-400" />
                                                            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Theme Mode</h4>
                                                        </div>
                                                        <div className="grid grid-cols-3 gap-3">
                                                            {[
                                                                { id: 'light', label: 'Light', icon: <Sun size={18} /> },
                                                                { id: 'dark', label: 'Dark', icon: <Moon size={18} /> },
                                                                { id: 'system', label: 'System', icon: <Monitor size={18} /> },
                                                            ].map((t) => (
                                                                <button
                                                                    key={t.id}
                                                                    onClick={() => setTheme(t.id)}
                                                                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all ${
                                                                        theme === t.id 
                                                                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' 
                                                                            : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20'
                                                                    }`}
                                                                >
                                                                    {t.icon}
                                                                    <span className="text-xs font-medium">{t.label}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </section>

                                                    {/* Accent Color Section */}
                                                    <section>
                                                        <div className="flex items-center gap-2 mb-4">
                                                            <Palette size={16} className="text-slate-400" />
                                                            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Accent Color</h4>
                                                        </div>
                                                        <div className="flex flex-wrap gap-3">
                                                            {(Object.keys(THEME_COLORS) as ThemeColorName[]).map((colorName) => {
                                                                const colorDef = THEME_COLORS[colorName];
                                                                const isActive = colorName === activeColorName;
                                                                return (
                                                                    <button
                                                                        key={colorName}
                                                                        onClick={() => setThemeColor(colorName)}
                                                                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                                                            isActive ? 'scale-110 ring-4 ring-blue-500/20' : 'hover:scale-110 opacity-70 hover:opacity-100'
                                                                        }`}
                                                                        title={colorDef.label}
                                                                        aria-label={`Set theme to ${colorDef.label}`}
                                                                    >
                                                                        <div className={`w-full h-full rounded-full ${colorDef.bgClass} flex items-center justify-center border border-black/10 dark:border-white/10`}>
                                                                            {isActive && <Check size={16} className={colorDef.contrastTextClass} strokeWidth={3} />}
                                                                        </div>
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </section>
                                                </div>
                                            )}

                                            {activeTab === 'personalization' && (
                                                <div className="space-y-8">
                                                    {/* Profile Preview */}
                                                    <section className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10">
                                                        <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-3xl font-bold text-white shadow-2xl shadow-blue-600/30 mb-4">
                                                            {(name || 'U')[0].toUpperCase()}
                                                        </div>
                                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Profile Avatar Preview</h4>
                                                        <p className="text-xs text-slate-500 mt-1">This is how you appear to the AI</p>
                                                    </section>

                                                    {/* Name Field */}
                                                    <section className="space-y-4">
                                                        <div>
                                                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
                                                                Display Name
                                                            </label>
                                                            <div className="relative">
                                                                <input
                                                                    ref={inputRef}
                                                                    type="text"
                                                                    value={name}
                                                                    onChange={(e) => {
                                                                        setName(e.target.value);
                                                                        setError('');
                                                                    }}
                                                                    placeholder="Enter your name..."
                                                                    maxLength={50}
                                                                    className="w-full pl-4 pr-12 py-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
                                                                />
                                                                <button 
                                                                    onClick={handleSaveName}
                                                                    disabled={saving || name === currentName || !name.trim()}
                                                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-blue-600 text-white disabled:opacity-0 disabled:scale-90 transition-all shadow-lg shadow-blue-600/20"
                                                                >
                                                                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                                                </button>
                                                            </div>
                                                            {error && <p className="text-xs text-red-500 mt-2 font-medium">{error}</p>}
                                                            {saved && <p className="text-xs text-green-500 mt-2 font-medium flex items-center gap-1"><Check size={12}/> Name updated successfully!</p>}
                                                        </div>
                                                    </section>
                                                </div>
                                            )}

                                            {activeTab === 'data' && (
                                                <div className="space-y-6">
                                                    <section className="space-y-3">
                                                        <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Workspace Management</h4>
                                                        
                                                        <div className="space-y-2">
                                                            <button 
                                                                onClick={() => {
                                                                    if (confirm('Are you sure you want to clear all messages and files? This cannot be undone.')) {
                                                                        clearChat();
                                                                        onClose();
                                                                    }
                                                                }}
                                                                className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-red-500/5 hover:border-red-500/30 group transition-all"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className="p-2 rounded-lg bg-red-500/10 text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all">
                                                                        <Trash2 size={18} />
                                                                    </div>
                                                                    <div className="text-left">
                                                                        <p className="text-sm font-bold text-slate-900 dark:text-white">Clear All Chats</p>
                                                                        <p className="text-[10px] text-slate-500">Delete all messages and uploaded files</p>
                                                                    </div>
                                                                </div>
                                                                <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-all" />
                                                            </button>

                                                            <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 opacity-50 cursor-not-allowed">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                                                                        <Download size={18} />
                                                                    </div>
                                                                    <div className="text-left">
                                                                        <p className="text-sm font-bold text-slate-900 dark:text-white">Export Data</p>
                                                                        <p className="text-[10px] text-slate-500">Download your history as JSON</p>
                                                                    </div>
                                                                </div>
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter bg-slate-200 dark:bg-white/10 px-1.5 py-0.5 rounded">Coming Soon</span>
                                                            </button>
                                                        </div>
                                                    </section>

                                                    <section className="pt-6 border-t border-slate-200 dark:border-white/5">
                                                        <h4 className="text-xs font-bold text-red-500 uppercase tracking-widest mb-3">Danger Zone</h4>
                                                        <button className="w-full flex items-center gap-3 p-4 rounded-2xl bg-red-500/5 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all group">
                                                            <UserX size={18} />
                                                            <span className="text-sm font-bold">Delete Account</span>
                                                        </button>
                                                    </section>
                                                </div>
                                            )}
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
