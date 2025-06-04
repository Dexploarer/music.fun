import React, { useState, useEffect } from 'react';
import { useAlerts } from '../../hooks/useAlerts';
import { BellRing, AlertTriangle, Eye, EyeOff, RefreshCw, Archive } from 'lucide-react';

interface Alert {
  id: string;
  message: string;
  timestamp: Date;
  severity: 'critical' | 'warning' | 'info';
  isRead: boolean;
}

interface LiveMetric {
  name: string;
  value: number;
  threshold: number;
  comparison: 'above' | 'below';
}

const AlertDashboard: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { createAlert } = useAlerts();

  // Sample metrics for demonstration
  const liveMetrics: LiveMetric[] = [
    { name: 'Ticket Sales', value: 85, threshold: 80, comparison: 'above' },
    { name: 'Bar Stock (Bourbon)', value: 15, threshold: 20, comparison: 'below' },
    { name: 'Website Traffic', value: 120, threshold: 100, comparison: 'above' },
  ];

  // Load initial alerts
  useEffect(() => {
    const loadInitialAlerts = async () => {
      setIsRefreshing(true);
      try {
        const newAlerts: Alert[] = [];
        
        for (const metric of liveMetrics) {
          if (
            (metric.comparison === 'above' && metric.value > metric.threshold) ||
            (metric.comparison === 'below' && metric.value < metric.threshold)
          ) {
            const alertMessage = await createAlert({
              metric_name: metric.name,
              current_value: metric.value,
              threshold: metric.threshold,
              comparison: metric.comparison
            });
            
            newAlerts.push({
              id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              message: alertMessage,
              timestamp: new Date(),
              severity: metric.comparison === 'below' ? 'warning' : 'info',
              isRead: false
            });
          }
        }
        
        setAlerts(newAlerts);
      } catch (error) {
        console.error('Error loading alerts:', error);
      } finally {
        setIsRefreshing(false);
      }
    };
    
    loadInitialAlerts();
  }, []);

  const handleMarkAsRead = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, isRead: true } : alert
    ));
  };

  const handleMarkAllAsRead = () => {
    setAlerts(alerts.map(alert => ({ ...alert, isRead: true })));
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  const refreshAlerts = async () => {
    setIsRefreshing(true);
    try {
      // Simulate refreshing by marking all as read and adding a new alert
      const newAlert = await createAlert({
        metric_name: 'Customer Retention',
        current_value: 92,
        threshold: 90,
        comparison: 'above'
      });
      
      setAlerts([
        {
          id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          message: newAlert,
          timestamp: new Date(),
          severity: 'info',
          isRead: false
        },
        ...alerts
      ]);
    } catch (error) {
      console.error('Error refreshing alerts:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const filteredAlerts = showOnlyUnread 
    ? alerts.filter(alert => !alert.isRead)
    : alerts;

  return (
    <div className="rounded-lg bg-zinc-900 p-4 sm:p-6 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="rounded-full bg-gradient-to-r from-amber-500 to-red-500 p-2">
            <BellRing size={18} className="text-white" />
          </div>
          <h2 className="ml-3 text-lg font-semibold text-white">Real-Time Alerts</h2>
        </div>
        
        <div className="flex space-x-2">
          <button 
            onClick={() => setShowOnlyUnread(!showOnlyUnread)}
            className={`rounded-lg p-1 ${showOnlyUnread ? 'bg-amber-600 text-white' : 'bg-zinc-800 text-gray-400'}`}
            title={showOnlyUnread ? "Show all alerts" : "Show only unread alerts"}
          >
            {showOnlyUnread ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
          <button 
            onClick={refreshAlerts}
            className="rounded-lg bg-zinc-800 p-1 text-gray-400 hover:bg-zinc-700 hover:text-white"
            disabled={isRefreshing}
            title="Refresh alerts"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={handleMarkAllAsRead}
            className="rounded-lg bg-zinc-800 p-1 text-gray-400 hover:bg-zinc-700 hover:text-white"
            title="Mark all as read"
          >
            <Archive size={16} />
          </button>
        </div>
      </div>
      
      {filteredAlerts.length > 0 ? (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {filteredAlerts.map(alert => (
            <div 
              key={alert.id} 
              className={`rounded-lg p-3 relative border ${
                !alert.isRead ? 'border-l-4 border-l-amber-500' : 'border-zinc-800'
              } ${
                alert.severity === 'critical' ? 'bg-red-900/20 border-red-800' : 
                alert.severity === 'warning' ? 'bg-amber-900/20 border-amber-800' : 
                'bg-zinc-800'
              }`}
            >
              <div className="flex">
                <AlertTriangle size={16} className={`mr-2 mt-0.5 flex-shrink-0 ${
                  alert.severity === 'critical' ? 'text-red-500' : 
                  alert.severity === 'warning' ? 'text-amber-500' : 
                  'text-blue-500'
                }`} />
                <div>
                  <div className="text-sm text-white whitespace-pre-line pr-6">{alert.message}</div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {alert.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                    <button
                      onClick={() => !alert.isRead && handleMarkAsRead(alert.id)}
                      className={`text-xs ${
                        alert.isRead ? 'text-gray-500' : 'text-amber-500 hover:text-amber-400'
                      }`}
                      disabled={alert.isRead}
                    >
                      {alert.isRead ? 'Read' : 'Mark as read'}
                    </button>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => handleDeleteAlert(alert.id)}
                className="absolute right-2 top-2 text-gray-500 hover:text-white p-1 rounded-full hover:bg-zinc-700"
              >
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg bg-zinc-800 p-6 text-center">
          <AlertTriangle size={24} className="mx-auto text-gray-500 mb-2" />
          <p className="text-sm text-gray-300">No alerts at this time</p>
          <p className="text-xs text-gray-400 mt-1">
            {showOnlyUnread ? 'No unread alerts. Switch to view all alerts.' : 'System is monitoring metrics in real-time.'}
          </p>
          <button
            onClick={refreshAlerts}
            className="mt-3 rounded-lg bg-zinc-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-600"
          >
            <RefreshCw size={12} className="inline mr-1" />
            Check for alerts
          </button>
        </div>
      )}
      
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {liveMetrics.map((metric, index) => (
          <div key={index} className="rounded-lg bg-zinc-800 p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400">{metric.name}</span>
              <span className={`text-xs ${
                (metric.comparison === 'above' && metric.value > metric.threshold) ||
                (metric.comparison === 'below' && metric.value < metric.threshold)
                  ? 'text-amber-500'
                  : 'text-gray-400'
              }`}>
                Threshold: {metric.threshold}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium text-white">{metric.value}</span>
              <span className={`text-xs rounded px-1.5 py-0.5 ${
                (metric.comparison === 'above' && metric.value > metric.threshold) ||
                (metric.comparison === 'below' && metric.value < metric.threshold)
                  ? 'bg-amber-900/40 text-amber-400'
                  : 'bg-green-900/40 text-green-400'
              }`}>
                {(metric.comparison === 'above' && metric.value > metric.threshold) ||
                 (metric.comparison === 'below' && metric.value < metric.threshold)
                  ? 'Alert'
                  : 'Normal'}
              </span>
            </div>
            <div className="mt-1 h-1.5 w-full rounded-full bg-zinc-700">
              <div 
                className={`h-1.5 rounded-full ${
                  (metric.comparison === 'above' && metric.value > metric.threshold) ||
                  (metric.comparison === 'below' && metric.value < metric.threshold)
                    ? 'bg-amber-500'
                    : 'bg-green-500'
                }`}
                style={{ 
                  width: `${Math.min(100, (metric.value / metric.threshold) * 100)}%`
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertDashboard;