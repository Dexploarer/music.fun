import React, { useState, useEffect } from 'react';
import { X, Save, FileText, Tag, Plus, Download } from 'lucide-react';
import { Document } from '../../types';
import ArtistContractTemplate from '../../templates/ArtistContractTemplate';
import VenueRentalTemplate from '../../templates/VenueRentalTemplate';
import InvoiceTemplate from '../../templates/InvoiceTemplate';
import TechnicalRiderTemplate from '../../templates/TechnicalRiderTemplate';

interface DocumentTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (document: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>) => void;
  templateType: 'contract' | 'invoice' | 'rental' | 'rider';
  setTemplateType: (type: 'contract' | 'invoice' | 'rental' | 'rider') => void;
  existingTemplate: Document | null;
  isSubmitting: boolean;
}

const DocumentTemplateModal: React.FC<DocumentTemplateModalProps> = ({
  isOpen,
  onClose,
  onSave,
  templateType,
  setTemplateType,
  existingTemplate,
  isSubmitting
}) => {
  const [formData, setFormData] = useState<Omit<Document, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    type: templateType,
    description: '',
    content: '',
    fileType: 'text/plain',
    fileSize: null,
    createdBy: null,
    tags: [],
    isTemplate: true,
    relatedEntityId: null,
    relatedEntityType: null
  });
  
  const [tag, setTag] = useState('');
  
  // Template specific fields
  const [contractFields, setContractFields] = useState({
    artistName: '',
    eventDate: '',
    paymentAmount: '',
    additionalTerms: ''
  });
  
  const [invoiceFields, setInvoiceFields] = useState({
    clientName: '',
    invoiceDate: format(new Date(), 'yyyy-MM-dd'),
    dueDate: format(new Date(new Date().setDate(new Date().getDate() + 30)), 'yyyy-MM-dd'),
    items: [{ description: '', quantity: 1, rate: 0, amount: 0 }],
    subtotal: 0,
    taxRate: 6,
    taxAmount: 0,
    total: 0,
    notes: ''
  });
  
  const [rentalFields, setRentalFields] = useState({
    renterName: '',
    eventType: '',
    eventDate: '',
    rentalFee: '',
    depositAmount: '',
    expectedAttendance: '',
    additionalTerms: ''
  });
  
  const [riderFields, setRiderFields] = useState({
    artistName: '',
    eventDate: '',
    stageSize: '',
    soundSystem: '',
    lighting: '',
    backline: '',
    monitoring: '',
    additionalRequirements: ''
  });

  // Initialize form with existing template data if provided
  useEffect(() => {
    if (existingTemplate) {
      setFormData({
        name: `Copy of ${existingTemplate.name}`,
        type: existingTemplate.type as any,
        description: existingTemplate.description,
        content: existingTemplate.content,
        fileType: existingTemplate.fileType,
        fileSize: existingTemplate.fileSize,
        createdBy: existingTemplate.createdBy,
        tags: [...existingTemplate.tags],
        isTemplate: true,
        relatedEntityId: existingTemplate.relatedEntityId,
        relatedEntityType: existingTemplate.relatedEntityType
      });
      
      setTemplateType(existingTemplate.type as any);
      
      // Try to parse template-specific content from the existing template
      // This would be more sophisticated in a real app
    }
  }, [existingTemplate, setTemplateType]);

  // Format date for input fields
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime()) 
      ? date.toISOString().split('T')[0] 
      : dateString;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTemplateTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as 'contract' | 'invoice' | 'rental' | 'rider';
    setTemplateType(value);
    setFormData(prev => ({ ...prev, type: value }));
  };
  
  const handleContractFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContractFields(prev => ({ ...prev, [name]: value }));
    updateTemplateContent();
  };
  
  const handleInvoiceFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInvoiceFields(prev => ({ ...prev, [name]: value }));
    updateInvoiceCalculations();
  };
  
  const handleInvoiceItemChange = (index: number, field: string, value: any) => {
    const updatedItems = [...invoiceFields.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Calculate amount
    if (field === 'quantity' || field === 'rate') {
      updatedItems[index].amount = updatedItems[index].quantity * updatedItems[index].rate;
    }
    
    setInvoiceFields(prev => ({
      ...prev,
      items: updatedItems
    }));
    
    // Recalculate totals
    setTimeout(updateInvoiceCalculations, 0);
  };
  
  const addInvoiceItem = () => {
    setInvoiceFields(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, rate: 0, amount: 0 }]
    }));
  };
  
  const removeInvoiceItem = (index: number) => {
    if (invoiceFields.items.length <= 1) return;
    
    const updatedItems = [...invoiceFields.items];
    updatedItems.splice(index, 1);
    
    setInvoiceFields(prev => ({
      ...prev,
      items: updatedItems
    }));
    
    // Recalculate totals
    setTimeout(updateInvoiceCalculations, 0);
  };
  
  const updateInvoiceCalculations = () => {
    const subtotal = invoiceFields.items.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = subtotal * (invoiceFields.taxRate / 100);
    const total = subtotal + taxAmount;
    
    setInvoiceFields(prev => ({
      ...prev,
      subtotal,
      taxAmount,
      total
    }));
    
    updateTemplateContent();
  };
  
  const handleRentalFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRentalFields(prev => ({ ...prev, [name]: value }));
    updateTemplateContent();
  };
  
  const handleRiderFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRiderFields(prev => ({ ...prev, [name]: value }));
    updateTemplateContent();
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
  
  // Update template content based on current fields
  const updateTemplateContent = () => {
    let content = '';
    
    switch (templateType) {
      case 'contract':
        content = ArtistContractTemplate({
          artistName: contractFields.artistName,
          eventDate: contractFields.eventDate,
          paymentAmount: contractFields.paymentAmount,
          additionalTerms: contractFields.additionalTerms
        });
        break;
      case 'invoice':
        content = InvoiceTemplate({
          clientName: invoiceFields.clientName,
          invoiceDate: invoiceFields.invoiceDate,
          dueDate: invoiceFields.dueDate,
          items: invoiceFields.items,
          subtotal: invoiceFields.subtotal,
          taxRate: invoiceFields.taxRate,
          taxAmount: invoiceFields.taxAmount,
          total: invoiceFields.total,
          notes: invoiceFields.notes
        });
        break;
      case 'rental':
        content = VenueRentalTemplate({
          renterName: rentalFields.renterName,
          eventType: rentalFields.eventType,
          eventDate: rentalFields.eventDate,
          rentalFee: rentalFields.rentalFee,
          depositAmount: rentalFields.depositAmount,
          expectedAttendance: rentalFields.expectedAttendance,
          additionalTerms: rentalFields.additionalTerms
        });
        break;
      case 'rider':
        content = TechnicalRiderTemplate({
          artistName: riderFields.artistName,
          eventDate: riderFields.eventDate,
          stageSize: riderFields.stageSize,
          soundSystem: riderFields.soundSystem,
          lighting: riderFields.lighting,
          backline: riderFields.backline,
          monitoring: riderFields.monitoring,
          additionalRequirements: riderFields.additionalRequirements
        });
        break;
    }
    
    setFormData(prev => ({
      ...prev,
      content,
      // Update fileSize based on content length
      fileSize: content ? new Blob([content]).size : null
    }));
  };

  const getDefaultTemplateName = () => {
    switch (templateType) {
      case 'contract':
        return 'Artist Performance Contract';
      case 'invoice':
        return 'Event Invoice';
      case 'rental':
        return 'Venue Rental Agreement';
      case 'rider':
        return 'Technical Rider';
      default:
        return '';
    }
  };

  // Initialize template name when type changes
  useEffect(() => {
    if (!existingTemplate && (!formData.name || formData.name === 'Artist Performance Contract' || formData.name === 'Event Invoice' || formData.name === 'Venue Rental Agreement' || formData.name === 'Technical Rider')) {
      setFormData(prev => ({
        ...prev,
        name: getDefaultTemplateName(),
        type: templateType
      }));
    }
    
    updateTemplateContent();
  }, [templateType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      alert('Please enter a document name');
      return;
    }

    if (!formData.content) {
      alert('Template content is empty');
      return;
    }

    onSave(formData);
  };

  const handleDownloadPreview = () => {
    const blob = new Blob([formData.content || ''], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formData.name}-preview.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-zinc-900 shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-700 bg-zinc-900 px-4 py-4 sm:px-6">
          <h2 className="font-playfair text-lg sm:text-xl font-semibold text-white">
            {existingTemplate ? 'Edit Document Template' : 'Create Document Template'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-zinc-800 hover:text-white"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                  Template Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  placeholder="e.g. Standard Artist Contract"
                />
              </div>

              <div>
                <label htmlFor="templateType" className="block text-sm font-medium text-gray-300">
                  Template Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="templateType"
                  value={templateType}
                  onChange={handleTemplateTypeChange}
                  className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  required
                >
                  <option value="contract">Artist Contract</option>
                  <option value="invoice">Invoice</option>
                  <option value="rental">Venue Rental Agreement</option>
                  <option value="rider">Technical Rider</option>
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
                  placeholder="Brief description of this template..."
                />
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
              
              {/* Template-specific fields */}
              {templateType === 'contract' && (
                <div className="space-y-3 pt-2 border-t border-zinc-700">
                  <h3 className="font-medium text-sm text-white">Contract Fields</h3>
                  <div>
                    <label htmlFor="artistName" className="block text-xs font-medium text-gray-300">
                      Artist Name
                    </label>
                    <input
                      type="text"
                      id="artistName"
                      name="artistName"
                      value={contractFields.artistName}
                      onChange={handleContractFieldChange}
                      className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                      placeholder="e.g. River Junction Band"
                    />
                  </div>
                  <div>
                    <label htmlFor="eventDate" className="block text-xs font-medium text-gray-300">
                      Event Date
                    </label>
                    <input
                      type="date"
                      id="eventDate"
                      name="eventDate"
                      value={formatDateForInput(contractFields.eventDate)}
                      onChange={handleContractFieldChange}
                      className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="paymentAmount" className="block text-xs font-medium text-gray-300">
                      Payment Amount
                    </label>
                    <input
                      type="text"
                      id="paymentAmount"
                      name="paymentAmount"
                      value={contractFields.paymentAmount}
                      onChange={handleContractFieldChange}
                      className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                      placeholder="e.g. 1,000"
                    />
                  </div>
                  <div>
                    <label htmlFor="additionalTerms" className="block text-xs font-medium text-gray-300">
                      Additional Terms
                    </label>
                    <textarea
                      id="additionalTerms"
                      name="additionalTerms"
                      value={contractFields.additionalTerms}
                      onChange={handleContractFieldChange}
                      rows={3}
                      className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                      placeholder="Any specific terms for this contract..."
                    />
                  </div>
                </div>
              )}
              
              {templateType === 'invoice' && (
                <div className="space-y-3 pt-2 border-t border-zinc-700">
                  <h3 className="font-medium text-sm text-white">Invoice Fields</h3>
                  <div>
                    <label htmlFor="clientName" className="block text-xs font-medium text-gray-300">
                      Client Name
                    </label>
                    <input
                      type="text"
                      id="clientName"
                      name="clientName"
                      value={invoiceFields.clientName}
                      onChange={handleInvoiceFieldChange}
                      className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                      placeholder="e.g. Acme Productions"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label htmlFor="invoiceDate" className="block text-xs font-medium text-gray-300">
                        Invoice Date
                      </label>
                      <input
                        type="date"
                        id="invoiceDate"
                        name="invoiceDate"
                        value={formatDateForInput(invoiceFields.invoiceDate)}
                        onChange={handleInvoiceFieldChange}
                        className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="dueDate" className="block text-xs font-medium text-gray-300">
                        Due Date
                      </label>
                      <input
                        type="date"
                        id="dueDate"
                        name="dueDate"
                        value={formatDateForInput(invoiceFields.dueDate)}
                        onChange={handleInvoiceFieldChange}
                        className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {templateType === 'rental' && (
                <div className="space-y-3 pt-2 border-t border-zinc-700">
                  <h3 className="font-medium text-sm text-white">Rental Agreement Fields</h3>
                  <div>
                    <label htmlFor="renterName" className="block text-xs font-medium text-gray-300">
                      Renter Name
                    </label>
                    <input
                      type="text"
                      id="renterName"
                      name="renterName"
                      value={rentalFields.renterName}
                      onChange={handleRentalFieldChange}
                      className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                      placeholder="e.g. John Smith"
                    />
                  </div>
                  <div>
                    <label htmlFor="eventType" className="block text-xs font-medium text-gray-300">
                      Event Type
                    </label>
                    <input
                      type="text"
                      id="eventType"
                      name="eventType"
                      value={rentalFields.eventType}
                      onChange={handleRentalFieldChange}
                      className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                      placeholder="e.g. Wedding Reception"
                    />
                  </div>
                  <div>
                    <label htmlFor="eventDate" className="block text-xs font-medium text-gray-300">
                      Event Date
                    </label>
                    <input
                      type="date"
                      id="eventDate"
                      name="eventDate"
                      value={formatDateForInput(rentalFields.eventDate)}
                      onChange={handleRentalFieldChange}
                      className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label htmlFor="rentalFee" className="block text-xs font-medium text-gray-300">
                        Rental Fee ($)
                      </label>
                      <input
                        type="text"
                        id="rentalFee"
                        name="rentalFee"
                        value={rentalFields.rentalFee}
                        onChange={handleRentalFieldChange}
                        className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                        placeholder="e.g. 1500"
                      />
                    </div>
                    <div>
                      <label htmlFor="depositAmount" className="block text-xs font-medium text-gray-300">
                        Deposit Amount ($)
                      </label>
                      <input
                        type="text"
                        id="depositAmount"
                        name="depositAmount"
                        value={rentalFields.depositAmount}
                        onChange={handleRentalFieldChange}
                        className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                        placeholder="e.g. 500"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {templateType === 'rider' && (
                <div className="space-y-3 pt-2 border-t border-zinc-700">
                  <h3 className="font-medium text-sm text-white">Technical Rider Fields</h3>
                  <div>
                    <label htmlFor="artistName" className="block text-xs font-medium text-gray-300">
                      Artist Name
                    </label>
                    <input
                      type="text"
                      id="artistName"
                      name="artistName"
                      value={riderFields.artistName}
                      onChange={handleRiderFieldChange}
                      className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                      placeholder="e.g. River Junction Band"
                    />
                  </div>
                  <div>
                    <label htmlFor="eventDate" className="block text-xs font-medium text-gray-300">
                      Event Date
                    </label>
                    <input
                      type="date"
                      id="eventDate"
                      name="eventDate"
                      value={formatDateForInput(riderFields.eventDate)}
                      onChange={handleRiderFieldChange}
                      className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="soundSystem" className="block text-xs font-medium text-gray-300">
                      Sound System Requirements
                    </label>
                    <textarea
                      id="soundSystem"
                      name="soundSystem"
                      value={riderFields.soundSystem}
                      onChange={handleRiderFieldChange}
                      rows={2}
                      className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                      placeholder="e.g. 24-channel digital mixer, 4 monitor mixes, etc."
                    />
                  </div>
                </div>
              )}
              
              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={handleDownloadPreview}
                  className="inline-flex items-center rounded-lg bg-zinc-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-600 focus:outline-none"
                >
                  <Download size={14} className="mr-1" />
                  Preview
                </button>
              </div>
            </div>
            
            {/* Template Preview */}
            <div className="lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-medium text-white">Template Preview</h3>
                <div className="text-xs text-gray-400">
                  {formData.content ? `${(formData.content.length / 1024).toFixed(1)} KB` : '0 KB'}
                </div>
              </div>
              
              <div className="rounded-md bg-zinc-800 p-3 font-mono text-xs sm:text-sm text-white overflow-auto h-[500px] whitespace-pre-wrap">
                {formData.content || 'Template content will appear here...'}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-zinc-800 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white hover:bg-zinc-700 focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.name || !formData.content}
              className="inline-flex items-center rounded-lg bg-amber-600 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white hover:bg-amber-700 focus:outline-none disabled:opacity-70"
            >
              <Save size={16} className="mr-2" />
              {isSubmitting ? 'Saving...' : (existingTemplate ? 'Save Copy' : 'Save Template')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentTemplateModal;

// Helper function to format dates
function format(date: Date, format: string): string {
  try {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return format.replace('yyyy', year.toString())
      .replace('MM', month)
      .replace('dd', day);
  } catch (error) {
    console.error('Date formatting error:', error);
    return '';
  }
}