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
  QrCode,
  Eye,
  Edit3,
  Users,
  Clock,
  MapPin,
  Star,
  ChevronRight,
  Ticket,
  Activity,
  Target
} from 'lucide-react';
import { Link, Routes, Route, useNavigate } from 'react-router-dom';
import CreateEvent from './CreateEvent';
import EventDetail from './EventDetail';
import CalendarView from './CalendarView';
import { useEvents } from '../hooks/useEvents';
import Breadcrumbs, { useBreadcrumbs } from '../components/navigation/Breadcrumbs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { format, isToday, isTomorrow, differenceInDays } from 'date-fns';

interface EventCardProps {
  id: string;
  title: string;
  date: string;
  image: string;
  ticketsSold: number;
  totalCapacity: number;
  averagePrice: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  venue?: string;
  genre?: string;
  onClick?: () => void;
}

const EventCard: React.FC<EventCardProps> = ({
  id,
  title,
  date,
  image,
  ticketsSold,
  totalCapacity,
  averagePrice,
  status,
  venue,
  genre,
  onClick
}) => {
  const navigate = useNavigate();
  const eventDate = new Date(date);
  const daysUntil = differenceInDays(eventDate, new Date());
  const soldPercentage = (ticketsSold / totalCapacity) * 100;
  
  const getDateLabel = () => {
    if (isToday(eventDate)) return 'Today';
    if (isTomorrow(eventDate)) return 'Tomorrow';
    if (daysUntil > 0) return `In ${daysUntil} days`;
    return format(eventDate, 'MMM d, yyyy');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <span className="rounded-full bg-blue-500/20 border border-blue-500/30 px-2 py-0.5 text-xs font-medium text-blue-400">Upcoming</span>;
      case 'ongoing':
        return <span className="rounded-full bg-green-500/20 border border-green-500/30 px-2 py-0.5 text-xs font-medium text-green-400">Live</span>;
      case 'completed':
        return <span className="rounded-full bg-gray-500/20 border border-gray-500/30 px-2 py-0.5 text-xs font-medium text-gray-400">Completed</span>;
      default:
        return null;
    }
  };

  return (
    <div className="group overflow-hidden rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-800 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border border-zinc-700/50">
      <div className="relative h-48">
        <img 
          src={image} 
          alt={title} 
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
            {getStatusBadge(status)}
        </div>
        
        {/* Sold Percentage Badge */}
        <div className="absolute top-3 right-3 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-black">
          {Math.round(soldPercentage)}%
        </div>
        
        {/* Event Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-amber-400">{getDateLabel()}</span>
            {genre && (
              <span className="rounded-full bg-purple-500/20 border border-purple-500/30 px-2 py-0.5 text-xs text-purple-300">
                {genre}
              </span>
            )}
          </div>
          <h3 className="font-playfair text-xl font-semibold text-white mb-1 group-hover:text-amber-300 transition-colors">
            {title}
          </h3>
          {venue && (
            <div className="flex items-center text-sm text-gray-300">
              <MapPin className="h-3 w-3 mr-1" />
              <span>{venue}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-4">
        <div className="mb-4 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg bg-zinc-800/50 p-2">
            <div className="flex items-center justify-center mb-1">
              <Users className="h-3 w-3 text-blue-400 mr-1" />
            <p className="text-xs text-gray-400">Sold</p>
            </div>
            <p className="text-sm font-medium text-white">{ticketsSold}</p>
          </div>
          <div className="rounded-lg bg-zinc-800/50 p-2">
            <div className="flex items-center justify-center mb-1">
              <Target className="h-3 w-3 text-green-400 mr-1" />
            <p className="text-xs text-gray-400">Capacity</p>
            </div>
            <p className="text-sm font-medium text-white">{totalCapacity}</p>
          </div>
          <div className="rounded-lg bg-zinc-800/50 p-2">
            <div className="flex items-center justify-center mb-1">
              <DollarSign className="h-3 w-3 text-amber-400 mr-1" />
              <p className="text-xs text-gray-400">Price</p>
            </div>
            <p className="text-sm font-medium text-white">${averagePrice}</p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">Sales Progress</span>
            <span className="text-xs text-gray-400">{ticketsSold}/{totalCapacity}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-zinc-700 overflow-hidden">
          <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
              style={{ width: `${Math.min(soldPercentage, 100)}%` }}
          ></div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => navigate(`/ticketing/${id}`)}
            className="flex-1 flex items-center justify-center rounded-lg bg-zinc-700 px-3 py-2 text-xs font-medium text-white hover:bg-zinc-600 transition-colors"
          >
            <Eye className="h-3 w-3 mr-1" />
            View
          </button>
          <button 
            onClick={onClick}
            className="flex-1 flex items-center justify-center rounded-lg bg-amber-600 px-3 py-2 text-xs font-medium text-white hover:bg-amber-700 transition-colors"
          >
            <Edit3 className="h-3 w-3 mr-1" />
            Manage
          </button>
        </div>
      </div>
    </div>
  );
};

const EnhancedQRSection: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  
  return (
    <div className="rounded-xl bg-gradient-to-br from-amber-900/20 to-orange-900/20 border border-amber-500/30 p-6 shadow-xl">
      <div className="mb-4 flex items-center space-x-3">
        <div className="rounded-full bg-amber-500/20 p-2">
          <QrCode className="h-5 w-5 text-amber-400" />
        </div>
        <h2 className="text-xl font-semibold text-white">Ticket Scanner</h2>
      </div>
      
      <div className="mb-6 flex flex-col items-center justify-center rounded-lg bg-black/20 border border-amber-500/20 p-8">
        <div className={`rounded-full p-4 mb-4 transition-all duration-300 ${isScanning ? 'bg-green-500/20 animate-pulse' : 'bg-amber-500/20'}`}>
          <QrCode size={48} className={`${isScanning ? 'text-green-400' : 'text-amber-400'}`} />
        </div>
        <p className="text-center text-sm text-gray-300 mb-4">
          {isScanning ? 'Scanning... Point camera at QR code' : 'Scan ticket QR codes for instant validation'}
        </p>
        <button 
          onClick={() => setIsScanning(!isScanning)}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 ${
            isScanning 
              ? 'bg-red-600 hover:bg-red-700 text-white' 
              : 'bg-amber-600 hover:bg-amber-700 text-white'
          }`}
        >
          {isScanning ? 'Stop Scanning' : 'Start Scanning'}
        </button>
      </div>
      
      <div className="rounded-lg bg-black/20 border border-amber-500/20 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-white">Recent Scans</h3>
          <span className="text-xs text-amber-400">Live</span>
        </div>
        <div className="space-y-2">
          {isScanning ? (
            <div className="flex items-center justify-between rounded-lg bg-green-500/10 border border-green-500/20 p-3">
              <div className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                <span className="text-sm text-white">Ready to scan...</span>
              </div>
              <Activity className="h-4 w-4 text-green-400" />
            </div>
          ) : (
            <div className="flex items-center justify-center rounded-lg bg-zinc-800/50 p-6 text-center">
              <div>
                <QrCode className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No recent scans</p>
                <p className="text-xs text-gray-500">Start scanning to see activity</p>
              </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TicketSalesChart: React.FC<{ events: any[] }> = ({ events }) => {
  const chartData = useMemo(() => {
    // Generate sample sales data for the last 7 days
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push({
        day: format(date, 'MMM dd'),
        sales: Math.floor(Math.random() * 100) + 20,
        revenue: Math.floor(Math.random() * 5000) + 1000,
      });
    }
    return days;
  }, [events]);

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} />
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
            dataKey="sales"
            stroke="#f59e0b"
            fillOpacity={1}
            fill="url(#salesGradient)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

const TicketingDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { events, loading, error } = useEvents();
  const breadcrumbs = useBreadcrumbs();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'ongoing' | 'completed'>('all');
  
  // Format events data for display
  const allEvents = events.map(event => ({
      id: event.id,
      title: event.title,
    date: event.date,
    image: event.image || 'https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg?auto=compress&cs=tinysrgb&w=800',
    ticketsSold: event.ticketsSold || 0,
    totalCapacity: event.totalCapacity,
    averagePrice: typeof event.ticketPrice === 'number' ? event.ticketPrice : 0,
    status: event.status as 'upcoming' | 'ongoing' | 'completed',
    venue: 'Main Stage', // Default venue since not in Event type
    genre: event.genre
  }));

  // Filter events
  const filteredEvents = useMemo(() => {
    return allEvents.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           event.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (event.genre && event.genre.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesFilter = filterStatus === 'all' || event.status === filterStatus;
      
      return matchesSearch && matchesFilter;
    });
  }, [allEvents, searchQuery, filterStatus]);

  // Calculate totals
  const totalTicketsSold = allEvents.reduce((sum, event) => sum + event.ticketsSold, 0);
  const totalRevenue = allEvents.reduce((sum, event) => sum + (event.ticketsSold * event.averagePrice), 0);
  const upcomingEventsCount = allEvents.filter(event => event.status === 'upcoming').length;
  
  const isLoading = loading.isLoading;
  
  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbs} />

      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="font-playfair text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            Ticketing
          </h1>
          <p className="text-gray-400 mt-1">Manage events, track sales, and scan tickets</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => navigate('/ticketing/calendar')}
            className="flex items-center bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Calendar View
          </button>
          <button 
            onClick={() => navigate('/ticketing/create')}
            className="flex items-center bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-xl bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border border-blue-500/30 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-blue-400">Upcoming Events</p>
              <p className="text-3xl font-bold text-white mt-1">{upcomingEventsCount}</p>
              <p className="text-xs text-blue-300 mt-1">Ready to go live</p>
            </div>
            <div className="rounded-full bg-blue-500/20 p-3">
              <Calendar className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </div>
        
        <div className="rounded-xl bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-500/30 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-green-400">Tickets Sold</p>
              <p className="text-3xl font-bold text-white mt-1">{totalTicketsSold}</p>
              <p className="text-xs text-green-300 mt-1">Total across all events</p>
            </div>
            <div className="rounded-full bg-green-500/20 p-3">
              <Ticket className="h-6 w-6 text-green-400" />
            </div>
          </div>
            </div>
            
        <div className="rounded-xl bg-gradient-to-br from-amber-900/30 to-orange-900/30 border border-amber-500/30 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-amber-400">Total Revenue</p>
              <p className="text-3xl font-bold text-white mt-1">${totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-amber-300 mt-1">From ticket sales</p>
            </div>
            <div className="rounded-full bg-amber-500/20 p-3">
              <DollarSign className="h-6 w-6 text-amber-400" />
            </div>
              </div>
            </div>
            
        <div className="rounded-xl bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border border-purple-500/30 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-purple-400">Avg. Price</p>
              <p className="text-3xl font-bold text-white mt-1">
                ${allEvents.length ? Math.round(totalRevenue / totalTicketsSold || 0) : 0}
              </p>
              <p className="text-xs text-purple-300 mt-1">Per ticket</p>
            </div>
            <div className="rounded-full bg-purple-500/20 p-3">
              <TrendingUp className="h-6 w-6 text-purple-400" />
            </div>
          </div>
              </div>
              </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Analytics */}
        <div className="lg:col-span-2">
          <div className="rounded-xl bg-zinc-900/50 backdrop-blur-sm border border-zinc-700/50 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="rounded-full bg-amber-500/20 p-2 mr-3">
                  <BarChart3 className="h-5 w-5 text-amber-400" />
              </div>
                <h2 className="text-xl font-semibold text-white">Ticket Sales Trend</h2>
              </div>
              <button className="text-sm text-amber-400 hover:text-amber-300 transition-colors">
                View Details
              </button>
            </div>
            
            <TicketSalesChart events={allEvents} />
          </div>
        </div>
        
        {/* QR Scanner */}
        <EnhancedQRSection />
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 space-x-0 sm:space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search events, venues, or genres..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Events</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Live</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Events Grid */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            {filterStatus === 'all' ? 'All Events' : 
             filterStatus === 'upcoming' ? 'Upcoming Events' :
             filterStatus === 'ongoing' ? 'Live Events' : 'Completed Events'}
            <span className="ml-2 text-sm text-gray-400">({filteredEvents.length})</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-zinc-800 rounded-xl h-72"></div>
            </div>
            ))
          ) : filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <EventCard 
                key={event.id}
                id={event.id}
                title={event.title}
                date={event.date}
                image={event.image}
                ticketsSold={event.ticketsSold}
                totalCapacity={event.totalCapacity}
                averagePrice={event.averagePrice}
                status={event.status}
                venue={event.venue}
                genre={event.genre}
                onClick={() => navigate(`/ticketing/${event.id}`)}
              />
            ))
          ) : (
            <div className="col-span-full">
              <div className="text-center py-12 bg-zinc-900/50 rounded-xl border-2 border-dashed border-zinc-700">
                <Ticket className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  {searchQuery || filterStatus !== 'all' ? 'No events found' : 'No events yet'}
                </h3>
                <p className="text-gray-400 mb-4">
                  {searchQuery || filterStatus !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'Create your first event to get started!'
                  }
                </p>
                {(!searchQuery && filterStatus === 'all') && (
              <button 
                onClick={() => navigate('/ticketing/create')}
                    className="inline-flex items-center bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                    <Plus className="h-4 w-4 mr-2" />
                Create Event
              </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Ticketing: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<TicketingDashboard />} />
      <Route path="/create" element={<CreateEvent />} />
      <Route path="/:id" element={<EventDetail />} />
      <Route path="/calendar" element={<CalendarView />} />
    </Routes>
  );
};

export default Ticketing;