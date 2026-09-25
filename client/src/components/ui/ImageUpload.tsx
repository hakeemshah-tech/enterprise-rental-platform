'use client';

import React, { useCallback, useState } from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface ImageFile {
    file?: File;
    url: string;
    alt: string;
    preview?: string;
}

interface ImageUploadProps {
    label?: string;
    error?: string;
    value: ImageFile[];
    onChange: (images: ImageFile[]) => void;
    maxFiles?: number;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
    label,
    error,
    value = [],
    onChange,
    maxFiles = 10,
}) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleFiles = useCallback(
        (files: FileList | null) => {
            if (!files) return;
            const remaining = maxFiles - value.length;
            const newFiles = Array.from(files)
                .slice(0, remaining)
                .map((file) => ({
                    file,
                    url: '',
                    alt: file.name,
                    preview: URL.createObjectURL(file),
                }));
            onChange([...value, ...newFiles]);
        },
        [value, onChange, maxFiles]
    );

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
    };

    const removeImage = (index: number) => {
        const updated = [...value];
        const removed = updated.splice(index, 1)[0];
        if (removed.preview) URL.revokeObjectURL(removed.preview);
        onChange(updated);
    };

    return (
        <div className="space-y-2">
            {label && <label className="block text-sm font-medium text-slate-300">{label}</label>}

            {/* Drop zone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
          relative border-2 border-dashed rounded-xl p-6 text-center
          transition-all duration-300 cursor-pointer
          ${
              isDragging
                  ? 'border-amber-500 bg-amber-500/10'
                  : 'border-slate-700 hover:border-slate-500 bg-slate-800/30'
          }
          ${value.length >= maxFiles ? 'opacity-50 pointer-events-none' : ''}
        `}
                onClick={() => document.getElementById('image-upload-input')?.click()}
            >
                <input
                    id="image-upload-input"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                />
                <Upload className="w-8 h-8 mx-auto mb-2 text-slate-500" />
                <p className="text-sm text-slate-400">
                    Drag & drop images here or{' '}
                    <span className="text-amber-500 font-medium">click to browse</span>
                </p>
                <p className="text-xs text-slate-600 mt-1">
                    {value.length}/{maxFiles} images uploaded
                </p>
            </div>

            {/* Previews */}
            <AnimatePresence>
                {value.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-3">
                        {value.map((img, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="relative aspect-video rounded-lg overflow-hidden border border-slate-700 group"
                            >
                                {img.preview || img.url ? (
                                    <Image
                                        src={img.preview || img.url}
                                        alt={img.alt}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                                        <ImageIcon className="w-8 h-8 text-slate-600" />
                                    </div>
                                )}
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute top-1 right-1 p-1 bg-red-500/80 rounded-full
                    opacity-0 group-hover:opacity-100 transition-opacity duration-200
                    hover:bg-red-600"
                                >
                                    <X className="w-3 h-3 text-white" />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}
            </AnimatePresence>

            {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
    );
};

export default ImageUpload;
