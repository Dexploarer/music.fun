import React, { useState, useRef } from 'react';
import { X, Upload, File, Tag, Save, Plus } from 'lucide-react';
import { Document } from '../../types';
import { FileUpload } from '../ui/FileUpload';
import { uploadOptions, UploadResult } from '../../lib/supabase/storage';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (document: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>) => void;
  isSubmitting: boolean;
}

const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  onSave,
  isSubmitting
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadResult[]>([]);
  const [formData, setFormData] = useState<Omit<Document, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    type: 'contract',
    description: '',
    content: null,
    fileType: null,
    fileSize: null,
    createdBy: null,
    tags: [],
    isTemplate: false,
    relatedEntityId: null,
    relatedEntityType: null,
    file: undefined
  });
  const [tag, setTag] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleUploadComplete = (results: UploadResult[]) => {
    const successfulUploads = results.filter(result => result.success);
    setUploadedFiles(successfulUploads);
    
    // Auto-fill form data from first successful upload
    if (successfulUploads.length > 0 && successfulUploads[0].data) {
      const firstFile = successfulUploads[0].data;
      if (!formData.name) {
        setFormData(prev => ({
          ...prev,
          name: firstFile.fileName.split('.')[0],
          fileType: firstFile.mimeType,
          fileSize: firstFile.fileSize,
          file: undefined // We'll use the uploaded file URL instead
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          fileType: firstFile.mimeType,
          fileSize: firstFile.fileSize,
          file: undefined
        }));
      }
    }
  };

  const handleUploadProgress = (progress: number) => {
    setUploadProgress(progress);
  };

  const handleAddTag = () => {
    if (tag.trim() && !formData.tags.includes(tag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()]
      }));
      setTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tagToRemove)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      alert('Please enter a document name');
      return;
    }

    if (uploadedFiles.length === 0 && !formData.content) {
      alert('Please upload a file or enter content');
      return;
    }

    // Include uploaded file information in the document data
    const documentData = {
      ...formData,
      uploadedFileUrl: uploadedFiles.length > 0 ? uploadedFiles[0].data?.publicUrl : null,
      uploadedFilePath: uploadedFiles.length > 0 ? uploadedFiles[0].data?.path : null
    };

    onSave(documentData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-zinc-900 shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-700 bg-zinc-900 px-4 py-4 sm:px-6">
          <h2 className="font-playfair text-lg sm:text-xl font-semibold text-white">Upload Document</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-zinc-800 hover:text-white"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          <div className="mb-6 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                Document Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                placeholder="e.g. Artist Contract Template"
              />
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-300">
                Document Type <span className="text-red-500">*</span>
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                required
              >
                <option value="contract">Contract</option>
                <option value="invoice">Invoice</option>
                <option value="rental">Venue Rental</option>
                <option value="rider">Technical Rider</option>
                <option value="legal">Legal Document</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                placeholder="Brief description of this document..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Upload Document File
              </label>
              <FileUpload
                options={{
                  ...uploadOptions.documents,
                  folder: 'documents'
                }}
                onUploadComplete={handleUploadComplete}
                onUploadProgress={handleUploadProgress}
                multiple={false}
                showPreview={false}
                className="bg-zinc-800 border-zinc-700"
              />
              
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-2">
                  <div className="bg-zinc-700 rounded-full h-2">
                    <div
                      className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Uploading... {uploadProgress}%</p>
                  </div>
                )}
              
              {uploadedFiles.length > 0 && (
                <div className="mt-2 p-3 bg-zinc-700 rounded-lg">
                  <p className="text-sm text-green-400 font-medium">✓ File uploaded successfully</p>
                  <p className="text-xs text-gray-300">{uploadedFiles[0].data?.fileName}</p>
              </div>
              )}
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isTemplate"
                  checked={formData.isTemplate}
                  onChange={handleCheckboxChange}
                  className="mr-2 rounded border-zinc-700 bg-zinc-800 text-amber-600 focus:ring-amber-500"
                />
                <span className="text-sm text-white">Save as template</span>
              </label>
              <p className="mt-1 text-xs text-gray-400">
                Templates can be reused to create new documents in the future.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">Tags</label>
              <div className="mt-1 flex">
                <input
                  type="text"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  placeholder="Add a tag and press +"
                  className="block w-full rounded-l-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="inline-flex items-center rounded-r-md border border-l-0 border-zinc-700 bg-zinc-700 px-3 py-2 font-medium text-white hover:bg-zinc-600"
                >
                  <Plus size={16} />
                </button>
              </div>
              
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center rounded-full bg-zinc-800 px-2 py-1 text-xs font-medium text-gray-300"
                  >
                    <Tag size={10} className="mr-1 text-amber-500" />
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 rounded-full p-0.5 text-gray-400 hover:bg-zinc-700 hover:text-white"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {uploadedFiles.length === 0 && (
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-300">
                  Document Content <span className="text-xs text-gray-400">(or upload a file)</span>
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content || ''}
                  onChange={handleInputChange}
                  rows={6}
                  className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  placeholder="Enter content directly if not uploading a file..."
                />
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-zinc-800 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white hover:bg-zinc-700 focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (uploadedFiles.length === 0 && !formData.content)}
              className="inline-flex items-center rounded-lg bg-amber-600 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white hover:bg-amber-700 focus:outline-none disabled:opacity-70"
            >
              <Save size={16} className="mr-2" />
              {isSubmitting ? 'Saving...' : 'Save Document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentUploadModal;