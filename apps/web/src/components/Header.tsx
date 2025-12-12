import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import { Icons } from './Icons';

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center">
                    <Link href="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        FileSwift
                    </Link>
                </div>
                <nav className="flex items-center space-x-6">
                    <Link href="/#tools" className="text-sm font-medium text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400">
                        Tools
                    </Link>
                    <Link href="/privacy-policy" className="text-sm font-medium text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400">
                        Privacy
                    </Link>
                    <a
                        href="https://buymeacoffee.com/yourusername"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors"
                    >
                        <Icons.Coffee size={14} />
                        Donate
                    </a>
                    <ThemeToggle />
                </nav>
            </div>
        </header>
    );
}
