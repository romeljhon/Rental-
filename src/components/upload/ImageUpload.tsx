/**
 * Image Upload Component
 * Handles file selection, preview, and upload with validation
 */

'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
    value?: string | string[];
    onChange: (urls: string | string[]) => void;
    multiple?: boolean;
    maxFiles?: number;
    maxSizeMB?: number;
    className?: string;
    onUpload?: (files: File[]) => Promise<string[]>;
    onFilesSelected?: (files: File[]) => void;
    disabled?: boolean;
}

export function ImageUpload({
    value,
    onChange,
    multiple = false,
    maxFiles = 5,
    maxSizeMB = 5,
    className,
    onUpload,
    onFilesSelected,
    disabled = false,
}: ImageUploadProps) {
    const [previews, setPreviews] = useState<string[]>(
        Array.isArray(value) ? value : value ? [value] : []
    );
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setError('');

        // Validate file count
        if (multiple && previews.length + files.length > maxFiles) {
            setError(`Maximum ${maxFiles} files allowed`);
            return;
        }

        // Validate file sizes
        const oversized = files.find(file => file.size > maxSizeMB * 1024 * 1024);
        if (oversized) {
            setError(`File size must be less than ${maxSizeMB}MB`);
            return;
        }

        // Validate file types
        const invalidType = files.find(file => !file.type.startsWith('image/'));
        if (invalidType) {
            setError('Only image files are allowed');
            return;
        }

        // Create previews
        const newPreviews = await Promise.all(
            files.map(file => {
                return new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(file);
                });
            })
        );

        const updatedPreviews = multiple ? [...previews, ...newPreviews] : [newPreviews[0]];
        setPreviews(updatedPreviews);

        // Handle upload if onUpload function is provided
        if (onUpload) {
            setIsUploading(true);
            try {
                const uploadedUrls = await onUpload(files);
                const finalUrls = multiple ? [...(Array.isArray(value) ? value : []), ...uploadedUrls] : uploadedUrls;
                onChange(multiple ? finalUrls : finalUrls[0]);
            } catch (err) {
                setError('Upload failed. Please try again.');
                setPreviews(previews); // Revert to previous state
            } finally {
                setIsUploading(false);
            }
        } else {
            // If no upload function, just use the data URLs
            onChange(multiple ? updatedPreviews : updatedPreviews[0]);
        }

        // Notify parent about selected files
        if (onFilesSelected) {
            onFilesSelected(files);
        }

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleRemove = (index: number) => {
        const newPreviews = previews.filter((_, i) => i !== index);
        setPreviews(newPreviews);
        onChange(multiple ? newPreviews : newPreviews[0] || '');
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className={cn('space-y-4', className)}>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple={multiple}
                onChange={handleFileSelect}
                className="hidden"
            />

            {/* Upload Button/Dropzone */}
            {(!previews.length || multiple) && (
                <button
                    type="button"
                    onClick={handleClick}
                    disabled={isUploading || (multiple && previews.length >= maxFiles) || disabled}
                    className={cn(
                        'w-full border-2 border-dashed border-primary/20 rounded-3xl p-8',
                        'hover:border-primary/40 hover:bg-primary/5 transition-all duration-300',
                        'flex flex-col items-center justify-center gap-3 cursor-pointer',
                        'disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                >
                    {isUploading ? (
                        <>
                            <Loader2 className="h-10 w-10 text-primary animate-spin" />
                            <p className="text-sm font-bold text-primary uppercase tracking-widest">
                                Uploading...
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="p-3 rounded-2xl bg-primary/10">
                                <Upload className="h-8 w-8 text-primary" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold text-foreground mb-1">
                                    {multiple ? 'Upload Images' : 'Upload Image'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Click to browse or drag and drop
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Max {maxSizeMB}MB {multiple && `• Up to ${maxFiles} files`}
                                </p>
                            </div>
                        </>
                    )}
                </button>
            )}

            {/* Error Message */}
            {error && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                    <p className="text-xs font-bold text-destructive">{error}</p>
                </div>
            )}

            {/* Preview Grid */}
            {previews.length > 0 && (
                <div className={cn(
                    'grid gap-4',
                    multiple ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1'
                )}>
                    {previews.map((preview, index) => (
                        <div
                            key={index}
                            className="relative group rounded-2xl overflow-hidden border-2 border-primary/10 aspect-square bg-muted"
                        >
                            <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                                <Button
                                    type="button"
                                    onClick={() => handleRemove(index)}
                                    size="icon"
                                    variant="destructive"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity rounded-full h-10 w-10"
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                            {!multiple && (
                                <div className="absolute bottom-3 left-3 right-3">
                                    <Button
                                        type="button"
                                        onClick={handleClick}
                                        size="sm"
                                        variant="secondary"
                                        className="w-full rounded-xl font-bold text-xs uppercase tracking-widest"
                                    >
                                        Change Image
                                    </Button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
