import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, DollarSign, Calculator, AlertCircle } from 'lucide-react';
import { RoyaltyReport } from '../../types';
import { useArtists } from '../../hooks/useArtists';
import { useEvents } from '../../hooks/useEvents';
import { useArtistContracts } from '../../hooks/useArtistContracts';
import { format, addMonths } from 'date-fns';

interface RoyaltyReportFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (report: Omit<RoyaltyReport, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialReport?: RoyaltyReport;
  artistId?: string;
  eventId?: string;
  isSubmitting: boolean;
}

const RoyaltyReportForm: React.FC<RoyaltyReportFormProps> = ({
  isOpen,
  onClose,
  onSave,
  initialReport,
  artistId,
  eventId,
  isSubmitting
}) => {
  const { artists, isLoading: isLoadingArtists } = useArtists();
  const { events, isLoading: isLoadingEvents } = useEvents();
  const [formData, setFormData] = useState<Omit<RoyaltyReport, 'id' | 'createdAt' | 'updatedAt'>>({
    artistId: artistId || '',
    eventId: eventId || null,
    reportPeriodStart: format(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1), 'yyyy-MM-dd'),
    reportPeriodEnd: format(new Date(new Date().getFullYear(), new Date().getMonth(), 0), 'yyyy-MM-dd'),
    grossRevenue: 0,
    deductions: 0,
    netRevenue: 0,
    royaltyPercentage: 10,
    royaltyAmount: 0,
    status: 'draft',
    notes: null
  });

  // Calculate derived fields when inputs change
  useEffect(() => {
    const netRev = formData.grossRevenue - formData.deductions;
    const royaltyAmt = netRev * (formData.royaltyPercentage / 100);
    
    setFormData(prev => ({
      ...prev,
      netRevenue: netRev,
      royaltyAmount: royaltyAmt
    }));
  }, [formData.grossRevenue, formData.deductions, formData.royaltyPercentage]);

  // Initialize form with existing data if editing
  useEffect(() => {
    if (initialReport) {
      setFormData({
        artistId: initialReport.artistId,
        eventId: initialReport.eventId,
        reportPeriodStart: initialReport.reportPeriodStart,
        reportPeriodEnd: initialReport.reportPeriodEnd,
        grossRevenue: initialReport.grossRevenue,
        deductions: initialReport.deductions,
        netRevenue: initialReport.netRevenue,
        royaltyPercentage: initialReport.royaltyPercentage,
        royaltyAmount: initialReport.royaltyAmount,
        status: initialReport.status,
        notes: initialReport.notes
      });
    } else {
      // For new reports, set the provided IDs
      setFormData(prev => ({
        ...prev,
        artistId: artistId || prev.artistId,
        eventId: eventId || prev.eventId
      }));
    }
  }, [initialReport, artistId, eventId]);

  // Get active contracts for the selected artist to suggest royalty percentage
  const { contracts } = useArtistContracts(formData.artistId);
  useEffect(() => {
    if (formData.artistId && contracts.length > 0) {
      // Find percentage-based contracts
      const percentageContracts = contracts.filter(contract => 
        (contract.paymentType === 'percentage' || contract.paymentType === 'hybrid') &&
        contract.percentageRate
      );
      
      if (percentageContracts.length > 0) {
        // Use the percentage from the first active contract
        const activeContract = percentageContracts.find(c => c.status === 'active') || percentageContracts[0];
        if (activeContract && activeContract.percentageRate) {
          setFormData(prev => ({
            ...prev,
            royaltyPercentage: activeContract.percentageRate || 10
          }));
        }
      }
    }
  }, [formData.artistId, contracts]);

  // Suggest revenue data if event is selected
  useEffect(() => {
    if (formData.eventId) {
      const selectedEvent = events.find(e => e.id === formData.eventId);
      if (selectedEvent) {
        // Calculate gross revenue from ticket sales
        const ticketRevenue = (selectedEvent.tickets_sold || 0) * 
                            (typeof selectedEvent.ticket_price === 'number' 
                              ? selectedEvent.ticket_price 
                              : 0);
        
        setFormData(prev => ({
          ...prev,
          grossRevenue: ticketRevenue,
          // Automatically set period to event date
          reportPeriodStart: selectedEvent.date,
          reportPeriodEnd: selectedEvent.date
        }));
      }
    }
  }, [formData.eventId, events]);

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
  
  const handlePresetPeriod = (preset: 'previous_month' | 'current_month' | 'previous_quarter') => {
    const now = new Date();
    let start: Date;
    let end: Date;
    
    switch (preset) {
      case 'previous_month':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'current_month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'previous_quarter':
        const currentQuarter = Math.floor(now.getMonth() / 3);
        start = new Date(now.getFullYear(), (currentQuarter - 1) * 3, 1);
        end = new Date(now.getFullYear(), currentQuarter * 3, 0);
        break;
    }
    
    setFormData(prev => ({
      ...prev,
      reportPeriodStart: format(start, 'yyyy-MM-dd'),
      reportPeriodEnd: format(end, 'yyyy-MM-dd')
    }));
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
            {initialReport ? 'Edit Royalty Report' : 'New Royalty Report'}
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
              <select
                id="artistId"
                name="artistId"
                value={formData.artistId}
                onChange={handleInputChange}
                required
                disabled={!!artistId} // Disable if provided as prop
                className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500 disabled:opacity-70"
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
            
            <div>
              <label htmlFor="eventId" className="block text-sm font-medium text-gray-300">
                Related Event
              </label>
              <select
                id="eventId"
                name="eventId"
                value={formData.eventId || ''}
                onChange={handleInputChange}
                disabled={!!eventId || isLoadingEvents}
                className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500 disabled:opacity-70"
              >
                <option value="">No specific event (period report)</option>
                {isLoadingEvents ? (
                  <option disabled>Loading events...</option>
                ) : (
                  events
                    .filter(e => !formData.artistId || (e.artist_ids && e.artist_ids.includes(formData.artistId)))
                    .map(event => (
                      <option key={event.id} value={event.id}>
                        {event.title} ({format(new Date(event.date), 'MMM d, yyyy')})
                      </option>
                    ))
                )}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Reporting Period</label>
              <div className="flex flex-wrap gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => handlePresetPeriod('previous_month')}
                  className="rounded bg-zinc-800 px-2 py-1 text-xs text-white hover:bg-zinc-700"
                >
                  Previous Month
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetPeriod('current_month')}
                  className="rounded bg-zinc-800 px-2 py-1 text-xs text-white hover:bg-zinc-700"
                >
                  Current Month
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetPeriod('previous_quarter')}
                  className="rounded bg-zinc-800 px-2 py-1 text-xs text-white hover:bg-zinc-700"
                >
                  Previous Quarter
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="reportPeriodStart" className="block text-sm font-medium text-gray-300">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 flex items-center">
                    <Calendar size={16} className="mr-2 text-gray-400" />
                    <input
                      type="date"
                      id="reportPeriodStart"
                      name="reportPeriodStart"
                      value={formData.reportPeriodStart}
                      onChange={handleInputChange}
                      required
                      className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="reportPeriodEnd" className="block text-sm font-medium text-gray-300">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 flex items-center">
                    <Calendar size={16} className="mr-2 text-gray-400" />
                    <input
                      type="date"
                      id="reportPeriodEnd"
                      name="reportPeriodEnd"
                      value={formData.reportPeriodEnd}
                      onChange={handleInputChange}
                      required
                      className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Financial details */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Financial Details</label>
              <div className="rounded-lg bg-zinc-800 p-4 space-y-3">
                <div>
                  <label htmlFor="grossRevenue" className="block text-sm font-medium text-gray-300">
                    Gross Revenue ($) <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 flex items-center">
                    <DollarSign size={16} className="mr-2 text-gray-400" />
                    <input
                      type="number"
                      id="grossRevenue"
                      name="grossRevenue"
                      value={formData.grossRevenue}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      required
                      className="block w-full rounded-md border border-zinc-700 bg-zinc-700 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="deductions" className="block text-sm font-medium text-gray-300">
                    Deductions ($)
                  </label>
                  <div className="mt-1 flex items-center">
                    <DollarSign size={16} className="mr-2 text-gray-400" />
                    <input
                      type="number"
                      id="deductions"
                      name="deductions"
                      value={formData.deductions}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="block w-full rounded-md border border-zinc-700 bg-zinc-700 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div className="pt-2 border-t border-zinc-700">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">Net Revenue:</span>
                    <span className="text-sm font-medium text-white">${formData.netRevenue.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Royalty Calculation</label>
              <div className="rounded-lg bg-zinc-800 p-4 space-y-3">
                <div>
                  <label htmlFor="royaltyPercentage" className="block text-sm font-medium text-gray-300">
                    Royalty Percentage (%) <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 flex items-center">
                    <Calculator size={16} className="mr-2 text-gray-400" />
                    <input
                      type="number"
                      id="royaltyPercentage"
                      name="royaltyPercentage"
                      value={formData.royaltyPercentage}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      step="0.1"
                      required
                      className="block w-full rounded-md border border-zinc-700 bg-zinc-700 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                      placeholder="0.0"
                    />
                  </div>
                </div>
                
                <div className="pt-2 border-t border-zinc-700">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">Royalty Amount:</span>
                    <span className="text-sm font-bold text-amber-500">${formData.royaltyAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
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
                <option value="final">Final</option>
                <option value="paid">Paid</option>
              </select>
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
                rows={2}
                className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                placeholder="Additional notes about this royalty report..."
              />
            </div>
            
            {/* Info about next steps */}
            <div className="flex items-start rounded-lg bg-blue-900/20 border border-blue-800 p-3">
              <AlertCircle size={16} className="mt-0.5 mr-2 text-blue-500 flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-300">Payment Tracking</p>
                <p className="mt-1 text-xs text-gray-300">
                  After creating this report, you can record the royalty payment in the Artist Payments section.
                </p>
              </div>
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
              disabled={isSubmitting || !formData.artistId || formData.grossRevenue <= 0}
              className="inline-flex items-center rounded-lg bg-amber-600 px-3 py-2 text-sm font-medium text-white hover:bg-amber-700 focus:outline-none disabled:opacity-70"
            >
              <Save size={16} className="mr-2" />
              {isSubmitting ? 'Saving...' : initialReport ? 'Update Report' : 'Create Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoyaltyReportForm;