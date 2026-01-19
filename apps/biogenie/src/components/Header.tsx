'use client';

import Link from 'next/link';

export function Header() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-black/20 border-b border-white/5">
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <span className="text-2xl">🧞</span>
                    <span className="text-xl font-bold gradient-text">BioGenie</span>
                </Link>

                {/* Navigation */}
                <nav className="hidden md:flex items-center gap-6">
                    <a href="#features" className="text-gray-400 hover:text-white transition-colors text-sm">
                        Features
                    </a>
                    <a href="#faq" className="text-gray-400 hover:text-white transition-colors text-sm">
                        FAQ
                    </a>
                </nav>

                {/* CTA */}
                <a
                    href="#generator"
                    className="btn-primary !py-2 !px-4 text-sm"
                >
                    Try Free ✨
                </a>
            </div>
        </header>
    );
}
