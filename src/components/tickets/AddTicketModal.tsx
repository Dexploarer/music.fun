import React, { useState, useEffect } from 'react';
import { X, Save, Ticket } from 'lucide-react';

interface AddTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTicket: (ticket: any) => void;
  eventId: string;
  defaultPrice: number;
}

const AddTicketModal: React.FC<AddTicketModalProps> = ({
  isOpen,
  onClose,
  onAddTicket,
  eventId,
  defaultPrice
}) => {
  const [formData, setFormData] = useState({
    purchaserName: '',
    purchaserEmail: '',
    price: defaultPrice,
    type: 'general',
    status: 'valid'
  });

  const [ticketCount, setTicketCount] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    window.addEventListener('resize', checkMobile);
    checkMobile(); // Initial check
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTicket({
      ...formData,
      eventId,
      count: ticketCount
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-zinc-900 shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-700 bg-zinc-900 px-4 sm:px-6 py-4">
          <h2 className="font-playfair text-lg sm:text-xl font-semibold text-white">Add Tickets</h2>
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
              <label htmlFor="purchaserName" className="block text-sm font-medium text-gray-300">
                Purchaser Name
              </label>
              <input
                type="text"
                id="purchaserName"
                name="purchaserName"
                value={formData.purchaserName}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                placeholder="e.g. John Smith"
                required
              />
            </div>

            <div>
              <label htmlFor="purchaserEmail" className="block text-sm font-medium text-gray-300">
                Purchaser Email
              </label>
              <input
                type="email"
                id="purchaserEmail"
                name="purchaserEmail"
                value={formData.purchaserEmail}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                placeholder="e.g. john@example.com"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-300">
                  Ticket Price ($)
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-300">
                  Ticket Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                >
                  <option value="general">General</option>
                  <option value="vip">VIP</option>
                  <option value="earlyBird">Early Bird</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="ticketCount" className="block text-sm font-medium text-gray-300">
                Number of Tickets
              </label>
              <input
                type="number"
                id="ticketCount"
                name="ticketCount"
                value={ticketCount}
                onChange={(e) => setTicketCount(parseInt(e.target.value) || 1)}
                min="1"
                max="20"
                className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                required
              />
            </div>
          </div>

          <div className="rounded-lg bg-zinc-800 p-3 sm:p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm sm:text-base text-white font-medium">Total</p>
                <p className="text-xs text-gray-400">{ticketCount} ticket(s) × ${formData.price}</p>
              </div>
              <p className="text-lg sm:text-xl font-bold text-amber-500">${(ticketCount * formData.price).toFixed(2)}</p>
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
              <Ticket size={14} className="mr-1 sm:mr-2 sm:size-16" />
              Add Tickets
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTicketModal;