import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, DollarSign } from 'lucide-react';
import { useEvents } from '../../hooks/useEvents';
import { useArtists } from '../../hooks/useArtists';
import { format } from 'date-fns';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (transaction: any) => void;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onAddTransaction
}) => {
  const { events } = useEvents();
  const { artists } = useArtists();
  const [isMobile, setIsMobile] = useState(false);
  
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    amount: '',
    category: 'Venue',
    type: 'income',
    eventId: '',
    artistId: '',
    notes: ''
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    window.addEventListener('resize', checkMobile);
    checkMobile(); // Initial check
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTransaction(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-zinc-900 shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-700 bg-zinc-900 px-4 sm:px-6 py-4">
          <h2 className="font-playfair text-xl font-semibold text-white">Add Transaction</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-zinc-800 hover:text-white"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          <div className="mb-6 space-y-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-300">
                Date
              </label>
              <div className="mt-1 flex items-center">
                <Calendar size={14} className="sm:size-18 mr-2 text-gray-400" />
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white shadow-sm focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300">
                Description
              </label>
              <input
                type="text"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                placeholder="e.g. Bar sales for Blues Night"
                required
              />
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-300">
                Amount ($)
              </label>
              <div className="mt-1 flex items-center">
                <DollarSign size={14} className="sm:size-18 mr-2 text-gray-400" />
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  min="0.01"
                  step="0.01"
                  className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white shadow-sm focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-300">
                  Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white shadow-sm focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  required
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-300">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white shadow-sm focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  required
                >
                  <option value="Venue">Venue</option>
                  <option value="Bar">Bar</option>
                  <option value="Tickets">Tickets</option>
                  <option value="Merchandise">Merchandise</option>
                  <option value="Artists">Artists</option>
                  <option value="Staff">Staff</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Rent">Rent</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="eventId" className="block text-sm font-medium text-gray-300">
                Related Event (Optional)
              </label>
              <select
                id="eventId"
                name="eventId"
                value={formData.eventId}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white shadow-sm focus:border-amber-500 focus:outline-none focus:ring-amber-500"
              >
                <option value="">Select an event</option>
                {events.map(event => (
                  <option key={event.id} value={event.id}>
                    {event.title} ({format(new Date(event.date), 'MMM d, yyyy')})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="artistId" className="block text-sm font-medium text-gray-300">
                Related Artist (Optional)
              </label>
              <select
                id="artistId"
                name="artistId"
                value={formData.artistId}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white shadow-sm focus:border-amber-500 focus:outline-none focus:ring-amber-500"
              >
                <option value="">Select an artist</option>
                {artists.map(artist => (
                  <option key={artist.id} value={artist.id}>
                    {artist.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-300">
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                placeholder="Additional details about this transaction..."
              />
            </div>
          </div>

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
              className="inline-flex items-center rounded-lg bg-amber-600 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white hover:bg-amber-700 focus:outline-none"
            >
              <Save size={14} className="mr-1 sm:mr-2 sm:size-16" />
              Save Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionModal;