import React, { useCallback, useState } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { filesToPayload, type FilePayload } from '@/lib/fileUtils';

interface FileUploadProps {
    onUploadComplete: (payload: FilePayload) => void;
}

export function FileUpload({ onUploadComplete }: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const onDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleFile = async (file: File) => {
        setIsUploading(true);
        try {
            const payloads = await filesToPayload([file]);
            if (payloads.length > 0) {
                onUploadComplete(payloads[0]);
            }
        } catch (err) {
            console.error('Upload error:', err);
        } finally {
            setIsUploading(false);
        }
    };

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            handleFile(files[0]);
        }
    }, [handleFile]);

    const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 h-full bg-slate-50/50 dark:bg-[#0A0A0A]/50">
            <div className="max-w-2xl w-full text-center space-y-6">
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Upload a Document
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400">
                        Chat, summarize, and extract insights from your PDFs, DOCX, and images instantly.
                    </p>
                </div>

                <motion.div 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`
                        relative w-full aspect-video rounded-3xl border-2 border-dashed flex flex-col items-center justify-center p-8 transition-colors cursor-pointer overflow-hidden
                        \${isDragging 
                            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-500/10' 
                            : 'border-slate-300 dark:border-white/20 hover:border-slate-400 dark:hover:border-white/40 bg-white dark:bg-[#111] hover:bg-slate-50 dark:hover:bg-white/5'}
                    `}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    onClick={() => document.getElementById('file-upload')?.click()}
                >
                    <input 
                        type="file" 
                        id="file-upload" 
                        title="Upload Document"
                        aria-label="Upload Document"
                        className="hidden" 
                        accept=".pdf,.docx,.png,.jpg,.jpeg"
                        onChange={onFileSelect}
                        disabled={isUploading}
                    />

                    {isUploading ? (
                        <div className="flex flex-col items-center space-y-4">
                            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Uploading and processing document...</p>
                        </div>
                    ) : (
                        <>
                            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-6 border border-slate-200 dark:border-white/10 shadow-sm">
                                <UploadCloud className="w-8 h-8 text-blue-500" />
                            </div>
                            
                            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                                Click to upload or drag & drop
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-8">
                                Secure local processing. Files are encrypted and never stored permanently without permission.
                            </p>

                            <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                                    <FileText size={14} /> PDF
                                </span>
                                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                                    <FileText size={14} /> DOCX
                                </span>
                                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                                    <ImageIcon size={14} /> IMAGES
                                </span>
                            </div>
                        </>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
