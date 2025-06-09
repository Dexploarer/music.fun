import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  UserPlus, 
  Calendar, 
  Filter, 
  Plus, 
  Tag, 
  Mail, 
  Phone, 
  X,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Star,
  Heart,
  DollarSign,
  Activity,
  MessageSquare,
  Clock,
  MapPin,
  Award,
  Target,
  Zap,
  Globe,
  RefreshCw,
  Download,
  Upload,
  Eye,
  Settings,
  MoreVertical,
  UserCheck,
  UserX,
  Crown,
  Gift,
  Shield,
  Smartphone,
  FileText,
  Edit3,
  Trash2,
  Send,
  AlertCircle,
  CheckCircle,
  Camera,
  Video
} from 'lucide-react';
import Breadcrumbs, { useBreadcrumbs } from '../components/navigation/Breadcrumbs';
import { useCustomers, useCustomerInteractions } from '../hooks/useCRM';
import CustomerFormModal from '../components/crm/CustomerFormModal';
import { format, startOfMonth, endOfMonth, isWithinInterval, differenceInDays } from 'date-fns';
import { toast } from 'react-hot-toast';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  PieChart as RechartsPieChart, 
  Cell,
  BarChart,
  Bar,
  RadialBarChart,
  RadialBar
} from 'recharts';

// Enhanced interfaces for CRM analytics
interface CustomerAnalytics {
  totalCustomers: number;
  activeCustomers: number;
  newCustomers: number;
  churned: number;
  averageLifetimeValue: number;
  totalRevenue: number;
  engagementRate: number;
  retentionRate: number;
}

interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  criteria: string[];
  count: number;
  color: string;
  avgSpend: number;
  engagementScore: number;
}

interface LoyaltyMetrics {
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  points: number;
  nextTierPoints: number;
  visits: number;
  totalSpent: number;
  engagementScore: number;
}

// Enhanced Customer Card Component
const CustomerCard: React.FC<{
  customer: any;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ customer, onView, onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  
  const getLoyaltyTier = (customer: any): LoyaltyMetrics => {
    const totalSpent = customer.metrics?.totalSpent || 0;
    const visits = customer.metrics?.totalInteractions || 0;
    
    let tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' = 'Bronze';
    const points = Math.floor(totalSpent / 10);
    let nextTierPoints = 500;
    
    if (totalSpent >= 5000) { tier = 'Platinum'; nextTierPoints = 0; }
    else if (totalSpent >= 2500) { tier = 'Gold'; nextTierPoints = 5000; }
    else if (totalSpent >= 1000) { tier = 'Silver'; nextTierPoints = 2500; }
    else { tier = 'Bronze'; nextTierPoints = 1000; }
    
    return {
      tier,
      points,
      nextTierPoints,
      visits,
      totalSpent,
      engagementScore: customer.metrics?.engagementScore || 0
    };
  };

  const loyalty = getLoyaltyTier(customer);
  const isActive = customer.lastVisit && differenceInDays(new Date(), new Date(customer.lastVisit)) <= 30;

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Platinum': return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'Gold': return 'bg-gradient-to-r from-yellow-500 to-orange-500';
      case 'Silver': return 'bg-gradient-to-r from-gray-400 to-gray-500';
      default: return 'bg-gradient-to-r from-amber-600 to-amber-700';
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border border-zinc-700/50 hover:border-amber-500/30 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-600 to-orange-600 flex items-center justify-center">
                <span className="text-white font-semibold text-lg">
                  {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
                </span>
              </div>
              {isActive && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-zinc-800"></div>
              )}
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white group-hover:text-amber-300 transition-colors">
                {customer.firstName} {customer.lastName}
              </h3>
              <div className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getTierColor(loyalty.tier)} text-white`}>
                <Crown className="h-3 w-3 mr-1" />
                {loyalty.tier}
              </div>
            </div>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-gray-400 hover:text-white transition-colors"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 bg-zinc-900 rounded-lg border border-zinc-700 shadow-xl z-10 min-w-[140px]">
                <button 
                  onClick={() => { onView(); setShowMenu(false); }}
                  className="w-full text-left px-3 py-2 text-sm text-white hover:bg-zinc-800"
                >
                  <Eye className="h-3 w-3 inline mr-2" />
                  View Profile
                </button>
                <button 
                  onClick={() => { onEdit(); setShowMenu(false); }}
                  className="w-full text-left px-3 py-2 text-sm text-white hover:bg-zinc-800"
                >
                  <Edit3 className="h-3 w-3 inline mr-2" />
                  Edit Customer
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-white hover:bg-zinc-800">
                  <Send className="h-3 w-3 inline mr-2" />
                  Send Message
                </button>
                <button 
                  onClick={() => { onDelete(); setShowMenu(false); }}
                  className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-zinc-800"
                >
                  <Trash2 className="h-3 w-3 inline mr-2" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-2 mb-4">
          {customer.email && (
            <div className="flex items-center text-sm text-gray-300">
              <Mail className="h-3 w-3 text-gray-400 mr-2" />
              {customer.email}
            </div>
          )}
          {customer.phone && (
            <div className="flex items-center text-sm text-gray-300">
              <Phone className="h-3 w-3 text-gray-400 mr-2" />
              {customer.phone}
            </div>
          )}
          {customer.city && (
            <div className="flex items-center text-sm text-gray-300">
              <MapPin className="h-3 w-3 text-gray-400 mr-2" />
              {customer.city}, {customer.state}
            </div>
          )}
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-zinc-800/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400">Total Spent</span>
              <DollarSign className="h-3 w-3 text-green-500" />
            </div>
            <p className="text-sm font-semibold text-white">${(loyalty.totalSpent || 0).toLocaleString()}</p>
          </div>
          
          <div className="bg-zinc-800/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400">Visits</span>
              <Activity className="h-3 w-3 text-blue-500" />
            </div>
            <p className="text-sm font-semibold text-white">{loyalty.visits}</p>
          </div>
        </div>

        {/* Tags */}
        {customer.tags && customer.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {customer.tags.slice(0, 3).map((tag: string, index: number) => (
              <span key={index} className="inline-flex items-center rounded-full bg-zinc-700/50 px-2 py-0.5 text-xs text-gray-300">
                <Tag className="h-2 w-2 mr-1" />
                {tag}
              </span>
            ))}
            {customer.tags.length > 3 && (
              <span className="text-xs text-gray-400">+{customer.tags.length - 3} more</span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-700/50">
          <div className="text-xs text-gray-400">
            Customer since {format(new Date(customer.customerSince), 'MMM yyyy')}
          </div>
          
          <div className="flex items-center space-x-1">
            <button className="p-1 text-gray-400 hover:text-white transition-colors">
              <MessageSquare className="h-3 w-3" />
            </button>
            <button className="p-1 text-gray-400 hover:text-white transition-colors">
              <Mail className="h-3 w-3" />
            </button>
            <button className="p-1 text-gray-400 hover:text-white transition-colors">
              <Phone className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Analytics Dashboard Component
const CustomerAnalyticsDashboard: React.FC<{ analytics: CustomerAnalytics; customers: any[] }> = ({ analytics, customers }) => {
  const chartData = [
    { name: 'Jan', customers: 45, revenue: 12000 },
    { name: 'Feb', customers: 52, revenue: 15200 },
    { name: 'Mar', customers: 38, revenue: 9800 },
    { name: 'Apr', customers: 61, revenue: 18500 },
    { name: 'May', customers: 58, revenue: 16800 },
    { name: 'Jun', customers: 67, revenue: 21200 }
  ];

  const segmentData = [
    { name: 'VIP', value: 15, color: '#8b5cf6' },
    { name: 'Regular', value: 45, color: '#3b82f6' },
    { name: 'New', value: 25, color: '#10b981' },
    { name: 'Inactive', value: 15, color: '#ef4444' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl p-6 border border-zinc-700/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Total Customers</p>
            <p className="text-2xl font-bold text-white">{analytics.totalCustomers}</p>
            <div className="flex items-center mt-1">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-500">+8.2% this month</span>
            </div>
          </div>
          <div className="bg-blue-500/20 p-3 rounded-full">
            <Users className="h-6 w-6 text-blue-400" />
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl p-6 border border-zinc-700/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Active Customers</p>
            <p className="text-2xl font-bold text-white">{analytics.activeCustomers}</p>
            <div className="flex items-center mt-1">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-500">+12.5% this week</span>
            </div>
          </div>
          <div className="bg-green-500/20 p-3 rounded-full">
            <Activity className="h-6 w-6 text-green-400" />
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl p-6 border border-zinc-700/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Avg. Lifetime Value</p>
            <p className="text-2xl font-bold text-white">${analytics.averageLifetimeValue}</p>
            <div className="flex items-center mt-1">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-500">+15.3% improvement</span>
            </div>
          </div>
          <div className="bg-amber-500/20 p-3 rounded-full">
            <DollarSign className="h-6 w-6 text-amber-400" />
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl p-6 border border-zinc-700/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Retention Rate</p>
            <p className="text-2xl font-bold text-white">{analytics.retentionRate}%</p>
            <div className="flex items-center mt-1">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-500">+3.1% this quarter</span>
            </div>
          </div>
          <div className="bg-purple-500/20 p-3 rounded-full">
            <Heart className="h-6 w-6 text-purple-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Customer Segmentation Component
const CustomerSegmentation: React.FC<{ segments: CustomerSegment[] }> = ({ segments }) => {
  return (
    <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl p-6 border border-zinc-700/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Customer Segments</h3>
        <button className="text-amber-500 hover:text-amber-400 text-sm font-medium">
          <Target className="h-4 w-4 inline mr-1" />
          Manage Segments
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {segments.map((segment, index) => (
          <div key={segment.id} className="bg-zinc-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2`} style={{ backgroundColor: segment.color }}></div>
                <h4 className="text-sm font-medium text-white">{segment.name}</h4>
              </div>
              <span className="text-xs text-gray-400">{segment.count} customers</span>
            </div>
            
            <p className="text-xs text-gray-300 mb-3">{segment.description}</p>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-xs text-gray-400">Avg. Spend</span>
                <p className="text-sm font-semibold text-white">${segment.avgSpend}</p>
              </div>
              <div>
                <span className="text-xs text-gray-400">Engagement</span>
                <p className="text-sm font-semibold text-white">{segment.engagementScore}%</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Quick Actions Component
const QuickActions: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl p-6 border border-zinc-700/50">
      <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
      
      <div className="space-y-3">
        <button className="w-full text-left p-3 bg-zinc-800/50 hover:bg-zinc-700 rounded-lg transition-colors">
          <div className="flex items-center">
            <Send className="h-4 w-4 text-blue-500 mr-3" />
            <span className="text-white text-sm">Send Bulk Email</span>
          </div>
        </button>
        
        <button className="w-full text-left p-3 bg-zinc-800/50 hover:bg-zinc-700 rounded-lg transition-colors">
          <div className="flex items-center">
            <Gift className="h-4 w-4 text-purple-500 mr-3" />
            <span className="text-white text-sm">Create Loyalty Campaign</span>
          </div>
        </button>
        
        <button className="w-full text-left p-3 bg-zinc-800/50 hover:bg-zinc-700 rounded-lg transition-colors">
          <div className="flex items-center">
            <Target className="h-4 w-4 text-green-500 mr-3" />
            <span className="text-white text-sm">New Segment</span>
          </div>
        </button>
        
        <button className="w-full text-left p-3 bg-zinc-800/50 hover:bg-zinc-700 rounded-lg transition-colors">
          <div className="flex items-center">
            <Download className="h-4 w-4 text-amber-500 mr-3" />
            <span className="text-white text-sm">Export Data</span>
          </div>
        </button>
      </div>
    </div>
  );
};

const Customers: React.FC = () => {
  const navigate = useNavigate();
  const { customers, isLoading, createCustomer, updateCustomer, deleteCustomer, isCreating } = useCustomers();
  const breadcrumbs = useBreadcrumbs();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [filterSegment, setFilterSegment] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  // Generate mock analytics data
  const analytics: CustomerAnalytics = useMemo(() => {
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(customer => 
      customer.lastVisit && differenceInDays(new Date(), new Date(customer.lastVisit)) <= 30
    ).length;
    const newCustomers = customers.filter(customer =>
      differenceInDays(new Date(), new Date(customer.customerSince)) <= 30
    ).length;
    
    return {
      totalCustomers,
      activeCustomers,
      newCustomers,
      churned: Math.floor(totalCustomers * 0.05),
      averageLifetimeValue: 1250,
      totalRevenue: totalCustomers * 1250,
      engagementRate: 73.5,
      retentionRate: 85.2
    };
  }, [customers]);

  // Customer segments
  const segments: CustomerSegment[] = [
    {
      id: 'vip',
      name: 'VIP Customers',
      description: 'High-value customers with $2500+ lifetime spend',
      criteria: ['lifetime_value > 2500', 'visits >= 10'],
      count: Math.floor(customers.length * 0.15),
      color: '#8b5cf6',
      avgSpend: 3200,
      engagementScore: 92
    },
    {
      id: 'regular',
      name: 'Regular Customers',
      description: 'Active customers with regular engagement',
      criteria: ['visits >= 3', 'last_visit < 30_days'],
      count: Math.floor(customers.length * 0.45),
      color: '#3b82f6',
      avgSpend: 850,
      engagementScore: 78
    },
    {
      id: 'new',
      name: 'New Customers',
      description: 'Customers acquired in the last 30 days',
      criteria: ['customer_since < 30_days'],
      count: Math.floor(customers.length * 0.25),
      color: '#10b981',
      avgSpend: 320,
      engagementScore: 65
    },
    {
      id: 'at_risk',
      name: 'At Risk',
      description: 'Customers who haven\'t visited in 60+ days',
      criteria: ['last_visit > 60_days', 'visits > 0'],
      count: Math.floor(customers.length * 0.15),
      color: '#ef4444',
      avgSpend: 450,
      engagementScore: 35
    }
  ];

  // Enhanced filtering
  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
    const searchMatch = 
      `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (customer.phone && customer.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (customer.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    
    const tagMatch = !filterTag || (customer.tags && customer.tags.includes(filterTag));
    
      let segmentMatch = true;
      if (filterSegment !== 'all') {
        const segment = segments.find(s => s.id === filterSegment);
        if (segment) {
          // Apply segment logic here
          segmentMatch = true; // Simplified for now
        }
      }
      
      return searchMatch && tagMatch && segmentMatch;
    });
  }, [customers, searchTerm, filterTag, filterSegment, segments]);
  
  // Extract unique tags from all customers for filtering
  const allTags = customers.reduce((tags: string[], customer) => {
    if (customer.tags) {
      customer.tags.forEach((tag: string) => {
        if (!tags.includes(tag)) {
          tags.push(tag);
        }
      });
    }
    return tags;
  }, []);
  
  // Handle adding a new customer
  const handleAddCustomer = (customerData: any) => {
    createCustomer(customerData, {
      onSuccess: () => {
        setIsModalOpen(false);
        setSelectedCustomer(null);
        toast.success('Customer added successfully!');
      }
    });
  };

  const handleEditCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const handleDeleteCustomer = (customer: any) => {
    if (confirm(`Are you sure you want to delete ${customer.firstName} ${customer.lastName}?`)) {
      deleteCustomer(customer.id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-zinc-900 to-black">
      <div className="space-y-6 p-6">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbs} />
      
        {/* Enhanced Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="font-playfair text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              Customer Relationship Management
            </h1>
            <p className="text-gray-400 mt-1">
              Advanced analytics, loyalty tracking, and customer segmentation
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* View Mode Toggle */}
            <div className="bg-zinc-800 rounded-lg p-1 flex">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'grid'
                    ? 'bg-amber-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-zinc-700'
                }`}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Grid
              </button>
        <button 
                onClick={() => setViewMode('table')}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'table'
                    ? 'bg-amber-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-zinc-700'
                }`}
              >
                <FileText className="h-4 w-4 mr-2" />
                Table
        </button>
      </div>

            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </button>
          </div>
        </div>

        {/* Analytics Dashboard */}
        <CustomerAnalyticsDashboard analytics={analytics} customers={customers} />

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
              className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="Search customers by name, email, phone, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

          <select
            value={filterSegment}
            onChange={(e) => setFilterSegment(e.target.value)}
            className="px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Segments</option>
            {segments.map(segment => (
              <option key={segment.id} value={segment.id}>{segment.name}</option>
            ))}
          </select>
          
          {filterTag && (
            <button 
              onClick={() => setFilterTag(null)}
              className="inline-flex items-center px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-medium transition-colors"
            >
              <Tag className="h-4 w-4 mr-2" />
              {filterTag}
              <X className="h-4 w-4 ml-2" />
            </button>
          )}
      </div>
      
      {/* Tag filters */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
            {allTags.slice(0, 10).map(tag => (
            <button
              key={tag}
              onClick={() => setFilterTag(tag === filterTag ? null : tag)}
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                tag === filterTag
                  ? 'bg-amber-600 text-white'
                  : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
              }`}
            >
                <Tag className="h-2 w-2 mr-1" />
              {tag}
            </button>
          ))}
            {allTags.length > 10 && (
              <span className="text-xs text-gray-400 px-2 py-1">+{allTags.length - 10} more tags</span>
            )}
        </div>
      )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Customer List/Grid */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="mr-3 h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
                <p className="text-xl text-white">Loading customers...</p>
                  </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="text-center py-20">
                <div className="rounded-full bg-zinc-800 p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <Users className="h-12 w-12 text-gray-500" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-2">No customers found</h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  {searchTerm || filterTag || filterSegment !== 'all'
                    ? 'No customers match your current filters.'
                    : 'Get started by adding your first customer!'
                  }
                </p>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Customer
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCustomers.map(customer => (
                  <CustomerCard
                    key={customer.id}
                    customer={customer}
                    onView={() => navigate(`/customers/${customer.id}`)}
                    onEdit={() => handleEditCustomer(customer)}
                    onDelete={() => handleDeleteCustomer(customer)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl border border-zinc-700/50 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-zinc-700">
                    <thead className="bg-zinc-900/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                          Customer
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                          Contact
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                          Loyalty
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                          Last Visit
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-700">
                      {filteredCustomers.map(customer => (
                        <tr key={customer.id} className="hover:bg-zinc-800/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-600 to-orange-600 flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">
                          {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">
                          {customer.firstName} {customer.lastName}
                        </div>
                                <div className="text-xs text-gray-400">
                                  Customer since {format(new Date(customer.customerSince), 'MMM yyyy')}
                                </div>
                      </div>
                    </div>
                  </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-1">
                      {customer.email && (
                                <div className="text-xs text-gray-300 flex items-center">
                                  <Mail className="h-3 w-3 mr-1" />
                                  {customer.email}
                        </div>
                      )}
                      {customer.phone && (
                                <div className="text-xs text-gray-300 flex items-center">
                                  <Phone className="h-3 w-3 mr-1" />
                                  {customer.phone}
                        </div>
                      )}
                    </div>
                  </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center rounded-full bg-gradient-to-r from-amber-600 to-orange-600 px-2 py-1 text-xs font-medium text-white">
                              <Crown className="h-3 w-3 mr-1" />
                              Bronze
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {customer.lastVisit ? (
                        format(new Date(customer.lastVisit), 'MMM d, yyyy')
                      ) : (
                        <span className="text-gray-500">Never</span>
                      )}
                  </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={() => navigate(`/customers/${customer.id}`)}
                                className="text-amber-500 hover:text-amber-400 transition-colors"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleEditCustomer(customer)}
                                className="text-blue-500 hover:text-blue-400 transition-colors"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                    <button 
                                onClick={() => handleDeleteCustomer(customer)}
                                className="text-red-500 hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                    </button>
                            </div>
                  </td>
                </tr>
                      ))}
          </tbody>
        </table>
      </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Segmentation */}
            <CustomerSegmentation segments={segments} />
            
            {/* Quick Actions */}
            <QuickActions />
          </div>
        </div>

      {/* Add/Edit Customer Modal */}
      {isModalOpen && (
        <CustomerFormModal
          isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedCustomer(null);
            }}
          onSave={handleAddCustomer}
            initialCustomer={selectedCustomer}
          isSubmitting={isCreating}
        />
      )}
      </div>
    </div>
  );
};

export default Customers;