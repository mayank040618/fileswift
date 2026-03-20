'use client';

import React, { useState, useEffect } from 'react';
import { FileText, ZoomIn, ZoomOut, Download, MoreVertical, ChevronLeft, ChevronRight, FileWarning } from 'lucide-react';

interface DocumentViewerProps {
    fileName: string;
    fileUrl: string | null;
    totalPages?: number;
}

export function DocumentViewer({ fileName, fileUrl, totalPages = 1 }: DocumentViewerProps) {
    const [isImage, setIsImage] = useState(false);
    const [isPdf, setIsPdf] = useState(false);

    useEffect(() => {
        if (!fileName) return;
        const ext = fileName.split('.').pop()?.toLowerCase();
        setIsImage(['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || ''));
        setIsPdf(ext === 'pdf');
    }, [fileName]);

    if (!fileUrl) return null;

    return (
        <div className="flex-1 flex flex-col h-full bg-slate-100 dark:bg-[#0A0A0A] border-r border-slate-200 dark:border-white/10 relative z-10 w-1/2 overflow-hidden">
            {/* Toolbar */}
            <div className="h-14 flex items-center justify-between px-4 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#111] z-20 shadow-sm flex-shrink-0">
                <div className="flex items-center gap-3 overflow-hidden pr-4">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0 text-blue-600 dark:text-blue-400">
                        <FileText size={16} />
                    </div>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">{fileName}</span>
                </div>
                
                <div className="flex items-center gap-1">
                    <div className="hidden sm:flex items-center bg-slate-100 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10 p-0.5">
                        <button title="Zoom Out" aria-label="Zoom Out" className="p-1.5 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/10 transition-colors">
                            <ZoomOut size={16} />
                        </button>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400 px-3 min-w-[3rem] text-center">Fit</span>
                        <button title="Zoom In" aria-label="Zoom In" className="p-1.5 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/10 transition-colors">
                            <ZoomIn size={16} />
                        </button>
                    </div>
                    
                    <div className="hidden sm:block w-px h-6 bg-slate-200 dark:bg-white/10 mx-2" />
                    
                    <a 
                        href={fileUrl} 
                        download={fileName}
                        title="Download" 
                        className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                    >
                        <Download size={18} />
                    </a>
                    <button title="More Options" aria-label="More Options" className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors ml-1">
                        <MoreVertical size={18} />
                    </button>
                </div>
            </div>

            {/* Viewer Area */}
            <div className="flex-1 overflow-hidden relative flex justify-center bg-slate-200/50 dark:bg-black/20">
                {/* Background grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
                
                <div className="w-full h-full flex items-center justify-center p-4 relative z-10">
                    {isImage ? (
                        <div className="max-w-full max-h-full overflow-auto flex items-center justify-center p-4">
                            <img 
                                src={fileUrl} 
                                alt={fileName} 
                                className="max-w-full h-auto shadow-2xl rounded-sm border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111]"
                            />
                        </div>
                    ) : isPdf ? (
                        <div className="w-full h-full flex flex-col items-center">
                            <iframe 
                                src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                                className="w-full h-full border-none shadow-2xl rounded-sm bg-white dark:bg-[#111]"
                                title="Document Preview"
                            />
                            {/* Fallback for browsers that block iframe blobs or don't render them well */}
                            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-[#111]/90 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200 dark:border-white/10 text-[10px] text-slate-500 pointer-events-none opacity-50">
                                Native PDF Viewer Active
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center p-12 space-y-4">
                            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center border border-slate-200 dark:border-white/10 shadow-sm">
                                <FileWarning className="w-8 h-8 text-amber-500" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-semibold text-slate-900 dark:text-white">Preview unavailable</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    We can't preview this file type directly, but our AI can still analyze it.
                                </p>
                            </div>
                            <a 
                                href={fileUrl} 
                                download={fileName}
                                className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600 transition-colors"
                            >
                                Download to view
                            </a>
                        </div>
                    )}
                </div>
            </div>

            {/* Floating Pagination - Only show if PDF and we want custom controls later */}
            {isPdf && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center bg-white/90 dark:bg-[#111]/90 backdrop-blur-md border border-slate-200 dark:border-white/10 p-1 rounded-xl shadow-lg z-20">
                    <button title="Previous Page" aria-label="Previous Page" className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                    <span className="px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                        1 / {totalPages}
                    </span>
                    <button title="Next Page" aria-label="Next Page" className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                        <ChevronRight size={20} />
                    </button>
                </div>
            )}
        </div>
    );
}
