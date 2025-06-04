import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, 
  Calendar, 
  DollarSign, 
  Plus, 
  Ticket, 
  Users, 
  Zap, 
  ShoppingCart, 
  AlertTriangle, 
  Award, 
  UserCog, 
  Brain,
  TrendingUp,
  TrendingDown,
  Clock,
  MapPin,
  ChevronRight,
  Activity,
  PieChart,
  Monitor,
  Cloud
} from 'lucide-react';
import { useAI } from '../contexts/AIContext';
import { useEvents } from '../hooks/useEvents';
import { useFinances } from '../hooks/useFinances';
import { useLowStockItems } from '../hooks/useInventory';
import { useLoyaltyProgram } from '../hooks/useLoyaltyProgram';
import { 
  useDashboardMetrics, 
  useRecentActivity, 
  useRevenueTrends, 
  useEventTypeDistribution 
} from '../hooks/useAnalytics';
import { format, isToday, isTomorrow, differenceInDays } from 'date-fns';
import { useNavigate } from 'react-router-dom';
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
  Pie
} from 'recharts';

// Real-time activity interface - removed unused ActivityItem interface

// Enhanced performance metrics
interface PerformanceMetrics {
  cpuUsage: number;
  memoryUsage: number;
  activeUsers: number;
  responseTime: number;
  uptime: number;
  errorRate: number;
}

// Social media metrics - removed unused SocialMetrics interface

// Weather data for outdoor events
interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  forecast: Array<{
    date: string;
    temperature: number;
    condition: string;
  }>;
}

// Enhanced loading skeleton component with animations - removed unused MetricSkeleton

// Real-time status indicator
const LiveIndicator: React.FC<{ active?: boolean }> = ({ active = true }) => (
  <div className="flex items-center space-x-1">
    <div className={`h-2 w-2 rounded-full ${active ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
    <span className={`text-xs font-medium ${active ? 'text-green-400' : 'text-gray-400'}`}>
      {active ? 'LIVE' : 'OFFLINE'}
    </span>
  </div>
);

// Enhanced metric card component with real-time capabilities
interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: React.ReactNode;
  iconColor: string;
  loading?: boolean;
  onClick?: () => void;
  subtitle?: string;
  realTime?: boolean;
  trending?: 'up' | 'down' | 'stable';
  sparklineData?: number[];
  target?: number;
  period?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType,
  icon,
  iconColor,
  loading,
  onClick,
  subtitle,
  realTime = false,
  trending,
  sparklineData,
  target,
  period = 'vs last period'
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [animatedValue, setAnimatedValue] = useState(0);
  
  // Animate value changes
  useEffect(() => {
    if (typeof value === 'number') {
      const timer = setTimeout(() => {
        setAnimatedValue(value);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [value]);

  const progress = target ? (typeof value === 'number' ? (value / target) * 100 : 0) : undefined;

  return (
    <div 
      className={`group relative overflow-hidden rounded-xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-6 shadow-lg transition-all duration-500 hover:shadow-2xl hover:scale-105 border border-zinc-700/50 hover:border-amber-500/30 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background gradient animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Real-time indicator */}
      {realTime && (
        <div className="absolute top-3 right-3">
          <LiveIndicator />
        </div>
      )}
      
      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-400">{title}</p>
            {trending && (
              <div className="flex items-center">
                {trending === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
                {trending === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
                {trending === 'stable' && <div className="h-3 w-3 rounded-full bg-yellow-500"></div>}
              </div>
            )}
          </div>
          
          {loading ? (
            <div className="h-8 w-20 bg-zinc-700 rounded animate-pulse"></div>
          ) : (
            <div className="space-y-2">
              <p className="text-3xl font-bold text-white group-hover:text-amber-300 transition-colors duration-300">
                {typeof value === 'number' ? animatedValue.toLocaleString() : value}
              </p>
              
              {target && progress !== undefined && (
                <div className="w-full bg-zinc-700 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  ></div>
                </div>
              )}
            </div>
          )}
          
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
          
          {change !== undefined && (
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center">
                {changeType === 'increase' ? (
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                ) : changeType === 'decrease' ? (
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                ) : null}
                <span className={`text-sm font-medium ${
                  changeType === 'increase' ? 'text-green-500' : 
                  changeType === 'decrease' ? 'text-red-500' : 
                  'text-gray-400'
                }`}>
                  {change > 0 ? '+' : ''}{change}%
                </span>
                <span className="text-xs text-gray-500 ml-1">{period}</span>
              </div>
              
              {target && (
                <span className="text-xs text-amber-400 font-medium">
                  {Math.round(progress || 0)}% of target
                </span>
              )}
            </div>
          )}
          
          {/* Mini sparkline */}
          {sparklineData && sparklineData.length > 0 && isHovered && (
            <div className="mt-3 h-8">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparklineData.map((val, idx) => ({ value: val, index: idx }))}>
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#f59e0b" 
                    strokeWidth={1}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
        
        <div className={`relative rounded-full ${iconColor} p-3 group-hover:scale-110 transition-all duration-300 ml-4`}>
          {icon}
          {realTime && (
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-ping"></div>
          )}
        </div>
      </div>
    </div>
  );
};

// Enhanced event card component
interface EventCardProps {
  event: any;
  onViewDetails: (id: string) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onViewDetails }) => {
  const eventDate = new Date(event.date);
  const daysUntil = differenceInDays(eventDate, new Date());
  
  const getDateLabel = () => {
    if (isToday(eventDate)) return 'Today';
    if (isTomorrow(eventDate)) return 'Tomorrow';
    if (daysUntil > 0) return `In ${daysUntil} days`;
    return format(eventDate, 'MMM d, yyyy');
  };

  const ticketSalesPercentage = ((event.tickets_sold || 0) / event.total_capacity) * 100;

  return (
    <div className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-zinc-800 to-zinc-700 p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl border border-zinc-600/50">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <img
            src={event.image || "https://images.pexels.com/photos/2747446/pexels-photo-2747446.jpeg?auto=compress&cs=tinysrgb&w=400"}
            alt={event.title}
            className="h-16 w-16 rounded-lg object-cover shadow-lg"
          />
          <div className="absolute -top-1 -right-1 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-black">
            {Math.round(ticketSalesPercentage)}%
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-white truncate group-hover:text-amber-300 transition-colors">
              {event.title}
            </h3>
            <span className="text-xs text-amber-400 font-medium">{getDateLabel()}</span>
          </div>
          
          <div className="flex items-center text-xs text-gray-400 mb-2">
            <Clock className="h-3 w-3 mr-1" />
            <span>{format(eventDate, 'h:mm a')}</span>
            <MapPin className="h-3 w-3 ml-3 mr-1" />
            <span>{event.venue || 'Main Stage'}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-2 w-24 rounded-full bg-zinc-600 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                  style={{ width: `${Math.min(ticketSalesPercentage, 100)}%` }}
                ></div>
              </div>
              <span className="ml-2 text-xs text-gray-400">
                {event.tickets_sold || 0}/{event.total_capacity}
              </span>
            </div>
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(event.id);
              }}
              className="flex items-center text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors"
            >
              View <ChevronRight className="h-3 w-3 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { isProcessing, generateContent } = useAI();
  const { events, loading: eventsLoading } = useEvents();
  const { transactions } = useFinances();
  const { customerLoyalty, isLoadingLoyalty } = useLoyaltyProgram();
  const { data: lowStockItems } = useLowStockItems();
  const navigate = useNavigate();
  
  // Real analytics data hooks
  const { data: dashboardMetrics, isLoading: isDashboardLoading } = useDashboardMetrics();
  const { data: recentActivity, isLoading: isActivityLoading } = useRecentActivity(10);
  const { data: revenueTrends } = useRevenueTrends(30);
  const { data: eventTypeDistribution } = useEventTypeDistribution();
  
  const [aiInsight, setAiInsight] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Mock performance metrics (system performance - not business metrics)
  const [performanceMetrics] = useState<PerformanceMetrics>({
    cpuUsage: 25,
    memoryUsage: 35,
    activeUsers: dashboardMetrics?.active?.customers || 0,
    responseTime: 75,
    uptime: 99.9,
    errorRate: 0.1
  });
  
  // Mock weather data (can be replaced with real weather API later)
  const [weatherData] = useState<WeatherData>({
    temperature: 72,
    condition: 'Partly Cloudy',
    humidity: 65,
    windSpeed: 8,
    forecast: [
      { date: 'Today', temperature: 72, condition: 'Partly Cloudy' },
      { date: 'Tomorrow', temperature: 75, condition: 'Sunny' },
      { date: 'Saturday', temperature: 68, condition: 'Cloudy' }
    ]
  });
  
  // Update time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, []);
  
  // Calculate enhanced summary data using real dashboard metrics
  const summary = useMemo(() => {
    if (dashboardMetrics) {
      return {
        revenue: dashboardMetrics.month.totalTicketsSold * 50, // Estimated average ticket price
        expenses: dashboardMetrics.today.expenses,
        profit: dashboardMetrics.today.profit,
        revenueChange: 15, // This could be calculated from trends
        expenseChange: -5
      };
    }
    
    // Fallback to basic transaction calculation if dashboard metrics not available
    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) return { 
      revenue: 0, 
      expenses: 0, 
      profit: 0,
      revenueChange: 0,
      expenseChange: 0 
    };
    
    const revenue = transactions
      .filter((tx: any) => tx.type === 'income')
      .reduce((sum: number, tx: any) => sum + tx.amount, 0);
      
    const expenses = transactions
      .filter((tx: any) => tx.type === 'expense')
      .reduce((sum: number, tx: any) => sum + tx.amount, 0);
      
    return {
      revenue,
      expenses,
      profit: revenue - expenses,
      revenueChange: 10,
      expenseChange: -8
    };
  }, [dashboardMetrics, transactions]);
  
  // Get upcoming events with enhanced filtering
  const upcomingEvents = events
    .filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= new Date() && event.status === 'upcoming';
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);
    
  // Get today's events
  const todaysEvents = events.filter(event => 
    isToday(new Date(event.date)) && event.status === 'upcoming'
  );
  
  // Calculate total ticket sales using real dashboard metrics or fallback to events
  const totalTicketsSold = dashboardMetrics?.month?.totalTicketsSold || 
    events.reduce((sum, e) => sum + (e.ticketsSold || 0), 0);
  const totalCapacity = dashboardMetrics?.month?.totalCapacity || 
    events.reduce((sum, e) => sum + (e.totalCapacity || 0), 0);
  
  // Generate revenue chart data from real trends or sample data
  const revenueChartData = useMemo(() => {
    if (revenueTrends && revenueTrends.length > 0) {
      // Use last 6 data points for monthly view
      const monthlyData = revenueTrends.slice(-6).map((trend) => ({
        month: new Date(trend.date).toLocaleDateString('en', { month: 'short' }),
        revenue: trend.revenue,
        expenses: trend.expenses
      }));
      
      return monthlyData.length > 0 ? monthlyData : [
        { month: 'Jan', revenue: 12000, expenses: 8000 },
        { month: 'Feb', revenue: 15000, expenses: 9000 },
        { month: 'Mar', revenue: 18000, expenses: 11000 },
        { month: 'Apr', revenue: 22000, expenses: 12000 },
        { month: 'May', revenue: 25000, expenses: 13000 },
        { month: 'Jun', revenue: 28000, expenses: 14000 },
      ];
    }
    
    return [
      { month: 'Jan', revenue: 12000, expenses: 8000 },
      { month: 'Feb', revenue: 15000, expenses: 9000 },
      { month: 'Mar', revenue: 18000, expenses: 11000 },
      { month: 'Apr', revenue: 22000, expenses: 12000 },
      { month: 'May', revenue: 25000, expenses: 13000 },
      { month: 'Jun', revenue: 28000, expenses: 14000 },
    ];
  }, [revenueTrends]);
  
  // Use real event type distribution or sample data
  const eventTypeData = useMemo(() => {
    if (eventTypeDistribution && eventTypeDistribution.length > 0) {
      const colors = ['#f59e0b', '#ef4444', '#8b5cf6', '#10b981', '#3b82f6', '#ec4899'];
      return eventTypeDistribution.map((item, index) => ({
        name: item.name,
        value: item.value,
        color: colors[index % colors.length]
      }));
    }
    
    return [
      { name: 'Concerts', value: 45, color: '#f59e0b' },
      { name: 'Comedy', value: 25, color: '#ef4444' },
      { name: 'Private Events', value: 20, color: '#8b5cf6' },
      { name: 'Workshops', value: 10, color: '#10b981' },
    ];
  }, [eventTypeDistribution]);

  // Generate sparkline data for metrics using real trends
  const generateSparklineData = () => {
    if (revenueTrends && revenueTrends.length > 0) {
      return revenueTrends.slice(-10).map(trend => trend.revenue);
    }
    return Array.from({ length: 10 }, () => Math.floor(Math.random() * 100) + 50);
  };

  // Generate AI insights
  useEffect(() => {
    const generateInsights = async () => {
      if (events.length > 0 && !isProcessing && !aiInsight) {
        try {
          const insight = await generateContent(`Based on this venue data, provide a brief business insight: Events: ${events.length}, Revenue: $${summary.revenue}, Sold Tickets: ${totalTicketsSold}/${totalCapacity}`);
            setAiInsight(insight);
        } catch (error) {
          console.error('Error generating insights:', error);
        }
      }
    };
    
    generateInsights();
  }, [events, isProcessing, summary.revenue, aiInsight, generateContent, totalTicketsSold, totalCapacity]);

  // Activity Feed Component with real data
  const ActivityFeed: React.FC = () => {
    const activityItems = useMemo(() => {
      if (!recentActivity || recentActivity.length === 0) return [];
      
      return recentActivity.map((activity) => {
        let icon: React.ReactNode;
        let color: string;
        
        switch (activity.type) {
          case 'ticket_sale':
            icon = <Ticket className="h-4 w-4" />;
            color = 'text-green-400';
            break;
          case 'payment':
            icon = <DollarSign className="h-4 w-4" />;
            color = 'text-green-400';
            break;
          case 'expense':
            icon = <AlertTriangle className="h-4 w-4" />;
            color = 'text-red-400';
            break;
          case 'customer_signup':
            icon = <Users className="h-4 w-4" />;
            color = 'text-blue-400';
            break;
          case 'event_created':
            icon = <Calendar className="h-4 w-4" />;
            color = 'text-purple-400';
            break;
          default:
            icon = <Activity className="h-4 w-4" />;
            color = 'text-gray-400';
        }
        
        return {
          ...activity,
          icon,
          color
        };
      });
    }, [recentActivity]);
    
    return (
      <div className="rounded-xl bg-zinc-900/50 backdrop-blur-sm border border-zinc-700/50 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="rounded-full bg-blue-500/20 p-2 mr-3">
              <Activity className="h-5 w-5 text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Live Activity</h2>
          </div>
          <LiveIndicator active={!isActivityLoading} />
        </div>

        <div className="space-y-3 max-h-64 overflow-y-auto">
          {isActivityLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse bg-zinc-800/50 rounded-lg p-3 h-16"></div>
              ))}
            </div>
          ) : activityItems.length > 0 ? (
            activityItems.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/30 hover:bg-zinc-700/50 transition-colors">
                <div className={`${activity.color}`}>
                  {activity.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{activity.message}</p>
                  <p className="text-xs text-gray-400">{format(activity.timestamp, 'HH:mm')}</p>
                </div>
                {activity.value && (
                  <div className="text-sm font-medium text-amber-400">
                    ${activity.value}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-gray-400">
              <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recent activity</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Performance Dashboard Component
  const PerformanceDashboard: React.FC = () => (
    <div className="rounded-xl bg-zinc-900/50 backdrop-blur-sm border border-zinc-700/50 p-6 shadow-xl">
      <div className="flex items-center mb-4">
        <div className="rounded-full bg-green-500/20 p-2 mr-3">
          <Monitor className="h-5 w-5 text-green-400" />
        </div>
        <h2 className="text-lg font-semibold text-white">System Performance</h2>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-zinc-800/50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">CPU Usage</span>
            <span className="text-sm font-medium text-white">{performanceMetrics.cpuUsage}%</span>
          </div>
          <div className="w-full bg-zinc-700 rounded-full h-2">
            <div 
              className="h-2 bg-gradient-to-r from-green-500 to-yellow-500 rounded-full transition-all duration-1000"
              style={{ width: `${performanceMetrics.cpuUsage}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-zinc-800/50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Memory</span>
            <span className="text-sm font-medium text-white">{performanceMetrics.memoryUsage}%</span>
          </div>
          <div className="w-full bg-zinc-700 rounded-full h-2">
            <div 
              className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000"
              style={{ width: `${performanceMetrics.memoryUsage}%` }}
            ></div>
          </div>
        </div>
        
        <div className="bg-zinc-800/50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Active Users</span>
            <span className="text-sm font-medium text-white">{dashboardMetrics?.active?.customers || 0}</span>
          </div>
        </div>

        <div className="bg-zinc-800/50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Uptime</span>
            <span className="text-sm font-medium text-green-400">{performanceMetrics.uptime}%</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Weather Widget Component
  const WeatherWidget: React.FC = () => (
    <div className="rounded-xl bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border border-blue-500/30 p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="rounded-full bg-blue-500/20 p-2 mr-3">
            <Cloud className="h-5 w-5 text-blue-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">Weather</h2>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">{weatherData.temperature}°F</div>
          <div className="text-xs text-blue-300">{weatherData.condition}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-4">
        {weatherData.forecast.map((day, index) => (
          <div key={index} className="text-center">
            <div className="text-xs text-gray-400 mb-1">{day.date}</div>
            <div className="text-sm font-medium text-white">{day.temperature}°</div>
            <div className="text-xs text-blue-300">{day.condition}</div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-zinc-900 to-black">
      <div className="space-y-8 p-6">
        {/* Enhanced Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
            <div>
            <h1 className="font-playfair text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-gray-400 mt-1">
              {format(currentTime, 'EEEE, MMMM d, yyyy')} • {format(currentTime, 'h:mm a')}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {todaysEvents.length > 0 && (
              <div className="flex items-center bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                <Activity className="h-4 w-4 text-amber-500 mr-2" />
                <span className="text-sm text-amber-400 font-medium">
                  {todaysEvents.length} event{todaysEvents.length > 1 ? 's' : ''} today
                </span>
            </div>
            )}
            
            <button 
              onClick={() => navigate('/ticketing/create')}
              className="flex items-center bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Event
            </button>
          </div>
        </div>

        {/* Enhanced Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Upcoming Events"
            value={dashboardMetrics?.month?.upcomingEvents || upcomingEvents.length}
            change={15}
            changeType="increase"
            icon={<Calendar className="h-6 w-6" />}
            iconColor="bg-blue-500/20 text-blue-400"
            loading={Boolean(isDashboardLoading) || Boolean(eventsLoading)}
            onClick={() => navigate('/ticketing')}
            subtitle={`${dashboardMetrics?.today?.events || todaysEvents.length} happening today`}
            realTime={true}
            trending="up"
            sparklineData={generateSparklineData()}
            target={50}
          />
          
          <MetricCard
            title="Today's Revenue"
            value={`$${(dashboardMetrics?.today?.revenue || summary.revenue).toLocaleString()}`}
            change={summary.revenueChange}
            changeType={summary.revenueChange > 0 ? 'increase' : 'decrease'}
            icon={<DollarSign className="h-6 w-6" />}
            iconColor="bg-green-500/20 text-green-400"
            loading={isDashboardLoading}
            onClick={() => navigate('/finances')}
            subtitle={`$${(dashboardMetrics?.today?.profit || 0).toLocaleString()} profit today`}
            realTime={true}
            trending={summary.revenueChange > 0 ? 'up' : 'down'}
            sparklineData={generateSparklineData()}
            target={5000}
          />
          
          <MetricCard
            title="Tickets Sold"
            value={totalTicketsSold}
            change={Math.round(((totalTicketsSold / (totalCapacity || 1)) * 100) - 75)}
            changeType="increase"
            icon={<Ticket className="h-6 w-6" />}
            iconColor="bg-purple-500/20 text-purple-400"
            loading={Boolean(isDashboardLoading) || Boolean(eventsLoading)}
            onClick={() => navigate('/ticketing')}
            subtitle={`${Math.round((totalTicketsSold / (totalCapacity || 1)) * 100)}% capacity filled`}
            realTime={true}
            trending="up"
            sparklineData={generateSparklineData()}
            target={totalCapacity || 1000}
          />
          
          <MetricCard
            title="Active Customers"
            value={dashboardMetrics?.active?.customers || Array.isArray(customerLoyalty) ? customerLoyalty.length : 0}
            change={12}
            changeType="increase"
            icon={<Award className="h-6 w-6" />}
            iconColor="bg-amber-500/20 text-amber-400"
            loading={isDashboardLoading || isLoadingLoyalty}
            onClick={() => navigate('/customer-loyalty')}
            subtitle="30-day active users"
            realTime={true}
            trending="up"
            sparklineData={generateSparklineData()}
            target={1000}
          />
      </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Events & Analytics */}
          <div className="lg:col-span-2 space-y-6">
        {/* Upcoming Events */}
            <div className="rounded-xl bg-zinc-900/50 backdrop-blur-sm border border-zinc-700/50 p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="rounded-full bg-blue-500/20 p-2 mr-3">
                    <Calendar className="h-5 w-5 text-blue-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">Upcoming Events</h2>
                </div>
              <button 
                onClick={() => navigate('/ticketing')}
                  className="text-sm text-amber-400 hover:text-amber-300 transition-colors"
              >
                  View All Events
              </button>
            </div>
            
              {eventsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-zinc-800 rounded-lg p-4 h-24"></div>
                  ))}
              </div>
            ) : upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                    <EventCard 
                      key={event.id} 
                      event={event} 
                      onViewDetails={(id) => navigate(`/ticketing/${id}`)} 
                    />
                ))}
              </div>
            ) : (
                <div className="text-center py-12 bg-zinc-800/50 rounded-lg border-2 border-dashed border-zinc-700">
                  <Calendar className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No upcoming events</h3>
                  <p className="text-gray-400 mb-4">Create your first event to get started!</p>
                <button 
                  onClick={() => navigate('/ticketing/create')}
                    className="inline-flex items-center bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </button>
              </div>
            )}
          </div>
          
            {/* Revenue Analytics Chart */}
            <div className="rounded-xl bg-zinc-900/50 backdrop-blur-sm border border-zinc-700/50 p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                  <div className="rounded-full bg-green-500/20 p-2 mr-3">
                    <BarChart3 className="h-5 w-5 text-green-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">Revenue Overview</h2>
                </div>
                    <button 
                  onClick={() => navigate('/finances')}
                  className="text-sm text-amber-400 hover:text-amber-300 transition-colors"
                    >
                  View Details
                    </button>
              </div>
              
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueChartData}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#f59e0b"
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
            </div>
          </div>

          {/* Right Column - Quick Actions & Insights */}
          <div className="space-y-6">
            {/* Live Activity Feed */}
            <ActivityFeed />
            
            {/* Performance Dashboard */}
            <PerformanceDashboard />
            
            {/* Weather Widget */}
            <WeatherWidget />

            {/* Quick Actions */}
            <div className="rounded-xl bg-zinc-900/50 backdrop-blur-sm border border-zinc-700/50 p-6 shadow-xl">
              <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
              
              <div className="space-y-3">
              <button 
                onClick={() => navigate('/customer-loyalty')}
                  className="w-full flex items-center justify-between bg-gradient-to-r from-amber-600/20 to-orange-600/20 border border-amber-500/30 rounded-lg p-3 text-left text-white transition-all hover:from-amber-600/30 hover:to-orange-600/30"
                >
                  <div className="flex items-center">
                    <Award className="h-5 w-5 mr-3 text-amber-400" />
                    <span className="font-medium">Loyalty Program</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
              </button>
              
              <button 
                onClick={() => navigate('/staff')}
                  className="w-full flex items-center justify-between bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 text-left text-white transition-all hover:bg-zinc-700/50"
                >
                  <div className="flex items-center">
                    <UserCog className="h-5 w-5 mr-3 text-blue-400" />
                    <span className="font-medium">Staff Management</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
              </button>
              
              <button 
                  onClick={() => navigate('/inventory')}
                  className="w-full flex items-center justify-between bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 text-left text-white transition-all hover:bg-zinc-700/50"
                >
                  <div className="flex items-center">
                    <ShoppingCart className="h-5 w-5 mr-3 text-green-400" />
                    <span className="font-medium">Inventory</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
              </button>
              
              <button 
                onClick={() => navigate('/ai-tools')}
                  className="w-full flex items-center justify-between bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-500/30 rounded-lg p-3 text-left text-white transition-all hover:from-purple-600/30 hover:to-indigo-600/30"
                >
                  <div className="flex items-center">
                    <Zap className="h-5 w-5 mr-3 text-purple-400" />
                    <span className="font-medium">AI Marketing Tools</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          </div>
          
            {/* Event Type Distribution */}
            <div className="rounded-xl bg-zinc-900/50 backdrop-blur-sm border border-zinc-700/50 p-6 shadow-xl">
              <div className="flex items-center mb-4">
                <div className="rounded-full bg-purple-500/20 p-2 mr-3">
                  <PieChart className="h-5 w-5 text-purple-400" />
                </div>
                <h2 className="text-lg font-semibold text-white">Event Distribution</h2>
            </div>
            
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={eventTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {eventTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-4">
                {eventTypeData.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs text-gray-400">{item.name} ({item.value}%)</span>
                  </div>
                ))}
              </div>
          </div>
          
          {/* AI Insights */}
            <div className="rounded-xl bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border border-purple-500/30 p-6 shadow-xl">
              <div className="flex items-center mb-4">
                <div className="rounded-full bg-purple-500/20 p-2 mr-3">
                  <Brain className="h-5 w-5 text-purple-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">AI Insights</h2>
            </div>
            
              <div className="bg-black/20 rounded-lg p-4 border border-purple-500/20">
              {isProcessing ? (
                <div className="flex items-center">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-500 border-t-transparent mr-2"></div>
                    <p className="text-sm text-purple-300">Generating insights...</p>
                </div>
              ) : (
                                    <p className="text-sm text-purple-200 leading-relaxed">
                    {String(aiInsight) || "Add events and data to generate AI-powered insights for your venue."}
                  </p>
              )}
              </div>
            </div>

            {/* Low Stock Alert */}
            {Array.isArray(lowStockItems) && lowStockItems.length > 0 && (
              <div className="rounded-xl bg-red-900/20 border border-red-500/30 p-6 shadow-xl">
                <div className="flex items-center mb-4">
                  <div className="rounded-full bg-red-500/20 p-2 mr-3">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                  </div>
                  <h2 className="text-lg font-semibold text-white">Low Stock Alert</h2>
                </div>
                
                <p className="text-sm text-red-300 mb-3">
                  {lowStockItems.length} item{lowStockItems.length > 1 ? 's' : ''} need restocking
                </p>
                
                <button 
                  onClick={() => navigate('/inventory')}
                  className="w-full bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 text-red-300 hover:text-red-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  View Inventory
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;