import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  DollarSign, 
  TrendingDown, 
  TrendingUp, 
  Download, 
  Filter, 
  Calendar,
  Plus,
  Search,
  ChevronRight,
  PieChart,
  Target,
  CreditCard,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Edit3,
  MoreHorizontal,
  FileText,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFinances } from '../hooks/useFinances';
import { format, subDays, isWithinInterval } from 'date-fns';
import AddTransactionModal from '../components/finances/AddTransactionModal';
import Breadcrumbs, { useBreadcrumbs } from '../components/navigation/Breadcrumbs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart as RechartsPieChart, Cell, BarChart, Bar } from 'recharts';

interface EnhancedFinancialCardProps {
  title: string;
  amount: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  period: string;
  icon: React.ReactNode;
  iconColor: string;
  onClick?: () => void;
  loading?: boolean;
}

const EnhancedFinancialCard: React.FC<EnhancedFinancialCardProps> = ({ 
  title, 
  amount, 
  change, 
  changeType,
  period, 
  icon,
  iconColor,
  onClick,
  loading
}) => {
  return (
    <div 
      className={`group rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 border border-zinc-700/50 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-400 mb-1">{title}</p>
          {loading ? (
            <div className="h-8 w-24 bg-zinc-700 rounded animate-pulse mb-2"></div>
          ) : (
            <p className="text-3xl font-bold text-white mb-2">
            ${amount.toLocaleString()}
          </p>
          )}
          <div className="flex items-center">
            {changeType !== 'neutral' && (
              <div className="flex items-center mr-2">
                {changeType === 'increase' ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  changeType === 'increase' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {Math.abs(change)}%
                </span>
              </div>
            )}
            <span className="text-xs text-gray-500">vs {period}</span>
          </div>
        </div>
        <div className={`rounded-full ${iconColor} p-3 group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

interface EnhancedTransactionProps {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  eventId?: string;
  onEdit?: () => void;
  onView?: () => void;
}

const EnhancedTransaction: React.FC<EnhancedTransactionProps> = ({
  id,
  date,
  description,
  amount,
  category,
  type,
  eventId,
  onEdit,
  onView
}) => {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Ticket Sales': 'bg-green-500/20 text-green-400',
      'Bar Sales': 'bg-blue-500/20 text-blue-400',
      'Merchandise': 'bg-purple-500/20 text-purple-400',
      'Artist Fees': 'bg-red-500/20 text-red-400',
      'Marketing': 'bg-amber-500/20 text-amber-400',
      'Equipment': 'bg-indigo-500/20 text-indigo-400',
      'Staff': 'bg-cyan-500/20 text-cyan-400',
      'Utilities': 'bg-gray-500/20 text-gray-400',
      'Other': 'bg-zinc-500/20 text-zinc-400'
    };
    return colors[category] || 'bg-zinc-500/20 text-zinc-400';
  };

  return (
    <div className="group flex items-center justify-between border-b border-zinc-700/50 py-4 hover:bg-zinc-800/30 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p className="font-medium text-white truncate group-hover:text-amber-300 transition-colors">
            {description}
          </p>
          <p className={`text-lg font-semibold ${
            type === 'income' ? 'text-green-500' : 'text-red-500'
          }`}>
            {type === 'income' ? '+' : '-'}${amount.toLocaleString()}
          </p>
        </div>
        <div className="flex items-center text-xs text-gray-400 mb-2">
          <span>{date}</span>
          {eventId && (
            <>
              <span className="mx-2">•</span>
              <span>Event Related</span>
            </>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(category)}`}>
            {category}
          </span>
          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {onView && (
              <button 
                onClick={onView}
                className="p-1 rounded-lg bg-zinc-700 hover:bg-zinc-600 transition-colors"
              >
                <Eye className="h-3 w-3 text-gray-300" />
              </button>
            )}
            {onEdit && (
              <button 
                onClick={onEdit}
                className="p-1 rounded-lg bg-zinc-700 hover:bg-zinc-600 transition-colors"
              >
                <Edit3 className="h-3 w-3 text-gray-300" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const FinancialOverviewChart: React.FC<{ transactions: any[] }> = ({ transactions }) => {
  const chartData = useMemo(() => {
    // Generate chart data for the last 30 days
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayTransactions = transactions.filter(tx => 
        isWithinInterval(new Date(tx.date), { 
          start: date, 
          end: date 
        })
      );
      
      const revenue = dayTransactions
        .filter(tx => tx.type === 'income')
        .reduce((sum, tx) => sum + tx.amount, 0);
        
      const expenses = dayTransactions
        .filter(tx => tx.type === 'expense')
        .reduce((sum, tx) => sum + tx.amount, 0);

      days.push({
        date: format(date, 'MMM dd'),
        revenue,
        expenses,
        profit: revenue - expenses
      });
    }
    return days;
  }, [transactions]);

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
          <YAxis stroke="#9ca3af" fontSize={12} />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#fff'
            }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#10b981"
            fillOpacity={1}
            fill="url(#revenueGradient)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="expenses"
            stroke="#ef4444"
            fillOpacity={1}
            fill="url(#expenseGradient)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

const CategoryBreakdownChart: React.FC<{ transactions: any[] }> = ({ transactions }) => {
  const categoryData = useMemo(() => {
    const categories: Record<string, { income: number; expense: number; color: string }> = {};
    
    transactions.forEach(tx => {
      if (!categories[tx.category]) {
        categories[tx.category] = { income: 0, expense: 0, color: '#' + Math.floor(Math.random()*16777215).toString(16) };
      }
      
      if (tx.type === 'income') {
        categories[tx.category].income += tx.amount;
      } else {
        categories[tx.category].expense += tx.amount;
      }
    });

    return Object.entries(categories).map(([name, data]) => ({
      name,
      value: data.income + data.expense,
      income: data.income,
      expense: data.expense,
      color: data.color
    }));
  }, [transactions]);

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={categoryData}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {categoryData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#fff'
            }}
          />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};

const Finances: React.FC = () => {
  const navigate = useNavigate();
  const { transactions, loading, createTransaction } = useFinances();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [showAddTransactionModal, setShowAddTransactionModal] = useState(false);
  const breadcrumbs = useBreadcrumbs();
  
  // Calculate enhanced summary data
  const calculateSummary = () => {
    if (!transactions.length) return { 
      revenue: 0, 
      expenses: 0, 
      profit: 0,
      revenueChange: 0,
      expenseChange: 0,
      profitChange: 0
    };
    
    const revenue = transactions
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);
      
    const expenses = transactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);
      
    return {
      revenue,
      expenses,
      profit: revenue - expenses,
      revenueChange: Math.floor(Math.random() * 20) - 10, // Simulated
      expenseChange: Math.floor(Math.random() * 20) - 10,
      profitChange: Math.floor(Math.random() * 20) - 10
    };
  };
  
  const summary = calculateSummary();
  
  // Get unique categories for filter
  const categories = useMemo(() => {
    const unique = [...new Set(transactions.map(tx => tx.category))];
    return unique.sort();
  }, [transactions]);
  
  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tx.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || tx.category === categoryFilter;
      const matchesType = typeFilter === 'all' || tx.type === typeFilter;
      
      return matchesSearch && matchesCategory && matchesType;
    });
  }, [transactions, searchTerm, categoryFilter, typeFilter]);
  
  const isLoading = loading.isLoading;

  const handleAddTransaction = async (transactionData: any) => {
    try {
      await createTransaction({
        date: transactionData.date,
        description: transactionData.description,
        amount: parseFloat(transactionData.amount),
        category: transactionData.category,
        type: transactionData.type,
        eventId: transactionData.eventId || null,
        artistId: transactionData.artistId || null,
        notes: transactionData.notes
      });
      
      setShowAddTransactionModal(false);
    } catch (error: any) {
      console.error('Error adding transaction:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbs} />
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="font-playfair text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
            Financial Management
          </h1>
          <p className="text-gray-400 mt-1">Track revenue, expenses, and financial performance</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
          <button 
            onClick={() => setShowAddTransactionModal(true)}
            className="flex items-center bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </button>
        </div>
      </div>

      {/* Quick Access Links */}
      <div className="flex flex-wrap gap-4">
        <button 
          onClick={() => navigate('/finances/royalties')}
          className="flex items-center bg-gradient-to-r from-amber-600/20 to-orange-600/20 border border-amber-500/30 rounded-lg px-4 py-3 text-white hover:from-amber-600/30 hover:to-orange-600/30 transition-all"
        >
          <DollarSign className="h-5 w-5 mr-3 text-amber-400" />
          <div className="text-left">
            <p className="font-medium">Artist Royalties</p>
            <p className="text-xs text-gray-400">Manage payments & contracts</p>
          </div>
          <ChevronRight className="h-4 w-4 ml-3 text-gray-400" />
        </button>
        
        <button 
          onClick={() => navigate('/finances/reporting')}
          className="flex items-center bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/30 rounded-lg px-4 py-3 text-white hover:from-blue-600/30 hover:to-indigo-600/30 transition-all"
        >
          <FileText className="h-5 w-5 mr-3 text-blue-400" />
          <div className="text-left">
            <p className="font-medium">Advanced Reports</p>
            <p className="text-xs text-gray-400">Detailed analytics & insights</p>
          </div>
          <ChevronRight className="h-4 w-4 ml-3 text-gray-400" />
        </button>
      </div>

      {/* Key Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <EnhancedFinancialCard
          title="Total Revenue"
          amount={summary.revenue}
          change={summary.revenueChange}
          changeType={summary.revenueChange > 0 ? 'increase' : summary.revenueChange < 0 ? 'decrease' : 'neutral'}
          period="last month"
          icon={<TrendingUp className="h-6 w-6" />}
          iconColor="bg-green-500/20 text-green-400"
          loading={isLoading}
        />
        <EnhancedFinancialCard
          title="Total Expenses"
          amount={summary.expenses}
          change={summary.expenseChange}
          changeType={summary.expenseChange > 0 ? 'increase' : summary.expenseChange < 0 ? 'decrease' : 'neutral'}
          period="last month"
          icon={<TrendingDown className="h-6 w-6" />}
          iconColor="bg-red-500/20 text-red-400"
          loading={isLoading}
        />
        <EnhancedFinancialCard
            title="Net Profit"
            amount={summary.profit}
          change={summary.profitChange}
          changeType={summary.profitChange > 0 ? 'increase' : summary.profitChange < 0 ? 'decrease' : 'neutral'}
          period="last month"
          icon={<BarChart3 className="h-6 w-6" />}
          iconColor="bg-blue-500/20 text-blue-400"
          loading={isLoading}
        />
        <EnhancedFinancialCard
          title="Avg Transaction"
          amount={transactions.length ? Math.round((summary.revenue + summary.expenses) / transactions.length) : 0}
          change={5}
          changeType="increase"
          period="last month"
          icon={<CreditCard className="h-6 w-6" />}
          iconColor="bg-purple-500/20 text-purple-400"
          loading={isLoading}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Financial Overview Chart */}
        <div className="lg:col-span-2">
          <div className="rounded-xl bg-zinc-900/50 backdrop-blur-sm border border-zinc-700/50 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="rounded-full bg-green-500/20 p-2 mr-3">
                  <BarChart3 className="h-5 w-5 text-green-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">Financial Overview</h2>
              </div>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 rounded-lg bg-green-600 text-white text-xs font-medium">
                  30 Days
                </button>
                <button className="px-3 py-1 rounded-lg bg-zinc-700 text-gray-300 text-xs font-medium hover:bg-zinc-600">
                  90 Days
                </button>
              </div>
            </div>
            
            <FinancialOverviewChart transactions={transactions} />
              </div>
            </div>
            
        {/* Category Breakdown */}
        <div className="rounded-xl bg-zinc-900/50 backdrop-blur-sm border border-zinc-700/50 p-6 shadow-xl">
          <div className="flex items-center mb-6">
            <div className="rounded-full bg-purple-500/20 p-2 mr-3">
              <PieChart className="h-5 w-5 text-purple-400" />
              </div>
            <h2 className="text-lg font-semibold text-white">Category Breakdown</h2>
              </div>
          
          <CategoryBreakdownChart transactions={transactions} />
          
          <div className="mt-4 space-y-2">
            {categories.slice(0, 4).map((category, index) => {
              const categoryTotal = transactions
                .filter(tx => tx.category === category)
                .reduce((sum, tx) => sum + tx.amount, 0);
              
              return (
                <div key={category} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: `hsl(${index * 60}, 70%, 50%)` }}
                    />
                    <span className="text-gray-300">{category}</span>
              </div>
                  <span className="text-white font-medium">${categoryTotal.toLocaleString()}</span>
              </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Transactions Section */}
      <div className="rounded-xl bg-zinc-900/50 backdrop-blur-sm border border-zinc-700/50 p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
          <div className="flex items-center">
            <div className="rounded-full bg-amber-500/20 p-2 mr-3">
              <Wallet className="h-5 w-5 text-amber-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">
              Transactions
              <span className="ml-2 text-sm text-gray-400">({filteredTransactions.length})</span>
            </h2>
        </div>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expenses</option>
            </select>
            
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            </div>
          </div>

        <div className="space-y-0 max-h-96 overflow-y-auto">
            {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-green-500 border-t-transparent mr-3"></div>
                <p className="text-white">Loading transactions...</p>
              </div>
          ) : filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction) => (
              <EnhancedTransaction
                  key={transaction.id}
                  id={transaction.id}
                  date={format(new Date(transaction.date), 'MMM d, yyyy')}
                  description={transaction.description}
                  amount={transaction.amount}
                  category={transaction.category}
                  type={transaction.type as 'income' | 'expense'}
                eventId={transaction.eventId}
                onEdit={() => console.log('Edit', transaction.id)}
                onView={() => console.log('View', transaction.id)}
                />
              ))
            ) : (
            <div className="text-center py-12 bg-zinc-800/50 rounded-lg border-2 border-dashed border-zinc-700">
              <Wallet className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                {searchTerm || categoryFilter !== 'all' || typeFilter !== 'all' 
                  ? 'No transactions found' 
                  : 'No transactions yet'
                }
              </h3>
              <p className="text-gray-400 mb-4">
                {searchTerm || categoryFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Add your first transaction to start tracking finances'
                }
                </p>
              {(!searchTerm && categoryFilter === 'all' && typeFilter === 'all') && (
                <button 
                  onClick={() => setShowAddTransactionModal(true)}
                  className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Transaction
                </button>
            )}
            </div>
          )}
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showAddTransactionModal && (
        <AddTransactionModal
          isOpen={showAddTransactionModal}
          onClose={() => setShowAddTransactionModal(false)}
          onAddTransaction={handleAddTransaction}
        />
      )}
    </div>
  );
};

export default Finances;