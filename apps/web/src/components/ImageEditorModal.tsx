import React, { useState, useRef } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { getCroppedImg } from '@/utils/canvasUtils';
import { X, Check, RotateCw } from 'lucide-react';

interface ImageEditorModalProps {
    imageSrc: string;
    isOpen: boolean;
    onClose: () => void;
    onSave: (croppedImageBlob: Blob) => void;
}

// Helper to center the crop initially
function centerAspectCrop(
    mediaWidth: number,
    mediaHeight: number,
    aspect?: number,
) {
    return centerCrop(
        makeAspectCrop(
            {
                unit: '%',
                width: 90,
            },
            aspect || 16 / 9,
            mediaWidth,
            mediaHeight,
        ),
        mediaWidth,
        mediaHeight,
    )
}

export const ImageEditorModal: React.FC<ImageEditorModalProps> = ({ imageSrc, isOpen, onClose, onSave }) => {
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
    const [rotation, setRotation] = useState(0);
    const imgRef = useRef<HTMLImageElement>(null);

    // Initial Crop when image loads
    function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
        const { width, height } = e.currentTarget;
        setCrop(centerAspectCrop(width, height));
    }

    const handleSave = async () => {
        if (completedCrop && imgRef.current) {
            try {
                // We need to account for the image scaling (displayed vs natural)
                const image = imgRef.current;
                const scaleX = image.naturalWidth / image.width;
                const scaleY = image.naturalHeight / image.height;

                const pixelCrop = {
                    x: completedCrop.x * scaleX,
                    y: completedCrop.y * scaleY,
                    width: completedCrop.width * scaleX,
                    height: completedCrop.height * scaleY,
                };

                const croppedImage = await getCroppedImg(
                    imageSrc,
                    pixelCrop,
                    rotation
                );
                if (croppedImage) {
                    onSave(croppedImage);
                }
            } catch (e) {
                console.error(e);
            }
        } else {
            // If no crop, just save original (maybe rotated?)
            // For now, require crop or just save original
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl h-[85vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl animate-in zoom-in duration-200">
                {/* Header */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 z-10">
                    <h3 className="font-bold text-lg dark:text-white">Edit Image</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
                        <X size={20} />
                    </button>
                </div>

                {/* Cropper Area */}
                <div className="relative flex-1 bg-slate-100 dark:bg-black/50 overflow-auto flex items-center justify-center p-4">
                    <ReactCrop
                        crop={crop}
                        onChange={(_, percentCrop) => setCrop(percentCrop)}
                        onComplete={(c) => setCompletedCrop(c)}
                        className="max-h-full"
                    >
                        <img
                            ref={imgRef}
                            src={imageSrc}
                            alt="Edit"
                            onLoad={onImageLoad}
                            style={{
                                transform: `rotate(${rotation}deg)`,
                                maxHeight: '60vh',
                                maxWidth: '100%',
                                objectFit: 'contain'
                            }}
                        />
                    </ReactCrop>
                </div>

                {/* Controls */}
                <div className="p-4 bg-white dark:bg-slate-900 space-y-4 border-t border-slate-200 dark:border-slate-800 z-10">

                    {/* Rotation Controls */}
                    <div className="flex justify-center">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 w-12 text-right">{rotation}°</span>
                            <button
                                onClick={() => setRotation((r) => (r + 90) % 360)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                <RotateCw size={16} />
                                <span>Rotate</span>
                            </button>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                        >
                            <Check size={20} />
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
