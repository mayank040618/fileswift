import Link from 'next/link';
import { ArrowRight, GraduationCap, Briefcase, Camera, Users } from 'lucide-react';

export const metadata = {
    title: 'FileSwift Use Cases - Solutions for Students, Professionals & Creators',
    description: 'Discover how FileSwift helps students, office workers, content creators, and remote teams manage files efficiently for free.',
};

export default function UseCases() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-20 px-4">
            <div className="max-w-4xl mx-auto space-y-16">

                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                        Solutions for Everyone
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        FileSwift provides free, secure tools tailored to solve specific problems for different users. Find the right tools for your workflow.
                    </p>
                </div>

                {/* Use Case: Students */}
                <section id="students" className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                            <GraduationCap size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">FileSwift for Students</h2>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                        Managing assignments and research papers shouldn&apos;t be hard. FileSwift helps students submit work on time and in the correct format without needing expensive software.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Link href="/tools/compress-pdf" className="group flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                            <div>
                                <h3 className="font-semibold text-slate-900 dark:text-white">Compress Assignments</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Reduce file size for submissions</p>
                            </div>
                            <ArrowRight size={18} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                        </Link>
                        <Link href="/tools/pdf-to-word" className="group flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                            <div>
                                <h3 className="font-semibold text-slate-900 dark:text-white">Edit Research Papers</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Extract text from PDFs</p>
                            </div>
                            <ArrowRight size={18} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                        </Link>
                        <Link href="/tools/merge-pdf" className="group flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                            <div>
                                <h3 className="font-semibold text-slate-900 dark:text-white">Combine Chapters</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Merge notes into one PDF</p>
                            </div>
                            <ArrowRight size={18} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                        </Link>
                        <Link href="/tools/image-to-pdf" className="group flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                            <div>
                                <h3 className="font-semibold text-slate-900 dark:text-white">Scan to PDF</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Turn photos of notes into PDF</p>
                            </div>
                            <ArrowRight size={18} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                        </Link>
                    </div>
                </section>

                {/* Use Case: Office */}
                <section id="office" className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                            <Briefcase size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">FileSwift for Office & Work</h2>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                        Streamline your administrative tasks. FileSwift makes it easy to handle contracts, invoices, and reports securely and efficiently.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Link href="/tools/pdf-to-word" className="group flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
                            <div>
                                <h3 className="font-semibold text-slate-900 dark:text-white">Convert Contracts</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Edit locked PDF agreements</p>
                            </div>
                            <ArrowRight size={18} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                        </Link>
                        <Link href="/tools/merge-pdf" className="group flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
                            <div>
                                <h3 className="font-semibold text-slate-900 dark:text-white">Organize Reports</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Combine monthly invoices</p>
                            </div>
                            <ArrowRight size={18} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                        </Link>
                        <Link href="/tools/compress-pdf" className="group flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
                            <div>
                                <h3 className="font-semibold text-slate-900 dark:text-white">Email Large Files</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Send big docs without bounce</p>
                            </div>
                            <ArrowRight size={18} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                        </Link>
                        <Link href="/tools/doc-to-pdf" className="group flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
                            <div>
                                <h3 className="font-semibold text-slate-900 dark:text-white">Finalize Docs</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Save Word as secure PDF</p>
                            </div>
                            <ArrowRight size={18} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                        </Link>
                    </div>
                </section>

                {/* Use Case: Creators */}
                <section id="creators" className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-xl text-pink-600 dark:text-pink-400">
                            <Camera size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">FileSwift for Creators</h2>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                        Your visuals need to be perfect. FileSwift helps photographers, designers, and social media managers prepare assets for the web and print.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Link href="/tools/image-resizer" className="group flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors">
                            <div>
                                <h3 className="font-semibold text-slate-900 dark:text-white">Resize for Social</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Perfect dimensions for IG/Twitter</p>
                            </div>
                            <ArrowRight size={18} className="text-slate-400 group-hover:text-pink-500 transition-colors" />
                        </Link>
                        <Link href="/tools/image-compressor" className="group flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors">
                            <div>
                                <h3 className="font-semibold text-slate-900 dark:text-white">Optimize Portfolio</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Fast loading web images</p>
                            </div>
                            <ArrowRight size={18} className="text-slate-400 group-hover:text-pink-500 transition-colors" />
                        </Link>
                        <Link href="/tools/image-to-pdf" className="group flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors">
                            <div>
                                <h3 className="font-semibold text-slate-900 dark:text-white">Create Lookbooks</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Combine photos into PDF</p>
                            </div>
                            <ArrowRight size={18} className="text-slate-400 group-hover:text-pink-500 transition-colors" />
                        </Link>
                        <Link href="/tools/bulk-image-resizer" className="group flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors">
                            <div>
                                <h3 className="font-semibold text-slate-900 dark:text-white">Bulk Resize</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Process 50+ photos at once</p>
                            </div>
                            <ArrowRight size={18} className="text-slate-400 group-hover:text-pink-500 transition-colors" />
                        </Link>
                    </div>
                </section>

                {/* Use Case: Teams */}
                <section id="teams" className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl text-green-600 dark:text-green-400">
                            <Users size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">FileSwift for Remote Teams</h2>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                        Collaborate better without the hassle. FileSwift provides instant, installation-free tools that work on every team member&apos;s device.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Link href="/tools/compress-pdf" className="group flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
                            <div>
                                <h3 className="font-semibold text-slate-900 dark:text-white">Share Faster</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Smaller files for Slack/Teams</p>
                            </div>
                            <ArrowRight size={18} className="text-slate-400 group-hover:text-green-500 transition-colors" />
                        </Link>
                        <Link href="/tools/rotate-pdf" className="group flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
                            <div>
                                <h3 className="font-semibold text-slate-900 dark:text-white">Fix Scans</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Correct upside-down docs</p>
                            </div>
                            <ArrowRight size={18} className="text-slate-400 group-hover:text-green-500 transition-colors" />
                        </Link>
                    </div>
                </section>

            </div>
        </div>
    );
}
