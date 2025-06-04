import React, { useState, useEffect } from 'react';
import { useAlerts } from '../../hooks/useAlerts';
import { BellRing, AlertTriangle, Loader, Copy, CheckCircle } from 'lucide-react';

interface MetricAlertGeneratorProps {
  onAlertGenerated?: (alert: string) => void;
  defaultValues?: {
    metricName?: string;
    currentValue?: number;
    threshold?: number;
    comparison?: 'above' | 'below';
  };
}

const MetricAlertGenerator: React.FC<MetricAlertGeneratorProps> = ({
  onAlertGenerated,
  defaultValues
}) => {
  const [metricName, setMetricName] = useState(defaultValues?.metricName || '');
  const [currentValue, setCurrentValue] = useState(defaultValues?.currentValue?.toString() || '');
  const [threshold, setThreshold] = useState(defaultValues?.threshold?.toString() || '');
  const [comparison, setComparison] = useState<'above' | 'below'>(defaultValues?.comparison || 'above');
  const [isGenerating, setIsGenerating] = useState(false);
  const [alert, setAlert] = useState('');
  const [copied, setCopied] = useState(false);
  
  const { createAlert } = useAlerts();

  // Reset copied state after 3 seconds
  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [copied]);

  const commonMetrics = [
    { value: 'Ticket Sales', category: 'Sales' },
    { value: 'Revenue', category: 'Financial' },
    { value: 'Attendance Rate', category: 'Events' },
    { value: 'Bar Stock', category: 'Inventory' },
    { value: 'Capacity Utilization', category: 'Venue' },
    { value: 'Marketing Engagement', category: 'Marketing' },
    { value: 'Artist Bookings', category: 'Events' },
    { value: 'Customer Satisfaction', category: 'Feedback' },
    { value: 'Website Traffic', category: 'Marketing' }
  ];

  const handleGenerateAlert = async () => {
    if (!metricName || !currentValue || !threshold) {
      alert('Please fill in all required fields');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await createAlert({
        metric_name: metricName,
        current_value: Number(currentValue),
        threshold: Number(threshold),
        comparison
      });

      setAlert(result);
      if (onAlertGenerated) {
        onAlertGenerated(result);
      }
    } catch (error) {
      console.error('Error generating alert:', error);
      alert('Failed to generate alert. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyAlert = () => {
    if (!alert) return;
    
    navigator.clipboard.writeText(alert);
    setCopied(true);
  };

  return (
    <div className="rounded-lg bg-zinc-900 p-4 sm:p-6 shadow-md">
      <div className="mb-4 flex items-center">
        <div className="rounded-full bg-gradient-to-r from-amber-500 to-red-500 p-2">
          <BellRing size={18} className="text-white" />
        </div>
        <h2 className="ml-3 text-lg font-semibold text-white">Metric Alert Generator</h2>
      </div>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="metricName" className="block text-sm font-medium text-gray-300">
            Metric Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="metricName"
            value={metricName}
            onChange={(e) => setMetricName(e.target.value)}
            list="metricSuggestions"
            className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
            placeholder="e.g. Ticket Sales"
            required
          />
          <datalist id="metricSuggestions">
            {commonMetrics.map((metric) => (
              <option key={metric.value} value={metric.value} />
            ))}
          </datalist>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="currentValue" className="block text-sm font-medium text-gray-300">
              Current Value <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="currentValue"
              value={currentValue}
              onChange={(e) => setCurrentValue(e.target.value)}
              className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
              placeholder="e.g. 85"
              required
            />
          </div>
          
          <div>
            <label htmlFor="threshold" className="block text-sm font-medium text-gray-300">
              Threshold <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="threshold"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
              placeholder="e.g. 80"
              required
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300">
            Comparison
          </label>
          <div className="mt-1 grid grid-cols-2 gap-4">
            <button
              type="button"
              className={`flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium ${
                comparison === 'above'
                  ? 'bg-amber-600 text-white'
                  : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
              }`}
              onClick={() => setComparison('above')}
            >
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              Above Threshold
            </button>
            
            <button
              type="button"
              className={`flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium ${
                comparison === 'below'
                  ? 'bg-amber-600 text-white'
                  : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
              }`}
              onClick={() => setComparison('below')}
            >
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              Below Threshold
            </button>
          </div>
        </div>
        
        <div className="pt-2">
          <button
            type="button"
            onClick={handleGenerateAlert}
            disabled={isGenerating || !metricName || !currentValue || !threshold}
            className="w-full justify-center inline-flex items-center rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-700 focus:outline-none disabled:opacity-70"
          >
            {isGenerating ? (
              <>
                <Loader size={16} className="mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <AlertTriangle size={16} className="mr-2" />
                Generate Alert
              </>
            )}
          </button>
        </div>
        
        {alert && (
          <div className={`mt-4 rounded-lg border ${
            comparison === 'above' 
              ? 'border-amber-700 bg-amber-900/20' 
              : 'border-blue-700 bg-blue-900/20'
          } p-4 relative`}>
            <div className="flex items-start">
              <AlertTriangle size={16} className={`mr-2 mt-0.5 flex-shrink-0 ${
                comparison === 'above' ? 'text-amber-500' : 'text-blue-500'
              }`} />
              <div className="flex-1">
                <p className="text-white whitespace-pre-line">{alert}</p>
              </div>
            </div>
            
            <button 
              onClick={handleCopyAlert}
              className="absolute top-2 right-2 p-1 text-gray-400 hover:text-white rounded-full hover:bg-zinc-700"
              title="Copy to clipboard"
            >
              {copied ? <CheckCircle size={14} className="text-green-500" /> : <Copy size={14} />}
            </button>
          </div>
        )}

        <div className="bg-zinc-800 rounded-lg p-3">
          <h3 className="text-xs font-medium text-white mb-2">Usage Tips:</h3>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>• Use these alerts in your dashboard to notify staff of important changes</li>
            <li>• Integrate with Slack/Discord for real-time notifications</li>
            <li>• Set up automatic alerts for key business metrics</li>
            <li>• Common thresholds: 80% capacity, 50% ticket sales, 30% inventory</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MetricAlertGenerator;