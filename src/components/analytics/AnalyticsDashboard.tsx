import React, { useState } from 'react';
import { ChevronsRight, Calendar, Download, PlusSquare, Cog, Copy, Info, BarChart2, TrendingUp, RefreshCw } from 'lucide-react';
import { useVenuePerformanceByPeriod } from '../../hooks/useAnalytics';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';

const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'];

const AnalyticsDashboard: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'month' | 'quarter' | 'year'>('month');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { data: performanceData, isLoading, refetch } = useVenuePerformanceByPeriod(timeframe);
  
  const handleRefreshData = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 600); // Add a small delay to make the refresh button animation visible
  };
  
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  
  // Prepare chart data
  const prepareRevenueData = () => {
    if (!performanceData) return [];
    
    // Get income by category
    const { incomeByCategory } = performanceData.financialMetrics;
    
    return Object.entries(incomeByCategory).map(([category, amount]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      value: amount
    }));
  };
  
  const prepareExpensesData = () => {
    if (!performanceData) return [];
    
    // Get expenses by category
    const { expensesByCategory } = performanceData.financialMetrics;
    
    return Object.entries(expensesByCategory).map(([category, amount]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      value: amount
    }));
  };
  
  const prepareEventsData = () => {
    if (!performanceData || !performanceData.events || performanceData.events.length === 0) return [];
    
    return performanceData.events.map(event => ({
      name: event.title.length > 15 ? event.title.substring(0, 15) + '...' : event.title,
      tickets: event.tickets_sold || 0,
      revenue: event.ticketPrice * (event.tickets_sold || 0)
    }));
  };
  
  const prepareGenreData = () => {
    if (!performanceData || !performanceData.eventsMetrics) return [];
    
    const { genreDistribution } = performanceData.eventsMetrics;
    
    return Object.entries(genreDistribution).map(([genre, count]) => ({
      name: genre,
      value: count
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <h2 className="text-xl sm:text-2xl font-bold text-white">Performance Analytics</h2>
        
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <div className="flex rounded-lg bg-zinc-800 p-1">
            <button
              onClick={() => setTimeframe('month')}
              className={`rounded-md px-3 py-1 text-sm font-medium ${
                timeframe === 'month'
                  ? 'bg-amber-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setTimeframe('quarter')}
              className={`rounded-md px-3 py-1 text-sm font-medium ${
                timeframe === 'quarter'
                  ? 'bg-amber-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Quarter
            </button>
            <button
              onClick={() => setTimeframe('year')}
              className={`rounded-md px-3 py-1 text-sm font-medium ${
                timeframe === 'year'
                  ? 'bg-amber-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Year
            </button>
          </div>
          
          <button 
            onClick={handleRefreshData}
            className="inline-flex items-center rounded-lg bg-zinc-800 px-3 py-1 text-sm font-medium text-white hover:bg-zinc-700"
          >
            <RefreshCw size={16} className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          <button className="inline-flex items-center rounded-lg bg-zinc-800 px-3 py-1 text-sm font-medium text-white hover:bg-zinc-700">
            <Download size={16} className="mr-2" />
            Export
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="rounded-lg bg-zinc-900 p-6 flex items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"></div>
          <span className="ml-2 text-white">Loading analytics data...</span>
        </div>
      ) : performanceData ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-lg bg-zinc-900 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Revenue</p>
                  <p className="mt-1 text-2xl font-bold text-white">{formatCurrency(performanceData.financialMetrics.totalIncome)}</p>
                </div>
                <div className="rounded-full bg-green-500/20 p-2">
                  <TrendingUp size={18} className="text-green-500" />
                </div>
              </div>
              <div className="mt-2 flex items-center text-xs">
                <span className="text-gray-400">
                  {timeframe === 'month' ? 'This month' : 
                   timeframe === 'quarter' ? 'This quarter' : 'This year'}
                </span>
              </div>
            </div>
            
            <div className="rounded-lg bg-zinc-900 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Expenses</p>
                  <p className="mt-1 text-2xl font-bold text-white">{formatCurrency(performanceData.financialMetrics.totalExpenses)}</p>
                </div>
                <div className="rounded-full bg-red-500/20 p-2">
                  <TrendingUp size={18} className="text-red-500" />
                </div>
              </div>
              <div className="mt-2 flex items-center text-xs">
                <span className="text-gray-400">
                  {performanceData.financialMetrics.totalExpenses > 0 ? 
                    `${Object.keys(performanceData.financialMetrics.expensesByCategory).length} categories` :
                    'No expenses recorded'}
                </span>
              </div>
            </div>
            
            <div className="rounded-lg bg-zinc-900 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-400">Net Profit</p>
                  <p className="mt-1 text-2xl font-bold text-white">{formatCurrency(performanceData.financialMetrics.netProfit)}</p>
                </div>
                <div className={`rounded-full ${performanceData.financialMetrics.netProfit >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'} p-2`}>
                  <BarChart2 size={18} className={performanceData.financialMetrics.netProfit >= 0 ? 'text-green-500' : 'text-red-500'} />
                </div>
              </div>
              <div className="mt-2 flex items-center text-xs">
                <span className={`${performanceData.financialMetrics.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {performanceData.financialMetrics.netProfit >= 0 ? 'Profitable' : 'Loss'}
                </span>
              </div>
            </div>
            
            <div className="rounded-lg bg-zinc-900 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-400">Events</p>
                  <p className="mt-1 text-2xl font-bold text-white">{performanceData.eventsMetrics.totalEvents}</p>
                </div>
                <div className="rounded-full bg-amber-500/20 p-2">
                  <Calendar size={18} className="text-amber-500" />
                </div>
              </div>
              <div className="mt-2 flex items-center text-xs">
                <span className="text-gray-400">
                  {performanceData.eventsMetrics.totalTickets} tickets sold
                </span>
              </div>
            </div>
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-lg bg-zinc-900 p-4">
              <h3 className="mb-4 text-lg font-medium text-white">Revenue by Category</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={prepareRevenueData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {prepareRevenueData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="rounded-lg bg-zinc-900 p-4">
              <h3 className="mb-4 text-lg font-medium text-white">Expenses by Category</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={prepareExpensesData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {prepareExpensesData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="rounded-lg bg-zinc-900 p-4">
              <h3 className="mb-4 text-lg font-medium text-white">Genre Distribution</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={prepareGenreData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {prepareGenreData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="rounded-lg bg-zinc-900 p-4">
              <h3 className="mb-4 text-lg font-medium text-white">Event Performance</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={prepareEventsData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="name" stroke="#9CA3AF" />
                    <YAxis yAxisId="left" stroke="#9CA3AF" />
                    <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'revenue' ? formatCurrency(value as number) : value,
                        name === 'revenue' ? 'Revenue' : 'Tickets Sold'
                      ]}
                      contentStyle={{ background: '#27272a', border: 'none', borderRadius: '4px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="tickets" fill="#3b82f6" name="Tickets Sold" />
                    <Bar yAxisId="right" dataKey="revenue" fill="#f59e0b" name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          {/* Additional Metrics */}
          <div className="rounded-lg bg-zinc-900 p-4 sm:p-6">
            <h3 className="mb-4 text-lg font-medium text-white">Key Performance Indicators</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-lg bg-zinc-800 p-4">
                <p className="text-xs text-gray-400">Average Attendance</p>
                <p className="mt-1 text-xl font-bold text-white">{performanceData.eventsMetrics.averageAttendance}</p>
                <p className="mt-1 text-xs text-gray-400">per event</p>
              </div>
              
              <div className="rounded-lg bg-zinc-800 p-4">
                <p className="text-xs text-gray-400">Revenue per Attendee</p>
                <p className="mt-1 text-xl font-bold text-white">
                  {performanceData.eventsMetrics.totalTickets > 0 
                    ? formatCurrency(performanceData.financialMetrics.totalIncome / performanceData.eventsMetrics.totalTickets)
                    : '$0.00'}
                </p>
                <p className="mt-1 text-xs text-gray-400">average spend</p>
              </div>
              
              <div className="rounded-lg bg-zinc-800 p-4">
                <p className="text-xs text-gray-400">Profit Margin</p>
                <p className="mt-1 text-xl font-bold text-white">
                  {performanceData.financialMetrics.totalIncome > 0 
                    ? `${(performanceData.financialMetrics.netProfit / performanceData.financialMetrics.totalIncome * 100).toFixed(1)}%`
                    : '0%'}
                </p>
                <p className="mt-1 text-xs text-gray-400">net profit / total income</p>
              </div>
              
              <div className="rounded-lg bg-zinc-800 p-4">
                <p className="text-xs text-gray-400">Customer Satisfaction</p>
                <p className="mt-1 text-xl font-bold text-white">
                  {performanceData.satisfactionMetrics.reviewCount > 0 
                    ? `${performanceData.satisfactionMetrics.averageRating}/5`
                    : 'N/A'}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  {performanceData.satisfactionMetrics.reviewCount > 0 
                    ? `from ${performanceData.satisfactionMetrics.reviewCount} reviews`
                    : 'no reviews yet'}
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-lg bg-zinc-900 p-6 text-center">
          <BarChart2 size={48} className="mx-auto text-zinc-700 mb-3" />
          <p className="text-gray-300">No analytics data available for the selected period</p>
          <p className="mt-1 text-sm text-gray-400">Create events and record transactions to see performance metrics</p>
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <button className="text-amber-500 hover:text-amber-400 text-sm font-medium flex items-center">
          View detailed reports
          <ChevronsRight size={16} className="ml-1" />
        </button>
        
        <div className="flex gap-2">
          <button className="inline-flex items-center rounded-lg bg-zinc-800 px-3 py-1 text-sm font-medium text-white hover:bg-zinc-700">
            <Cog size={16} className="mr-2" />
            Settings
          </button>
          <button className="inline-flex items-center rounded-lg bg-amber-600 px-3 py-1 text-sm font-medium text-white hover:bg-amber-700">
            <PlusSquare size={16} className="mr-2" />
            Create Custom Report
          </button>
        </div>
      </div>
      
      {/* Info box */}
      <div className="rounded-lg bg-blue-900/20 border border-blue-800 p-4">
        <div className="flex items-start">
          <Info size={16} className="mt-0.5 mr-2 text-blue-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-300">About Analytics Dashboard</p>
            <p className="mt-1 text-xs text-gray-300">
              This dashboard provides key performance metrics for your venue. Data is automatically collected 
              from events, tickets, and financial transactions. Use the timeframe selector to change the reporting period.
            </p>
            <div className="mt-2 flex items-center">
              <button className="text-blue-400 hover:text-blue-300 text-xs flex items-center">
                <Copy size={12} className="mr-1" />
                Export dashboard data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;