import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { FileUpload } from '../components/ui/FileUpload';
import { FileManager as FileManagerComponent } from '../components/ui/FileManager';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  Upload, 
  FolderOpen, 
  Image, 
  FileText, 
  Users, 
  Paperclip,
  HardDrive,
  Settings,
  BarChart3
} from 'lucide-react';
import { uploadOptions } from '../lib/supabase/storage';
import useFileManager from '../hooks/useFileManager';

const FileManagerPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const { storageUsage, getStorageUsage } = useFileManager();

  const handleUploadComplete = async () => {
    // Refresh storage usage after uploads
    await getStorageUsage();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const totalStorageUsed = storageUsage.reduce((acc, usage) => acc + usage.totalSize, 0);
  const totalFiles = storageUsage.reduce((acc, usage) => acc + usage.fileCount, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            File Manager
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Upload, organize, and manage your files with comprehensive storage capabilities.
          </p>
        </div>

        {/* Storage Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Files</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalFiles}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <HardDrive className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Storage Used</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {formatFileSize(totalStorageUsed)}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <BarChart3 className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Buckets</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {storageUsage.length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <FolderOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Quick Actions</p>
                <div className="flex space-x-2 mt-2">
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('upload')}>
                    <Upload className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('manage')}>
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="upload" className="flex items-center space-x-2">
              <Upload className="w-4 h-4" />
              <span>Upload</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Documents</span>
            </TabsTrigger>
            <TabsTrigger value="images" className="flex items-center space-x-2">
              <Image className="w-4 h-4" />
              <span>Images</span>
            </TabsTrigger>
            <TabsTrigger value="avatars" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Avatars</span>
            </TabsTrigger>
            <TabsTrigger value="attachments" className="flex items-center space-x-2">
              <Paperclip className="w-4 h-4" />
              <span>Attachments</span>
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Document Upload */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Upload Documents
                </h3>
                <FileUpload
                  options={{
                    ...uploadOptions.documents,
                    folder: 'general'
                  }}
                  onUploadComplete={handleUploadComplete}
                  multiple={true}
                  maxFiles={5}
                />
              </Card>

              {/* Image Upload */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Upload Images
                </h3>
                <FileUpload
                  options={{
                    ...uploadOptions.images,
                    folder: 'general'
                  }}
                  onUploadComplete={handleUploadComplete}
                  multiple={true}
                  maxFiles={10}
                  showPreview={true}
                />
              </Card>

              {/* Avatar Upload */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Upload Avatars
                </h3>
                <FileUpload
                  options={{
                    ...uploadOptions.avatars,
                    folder: 'user-avatars'
                  }}
                  onUploadComplete={handleUploadComplete}
                  multiple={false}
                  showPreview={true}
                />
              </Card>

              {/* Attachment Upload */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Upload Attachments
                </h3>
                <FileUpload
                  options={{
                    ...uploadOptions.attachments,
                    folder: 'misc'
                  }}
                  onUploadComplete={handleUploadComplete}
                  multiple={true}
                  maxFiles={3}
                />
              </Card>
            </div>

            {/* Storage Usage by Bucket */}
            {storageUsage.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Storage Usage by Bucket
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {storageUsage.map((usage) => (
                    <div key={usage.bucket} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                          {usage.bucket}
                        </span>
                        {usage.bucket === 'documents' && <FileText className="w-4 h-4 text-gray-500" />}
                        {usage.bucket === 'images' && <Image className="w-4 h-4 text-gray-500" />}
                        {usage.bucket === 'avatars' && <Users className="w-4 h-4 text-gray-500" />}
                        {usage.bucket === 'attachments' && <Paperclip className="w-4 h-4 text-gray-500" />}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {usage.fileCount} files • {formatFileSize(usage.totalSize)}
                      </p>
                      <div className="mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{
                            width: `${totalStorageUsed > 0 ? (usage.totalSize / totalStorageUsed) * 100 : 0}%`
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Document Management Tab */}
          <TabsContent value="documents">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Document Files
              </h3>
              <FileManagerComponent
                bucket="documents"
                allowDelete={true}
                allowDownload={true}
              />
            </Card>
          </TabsContent>

          {/* Image Management Tab */}
          <TabsContent value="images">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Image Files
              </h3>
              <FileManagerComponent
                bucket="images"
                allowDelete={true}
                allowDownload={true}
              />
            </Card>
          </TabsContent>

          {/* Avatar Management Tab */}
          <TabsContent value="avatars">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Avatar Files
              </h3>
              <FileManagerComponent
                bucket="avatars"
                allowDelete={true}
                allowDownload={true}
              />
            </Card>
          </TabsContent>

          {/* Attachment Management Tab */}
          <TabsContent value="attachments">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Attachment Files
              </h3>
              <FileManagerComponent
                bucket="attachments"
                allowDelete={true}
                allowDownload={true}
              />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FileManagerPage; 