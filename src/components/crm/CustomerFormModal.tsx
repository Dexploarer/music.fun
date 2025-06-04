import React, { useState, useEffect } from 'react';
import { X, Save, UserPlus, Calendar, Mail, Phone, MapPin, Tag, Plus } from 'lucide-react';
import { Customer } from '../../types';
import { format } from 'date-fns';
import { ValidatedInput, ValidatedTextarea, ValidatedSelect, FormField } from '../ui/FormField';
import { useCustomerValidation } from '../../hooks/useCRM';

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialCustomer?: Customer;
  isSubmitting: boolean;
}

const CustomerFormModal: React.FC<CustomerFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialCustomer,
  isSubmitting
}) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'contact' | 'marketing'>('basic');
  const [tag, setTag] = useState('');
  
  // Validation hook
  const { fieldErrors, isValidating, validateField, validateForm, clearAllErrors } = useCustomerValidation();
  
  // Field-specific validation functions
  const createFieldValidator = (fieldName: string) => (value: string) => validateField(fieldName, value);
  const [formData, setFormData] = useState<Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>>({
    firstName: '',
    lastName: '',
    email: null,
    phone: null,
    address: null,
    city: null,
    state: null,
    zip: null,
    notes: null,
    birthday: null,
    customerSince: format(new Date(), 'yyyy-MM-dd'),
    lastVisit: null,
    tags: [],
    marketingPreferences: {
      newsletter: true,
      smsNotifications: false,
      emailPromotions: true,
      specialEvents: true,
      unsubscribed: false
    }
  });
  
  // Predefined tag categories for customer segmentation
  const tagCategories = {
    preferences: ["Live Music", "Bar", "Food", "VIP Experience", "Quiet Seating", "Dancing", "Group Events"],
    frequency: ["Regular", "Occasional", "First-Timer", "Returning", "VIP Member"],
    interests: ["Blues", "Jazz", "Country", "Rock", "Folk", "Americana", "Bluegrass", "Pop"],
    demographics: ["Student", "Professional", "Senior", "Family", "Local", "Tourist"]
  };

  // Initialize form with existing data if editing
  useEffect(() => {
    if (initialCustomer) {
      setFormData({
        firstName: initialCustomer.firstName,
        lastName: initialCustomer.lastName,
        email: initialCustomer.email,
        phone: initialCustomer.phone,
        address: initialCustomer.address,
        city: initialCustomer.city,
        state: initialCustomer.state,
        zip: initialCustomer.zip,
        notes: initialCustomer.notes,
        birthday: initialCustomer.birthday,
        customerSince: initialCustomer.customerSince,
        lastVisit: initialCustomer.lastVisit,
        tags: initialCustomer.tags,
        marketingPreferences: initialCustomer.marketingPreferences
      });
    }
  }, [initialCustomer]);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value || null }));
  };

  // Handle checkbox changes for marketing preferences
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      marketingPreferences: {
        ...prev.marketingPreferences,
        [name]: checked
      }
    }));
  };

  // Handle adding a tag
  const handleAddTag = () => {
    if (tag.trim() && !formData.tags.includes(tag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()]
      }));
      setTag('');
    }
  };

  // Handle removing a tag
  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tagToRemove)
    }));
  };
  
  // Handle adding a predefined tag
  const handleAddPredefinedTag = (tagToAdd: string) => {
    if (!formData.tags.includes(tagToAdd)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagToAdd]
      }));
    }
  };

  // Form submission with validation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    const { valid, errors } = await validateForm(formData);
    
    if (!valid) {
      console.log('Form validation failed:', errors);
      return;
    }
    
    if (!formData.firstName || !formData.lastName) return;
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-zinc-900 shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-700 bg-zinc-900 px-4 py-4 sm:px-6">
          <h2 className="font-playfair text-xl font-semibold text-white">
            {initialCustomer ? 'Edit Customer' : 'Add New Customer'}
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
          {/* Tabs */}
          <div className="mb-6 flex border-b border-zinc-700 overflow-x-auto">
            <button
              type="button"
              className={`border-b-2 px-4 py-2 text-sm font-medium ${
                activeTab === 'basic'
                  ? 'border-amber-500 text-amber-500'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('basic')}
            >
              Basic Information
            </button>
            <button
              type="button"
              className={`border-b-2 px-4 py-2 text-sm font-medium ${
                activeTab === 'contact'
                  ? 'border-amber-500 text-amber-500'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('contact')}
            >
              Contact Details
            </button>
            <button
              type="button"
              className={`border-b-2 px-4 py-2 text-sm font-medium ${
                activeTab === 'marketing'
                  ? 'border-amber-500 text-amber-500'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('marketing')}
            >
              Marketing Preferences
            </button>
          </div>

          {/* Basic Information Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <ValidatedInput
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  onValidate={createFieldValidator('firstName')}
                  fieldKey="firstName"
                  error={fieldErrors.firstName}
                  required
                  placeholder="John"
                />
                <ValidatedInput
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  onValidate={createFieldValidator('lastName')}
                  fieldKey="lastName"
                  error={fieldErrors.lastName}
                  required
                  placeholder="Smith"
                />
              </div>

              <div>
                <label htmlFor="birthday" className="block text-sm font-medium text-gray-300">
                  Birthday
                </label>
                <div className="mt-1 flex items-center">
                  <Calendar size={16} className="mr-2 text-gray-400" />
                  <input
                    type="date"
                    id="birthday"
                    name="birthday"
                    value={formData.birthday || ''}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="customerSince" className="block text-sm font-medium text-gray-300">
                    Customer Since
                  </label>
                  <div className="mt-1 flex items-center">
                    <Calendar size={16} className="mr-2 text-gray-400" />
                    <input
                      type="date"
                      id="customerSince"
                      name="customerSince"
                      value={formData.customerSince}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="lastVisit" className="block text-sm font-medium text-gray-300">
                    Last Visit
                  </label>
                  <div className="mt-1 flex items-center">
                    <Calendar size={16} className="mr-2 text-gray-400" />
                    <input
                      type="date"
                      id="lastVisit"
                      name="lastVisit"
                      value={formData.lastVisit || ''}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              <ValidatedTextarea
                label="Notes"
                name="notes"
                value={formData.notes || ''}
                onChange={handleInputChange}
                onValidate={createFieldValidator('notes')}
                fieldKey="notes"
                error={fieldErrors.notes}
                rows={3}
                placeholder="Any additional notes about this customer..."
                description="Private notes about customer preferences, special requests, etc."
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Customer Tags
                </label>
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
                
                {formData.tags.length > 0 && (
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
                )}
                
                {/* Tag category sections */}
                <div className="mt-4 space-y-3">
                  <div>
                    <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Preferences</h4>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {tagCategories.preferences.map(preference => (
                        <button
                          key={preference}
                          type="button"
                          onClick={() => handleAddPredefinedTag(preference)}
                          disabled={formData.tags.includes(preference)}
                          className={`rounded-full px-2.5 py-1 text-xs font-medium 
                            ${formData.tags.includes(preference) 
                              ? 'bg-amber-600 text-white cursor-default' 
                              : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700 hover:text-white'}`}
                        >
                          {preference}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Visit Frequency</h4>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {tagCategories.frequency.map(frequency => (
                        <button
                          key={frequency}
                          type="button"
                          onClick={() => handleAddPredefinedTag(frequency)}
                          disabled={formData.tags.includes(frequency)}
                          className={`rounded-full px-2.5 py-1 text-xs font-medium 
                            ${formData.tags.includes(frequency) 
                              ? 'bg-amber-600 text-white cursor-default' 
                              : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700 hover:text-white'}`}
                        >
                          {frequency}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Music Interests</h4>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {tagCategories.interests.map(interest => (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => handleAddPredefinedTag(interest)}
                          disabled={formData.tags.includes(interest)}
                          className={`rounded-full px-2.5 py-1 text-xs font-medium 
                            ${formData.tags.includes(interest) 
                              ? 'bg-amber-600 text-white cursor-default' 
                              : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700 hover:text-white'}`}
                        >
                          {interest}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Demographics</h4>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {tagCategories.demographics.map(demographic => (
                        <button
                          key={demographic}
                          type="button"
                          onClick={() => handleAddPredefinedTag(demographic)}
                          disabled={formData.tags.includes(demographic)}
                          className={`rounded-full px-2.5 py-1 text-xs font-medium 
                            ${formData.tags.includes(demographic) 
                              ? 'bg-amber-600 text-white cursor-default' 
                              : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700 hover:text-white'}`}
                        >
                          {demographic}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contact Details Tab */}
          {activeTab === 'contact' && (
            <div className="space-y-4">
              <div className="space-y-4">
                <ValidatedInput
                  type="email"
                  label="Email Address"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  onValidate={createFieldValidator('email')}
                  fieldKey="email"
                  error={fieldErrors.email}
                  placeholder="john@example.com"
                  description="We'll use this for event notifications and receipts"
                />

                <ValidatedInput
                  type="tel"
                  label="Phone Number"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleInputChange}
                  onValidate={createFieldValidator('phone')}
                  fieldKey="phone"
                  error={fieldErrors.phone}
                  placeholder="(555) 123-4567"
                  description="For SMS notifications and event reminders"
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-300">
                  Street Address
                </label>
                <div className="mt-1 flex items-center">
                  <MapPin size={16} className="mr-2 text-gray-400" />
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address || ''}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                    placeholder="123 Main St"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-300">
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                    placeholder="Corbin"
                  />
                </div>
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-300">
                    State
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                    placeholder="KY"
                  />
                </div>
                <div>
                  <label htmlFor="zip" className="block text-sm font-medium text-gray-300">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    id="zip"
                    name="zip"
                    value={formData.zip || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                    placeholder="40701"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Marketing Preferences Tab */}
          {activeTab === 'marketing' && (
            <div className="space-y-4">
              <div className="rounded-lg bg-zinc-800 p-4">
                <h3 className="mb-3 text-sm font-medium text-white">Marketing Preferences</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      id="newsletter"
                      name="newsletter"
                      type="checkbox"
                      checked={formData.marketingPreferences.newsletter}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 rounded border-zinc-600 text-amber-600 focus:ring-amber-600"
                    />
                    <label htmlFor="newsletter" className="ml-2 text-sm text-gray-300">
                      Monthly newsletter
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="specialEvents"
                      name="specialEvents"
                      type="checkbox"
                      checked={formData.marketingPreferences.specialEvents}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 rounded border-zinc-600 text-amber-600 focus:ring-amber-600"
                    />
                    <label htmlFor="specialEvents" className="ml-2 text-sm text-gray-300">
                      Special event announcements
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="emailPromotions"
                      name="emailPromotions"
                      type="checkbox"
                      checked={formData.marketingPreferences.emailPromotions}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 rounded border-zinc-600 text-amber-600 focus:ring-amber-600"
                    />
                    <label htmlFor="emailPromotions" className="ml-2 text-sm text-gray-300">
                      Email promotions
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="smsNotifications"
                      name="smsNotifications"
                      type="checkbox"
                      checked={formData.marketingPreferences.smsNotifications}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 rounded border-zinc-600 text-amber-600 focus:ring-amber-600"
                    />
                    <label htmlFor="smsNotifications" className="ml-2 text-sm text-gray-300">
                      SMS notifications
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="unsubscribed"
                      name="unsubscribed"
                      type="checkbox"
                      checked={formData.marketingPreferences.unsubscribed}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 rounded border-zinc-600 text-amber-600 focus:ring-amber-600"
                    />
                    <label htmlFor="unsubscribed" className="ml-2 text-sm text-gray-300">
                      <strong>Unsubscribed from all communications</strong>
                    </label>
                  </div>
                </div>
                <p className="mt-4 text-xs text-gray-400">
                  We'll only send communications based on these preferences and our privacy policy.
                </p>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="mt-6 flex justify-between">
            <div className="flex space-x-2">
              {activeTab !== 'basic' && (
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === 'contact' ? 'basic' : 'contact')}
                  className="rounded-lg bg-zinc-800 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 focus:outline-none"
                >
                  Previous
                </button>
              )}
              {activeTab !== 'marketing' && (
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === 'basic' ? 'contact' : 'marketing')}
                  className="rounded-lg bg-zinc-800 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 focus:outline-none"
                >
                  Next
                </button>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-zinc-800 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 focus:outline-none"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.firstName || !formData.lastName}
                className="inline-flex items-center rounded-lg bg-amber-600 px-3 py-2 text-sm font-medium text-white hover:bg-amber-700 focus:outline-none disabled:opacity-70"
              >
                <Save size={16} className="mr-2" />
                {isSubmitting ? 'Saving...' : initialCustomer ? 'Update Customer' : 'Save Customer'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerFormModal;