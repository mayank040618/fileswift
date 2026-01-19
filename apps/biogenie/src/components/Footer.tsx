export function Footer() {
    return (
        <footer>
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🧞</span>
                        <span className="text-lg font-bold gradient-text">BioGenie</span>
                    </div>

                    <p className="text-sm">
                        Made with 💜 for creators everywhere
                    </p>

                    <div className="flex gap-4 text-sm">
                        <a href="/privacy" className="hover:text-purple-400 transition-colors">Privacy</a>
                        <a href="/terms" className="hover:text-purple-400 transition-colors">Terms</a>
                        <a href="/about" className="hover:text-purple-400 transition-colors">About</a>
                    </div>
                </div>

                <p className="text-center text-xs mt-6 text-gray-500">
                    © {new Date().getFullYear()} BioGenie. Free forever.
                </p>
            </div>
        </footer>
    );
}
