import React, { useState, useEffect } from 'react';
import { X, Save, MessageSquare, Calendar, User } from 'lucide-react';
import { CustomerInteraction } from '../../types';
import { format } from 'date-fns';

interface InteractionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (interaction: Omit<CustomerInteraction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  customerId: string;
  isSubmitting: boolean;
}

const InteractionFormModal: React.FC<InteractionFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  customerId,
  isSubmitting
}) => {
  const [formData, setFormData] = useState<Omit<CustomerInteraction, 'id' | 'createdAt' | 'updatedAt'>>({
    customerId,
    type: 'note',
    date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    description: null,
    staffMember: null,
    relatedEntityId: null,
    relatedEntityType: null
  });

  // Update customerId if it changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, customerId }));
  }, [customerId]);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value || null }));
  };

  // Handle related entity type change
  const handleRelatedEntityTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      relatedEntityType: value || null,
      relatedEntityId: null // Reset ID when type changes
    }));
  };

  // Form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative w-full max-w-md rounded-lg bg-zinc-900 shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-700 bg-zinc-900 px-4 py-4">
          <h2 className="font-playfair text-xl font-semibold text-white">Add Interaction</h2>
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
              <label htmlFor="type" className="block text-sm font-medium text-gray-300">
                Interaction Type <span className="text-red-500">*</span>
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
              >
                <option value="note">Note</option>
                <option value="call">Phone Call</option>
                <option value="email">Email</option>
                <option value="meeting">Meeting</option>
                <option value="event">Event Attendance</option>
                <option value="purchase">Purchase</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-300">
                Date & Time <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 flex items-center">
                <Calendar size={16} className="mr-2 text-gray-400" />
                <input
                  type="datetime-local"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300">
                Description <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 flex">
                <MessageSquare size={16} className="mr-2 mt-3 flex-shrink-0 text-gray-400" />
                <textarea
                  id="description"
                  name="description"
                  value={formData.description || ''}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  placeholder="Details about the interaction..."
                />
              </div>
            </div>

            <div>
              <label htmlFor="staffMember" className="block text-sm font-medium text-gray-300">
                Staff Member
              </label>
              <div className="mt-1 flex items-center">
                <User size={16} className="mr-2 text-gray-400" />
                <input
                  type="text"
                  id="staffMember"
                  name="staffMember"
                  value={formData.staffMember || ''}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  placeholder="Who handled this interaction?"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">
                Related To
              </label>
              <div className="mt-1 grid grid-cols-2 gap-4">
                <select
                  value={formData.relatedEntityType || ''}
                  onChange={handleRelatedEntityTypeChange}
                  className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white shadow-sm focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                >
                  <option value="">None</option>
                  <option value="event">Event</option>
                  <option value="purchase">Purchase</option>
                  <option value="marketing">Marketing Campaign</option>
                </select>
                
                {formData.relatedEntityType && (
                  <select
                    value={formData.relatedEntityId || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, relatedEntityId: e.target.value }))}
                    className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white shadow-sm focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  >
                    <option value="">Select {formData.relatedEntityType}...</option>
                    {/* Normally would populate with actual data from API */}
                    <option value="placeholder-1">Example {formData.relatedEntityType} 1</option>
                    <option value="placeholder-2">Example {formData.relatedEntityType} 2</option>
                  </select>
                )}
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
              disabled={isSubmitting || !formData.description}
              className="inline-flex items-center rounded-lg bg-amber-600 px-3 py-2 text-sm font-medium text-white hover:bg-amber-700 focus:outline-none disabled:opacity-70"
            >
              <Save size={16} className="mr-2" />
              {isSubmitting ? 'Saving...' : 'Save Interaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InteractionFormModal;