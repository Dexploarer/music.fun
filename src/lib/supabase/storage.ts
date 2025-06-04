import { supabase } from '../supabase';
import { toast } from 'react-hot-toast';

export interface FileUploadOptions {
  bucket: 'documents' | 'images' | 'avatars' | 'attachments';
  folder?: string;
  allowedTypes?: string[];
  maxSize?: number; // in bytes
  generateThumbnail?: boolean;
}

export interface UploadResult {
  success: boolean;
  data?: {
    id: string;
    path: string;
    fullPath: string;
    publicUrl: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
  };
  error?: string;
}

export interface FileMetadata {
  id: string;
  name: string;
  path: string;
  size: number;
  mimeType: string;
  bucket: string;
  uploadedAt: string;
  uploadedBy: string;
}

class SupabaseStorageService {
  private readonly buckets = {
    documents: 'documents',
    images: 'images',
    avatars: 'avatars',
    attachments: 'attachments'
  } as const;

  /**
   * Upload a file to Supabase Storage
   */
  async uploadFile(file: File, options: FileUploadOptions): Promise<UploadResult> {
    try {
      // Validate file
      const validation = this.validateFile(file, options);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error
        };
      }

      // Generate unique file path
      const fileName = this.generateFileName(file.name);
      const filePath = options.folder 
        ? `${options.folder}/${fileName}`
        : fileName;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(options.bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Storage upload error:', error);
        return {
          success: false,
          error: `Upload failed: ${error.message}`
        };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(options.bucket)
        .getPublicUrl(data.path);

      // Store file metadata in database
      await this.saveFileMetadata({
        path: data.path,
        bucket: options.bucket,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type
      });

      return {
        success: true,
        data: {
          id: data.id || crypto.randomUUID(),
          path: data.path,
          fullPath: data.fullPath,
          publicUrl: urlData.publicUrl,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type
        }
      };
    } catch (error) {
      console.error('File upload error:', error);
      return {
        success: false,
        error: 'An unexpected error occurred during upload'
      };
    }
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(files: File[], options: FileUploadOptions): Promise<UploadResult[]> {
    const results: UploadResult[] = [];
    
    for (const file of files) {
      const result = await this.uploadFile(file, options);
      results.push(result);
    }
    
    return results;
  }

  /**
   * Download a file from storage
   */
  async downloadFile(bucket: string, path: string): Promise<{ success: boolean; data?: Blob; error?: string }> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .download(path);

      if (error) {
        return {
          success: false,
          error: `Download failed: ${error.message}`
        };
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('File download error:', error);
      return {
        success: false,
        error: 'An unexpected error occurred during download'
      };
    }
  }

  /**
   * Delete a file from storage
   */
  async deleteFile(bucket: string, path: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        return {
          success: false,
          error: `Delete failed: ${error.message}`
        };
      }

      // Remove metadata from database
      await this.removeFileMetadata(path, bucket);

      return { success: true };
    } catch (error) {
      console.error('File delete error:', error);
      return {
        success: false,
        error: 'An unexpected error occurred during deletion'
      };
    }
  }

  /**
   * Get file public URL
   */
  getPublicUrl(bucket: string, path: string): string {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return data.publicUrl;
  }

  /**
   * List files in a bucket folder
   */
  async listFiles(bucket: string, folder?: string): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(folder, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) {
        return {
          success: false,
          error: `Failed to list files: ${error.message}`
        };
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('List files error:', error);
      return {
        success: false,
        error: 'An unexpected error occurred while listing files'
      };
    }
  }

  /**
   * Create a signed URL for temporary access
   */
  async createSignedUrl(bucket: string, path: string, expiresIn = 3600): Promise<{ success: boolean; data?: string; error?: string }> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn);

      if (error) {
        return {
          success: false,
          error: `Failed to create signed URL: ${error.message}`
        };
      }

      return {
        success: true,
        data: data.signedUrl
      };
    } catch (error) {
      console.error('Create signed URL error:', error);
      return {
        success: false,
        error: 'An unexpected error occurred while creating signed URL'
      };
    }
  }

  /**
   * Validate file before upload
   */
  private validateFile(file: File, options: FileUploadOptions): { valid: boolean; error?: string } {
    // Check file size
    if (options.maxSize && file.size > options.maxSize) {
      return {
        valid: false,
        error: `File size ${this.formatFileSize(file.size)} exceeds maximum allowed size of ${this.formatFileSize(options.maxSize)}`
      };
    }

    // Check file type
    if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} is not allowed. Allowed types: ${options.allowedTypes.join(', ')}`
      };
    }

    // Check file name
    if (!file.name || file.name.trim() === '') {
      return {
        valid: false,
        error: 'File name is required'
      };
    }

    return { valid: true };
  }

  /**
   * Generate unique file name
   */
  private generateFileName(originalName: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const randomId = crypto.randomUUID().substring(0, 8);
    const extension = originalName.split('.').pop();
    const baseName = originalName.split('.').slice(0, -1).join('.');
    
    return `${baseName}-${timestamp}-${randomId}.${extension}`;
  }

  /**
   * Save file metadata to database
   */
  private async saveFileMetadata(metadata: {
    path: string;
    bucket: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
  }): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase
        .from('file_metadata')
        .insert({
          path: metadata.path,
          bucket: metadata.bucket,
          file_name: metadata.fileName,
          file_size: metadata.fileSize,
          mime_type: metadata.mimeType,
          uploaded_by: user?.id,
          uploaded_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error saving file metadata:', error);
      // Don't throw error here to avoid failing the upload
    }
  }

  /**
   * Remove file metadata from database
   */
  private async removeFileMetadata(path: string, bucket: string): Promise<void> {
    try {
      await supabase
        .from('file_metadata')
        .delete()
        .eq('path', path)
        .eq('bucket', bucket);
    } catch (error) {
      console.error('Error removing file metadata:', error);
      // Don't throw error here
    }
  }

  /**
   * Format file size for display
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get file type category
   */
  getFileCategory(mimeType: string): 'image' | 'document' | 'video' | 'audio' | 'other' {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return 'document';
    return 'other';
  }

  /**
   * Get file extension from MIME type
   */
  getFileExtension(mimeType: string): string {
    const mimeMap: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'application/pdf': 'pdf',
      'text/plain': 'txt',
      'application/json': 'json',
      'video/mp4': 'mp4',
      'audio/mpeg': 'mp3'
    };
    
    return mimeMap[mimeType] || 'file';
  }

  /**
   * Check if file is an image
   */
  isImageFile(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }

  /**
   * Check if file is a document
   */
  isDocumentFile(mimeType: string): boolean {
    const documentTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/rtf'
    ];
    
    return documentTypes.includes(mimeType);
  }
}

// Export singleton instance
export const storageService = new SupabaseStorageService();

// Export utility functions
export const uploadOptions = {
  documents: {
    bucket: 'documents' as const,
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/rtf'
    ],
    maxSize: 10 * 1024 * 1024 // 10MB
  },
  images: {
    bucket: 'images' as const,
    allowedTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ],
    maxSize: 5 * 1024 * 1024 // 5MB
  },
  avatars: {
    bucket: 'avatars' as const,
    allowedTypes: [
      'image/jpeg',
      'image/png',
      'image/webp'
    ],
    maxSize: 2 * 1024 * 1024 // 2MB
  },
  attachments: {
    bucket: 'attachments' as const,
    allowedTypes: [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'text/plain',
      'application/json'
    ],
    maxSize: 20 * 1024 * 1024 // 20MB
  }
};

export default storageService; 