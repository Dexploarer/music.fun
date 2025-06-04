import React, { useState, useEffect } from 'react';
import { X, Save, FileText, Check } from 'lucide-react';
import { Document } from '../../types';
import SignatureCapture from '../settings/SignatureCapture';

interface DocumentSignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSign: (signedContent: string) => void;
  document: Document;
  savedSignature: string | null;
  isSubmitting: boolean;
}

const DocumentSignModal: React.FC<DocumentSignModalProps> = ({
  isOpen,
  onClose,
  onSign,
  document,
  savedSignature,
  isSubmitting
}) => {
  const [signature, setSignature] = useState<string | null>(null);
  const [useStoredSignature, setUseStoredSignature] = useState(true);
  const [documentContent, setDocumentContent] = useState(document.content || '');
  
  // Use saved signature if available
  useEffect(() => {
    if (savedSignature && useStoredSignature) {
      setSignature(savedSignature);
    } else if (!useStoredSignature) {
      setSignature(null);
    }
  }, [savedSignature, useStoredSignature]);

  const handleSignatureChange = (newSignature: string | null) => {
    setSignature(newSignature);
  };

  const handleSignDocument = () => {
    if (!signature) {
      alert('Please provide a signature before signing the document');
      return;
    }
    
    // In a real application, you would include the signature in the document
    // This is a simplified version that just adds a signature line at the end
    const signedContent = documentContent + `\n\nSigned by: The Train Station Owner\n[Signature Applied Electronically on ${new Date().toLocaleDateString()}]`;
    
    onSign(signedContent);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-zinc-900 shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-700 bg-zinc-900 px-4 py-4 sm:px-6">
          <h2 className="font-playfair text-lg sm:text-xl font-semibold text-white">Sign Document</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-zinc-800 hover:text-white"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-medium text-white flex items-center">
                  <FileText size={18} className="mr-2 text-amber-500" />
                  {document.name}
                </h3>
                <div className="text-xs text-gray-400">
                  {document.fileType || 'Text Document'}
                </div>
              </div>
              
              <div className="h-[400px] overflow-auto rounded-md bg-zinc-800 p-4 font-mono text-xs sm:text-sm text-white whitespace-pre-wrap">
                {documentContent || 'No document content available'}
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium text-white">Your Signature</h3>
              
              {savedSignature && (
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={useStoredSignature}
                    onChange={(e) => setUseStoredSignature(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-600 text-amber-600 focus:ring-amber-600"
                  />
                  <span className="text-sm text-gray-300">Use saved signature</span>
                </label>
              )}
              
              {(!savedSignature || !useStoredSignature) ? (
                <SignatureCapture
                  value={signature}
                  onChange={handleSignatureChange}
                />
              ) : (
                <div className="rounded-md border border-amber-600 bg-white p-4 flex items-center justify-center">
                  <img 
                    src={savedSignature} 
                    alt="Your signature" 
                    className="max-h-[150px]"
                  />
                </div>
              )}
              
              <div className="rounded-md bg-zinc-800 p-3">
                <div className="flex items-center space-x-2 text-gray-300">
                  <Check size={16} className="text-amber-500" />
                  <div className="text-sm">
                    By clicking "Sign Document," you confirm that:
                  </div>
                </div>
                <ul className="mt-2 space-y-1 pl-6 text-xs text-gray-400">
                  <li>You have read and agree to the entire document</li>
                  <li>This electronic signature is legally binding</li>
                  <li>You are authorized to sign on behalf of The Train Station</li>
                </ul>
              </div>
              
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSignDocument}
                  disabled={isSubmitting || !signature}
                  className="w-full inline-flex items-center justify-center rounded-lg bg-amber-600 px-3 py-2 text-sm font-medium text-white hover:bg-amber-700 focus:outline-none disabled:opacity-70"
                >
                  <Save size={16} className="mr-2" />
                  {isSubmitting ? 'Signing...' : 'Sign Document'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentSignModal;