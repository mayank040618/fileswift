'use client';

import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X, File as FileIcon, Image as ImageIcon } from 'lucide-react';


interface BulkUploaderProps {
    files: File[];
    onFilesChange: (files: File[]) => void;
    accept?: Record<string, string[]>;
    maxFiles?: number;
    maxSize?: number; // In bytes
}

export function BulkUploader({ files, onFilesChange, accept, maxFiles = 100, maxSize }: BulkUploaderProps) {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        const newFiles = [...files, ...acceptedFiles];
        // Enforce max files
        if (maxFiles && newFiles.length > maxFiles) {
            alert(`You can only upload up to ${maxFiles} files.`);
            return;
        }
        onFilesChange(newFiles.slice(0, maxFiles));
    }, [files, maxFiles, onFilesChange]);

    const removeFile = (index: number) => {
        const newFiles = [...files];
        newFiles.splice(index, 1);
        onFilesChange(newFiles);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept,
        maxFiles: maxFiles - files.length, // Limit remaining
        maxSize
    });

    return (
        <div className="w-full space-y-6">
            {/* Dropzone */}
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800'}
      `}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="p-4 bg-blue-100 dark:bg-blue-900/40 rounded-full text-blue-600 dark:text-blue-400">
                        <UploadCloud size={32} />
                    </div>
                    <div className="space-y-1">
                        <p className="text-lg font-semibold text-slate-900 dark:text-white">
                            {isDragActive ? 'Drop files here' : 'Click to upload or drag and drop'}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {maxFiles > 1 ? `Up to ${maxFiles} files` : 'Single file'} supported
                        </p>
                    </div>
                </div>
            </div>

            {/* File List */}
            {files.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                        <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                            Selected Files ({files.length})
                        </span>
                        <button
                            onClick={(e) => { e.stopPropagation(); onFilesChange([]); }}
                            className="text-xs text-red-500 hover:text-red-600 font-medium"
                        >
                            Clear All
                        </button>
                    </div>
                    <div className="max-h-60 overflow-y-auto p-2 space-y-2">
                        {files.map((file, idx) => (
                            <div key={`${file.name}-${idx}`} className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg group">
                                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center text-slate-500">
                                    {file.type.startsWith('image/') ? (
                                        <ImageIcon size={20} />
                                    ) : (
                                        <FileIcon size={20} />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                        {file.name}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                                    className="p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
