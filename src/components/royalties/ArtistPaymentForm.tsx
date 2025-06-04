import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, DollarSign, Hash, FileText, User } from 'lucide-react';
import { ArtistPayment } from '../../types';
import { useArtists } from '../../hooks/useArtists';
import { useEvents } from '../../hooks/useEvents';
import { useArtistContracts } from '../../hooks/useArtistContracts';
import { format } from 'date-fns';

interface ArtistPaymentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payment: Omit<ArtistPayment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialPayment?: ArtistPayment;
  artistId?: string;
  contractId?: string;
  eventId?: string;
  isSubmitting: boolean;
}

const ArtistPaymentForm: React.FC<ArtistPaymentFormProps> = ({
  isOpen,
  onClose,
  onSave,
  initialPayment,
  artistId,
  contractId,
  eventId,
  isSubmitting
}) => {
  const { artists, isLoading: isLoadingArtists } = useArtists();
  const { events, isLoading: isLoadingEvents } = useEvents();
  const { contracts, isLoading: isLoadingContracts } = useArtistContracts(artistId);
  
  const [formData, setFormData] = useState<Omit<ArtistPayment, 'id' | 'createdAt' | 'updatedAt'>>({
    artistId: artistId || '',
    contractId: contractId || null,
    eventId: eventId || null,
    paymentDate: format(new Date(), 'yyyy-MM-dd'),
    amount: 0,
    paymentMethod: 'check',
    referenceNumber: null,
    status: 'pending',
    description: null,
    createdBy: null
  });

  // Initialize form with existing data if editing
  useEffect(() => {
    if (initialPayment) {
      setFormData({
        artistId: initialPayment.artistId,
        contractId: initialPayment.contractId,
        eventId: initialPayment.eventId,
        paymentDate: initialPayment.paymentDate,
        amount: initialPayment.amount,
        paymentMethod: initialPayment.paymentMethod,
        referenceNumber: initialPayment.referenceNumber,
        status: initialPayment.status,
        description: initialPayment.description,
        createdBy: initialPayment.createdBy
      });
    } else {
      // For new payments, set the provided IDs
      setFormData(prev => ({
        ...prev,
        artistId: artistId || prev.artistId,
        contractId: contractId || prev.contractId,
        eventId: eventId || prev.eventId
      }));
    }
  }, [initialPayment, artistId, contractId, eventId]);

  // Filter relevant events when artist changes
  const [relevantEvents, setRelevantEvents] = useState<any[]>([]);
  useEffect(() => {
    if (formData.artistId && events.length > 0) {
      // Find events where this artist is in the artist_ids array
      const filteredEvents = events.filter(event => 
        event.artist_ids && event.artist_ids.includes(formData.artistId)
      );
      setRelevantEvents(filteredEvents);
    } else {
      setRelevantEvents([]);
    }
  }, [formData.artistId, events]);

  // Filter contracts when artist changes
  const [relevantContracts, setRelevantContracts] = useState<any[]>([]);
  useEffect(() => {
    if (formData.artistId && contracts.length > 0) {
      // Find contracts for this artist
      const filteredContracts = contracts.filter(contract => 
        contract.artistId === formData.artistId
      );
      setRelevantContracts(filteredContracts);
    } else {
      setRelevantContracts([]);
    }
  }, [formData.artistId, contracts]);

  // Update amount when contract is selected
  useEffect(() => {
    if (formData.contractId) {
      const selectedContract = contracts.find(c => c.id === formData.contractId);
      if (selectedContract && selectedContract.flatFeeAmount) {
        // If it's a flat fee contract, pre-fill the amount
        setFormData(prev => ({
          ...prev,
          amount: selectedContract.flatFeeAmount || 0,
          description: `Payment for ${selectedContract.contractName}`
        }));
      }
    }
  }, [formData.contractId, contracts]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData((prev) => ({ 
        ...prev, 
        [name]: value === '' ? 0 : parseFloat(value) 
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value || null }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-zinc-900 shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-700 bg-zinc-900 px-4 py-4">
          <h2 className="font-playfair text-xl font-semibold text-white">
            {initialPayment ? 'Edit Payment' : 'Record Artist Payment'}
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
            <div>
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
                  disabled={!!artistId} // Disable if provided as prop
                  className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500 disabled:opacity-70"
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
            
            <div>
              <label htmlFor="contractId" className="block text-sm font-medium text-gray-300">
                Contract
              </label>
              <div className="mt-1 flex items-center">
                <FileText size={16} className="mr-2 text-gray-400" />
                <select
                  id="contractId"
                  name="contractId"
                  value={formData.contractId || ''}
                  onChange={handleInputChange}
                  disabled={!!contractId || isLoadingContracts || !formData.artistId}
                  className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500 disabled:opacity-70"
                >
                  <option value="">No contract (ad hoc payment)</option>
                  {isLoadingContracts ? (
                    <option disabled>Loading contracts...</option>
                  ) : formData.artistId && relevantContracts.length === 0 ? (
                    <option disabled>No contracts for this artist</option>
                  ) : (
                    relevantContracts.map(contract => (
                      <option key={contract.id} value={contract.id}>
                        {contract.contractName}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>
            
            <div>
              <label htmlFor="eventId" className="block text-sm font-medium text-gray-300">
                Related Event
              </label>
              <select
                id="eventId"
                name="eventId"
                value={formData.eventId || ''}
                onChange={handleInputChange}
                disabled={!!eventId || isLoadingEvents || !formData.artistId}
                className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500 disabled:opacity-70"
              >
                <option value="">No related event</option>
                {isLoadingEvents ? (
                  <option disabled>Loading events...</option>
                ) : formData.artistId && relevantEvents.length === 0 ? (
                  <option disabled>No events for this artist</option>
                ) : (
                  relevantEvents.map(event => (
                    <option key={event.id} value={event.id}>
                      {event.title} ({format(new Date(event.date), 'MMM d, yyyy')})
                    </option>
                  ))
                )}
              </select>
            </div>
            
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-300">
                Payment Amount ($) <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 flex items-center">
                <DollarSign size={16} className="mr-2 text-gray-400" />
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  required
                  className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-300">
                Payment Date <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 flex items-center">
                <Calendar size={16} className="mr-2 text-gray-400" />
                <input
                  type="date"
                  id="paymentDate"
                  name="paymentDate"
                  value={formData.paymentDate}
                  onChange={handleInputChange}
                  required
                  className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-300">
                  Payment Method
                </label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                >
                  <option value="check">Check</option>
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="square">Square</option>
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
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            
            <div>
              <label htmlFor="referenceNumber" className="block text-sm font-medium text-gray-300">
                Reference/Check Number
              </label>
              <div className="mt-1 flex items-center">
                <Hash size={16} className="mr-2 text-gray-400" />
                <input
                  type="text"
                  id="referenceNumber"
                  name="referenceNumber"
                  value={formData.referenceNumber || ''}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  placeholder="e.g. CHECK-1234 or TRANS-5678"
                />
              </div>
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
                rows={2}
                className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                placeholder="e.g. Final payment for performance on June 15"
              />
            </div>
            
            <div>
              <label htmlFor="createdBy" className="block text-sm font-medium text-gray-300">
                Recorded By
              </label>
              <input
                type="text"
                id="createdBy"
                name="createdBy"
                value={formData.createdBy || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                placeholder="Your name"
              />
            </div>
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
              disabled={isSubmitting || !formData.artistId || formData.amount <= 0}
              className="inline-flex items-center rounded-lg bg-amber-600 px-3 py-2 text-sm font-medium text-white hover:bg-amber-700 focus:outline-none disabled:opacity-70"
            >
              <Save size={16} className="mr-2" />
              {isSubmitting ? 'Saving...' : initialPayment ? 'Update Payment' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ArtistPaymentForm;