import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Edit,
  Trash,
  Package,
  DollarSign,
  Tag,
  Truck,
  Save,
  X,
  BarChart,
  ShoppingCart,
  ArrowDown,
  ArrowUp,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { useInventoryItem, useInventoryItems, useInventoryTransactions } from '../hooks/useInventory';
import Breadcrumbs, { useBreadcrumbs } from '../components/navigation/Breadcrumbs';
import InventoryFormModal from '../components/inventory/InventoryFormModal';
import TransactionFormModal from '../components/inventory/TransactionFormModal';
import { useInventoryCategories } from '../hooks/useInventory';
import { BarChart as RechartsBarChart, XAxis, YAxis, Tooltip, Legend, Bar, ResponsiveContainer } from 'recharts';

const InventoryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: item, isLoading, isError } = useInventoryItem(id || '');
  const { items, updateItem, deleteItem } = useInventoryItems();
  const { categories } = useInventoryCategories();
  const { 
    transactions, 
    isLoading: isLoadingTransactions, 
    createTransaction, 
    isCreating: isCreatingTransaction 
  } = useInventoryTransactions(id);
  const breadcrumbs = useBreadcrumbs();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'transactions' | 'analytics'>('details');
  
  // Generate mock analytics data
  const generateAnalyticsData = () => {
    const month = new Date().getMonth();
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    return Array.from({ length: 6 }, (_, i) => {
      const monthIndex = (month - 5 + i) % 12;
      const adjustedMonthIndex = monthIndex < 0 ? monthIndex + 12 : monthIndex;
      return {
        month: months[adjustedMonthIndex],
        inflow: Math.floor(Math.random() * 50),
        outflow: Math.floor(Math.random() * 30)
      };
    });
  };
  
  const analyticsData = generateAnalyticsData();

  // Handle updating an item
  const handleUpdateItem = async (updatedData: any) => {
    if (!id) return;
    
    setIsSubmitting(true);
    try {
      await updateItem({
        id,
        updates: updatedData
      });
      setIsEditModalOpen(false);
      toast.success('Item updated successfully');
    } catch (error: any) {
      toast.error(`Error updating item: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle deleting an item
  const handleDeleteItem = async () => {
    if (!id) return;
    
    setIsSubmitting(true);
    try {
      await deleteItem(id);
      toast.success('Item deleted successfully');
      navigate('/inventory');
    } catch (error: any) {
      toast.error(`Error deleting item: ${error.message}`);
    } finally {
      setIsSubmitting(false);
      setShowDeleteConfirm(false);
    }
  };
  
  // Handle adding a transaction
  const handleAddTransaction = async (transactionData: any) => {
    try {
      await createTransaction(transactionData);
      setIsTransactionModalOpen(false);
      toast.success('Transaction recorded successfully');
    } catch (error: any) {
      toast.error(`Error recording transaction: ${error.message}`);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="mr-3 h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"></div>
        <p className="text-lg text-white">Loading item details...</p>
      </div>
    );
  }

  // Error state
  if (isError || !item) {
    return (
      <div className="rounded-xl bg-zinc-900 p-8 text-center">
        <h2 className="text-2xl font-semibold text-white">Inventory item not found</h2>
        <p className="mt-2 text-gray-400">The item you're looking for doesn't exist or you don't have permission to view it.</p>
        <button 
          onClick={() => navigate('/inventory')}
          className="mt-4 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
        >
          Back to Inventory
        </button>
      </div>
    );
  }

  // Calculate profit margin if both unit price and cost price are available
  const profitMargin = (item.unitPrice && item.costPrice) 
    ? ((item.unitPrice - item.costPrice) / item.unitPrice * 100).toFixed(1)
    : null;

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbs} />
      
      {/* Header */}
      <div className="flex flex-col items-start justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
        <div>
          <button 
            onClick={() => navigate('/inventory')}
            className="mb-2 flex items-center text-sm font-medium text-gray-400 hover:text-white"
          >
            <ChevronLeft size={16} className="mr-1" />
            Back to Inventory
          </button>
          <h1 className="font-playfair text-3xl font-bold tracking-tight text-white">
            {item.name}
          </h1>
          {item.sku && (
            <div className="mt-1 text-sm text-gray-400">
              SKU: {item.sku}
            </div>
          )}
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

      {/* Stock level alert if applicable */}
      {item.currentStock < item.reorderLevel && (
        <div className="rounded-lg bg-amber-900/20 p-4 border border-amber-700">
          <div className="flex items-start">
            <AlertTriangle size={20} className="mr-2 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-base font-medium text-amber-400">Low Stock Alert</h3>
              <p className="mt-1 text-sm text-gray-300">
                Current stock of {item.currentStock} units is below the reorder level of {item.reorderLevel} units.
              </p>
              <button 
                onClick={() => setIsTransactionModalOpen(true)}
                className="mt-2 inline-flex items-center rounded-md bg-amber-700 px-2 py-1 text-xs font-medium text-white hover:bg-amber-600"
              >
                <Plus size={12} className="mr-1" /> Record Purchase
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-zinc-700">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('details')}
            className={`inline-flex items-center border-b-2 py-4 text-sm font-medium ${
              activeTab === 'details' 
                ? 'border-amber-500 text-amber-500' 
                : 'border-transparent text-gray-400 hover:border-gray-600 hover:text-white'
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`inline-flex items-center border-b-2 py-4 text-sm font-medium ${
              activeTab === 'transactions' 
                ? 'border-amber-500 text-amber-500' 
                : 'border-transparent text-gray-400 hover:border-gray-600 hover:text-white'
            }`}
          >
            Transactions
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`inline-flex items-center border-b-2 py-4 text-sm font-medium ${
              activeTab === 'analytics' 
                ? 'border-amber-500 text-amber-500' 
                : 'border-transparent text-gray-400 hover:border-gray-600 hover:text-white'
            }`}
          >
            Analytics
          </button>
        </div>
      </div>
      
      {/* Tab Content */}
      <div>
        {/* Details Tab */}
        {activeTab === 'details' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Item Details */}
            <div className="lg:col-span-2">
              <div className="rounded-xl bg-zinc-900 p-6 shadow-lg">
                <h2 className="mb-4 text-xl font-semibold text-white">Item Details</h2>
                
                {item.description && (
                  <div className="mb-6">
                    <h3 className="mb-2 text-sm font-medium text-gray-400">Description</h3>
                    <p className="text-gray-300">{item.description}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">Category</h3>
                    <p className="text-white">{item.categoryName || 'Uncategorized'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">Status</h3>
                    <p className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                      {item.isActive ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">Unit Price</h3>
                    <p className="text-white">${item.unitPrice?.toFixed(2) || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">Cost Price</h3>
                    <p className="text-white">${item.costPrice?.toFixed(2) || 'N/A'}</p>
                  </div>
                  
                  {profitMargin && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-400">Profit Margin</h3>
                      <p className="text-white">{profitMargin}%</p>
                    </div>
                  )}
                  
                  {item.vendor && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-400">Vendor / Supplier</h3>
                      <p className="text-white">{item.vendor}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Stock Information */}
            <div className="space-y-6">
              <div className="rounded-xl bg-zinc-900 p-6 shadow-lg">
                <h2 className="mb-4 text-xl font-semibold text-white">Stock Information</h2>
                
                <div className="space-y-4">
                  <div className="rounded-lg bg-zinc-800 p-4">
                    <p className="text-sm text-gray-400">Current Stock</p>
                    <p className="mt-1 text-2xl font-bold text-white">{item.currentStock}</p>
                    {item.currentStock < item.reorderLevel ? (
                      <p className="mt-1 text-xs text-amber-500">Below reorder level ({item.reorderLevel})</p>
                    ) : (
                      <p className="mt-1 text-xs text-gray-400">Reorder level: {item.reorderLevel}</p>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => setIsTransactionModalOpen(true)}
                    className="flex w-full items-center justify-between rounded-lg bg-zinc-800 p-3 text-left text-white transition-all hover:bg-zinc-700"
                  >
                    <span>Record Transaction</span>
                    <ShoppingCart size={16} className="text-gray-400" />
                  </button>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="rounded-xl bg-zinc-900 p-6 shadow-lg">
                <h2 className="mb-4 text-xl font-semibold text-white">Quick Stats</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Last Transaction</p>
                      <p className="text-sm text-white">
                        {isLoadingTransactions ? 'Loading...' : 
                          transactions.length > 0 ? 
                            format(new Date(transactions[0].transactionDate), 'MMM d, yyyy') : 
                            'No transactions'
                        }
                      </p>
                    </div>
                    <Calendar size={20} className="text-gray-400" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Last 30 Days Inflow</p>
                      <p className="text-sm text-green-400">+{Math.floor(Math.random() * 30)} units</p>
                    </div>
                    <ArrowUp size={20} className="text-green-400" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Last 30 Days Outflow</p>
                      <p className="text-sm text-red-400">-{Math.floor(Math.random() * 20)} units</p>
                    </div>
                    <ArrowDown size={20} className="text-red-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Transaction History</h2>
              <button 
                onClick={() => setIsTransactionModalOpen(true)}
                className="inline-flex items-center rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700"
              >
                <Plus size={14} className="mr-2" />
                New Transaction
              </button>
            </div>
            
            <div className="overflow-x-auto rounded-lg border border-zinc-800">
              <table className="min-w-full divide-y divide-zinc-800">
                <thead className="bg-zinc-900">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                      Date
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                      Type
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                      Quantity
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400 hidden sm:table-cell">
                      Recorded By
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400 hidden md:table-cell">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 bg-zinc-900">
                  {isLoadingTransactions ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-4 text-center text-white">
                        <div className="flex items-center justify-center">
                          <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-amber-600"></div>
                          Loading transactions...
                        </div>
                      </td>
                    </tr>
                  ) : transactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-4 text-center text-white">
                        No transactions recorded for this item
                      </td>
                    </tr>
                  ) : (
                    transactions.map(transaction => (
                      <tr key={transaction.id} className="hover:bg-zinc-800">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                          {format(new Date(transaction.transactionDate), 'MMM d, yyyy h:mm a')}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            transaction.transactionType === 'purchase' || transaction.transactionType === 'adjustment_add' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {transaction.transactionType === 'purchase' ? 'Purchase' :
                             transaction.transactionType === 'sale' ? 'Sale' :
                             transaction.transactionType === 'waste' ? 'Waste' :
                             transaction.transactionType === 'adjustment_add' ? 'Adjustment (+)' :
                             transaction.transactionType === 'adjustment_remove' ? 'Adjustment (-)' :
                             transaction.transactionType}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <span className={`font-medium ${
                            transaction.transactionType === 'purchase' || transaction.transactionType === 'adjustment_add' 
                              ? 'text-green-500' 
                              : 'text-red-500'
                          }`}>
                            {transaction.transactionType === 'purchase' || transaction.transactionType === 'adjustment_add' 
                              ? `+${transaction.quantity}` 
                              : `-${transaction.quantity}`}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 hidden sm:table-cell">
                          {transaction.createdBy || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300 hidden md:table-cell">
                          <div className="max-w-xs truncate">
                            {transaction.notes || '-'}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="rounded-xl bg-zinc-900 p-6 shadow-lg">
              <h2 className="mb-4 text-xl font-semibold text-white">Stock Trend</h2>
              
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={analyticsData}>
                    <XAxis dataKey="month" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#27272a', borderColor: '#3f3f46', color: '#E5E7EB' }}
                      itemStyle={{ color: '#E5E7EB' }}
                      labelStyle={{ color: '#E5E7EB' }}
                    />
                    <Legend />
                    <Bar dataKey="inflow" name="Stock Added" fill="#22c55e" />
                    <Bar dataKey="outflow" name="Stock Removed" fill="#ef4444" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4 text-sm text-center text-gray-400">
                Stock movement over the last 6 months
              </div>
            </div>
            
            {/* Stock Value and Metrics */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="rounded-xl bg-zinc-900 p-6 shadow-lg">
                <h2 className="mb-4 text-lg font-semibold text-white">Stock Value</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Current Stock Value</p>
                      <p className="text-xl font-bold text-white">
                        ${item.costPrice ? (item.currentStock * item.costPrice).toFixed(2) : 'N/A'}
                      </p>
                    </div>
                    <DollarSign size={24} className="text-amber-500" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Potential Revenue</p>
                      <p className="text-xl font-bold text-green-500">
                        ${item.unitPrice ? (item.currentStock * item.unitPrice).toFixed(2) : 'N/A'}
                      </p>
                    </div>
                    <BarChart size={24} className="text-green-500" />
                  </div>
                  
                  {profitMargin && (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Potential Profit</p>
                        <p className="text-xl font-bold text-amber-500">
                          ${((item.unitPrice! - item.costPrice!) * item.currentStock).toFixed(2)}
                        </p>
                      </div>
                      <ArrowUp size={24} className="text-amber-500" />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="rounded-xl bg-zinc-900 p-6 shadow-lg">
                <h2 className="mb-4 text-lg font-semibold text-white">Stock Metrics</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Turnover Rate</p>
                      <p className="text-xl font-bold text-white">1.2x</p>
                    </div>
                    <ArrowDownUp size={24} className="text-gray-400" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Days in Stock</p>
                      <p className="text-xl font-bold text-white">45 days</p>
                    </div>
                    <Calendar size={24} className="text-gray-400" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Recommended Order</p>
                      <p className="text-xl font-bold text-white">
                        {item.currentStock < item.reorderLevel ? Math.ceil(item.reorderLevel * 1.5) - item.currentStock : 0} units
                      </p>
                    </div>
                    <Truck size={24} className="text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Edit Item Modal */}
      {isEditModalOpen && (
        <InventoryFormModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleUpdateItem}
          initialItem={item}
          categories={categories}
          isSubmitting={isSubmitting}
        />
      )}
      
      {/* Add Transaction Modal */}
      {isTransactionModalOpen && (
        <TransactionFormModal
          isOpen={isTransactionModalOpen}
          onClose={() => setIsTransactionModalOpen(false)}
          onSave={handleAddTransaction}
          inventoryItems={items}
          itemId={id}
          isSubmitting={isCreatingTransaction}
        />
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-zinc-900 p-6 shadow-xl">
            <h3 className="mb-4 text-xl font-semibold text-white">Confirm Deletion</h3>
            <p className="mb-6 text-gray-300">
              Are you sure you want to delete <span className="font-medium text-white">{item.name}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteItem}
                disabled={isSubmitting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none disabled:opacity-70"
              >
                {isSubmitting ? 'Deleting...' : 'Delete Item'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryDetail;