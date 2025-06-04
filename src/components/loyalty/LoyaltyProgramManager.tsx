import React, { useState } from 'react';
import { Award, Gift, Calendar, User, ChevronsUp, BarChart, Download, Filter, Search, Clock, CheckCircle, ChevronRight, PlusCircle, Trash, Edit } from 'lucide-react';

// Sample customer loyalty data
const LOYALTY_TIERS = [
  { id: 1, name: 'Bronze', pointThreshold: 0, benefits: ['10% off merchandise', 'Birthday drink'] },
  { id: 2, name: 'Silver', pointThreshold: 100, benefits: ['15% off merchandise', 'Birthday drink', '1 free drink per month'] },
  { id: 3, name: 'Gold', pointThreshold: 250, benefits: ['20% off merchandise', 'Birthday drink', '2 free drinks per month', 'Priority seating'] },
  { id: 4, name: 'Platinum', pointThreshold: 500, benefits: ['25% off merchandise', 'Birthday drink', '2 free drinks per month', 'Priority seating', 'Free entry to select shows'] },
  { id: 5, name: 'VIP', pointThreshold: 1000, benefits: ['30% off merchandise', 'Birthday drink', 'Unlimited free drinks', 'Reserved seating', 'Free entry to all shows', 'Annual appreciation gift'] },
];

// Sample customer loyalty members
const LOYALTY_MEMBERS = [
  { id: 1, name: 'John Smith', email: 'john@example.com', tier: 'Gold', points: 387, joined: '2024-01-15', lastVisit: '2025-06-10', visitsThisYear: 12, totalSpent: 1250 },
  { id: 2, name: 'Emily Johnson', email: 'emily@example.com', tier: 'Platinum', points: 652, joined: '2023-08-22', lastVisit: '2025-05-28', visitsThisYear: 24, totalSpent: 2850 },
  { id: 3, name: 'Michael Brown', email: 'michael@example.com', tier: 'Silver', points: 175, joined: '2024-03-05', lastVisit: '2025-06-12', visitsThisYear: 8, totalSpent: 780 },
  { id: 4, name: 'Sarah Davis', email: 'sarah@example.com', tier: 'VIP', points: 1352, joined: '2022-11-18', lastVisit: '2025-06-15', visitsThisYear: 32, totalSpent: 4500 },
  { id: 5, name: 'Robert Wilson', email: 'robert@example.com', tier: 'Bronze', points: 45, joined: '2024-05-30', lastVisit: '2025-06-02', visitsThisYear: 2, totalSpent: 180 },
  { id: 6, name: 'Jennifer Thompson', email: 'jennifer@example.com', tier: 'Gold', points: 325, joined: '2023-12-10', lastVisit: '2025-05-15', visitsThisYear: 14, totalSpent: 1680 },
];

// Sample rewards
const AVAILABLE_REWARDS = [
  { id: 1, name: 'Free Drink', pointCost: 25, description: 'Redeem for any drink at the bar', available: true, expires: null },
  { id: 2, name: 'Show Ticket', pointCost: 100, description: 'Redeem for one general admission ticket', available: true, expires: null },
  { id: 3, name: 'VIP Upgrade', pointCost: 75, description: 'Upgrade any ticket to VIP status', available: true, expires: null },
  { id: 4, name: 'Merchandise Discount', pointCost: 50, description: '25% off any merchandise item', available: true, expires: null },
  { id: 5, name: 'Special Event Access', pointCost: 200, description: 'Access to members-only events', available: true, expires: null },
];

// Sample redemption history
const REDEMPTION_HISTORY = [
  { id: 1, memberId: 4, memberName: 'Sarah Davis', reward: 'Free Drink', pointCost: 25, date: '2025-06-15' },
  { id: 2, memberId: 1, memberName: 'John Smith', reward: 'Show Ticket', pointCost: 100, date: '2025-06-10' },
  { id: 3, memberId: 2, memberName: 'Emily Johnson', reward: 'VIP Upgrade', pointCost: 75, date: '2025-05-28' },
  { id: 4, memberId: 6, memberName: 'Jennifer Thompson', reward: 'Merchandise Discount', pointCost: 50, date: '2025-05-15' },
  { id: 5, memberId: 2, memberName: 'Emily Johnson', reward: 'Free Drink', pointCost: 25, date: '2025-05-08' },
  { id: 6, memberId: 4, memberName: 'Sarah Davis', reward: 'Special Event Access', pointCost: 200, date: '2025-04-22' },
];

// Generate color for loyalty tiers
const getTierColor = (tier: string) => {
  switch (tier) {
    case 'Bronze': return 'bg-amber-700 text-amber-100';
    case 'Silver': return 'bg-gray-400 text-gray-900';
    case 'Gold': return 'bg-amber-500 text-amber-950';
    case 'Platinum': return 'bg-indigo-600 text-indigo-100';
    case 'VIP': return 'bg-purple-600 text-purple-100';
    default: return 'bg-gray-700 text-gray-100';
  }
};

interface LoyaltyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
  type: 'customer' | 'reward' | 'tier';
  isEditing?: boolean;
}

const LoyaltyFormModal: React.FC<LoyaltyFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  type,
  isEditing = false
}) => {
  const [formData, setFormData] = useState(() => {
    if (type === 'customer') {
      return initialData || {
        name: '',
        email: '',
        tier: 'Bronze',
        points: 0,
        visitsThisYear: 0,
        totalSpent: 0
      };
    } else if (type === 'reward') {
      return initialData || {
        name: '',
        pointCost: 0,
        description: '',
        available: true,
        expires: null
      };
    } else {
      return initialData || {
        name: '',
        pointThreshold: 0,
        benefits: ['']
      };
    }
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? parseFloat(value) : value
    }));
  };
  
  const handleBenefitChange = (index: number, value: string) => {
    if (type === 'tier') {
      const newBenefits = [...formData.benefits];
      newBenefits[index] = value;
      setFormData(prev => ({
        ...prev,
        benefits: newBenefits
      }));
    }
  };
  
  const handleAddBenefit = () => {
    if (type === 'tier') {
      setFormData(prev => ({
        ...prev,
        benefits: [...prev.benefits, '']
      }));
    }
  };
  
  const handleRemoveBenefit = (index: number) => {
    if (type === 'tier') {
      const newBenefits = [...formData.benefits];
      newBenefits.splice(index, 1);
      setFormData(prev => ({
        ...prev,
        benefits: newBenefits
      }));
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative w-full max-w-md rounded-lg bg-zinc-900 shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-700 bg-zinc-900 px-4 py-4">
          <h2 className="font-playfair text-xl font-semibold text-white">
            {isEditing ? `Edit ${type === 'customer' ? 'Member' : type === 'reward' ? 'Reward' : 'Tier'}` : 
                        `Add ${type === 'customer' ? 'Member' : type === 'reward' ? 'Reward' : 'Tier'}`}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-zinc-800 hover:text-white"
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          <div className="space-y-4">
            {type === 'customer' && (
              <>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                    placeholder="John Smith"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                    placeholder="john@example.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="tier" className="block text-sm font-medium text-gray-300">
                    Loyalty Tier
                  </label>
                  <select
                    id="tier"
                    name="tier"
                    value={formData.tier}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  >
                    {LOYALTY_TIERS.map(tier => (
                      <option key={tier.id} value={tier.name}>{tier.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="points" className="block text-sm font-medium text-gray-300">
                      Points
                    </label>
                    <input
                      type="number"
                      id="points"
                      name="points"
                      value={formData.points}
                      onChange={handleChange}
                      min="0"
                      className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="totalSpent" className="block text-sm font-medium text-gray-300">
                      Total Spent ($)
                    </label>
                    <input
                      type="number"
                      id="totalSpent"
                      name="totalSpent"
                      value={formData.totalSpent}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </>
            )}
            
            {type === 'reward' && (
              <>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                    Reward Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                    placeholder="e.g. Free Drink"
                  />
                </div>
                
                <div>
                  <label htmlFor="pointCost" className="block text-sm font-medium text-gray-300">
                    Point Cost <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="pointCost"
                    name="pointCost"
                    value={formData.pointCost}
                    onChange={handleChange}
                    min="1"
                    required
                    className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                    placeholder="25"
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-300">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                    placeholder="Describe the reward..."
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="available"
                    name="available"
                    checked={formData.available}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-zinc-600 text-amber-600 focus:ring-amber-500"
                  />
                  <label htmlFor="available" className="ml-2 block text-sm text-gray-300">
                    Available for redemption
                  </label>
                </div>
                
                <div>
                  <label htmlFor="expires" className="block text-sm font-medium text-gray-300">
                    Expiration Date (optional)
                  </label>
                  <input
                    type="date"
                    id="expires"
                    name="expires"
                    value={formData.expires || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  />
                </div>
              </>
            )}
            
            {type === 'tier' && (
              <>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                    Tier Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                    placeholder="e.g. Gold"
                  />
                </div>
                
                <div>
                  <label htmlFor="pointThreshold" className="block text-sm font-medium text-gray-300">
                    Point Threshold <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="pointThreshold"
                    name="pointThreshold"
                    value={formData.pointThreshold}
                    onChange={handleChange}
                    min="0"
                    required
                    className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                    placeholder="250"
                  />
                  <p className="mt-1 text-xs text-gray-400">Points needed to reach this tier</p>
                </div>
                
                <div>
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-gray-300">
                      Benefits
                    </label>
                    <button 
                      type="button" 
                      onClick={handleAddBenefit}
                      className="text-xs text-amber-500 hover:text-amber-400"
                    >
                      + Add Benefit
                    </button>
                  </div>
                  {formData.benefits.map((benefit: string, index: number) => (
                    <div key={index} className="mt-2 flex items-center">
                      <input
                        type="text"
                        value={benefit}
                        onChange={(e) => handleBenefitChange(index, e.target.value)}
                        className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                        placeholder={`Benefit ${index + 1}`}
                      />
                      {formData.benefits.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => handleRemoveBenefit(index)}
                          className="ml-2 text-red-400 hover:text-red-300"
                        >
                          <Trash size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-zinc-800 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center rounded-lg bg-amber-600 px-3 py-2 text-sm font-medium text-white hover:bg-amber-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const LoyaltyProgramManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'members' | 'rewards' | 'tiers' | 'analytics'>('members');
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [modalType, setModalType] = useState<'customer' | 'reward' | 'tier'>('customer');
  
  // Filter members based on search and tier filter
  const filteredMembers = LOYALTY_MEMBERS.filter(member => {
    const matchesSearch = 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTierFilter = tierFilter ? member.tier === tierFilter : true;
    
    return matchesSearch && matchesTierFilter;
  });
  
  // Handle opening the modal for adding/editing
  const handleOpenModal = (type: 'customer' | 'reward' | 'tier', item?: any, edit = false) => {
    setModalType(type);
    setCurrentItem(item);
    setIsEditing(edit);
    setIsModalOpen(true);
  };
  
  // Handle saving form data
  const handleSaveFormData = (data: any) => {
    console.log('Saving data:', data);
    // In a real app, this would save to your database
    setIsModalOpen(false);
    setCurrentItem(null);
    setIsEditing(false);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
        <h2 className="text-xl sm:text-2xl font-semibold text-white">
          <Award className="inline-block mr-2 text-amber-500" />
          Loyalty Program
        </h2>
        
        <div className="flex gap-2">
          <button className="inline-flex items-center rounded-lg bg-zinc-800 px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-white hover:bg-zinc-700 focus:outline-none">
            <Download size={12} className="mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Export</span>
          </button>
          <button 
            onClick={() => {
              if (activeTab === 'members') {
                handleOpenModal('customer');
              } else if (activeTab === 'rewards') {
                handleOpenModal('reward');
              } else if (activeTab === 'tiers') {
                handleOpenModal('tier');
              }
            }}
            className="inline-flex items-center rounded-lg bg-amber-600 px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-white hover:bg-amber-700 focus:outline-none"
          >
            <PlusCircle size={12} className="mr-1 sm:mr-2" />
            <span className="hidden xs:inline">
              {activeTab === 'members' ? 'Add Member' : 
               activeTab === 'rewards' ? 'Add Reward' : 
               activeTab === 'tiers' ? 'Add Tier' : 'Add'}
            </span>
            <span className="xs:hidden">Add</span>
          </button>
        </div>
      </div>
      
      <div className="flex border-b border-zinc-700">
        <button
          onClick={() => setActiveTab('members')}
          className={`pb-2 px-4 text-sm font-medium border-b-2 ${
            activeTab === 'members'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <User size={14} className="inline-block mr-1.5" />
          Members
        </button>
        <button
          onClick={() => setActiveTab('rewards')}
          className={`pb-2 px-4 text-sm font-medium border-b-2 ${
            activeTab === 'rewards'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Gift size={14} className="inline-block mr-1.5" />
          Rewards
        </button>
        <button
          onClick={() => setActiveTab('tiers')}
          className={`pb-2 px-4 text-sm font-medium border-b-2 ${
            activeTab === 'tiers'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <ChevronsUp size={14} className="inline-block mr-1.5" />
          Tiers
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-2 px-4 text-sm font-medium border-b-2 ${
            activeTab === 'analytics'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <BarChart size={14} className="inline-block mr-1.5" />
          Analytics
        </button>
      </div>
      
      {/* Members Tab */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search size={14} className="text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full rounded-lg border-0 bg-zinc-800 py-2 pl-10 pr-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 sm:text-sm"
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex space-x-2">
              <select
                value={tierFilter || ''}
                onChange={(e) => setTierFilter(e.target.value || null)}
                className="block rounded-lg border-0 bg-zinc-800 py-2 pl-3 pr-10 text-white focus:ring-2 focus:ring-amber-500 sm:text-sm"
              >
                <option value="">All Tiers</option>
                {LOYALTY_TIERS.map(tier => (
                  <option key={tier.id} value={tier.name}>{tier.name}</option>
                ))}
              </select>
              
              <button className="inline-flex items-center rounded-lg bg-zinc-800 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 focus:outline-none">
                <Filter size={14} className="mr-2" />
                More
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto rounded-lg border border-zinc-800">
            <table className="min-w-full divide-y divide-zinc-800">
              <thead className="bg-zinc-900">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                    Member
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                    Tier
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                    Points
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400 hidden sm:table-cell">
                    Visits
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400 hidden md:table-cell">
                    Spent
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400 hidden lg:table-cell">
                    Last Visit
                  </th>
                  <th scope="col" className="relative px-4 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 bg-zinc-900">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-zinc-800">
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex items-center">
                        <div className="h-9 w-9 flex-shrink-0 rounded-full bg-amber-700 flex items-center justify-center">
                          <span className="font-medium text-white">{member.name.split(' ').map(n => n[0]).join('')}</span>
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-white">{member.name}</p>
                          <p className="text-xs text-gray-400">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getTierColor(member.tier)}`}>
                        {member.tier}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-amber-400 font-medium">
                      {member.points} pts
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-300 hidden sm:table-cell">
                      {member.visitsThisYear} this year
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-300 hidden md:table-cell">
                      ${member.totalSpent}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-300 hidden lg:table-cell">
                      {new Date(member.lastVisit).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium">
                      <button 
                        onClick={() => handleOpenModal('customer', member, true)}
                        className="text-amber-500 hover:text-amber-400 mr-3"
                      >
                        <Edit size={16} />
                      </button>
                      <button className="text-red-500 hover:text-red-400">
                        <Trash size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Recent Activity */}
          <div className="rounded-lg bg-zinc-900 p-4 shadow-lg">
            <h3 className="text-lg font-medium text-white mb-3">Recent Redemptions</h3>
            <div className="space-y-2">
              {REDEMPTION_HISTORY.slice(0, 4).map(redemption => (
                <div key={redemption.id} className="rounded-lg bg-zinc-800 p-3 flex justify-between items-center">
                  <div className="flex items-start">
                    <Gift size={16} className="mr-2 text-amber-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-white">{redemption.reward}</p>
                      <p className="text-xs text-gray-400">{redemption.memberName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-amber-400">{redemption.pointCost} pts</p>
                    <p className="text-xs text-gray-400">{new Date(redemption.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Rewards Tab */}
      {activeTab === 'rewards' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {AVAILABLE_REWARDS.map(reward => (
              <div key={reward.id} className="rounded-lg bg-zinc-900 p-4 shadow-lg border border-zinc-800">
                <div className="flex justify-between items-start">
                  <div className="flex items-start">
                    <Gift size={16} className="mr-2 text-amber-500 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-white">{reward.name}</h3>
                      <p className="mt-1 text-sm text-gray-300">{reward.description}</p>
                    </div>
                  </div>
                  <span className="bg-amber-900/30 text-amber-400 rounded-full px-2 py-0.5 text-xs font-medium">
                    {reward.pointCost} pts
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className={`text-xs ${reward.available ? 'text-green-400' : 'text-gray-400'}`}>
                    {reward.available ? 'Available' : 'Unavailable'}
                  </span>
                  <div className="space-x-2">
                    <button 
                      onClick={() => handleOpenModal('reward', reward, true)} 
                      className="text-amber-500 hover:text-amber-400 text-xs"
                    >
                      Edit
                    </button>
                    <button className="text-red-500 hover:text-red-400 text-xs">
                      Disable
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Add new reward card */}
            <div 
              className="rounded-lg bg-zinc-900 p-4 shadow-lg border border-dashed border-zinc-700 flex items-center justify-center cursor-pointer hover:bg-zinc-800"
              onClick={() => handleOpenModal('reward')}
            >
              <div className="text-center">
                <PlusCircle size={24} className="mx-auto text-amber-500 mb-2" />
                <p className="text-sm font-medium text-white">Add New Reward</p>
              </div>
            </div>
          </div>
          
          {/* Redemption History */}
          <div className="rounded-lg bg-zinc-900 p-4 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white">Redemption History</h3>
              <button className="text-sm text-amber-500 hover:text-amber-400 flex items-center">
                View All
                <ChevronRight size={14} className="ml-1" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-800">
                <thead className="bg-zinc-800">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                      Date
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                      Member
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                      Reward
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                      Points
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {REDEMPTION_HISTORY.map((redemption) => (
                    <tr key={redemption.id} className="hover:bg-zinc-800">
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-300">
                        {new Date(redemption.date).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-white">
                        {redemption.memberName}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-white">
                        <div className="flex items-center">
                          <Gift size={14} className="text-amber-500 mr-1.5" />
                          {redemption.reward}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-amber-400 font-medium">
                        {redemption.pointCost} pts
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      {/* Tiers Tab */}
      {activeTab === 'tiers' && (
        <div className="space-y-4">
          <div className="rounded-lg bg-zinc-900 p-4 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white">Loyalty Tiers & Benefits</h3>
              <button 
                onClick={() => handleOpenModal('tier')}
                className="inline-flex items-center rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700 focus:outline-none"
              >
                <PlusCircle size={16} className="mr-1.5" />
                Add Tier
              </button>
            </div>
            
            <div className="relative overflow-hidden">
              {/* Progress steps connecting the tiers */}
              <div className="absolute top-8 left-0 right-0 h-1 bg-zinc-700">
                <div className="h-full bg-amber-500" style={{ width: '80%' }}></div>
              </div>
              
              {/* Tiers display */}
              <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4 relative">
                {LOYALTY_TIERS.map((tier, index) => (
                  <div key={tier.id} className={`pt-4 ${index < LOYALTY_TIERS.length - 1 ? 'mb-4' : ''}`}>
                    <div className="flex flex-col items-center">
                      {/* Circle marker for the tier */}
                      <div className={`z-10 flex h-10 w-10 items-center justify-center rounded-full mb-2 ${getTierColor(tier.name)}`}>
                        <Award size={18} />
                      </div>
                      
                      {/* Tier name and threshold */}
                      <div className="text-center mb-2">
                        <p className="font-medium text-white">{tier.name}</p>
                        <p className="text-xs text-gray-400">{tier.pointThreshold}+ pts</p>
                      </div>
                      
                      {/* Tier benefits card */}
                      <div className={`rounded-lg bg-zinc-800 p-3 w-full h-full border-l-4 ${getTierColor(tier.name)}`}>
                        <h4 className="text-xs font-medium text-gray-300 mb-2">Benefits:</h4>
                        <ul className="space-y-1">
                          {tier.benefits.map((benefit, idx) => (
                            <li key={idx} className="flex items-start text-xs text-gray-400">
                              <CheckCircle size={10} className="text-amber-500 mr-1 mt-0.5" />
                              {benefit}
                            </li>
                          ))}
                        </ul>
                        <div className="mt-3 flex justify-end">
                          <button 
                            onClick={() => handleOpenModal('tier', tier, true)}
                            className="text-xs text-amber-500 hover:text-amber-400"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-lg bg-zinc-900 p-4 shadow-lg">
              <h3 className="text-lg font-medium text-white mb-3">Program Settings</h3>
              
              <div className="space-y-3">
                <div className="rounded-lg bg-zinc-800 p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-medium text-white">Points Earning Rate</h4>
                      <p className="text-xs text-gray-400">Point earned per dollar spent</p>
                    </div>
                    <div className="flex items-center bg-zinc-700 rounded-md">
                      <span className="px-2 py-1 text-gray-300 text-sm">1 pt = $</span>
                      <input 
                        type="number" 
                        className="w-16 bg-zinc-700 border-0 text-white px-2 py-1 text-sm focus:outline-none focus:ring-amber-500"
                        defaultValue="1" 
                        min="0.1"
                        step="0.1"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="rounded-lg bg-zinc-800 p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-medium text-white">Point Expiration</h4>
                      <p className="text-xs text-gray-400">How long points remain valid</p>
                    </div>
                    <select
                      className="bg-zinc-700 border-0 text-white text-sm rounded-md px-2 py-1 focus:outline-none focus:ring-amber-500"
                      defaultValue="12"
                    >
                      <option value="3">3 months</option>
                      <option value="6">6 months</option>
                      <option value="12">12 months</option>
                      <option value="24">24 months</option>
                      <option value="0">Never expire</option>
                    </select>
                  </div>
                </div>
                
                <div className="rounded-lg bg-zinc-800 p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-medium text-white">Welcome Points</h4>
                      <p className="text-xs text-gray-400">Points given to new members</p>
                    </div>
                    <div className="flex items-center bg-zinc-700 rounded-md">
                      <input 
                        type="number" 
                        className="w-16 bg-zinc-700 border-0 text-white px-2 py-1 text-sm focus:outline-none focus:ring-amber-500"
                        defaultValue="10" 
                        min="0"
                      />
                      <span className="px-2 py-1 text-gray-300 text-sm">pts</span>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-lg bg-zinc-800 p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-medium text-white">Birthday Bonus</h4>
                      <p className="text-xs text-gray-400">Bonus points on member's birthday</p>
                    </div>
                    <div className="flex items-center bg-zinc-700 rounded-md">
                      <input 
                        type="number" 
                        className="w-16 bg-zinc-700 border-0 text-white px-2 py-1 text-sm focus:outline-none focus:ring-amber-500"
                        defaultValue="50" 
                        min="0"
                      />
                      <span className="px-2 py-1 text-gray-300 text-sm">pts</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <button className="inline-flex items-center rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700 focus:outline-none">
                  Save Settings
                </button>
              </div>
            </div>
            
            <div className="rounded-lg bg-zinc-900 p-4 shadow-lg">
              <h3 className="text-lg font-medium text-white mb-3">Tier Distribution</h3>
              <div className="space-y-3">
                {LOYALTY_TIERS.map((tier) => {
                  const members = LOYALTY_MEMBERS.filter(m => m.tier === tier.name);
                  const percentage = Math.round((members.length / LOYALTY_MEMBERS.length) * 100);
                  
                  return (
                    <div key={tier.id} className="flex items-center">
                      <div className={`w-6 h-6 rounded-full ${getTierColor(tier.name)} flex-shrink-0 flex items-center justify-center mr-2`}>
                        <span className="text-xs font-bold">{tier.name[0]}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className="text-white">{tier.name}</span>
                          <span className="text-gray-400">{members.length} members</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-zinc-700">
                          <div 
                            className={`h-2 rounded-full bg-${tier.name.toLowerCase()}-500`} 
                            style={{ 
                              width: `${percentage}%`, 
                              backgroundColor: tier.name === 'Bronze' ? '#b45309' : 
                                              tier.name === 'Silver' ? '#9ca3af' : 
                                              tier.name === 'Gold' ? '#f59e0b' : 
                                              tier.name === 'Platinum' ? '#6366f1' : 
                                              '#8b5cf6'
                            }}
                          ></div>
                        </div>
                      </div>
                      <div className="ml-2 w-8 text-right text-xs text-gray-300">{percentage}%</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg bg-zinc-900 p-4 shadow-lg">
              <h3 className="mb-4 text-lg font-medium text-white flex items-center">
                <Award size={18} className="mr-2 text-amber-500" />
                Points Earned vs Redeemed
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBar
                    data={[
                      { month: 'Jan', earned: 352, redeemed: 120 },
                      { month: 'Feb', earned: 425, redeemed: 215 },
                      { month: 'Mar', earned: 598, redeemed: 305 },
                      { month: 'Apr', earned: 480, redeemed: 210 },
                      { month: 'May', earned: 520, redeemed: 250 },
                      { month: 'Jun', earned: 650, redeemed: 320 },
                    ]}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                    <XAxis dataKey="month" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#27272a', borderColor: '#3f3f46', color: '#ffffff' }} />
                    <Legend />
                    <Bar dataKey="earned" name="Points Earned" fill="#f59e0b" />
                    <Bar dataKey="redeemed" name="Points Redeemed" fill="#8b5cf6" />
                  </RechartsBar>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="rounded-lg bg-zinc-900 p-4 shadow-lg">
              <h3 className="mb-4 text-lg font-medium text-white flex items-center">
                <Gift size={18} className="mr-2 text-amber-500" />
                Reward Redemptions
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBar
                    data={[
                      { name: 'Free Drink', count: 32 },
                      { name: 'Show Ticket', count: 18 },
                      { name: 'VIP Upgrade', count: 15 },
                      { name: 'Merchandise Discount', count: 22 },
                      { name: 'Special Event Access', count: 8 },
                    ]}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                    <XAxis type="number" stroke="#9ca3af" />
                    <YAxis dataKey="name" type="category" stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#27272a', borderColor: '#3f3f46', color: '#ffffff' }} />
                    <Bar dataKey="count" name="Redemptions" fill="#f59e0b" />
                  </RechartsBar>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg bg-zinc-900 p-4 shadow-lg">
            <h3 className="mb-4 text-lg font-medium text-white">Loyalty Program Metrics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-lg bg-zinc-800 p-3">
                <p className="text-sm text-gray-400">Active Members</p>
                <p className="mt-1 text-2xl font-bold text-white">126</p>
                <div className="mt-1 flex items-center text-xs text-green-500">
                  <svg className="h-3 w-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span>+12% this month</span>
                </div>
              </div>
              
              <div className="rounded-lg bg-zinc-800 p-3">
                <p className="text-sm text-gray-400">Average Points</p>
                <p className="mt-1 text-2xl font-bold text-amber-500">285</p>
                <div className="mt-1 flex items-center text-xs text-green-500">
                  <svg className="h-3 w-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span>+8% this month</span>
                </div>
              </div>
              
              <div className="rounded-lg bg-zinc-800 p-3">
                <p className="text-sm text-gray-400">Redemption Rate</p>
                <p className="mt-1 text-2xl font-bold text-white">38%</p>
                <div className="mt-1 flex items-center text-xs text-red-500">
                  <svg className="h-3 w-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                  <span>-2% this month</span>
                </div>
              </div>
              
              <div className="rounded-lg bg-zinc-800 p-3">
                <p className="text-sm text-gray-400">Revenue Impact</p>
                <p className="mt-1 text-2xl font-bold text-white">$24,850</p>
                <div className="mt-1 flex items-center text-xs text-green-500">
                  <svg className="h-3 w-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span>+15% this month</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <h4 className="text-sm font-medium text-white mb-2">Member Engagement</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-zinc-700 text-sm">
                  <thead className="bg-zinc-800">
                    <tr>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                        Activity
                      </th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                        Count
                      </th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                        vs Last Month
                      </th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                        Trend
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-700">
                    <tr>
                      <td className="whitespace-nowrap px-4 py-2 text-white">New Enrollments</td>
                      <td className="whitespace-nowrap px-4 py-2 text-white">18</td>
                      <td className="whitespace-nowrap px-4 py-2 text-green-500">+22%</td>
                      <td className="whitespace-nowrap px-4 py-2 text-green-500">↑</td>
                    </tr>
                    <tr>
                      <td className="whitespace-nowrap px-4 py-2 text-white">Repeat Visits</td>
                      <td className="whitespace-nowrap px-4 py-2 text-white">64</td>
                      <td className="whitespace-nowrap px-4 py-2 text-green-500">+18%</td>
                      <td className="whitespace-nowrap px-4 py-2 text-green-500">↑</td>
                    </tr>
                    <tr>
                      <td className="whitespace-nowrap px-4 py-2 text-white">Reward Redemptions</td>
                      <td className="whitespace-nowrap px-4 py-2 text-white">42</td>
                      <td className="whitespace-nowrap px-4 py-2 text-green-500">+5%</td>
                      <td className="whitespace-nowrap px-4 py-2 text-green-500">↑</td>
                    </tr>
                    <tr>
                      <td className="whitespace-nowrap px-4 py-2 text-white">Tier Upgrades</td>
                      <td className="whitespace-nowrap px-4 py-2 text-white">8</td>
                      <td className="whitespace-nowrap px-4 py-2 text-red-500">-12%</td>
                      <td className="whitespace-nowrap px-4 py-2 text-red-500">↓</td>
                    </tr>
                    <tr>
                      <td className="whitespace-nowrap px-4 py-2 text-white">Points Expired</td>
                      <td className="whitespace-nowrap px-4 py-2 text-white">145</td>
                      <td className="whitespace-nowrap px-4 py-2 text-red-500">-8%</td>
                      <td className="whitespace-nowrap px-4 py-2 text-red-500">↓</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Form Modal */}
      {isModalOpen && (
        <LoyaltyFormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setCurrentItem(null);
            setIsEditing(false);
          }}
          onSave={handleSaveFormData}
          initialData={currentItem}
          type={modalType}
          isEditing={isEditing}
        />
      )}
    </div>
  );
};

export default LoyaltyProgramManager;