import React, { useState, useEffect } from 'react';
import { X, Save, Package, DollarSign, ShoppingCart, Tag, Plus } from 'lucide-react';
import { InventoryItem, InventoryCategory } from '../../types';

interface InventoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialItem?: InventoryItem;
  categories: InventoryCategory[];
  isSubmitting: boolean;
}

const InventoryFormModal: React.FC<InventoryFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialItem,
  categories,
  isSubmitting
}) => {
  const [formData, setFormData] = useState<Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    sku: null,
    description: null,
    categoryId: null,
    unitPrice: null,
    costPrice: null,
    currentStock: 0,
    reorderLevel: 10,
    vendor: null,
    imageUrl: null,
    isActive: true
  });

  // Tag management for inventory items
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  // Predefined tag categories for inventory
  const tagOptions = {
    categories: ["Beer", "Wine", "Spirits", "Food", "Merchandise", "Equipment", "Supplies"],
    attributes: ["Alcoholic", "Non-alcoholic", "Vegan", "Gluten-free", "Perishable", "Shelf-stable"],
    suppliers: ["Local", "Regional", "National", "Import"],
    status: ["Fast-moving", "Slow-moving", "Low stock", "Discontinued", "Seasonal"]
  };

  // Initialize form with existing data if editing
  useEffect(() => {
    if (initialItem) {
      setFormData({
        name: initialItem.name,
        sku: initialItem.sku,
        description: initialItem.description,
        categoryId: initialItem.categoryId,
        unitPrice: initialItem.unitPrice,
        costPrice: initialItem.costPrice,
        currentStock: initialItem.currentStock,
        reorderLevel: initialItem.reorderLevel,
        vendor: initialItem.vendor,
        imageUrl: initialItem.imageUrl,
        isActive: initialItem.isActive
      });
      
      // Set tags if they exist in description
      if (initialItem.description) {
        const tagMatches = initialItem.description.match(/#([a-zA-Z0-9_]+)/g);
        if (tagMatches) {
          setTags(tagMatches.map(tag => tag.substring(1)));
        }
      }
    }
  }, [initialItem]);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData((prev) => ({ 
        ...prev, 
        [name]: value === '' ? null : Number(value) 
      }));
    } else if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData((prev) => ({ ...prev, [name]: checkbox.checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value || null }));
    }
  };
  
  // Handle tag input
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()];
      setTags(newTags);
      setTagInput('');
      
      // Update description with hashtags
      updateDescriptionWithTags(newTags);
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter(t => t !== tagToRemove);
    setTags(newTags);
    
    // Update description with hashtags
    updateDescriptionWithTags(newTags);
  };
  
  const handleAddPredefinedTag = (tagToAdd: string) => {
    if (!tags.includes(tagToAdd)) {
      const newTags = [...tags, tagToAdd];
      setTags(newTags);
      
      // Update description with hashtags
      updateDescriptionWithTags(newTags);
    }
  };
  
  // Update description field with tags as hashtags
  const updateDescriptionWithTags = (tagsArray: string[]) => {
    const existingDescription = formData.description || '';
    
    // Remove any existing hashtags
    const cleanDescription = existingDescription.replace(/#[a-zA-Z0-9_]+\s*/g, '').trim();
    
    // Add new hashtags
    const tagString = tagsArray.map(tag => `#${tag}`).join(' ');
    
    const newDescription = cleanDescription ? 
      `${cleanDescription}\n\n${tagString}` : 
      tagString;
    
    setFormData(prev => ({
      ...prev,
      description: newDescription
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-zinc-900 shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-700 bg-zinc-900 px-4 py-4">
          <h2 className="font-playfair text-xl font-semibold text-white">
            {initialItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                Item Name <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 flex items-center">
                <Tag size={16} className="mr-2 text-gray-400" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  placeholder="e.g. Kentucky Bourbon"
                />
              </div>
            </div>

            <div>
              <label htmlFor="sku" className="block text-sm font-medium text-gray-300">
                SKU / Item Code
              </label>
              <input
                type="text"
                id="sku"
                name="sku"
                value={formData.sku || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                placeholder="SKU123456"
              />
            </div>

            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-gray-300">
                Category
              </label>
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
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
                placeholder="Brief description of this item..."
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300">
                Item Tags
              </label>
              <div className="mt-1 flex">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
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
              
              {tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
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
              )}
              
              {/* Tag category sections */}
              <div className="mt-4 space-y-3">
                <div>
                  <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Categories</h4>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {tagOptions.categories.map(category => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => handleAddPredefinedTag(category)}
                        disabled={tags.includes(category)}
                        className={`rounded-full px-2.5 py-1 text-xs font-medium 
                          ${tags.includes(category) 
                            ? 'bg-amber-600 text-white cursor-default' 
                            : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700 hover:text-white'}`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Attributes</h4>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {tagOptions.attributes.map(attribute => (
                      <button
                        key={attribute}
                        type="button"
                        onClick={() => handleAddPredefinedTag(attribute)}
                        disabled={tags.includes(attribute)}
                        className={`rounded-full px-2.5 py-1 text-xs font-medium 
                          ${tags.includes(attribute) 
                            ? 'bg-amber-600 text-white cursor-default' 
                            : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700 hover:text-white'}`}
                      >
                        {attribute}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Supplier Type</h4>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {tagOptions.suppliers.map(supplier => (
                      <button
                        key={supplier}
                        type="button"
                        onClick={() => handleAddPredefinedTag(supplier)}
                        disabled={tags.includes(supplier)}
                        className={`rounded-full px-2.5 py-1 text-xs font-medium 
                          ${tags.includes(supplier) 
                            ? 'bg-amber-600 text-white cursor-default' 
                            : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700 hover:text-white'}`}
                      >
                        {supplier}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Status</h4>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {tagOptions.status.map(status => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => handleAddPredefinedTag(status)}
                        disabled={tags.includes(status)}
                        className={`rounded-full px-2.5 py-1 text-xs font-medium 
                          ${tags.includes(status) 
                            ? 'bg-amber-600 text-white cursor-default' 
                            : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700 hover:text-white'}`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="unitPrice" className="block text-sm font-medium text-gray-300">
                Unit Price ($)
              </label>
              <div className="mt-1 flex items-center">
                <DollarSign size={16} className="mr-2 text-gray-400" />
                <input
                  type="number"
                  id="unitPrice"
                  name="unitPrice"
                  value={formData.unitPrice === null ? '' : formData.unitPrice}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label htmlFor="costPrice" className="block text-sm font-medium text-gray-300">
                Cost Price ($)
              </label>
              <div className="mt-1 flex items-center">
                <DollarSign size={16} className="mr-2 text-gray-400" />
                <input
                  type="number"
                  id="costPrice"
                  name="costPrice"
                  value={formData.costPrice === null ? '' : formData.costPrice}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label htmlFor="currentStock" className="block text-sm font-medium text-gray-300">
                Current Stock <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 flex items-center">
                <ShoppingCart size={16} className="mr-2 text-gray-400" />
                <input
                  type="number"
                  id="currentStock"
                  name="currentStock"
                  value={formData.currentStock}
                  onChange={handleInputChange}
                  min="0"
                  step="1"
                  required
                  className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label htmlFor="reorderLevel" className="block text-sm font-medium text-gray-300">
                Reorder Level <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 flex items-center">
                <Package size={16} className="mr-2 text-gray-400" />
                <input
                  type="number"
                  id="reorderLevel"
                  name="reorderLevel"
                  value={formData.reorderLevel}
                  onChange={handleInputChange}
                  min="0"
                  step="1"
                  required
                  className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  placeholder="10"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">You'll be alerted when stock is below this level</p>
            </div>

            <div>
              <label htmlFor="vendor" className="block text-sm font-medium text-gray-300">
                Vendor / Supplier
              </label>
              <input
                type="text"
                id="vendor"
                name="vendor"
                value={formData.vendor || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                placeholder="e.g. ABC Distributors"
              />
            </div>

            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-300">
                Image URL
              </label>
              <input
                type="text"
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center">
                <input
                  id="isActive"
                  name="isActive"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-zinc-600 text-amber-600 focus:ring-amber-600"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-300">
                  Item is active and available for sale
                </label>
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
              disabled={isSubmitting || !formData.name}
              className="inline-flex items-center rounded-lg bg-amber-600 px-3 py-2 text-sm font-medium text-white hover:bg-amber-700 focus:outline-none disabled:opacity-70"
            >
              <Save size={16} className="mr-2" />
              {isSubmitting ? 'Saving...' : initialItem ? 'Update Item' : 'Save Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InventoryFormModal;