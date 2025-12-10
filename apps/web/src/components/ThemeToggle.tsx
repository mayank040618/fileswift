'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Icons } from './Icons';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    return (
        <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle Theme"
        >
            {theme === 'dark' ? (
                <Icons.Sun className="w-5 h-5 text-slate-400 hover:text-amber-400 transition-colors" />
            ) : (
                <Icons.Moon className="w-5 h-5 text-slate-600 hover:text-blue-600 transition-colors" />
            )}
        </button>
    );
}
