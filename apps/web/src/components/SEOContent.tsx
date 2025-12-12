import { FileText, Image, Lock, Zap } from 'lucide-react';

export function SEOContent() {
    return (
        <section className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                        Free Online File Tools for Everyone
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        FileSwift is your all-in-one solution for PDF compression, conversion, and image editing.
                        Secure, fast, and completely free to use.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12">
                    {/* PDF Tools Section */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                <FileText size={24} />
                            </div>
                            <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">How to Compress PDF Files?</h3>
                        </div>
                        <div className="prose dark:prose-invert text-slate-600 dark:text-slate-400">
                            <p>
                                Reduce the size of your PDF documents without losing quality. Our <strong>online PDF compressor</strong> is perfect for sharing large files via email.
                            </p>
                            <ol className="list-decimal pl-5 space-y-2 mt-4">
                                <li>Select the <strong>Compress PDF</strong> tool from the dashboard.</li>
                                <li>Upload your PDF file (up to 50MB for free users).</li>
                                <li>Wait for our AI-powered engine to optimize the file.</li>
                                <li>Download your smaller, high-quality PDF instantly.</li>
                            </ol>
                        </div>
                    </div>

                    {/* Image Tools Section */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                                <Image size={24} />
                            </div>
                            <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">Convert Images & PDF</h3>
                        </div>
                        <div className="prose dark:prose-invert text-slate-600 dark:text-slate-400">
                            <p>
                                Need to change file formats? Use our <strong>Image Converter</strong> or <strong>Word to PDF</strong> tools for fast results.
                            </p>
                            <ol className="list-decimal pl-5 space-y-2 mt-4">
                                <li>Choose <strong>Word to PDF</strong> or <strong>Image Converter</strong>.</li>
                                <li>Drag and drop your DOC, DOCX, PNG, or JPG files.</li>
                                <li>Select your desired output format (like WEBP or PDF).</li>
                                <li>Click convert and download your files in seconds.</li>
                            </ol>
                        </div>
                    </div>
                </div>

                {/* Features / Benefits */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 pt-16 border-t border-slate-100 dark:border-slate-800">
                    <div className="text-center">
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <Lock size={24} />
                        </div>
                        <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">100% Secure</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Your files are encrypted and automatically deleted from our servers after 1 hour.
                        </p>
                    </div>
                    <div className="text-center">
                        <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <Zap size={24} />
                        </div>
                        <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Lightning Fast</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Powered by advanced algorithms to process your documents in milliseconds.
                        </p>
                    </div>
                    <div className="text-center">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <FileText size={24} />
                        </div>
                        <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">High Quality</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            We maintain the highest resolution for your images and document clarity.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
