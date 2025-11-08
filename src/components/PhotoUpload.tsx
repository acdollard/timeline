import React, { useRef, useState, useCallback, useEffect } from 'react';
import { compressImage, type CompressionOptions } from '../utils/imageCompression';

interface PhotoUploadProps {
  photos: File[];
  onPhotosChange: (photos: File[]) => void;
  maxPhotos?: number;
  maxFileSize?: number; // in bytes, default 10MB
  compressionOptions?: CompressionOptions;
  onCompressingChange?: (isCompressing: boolean) => void;
}

interface PhotoPreview {
  file: File;
  preview: string;
  id: string;
}

const PhotoUpload = ({ 
  photos, 
  onPhotosChange, 
  maxPhotos = 10,
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  compressionOptions,
  onCompressingChange
}: PhotoUploadProps) => {
  const [previews, setPreviews] = useState<PhotoPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  useEffect(() => {
    if (onCompressingChange) {
      onCompressingChange(isCompressing);
    }
  }, [isCompressing, onCompressingChange]);

  // Convert File objects to previews
  React.useEffect(() => {
    const newPreviews = photos.map((file, index) => ({
      file,
      preview: URL.createObjectURL(file),
      id: `${file.name}-${file.size}-${index}`
    }));

    setPreviews(newPreviews);

    // Cleanup: revoke object URLs when component unmounts or photos change
    return () => {
      newPreviews.forEach(preview => URL.revokeObjectURL(preview.preview));
    };
  }, [photos]);

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return 'Please upload only image files';
    }

    // Check file size
    if (file.size > maxFileSize) {
      const maxSizeMB = (maxFileSize / (1024 * 1024)).toFixed(1);
      return `File size must be less than ${maxSizeMB}MB`;
    }

    return null;
  };

  const addPhotos = useCallback(async (newFiles: File[]) => {
    setError(null);

    if (photos.length + newFiles.length > maxPhotos) {
      setError(`You can only upload up to ${maxPhotos} photos`);
      return;
    }

    try {
      setIsCompressing(true);

      const compressedFiles: File[] = [];
      for (const file of newFiles) {
        let processedFile = file;
        const validationError = validateFile(file);
        if (validationError) {
          setError(validationError);
          continue;
        }

        if (file.size > 300 * 1024 || file.size > maxFileSize) {
          processedFile = await compressImage(file, {
            maxOutputSizeBytes: Math.min(maxFileSize * 0.9, maxFileSize),
            ...compressionOptions
          });
        }

        const postCompressionError = validateFile(processedFile);
        if (postCompressionError) {
          setError(postCompressionError);
          continue;
        }

        compressedFiles.push(processedFile);
      }

      if (compressedFiles.length > 0) {
        onPhotosChange([...photos, ...compressedFiles]);
      }
    } catch (compressionError) {
      console.error('Failed to compress images:', compressionError);
      setError('Failed to optimize images. Please try again or use smaller files.');
    } finally {
      setIsCompressing(false);
    }
  }, [photos, onPhotosChange, maxPhotos, maxFileSize, compressionOptions]);

  const removePhoto = (index: number) => {
    if (isCompressing) return;
    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);
    setError(null);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isCompressing) return;
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      await addPhotos(files);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (isCompressing) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (isCompressing) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    if (isCompressing) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await addPhotos(files);
    }
  };

  const handleClick = () => {
    if (isCompressing) return;
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-3">
      <label className="block text-white mb-1">Photos</label>
      
      {/* File Input (hidden) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Drag and Drop Area */}
      {photos.length < maxPhotos && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          aria-busy={isCompressing}
          aria-disabled={isCompressing}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center transition-colors relative
            ${isDragging 
              ? 'border-primary bg-primary/10' 
              : 'border-gray-600 hover:border-gray-500 bg-gray-700/50'
            }
            ${isCompressing ? 'opacity-70 pointer-events-none cursor-wait' : 'cursor-pointer'}
          `}
        >
          <div className="flex flex-col items-center space-y-2">
            <svg
              className="w-10 h-10 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-gray-300 text-sm">
              {isCompressing ? 'Optimizing images…' : 'Drag and drop photos here, or click to browse'}
            </p>
            <p className="text-gray-500 text-xs">
              {photos.length} / {maxPhotos} photos • Max {formatFileSize(maxFileSize)} per file
            </p>
          </div>
          {isCompressing && (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="animate-spin h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-200 px-3 py-2 rounded text-sm">
          {error}
        </div>
      )}

      {/* Photo Previews */}
      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {previews.map((preview, index) => (
            <div
              key={preview.id}
              className="relative group aspect-square rounded-lg overflow-hidden bg-gray-700"
            >
              <img
                src={preview.preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removePhoto(index)}
                disabled={isCompressing}
                className={`absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity ${isCompressing ? 'cursor-not-allowed opacity-60 group-hover:opacity-60' : ''}`}
                aria-label="Remove photo"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                {formatFileSize(preview.file.size)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;

