import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { analyticsApi } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import type { AnalyticsMetric, CustomDashboard, DashboardWidget } from '../types';
import { format, subDays, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, subMonths, subQuarters, subYears, startOfYear, endOfYear } from 'date-fns';

// Helper function to format dates for API calls
const formatDate = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

export function useAnalyticsMetrics(
  category?: string, 
  metricName?: string, 
  timePeriod?: string, 
  timeRange: 'last_7_days' | 'last_30_days' | 'this_month' | 'this_quarter' = 'last_30_days'
) {
  const today = new Date();
  let startDate: string | undefined;
  let endDate: string | undefined;
  
  // Calculate date range based on timeRange
  switch (timeRange) {
    case 'last_7_days':
      startDate = formatDate(subDays(today, 7));
      endDate = formatDate(today);
      break;
    case 'last_30_days':
      startDate = formatDate(subDays(today, 30));
      endDate = formatDate(today);
      break;
    case 'this_month':
      startDate = formatDate(startOfMonth(today));
      endDate = formatDate(endOfMonth(today));
      break;
    case 'this_quarter':
      startDate = formatDate(startOfQuarter(today));
      endDate = formatDate(endOfQuarter(today));
      break;
  }

  const queryClient = useQueryClient();

  const metricsQuery = useQuery({
    queryKey: ['analytics_metrics', category, metricName, timePeriod, startDate, endDate],
    queryFn: () => analyticsApi.getAnalyticsMetrics(category, metricName, timePeriod, startDate, endDate)
  });

  const createMetricMutation = useMutation({
    mutationFn: (metric: Omit<AnalyticsMetric, 'id' | 'createdAt' | 'updatedAt'>) => 
      analyticsApi.createAnalyticsMetric(metric),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics_metrics'] });
      toast.success('Metric recorded successfully!');
    },
    onError: (error) => {
      toast.error(`Error recording metric: ${error.message}`);
    }
  });

  return {
    metrics: metricsQuery.data || [],
    isLoading: metricsQuery.isLoading,
    isError: metricsQuery.isError,
    error: metricsQuery.error,
    createMetric: createMetricMutation.mutate,
    isCreating: createMetricMutation.isPending
  };
}

export function useDashboards() {
  const queryClient = useQueryClient();

  const dashboardsQuery = useQuery({
    queryKey: ['dashboards'],
    queryFn: analyticsApi.getDashboards
  });

  const createDashboardMutation = useMutation({
    mutationFn: (dashboard: Omit<CustomDashboard, 'id' | 'createdAt' | 'updatedAt'>) => 
      analyticsApi.createDashboard(dashboard),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboards'] });
      toast.success('Dashboard created successfully!');
    },
    onError: (error) => {
      toast.error(`Error creating dashboard: ${error.message}`);
    }
  });

  return {
    dashboards: dashboardsQuery.data || [],
    isLoading: dashboardsQuery.isLoading,
    isError: dashboardsQuery.isError,
    error: dashboardsQuery.error,
    createDashboard: createDashboardMutation.mutate,
    isCreating: createDashboardMutation.isPending
  };
}

export function useDashboardDetail(id: string) {
  return useQuery({
    queryKey: ['dashboards', id],
    queryFn: () => analyticsApi.getDashboardWithWidgets(id),
    enabled: !!id
  });
}

export function useCreateDashboardWidget() {
  const queryClient = useQueryClient();

  const createWidgetMutation = useMutation({
    mutationFn: (widget: Omit<DashboardWidget, 'id' | 'createdAt' | 'updatedAt'>) => 
      analyticsApi.createDashboardWidget(widget),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dashboards', variables.dashboardId] });
      toast.success('Widget added successfully!');
    },
    onError: (error) => {
      toast.error(`Error adding widget: ${error.message}`);
    }
  });

  return {
    createWidget: createWidgetMutation.mutate,
    isCreating: createWidgetMutation.isPending
  };
}

export function useEventPerformanceMetrics(eventId: string) {
  return useQuery({
    queryKey: ['event_performance', eventId],
    queryFn: () => analyticsApi.getEventPerformanceMetrics(eventId),
    enabled: !!eventId
  });
}

export function useArtistPerformanceMetrics(artistId: string) {
  return useQuery({
    queryKey: ['artist_performance', artistId],
    queryFn: () => analyticsApi.getArtistPerformanceMetrics(artistId),
    enabled: !!artistId
  });
}

export function useVenuePerformanceByPeriod(
  period: 'month' | 'quarter' | 'year' = 'month',
  customStartDate?: Date,
  customEndDate?: Date
) {
  const today = new Date();
  
  // Set default date ranges based on period if not provided
  let startDate: Date;
  let endDate: Date;
  
  if (customStartDate && customEndDate) {
    startDate = customStartDate;
    endDate = customEndDate;
  } else {
    switch (period) {
      case 'month':
        startDate = subMonths(today, 1);
        endDate = today;
        break;
      case 'quarter':
        startDate = subQuarters(today, 1);
        endDate = today;
        break;
      case 'year':
        startDate = subYears(today, 1);
        endDate = today;
        break;
    }
  }
  
  return useQuery({
    queryKey: ['venue_performance', period, formatDate(startDate), formatDate(endDate)],
    queryFn: () => analyticsApi.getVenuePerformanceByPeriod(
      period, 
      formatDate(startDate), 
      formatDate(endDate)
    )
  });
}

// Dashboard analytics hook for real-time metrics
export const useDashboardMetrics = () => {
  return useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: analyticsApi.getDashboardMetrics,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
    staleTime: 10000 // Consider data stale after 10 seconds
  });
};

// Recent activity feed hook
export const useRecentActivity = (limit: number = 10) => {
  return useQuery({
    queryKey: ['recent-activity', limit],
    queryFn: () => analyticsApi.getRecentActivity(limit),
    refetchInterval: 15000, // Refetch every 15 seconds for live activity
    staleTime: 5000 // Consider data stale after 5 seconds
  });
};

// Revenue trends hook for sparklines
export const useRevenueTrends = (days: number = 30) => {
  return useQuery({
    queryKey: ['revenue-trends', days],
    queryFn: () => analyticsApi.getRevenueTrends(days),
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000 // Consider data stale after 30 seconds
  });
};

// Event type distribution hook
export const useEventTypeDistribution = () => {
  return useQuery({
    queryKey: ['event-type-distribution'],
    queryFn: analyticsApi.getEventTypeDistribution,
    refetchInterval: 120000, // Refetch every 2 minutes
    staleTime: 60000 // Consider data stale after 1 minute
  });
};