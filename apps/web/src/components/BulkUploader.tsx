'use client';

import React, { useCallback, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X, File as FileIcon, Image as ImageIcon, Camera, Pencil } from 'lucide-react';
import { ImageEditorModal } from './ImageEditorModal';

interface BulkUploaderProps {
    files: File[];
    onFilesChange: (files: File[]) => void;
    accept?: Record<string, string[]>;
    maxFiles?: number;
    maxSize?: number; // In bytes
}

export function BulkUploader({ files, onFilesChange, accept, maxFiles = 100, maxSize }: BulkUploaderProps) {
    const cameraInputRef = useRef<HTMLInputElement>(null);

    // Editor State
    const [editingFileIndex, setEditingFileIndex] = useState<number | null>(null);
    const [editorOpen, setEditorOpen] = useState(false);
    const [imageSrcForEdit, setImageSrcForEdit] = useState<string | null>(null);

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

    // Camera Handler
    const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFile = e.target.files[0];
            onDrop([newFile]);
        }
        // Reset input so same file can be selected again if needed
        if (cameraInputRef.current) {
            cameraInputRef.current.value = '';
        }
    };

    // Editor Handlers
    const startEditing = (index: number, file: File) => {
        if (!file.type.startsWith('image/')) return;

        const reader = new FileReader();
        reader.addEventListener('load', () => {
            setImageSrcForEdit(reader.result?.toString() || null);
            setEditingFileIndex(index);
            setEditorOpen(true);
        });
        reader.readAsDataURL(file);
    };

    const saveEditedImage = (croppedBlob: Blob) => {
        if (editingFileIndex === null) return;

        // Create new File from Blob
        const originalFile = files[editingFileIndex];
        const newFile = new File([croppedBlob], originalFile.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
        });

        // Replace in state
        const newFiles = [...files];
        newFiles[editingFileIndex] = newFile;
        onFilesChange(newFiles);

        // Close Editor
        setEditorOpen(false);
        setImageSrcForEdit(null);
        setEditingFileIndex(null);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept,
        maxFiles: maxFiles - files.length, // Limit remaining
        maxSize
    });

    const isImageMode = accept && Object.keys(accept).some(k => k.startsWith('image'));

    return (
        <div className="w-full space-y-6">
            {/* Action Buttons Area */}
            <div className="flex gap-4 flex-col sm:flex-row">
                {/* Standard Dropzone */}
                <div
                    {...getRootProps()}
                    className={`flex-1 border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors relative
            ${isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800'}
          `}
                >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-full text-blue-600 dark:text-blue-400">
                            <UploadCloud size={28} />
                        </div>
                        <div className="space-y-1">
                            <p className="font-semibold text-slate-900 dark:text-white">
                                {isDragActive ? 'Drop files here' : 'Select Files'}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                or drag and drop
                            </p>
                        </div>
                    </div>
                </div>

                {/* Camera Button (Only for Image Modes) */}
                {isImageMode && (
                    <div
                        onClick={() => cameraInputRef.current?.click()}
                        className="sm:w-1/3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 flex flex-col items-center justify-center space-y-3 transition-colors"
                    >
                        <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            className="hidden"
                            ref={cameraInputRef}
                            onChange={handleCameraCapture}
                        />
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/40 rounded-full text-purple-600 dark:text-purple-400">
                            <Camera size={28} />
                        </div>
                        <div className="space-y-1">
                            <p className="font-semibold text-slate-900 dark:text-white">
                                Camera
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Take a photo
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* File List */}
            {files.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in slide-in-from-bottom-2">
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
                    <div className="max-h-80 overflow-y-auto p-2 space-y-2">
                        {files.map((file, idx) => (
                            <div key={`${file.name}-${idx}`} className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg group transition-colors">
                                {/* Thumbnail */}
                                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center text-slate-500 overflow-hidden relative">
                                    {file.type.startsWith('image/') ? (
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt={file.name}
                                            className="w-full h-full object-cover"
                                            onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                                        />
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

                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {/* Edit Button (Images Only) */}
                                    {isImageMode && file.type.startsWith('image/') && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); startEditing(idx, file); }}
                                            className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full"
                                            title="Edit Image"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                    )}

                                    {/* Remove Button */}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full"
                                        title="Remove File"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Image Editor Modal */}
            {imageSrcForEdit && (
                <ImageEditorModal
                    isOpen={editorOpen}
                    imageSrc={imageSrcForEdit}
                    onClose={() => { setEditorOpen(false); setImageSrcForEdit(null); }}
                    onSave={saveEditedImage}
                />
            )}
        </div>
    );
}

