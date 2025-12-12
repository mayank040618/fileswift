import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';

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
                    <ThemeToggle />
                </nav>
            </div>
        </header>
    );
}
