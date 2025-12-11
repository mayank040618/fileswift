import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '@/utils/canvasUtils';
import { X, Check, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';

interface ImageEditorModalProps {
    imageSrc: string;
    isOpen: boolean;
    onClose: () => void;
    onSave: (croppedImageBlob: Blob) => void;
}

export const ImageEditorModal: React.FC<ImageEditorModalProps> = ({ imageSrc, isOpen, onClose, onSave }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [rotation, setRotation] = useState(0);
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null); // eslint-disable-line

    const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => { // eslint-disable-line
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleSave = async () => {
        try {
            const croppedImage = await getCroppedImg(
                imageSrc,
                croppedAreaPixels,
                rotation
            );
            if (croppedImage) {
                onSave(croppedImage);
            }
        } catch (e) {
            console.error(e);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl h-[80vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl animate-in zoom-in duration-200">
                {/* Header */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 z-10">
                    <h3 className="font-bold text-lg dark:text-white">Edit Image</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
                        <X size={20} />
                    </button>
                </div>

                {/* Cropper Area */}
                <div className="relative flex-1 bg-slate-100 dark:bg-black/50 overflow-hidden">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        rotation={rotation}
                        zoom={zoom}
                        aspect={undefined} // Free crop
                        onCropChange={setCrop}
                        onRotationChange={setRotation}
                        onCropComplete={onCropComplete}
                        onZoomChange={setZoom}
                        classes={{
                            containerClassName: "bg-transparent",
                            mediaClassName: "",
                        }}
                    />
                </div>

                {/* Controls */}
                <div className="p-4 bg-white dark:bg-slate-900 space-y-4 border-t border-slate-200 dark:border-slate-800 z-10">

                    {/* Zoom & Rotation Controls */}
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                        {/* Zoom */}
                        <div className="flex items-center gap-2 w-full sm:w-1/2">
                            <ZoomOut size={16} className="text-slate-400" />
                            <input
                                type="range"
                                value={zoom}
                                min={1}
                                max={3}
                                step={0.1}
                                aria-labelledby="Zoom"
                                onChange={(e) => setZoom(Number(e.target.value))}
                                className="w-full accent-blue-600 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                            />
                            <ZoomIn size={16} className="text-slate-400" />
                        </div>

                        {/* Rotate */}
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <span className="text-xs text-slate-500 w-12 text-right">{rotation}°</span>
                            <button
                                onClick={() => setRotation((r) => r + 90)}
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
