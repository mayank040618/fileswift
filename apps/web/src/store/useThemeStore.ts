import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeColorName = 'white' | 'black' | 'blue' | 'indigo' | 'violet' | 'fuchsia' | 'rose' | 'orange' | 'yellow' | 'emerald' | 'cyan';

export interface ThemeColorDef {
    name: ThemeColorName;
    label: string;
    bgClass: string;          // Used for Solid backgrounds (Send Button)
    ringClass: string;        // Used for Ring/Border active states
    textClass: string;        // Used for Text active states
    hoverBgClass: string;     // Used for Hover Backgrounds
    contrastTextClass: string; // Used for content inside the solid background (e.g. icons) -- ID: theme-contrast-fix
    hex: string;              // For exact matching in Canvas/Animations if needed
}

export const THEME_COLORS: Record<ThemeColorName, ThemeColorDef> = {
    white: {
        name: 'white',
        label: 'Minimal White',
        bgClass: 'dark:bg-white/20 bg-black/10', // Glassy/translucent for visibility
        ringClass: 'ring-white/20',
        textClass: 'dark:text-white text-slate-800',
        hoverBgClass: 'dark:hover:bg-white/30 hover:bg-black/20',
        contrastTextClass: 'text-white', // Unified white icon pattern -- ID: theme-contrast-refine
        hex: '#ffffff',
    },
    black: {
        name: 'black',
        label: 'Solid Black',
        bgClass: 'bg-black',
        ringClass: 'ring-white/10',
        textClass: 'dark:text-white text-slate-800',
        hoverBgClass: 'hover:bg-black/90',
        contrastTextClass: 'text-white',
        hex: '#000000',
    },
    blue: {
        name: 'blue',
        label: 'Electric Blue',
        bgClass: 'bg-blue-500',
        ringClass: 'ring-blue-500/30',
        textClass: 'text-blue-400',
        hoverBgClass: 'hover:bg-blue-400',
        contrastTextClass: 'text-white',
        hex: '#3b82f6',
    },
    indigo: {
        name: 'indigo',
        label: 'Deep Indigo',
        bgClass: 'bg-indigo-500',
        ringClass: 'ring-indigo-500/30',
        textClass: 'text-indigo-400',
        hoverBgClass: 'hover:bg-indigo-400',
        contrastTextClass: 'text-white',
        hex: '#6366f1',
    },
    emerald: {
        name: 'emerald',
        label: 'Neon Emerald',
        bgClass: 'bg-emerald-500',
        ringClass: 'ring-emerald-500/30',
        textClass: 'text-emerald-400',
        hoverBgClass: 'hover:bg-emerald-400',
        contrastTextClass: 'text-white',
        hex: '#10b981',
    },
    cyan: {
        name: 'cyan',
        label: 'Electric Cyan',
        bgClass: 'bg-cyan-500',
        ringClass: 'ring-cyan-500/30',
        textClass: 'text-cyan-400',
        hoverBgClass: 'hover:bg-cyan-400',
        contrastTextClass: 'text-white',
        hex: '#06b6d4',
    },
    violet: {
        name: 'violet',
        label: 'Deep Violet',
        bgClass: 'bg-violet-500',
        ringClass: 'ring-violet-500/30',
        textClass: 'text-violet-400',
        hoverBgClass: 'hover:bg-violet-400',
        contrastTextClass: 'text-white',
        hex: '#8b5cf6',
    },
    fuchsia: {
        name: 'fuchsia',
        label: 'Vibrant Fuchsia',
        bgClass: 'bg-fuchsia-500',
        ringClass: 'ring-fuchsia-500/30',
        textClass: 'text-fuchsia-400',
        hoverBgClass: 'hover:bg-fuchsia-400',
        contrastTextClass: 'text-white',
        hex: '#d946ef',
    },
    rose: {
        name: 'rose',
        label: 'Vibrant Rose',
        bgClass: 'bg-rose-500',
        ringClass: 'ring-rose-500/30',
        textClass: 'text-rose-400',
        hoverBgClass: 'hover:bg-rose-400',
        contrastTextClass: 'text-white',
        hex: '#f43f5e',
    },
    orange: {
        name: 'orange',
        label: 'Sunset Orange',
        bgClass: 'bg-orange-500',
        ringClass: 'ring-orange-500/30',
        textClass: 'text-orange-400',
        hoverBgClass: 'hover:bg-orange-400',
        contrastTextClass: 'text-white',
        hex: '#f97316',
    },
    yellow: {
        name: 'yellow',
        label: 'Bright Yellow',
        bgClass: 'bg-yellow-500',
        ringClass: 'ring-yellow-500/30',
        textClass: 'text-yellow-400',
        hoverBgClass: 'hover:bg-yellow-400',
        contrastTextClass: 'text-white',
        hex: '#eab308',
    },
};

interface ThemeState {
    activeColorName: ThemeColorName;
    setThemeColor: (color: ThemeColorName) => void;
    getActiveColorDef: () => ThemeColorDef;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set, get) => ({
            activeColorName: 'white', // Default minimalist theme
            setThemeColor: (color) => set({ activeColorName: color }),
            getActiveColorDef: () => THEME_COLORS[get().activeColorName],
        }),
        {
            name: 'fileswift-workspace-theme', // Key for localStorage
            partialize: (state) => ({ activeColorName: state.activeColorName }), // Only persist the color name
        }
    )
);
