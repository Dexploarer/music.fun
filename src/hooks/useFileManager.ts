import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { storageService, FileUploadOptions, UploadResult } from '../lib/supabase/storage';
import { supabase } from '../lib/supabase';

export interface FileItem {
  id: string;
  name: string;
  path: string;
  size: number;
  mimeType: string;
  bucket: string;
  uploadedAt: string;
  uploadedBy?: string;
  publicUrl?: string;
  description?: string;
  tags?: string[];
  isPublic?: boolean;
  downloadCount?: number;
  category?: string;
  version?: number;
}

export const useFileManager = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFiles = useCallback(async (bucket?: string) => {
    setLoading(true);
    try {
      let query = supabase
        .from('file_metadata')
        .select('*')
        .is('deleted_at', null)
        .order('uploaded_at', { ascending: false });

      if (bucket) {
        query = query.eq('bucket', bucket);
      }

      const { data, error: queryError } = await query;

      if (queryError) throw queryError;

      const filesWithUrls: FileItem[] = data?.map(file => ({
        id: file.id,
        name: file.file_name,
        path: file.path,
        size: file.file_size,
        mimeType: file.mime_type,
        bucket: file.bucket,
        uploadedAt: file.uploaded_at,
        uploadedBy: file.uploaded_by,
        publicUrl: storageService.getPublicUrl(file.bucket, file.path),
        description: file.description,
        tags: file.tags,
        isPublic: file.is_public,
        downloadCount: file.download_count,
        category: file.category,
        version: file.version
      })) || [];

      setFiles(filesWithUrls);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadFile = useCallback(async (file: File, options: FileUploadOptions): Promise<UploadResult> => {
    setUploading(true);
    try {
      const result = await storageService.uploadFile(file, options);
      if (result.success) {
        await loadFiles();
        toast.success('File uploaded successfully');
      }
      return result;
    } catch (err: any) {
      toast.error('Upload failed');
      return { success: false, error: err.message };
    } finally {
      setUploading(false);
    }
  }, [loadFiles]);

  const deleteFile = useCallback(async (file: FileItem): Promise<boolean> => {
    try {
      const result = await storageService.deleteFile(file.bucket, file.path);
      if (result.success) {
        setFiles(prev => prev.filter(f => f.id !== file.id));
        toast.success('File deleted successfully');
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error('Delete failed');
      return false;
    }
  }, []);

  const downloadFile = useCallback(async (file: FileItem): Promise<void> => {
    try {
      const result = await storageService.downloadFile(file.bucket, file.path);
      if (result.success && result.data) {
        const url = URL.createObjectURL(result.data);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('File downloaded');
      }
    } catch (err: any) {
      toast.error('Download failed');
    }
  }, []);

  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  return {
    files,
    loading,
    uploading,
    error,
    loadFiles,
    uploadFile,
    deleteFile,
    downloadFile,
    formatFileSize
  };
};

export default useFileManager; 