import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  ArrowUpDown, 
  Music, 
  Calendar, 
  MapPin, 
  Star,
  TrendingUp,
  DollarSign,
  Users,
  Clock,
  BarChart3,
  PieChart,
  Eye,
  Edit,
  Phone,
  Mail,
  Globe,
  Instagram,
  Facebook,
  Twitter,
  Sparkles,
  Award,
  Target,
  Activity,
  CheckCircle,
  AlertCircle,
  XCircle,
  Download,
  Upload,
  FileText,
  Briefcase,
  Heart,
  Share2,
  MoreVertical,
  PlayCircle,
  Pause,
  Volume2,
  Video,
  Camera,
  Settings,
  Zap,
  Flame,
  Crown,
  Shield
} from 'lucide-react';
import { useArtists } from '../hooks/useArtists';
import { toast } from 'react-hot-toast';
import ArtistFormModal from '../components/artists/ArtistFormModal';
import { Artist } from '../types';
import Breadcrumbs, { useBreadcrumbs } from '../components/navigation/Breadcrumbs';
import { useNavigate } from 'react-router-dom';
import { format, isAfter, isBefore, addDays, differenceInDays } from 'date-fns';
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

// Enhanced interfaces for artist management
interface ArtistAnalytics {
  totalRevenue: number;
  avgTicketPrice: number;
  performanceCount: number;
  avgAttendance: number;
  popularityScore: number;
  bookingRate: number;
  socialEngagement: number;
  profileCompleteness: number;
}

interface FilterOptions {
  status: string[];
  genre: string[];
  location: string[];
  availability: string;
  popularityRange: [number, number];
  priceRange: [number, number];
}

interface SortOption {
  field: 'name' | 'popularity' | 'revenue' | 'lastPerformance' | 'nextPerformance' | 'status';
  direction: 'asc' | 'desc';
}

// Enhanced Artist Card Component
interface ArtistCardProps {
  artist: Artist;
  analytics: ArtistAnalytics;
  onNavigate: (id: string) => void;
  onQuickAction: (action: string, artistId: string) => void;
}

const ArtistCard: React.FC<ArtistCardProps> = ({ artist, analytics, onNavigate, onQuickAction }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Inquiry': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getPopularityIcon = (score: number) => {
    if (score >= 90) return <Crown className="h-4 w-4 text-amber-500" />;
    if (score >= 70) return <Star className="h-4 w-4 text-amber-400" />;
    if (score >= 50) return <Sparkles className="h-4 w-4 text-blue-400" />;
    return <Activity className="h-4 w-4 text-gray-400" />;
  };

  return (
    <div 
      className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 shadow-lg transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] border border-zinc-700/50 hover:border-amber-500/30 cursor-pointer"
      onClick={() => onNavigate(artist.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background gradient animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Header Image */}
      <div className="relative h-48 w-full overflow-hidden">
        <img
          src={artist.image || "https://images.pexels.com/photos/210922/pexels-photo-210922.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"}
          alt={artist.name}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        
        {/* Popularity Badge */}
        <div className="absolute top-3 left-3 flex items-center bg-black/60 backdrop-blur-sm rounded-full px-2 py-1">
          {getPopularityIcon(analytics.popularityScore)}
          <span className="text-xs font-medium text-white ml-1">{analytics.popularityScore}</span>
        </div>
        
        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium border ${getStatusColor(artist.status)}`}>
            {artist.status === 'Confirmed' && <CheckCircle className="h-3 w-3 mr-1" />}
            {artist.status === 'Pending' && <Clock className="h-3 w-3 mr-1" />}
            {artist.status === 'Inquiry' && <AlertCircle className="h-3 w-3 mr-1" />}
            {artist.status}
          </span>
        </div>
        
        {/* Quick Actions Menu */}
        <div className="absolute bottom-3 right-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="bg-black/60 backdrop-blur-sm rounded-full p-2 text-white hover:bg-black/80 transition-colors"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          
          {showMenu && (
            <div className="absolute bottom-full right-0 mb-2 bg-zinc-900 rounded-lg border border-zinc-700 shadow-xl z-10 min-w-[150px]">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickAction('schedule', artist.id);
                  setShowMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-white hover:bg-zinc-800 rounded-t-lg"
              >
                <Calendar className="h-4 w-4 inline mr-2" />
                Schedule Event
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickAction('contract', artist.id);
                  setShowMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-white hover:bg-zinc-800"
              >
                <FileText className="h-4 w-4 inline mr-2" />
                View Contract
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickAction('analytics', artist.id);
                  setShowMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-white hover:bg-zinc-800 rounded-b-lg"
              >
                <BarChart3 className="h-4 w-4 inline mr-2" />
                View Analytics
              </button>
            </div>
          )}
        </div>
        
        {/* Artist Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-playfair text-xl font-bold text-white truncate group-hover:text-amber-300 transition-colors">
            {artist.name}
          </h3>
          <div className="flex items-center text-sm text-gray-300 mt-1">
            <Music className="h-3 w-3 mr-1" />
            <span className="truncate">{artist.genre}</span>
            {artist.location && (
              <>
                <MapPin className="h-3 w-3 ml-2 mr-1" />
                <span className="truncate">{artist.location}</span>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="relative p-4 space-y-4">
        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-zinc-800/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400">Revenue</span>
              <TrendingUp className="h-3 w-3 text-green-500" />
            </div>
            <p className="text-sm font-semibold text-white">${analytics.totalRevenue.toLocaleString()}</p>
          </div>
          
          <div className="bg-zinc-800/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400">Shows</span>
              <Activity className="h-3 w-3 text-blue-500" />
            </div>
            <p className="text-sm font-semibold text-white">{analytics.performanceCount}</p>
          </div>
          
          <div className="bg-zinc-800/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400">Avg. Attendance</span>
              <Users className="h-3 w-3 text-purple-500" />
            </div>
            <p className="text-sm font-semibold text-white">{analytics.avgAttendance}</p>
          </div>
          
          <div className="bg-zinc-800/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400">Profile</span>
              <Target className="h-3 w-3 text-amber-500" />
            </div>
            <p className="text-sm font-semibold text-white">{analytics.profileCompleteness}%</p>
          </div>
        </div>
        
        {/* Next Performance */}
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-amber-400 font-medium">Next Performance</p>
              <p className="text-sm text-white">
                {artist.nextPerformance 
                  ? format(new Date(artist.nextPerformance), 'MMM d, yyyy')
                  : 'None scheduled'
                }
              </p>
            </div>
            <Calendar className="h-5 w-5 text-amber-500" />
          </div>
        </div>
        
        {/* Contact & Social */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            {artist.email && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(`mailto:${artist.email}`);
                }}
                className="p-1.5 bg-zinc-700 rounded text-gray-400 hover:text-white hover:bg-zinc-600 transition-colors"
              >
                <Mail className="h-3 w-3" />
              </button>
            )}
            {artist.phone && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(`tel:${artist.phone}`);
                }}
                className="p-1.5 bg-zinc-700 rounded text-gray-400 hover:text-white hover:bg-zinc-600 transition-colors"
              >
                <Phone className="h-3 w-3" />
              </button>
            )}
            {artist.socialMedia?.website && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(artist.socialMedia!.website, '_blank');
                }}
                className="p-1.5 bg-zinc-700 rounded text-gray-400 hover:text-white hover:bg-zinc-600 transition-colors"
              >
                <Globe className="h-3 w-3" />
              </button>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            <div className="h-2 w-16 bg-zinc-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-1000"
                style={{ width: `${analytics.profileCompleteness}%` }}
              ></div>
            </div>
            <span className="text-xs text-gray-400">{analytics.profileCompleteness}%</span>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(artist.id);
            }}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium py-2 rounded-lg transition-colors"
          >
            <Eye className="h-3 w-3 inline mr-1" />
            Details
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onQuickAction('schedule', artist.id);
            }}
            className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-xs font-medium py-2 rounded-lg transition-all"
          >
            <Calendar className="h-3 w-3 inline mr-1" />
            Book
          </button>
        </div>
      </div>
    </div>
  );
};

// Analytics Dashboard Component
const AnalyticsDashboard: React.FC<{ artists: Artist[] }> = ({ artists }) => {
  const analyticsData = useMemo(() => {
    // Safety check: ensure artists is an array
    if (!Array.isArray(artists)) {
      return {
        totalArtists: 0,
        confirmedArtists: 0,
        pendingArtists: 0,
        inquiryArtists: 0,
        statusData: [],
        topGenres: []
      };
    }
    
    const statusCounts = artists.reduce((acc, artist) => {
      acc[artist.status] = (acc[artist.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const genreCounts = artists.reduce((acc, artist) => {
      if (artist.genre) {
        acc[artist.genre] = (acc[artist.genre] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalArtists: artists.length,
      confirmedArtists: statusCounts['Confirmed'] || 0,
      pendingArtists: statusCounts['Pending'] || 0,
      inquiryArtists: statusCounts['Inquiry'] || 0,
      statusData: Object.entries(statusCounts).map(([status, count]) => ({
        name: status,
        value: count,
        color: status === 'Confirmed' ? '#10b981' : status === 'Pending' ? '#f59e0b' : '#3b82f6'
      })),
      topGenres: Object.entries(genreCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([genre, count]) => ({ genre, count }))
    };
  }, [artists]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Summary Cards */}
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl p-6 border border-zinc-700/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Total Artists</p>
            <p className="text-2xl font-bold text-white">{analyticsData.totalArtists}</p>
          </div>
          <div className="bg-blue-500/20 p-3 rounded-full">
            <Users className="h-6 w-6 text-blue-400" />
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl p-6 border border-zinc-700/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Confirmed</p>
            <p className="text-2xl font-bold text-green-400">{analyticsData.confirmedArtists}</p>
          </div>
          <div className="bg-green-500/20 p-3 rounded-full">
            <CheckCircle className="h-6 w-6 text-green-400" />
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl p-6 border border-zinc-700/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Pending</p>
            <p className="text-2xl font-bold text-yellow-400">{analyticsData.pendingArtists}</p>
          </div>
          <div className="bg-yellow-500/20 p-3 rounded-full">
            <Clock className="h-6 w-6 text-yellow-400" />
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl p-6 border border-zinc-700/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Inquiries</p>
            <p className="text-2xl font-bold text-blue-400">{analyticsData.inquiryArtists}</p>
          </div>
          <div className="bg-blue-500/20 p-3 rounded-full">
            <AlertCircle className="h-6 w-6 text-blue-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

const Artists: React.FC = () => {
  const { artists, isLoading, createArtist, isCreating } = useArtists();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const breadcrumbs = useBreadcrumbs();
  const navigate = useNavigate();
  
  // Enhanced filtering and sorting
  const [filters, setFilters] = useState<FilterOptions>({
    status: [],
    genre: [],
    location: [],
    availability: 'all',
    popularityRange: [0, 100],
    priceRange: [0, 10000]
  });
  
  const [sortOption, setSortOption] = useState<SortOption>({
    field: 'name',
    direction: 'asc'
  });
  
  const [showFilters, setShowFilters] = useState(false);
  
  // Mock analytics data generator
  const generateMockAnalytics = (artist: Artist): ArtistAnalytics => ({
    totalRevenue: Math.floor(Math.random() * 50000) + 5000,
    avgTicketPrice: Math.floor(Math.random() * 100) + 25,
    performanceCount: Math.floor(Math.random() * 20) + 1,
    avgAttendance: Math.floor(Math.random() * 500) + 100,
    popularityScore: Math.floor(Math.random() * 100) + 1,
    bookingRate: Math.floor(Math.random() * 100) + 1,
    socialEngagement: Math.floor(Math.random() * 10000) + 100,
    profileCompleteness: Math.floor(Math.random() * 40) + 60
  });
  
  // Enhanced filtering logic
  const filteredAndSortedArtists = useMemo(() => {
    // Safety check: ensure artists is an array
    if (!Array.isArray(artists)) {
      return [];
    }
    
    let filtered = artists.filter((artist) => {
      // Text search
      const matchesSearch = !searchTerm || 
    artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (artist.genre && artist.genre.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (artist.location && artist.location.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Status filter
      const matchesStatus = filters.status.length === 0 || filters.status.includes(artist.status);
      
      // Genre filter
      const matchesGenre = filters.genre.length === 0 || 
        (artist.genre && filters.genre.some(g => artist.genre.toLowerCase().includes(g.toLowerCase())));
      
      // Location filter
      const matchesLocation = filters.location.length === 0 || 
        (artist.location && filters.location.includes(artist.location));
      
      return matchesSearch && matchesStatus && matchesGenre && matchesLocation;
    });
    
    // Sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortOption.field) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'popularity':
          aValue = generateMockAnalytics(a).popularityScore;
          bValue = generateMockAnalytics(b).popularityScore;
          break;
        case 'revenue':
          aValue = generateMockAnalytics(a).totalRevenue;
          bValue = generateMockAnalytics(b).totalRevenue;
          break;
        case 'lastPerformance':
          aValue = a.lastPerformance ? new Date(a.lastPerformance).getTime() : 0;
          bValue = b.lastPerformance ? new Date(b.lastPerformance).getTime() : 0;
          break;
        case 'nextPerformance':
          aValue = a.nextPerformance ? new Date(a.nextPerformance).getTime() : 0;
          bValue = b.nextPerformance ? new Date(b.nextPerformance).getTime() : 0;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }
      
      if (sortOption.direction === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
    
    return filtered;
  }, [artists, searchTerm, filters, sortOption]);

  const handleAddArtist = async (artist: Omit<Artist, 'id'>) => {
    const result = await createArtist(artist as any);
    if (result.success) {
      setIsModalOpen(false);
      toast.success(`${artist.name} added successfully!`);
    } else {
      toast.error(`Error adding artist: ${result.error?.message || 'Unknown error'}`);
    }
  };
  
  const handleQuickAction = (action: string, artistId: string) => {
    switch (action) {
      case 'schedule':
        navigate(`/events/create?artistId=${artistId}`);
        break;
      case 'contract':
        navigate(`/artists/${artistId}?tab=contracts`);
        break;
      case 'analytics':
        navigate(`/artists/${artistId}?tab=analytics`);
        break;
      default:
        break;
    }
  };

  // Get unique values for filters
  const filterOptions = useMemo(() => {
    if (!Array.isArray(artists) || artists.length === 0) {
      return {
        statuses: [] as string[],
        genres: [] as string[],
        locations: [] as string[]
      };
    }
    
    return {
      statuses: [...new Set(artists.map(a => a.status).filter(Boolean))] as string[],
      genres: [...new Set(artists.map(a => a.genre).filter(Boolean))] as string[],
      locations: [...new Set(artists.map(a => a.location).filter(Boolean))] as string[]
    };
  }, [artists]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-zinc-900 to-black">
      <div className="space-y-6 p-6">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbs} />
      
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="font-playfair text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              Artist Management
            </h1>
            <p className="text-gray-400 mt-1">
              Manage your artists, contracts, and performance analytics
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className={`flex items-center px-3 py-2 rounded-lg font-medium transition-all ${
                showAnalytics 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
              }`}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </button>
            
        <button 
          onClick={() => setIsModalOpen(true)}
              className="flex items-center bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
        >
              <Plus className="h-4 w-4 mr-2" />
          Add Artist
        </button>
      </div>
          </div>

        {/* Analytics Dashboard */}
        {showAnalytics && <AnalyticsDashboard artists={Array.isArray(artists) ? artists : []} />}

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
                className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Search artists by name, genre, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center px-4 py-3 rounded-xl font-medium transition-all ${
                showFilters 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
              }`}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>
            
            <select
              value={`${sortOption.field}-${sortOption.direction}`}
              onChange={(e) => {
                const [field, direction] = e.target.value.split('-');
                setSortOption({ field: field as SortOption['field'], direction: direction as 'asc' | 'desc' });
              }}
              className="px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:ring-2 focus:ring-amber-500"
            >
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="popularity-desc">Most Popular</option>
              <option value="revenue-desc">Highest Revenue</option>
              <option value="nextPerformance-asc">Next Performance</option>
              <option value="status-asc">Status</option>
            </select>
            
            <div className="flex bg-zinc-800 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-amber-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
          </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-amber-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <ArrowUpDown className="h-4 w-4" />
          </button>
        </div>
      </div>
          </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-700/50 rounded-xl p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <div className="space-y-2">
                  {filterOptions.statuses.map(status => (
                    <label key={status} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.status.includes(status)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters(prev => ({ ...prev, status: [...prev.status, status] }));
                          } else {
                            setFilters(prev => ({ ...prev, status: prev.status.filter(s => s !== status) }));
                          }
                        }}
                        className="rounded border-zinc-600 bg-zinc-800 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="ml-2 text-sm text-gray-300">{status}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Genre Filter */}
                  <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Genre</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {filterOptions.genres.map(genre => (
                    <label key={genre} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.genre.includes(genre)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters(prev => ({ ...prev, genre: [...prev.genre, genre] }));
                          } else {
                            setFilters(prev => ({ ...prev, genre: prev.genre.filter(g => g !== genre) }));
                          }
                        }}
                        className="rounded border-zinc-600 bg-zinc-800 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="ml-2 text-sm text-gray-300">{genre}</span>
                    </label>
                  ))}
                </div>
                </div>

              {/* Location Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {filterOptions.locations.map(location => (
                    <label key={location} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.location.includes(location)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters(prev => ({ ...prev, location: [...prev.location, location] }));
                          } else {
                            setFilters(prev => ({ ...prev, location: prev.location.filter(l => l !== location) }));
                          }
                        }}
                        className="rounded border-zinc-600 bg-zinc-800 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="ml-2 text-sm text-gray-300">{location}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setFilters({
                  status: [],
                  genre: [],
                  location: [],
                  availability: 'all',
                  popularityRange: [0, 100],
                  priceRange: [0, 10000]
                })}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="px-4 py-2 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Artists Grid/List */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="mr-3 h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
              <p className="text-xl text-white">Loading artists...</p>
            </div>
          ) : filteredAndSortedArtists.length > 0 ? (
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {filteredAndSortedArtists.map((artist) => (
                <ArtistCard
                  key={artist.id}
                  artist={artist}
                  analytics={generateMockAnalytics(artist)}
                  onNavigate={(id) => navigate(`/artists/${id}`)}
                  onQuickAction={handleQuickAction}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="rounded-full bg-zinc-800 p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <Music className="h-12 w-12 text-gray-500" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-2">
                {searchTerm ? 'No artists found' : 'No artists yet'}
              </h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                {searchTerm 
                  ? `No artists matching "${searchTerm}" with the current filters.`
                  : 'Add your first artist to start building your roster!'
                }
            </p>
            <button 
              onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
            >
                <Plus className="h-5 w-5 mr-2" />
              Add Artist
            </button>
          </div>
        )}
      </div>

      {/* Artist Form Modal */}
      {isModalOpen && (
        <ArtistFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleAddArtist}
          isSubmitting={isCreating}
        />
      )}
      </div>
    </div>
  );
};

export default Artists;