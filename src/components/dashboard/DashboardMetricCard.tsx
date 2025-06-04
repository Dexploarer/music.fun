import React, { useEffect, memo, useMemo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { useOptimizedState } from '../../hooks/useOptimizedState';

// Real-time status indicator
const LiveIndicator: React.FC<{ active?: boolean }> = memo(({ active = true }) => (
  <div className="flex items-center space-x-1">
    <div className={`h-2 w-2 rounded-full ${active ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
    <span className={`text-xs font-medium ${active ? 'text-green-400' : 'text-gray-400'}`}>
      {active ? 'LIVE' : 'OFFLINE'}
    </span>
  </div>
));

LiveIndicator.displayName = 'LiveIndicator';

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

export const DashboardMetricCard: React.FC<MetricCardProps> = memo(({
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
  const [isHovered, setIsHovered] = useOptimizedState(false);
  const [animatedValue, setAnimatedValue] = useOptimizedState(0);
  
  // Animate value changes
  useEffect(() => {
    if (typeof value === 'number') {
      const timer = setTimeout(() => {
        setAnimatedValue(value);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [value, setAnimatedValue]);

  // Memoize calculations
  const progress = useMemo(() => {
    return target ? (typeof value === 'number' ? (value / target) * 100 : 0) : undefined;
  }, [value, target]);

  const sparklineChartData = useMemo(() => {
    return sparklineData?.map((val, idx) => ({ value: val, index: idx })) || [];
  }, [sparklineData]);

  const displayValue = useMemo(() => {
    return typeof value === 'number' ? animatedValue.toLocaleString() : value;
  }, [value, animatedValue]);

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
                {displayValue}
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
              
              {target && progress !== undefined && (
                <span className="text-xs text-amber-400 font-medium">
                  {Math.round(progress)}% of target
                </span>
              )}
            </div>
          )}
          
          {/* Mini sparkline */}
          {sparklineData && sparklineData.length > 0 && isHovered && (
            <div className="mt-3 h-8">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparklineChartData}>
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
});

DashboardMetricCard.displayName = 'DashboardMetricCard';

export default DashboardMetricCard; 