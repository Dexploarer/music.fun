import React, { useState, useEffect } from 'react';
import { usePerformance } from '../../hooks/usePerformance';
import { 
  monitorMemoryUsage, 
  getNetworkStatus, 
  checkPerformanceBudget,
  clearPerformanceData 
} from '../../utils/performance';
import { 
  Activity, 
  Zap, 
  Clock, 
  HardDrive, 
  Wifi, 
  WifiOff, 
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Trash2
} from 'lucide-react';

interface PerformanceMonitorProps {
  showDetails?: boolean;
  className?: string;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ 
  showDetails = false,
  className = ''
}) => {
  const performance = usePerformance();
  const [networkStatus, setNetworkStatus] = useState(getNetworkStatus());
  const [budgetCheck, setBudgetCheck] = useState<{ passed: boolean; violations: string[] }>({ 
    passed: true, 
    violations: [] 
  });

  // Update network status periodically
  useEffect(() => {
    const updateNetworkStatus = () => {
      setNetworkStatus(getNetworkStatus());
    };

    const interval = setInterval(updateNetworkStatus, 5000);
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
    };
  }, []);

  // Check performance budget
  useEffect(() => {
    const budget = {
      loadTime: 3000, // 3 seconds
      memoryUsage: 50  // 50%
    };
    
    const check = checkPerformanceBudget(budget);
    setBudgetCheck(check);
  }, [performance.loadTime, performance.memoryUsage]);

  const handleClearPerformanceData = () => {
    clearPerformanceData();
    performance.clearMeasurements();
  };

  const handleMemoryCheck = () => {
    monitorMemoryUsage();
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  const getPerformanceLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Poor';
  };

  if (!showDetails) {
    // Compact view
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="flex items-center gap-2">
          <Activity className={`h-4 w-4 ${getPerformanceColor(performance.score)}`} />
          <span className={`text-sm font-medium ${getPerformanceColor(performance.score)}`}>
            {performance.score}
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          {networkStatus.online ? (
            <Wifi className="h-4 w-4 text-green-400" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-400" />
          )}
        </div>
        
        {!budgetCheck.passed && (
          <AlertTriangle className="h-4 w-4 text-amber-400" />
        )}
      </div>
    );
  }

  // Detailed view
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Performance Score */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Performance Score</h3>
          <div className="flex items-center gap-2">
            <Activity className={`h-5 w-5 ${getPerformanceColor(performance.score)}`} />
            <span className={`text-2xl font-bold ${getPerformanceColor(performance.score)}`}>
              {performance.score}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Status</span>
          <span className={`font-medium ${getPerformanceColor(performance.score)}`}>
            {getPerformanceLabel(performance.score)}
          </span>
        </div>
        
        <div className="mt-4 bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${
              performance.score >= 90 ? 'bg-green-400' :
              performance.score >= 70 ? 'bg-yellow-400' :
              performance.score >= 50 ? 'bg-orange-400' : 'bg-red-400'
            }`}
            style={{ width: `${performance.score}%` }}
          />
        </div>
      </div>

      {/* Core Web Vitals */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Core Web Vitals</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {performance.vitals.FCP ? `${Math.round(performance.vitals.FCP)}ms` : 'N/A'}
            </div>
            <div className="text-sm text-gray-400">First Contentful Paint</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">
              {performance.vitals.LCP ? `${Math.round(performance.vitals.LCP)}ms` : 'N/A'}
            </div>
            <div className="text-sm text-gray-400">Largest Contentful Paint</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400 mb-1">
              {performance.vitals.FID ? `${Math.round(performance.vitals.FID)}ms` : 'N/A'}
            </div>
            <div className="text-sm text-gray-400">First Input Delay</div>
          </div>
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Memory Usage */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Memory Usage</h3>
            <HardDrive className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="text-3xl font-bold text-amber-400 mb-2">
            {performance.memoryUsage}%
          </div>
          
          <div className="bg-gray-700 rounded-full h-2 mb-3">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                performance.memoryUsage > 75 ? 'bg-red-400' :
                performance.memoryUsage > 50 ? 'bg-yellow-400' : 'bg-green-400'
              }`}
              style={{ width: `${performance.memoryUsage}%` }}
            />
          </div>
          
          <button
            onClick={handleMemoryCheck}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            Check detailed memory usage
          </button>
        </div>

        {/* Network Status */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Network Status</h3>
            {networkStatus.online ? (
              <Wifi className="h-5 w-5 text-green-400" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-400" />
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Status</span>
              <span className={networkStatus.online ? 'text-green-400' : 'text-red-400'}>
                {networkStatus.online ? 'Online' : 'Offline'}
              </span>
            </div>
            
            {networkStatus.effectiveType && (
              <div className="flex justify-between">
                <span className="text-gray-400">Connection</span>
                <span className="text-white">{networkStatus.effectiveType.toUpperCase()}</span>
              </div>
            )}
            
            {networkStatus.downlink && (
              <div className="flex justify-between">
                <span className="text-gray-400">Downlink</span>
                <span className="text-white">{networkStatus.downlink} Mbps</span>
              </div>
            )}
            
            {networkStatus.rtt && (
              <div className="flex justify-between">
                <span className="text-gray-400">RTT</span>
                <span className="text-white">{networkStatus.rtt}ms</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Performance Budget */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Performance Budget</h3>
          {budgetCheck.passed ? (
            <CheckCircle className="h-5 w-5 text-green-400" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-amber-400" />
          )}
        </div>
        
        <div className="flex items-center gap-2 mb-3">
          <span className={`font-medium ${budgetCheck.passed ? 'text-green-400' : 'text-amber-400'}`}>
            {budgetCheck.passed ? 'All checks passed' : 'Budget violations detected'}
          </span>
        </div>
        
        {budgetCheck.violations.length > 0 && (
          <div className="space-y-1">
            {budgetCheck.violations.map((violation, index) => (
              <div key={index} className="text-sm text-amber-300 flex items-center gap-2">
                <AlertTriangle className="h-3 w-3" />
                {violation}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Load Times */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Load Times</h3>
          <Clock className="h-5 w-5 text-gray-400" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {Math.round(performance.loadTime)}ms
            </div>
            <div className="text-sm text-gray-400">Total Load Time</div>
          </div>
          
          <div>
            <div className="text-2xl font-bold text-green-400 mb-1">
              {performance.vitals.TTFB ? `${Math.round(performance.vitals.TTFB)}ms` : 'N/A'}
            </div>
            <div className="text-sm text-gray-400">Time to First Byte</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleClearPerformanceData}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
          Clear Performance Data
        </button>
        
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Page
        </button>
      </div>
    </div>
  );
}; 