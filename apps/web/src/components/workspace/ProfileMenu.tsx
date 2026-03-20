import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings, CreditCard, LogOut, ChevronRight, Zap, Check, Palette, Sun, Moon, Monitor } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useClerk } from '@clerk/nextjs';
import { useThemeStore, THEME_COLORS, ThemeColorName } from '@/store/useThemeStore';

interface ProfileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    userEmail: string;
    planType: string;
    fullName: string;
    onSettingsOpen: () => void;
}

export function ProfileMenu({ isOpen, onClose, userEmail, planType, fullName, onSettingsOpen }: ProfileMenuProps) {
    const activeColorName = useThemeStore((state) => state.activeColorName);
    const setThemeColor = useThemeStore((state) => state.setThemeColor);
    const { theme, setTheme } = useTheme();
    const { signOut } = useClerk();
    const menuRef = useRef<HTMLDivElement>(null);

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) {
                // Check if the click was on the toggle button - if so, let the toggle button handle it
                const toggleButton = document.querySelector('[aria-label="Toggle profile menu"]');
                if (toggleButton && toggleButton.contains(event.target as Node)) {
                    return;
                }
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    const planLabels: Record<string, string> = {
        'FREE': 'Free Plan',
        'STUDENT': 'Student Pro',
        'PRO_ACTIVE': 'Pro Member'
    };
    const currentPlanLabel = planLabels[planType] || 'Free Plan';
    
    const planBadges: Record<string, { label: string, color: string, text: string }> = {
        'FREE': { label: 'FREE', color: 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300', text: 'Upgrade to unlock premium AI tools.' },
        'STUDENT': { label: 'STUDENT', color: 'bg-blue-600 text-white', text: 'Your Student plan is active.' },
        'PRO_ACTIVE': { label: 'PRO', color: 'bg-slate-900 dark:bg-white text-white dark:text-black', text: 'Your Pro plan is active. No action needed.' }
    };
    const activeBadge = planBadges[planType] || planBadges['FREE'];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    ref={menuRef}
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300, mass: 0.8 }}
                    className="absolute top-full mt-2 right-0 w-[320px] sm:w-[380px] bg-white/95 dark:bg-black/90 backdrop-blur-2xl border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl z-[70] overflow-hidden origin-top-right"
                >
                        {/* User Header */}
                        <div className="p-5 border-b border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-black/10 dark:bg-white/20 flex items-center justify-center p-[2px]">
                                    <div className="w-full h-full rounded-full bg-white dark:bg-black flex items-center justify-center border border-black/10 dark:border-white/10 text-lg font-bold text-slate-900 dark:text-white uppercase">
                                        {(fullName || userEmail)?.[0] || 'U'}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{fullName || userEmail || 'User'}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{currentPlanLabel}</p>
                                </div>
                                <Zap size={16} className="text-slate-900 dark:text-white fill-slate-900 dark:fill-white" />
                            </div>
                        </div>

                        {/* Menu Items */}
                        <div className="p-2">
                            <button
                                onClick={() => {
                                    onClose();
                                    onSettingsOpen('personalization');
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-300 group"
                            >
                                <span className="p-2 rounded-lg bg-black/5 dark:bg-white/5 group-hover:bg-black/10 dark:group-hover:bg-white/10 transition-colors">
                                    <User size={18} />
                                </span>
                                <span className="flex-1 text-sm font-medium text-left">My Profile</span>
                                <ChevronRight size={14} className="text-slate-400" />
                            </button>
                            
                            <button
                                onClick={() => {
                                    onClose();
                                    onSettingsOpen('general');
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-300 group"
                            >
                                <span className="p-2 rounded-lg bg-black/5 dark:bg-white/5 group-hover:bg-black/10 dark:group-hover:bg-white/10 transition-colors">
                                    <Settings size={18} />
                                </span>
                                <span className="flex-1 text-sm font-medium text-left">Settings</span>
                                <ChevronRight size={14} className="text-slate-400" />
                            </button>

                            <MenuLink icon={<CreditCard size={18} />} label="Subscription" href="/account/billing" />

                            <div className="h-[1px] bg-black/10 dark:bg-white/10 my-2 mx-2" />

                            <button
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-slate-500 dark:text-slate-400 hover:text-red-500 transition-all duration-300 group"
                                onClick={() => {
                                    signOut({ redirectUrl: '/' });
                                }}
                            >
                                <span className="p-2 rounded-lg bg-black/5 dark:bg-white/5 group-hover:bg-red-500/10 transition-colors">
                                    <LogOut size={18} />
                                </span>
                                <span className="text-sm font-medium">Log out</span>
                            </button>
                        </div>

                        {/* Plan Badge / Upsell */}
                        <div className="p-4 bg-black/5 dark:bg-white/5 border-t border-black/10 dark:border-white/10">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Plan Status</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${activeBadge.color}`}>{activeBadge.label}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">{activeBadge.text}</p>
                        </div>
                    </motion.div>
            )}
        </AnimatePresence>
    );
}

function MenuLink({ icon, label, href }: { icon: React.ReactNode, label: string, href: string }) {
    const activeColorDef = useThemeStore((state) => state.getActiveColorDef());
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl hover:${activeColorDef.bgClass}/10 text-slate-500 dark:text-slate-400 hover:${activeColorDef.textClass} transition-all duration-300 group`}
        >
            <span className={`p-2 rounded-lg bg-black/5 dark:bg-white/5 group-hover:${activeColorDef.bgClass}/10 transition-colors`}>
                {icon}
            </span>
            <span className="flex-1 text-sm font-medium">{label}</span>
            <ChevronRight size={14} className={`text-slate-600 group-hover:${activeColorDef.textClass}/50 transition-colors`} />
        </Link>
    );
}
