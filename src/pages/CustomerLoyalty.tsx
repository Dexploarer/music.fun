import React, { useState, useEffect } from 'react';
import { useCustomers } from '../hooks/useCRM';
import { 
  Award, 
  Gift, 
  Star, 
  UserPlus, 
  Clock, 
  Calendar, 
  Search,
  Filter,
  TrendingUp,
  Tag,
  CreditCard,
  ArrowUpRight,
  User,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Breadcrumbs, { useBreadcrumbs } from '../components/navigation/Breadcrumbs';
import { useLoyaltyProgram } from '../hooks/useLoyaltyProgram';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { Customer, LoyaltyTier } from '../types';

const CustomerLoyalty: React.FC = () => {
  const navigate = useNavigate();
  const breadcrumbs = useBreadcrumbs();
  const { customers, isLoading } = useCustomers();
  
  const { 
    loyaltyTiers, 
    pointsMultipliers,
    customerLoyalty,
    isLoadingLoyalty,
    updateCustomerPoints,
    updateCustomerTier
  } = useLoyaltyProgram();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState<string | null>(null);
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [pointsToAdd, setPointsToAdd] = useState<number>(0);
  const [pointsReason, setPointsReason] = useState<string>('');

  // Filter customers based on search and tier
  const filteredCustomers = customers.filter(customer => {
    const searchMatch = 
      `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (customer.tags && customer.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    
    if (!searchMatch) return false;
    
    if (!filterTier) return true;
    
    const customerLoyaltyInfo = customerLoyalty.find(cl => cl.customerId === customer.id);
    return customerLoyaltyInfo?.tierId === filterTier;
  });
  
  // Get customer tier and points
  const getCustomerLoyaltyInfo = (customerId: string) => {
    const info = customerLoyalty.find(cl => cl.customerId === customerId);
    if (!info) {
      return { points: 0, tier: null, tierName: 'None' };
    }
    
    const tier = loyaltyTiers.find(t => t.id === info.tierId);
    return {
      points: info.points,
      tier,
      tierName: tier?.name || 'None'
    };
  };
  
  // Handle adding points to customer
  const handleAddPoints = async () => {
    if (!selectedCustomer || pointsToAdd <= 0 || !pointsReason) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      await updateCustomerPoints(selectedCustomer.id, pointsToAdd, pointsReason);
      setShowPointsModal(false);
      setPointsToAdd(0);
      setPointsReason('');
      toast.success(`Added ${pointsToAdd} points to ${selectedCustomer.firstName} ${selectedCustomer.lastName}`);
    } catch (error) {
      console.error('Error adding points:', error);
      toast.error('Failed to add points');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbs} />
      
      <div className="flex flex-col justify-between space-y-3 sm:flex-row sm:items-center sm:space-y-0">
        <h1 className="font-playfair text-2xl sm:text-3xl font-bold tracking-tight text-white">Loyalty Program</h1>
        <div className="flex space-x-2">
          <button className="inline-flex items-center rounded-lg bg-zinc-800 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 focus:outline-none">
            <CreditCard size={16} className="mr-2" />
            Rewards
          </button>
          <button className="inline-flex items-center rounded-lg bg-amber-600 px-3 py-2 text-sm font-medium text-white hover:bg-amber-700 focus:outline-none">
            <Award size={16} className="mr-2" />
            Manage Tiers
          </button>
        </div>
      </div>
      
      {/* Tiers Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {loyaltyTiers.map((tier, index) => (
          <div 
            key={tier.id} 
            className={`rounded-lg p-4 ${
              index === 0 ? 'bg-zinc-900' : 
              index === 1 ? 'bg-gradient-to-br from-amber-900 to-amber-800' :
              'bg-gradient-to-br from-slate-900 to-slate-800'
            }`}
          >
            <div className="mb-2 flex items-center">
              <div className={`rounded-full p-2 ${
                index === 0 ? 'bg-zinc-800' :
                index === 1 ? 'bg-amber-700' :
                'bg-slate-700'
              }`}>
                {index === 0 ? (
                  <User size={16} className="text-gray-300" />
                ) : index === 1 ? (
                  <Award size={16} className="text-amber-300" />
                ) : (
                  <Star size={16} className="text-blue-300" />
                )}
              </div>
              <div className="ml-3">
                <h3 className="text-base font-medium text-white">{tier.name}</h3>
                <p className="text-xs text-gray-300">{tier.pointThreshold}+ points</p>
              </div>
            </div>
            <div className="mt-2 space-y-2 text-sm">
              {tier.benefits.split(',').map((benefit, i) => (
                <div key={i} className="flex items-start">
                  <div className="mr-2 mt-0.5">
                    <svg className="h-3 w-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-300">{benefit.trim()}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Point Multipliers */}
      <div className="rounded-lg bg-zinc-900 p-4 sm:p-6">
        <h2 className="mb-4 text-lg sm:text-xl font-semibold text-white">Point Multipliers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {pointsMultipliers.map((multiplier, index) => (
            <div key={index} className="rounded-lg bg-zinc-800 p-3">
              <div className="mb-2">
                <span className="rounded-full bg-amber-600 px-2 py-0.5 text-xs font-medium text-white">
                  {multiplier.multiplier}x
                </span>
                <h3 className="mt-1 font-medium text-white">{multiplier.name}</h3>
              </div>
              <p className="text-xs text-gray-400">{multiplier.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-zinc-800 rounded-lg">
          <div className="flex items-start">
            <Zap size={16} className="mr-2 text-amber-500 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-white">How Points Work</h3>
              <p className="mt-1 text-xs text-gray-300">
                Customers earn points for purchases, attending events, and more. 
                Points accumulate to unlock tier benefits and can be redeemed for rewards.
                Higher tiers provide better rewards and exclusive benefits.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Customers Section */}
      <div>
        <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
          <h2 className="text-lg sm:text-xl font-semibold text-white">Customers</h2>
          <div className="flex space-x-2">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search size={12} className="text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full rounded-lg border-0 bg-zinc-800 py-1.5 pl-8 pr-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              value={filterTier || ""}
              onChange={(e) => setFilterTier(e.target.value || null)}
              className="rounded-lg border-0 bg-zinc-800 py-1.5 pl-3 pr-8 text-white focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm"
            >
              <option value="">All Tiers</option>
              {loyaltyTiers.map(tier => (
                <option key={tier.id} value={tier.id}>{tier.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        {isLoading || isLoadingLoyalty ? (
          <div className="flex items-center justify-center py-8">
            <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-amber-600"></div>
            <p className="text-white">Loading customers...</p>
          </div>
        ) : filteredCustomers.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-zinc-800">
            <table className="min-w-full divide-y divide-zinc-800">
              <thead className="bg-zinc-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Tier</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Points</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Last Visit</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Tags</th>
                  <th className="relative px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 bg-zinc-900">
                {filteredCustomers.map(customer => {
                  const { points, tier, tierName } = getCustomerLoyaltyInfo(customer.id);
                  return (
                    <tr key={customer.id} className="hover:bg-zinc-800">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-amber-700 flex items-center justify-center text-xs font-medium text-white">
                            {customer.firstName[0]}{customer.lastName[0]}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-white">{customer.firstName} {customer.lastName}</div>
                            <div className="text-xs text-gray-400">{customer.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                          ${tierName === 'Gold' ? 'bg-amber-100 text-amber-800' : 
                            tierName === 'Platinum' ? 'bg-slate-100 text-slate-800' :
                            'bg-zinc-100 text-zinc-800'}`
                        }>
                          {tierName}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                        {points}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-300">
                          <Clock size={12} className="mr-1 text-gray-400" />
                          {customer.lastVisit ? format(new Date(customer.lastVisit), 'MMM d, yyyy') : 'Never'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {customer.tags.slice(0, 2).map((tag, idx) => (
                            <span key={idx} className="inline-flex items-center rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-gray-300">
                              {tag}
                            </span>
                          ))}
                          {customer.tags.length > 2 && (
                            <span className="inline-flex items-center rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-gray-500">
                              +{customer.tags.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setShowPointsModal(true);
                          }}
                          className="text-amber-500 hover:text-amber-400 mr-3"
                        >
                          Add Points
                        </button>
                        <button 
                          onClick={() => navigate(`/customers/${customer.id}`)}
                          className="text-gray-400 hover:text-white"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-lg bg-zinc-900 p-6 text-center">
            <UserPlus size={32} className="mx-auto text-amber-500 opacity-50" />
            <h2 className="mt-4 text-xl font-semibold text-white">No customers found</h2>
            <p className="mt-1 text-gray-400">
              {searchTerm || filterTier ? 'No customers match your filter criteria.' : 'Add customers to enroll them in the loyalty program.'}
            </p>
            <button
              onClick={() => navigate('/customers')}
              className="mt-4 inline-flex items-center rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
            >
              <UserPlus size={14} className="mr-2" />
              Manage Customers
            </button>
          </div>
        )}
        
        {/* Recent Activity */}
        {customerLoyalty.length > 0 && (
          <div className="mt-6 rounded-lg bg-zinc-900 p-4 sm:p-6">
            <h2 className="mb-3 text-lg font-semibold text-white">Recent Activity</h2>
            <div className="space-y-3">
              {customerLoyalty
                .slice(0, 5)
                .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
                .map((activity, index) => {
                  const customer = customers.find(c => c.id === activity.customerId);
                  if (!customer) return null;
                  
                  return (
                    <div key={index} className="rounded-lg bg-zinc-800 p-3">
                      <div className="flex justify-between">
                        <div className="flex items-center">
                          <div className="mr-3 h-8 w-8 rounded-full bg-amber-700 flex items-center justify-center text-xs font-medium text-white">
                            {customer.firstName[0]}{customer.lastName[0]}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">{customer.firstName} {customer.lastName}</div>
                            <div className="flex items-center text-xs text-gray-400">
                              <Clock size={10} className="mr-1" />
                              {format(new Date(activity.lastUpdated), 'MMM d, yyyy')}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-white">{activity.lastPointsAdded} points</div>
                          <div className="text-xs text-gray-400">{activity.lastPointsReason}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
      
      {/* Rewards Redemption */}
      <div className="rounded-lg bg-zinc-900 p-4 sm:p-6">
        <h2 className="mb-4 text-lg sm:text-xl font-semibold text-white flex items-center">
          <Gift size={18} className="mr-2 text-amber-500" />
          Available Rewards
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="rounded-lg bg-gradient-to-br from-zinc-800 to-zinc-900 p-4 border border-zinc-700">
            <div className="mb-2 flex items-center justify-between">
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                Regular
              </span>
              <span className="text-sm font-medium text-white">500 points</span>
            </div>
            <h3 className="text-base font-medium text-white">Free Drink Voucher</h3>
            <p className="mb-3 mt-1 text-sm text-gray-300">
              Redeem for one free standard drink at the venue bar.
            </p>
            <button className="w-full rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700">
              Redeem
            </button>
          </div>
          
          <div className="rounded-lg bg-gradient-to-br from-zinc-800 to-zinc-900 p-4 border border-zinc-700">
            <div className="mb-2 flex items-center justify-between">
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                Gold
              </span>
              <span className="text-sm font-medium text-white">1000 points</span>
            </div>
            <h3 className="text-base font-medium text-white">Free Admission</h3>
            <p className="mb-3 mt-1 text-sm text-gray-300">
              One free entry to a standard event (excludes special events).
            </p>
            <button className="w-full rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700">
              Redeem
            </button>
          </div>
          
          <div className="rounded-lg bg-gradient-to-br from-zinc-800 to-zinc-900 p-4 border border-zinc-700">
            <div className="mb-2 flex items-center justify-between">
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                Platinum
              </span>
              <span className="text-sm font-medium text-white">2500 points</span>
            </div>
            <h3 className="text-base font-medium text-white">VIP Experience</h3>
            <p className="mb-3 mt-1 text-sm text-gray-300">
              VIP treatment for one event including reserved seating and a drink package.
            </p>
            <button className="w-full rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">
              Redeem
            </button>
          </div>
          
          <div className="rounded-lg bg-gradient-to-br from-zinc-800 to-zinc-900 p-4 border border-zinc-700">
            <div className="mb-2 flex items-center justify-between">
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                Regular
              </span>
              <span className="text-sm font-medium text-white">750 points</span>
            </div>
            <h3 className="text-base font-medium text-white">Merchandise Credit</h3>
            <p className="mb-3 mt-1 text-sm text-gray-300">
              $15 credit toward venue merchandise.
            </p>
            <button className="w-full rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700">
              Redeem
            </button>
          </div>
          
          <div className="rounded-lg bg-gradient-to-br from-zinc-800 to-zinc-900 p-4 border border-zinc-700">
            <div className="mb-2 flex items-center justify-between">
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                Gold
              </span>
              <span className="text-sm font-medium text-white">1500 points</span>
            </div>
            <h3 className="text-base font-medium text-white">Event Pre-sale Access</h3>
            <p className="mb-3 mt-1 text-sm text-gray-300">
              Early access to tickets for the next 3 special events.
            </p>
            <button className="w-full rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700">
              Redeem
            </button>
          </div>
          
          <div className="rounded-lg bg-gradient-to-br from-zinc-800 to-zinc-900 p-4 border border-zinc-700">
            <div className="mb-2 flex items-center justify-between">
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                Platinum
              </span>
              <span className="text-sm font-medium text-white">5000 points</span>
            </div>
            <h3 className="text-base font-medium text-white">Meet & Greet Pass</h3>
            <p className="mb-3 mt-1 text-sm text-gray-300">
              Meet and greet with an artist at an upcoming event.
            </p>
            <button className="w-full rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">
              Redeem
            </button>
          </div>
        </div>
      </div>
      
      {/* Add Points Modal */}
      {showPointsModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="max-w-md rounded-lg bg-zinc-900 p-6 shadow-xl w-full">
            <h2 className="mb-4 text-xl font-semibold text-white">Add Loyalty Points</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Customer
                </label>
                <div className="mt-1 flex items-center">
                  <div className="mr-3 h-8 w-8 rounded-full bg-amber-700 flex items-center justify-center text-xs font-medium text-white">
                    {selectedCustomer.firstName[0]}{selectedCustomer.lastName[0]}
                  </div>
                  <div>
                    <div className="text-white">{selectedCustomer.firstName} {selectedCustomer.lastName}</div>
                    <div className="text-xs text-gray-400">Current: {getCustomerLoyaltyInfo(selectedCustomer.id).points} points</div>
                  </div>
                </div>
              </div>
              
              <div>
                <label htmlFor="points" className="block text-sm font-medium text-gray-300">
                  Points to Add
                </label>
                <input
                  type="number"
                  id="points"
                  value={pointsToAdd}
                  onChange={(e) => setPointsToAdd(Math.max(0, parseInt(e.target.value) || 0))}
                  min="0"
                  className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                />
              </div>
              
              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-300">
                  Reason
                </label>
                <select
                  id="reason"
                  value={pointsReason}
                  onChange={(e) => setPointsReason(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                >
                  <option value="">Select reason...</option>
                  <option value="Event Attendance">Event Attendance</option>
                  <option value="Bar Purchase">Bar Purchase</option>
                  <option value="Merchandise Purchase">Merchandise Purchase</option>
                  <option value="Referral">Customer Referral</option>
                  <option value="Special Promotion">Special Promotion</option>
                  <option value="Birthday Bonus">Birthday Bonus</option>
                </select>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowPointsModal(false)}
                className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddPoints}
                className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
              >
                Add Points
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerLoyalty;