import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  BarChart, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Calendar,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';
import Breadcrumbs, { useBreadcrumbs } from '../../components/navigation/Breadcrumbs';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import EventSummaryGenerator from '../../components/reporting/EventSummaryGenerator';

// Sample data for charts
const revenueData = [
  { name: 'Jan', tickets: 4000, bar: 2400, merch: 1200 },
  { name: 'Feb', tickets: 3000, bar: 1800, merch: 900 },
  { name: 'Mar', tickets: 5000, bar: 2800, merch: 1500 },
  { name: 'Apr', tickets: 2780, bar: 1908, merch: 760 },
  { name: 'May', tickets: 4890, bar: 2800, merch: 1300 },
  { name: 'Jun', tickets: 3390, bar: 2800, merch: 1100 },
];

const attendanceData = [
  { name: 'Jan', attendance: 350, capacity: 500 },
  { name: 'Feb', attendance: 280, capacity: 500 },
  { name: 'Mar', attendance: 450, capacity: 500 },
  { name: 'Apr', attendance: 320, capacity: 500 },
  { name: 'May', attendance: 480, capacity: 500 },
  { name: 'Jun', attendance: 390, capacity: 500 },
];

const genreDistribution = [
  { name: 'Blues', value: 35 },
  { name: 'Country', value: 25 },
  { name: 'Folk', value: 15 },
  { name: 'Jazz', value: 10 },
  { name: 'Rock', value: 15 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AdvancedReporting: React.FC = () => {
  const navigate = useNavigate();
  const breadcrumbs = useBreadcrumbs();
  const [activeTab, setActiveTab] = useState<'revenue' | 'attendance' | 'genre' | 'ai-insights'>('revenue');
  const [timeframe, setTimeframe] = useState<'month' | 'quarter' | 'year'>('month');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate data refresh
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };
  
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbs} />
      
      <div className="flex flex-col justify-between space-y-3 sm:flex-row sm:items-center sm:space-y-0">
        <div>
          <button 
            onClick={() => navigate('/finances')}
            className="mb-2 flex items-center text-sm font-medium text-gray-400 hover:text-white"
          >
            <ChevronLeft size={16} className="mr-1" />
            Back to Finances
          </button>
          <h1 className="font-playfair text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Advanced Analytics
          </h1>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button className="inline-flex items-center rounded-lg bg-zinc-800 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white hover:bg-zinc-700 focus:outline-none">
            <Filter size={12} className="mr-1 sm:mr-2" />
            Filter
          </button>
          <button 
            onClick={handleRefresh} 
            disabled={isLoading}
            className="inline-flex items-center rounded-lg bg-zinc-800 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white hover:bg-zinc-700 focus:outline-none"
          >
            <RefreshCw size={12} className={`mr-1 sm:mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button className="inline-flex items-center rounded-lg bg-amber-600 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white hover:bg-amber-700 focus:outline-none">
            <Download size={12} className="mr-1 sm:mr-2" />
            Export
          </button>
        </div>
      </div>
      
      {/* KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-lg bg-zinc-900 p-4 shadow-md">
          <p className="text-sm text-gray-400">Revenue (YTD)</p>
          <div className="flex items-baseline">
            <p className="mt-1 text-2xl font-bold text-white">$127,500</p>
            <p className="ml-2 text-xs text-green-500">+12.5%</p>
          </div>
          <div className="mt-1 flex items-center text-xs text-gray-400">
            <TrendingUp size={10} className="mr-1 text-green-500" />
            <span>vs previous year</span>
          </div>
        </div>
        
        <div className="rounded-lg bg-zinc-900 p-4 shadow-md">
          <p className="text-sm text-gray-400">Events</p>
          <div className="flex items-baseline">
            <p className="mt-1 text-2xl font-bold text-white">42</p>
            <p className="ml-2 text-xs text-green-500">+8%</p>
          </div>
          <div className="mt-1 flex items-center text-xs text-gray-400">
            <Calendar size={10} className="mr-1 text-amber-500" />
            <span>12 upcoming</span>
          </div>
        </div>
        
        <div className="rounded-lg bg-zinc-900 p-4 shadow-md">
          <p className="text-sm text-gray-400">Total Attendance</p>
          <div className="flex items-baseline">
            <p className="mt-1 text-2xl font-bold text-white">8,750</p>
            <p className="ml-2 text-xs text-green-500">+15.2%</p>
          </div>
          <div className="mt-1 flex items-center text-xs text-gray-400">
            <Users size={10} className="mr-1 text-blue-500" />
            <span>208 attendees/event avg</span>
          </div>
        </div>
        
        <div className="rounded-lg bg-zinc-900 p-4 shadow-md">
          <p className="text-sm text-gray-400">Avg. Revenue per Event</p>
          <div className="flex items-baseline">
            <p className="mt-1 text-2xl font-bold text-white">$3,035</p>
            <p className="ml-2 text-xs text-green-500">+4.1%</p>
          </div>
          <div className="mt-1 flex items-center text-xs text-gray-400">
            <DollarSign size={10} className="mr-1 text-green-500" />
            <span>65% ticket sales, 35% bar</span>
          </div>
        </div>
      </div>
      
      {/* Analytics Tabs */}
      <div className="rounded-xl bg-zinc-900 p-4 sm:p-6 shadow-lg">
        <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
          <div className="w-full max-w-xl">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
              <TabsList>
                <TabsTrigger value="revenue">Revenue</TabsTrigger>
                <TabsTrigger value="attendance">Attendance</TabsTrigger>
                <TabsTrigger value="genre">Genre Mix</TabsTrigger>
                <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
              </TabsList>
              
              <TabsContent value="revenue" className="mt-4 h-80 pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#27272a', borderColor: '#3f3f46', color: '#ffffff' }} />
                    <Legend />
                    <Bar dataKey="tickets" fill="#3b82f6" name="Ticket Sales" />
                    <Bar dataKey="bar" fill="#f59e0b" name="Bar Sales" />
                    <Bar dataKey="merch" fill="#10b981" name="Merchandise" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </TabsContent>
              
              <TabsContent value="attendance" className="mt-4 h-80 pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={attendanceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#27272a', borderColor: '#3f3f46', color: '#ffffff' }} />
                    <Legend />
                    <Line type="monotone" dataKey="attendance" stroke="#f59e0b" strokeWidth={2} activeDot={{ r: 8 }} name="Attendance" />
                    <Line type="monotone" dataKey="capacity" stroke="#9ca3af" strokeDasharray="5 5" name="Capacity" />
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>
              
              <TabsContent value="genre" className="mt-4 h-80 pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genreDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {genreDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#27272a', borderColor: '#3f3f46', color: '#ffffff' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </TabsContent>
              
              <TabsContent value="ai-insights" className="mt-4 pt-4">
                <EventSummaryGenerator />
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              className={`rounded-lg px-3 py-1 text-xs font-medium ${
                timeframe === 'month' ? 'bg-amber-600 text-white' : 'bg-zinc-800 text-gray-300'
              }`}
              onClick={() => setTimeframe('month')}
            >
              Monthly
            </button>
            <button
              className={`rounded-lg px-3 py-1 text-xs font-medium ${
                timeframe === 'quarter' ? 'bg-amber-600 text-white' : 'bg-zinc-800 text-gray-300'
              }`}
              onClick={() => setTimeframe('quarter')}
            >
              Quarterly
            </button>
            <button
              className={`rounded-lg px-3 py-1 text-xs font-medium ${
                timeframe === 'year' ? 'bg-amber-600 text-white' : 'bg-zinc-800 text-gray-300'
              }`}
              onClick={() => setTimeframe('year')}
            >
              Yearly
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedReporting;