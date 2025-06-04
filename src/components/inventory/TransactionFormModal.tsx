import React, { useState, useEffect } from 'react';
import { X, Save, Package, ArrowDown, ArrowUp, Calendar, User } from 'lucide-react';
import { InventoryTransaction, InventoryItem } from '../../types';

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<InventoryTransaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  inventoryItems: InventoryItem[];
  itemId?: string;
  isSubmitting: boolean;
}

const TransactionFormModal: React.FC<TransactionFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  inventoryItems,
  itemId,
  isSubmitting
}) => {
  const [formData, setFormData] = useState<Omit<InventoryTransaction, 'id' | 'createdAt' | 'updatedAt'>>({
    itemId: itemId || '',
    transactionType: 'purchase',
    quantity: 1,
    transactionDate: new Date().toISOString(),
    notes: null,
    relatedEntityId: null,
    relatedEntityType: null,
    createdBy: null
  });

  // Update itemId if it changes
  useEffect(() => {
    if (itemId) {
      setFormData(prev => ({ ...prev, itemId }));
    }
  }, [itemId]);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData((prev) => ({ ...prev, [name]: value === '' ? 1 : Number(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value || null }));
    }
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
          <h2 className="font-playfair text-xl font-semibold text-white">Record Transaction</h2>
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
              <label htmlFor="itemId" className="block text-sm font-medium text-gray-300">
                Inventory Item <span className="text-red-500">*</span>
              </label>
              <select
                id="itemId"
                name="itemId"
                value={formData.itemId}
                onChange={handleInputChange}
                required
                disabled={!!itemId}
                className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500 disabled:opacity-70"
              >
                <option value="">Select an item</option>
                {inventoryItems.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name} {item.sku ? `(${item.sku})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="transactionType" className="block text-sm font-medium text-gray-300">
                Transaction Type <span className="text-red-500">*</span>
              </label>
              <select
                id="transactionType"
                name="transactionType"
                value={formData.transactionType}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
              >
                <option value="purchase">Purchase / Restock</option>
                <option value="sale">Sale</option>
                <option value="waste">Waste / Loss</option>
                <option value="adjustment_add">Adjustment (Add)</option>
                <option value="adjustment_remove">Adjustment (Remove)</option>
              </select>
            </div>

            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-300">
                Quantity <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 flex items-center">
                {formData.transactionType === 'purchase' || formData.transactionType === 'adjustment_add' ? (
                  <ArrowUp size={16} className="mr-2 text-green-500" />
                ) : (
                  <ArrowDown size={16} className="mr-2 text-red-500" />
                )}
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  min="1"
                  step="1"
                  required
                  className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="transactionDate" className="block text-sm font-medium text-gray-300">
                Date & Time <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 flex items-center">
                <Calendar size={16} className="mr-2 text-gray-400" />
                <input
                  type="datetime-local"
                  id="transactionDate"
                  name="transactionDate"
                  value={formData.transactionDate ? new Date(formData.transactionDate).toISOString().slice(0, 16) : ''}
                  onChange={handleInputChange}
                  required
                  className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                />
              </div>
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
                placeholder="Any additional details..."
              />
            </div>

            <div>
              <label htmlFor="createdBy" className="block text-sm font-medium text-gray-300">
                Recorded By
              </label>
              <div className="mt-1 flex items-center">
                <User size={16} className="mr-2 text-gray-400" />
                <input
                  type="text"
                  id="createdBy"
                  name="createdBy"
                  value={formData.createdBy || ''}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  placeholder="Your name"
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
                  <option value="order">Customer Order</option>
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
              disabled={isSubmitting || !formData.itemId || !formData.quantity}
              className="inline-flex items-center rounded-lg bg-amber-600 px-3 py-2 text-sm font-medium text-white hover:bg-amber-700 focus:outline-none disabled:opacity-70"
            >
              <Save size={16} className="mr-2" />
              {isSubmitting ? 'Saving...' : 'Record Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionFormModal;