import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Trash2, 
  Eye, 
  Grid, 
  List, 
  Search, 
  Filter,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  File as FileIcon,
  Calendar,
  User,
  HardDrive
} from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';
import { storageService } from '../../lib/supabase/storage';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

interface FileItem {
  id: string;
  name: string;
  path: string;
  size: number;
  mimeType: string;
  bucket: string;
  uploadedAt: string;
  uploadedBy?: string;
  publicUrl?: string;
}

interface FileManagerProps {
  bucket?: 'documents' | 'images' | 'avatars' | 'attachments';
  folder?: string;
  onFileSelect?: (file: FileItem) => void;
  allowDelete?: boolean;
  allowDownload?: boolean;
  className?: string;
}

export const FileManager: React.FC<FileManagerProps> = ({
  bucket,
  folder,
  onFileSelect,
  allowDelete = true,
  allowDownload = true,
  className = ''
}) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'images' | 'documents' | 'other'>('all');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadFiles();
  }, [bucket, folder]);

  const loadFiles = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('file_metadata')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (bucket) {
        query = query.eq('bucket', bucket);
      }

      if (folder) {
        query = query.like('path', `${folder}/%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading files:', error);
        toast.error('Failed to load files');
        return;
      }

      const filesWithUrls = data?.map(file => ({
        id: file.id,
        name: file.file_name,
        path: file.path,
        size: file.file_size,
        mimeType: file.mime_type,
        bucket: file.bucket,
        uploadedAt: file.uploaded_at,
        uploadedBy: file.uploaded_by,
        publicUrl: storageService.getPublicUrl(file.bucket, file.path)
      })) || [];

      setFiles(filesWithUrls);
    } catch (error) {
      console.error('Error loading files:', error);
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (file: FileItem) => {
    if (!allowDelete) return;

    if (!confirm(`Are you sure you want to delete "${file.name}"?`)) {
      return;
    }

    try {
      const result = await storageService.deleteFile(file.bucket, file.path);
      
      if (result.success) {
        setFiles(prev => prev.filter(f => f.id !== file.id));
        setSelectedFiles(prev => {
          const newSelected = new Set(prev);
          newSelected.delete(file.id);
          return newSelected;
        });
        toast.success('File deleted successfully');
      } else {
        toast.error(result.error || 'Failed to delete file');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete file');
    }
  };

  const handleDownload = async (file: FileItem) => {
    if (!allowDownload) return;

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
      } else {
        toast.error(result.error || 'Failed to download file');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file');
    }
  };

  const handlePreview = (file: FileItem) => {
    if (storageService.isImageFile(file.mimeType)) {
      // Open image in new tab
      window.open(file.publicUrl, '_blank');
    } else if (file.mimeType === 'application/pdf') {
      // Open PDF in new tab
      window.open(file.publicUrl, '_blank');
    } else {
      toast.info('Preview not available for this file type');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedFiles.size === 0) return;

    if (!confirm(`Are you sure you want to delete ${selectedFiles.size} selected files?`)) {
      return;
    }

    const filesToDelete = files.filter(f => selectedFiles.has(f.id));
    let successCount = 0;
    let errorCount = 0;

    for (const file of filesToDelete) {
      try {
        const result = await storageService.deleteFile(file.bucket, file.path);
        if (result.success) {
          successCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        errorCount++;
      }
    }

    setFiles(prev => prev.filter(f => !selectedFiles.has(f.id)));
    setSelectedFiles(new Set());

    if (successCount > 0) {
      toast.success(`${successCount} files deleted successfully`);
    }
    if (errorCount > 0) {
      toast.error(`Failed to delete ${errorCount} files`);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <ImageIcon className="w-8 h-8" />;
    if (mimeType.startsWith('video/')) return <Video className="w-8 h-8" />;
    if (mimeType.startsWith('audio/')) return <Music className="w-8 h-8" />;
    if (storageService.isDocumentFile(mimeType)) return <FileText className="w-8 h-8" />;
    return <FileIcon className="w-8 h-8" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredFiles = files.filter(file => {
    // Search filter
    if (searchTerm && !file.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Type filter
    if (filterType !== 'all') {
      switch (filterType) {
        case 'images':
          return storageService.isImageFile(file.mimeType);
        case 'documents':
          return storageService.isDocumentFile(file.mimeType);
        case 'other':
          return !storageService.isImageFile(file.mimeType) && !storageService.isDocumentFile(file.mimeType);
      }
    }

    return true;
  });

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(fileId)) {
        newSelected.delete(fileId);
      } else {
        newSelected.add(fileId);
      }
      return newSelected;
    });
  };

  const selectAllFiles = () => {
    if (selectedFiles.size === filteredFiles.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(filteredFiles.map(f => f.id)));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={`file-manager ${className}`}>
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Files ({filteredFiles.length})
          </h3>
          
          {selectedFiles.size > 0 && allowDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete ({selectedFiles.size})
            </Button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Files</option>
            <option value="images">Images</option>
            <option value="documents">Documents</option>
            <option value="other">Other</option>
          </select>

          {/* View mode toggle */}
          <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-none"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Select all checkbox */}
      {filteredFiles.length > 0 && (
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="select-all"
            checked={selectedFiles.size === filteredFiles.length && filteredFiles.length > 0}
            onChange={selectAllFiles}
            className="mr-2"
          />
          <label htmlFor="select-all" className="text-sm text-gray-600 dark:text-gray-400">
            Select all files
          </label>
        </div>
      )}

      {/* Files display */}
      {filteredFiles.length === 0 ? (
        <Card className="p-12 text-center">
          <HardDrive className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No files found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm || filterType !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Upload some files to get started'
            }
          </p>
        </Card>
      ) : viewMode === 'grid' ? (
        // Grid view
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {filteredFiles.map((file) => (
            <Card key={file.id} className="p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <input
                  type="checkbox"
                  checked={selectedFiles.has(file.id)}
                  onChange={() => toggleFileSelection(file.id)}
                  className="flex-shrink-0"
                />
                <div className="flex space-x-1 ml-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePreview(file)}
                    title="Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  {allowDownload && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(file)}
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  )}
                  {allowDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(file)}
                      title="Delete"
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* File preview or icon */}
              <div 
                className="w-full h-32 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-3 cursor-pointer"
                onClick={() => onFileSelect?.(file)}
              >
                {storageService.isImageFile(file.mimeType) ? (
                  <img
                    src={file.publicUrl}
                    alt={file.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="text-gray-400">
                    {getFileIcon(file.mimeType)}
                  </div>
                )}
              </div>

              {/* File info */}
              <div className="text-sm">
                <p className="font-medium text-gray-900 dark:text-gray-100 truncate" title={file.name}>
                  {file.name}
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-xs">
                  {formatFileSize(file.size)}
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-xs">
                  {formatDate(file.uploadedAt)}
                </p>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        // List view
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedFiles.size === filteredFiles.length && filteredFiles.length > 0}
                      onChange={selectAllFiles}
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-gray-100">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-gray-100">Size</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-gray-100">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-gray-100">Modified</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-gray-100">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredFiles.map((file) => (
                  <tr 
                    key={file.id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                    onClick={() => onFileSelect?.(file)}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedFiles.has(file.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleFileSelection(file.id);
                        }}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        <div className="text-gray-400">
                          {getFileIcon(file.mimeType)}
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {file.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {formatFileSize(file.size)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {storageService.getFileCategory(file.mimeType)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(file.uploadedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePreview(file);
                          }}
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {allowDownload && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(file);
                            }}
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                        {allowDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(file);
                            }}
                            title="Delete"
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default FileManager; 