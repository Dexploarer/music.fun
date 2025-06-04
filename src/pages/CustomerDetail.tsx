import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Edit, 
  Trash, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Tag, 
  Clock, 
  Save, 
  X,
  MessageSquare,
  Plus,
  Bell
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import Breadcrumbs, { useBreadcrumbs } from '../components/navigation/Breadcrumbs';
import { useCustomer, useCustomers, useCustomerInteractions } from '../hooks/useCRM';
import CustomerFormModal from '../components/crm/CustomerFormModal';
import InteractionFormModal from '../components/crm/InteractionFormModal';

const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: customer, isLoading, isError } = useCustomer(id || '');
  const { updateCustomer, deleteCustomer } = useCustomers();
  const { 
    interactions, 
    isLoading: isLoadingInteractions,
    createInteraction, 
    deleteInteraction, 
    isCreating: isCreatingInteraction 
  } = useCustomerInteractions(id);
  const breadcrumbs = useBreadcrumbs();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isInteractionModalOpen, setIsInteractionModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle updating a customer
  const handleUpdateCustomer = async (updatedData: any) => {
    if (!id) return;
    
    setIsSubmitting(true);
    try {
      await updateCustomer({
        id,
        updates: updatedData
      });
      setIsEditModalOpen(false);
      toast.success('Customer updated successfully');
    } catch (error: any) {
      toast.error(`Error updating customer: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle deleting a customer
  const handleDeleteCustomer = async () => {
    if (!id) return;
    
    setIsSubmitting(true);
    try {
      await deleteCustomer(id);
      toast.success('Customer deleted successfully');
      navigate('/customers');
    } catch (error: any) {
      toast.error(`Error deleting customer: ${error.message}`);
    } finally {
      setIsSubmitting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Handle adding a new interaction
  const handleAddInteraction = async (interactionData: any) => {
    if (!id) return;
    
    try {
      await createInteraction(interactionData);
      setIsInteractionModalOpen(false);
      toast.success('Interaction recorded successfully');
    } catch (error: any) {
      toast.error(`Error recording interaction: ${error.message}`);
    }
  };

  // Handle deleting an interaction
  const handleDeleteInteraction = async (interactionId: string) => {
    try {
      await deleteInteraction(interactionId);
      toast.success('Interaction deleted');
    } catch (error: any) {
      toast.error(`Error deleting interaction: ${error.message}`);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="mr-3 h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"></div>
        <p className="text-lg text-white">Loading customer details...</p>
      </div>
    );
  }

  // Error state
  if (isError || !customer) {
    return (
      <div className="rounded-xl bg-zinc-900 p-8 text-center">
        <h2 className="text-2xl font-semibold text-white">Customer not found</h2>
        <p className="mt-2 text-gray-400">The customer you're looking for doesn't exist or you don't have permission to view it.</p>
        <button 
          onClick={() => navigate('/customers')}
          className="mt-4 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
        >
          Back to Customers
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbs} />
      
      {/* Header */}
      <div className="flex flex-col items-start justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
        <div>
          <button 
            onClick={() => navigate('/customers')}
            className="mb-2 flex items-center text-sm font-medium text-gray-400 hover:text-white"
          >
            <ChevronLeft size={16} className="mr-1" />
            Back to Customers
          </button>
          <h1 className="font-playfair text-3xl font-bold tracking-tight text-white">
            {customer.firstName} {customer.lastName}
          </h1>
        </div>
        
        <div className="flex space-x-2">
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center rounded-lg bg-zinc-800 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 focus:outline-none"
          >
            <Edit size={16} className="mr-2" />
            Edit
          </button>
          <button 
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none"
          >
            <Trash size={16} className="mr-2" />
            Delete
          </button>
        </div>
      </div>

      {/* Customer Profile */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Customer Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl bg-zinc-900 p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-semibold text-white">Customer Information</h2>
            
            <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2">
              {customer.email && (
                <div className="flex items-start">
                  <Mail size={16} className="mr-2 mt-0.5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Email</p>
                    <p className="text-sm text-white">{customer.email}</p>
                  </div>
                </div>
              )}
              {customer.phone && (
                <div className="flex items-start">
                  <Phone size={16} className="mr-2 mt-0.5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Phone</p>
                    <p className="text-sm text-white">{customer.phone}</p>
                  </div>
                </div>
              )}
              {(customer.address || customer.city || customer.state) && (
                <div className="flex items-start col-span-full">
                  <MapPin size={16} className="mr-2 mt-0.5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Address</p>
                    <p className="text-sm text-white">
                      {customer.address && `${customer.address}, `}
                      {customer.city && `${customer.city}, `}
                      {customer.state}
                      {customer.zip && ` ${customer.zip}`}
                    </p>
                  </div>
                </div>
              )}
              {customer.birthday && (
                <div className="flex items-start">
                  <Calendar size={16} className="mr-2 mt-0.5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Birthday</p>
                    <p className="text-sm text-white">{format(new Date(customer.birthday), 'MMMM d, yyyy')}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start">
                <Clock size={16} className="mr-2 mt-0.5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Customer Since</p>
                  <p className="text-sm text-white">{format(new Date(customer.customerSince), 'MMMM d, yyyy')}</p>
                </div>
              </div>
              {customer.lastVisit && (
                <div className="flex items-start">
                  <Calendar size={16} className="mr-2 mt-0.5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Last Visit</p>
                    <p className="text-sm text-white">{format(new Date(customer.lastVisit), 'MMMM d, yyyy')}</p>
                  </div>
                </div>
              )}
            </div>
            
            {customer.notes && (
              <div className="mt-6">
                <h3 className="mb-2 text-sm font-medium text-gray-400">Notes</h3>
                <p className="text-gray-300">{customer.notes}</p>
              </div>
            )}
            
            {customer.tags && customer.tags.length > 0 && (
              <div className="mt-6">
                <h3 className="mb-2 text-sm font-medium text-gray-400">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {customer.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-full bg-zinc-800 px-2 py-1 text-xs font-medium text-gray-300"
                    >
                      <Tag size={10} className="mr-1 text-amber-500" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Interaction History */}
          <div className="rounded-xl bg-zinc-900 p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Interaction History</h2>
              <button
                onClick={() => setIsInteractionModalOpen(true)}
                className="inline-flex items-center rounded-lg bg-amber-600 px-3 py-1 text-sm font-medium text-white hover:bg-amber-700 focus:outline-none"
              >
                <Plus size={14} className="mr-1" />
                Add Interaction
              </button>
            </div>
            
            {isLoadingInteractions ? (
              <div className="flex items-center justify-center py-10">
                <div className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"></div>
                <p className="text-white">Loading interactions...</p>
              </div>
            ) : interactions && interactions.length > 0 ? (
              <div className="space-y-4">
                {interactions.map((interaction) => (
                  <div key={interaction.id} className="rounded-lg bg-zinc-800 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start">
                        <div className={`
                          mr-3 h-8 w-8 flex-shrink-0 rounded-full flex items-center justify-center 
                          ${interaction.type === 'call' ? 'bg-blue-600' : 
                            interaction.type === 'email' ? 'bg-green-600' : 
                            interaction.type === 'meeting' ? 'bg-purple-600' : 
                            interaction.type === 'purchase' ? 'bg-amber-600' : 
                            'bg-gray-600'
                          }
                        `}>
                          {interaction.type === 'call' ? <Phone size={16} className="text-white" /> :
                           interaction.type === 'email' ? <Mail size={16} className="text-white" /> :
                           interaction.type === 'meeting' ? <Calendar size={16} className="text-white" /> :
                           interaction.type === 'purchase' ? <ShoppingBag size={16} className="text-white" /> :
                           <MessageSquare size={16} className="text-white" />
                          }
                        </div>
                        <div>
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-white capitalize">{interaction.type}</span>
                            <span className="ml-2 text-xs text-gray-400">
                              {format(new Date(interaction.date), 'MMM d, yyyy h:mm a')}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-gray-300">{interaction.description}</p>
                          {interaction.staffMember && (
                            <div className="mt-1 text-xs text-gray-400 flex items-center">
                              <span className="mr-1">By:</span>
                              <span className="font-medium">{interaction.staffMember}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this interaction?')) {
                            handleDeleteInteraction(interaction.id);
                          }
                        }}
                        className="ml-2 rounded p-1 text-gray-400 hover:bg-zinc-700 hover:text-white"
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg bg-zinc-800 p-4 text-center">
                <p className="text-sm text-gray-300">No interactions recorded yet.</p>
                <button 
                  onClick={() => setIsInteractionModalOpen(true)}
                  className="mt-2 text-xs font-medium text-amber-500 hover:text-amber-400"
                >
                  Add the first interaction
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Information */}
        <div className="space-y-6">
          {/* Marketing Preferences */}
          <div className="rounded-xl bg-zinc-900 p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-semibold text-white">Marketing Preferences</h2>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Bell size={14} className="mr-2 text-gray-400" />
                  <span className="text-sm text-gray-300">Email Promotions</span>
                </div>
                <div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    customer.marketingPreferences.emailPromotions ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {customer.marketingPreferences.emailPromotions ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Bell size={14} className="mr-2 text-gray-400" />
                  <span className="text-sm text-gray-300">SMS Notifications</span>
                </div>
                <div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    customer.marketingPreferences.smsNotifications ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {customer.marketingPreferences.smsNotifications ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Bell size={14} className="mr-2 text-gray-400" />
                  <span className="text-sm text-gray-300">Newsletter</span>
                </div>
                <div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    customer.marketingPreferences.newsletter ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {customer.marketingPreferences.newsletter ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Bell size={14} className="mr-2 text-gray-400" />
                  <span className="text-sm text-gray-300">Special Events</span>
                </div>
                <div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    customer.marketingPreferences.specialEvents ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {customer.marketingPreferences.specialEvents ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
              
              {customer.marketingPreferences.unsubscribed && (
                <div className="mt-4 rounded-lg bg-red-900/20 p-3 text-center">
                  <p className="text-xs font-medium text-red-400">Customer has unsubscribed from all communications</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-xl bg-zinc-900 p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-semibold text-white">Quick Actions</h2>
            
            <div className="space-y-2">
              <button
                onClick={() => setIsInteractionModalOpen(true)}
                className="flex w-full items-center justify-between rounded-lg bg-zinc-800 p-3 text-left text-white hover:bg-zinc-700"
              >
                <span>Log Interaction</span>
                <MessageSquare size={16} className="text-gray-400" />
              </button>
              
              <button
                onClick={() => window.location.href = `mailto:${customer.email}`}
                className="flex w-full items-center justify-between rounded-lg bg-zinc-800 p-3 text-left text-white hover:bg-zinc-700"
                disabled={!customer.email}
              >
                <span>Send Email</span>
                <Mail size={16} className="text-gray-400" />
              </button>
              
              <button
                onClick={() => navigate('/ticketing/create')}
                className="flex w-full items-center justify-between rounded-lg bg-zinc-800 p-3 text-left text-white hover:bg-zinc-700"
              >
                <span>Add to Event</span>
                <Ticket size={16} className="text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Customer Modal */}
      {isEditModalOpen && (
        <CustomerFormModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleUpdateCustomer}
          initialCustomer={customer}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Add Interaction Modal */}
      {isInteractionModalOpen && (
        <InteractionFormModal
          isOpen={isInteractionModalOpen}
          onClose={() => setIsInteractionModalOpen(false)}
          onSave={handleAddInteraction}
          customerId={id || ''}
          isSubmitting={isCreatingInteraction}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-zinc-900 p-6 shadow-xl">
            <h3 className="mb-4 text-xl font-semibold text-white">Confirm Deletion</h3>
            <p className="mb-6 text-gray-300">
              Are you sure you want to delete <span className="font-medium text-white">{customer.firstName} {customer.lastName}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCustomer}
                disabled={isSubmitting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none disabled:opacity-70"
              >
                {isSubmitting ? 'Deleting...' : 'Delete Customer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Import Ticket icon here to avoid circular dependency
function Ticket(props: React.SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width={props.size || 24}
      height={props.size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="M13 5v2" />
      <path d="M13 17v2" />
      <path d="M13 11v2" />
    </svg>
  );
}

// Import ShoppingBag icon here to avoid circular dependency
function ShoppingBag(props: React.SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width={props.size || 24}
      height={props.size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M16 10a4 4 0 0 1-8 0" />
      <path d="M3 6h18" />
    </svg>
  );
}

export default CustomerDetail;