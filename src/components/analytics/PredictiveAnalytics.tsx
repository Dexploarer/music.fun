import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  Users, 
  BarChart,
  RefreshCw,
  ChevronDown,
  Calculator,
  PieChart,
  Brain,
  Calendar as CalendarIcon,
  AlertTriangle
} from 'lucide-react';
import { usePredictiveAnalytics } from '../../hooks/usePredictiveAnalytics';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { format, addMonths, subMonths } from 'date-fns';
import { toast } from 'react-hot-toast';

interface PredictionProps {
  title: string;
  eventId?: string;
  eventDate?: string;
  eventName?: string;
}

const PredictiveAnalytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'attendance' | 'pricing' | 'revenue'>('attendance');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  
  const { 
    attendancePredictions, 
    pricePredictions, 
    revenuePredictions,
    generateAttendancePrediction,
    generatePricePrediction,
    generateRevenuePrediction
  } = usePredictiveAnalytics();

  // Handle generating a prediction
  const handleGeneratePrediction = async (type: 'attendance' | 'pricing' | 'revenue') => {
    setIsGenerating(true);
    try {
      let result;
      switch (type) {
        case 'attendance':
          result = await generateAttendancePrediction({
            eventId: 'new-event',
            eventDate: format(addMonths(new Date(), 1), 'yyyy-MM-dd'),
            genreId: 'blues',
            dayOfWeek: 'saturday',
            isHoliday: false,
            previousEvents: 3,
            weatherForecast: 'clear'
          });
          break;
        case 'pricing':
          result = await generatePricePrediction({
            eventId: 'new-event',
            eventDate: format(addMonths(new Date(), 1), 'yyyy-MM-dd'),
            genreId: 'blues',
            targetAttendance: 200,
            venueCapacity: 250,
            costPerHead: 15,
            competitionLevel: 'medium'
          });
          break;
        case 'revenue':
          result = await generateRevenuePrediction({
            eventId: 'new-event',
            eventDate: format(addMonths(new Date(), 1), 'yyyy-MM-dd'),
            genreId: 'blues',
            ticketPrice: 25,
            predictedAttendance: 200,
            averageDrinksPerPerson: 2.5,
            averageDrinkPrice: 8,
            merchandiseSalesRate: 0.15
          });
          break;
      }
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} prediction generated successfully!`);
    } catch (error) {
      console.error(`Error generating ${type} prediction:`, error);
      toast.error(`Failed to generate ${type} prediction`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate sample data for charts
  const generateSampleData = () => {
    setIsLoadingData(true);
    setTimeout(() => {
      setIsLoadingData(false);
    }, 1000);
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
        <h2 className="text-xl sm:text-2xl font-semibold text-white">Predictive Analytics</h2>
        
        <div className="flex gap-2">
          <button 
            onClick={generateSampleData}
            disabled={isLoadingData}
            className="inline-flex items-center rounded-lg bg-zinc-800 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 focus:outline-none disabled:opacity-70"
          >
            <RefreshCw size={16} className={`mr-2 ${isLoadingData ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => setActiveTab('attendance')}
          className={`rounded-lg p-4 text-left ${
            activeTab === 'attendance' ? 'bg-amber-900/30 border border-amber-700' : 'bg-zinc-900 border border-zinc-800'
          }`}
        >
          <div className="flex items-center">
            <div className={`rounded-full p-2 ${
              activeTab === 'attendance' ? 'bg-amber-900/50 text-amber-400' : 'bg-zinc-800 text-gray-400'
            }`}>
              <Users size={16} />
            </div>
            <div className="ml-3">
              <h3 className="text-base font-medium text-white">Attendance Prediction</h3>
              <p className="text-xs text-gray-400">Forecast expected attendance</p>
            </div>
          </div>
        </button>
        
        <button
          onClick={() => setActiveTab('pricing')}
          className={`rounded-lg p-4 text-left ${
            activeTab === 'pricing' ? 'bg-amber-900/30 border border-amber-700' : 'bg-zinc-900 border border-zinc-800'
          }`}
        >
          <div className="flex items-center">
            <div className={`rounded-full p-2 ${
              activeTab === 'pricing' ? 'bg-amber-900/50 text-amber-400' : 'bg-zinc-800 text-gray-400'
            }`}>
              <DollarSign size={16} />
            </div>
            <div className="ml-3">
              <h3 className="text-base font-medium text-white">Optimal Pricing</h3>
              <p className="text-xs text-gray-400">Find the optimal ticket price</p>
            </div>
          </div>
        </button>
        
        <button
          onClick={() => setActiveTab('revenue')}
          className={`rounded-lg p-4 text-left ${
            activeTab === 'revenue' ? 'bg-amber-900/30 border border-amber-700' : 'bg-zinc-900 border border-zinc-800'
          }`}
        >
          <div className="flex items-center">
            <div className={`rounded-full p-2 ${
              activeTab === 'revenue' ? 'bg-amber-900/50 text-amber-400' : 'bg-zinc-800 text-gray-400'
            }`}>
              <BarChart size={16} />
            </div>
            <div className="ml-3">
              <h3 className="text-base font-medium text-white">Revenue Forecasting</h3>
              <p className="text-xs text-gray-400">Project total event revenue</p>
            </div>
          </div>
        </button>
      </div>
      
      {activeTab === 'attendance' && (
        <AttendancePrediction
          predictions={attendancePredictions}
          onGenerate={() => handleGeneratePrediction('attendance')}
          isGenerating={isGenerating}
        />
      )}
      
      {activeTab === 'pricing' && (
        <PricingPrediction
          predictions={pricePredictions}
          onGenerate={() => handleGeneratePrediction('pricing')}
          isGenerating={isGenerating}
        />
      )}
      
      {activeTab === 'revenue' && (
        <RevenuePrediction
          predictions={revenuePredictions}
          onGenerate={() => handleGeneratePrediction('revenue')}
          isGenerating={isGenerating}
        />
      )}
      
      <div className="rounded-lg p-4 bg-blue-900/20 border border-blue-800">
        <div className="flex items-start">
          <Brain size={18} className="text-blue-400 mr-2 mt-1 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-blue-300">About AI Predictions</h3>
            <p className="mt-1 text-sm text-gray-300">
              These predictive models are trained on your historical event data and analyze patterns across various factors including:
              day of week, time of year, genre, pricing, weather, competing events, and previous performance metrics.
              The more events you run, the more accurate these predictions become.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

interface AttendancePredictionProps {
  predictions: any[];
  onGenerate: () => void;
  isGenerating: boolean;
}

const AttendancePrediction: React.FC<AttendancePredictionProps> = ({ 
  predictions, 
  onGenerate, 
  isGenerating 
}) => {
  const generateSampleData = () => {
    const today = new Date();
    const data = [];
    
    for (let i = 0; i < 12; i++) {
      const date = subMonths(today, i);
      const month = format(date, 'MMM');
      data.push({
        month,
        actual: Math.floor(Math.random() * 100 + 150),
        predicted: Math.floor(Math.random() * 100 + 145)
      });
    }
    
    return data.reverse();
  };
  
  const sampleData = generateSampleData();
  
  const latestPrediction = predictions.length > 0 ? predictions[predictions.length - 1] : null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 rounded-lg bg-zinc-900 p-4">
          <h3 className="text-lg font-medium text-white mb-4">Attendance Forecast vs. Actual</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={sampleData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#27272a', borderColor: '#3f3f46', color: '#ffffff' }} />
                <Legend />
                <Line type="monotone" dataKey="actual" stroke="#f59e0b" strokeWidth={2} activeDot={{ r: 8 }} name="Actual" />
                <Line type="monotone" dataKey="predicted" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 8 }} name="Predicted" dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-xs text-center text-gray-400">
            Comparison of predicted vs. actual attendance over time
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="rounded-lg bg-zinc-900 p-4">
            <h3 className="text-lg font-medium text-white mb-2">New Prediction</h3>
            <p className="text-sm text-gray-400 mb-4">Generate a prediction for an upcoming event</p>
            
            <div className="rounded-lg bg-zinc-800 p-4 mb-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400">
                    Genre
                  </label>
                  <select className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500">
                    <option>Blues</option>
                    <option>Jazz</option>
                    <option>Folk</option>
                    <option>Rock</option>
                    <option>Country</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400">
                    Day of Week
                  </label>
                  <select className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500">
                    <option>Friday</option>
                    <option>Saturday</option>
                    <option>Thursday</option>
                    <option>Wednesday</option>
                    <option>Sunday</option>
                  </select>
                </div>
              </div>
              
              <button
                onClick={onGenerate}
                disabled={isGenerating}
                className="w-full inline-flex items-center justify-center rounded-md bg-amber-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-amber-700 focus:outline-none disabled:opacity-70"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw size={16} className="mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Brain size={16} className="mr-2" />
                    Generate Prediction
                  </>
                )}
              </button>
            </div>
            
            {latestPrediction ? (
              <div className="rounded-lg bg-zinc-800 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-gray-300">Predicted Attendance</span>
                  <span className="rounded-full bg-amber-900/30 px-2 py-0.5 text-xs font-medium text-amber-400">
                    85% Confidence
                  </span>
                </div>
                <div className="text-3xl font-semibold text-white">
                  {latestPrediction.predictedValue} <span className="text-sm text-gray-400">attendees</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400">Min Estimate:</span>
                    <span className="ml-1 text-white">{latestPrediction.predictedValue - 20}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Max Estimate:</span>
                    <span className="ml-1 text-white">{latestPrediction.predictedValue + 20}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Venue Capacity:</span>
                    <span className="ml-1 text-white">250</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Fill Rate:</span>
                    <span className="ml-1 text-green-500">
                      {Math.round((latestPrediction.predictedValue / 250) * 100)}%
                    </span>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  <CalendarIcon size={12} className="inline mr-1" />
                  Generated on {format(new Date(), 'MMM d, yyyy')}
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-400">No predictions generated yet</p>
              </div>
            )}
          </div>
          
          <div className="rounded-lg bg-zinc-900 p-4">
            <h3 className="text-base font-medium text-white mb-2">Staffing Recommendation</h3>
            <div className="rounded-lg bg-zinc-800 p-3 space-y-2">
              <p className="text-xs text-gray-300">Based on predicted attendance of 165-205 people:</p>
              <ul className="text-xs text-white space-y-1">
                <li>• 2 Bartenders</li>
                <li>• 1 Bar Back</li>
                <li>• 2 Security Staff</li>
                <li>• 1 Sound Engineer</li>
                <li>• 1 Manager</li>
              </ul>
              <p className="text-xs text-gray-400 pt-2">Estimated labor cost: $975</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface PricingPredictionProps {
  predictions: any[];
  onGenerate: () => void;
  isGenerating: boolean;
}

const PricingPrediction: React.FC<PricingPredictionProps> = ({
  predictions,
  onGenerate,
  isGenerating
}) => {
  const generatePricingData = () => {
    const data = [];
    const baseAttendance = 200;
    
    for (let price = 10; price <= 60; price += 5) {
      // Price elasticity model - attendance drops as price increases
      let attendance = Math.round(baseAttendance * Math.exp(-0.02 * (price - 25)));
      
      // Add some noise
      attendance = Math.max(50, attendance + Math.round((Math.random() - 0.5) * 20));
      
      // Calculate revenue
      const revenue = price * attendance;
      
      data.push({
        price: price,
        attendance: attendance,
        revenue: revenue
      });
    }
    
    return data;
  };
  
  const pricingData = generatePricingData();
  const optimalPrice = pricingData.reduce((max, p) => p.revenue > max.revenue ? p : max, { price: 0, revenue: 0 });
  
  const latestPrediction = predictions.length > 0 ? predictions[predictions.length - 1] : null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 rounded-lg bg-zinc-900 p-4">
          <h3 className="text-lg font-medium text-white mb-4">Price Optimization Curve</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={pricingData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                <XAxis 
                  dataKey="price" 
                  stroke="#9ca3af"
                  label={{ value: 'Ticket Price ($)', position: 'insideBottom', offset: -5, fill: '#9ca3af' }}
                />
                <YAxis 
                  yAxisId="left" 
                  stroke="#9ca3af"
                  label={{ value: 'Revenue ($)', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  stroke="#9ca3af"
                  label={{ value: 'Attendance', angle: 90, position: 'insideRight', fill: '#9ca3af' }}
                />
                <Tooltip contentStyle={{ backgroundColor: '#27272a', borderColor: '#3f3f46', color: '#ffffff' }} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#f59e0b" 
                  yAxisId="left"
                  strokeWidth={2} 
                  activeDot={{ r: 8 }} 
                  name="Revenue" 
                />
                <Line 
                  type="monotone" 
                  dataKey="attendance" 
                  stroke="#3b82f6" 
                  yAxisId="right"
                  strokeWidth={2}
                  activeDot={{ r: 8 }} 
                  name="Attendance" 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="rounded-lg bg-zinc-900 p-4">
            <h3 className="text-lg font-medium text-white mb-4">Optimal Pricing</h3>
            <div className="rounded-lg bg-amber-900/30 border border-amber-700 p-4 text-center">
              <p className="text-lg font-medium text-white">
                ${optimalPrice.price}
              </p>
              <p className="text-xs text-gray-300 mt-1">
                Optimal ticket price for maximum revenue
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-left text-xs">
                <div>
                  <span className="text-gray-400">Projected Attendance:</span>
                  <span className="block text-white">{optimalPrice.attendance} attendees</span>
                </div>
                <div>
                  <span className="text-gray-400">Projected Revenue:</span>
                  <span className="block text-amber-400">${optimalPrice.revenue.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-400">Venue Capacity:</span>
                  <span className="block text-white">250 (78% fill rate)</span>
                </div>
                <div>
                  <span className="text-gray-400">Model Confidence:</span>
                  <span className="block text-white">85%</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 rounded-lg bg-zinc-800 p-4">
              <h4 className="text-sm font-medium text-white mb-2">Price Point Analysis</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">Budget Price: $20</span>
                    <span className="text-xs text-gray-400">Revenue: $4,600</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-zinc-700">
                    <div className="h-1.5 rounded-full bg-blue-500" style={{ width: '65%' }}></div>
                  </div>
                  <p className="mt-1 text-xs text-blue-400">High attendance (230) but lower per-ticket revenue</p>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-amber-400">Optimal Price: ${optimalPrice.price}</span>
                    <span className="text-xs text-amber-400">Revenue: ${optimalPrice.revenue.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-zinc-700">
                    <div className="h-1.5 rounded-full bg-amber-500" style={{ width: '100%' }}></div>
                  </div>
                  <p className="mt-1 text-xs text-amber-400">Best balance of attendance and revenue</p>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">Premium Price: $45</span>
                    <span className="text-xs text-gray-400">Revenue: $4,950</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-zinc-700">
                    <div className="h-1.5 rounded-full bg-purple-500" style={{ width: '70%' }}></div>
                  </div>
                  <p className="mt-1 text-xs text-purple-400">Lower attendance (110) but higher margins</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg bg-zinc-900 p-4">
            <h3 className="text-base font-medium text-white mb-2">Generate New Prediction</h3>
            <button
              onClick={onGenerate}
              disabled={isGenerating}
              className="w-full inline-flex items-center justify-center rounded-md bg-amber-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-amber-700 focus:outline-none disabled:opacity-70 mt-2"
            >
              {isGenerating ? (
                <>
                  <RefreshCw size={16} className="mr-2 animate-spin" />
                  Analyzing Data...
                </>
              ) : (
                <>
                  <Calculator size={16} className="mr-2" />
                  Calculate Optimal Price
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface RevenuePredictionProps {
  predictions: any[];
  onGenerate: () => void;
  isGenerating: boolean;
}

const RevenuePrediction: React.FC<RevenuePredictionProps> = ({
  predictions,
  onGenerate,
  isGenerating
}) => {
  const generateRevenueData = () => {
    const categories = ['Tickets', 'Bar Sales', 'Food', 'Merchandise'];
    const data = [];
    
    for (let i = 0; i < 6; i++) {
      const month = format(subMonths(new Date(), 5 - i), 'MMM');
      const obj: any = { month };
      
      categories.forEach(cat => {
        // Base values for each category with some randomness
        let value = 0;
        switch (cat) {
          case 'Tickets':
            value = 5000 + Math.random() * 1000 - 500;
            break;
          case 'Bar Sales':
            value = 3000 + Math.random() * 800 - 400;
            break;
          case 'Food':
            value = 1500 + Math.random() * 500 - 250;
            break;
          case 'Merchandise':
            value = 500 + Math.random() * 300 - 150;
            break;
        }
        
        // Add seasonal trend
        if (['Jun', 'Jul', 'Aug'].includes(month)) {
          value *= 1.2; // Summer boost
        } else if (['Dec', 'Jan'].includes(month)) {
          value *= 1.1; // Holiday season boost
        } else if (['Feb', 'Mar'].includes(month)) {
          value *= 0.9; // Winter slump
        }
        
        obj[cat] = Math.round(value);
      });
      
      obj.total = categories.reduce((sum, cat) => sum + obj[cat], 0);
      data.push(obj);
    }
    
    return data;
  };
  
  const revenueData = generateRevenueData();
  const latestMonth = revenueData[revenueData.length - 1];
  
  // Calculate next month prediction
  const nextMonthPrediction = {
    tickets: Math.round(latestMonth.Tickets * 1.05),
    bar: Math.round(latestMonth['Bar Sales'] * 1.08),
    food: Math.round(latestMonth.Food * 1.02),
    merchandise: Math.round(latestMonth.Merchandise * 1.10),
  };
  
  const totalPrediction = 
    nextMonthPrediction.tickets + 
    nextMonthPrediction.bar + 
    nextMonthPrediction.food + 
    nextMonthPrediction.merchandise;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 rounded-lg bg-zinc-900 p-4">
          <h3 className="text-lg font-medium text-white mb-4">Revenue Breakdown & Trends</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={revenueData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  formatter={(value) => [`$${value}`, '']}
                  contentStyle={{ backgroundColor: '#27272a', borderColor: '#3f3f46', color: '#ffffff' }}
                />
                <Legend />
                <Line type="monotone" dataKey="Tickets" stroke="#f59e0b" strokeWidth={2} />
                <Line type="monotone" dataKey="Bar Sales" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="Food" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="Merchandise" stroke="#8b5cf6" strokeWidth={2} />
                <Line type="monotone" dataKey="total" stroke="#ef4444" strokeWidth={2} name="Total Revenue" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="rounded-lg bg-zinc-900 p-4">
            <h3 className="text-lg font-medium text-white mb-2">Revenue Forecast</h3>
            <p className="text-sm text-gray-400 mb-4">Next month prediction</p>
            
            <div className="rounded-lg bg-green-900/30 border border-green-700 p-4">
              <div className="text-2xl font-semibold text-white">
                ${totalPrediction.toLocaleString()}
              </div>
              <div className="flex items-center text-xs text-green-400 mt-1">
                <TrendingUp size={12} className="mr-1" />
                <span>+5.8% vs. current month</span>
              </div>
            </div>
            
            <div className="mt-4 space-y-3">
              <div className="rounded-lg bg-zinc-800 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white">Ticket Sales</span>
                  <span className="text-sm font-medium text-white">
                    ${nextMonthPrediction.tickets.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center text-xs text-green-400 mt-1">
                  <TrendingUp size={10} className="mr-1" />
                  <span>+5% growth</span>
                </div>
              </div>
              
              <div className="rounded-lg bg-zinc-800 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white">Bar Sales</span>
                  <span className="text-sm font-medium text-white">
                    ${nextMonthPrediction.bar.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center text-xs text-green-400 mt-1">
                  <TrendingUp size={10} className="mr-1" />
                  <span>+8% growth</span>
                </div>
              </div>
              
              <div className="rounded-lg bg-zinc-800 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white">Food</span>
                  <span className="text-sm font-medium text-white">
                    ${nextMonthPrediction.food.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center text-xs text-green-400 mt-1">
                  <TrendingUp size={10} className="mr-1" />
                  <span>+2% growth</span>
                </div>
              </div>
              
              <div className="rounded-lg bg-zinc-800 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white">Merchandise</span>
                  <span className="text-sm font-medium text-white">
                    ${nextMonthPrediction.merchandise.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center text-xs text-green-400 mt-1">
                  <TrendingUp size={10} className="mr-1" />
                  <span>+10% growth</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <button
                onClick={onGenerate}
                disabled={isGenerating}
                className="w-full inline-flex items-center justify-center rounded-md bg-amber-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-amber-700 focus:outline-none disabled:opacity-70"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw size={16} className="mr-2 animate-spin" />
                    Forecasting...
                  </>
                ) : (
                  <>
                    <PieChart size={16} className="mr-2" />
                    Generate New Forecast
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recommendations */}
      <div className="rounded-lg bg-zinc-900 p-4 sm:p-6">
        <h3 className="text-lg font-medium text-white mb-4">AI-Powered Recommendations</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg bg-zinc-800 p-4">
            <div className="flex items-start">
              <div className="rounded-full bg-green-900/30 p-2">
                <TrendingUp size={16} className="text-green-500" />
              </div>
              <div className="ml-3">
                <h4 className="text-base font-medium text-white">Revenue Opportunities</h4>
                <ul className="mt-2 text-sm space-y-2">
                  <li className="text-gray-300">• Increase bar sales with 2-for-1 drink specials before 8pm</li>
                  <li className="text-gray-300">• Add premium ticket options with merchandise bundles</li>
                  <li className="text-gray-300">• Implement happy hour pricing during slower weekdays</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg bg-zinc-800 p-4">
            <div className="flex items-start">
              <div className="rounded-full bg-red-900/30 p-2">
                <AlertTriangle size={16} className="text-red-500" />
              </div>
              <div className="ml-3">
                <h4 className="text-base font-medium text-white">Risk Factors</h4>
                <ul className="mt-2 text-sm space-y-2">
                  <li className="text-gray-300">• Competing music festival on June 15-16</li>
                  <li className="text-gray-300">• Holiday weekend may affect attendance on May 27</li>
                  <li className="text-gray-300">• Recent decreasing trend in folk music events</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg bg-zinc-800 p-4">
            <div className="flex items-start">
              <div className="rounded-full bg-blue-900/30 p-2">
                <Users size={16} className="text-blue-500" />
              </div>
              <div className="ml-3">
                <h4 className="text-base font-medium text-white">Attendance Insights</h4>
                <ul className="mt-2 text-sm space-y-2">
                  <li className="text-gray-300">• Jazz events performing 18% above expectations</li>
                  <li className="text-gray-300">• Wednesday events underperforming by 12%</li>
                  <li className="text-gray-300">• Events with local artists showing strong growth</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg bg-zinc-800 p-4">
            <div className="flex items-start">
              <div className="rounded-full bg-amber-900/30 p-2">
                <DollarSign size={16} className="text-amber-500" />
              </div>
              <div className="ml-3">
                <h4 className="text-base font-medium text-white">Pricing Optimization</h4>
                <ul className="mt-2 text-sm space-y-2">
                  <li className="text-gray-300">• Blues events can support a 10% price increase</li>
                  <li className="text-gray-300">• Consider reducing prices for Sunday events</li>
                  <li className="text-gray-300">• VIP tier has 15% untapped revenue potential</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictiveAnalytics;