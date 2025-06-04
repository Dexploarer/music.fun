import React, { memo, useMemo } from 'react';
import { 
  Activity, 
  Ticket, 
  DollarSign, 
  AlertTriangle, 
  Users, 
  Calendar 
} from 'lucide-react';
import { format } from 'date-fns';
import { VirtualizedList } from '../ui/VirtualizedList';
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

// Activity item component
const ActivityItem: React.FC<{ activity: any; index: number }> = memo(({ activity }) => {
  const { icon, color } = useMemo(() => {
    switch (activity.type) {
      case 'ticket_sale':
        return { icon: <Ticket className="h-4 w-4" />, color: 'text-green-400' };
      case 'payment':
        return { icon: <DollarSign className="h-4 w-4" />, color: 'text-green-400' };
      case 'expense':
        return { icon: <AlertTriangle className="h-4 w-4" />, color: 'text-red-400' };
      case 'customer_signup':
        return { icon: <Users className="h-4 w-4" />, color: 'text-blue-400' };
      case 'event_created':
        return { icon: <Calendar className="h-4 w-4" />, color: 'text-purple-400' };
      default:
        return { icon: <Activity className="h-4 w-4" />, color: 'text-gray-400' };
    }
  }, [activity.type]);

  const formattedTime = useMemo(() => {
    return format(activity.timestamp, 'HH:mm');
  }, [activity.timestamp]);

  const formattedValue = useMemo(() => {
    return activity.value ? `$${activity.value}` : null;
  }, [activity.value]);

  return (
    <div className="flex items-center space-x-3 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/30 hover:bg-zinc-700/50 transition-colors">
      <div className={color}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white truncate">{activity.message}</p>
        <p className="text-xs text-gray-400">{formattedTime}</p>
      </div>
      {formattedValue && (
        <div className="text-sm font-medium text-amber-400">
          {formattedValue}
        </div>
      )}
    </div>
  );
});

ActivityItem.displayName = 'ActivityItem';

// Loading skeleton
const ActivitySkeleton: React.FC = memo(() => (
  <div className="space-y-3">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="animate-pulse bg-zinc-800/50 rounded-lg p-3 h-16"></div>
    ))}
  </div>
));

ActivitySkeleton.displayName = 'ActivitySkeleton';

// Empty state
const EmptyActivityState: React.FC = memo(() => (
  <div className="text-center py-6 text-gray-400">
    <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
    <p className="text-sm">No recent activity</p>
  </div>
));

EmptyActivityState.displayName = 'EmptyActivityState';

interface DashboardActivityFeedProps {
  recentActivity: any[];
  isLoading: boolean;
  maxHeight?: number;
  itemHeight?: number;
}

export const DashboardActivityFeed: React.FC<DashboardActivityFeedProps> = memo(({
  recentActivity,
  isLoading,
  maxHeight = 264, // max-h-64 equivalent
  itemHeight = 64
}) => {
  const [useVirtualScrolling] = useOptimizedState(recentActivity.length > 10);

  // Memoize processed activity items
  const activityItems = useMemo(() => {
    if (!recentActivity || recentActivity.length === 0) return [];
    
    return recentActivity.map((activity, index) => ({
      ...activity,
      id: activity.id || `activity-${index}`,
      key: activity.id || `activity-${index}`
    }));
  }, [recentActivity]);

  const renderActivityItem = useMemo(() => {
    return (item: any, index: number) => (
      <ActivityItem key={item.key} activity={item} index={index} />
    );
  }, []);

  const getItemKey = useMemo(() => {
    return (item: any) => item.key;
  }, []);

  return (
    <div className="rounded-xl bg-zinc-900/50 backdrop-blur-sm border border-zinc-700/50 p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="rounded-full bg-blue-500/20 p-2 mr-3">
            <Activity className="h-5 w-5 text-blue-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">Live Activity</h2>
        </div>
        <LiveIndicator active={!isLoading} />
      </div>

      <div style={{ height: maxHeight }} className="overflow-hidden">
        {isLoading ? (
          <ActivitySkeleton />
        ) : activityItems.length > 0 ? (
          useVirtualScrolling ? (
            <VirtualizedList
              items={activityItems}
              itemHeight={itemHeight}
              containerHeight={maxHeight}
              renderItem={renderActivityItem}
              getItemKey={getItemKey}
              className="space-y-3"
              overscan={2}
            />
          ) : (
            <div className="space-y-3 max-h-full overflow-y-auto">
              {activityItems.map((activity, index) => (
                <ActivityItem key={activity.key} activity={activity} index={index} />
              ))}
            </div>
          )
        ) : (
          <EmptyActivityState />
        )}
      </div>
    </div>
  );
});

DashboardActivityFeed.displayName = 'DashboardActivityFeed';

export default DashboardActivityFeed; 