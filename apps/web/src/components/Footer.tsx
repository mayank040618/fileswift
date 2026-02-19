import Link from 'next/link';

export function Footer() {
    return (
        <footer className="bg-white border-t border-slate-200 dark:bg-slate-900 dark:border-slate-800 py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">
                            FileSwift
                        </Link>
                        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 max-w-xs">
                            Free, secure, and fast online file tools. Compress PDF, convert images, and more directly in your browser.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Tools</h4>
                        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                            <li><Link href="/tools/compress-pdf" className="hover:text-blue-600 transition-colors">Compress PDF</Link></li>
                            <li><Link href="/tools/pdf-to-word" className="hover:text-blue-600 transition-colors">PDF to Word</Link></li>
                            <li><Link href="/tools/image-resizer" className="hover:text-blue-600 transition-colors">Image Resizer</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Legal & Company</h4>
                        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                            <li><Link href="/about" className="hover:text-blue-600 transition-colors">About Us</Link></li>
                            <li><Link href="/contact" className="hover:text-blue-600 transition-colors">Contact</Link></li>
                            <li><Link href="/terms" className="hover:text-blue-600 transition-colors">Terms of Service</Link></li>
                            <li><Link href="/privacy-policy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 text-center text-sm text-slate-500">
                    &copy; {new Date().getFullYear()} FileSwift. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
