import React, { useMemo, memo, Suspense, useState, useCallback, useRef, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { memoizeWithTTL, debounce, createIntersectionObserver } from '../../utils/performance';
import { usePerformance } from '../../hooks/usePerformance';
import { useOptimizedState } from '../../hooks/useOptimizedState';

// Lazy load chart components
const LazyLineChart = React.lazy(() => 
  import('recharts').then(module => ({ default: module.LineChart }))
);

const LazyAreaChart = React.lazy(() => 
  import('recharts').then(module => ({ default: module.AreaChart }))
);

const LazyBarChart = React.lazy(() => 
  import('recharts').then(module => ({ default: module.BarChart }))
);

const LazyPieChart = React.lazy(() => 
  import('recharts').then(module => ({ default: module.PieChart }))
);

// Chart loading skeleton
const ChartSkeleton: React.FC<{ height?: number }> = memo(({ height = 300 }) => (
  <div className="animate-pulse bg-zinc-800/50 rounded-lg" style={{ height }}>
    <div className="p-4 space-y-3">
      <div className="h-4 bg-zinc-700 rounded w-1/4"></div>
      <div className="space-y-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-3 bg-zinc-700 rounded" style={{ width: `${60 + Math.random() * 40}%` }}></div>
        ))}
      </div>
    </div>
  </div>
));

ChartSkeleton.displayName = 'ChartSkeleton';

// Performance-optimized data processing
const processChartData = memoizeWithTTL((rawData: any[], options: {
  dateField?: string;
  valueFields: string[];
  aggregationType?: 'sum' | 'avg' | 'count';
  groupBy?: string;
  timeRange?: { start: Date; end: Date };
}) => {
  const { dateField, valueFields, aggregationType = 'sum', groupBy, timeRange } = options;
  
  let processedData = [...rawData];
  
  // Filter by time range if provided
  if (timeRange && dateField) {
    processedData = processedData.filter(item => {
      const itemDate = new Date(item[dateField]);
      return itemDate >= timeRange.start && itemDate <= timeRange.end;
    });
  }
  
  // Group and aggregate data if needed
  if (groupBy) {
    const grouped = processedData.reduce((acc, item) => {
      const key = item[groupBy];
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {} as Record<string, any[]>);
    
    processedData = Object.entries(grouped).map(([key, items]) => {
      const aggregated = { [groupBy]: key };
      
      valueFields.forEach(field => {
        const values = items.map(item => item[field]).filter(val => typeof val === 'number');
        
        switch (aggregationType) {
          case 'avg':
            aggregated[field] = values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
            break;
          case 'count':
            aggregated[field] = values.length;
            break;
          default: // sum
            aggregated[field] = values.reduce((sum, val) => sum + val, 0);
        }
      });
      
      return aggregated;
    });
  }
  
  return processedData;
}, 5 * 60 * 1000); // 5 minute cache

// Enhanced chart interface
interface OptimizedChartProps {
  data: any[];
  type: 'line' | 'area' | 'bar' | 'pie';
  title?: string;
  height?: number;
  width?: string | number;
  loading?: boolean;
  error?: Error | null;
  onDataPointClick?: (data: any) => void;
  colors?: string[];
  showLegend?: boolean;
  showTooltip?: boolean;
  animate?: boolean;
  responsive?: boolean;
  dataKeys: {
    x?: string;
    y?: string | string[];
    name?: string;
    value?: string;
  };
  formatters?: {
    tooltip?: (value: any, name: string) => [string, string];
    xAxis?: (value: any) => string;
    yAxis?: (value: any) => string;
  };
  aggregationOptions?: {
    dateField?: string;
    valueFields: string[];
    aggregationType?: 'sum' | 'avg' | 'count';
    groupBy?: string;
    timeRange?: { start: Date; end: Date };
  };
  virtualScrolling?: boolean;
  maxDataPoints?: number;
  lazy?: boolean;
}

// Optimized chart component with performance enhancements
export const OptimizedChart: React.FC<OptimizedChartProps> = memo(({
  data,
  type,
  title,
  height = 300,
  width = '100%',
  loading = false,
  error = null,
  onDataPointClick,
  colors = ['#f59e0b', '#ef4444', '#8b5cf6', '#10b981', '#3b82f6'],
  showLegend = true,
  showTooltip = true,
  animate = true,
  responsive = true,
  dataKeys,
  formatters,
  aggregationOptions,
  virtualScrolling = false,
  maxDataPoints = 1000,
  lazy = true
}) => {
  const { measureRenderTime } = usePerformance();
  const [isIntersecting, setIsIntersecting] = useOptimizedState(false);
  const [chartData, setChartData] = useOptimizedState<any[]>([]);
  const chartRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver>();
  
  // Process and memoize chart data
  const processedData = useMemo(() => {
    const endMeasure = measureRenderTime('OptimizedChart-dataProcessing');
    
    try {
      let result = data;
      
      // Apply aggregation if specified
      if (aggregationOptions) {
        result = processChartData(data, aggregationOptions);
      }
      
      // Limit data points for performance
      if (result.length > maxDataPoints) {
        const step = Math.ceil(result.length / maxDataPoints);
        result = result.filter((_, index) => index % step === 0);
      }
      
      endMeasure();
      return result;
    } catch (err) {
      endMeasure();
      console.error('Error processing chart data:', err);
      return [];
    }
  }, [data, aggregationOptions, maxDataPoints, measureRenderTime]);
  
  // Set up intersection observer for lazy loading
  useEffect(() => {
    if (!lazy || !chartRef.current) return;
    
    observerRef.current = createIntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsIntersecting(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    
    observerRef.current.observe(chartRef.current);
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [lazy, setIsIntersecting]);
  
  // Update chart data when processed data changes
  useEffect(() => {
    if (!lazy || isIntersecting) {
      setChartData(processedData);
    }
  }, [processedData, isIntersecting, lazy, setChartData]);
  
  // Debounced click handler
  const debouncedClickHandler = useMemo(() => {
    return onDataPointClick ? debounce(onDataPointClick, 150) : undefined;
  }, [onDataPointClick]);
  
  // Common chart props
  const commonProps = {
    data: chartData,
    width: typeof width === 'string' ? undefined : width,
    height,
    onClick: debouncedClickHandler,
  };
  
  // Render chart based on type
  const renderChart = useCallback(() => {
    if (loading) {
      return <ChartSkeleton height={height} />;
    }
    
    if (error) {
      return (
        <div className="flex items-center justify-center bg-red-900/20 border border-red-500/30 rounded-lg" style={{ height }}>
          <div className="text-center p-4">
            <div className="text-red-400 text-sm font-medium">Chart Error</div>
            <div className="text-red-300 text-xs mt-1">{error.message}</div>
          </div>
        </div>
      );
    }
    
    if (!chartData || chartData.length === 0) {
      return (
        <div className="flex items-center justify-center bg-zinc-800/50 rounded-lg" style={{ height }}>
          <div className="text-center p-4">
            <div className="text-gray-400 text-sm">No data available</div>
          </div>
        </div>
      );
    }
    
    const ChartComponent = lazy ? (
      <Suspense fallback={<ChartSkeleton height={height} />}>
        {renderChartByType()}
      </Suspense>
    ) : (
      renderChartByType()
    );
    
    return (
      <ResponsiveContainer width={width} height={height}>
        {ChartComponent}
      </ResponsiveContainer>
    );
  }, [loading, error, chartData, height, width, lazy]);
  
  const renderChartByType = useCallback(() => {
    const animationProps = animate ? { animationDuration: 750 } : { isAnimationActive: false };
    
    switch (type) {
      case 'line':
        const LineComponent = lazy ? LazyLineChart : LineChart;
        return (
          <LineComponent {...commonProps} {...animationProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey={dataKeys.x} 
              stroke="#9ca3af" 
              tickFormatter={formatters?.xAxis}
            />
            <YAxis 
              stroke="#9ca3af" 
              tickFormatter={formatters?.yAxis}
            />
            {showTooltip && (
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
                formatter={formatters?.tooltip}
              />
            )}
            {showLegend && <Legend />}
            {Array.isArray(dataKeys.y) ? (
              dataKeys.y.map((key, index) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  dot={{ fill: colors[index % colors.length], strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))
            ) : (
              <Line
                type="monotone"
                dataKey={dataKeys.y}
                stroke={colors[0]}
                strokeWidth={2}
                dot={{ fill: colors[0], strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            )}
          </LineComponent>
        );
        
      case 'area':
        const AreaComponent = lazy ? LazyAreaChart : AreaChart;
        return (
          <AreaComponent {...commonProps} {...animationProps}>
            <defs>
              {colors.map((color, index) => (
                <linearGradient key={index} id={`gradient${index}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey={dataKeys.x} 
              stroke="#9ca3af" 
              tickFormatter={formatters?.xAxis}
            />
            <YAxis 
              stroke="#9ca3af" 
              tickFormatter={formatters?.yAxis}
            />
            {showTooltip && (
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
                formatter={formatters?.tooltip}
              />
            )}
            {showLegend && <Legend />}
            {Array.isArray(dataKeys.y) ? (
              dataKeys.y.map((key, index) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[index % colors.length]}
                  fillOpacity={1}
                  fill={`url(#gradient${index})`}
                  strokeWidth={2}
                />
              ))
            ) : (
              <Area
                type="monotone"
                dataKey={dataKeys.y}
                stroke={colors[0]}
                fillOpacity={1}
                fill="url(#gradient0)"
                strokeWidth={2}
              />
            )}
          </AreaComponent>
        );
        
      case 'bar':
        const BarComponent = lazy ? LazyBarChart : BarChart;
        return (
          <BarComponent {...commonProps} {...animationProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey={dataKeys.x} 
              stroke="#9ca3af" 
              tickFormatter={formatters?.xAxis}
            />
            <YAxis 
              stroke="#9ca3af" 
              tickFormatter={formatters?.yAxis}
            />
            {showTooltip && (
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
                formatter={formatters?.tooltip}
              />
            )}
            {showLegend && <Legend />}
            {Array.isArray(dataKeys.y) ? (
              dataKeys.y.map((key, index) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={colors[index % colors.length]}
                  radius={[4, 4, 0, 0]}
                />
              ))
            ) : (
              <Bar
                dataKey={dataKeys.y}
                fill={colors[0]}
                radius={[4, 4, 0, 0]}
              />
            )}
          </BarComponent>
        );
        
      case 'pie':
        const PieComponent = lazy ? LazyPieChart : PieChart;
        return (
          <PieComponent {...commonProps} {...animationProps}>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              paddingAngle={5}
              dataKey={dataKeys.value || 'value'}
              nameKey={dataKeys.name || 'name'}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            {showTooltip && (
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
                formatter={formatters?.tooltip}
              />
            )}
            {showLegend && <Legend />}
          </PieComponent>
        );
        
      default:
        return null;
    }
  }, [type, commonProps, animate, dataKeys, showTooltip, showLegend, formatters, colors, chartData, lazy]);
  
  return (
    <div ref={chartRef} className="w-full">
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
      )}
      {renderChart()}
    </div>
  );
});

OptimizedChart.displayName = 'OptimizedChart';

// Specialized chart components with pre-configured optimizations
export const RevenueChart = memo<Omit<OptimizedChartProps, 'type' | 'dataKeys'> & {
  data: Array<{ date: string; revenue: number; expenses?: number; }>;
}>((props) => (
  <OptimizedChart
    {...props}
    type="area"
    dataKeys={{ x: 'date', y: ['revenue', 'expenses'] }}
    colors={['#10b981', '#ef4444']}
    formatters={{
      tooltip: (value, name) => [`$${value.toLocaleString()}`, name],
      yAxis: (value) => `$${value.toLocaleString()}`
    }}
  />
));

export const EventDistributionChart = memo<Omit<OptimizedChartProps, 'type' | 'dataKeys'> & {
  data: Array<{ name: string; value: number; }>;
}>((props) => (
  <OptimizedChart
    {...props}
    type="pie"
    dataKeys={{ name: 'name', value: 'value' }}
    formatters={{
      tooltip: (value, name) => [`${value}%`, name]
    }}
  />
));

export const AttendanceChart = memo<Omit<OptimizedChartProps, 'type' | 'dataKeys'> & {
  data: Array<{ month: string; attendance: number; capacity: number; }>;
}>((props) => (
  <OptimizedChart
    {...props}
    type="bar"
    dataKeys={{ x: 'month', y: ['attendance', 'capacity'] }}
    colors={['#f59e0b', '#6b7280']}
    formatters={{
      tooltip: (value, name) => [`${value.toLocaleString()}`, name]
    }}
  />
));

export default OptimizedChart; 