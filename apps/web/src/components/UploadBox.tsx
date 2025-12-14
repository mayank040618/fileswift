'use client';

import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud } from 'lucide-react';

interface UploadBoxProps {
    onFileSelect: (file: File) => void;
    accept?: Record<string, string[]>;
}

export function UploadBox({ onFileSelect, accept }: UploadBoxProps) {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            onFileSelect(acceptedFiles[0]);
        }
    }, [onFileSelect]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept,
        maxFiles: parseInt(process.env.NEXT_PUBLIC_MAX_UPLOAD_FILES || '1'),
        maxSize: 100 * 1024 * 1024, // 100MB
    });

    return (
        <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'}
      `}
        >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center space-y-4">
                <div className="p-4 bg-blue-100 rounded-full text-blue-600">
                    <UploadCloud size={32} />
                </div>
                <div className="space-y-1">
                    <p className="text-lg font-semibold text-slate-900">
                        {isDragActive ? 'Drop your file here' : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-sm text-slate-500">
                        PDF, JPG, PNG (Max 100MB)
                    </p>
                </div>
            </div>
        </div>
    );
}
