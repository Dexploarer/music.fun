import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Calendar, DollarSign, User, FileText } from 'lucide-react';
import { ArtistContract } from '../../types';
import { format } from 'date-fns';
import { useArtists } from '../../hooks/useArtists';

interface ArtistContractFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contract: Omit<ArtistContract, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialContract?: ArtistContract;
  isSubmitting: boolean;
}

const ArtistContractForm: React.FC<ArtistContractFormProps> = ({
  isOpen,
  onClose,
  onSave,
  initialContract,
  isSubmitting
}) => {
  const { artists, isLoading: isLoadingArtists } = useArtists();
  
  const [formData, setFormData] = useState<Omit<ArtistContract, 'id' | 'createdAt' | 'updatedAt'>>({
    artistId: '',
    contractName: '',
    contractType: 'performance',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: null,
    paymentType: 'flat_fee',
    flatFeeAmount: null,
    percentageRate: null,
    minimumGuarantee: null,
    paymentSchedule: 'post_event',
    status: 'draft',
    contractDocumentId: null,
    notes: null
  });

  // Initialize form with existing data if editing
  useEffect(() => {
    if (initialContract) {
      setFormData({
        artistId: initialContract.artistId,
        contractName: initialContract.contractName,
        contractType: initialContract.contractType,
        startDate: initialContract.startDate,
        endDate: initialContract.endDate,
        paymentType: initialContract.paymentType,
        flatFeeAmount: initialContract.flatFeeAmount,
        percentageRate: initialContract.percentageRate,
        minimumGuarantee: initialContract.minimumGuarantee,
        paymentSchedule: initialContract.paymentSchedule,
        status: initialContract.status,
        contractDocumentId: initialContract.contractDocumentId,
        notes: initialContract.notes
      });
    }
  }, [initialContract]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData((prev) => ({ 
        ...prev, 
        [name]: value === '' ? null : parseFloat(value) 
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value || null }));
    }
  };

  // When payment type changes, reset irrelevant fields
  useEffect(() => {
    if (formData.paymentType === 'flat_fee') {
      setFormData(prev => ({
        ...prev,
        percentageRate: null
      }));
    } else if (formData.paymentType === 'percentage') {
      setFormData(prev => ({
        ...prev,
        flatFeeAmount: null
      }));
    }
  }, [formData.paymentType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form based on payment type
    if (formData.paymentType === 'flat_fee' && !formData.flatFeeAmount) {
      alert('Please enter a flat fee amount');
      return;
    }
    
    if (formData.paymentType === 'percentage' && !formData.percentageRate) {
      alert('Please enter a percentage rate');
      return;
    }
    
    if (formData.paymentType === 'hybrid' && (!formData.flatFeeAmount || !formData.percentageRate)) {
      alert('Please enter both flat fee amount and percentage rate for hybrid payment');
      return;
    }
    
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-zinc-900 shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-700 bg-zinc-900 px-4 py-4">
          <h2 className="font-playfair text-xl font-semibold text-white">
            {initialContract ? 'Edit Artist Contract' : 'New Artist Contract'}
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
          <div className="space-y-4">
            {/* Basic Contract Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label htmlFor="artistId" className="block text-sm font-medium text-gray-300">
                  Artist <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 flex items-center">
                  <User size={16} className="mr-2 text-gray-400" />
                  <select
                    id="artistId"
                    name="artistId"
                    value={formData.artistId}
                    onChange={handleInputChange}
                    required
                    className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  >
                    <option value="">Select an artist</option>
                    {isLoadingArtists ? (
                      <option disabled>Loading artists...</option>
                    ) : (
                      artists.map(artist => (
                        <option key={artist.id} value={artist.id}>
                          {artist.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>
              
              <div className="sm:col-span-2">
                <label htmlFor="contractName" className="block text-sm font-medium text-gray-300">
                  Contract Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="contractName"
                  name="contractName"
                  value={formData.contractName}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  placeholder="e.g. Summer 2025 Performance Contract"
                />
              </div>
              
              <div>
                <label htmlFor="contractType" className="block text-sm font-medium text-gray-300">
                  Contract Type
                </label>
                <select
                  id="contractType"
                  name="contractType"
                  value={formData.contractType}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                >
                  <option value="performance">Single Performance</option>
                  <option value="residency">Residency</option>
                  <option value="recording">Recording Session</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-300">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                >
                  <option value="draft">Draft</option>
                  <option value="sent">Sent to Artist</option>
                  <option value="negotiating">Negotiating</option>
                  <option value="signed">Signed</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            
            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-300">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 flex items-center">
                  <Calendar size={16} className="mr-2 text-gray-400" />
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                    className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-300">
                  End Date
                </label>
                <div className="mt-1 flex items-center">
                  <Calendar size={16} className="mr-2 text-gray-400" />
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate || ''}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>
            
            {/* Payment Details */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Payment Details</label>
              <div className="rounded-lg bg-zinc-800 p-4 space-y-4">
                <div>
                  <label htmlFor="paymentType" className="block text-sm font-medium text-gray-300">
                    Payment Type
                  </label>
                  <select
                    id="paymentType"
                    name="paymentType"
                    value={formData.paymentType}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-700 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  >
                    <option value="flat_fee">Flat Fee</option>
                    <option value="percentage">Percentage of Ticket Sales</option>
                    <option value="hybrid">Hybrid (Fee + Percentage)</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(formData.paymentType === 'flat_fee' || formData.paymentType === 'hybrid') && (
                    <div>
                      <label htmlFor="flatFeeAmount" className="block text-sm font-medium text-gray-300">
                        Flat Fee Amount ($)
                      </label>
                      <div className="mt-1 flex items-center">
                        <DollarSign size={16} className="mr-2 text-gray-400" />
                        <input
                          type="number"
                          id="flatFeeAmount"
                          name="flatFeeAmount"
                          value={formData.flatFeeAmount || ''}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                          className="block w-full rounded-md border border-zinc-700 bg-zinc-700 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  )}
                  
                  {(formData.paymentType === 'percentage' || formData.paymentType === 'hybrid') && (
                    <div>
                      <label htmlFor="percentageRate" className="block text-sm font-medium text-gray-300">
                        Percentage Rate (%)
                      </label>
                      <input
                        type="number"
                        id="percentageRate"
                        name="percentageRate"
                        value={formData.percentageRate || ''}
                        onChange={handleInputChange}
                        min="0"
                        max="100"
                        step="0.1"
                        className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-700 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                        placeholder="0.0"
                      />
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="minimumGuarantee" className="block text-sm font-medium text-gray-300">
                      Minimum Guarantee ($)
                    </label>
                    <div className="mt-1 flex items-center">
                      <DollarSign size={16} className="mr-2 text-gray-400" />
                      <input
                        type="number"
                        id="minimumGuarantee"
                        name="minimumGuarantee"
                        value={formData.minimumGuarantee || ''}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className="block w-full rounded-md border border-zinc-700 bg-zinc-700 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="paymentSchedule" className="block text-sm font-medium text-gray-300">
                      Payment Schedule
                    </label>
                    <select
                      id="paymentSchedule"
                      name="paymentSchedule"
                      value={formData.paymentSchedule}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-700 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                    >
                      <option value="post_event">After Performance</option>
                      <option value="single">Single Payment (Before)</option>
                      <option value="installment">Multiple Installments</option>
                      <option value="split">Split Payment (50% before, 50% after)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <label htmlFor="contractDocumentId" className="block text-sm font-medium text-gray-300">
                Contract Document
              </label>
              <div className="mt-1 flex items-center">
                <FileText size={16} className="mr-2 text-gray-400" />
                <input
                  type="text"
                  id="contractDocumentId"
                  name="contractDocumentId"
                  value={formData.contractDocumentId || ''}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  placeholder="Document ID (if available)"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">You can attach a contract document later from the Documents section</p>
            </div>
            
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-300">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes || ''}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                placeholder="Additional contract notes or special terms..."
              />
            </div>
            
            {/* Warning for percentage contracts */}
            {formData.paymentType !== 'flat_fee' && (
              <div className="flex items-start rounded-lg bg-amber-900/20 border border-amber-800 p-3">
                <AlertCircle size={16} className="mt-0.5 mr-2 text-amber-500 flex-shrink-0" />
                <div>
                  <p className="text-sm text-amber-300">Percentage-based Payment Notice</p>
                  <p className="mt-1 text-xs text-gray-300">
                    This contract includes a percentage-based payment. You'll need to generate royalty reports after the event to calculate the final payment amount.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-zinc-800 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.artistId || !formData.contractName}
              className="inline-flex items-center rounded-lg bg-amber-600 px-3 py-2 text-sm font-medium text-white hover:bg-amber-700 focus:outline-none disabled:opacity-70"
            >
              <Save size={16} className="mr-2" />
              {isSubmitting ? 'Saving...' : initialContract ? 'Update Contract' : 'Save Contract'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ArtistContractForm;