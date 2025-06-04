import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, File, Image, FileText, AlertCircle, Check, Shield } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';
import { storageService, FileUploadOptions, UploadResult } from '../../lib/supabase/storage';
import { useSecurityMiddleware } from '../../lib/security';
import { toast } from 'react-hot-toast';

interface FileUploadProps {
  options: FileUploadOptions;
  onUploadComplete?: (results: UploadResult[]) => void;
  onUploadProgress?: (progress: number) => void;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  showPreview?: boolean;
  maxFiles?: number;
}

interface FileWithPreview extends File {
  preview?: string;
  uploadProgress?: number;
  uploadStatus?: 'pending' | 'uploading' | 'success' | 'error';
  uploadResult?: UploadResult;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  options,
  onUploadComplete,
  onUploadProgress,
  multiple = false,
  disabled = false,
  className = '',
  showPreview = true,
  maxFiles = 10
}) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const securityMiddleware = useSecurityMiddleware();

  const addFiles = useCallback((newFiles: File[]) => {
    if (disabled || isUploading) return;

    const validFiles = newFiles.filter(file => {
      // Check file count limit
      if (!multiple && files.length > 0) {
        toast.error('Only one file is allowed');
        return false;
      }
      
      if (files.length + newFiles.length > maxFiles) {
        toast.error(`Maximum ${maxFiles} files allowed`);
        return false;
      }

      // Check if file already exists
      if (files.some(f => f.name === file.name && f.size === file.size)) {
        toast.error(`File "${file.name}" already added`);
        return false;
      }

      // Security validation
      const securityValidation = securityMiddleware.validateFileUpload(file);
      if (!securityValidation.valid) {
        securityValidation.errors.forEach(error => {
          toast.error(`Security validation failed for "${file.name}": ${error}`);
        });
        return false;
      }

      return true;
    });

    const filesWithPreview = validFiles.map(file => {
      const fileWithPreview = file as FileWithPreview;
      fileWithPreview.uploadStatus = 'pending';
      
      // Create preview for images
      if (storageService.isImageFile(file.type) && showPreview) {
        fileWithPreview.preview = URL.createObjectURL(file);
      }
      
      return fileWithPreview;
    });

    setFiles(prev => multiple ? [...prev, ...filesWithPreview] : filesWithPreview);
  }, [files, multiple, disabled, isUploading, maxFiles, showPreview]);

  const removeFile = useCallback((index: number) => {
    if (disabled || isUploading) return;

    setFiles(prev => {
      const newFiles = [...prev];
      const file = newFiles[index];
      
      // Revoke object URL to prevent memory leaks
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
      
      newFiles.splice(index, 1);
      return newFiles;
    });
  }, [disabled, isUploading]);

  const uploadFiles = useCallback(async () => {
    if (files.length === 0 || isUploading || disabled) return;

    setIsUploading(true);
    const results: UploadResult[] = [];
    let completedCount = 0;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Update file status to uploading
        setFiles(prev => {
          const newFiles = [...prev];
          newFiles[i].uploadStatus = 'uploading';
          newFiles[i].uploadProgress = 0;
          return newFiles;
        });

        // Upload file
        const result = await storageService.uploadFile(file, options);
        results.push(result);

        // Update file status based on result
        setFiles(prev => {
          const newFiles = [...prev];
          newFiles[i].uploadStatus = result.success ? 'success' : 'error';
          newFiles[i].uploadProgress = 100;
          newFiles[i].uploadResult = result;
          return newFiles;
        });

        completedCount++;
        
        // Update overall progress
        const progress = (completedCount / files.length) * 100;
        onUploadProgress?.(progress);

        if (!result.success) {
          toast.error(`Failed to upload ${file.name}: ${result.error}`);
        } else {
          toast.success(`Successfully uploaded ${file.name}`);
        }
      }

      // Call completion callback
      onUploadComplete?.(results);

      // Clear successful uploads after a delay
      setTimeout(() => {
        setFiles(prev => prev.filter(f => f.uploadStatus !== 'success'));
      }, 2000);

    } catch (error) {
      console.error('Upload error:', error);
      toast.error('An unexpected error occurred during upload');
    } finally {
      setIsUploading(false);
    }
  }, [files, isUploading, disabled, options, onUploadComplete, onUploadProgress]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  }, [disabled, isUploading]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled || isUploading) return;

    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  }, [disabled, isUploading, addFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    addFiles(selectedFiles);
    
    // Reset input value to allow selecting same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [addFiles]);

  const openFileDialog = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  const getFileIcon = (file: File) => {
    if (storageService.isImageFile(file.type)) return <Image className="w-6 h-6" />;
    if (storageService.isDocumentFile(file.type)) return <FileText className="w-6 h-6" />;
    return <File className="w-6 h-6" />;
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'success':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'uploading':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      default:
        return null;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`file-upload ${className}`}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={options.allowedTypes?.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {/* Drop zone */}
      <Card
        className={`
          relative border-2 border-dashed transition-colors duration-200 cursor-pointer
          ${isDragging ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-700'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-400'}
          ${isUploading ? 'pointer-events-none' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <div className="p-8 text-center">
          <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            {files.length === 0 ? 'Upload Files' : `${files.length} file(s) selected`}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Drag and drop files here, or click to select files
          </p>
          
          {/* File constraints */}
          <div className="text-xs text-gray-400 dark:text-gray-500 space-y-1">
            {options.allowedTypes && (
              <p>Allowed types: {options.allowedTypes.join(', ')}</p>
            )}
            {options.maxSize && (
              <p>Max size: {formatFileSize(options.maxSize)}</p>
            )}
            {multiple && (
              <p>Max files: {maxFiles}</p>
            )}
          </div>
        </div>
      </Card>

      {/* File list */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="font-medium text-gray-900 dark:text-gray-100">Selected Files</h4>
          
          {files.map((file, index) => (
            <Card key={`${file.name}-${file.size}-${index}`} className="p-4">
              <div className="flex items-center space-x-3">
                {/* File preview or icon */}
                <div className="flex-shrink-0">
                  {file.preview ? (
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                      {getFileIcon(file)}
                    </div>
                  )}
                </div>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(file.size)}
                  </p>
                  
                  {/* Upload progress */}
                  {file.uploadStatus === 'uploading' && file.uploadProgress !== undefined && (
                    <div className="mt-1">
                      <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${file.uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Error message */}
                  {file.uploadStatus === 'error' && file.uploadResult?.error && (
                    <p className="text-xs text-red-500 mt-1">{file.uploadResult.error}</p>
                  )}
                </div>

                {/* Status and actions */}
                <div className="flex items-center space-x-2">
                  {getStatusIcon(file.uploadStatus)}
                  
                  {file.uploadStatus === 'pending' && !isUploading && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      disabled={disabled}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Upload button */}
      {files.length > 0 && (
        <div className="mt-4 flex justify-end">
          <Button
            onClick={uploadFiles}
            disabled={isUploading || disabled || files.every(f => f.uploadStatus !== 'pending')}
            className="min-w-[120px]"
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Uploading...
              </>
            ) : (
              `Upload ${files.filter(f => f.uploadStatus === 'pending').length} file(s)`
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileUpload; 