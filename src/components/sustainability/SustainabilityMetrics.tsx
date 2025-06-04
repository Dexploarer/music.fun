import React, { useState } from 'react';
import { Leaf, Droplet, Trash2, Zap, PlusCircle, ChevronRight, Calendar, BarChart, Save, Download } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, BarChart as RechartsBar, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

// Sample data for sustainability metrics
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Generate random data for a metric
const generateMetricData = (min: number, max: number, decreaseTrend = false) => {
  return MONTHS.map((month, index) => {
    // Make the trend go down slightly if decreaseTrend is true
    const trendFactor = decreaseTrend 
      ? 1 - (index * 0.02) 
      : 1 + (index * 0.01);
      
    const value = Math.floor(Math.random() * (max - min + 1) + min) * trendFactor;
    return { month, value: Math.round(value * 10) / 10 };
  });
};

// Sample data for charts
const carbonData = generateMetricData(80, 120, true);
const waterData = generateMetricData(200, 300, true);
const wasteData = generateMetricData(40, 60, true);
const energyData = generateMetricData(150, 250, true);

interface InputMetricProps {
  icon: React.ReactNode;
  title: string;
  unit: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const InputMetric: React.FC<InputMetricProps> = ({ icon, title, unit, value, onChange, placeholder }) => {
  return (
    <div className="rounded-lg bg-zinc-800 p-4">
      <div className="flex items-center mb-2">
        <div className="mr-2 text-green-400">{icon}</div>
        <h3 className="text-sm font-medium text-white">{title}</h3>
      </div>
      <div className="flex items-center">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="block w-full rounded-l-md border border-zinc-700 bg-zinc-700 px-3 py-2 text-white placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-green-500 text-sm"
          placeholder={placeholder}
          min="0"
          step="0.01"
        />
        <span className="flex items-center justify-center rounded-r-md border border-l-0 border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-gray-300 h-[38px]">
          {unit}
        </span>
      </div>
    </div>
  );
};

const SustainabilityMetrics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'input' | 'charts' | 'reports'>('charts');
  const [eventFilter, setEventFilter] = useState<string>('all');
  const [timeframe, setTimeframe] = useState<'month' | 'quarter' | 'year'>('month');
  
  // Metrics input states
  const [electricityUsage, setElectricityUsage] = useState('');
  const [waterUsage, setWaterUsage] = useState('');
  const [wasteGenerated, setWasteGenerated] = useState('');
  const [wasteRecycled, setWasteRecycled] = useState('');
  const [carbonFootprint, setCarbonFootprint] = useState('');
  
  // Calculated metrics (these would come from proper calculations in a real app)
  const calculatedMetrics = {
    carbonFootprint: 2.45, // tonnes CO2e
    electricitySavings: 12.3, // % compared to previous period
    waterSavings: 8.7, // % compared to previous period
    wasteRecyclingRate: 64.2, // % of waste recycled
    carbonReduction: 5.6, // % reduction compared to previous period
    sustainabilityScore: 84 // out of 100
  };
  
  const handleSaveMetrics = () => {
    // In a real app, this would save the metrics to the database
    alert('Metrics saved successfully!');
    setActiveTab('charts');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
        <h2 className="text-xl sm:text-2xl font-semibold text-white">
          <Leaf className="inline-block mr-2 text-green-500" />
          Sustainability Metrics
        </h2>
        
        <div className="flex space-x-2">
          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            className="block rounded-lg border-0 bg-zinc-800 py-1.5 px-3 text-white focus:ring-2 focus:ring-green-500 text-sm"
          >
            <option value="all">All Events</option>
            <option value="blues-night">Blues Night</option>
            <option value="jazz-festival">Jazz Festival</option>
            <option value="rock-concert">Rock Concert</option>
          </select>
          
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as any)}
            className="block rounded-lg border-0 bg-zinc-800 py-1.5 px-3 text-white focus:ring-2 focus:ring-green-500 text-sm"
          >
            <option value="month">Month</option>
            <option value="quarter">Quarter</option>
            <option value="year">Year</option>
          </select>
          
          <button
            onClick={() => setActiveTab('input')}
            className="inline-flex items-center rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 focus:outline-none"
          >
            <PlusCircle size={16} className="mr-1.5" />
            Add Data
          </button>
        </div>
      </div>
      
      <div className="flex border-b border-zinc-700">
        <button
          onClick={() => setActiveTab('charts')}
          className={`pb-2 px-4 text-sm font-medium border-b-2 ${
            activeTab === 'charts'
              ? 'border-green-500 text-green-400'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-2 px-4 text-sm font-medium border-b-2 ${
            activeTab === 'reports'
              ? 'border-green-500 text-green-400'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          Reports
        </button>
        <button
          onClick={() => setActiveTab('input')}
          className={`pb-2 px-4 text-sm font-medium border-b-2 ${
            activeTab === 'input'
              ? 'border-green-500 text-green-400'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          Add Data
        </button>
      </div>
      
      {activeTab === 'charts' && (
        <div className="space-y-6">
          {/* Summary metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="rounded-lg bg-zinc-900 p-4 shadow-md">
              <div className="flex items-center mb-1">
                <Leaf size={18} className="mr-2 text-green-500" />
                <h3 className="text-sm font-medium text-white">Carbon Footprint</h3>
              </div>
              <div className="flex items-baseline">
                <p className="text-2xl font-bold text-white">{calculatedMetrics.carbonFootprint} tonnes CO2e</p>
                <div className="ml-2 flex items-center text-green-500 text-xs">
                  <svg className="h-3 w-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                  {calculatedMetrics.carbonReduction}%
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-1">vs. previous {timeframe}</p>
            </div>
            
            <div className="rounded-lg bg-zinc-900 p-4 shadow-md">
              <div className="flex items-center mb-1">
                <Droplet size={18} className="mr-2 text-blue-500" />
                <h3 className="text-sm font-medium text-white">Water Conservation</h3>
              </div>
              <div className="flex items-baseline">
                <p className="text-2xl font-bold text-white">{calculatedMetrics.waterSavings}% Saved</p>
                <div className="ml-2 flex items-center text-green-500 text-xs">
                  <svg className="h-3 w-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  improved
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-1">vs. previous {timeframe}</p>
            </div>
            
            <div className="rounded-lg bg-zinc-900 p-4 shadow-md">
              <div className="flex items-center mb-1">
                <Trash2 size={18} className="mr-2 text-purple-500" />
                <h3 className="text-sm font-medium text-white">Waste Management</h3>
              </div>
              <div className="flex items-baseline">
                <p className="text-2xl font-bold text-white">{calculatedMetrics.wasteRecyclingRate}% Recycled</p>
                <div className="ml-2 flex items-center text-green-500 text-xs">
                  <svg className="h-3 w-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  +3.2%
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-1">of total waste generated</p>
            </div>
            
            <div className="rounded-lg bg-zinc-900 p-4 shadow-md">
              <div className="flex items-center mb-1">
                <Zap size={18} className="mr-2 text-yellow-500" />
                <h3 className="text-sm font-medium text-white">Energy Efficiency</h3>
              </div>
              <div className="flex items-baseline">
                <p className="text-2xl font-bold text-white">{calculatedMetrics.electricitySavings}% Reduced</p>
                <div className="ml-2 flex items-center text-green-500 text-xs">
                  <svg className="h-3 w-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                  improved
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-1">vs. previous {timeframe}</p>
            </div>
            
            <div className="rounded-lg bg-zinc-900 p-4 shadow-md sm:col-span-2 lg:col-span-2">
              <div className="flex items-center mb-2">
                <Leaf size={18} className="mr-2 text-green-500" />
                <h3 className="text-sm font-medium text-white">Sustainability Score</h3>
              </div>
              <div className="flex items-center">
                <div className="flex-1">
                  <div className="h-4 w-full rounded-full bg-zinc-700">
                    <div 
                      className={`h-4 rounded-full ${
                        calculatedMetrics.sustainabilityScore > 80 ? 'bg-green-500' :
                        calculatedMetrics.sustainabilityScore > 60 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${calculatedMetrics.sustainabilityScore}%` }}
                    ></div>
                  </div>
                  <div className="mt-1 flex justify-between text-xs text-gray-400">
                    <span>Poor</span>
                    <span>Average</span>
                    <span>Excellent</span>
                  </div>
                </div>
                <div className="ml-6 text-center">
                  <p className="text-3xl font-bold text-white">{calculatedMetrics.sustainabilityScore}</p>
                  <p className="text-xs text-gray-400">out of 100</p>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-300">
                Your venue is performing well above industry average in sustainability metrics.
              </p>
            </div>
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg bg-zinc-900 p-4 shadow-lg">
              <h3 className="mb-4 text-lg font-medium text-white flex items-center">
                <Leaf size={18} className="mr-2 text-green-500" />
                Carbon Footprint (tonnes CO2e)
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={carbonData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                    <XAxis dataKey="month" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#27272a', borderColor: '#3f3f46', color: '#ffffff' }} />
                    <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} activeDot={{ r: 8 }} name="CO2e (tonnes)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="rounded-lg bg-zinc-900 p-4 shadow-lg">
              <h3 className="mb-4 text-lg font-medium text-white flex items-center">
                <Droplet size={18} className="mr-2 text-blue-500" />
                Water Usage (gallons)
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={waterData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                    <XAxis dataKey="month" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#27272a', borderColor: '#3f3f46', color: '#ffffff' }} />
                    <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 8 }} name="Water (gallons)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="rounded-lg bg-zinc-900 p-4 shadow-lg">
              <h3 className="mb-4 text-lg font-medium text-white flex items-center">
                <Trash2 size={18} className="mr-2 text-purple-500" />
                Waste Generation (lbs)
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBar
                    data={wasteData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                    <XAxis dataKey="month" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#27272a', borderColor: '#3f3f46', color: '#ffffff' }} />
                    <Bar dataKey="value" fill="#8b5cf6" name="Waste (lbs)" />
                  </RechartsBar>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="rounded-lg bg-zinc-900 p-4 shadow-lg">
              <h3 className="mb-4 text-lg font-medium text-white flex items-center">
                <Zap size={18} className="mr-2 text-yellow-500" />
                Energy Consumption (kWh)
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBar
                    data={energyData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                    <XAxis dataKey="month" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#27272a', borderColor: '#3f3f46', color: '#ffffff' }} />
                    <Bar dataKey="value" fill="#f59e0b" name="Energy (kWh)" />
                  </RechartsBar>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          {/* Initiatives */}
          <div className="rounded-lg bg-zinc-900 p-4 shadow-lg">
            <h3 className="mb-3 text-lg font-medium text-white">Sustainability Initiatives</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="rounded-lg bg-zinc-800 p-4 border-l-4 border-green-500">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-medium text-white">LED Lighting Upgrade</h4>
                    <p className="mt-1 text-xs text-gray-400">Replacing all venue lighting with energy-efficient LEDs</p>
                  </div>
                  <div className="bg-green-500/20 text-green-500 rounded-full px-2 py-0.5 text-xs font-medium">Active</div>
                </div>
                <div className="mt-3 flex justify-between items-center">
                  <div className="flex items-center space-x-1 text-xs text-gray-400">
                    <Calendar size={10} className="mr-0.5" />
                    <span>Completed June 2022</span>
                  </div>
                  <div className="text-xs text-green-400">-32% energy</div>
                </div>
              </div>
              
              <div className="rounded-lg bg-zinc-800 p-4 border-l-4 border-blue-500">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-medium text-white">Water-Saving Fixtures</h4>
                    <p className="mt-1 text-xs text-gray-400">Low-flow faucets and toilets throughout venue</p>
                  </div>
                  <div className="bg-blue-500/20 text-blue-500 rounded-full px-2 py-0.5 text-xs font-medium">Active</div>
                </div>
                <div className="mt-3 flex justify-between items-center">
                  <div className="flex items-center space-x-1 text-xs text-gray-400">
                    <Calendar size={10} className="mr-0.5" />
                    <span>Completed April 2023</span>
                  </div>
                  <div className="text-xs text-blue-400">-42% water</div>
                </div>
              </div>
              
              <div className="rounded-lg bg-zinc-800 p-4 border-l-4 border-purple-500">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-medium text-white">Recycling Program</h4>
                    <p className="mt-1 text-xs text-gray-400">Comprehensive recycling and composting system</p>
                  </div>
                  <div className="bg-purple-500/20 text-purple-500 rounded-full px-2 py-0.5 text-xs font-medium">Active</div>
                </div>
                <div className="mt-3 flex justify-between items-center">
                  <div className="flex items-center space-x-1 text-xs text-gray-400">
                    <Calendar size={10} className="mr-0.5" />
                    <span>Ongoing since Jan 2022</span>
                  </div>
                  <div className="text-xs text-purple-400">+64% recycling</div>
                </div>
              </div>
              
              <div className="rounded-lg bg-zinc-800 p-4 border-l-4 border-amber-500/50">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-medium text-white">Solar Panel Installation</h4>
                    <p className="mt-1 text-xs text-gray-400">Roof-mounted solar array for renewable energy</p>
                  </div>
                  <div className="bg-amber-500/20 text-amber-500 rounded-full px-2 py-0.5 text-xs font-medium">Planned</div>
                </div>
                <div className="mt-3 flex justify-between items-center">
                  <div className="flex items-center space-x-1 text-xs text-gray-400">
                    <Calendar size={10} className="mr-0.5" />
                    <span>Scheduled Q3 2025</span>
                  </div>
                  <div className="text-xs text-amber-400">Est. -50% grid power</div>
                </div>
              </div>
              
              <div className="rounded-lg bg-zinc-800 p-4 border-l-4 border-green-500/50">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-medium text-white">Local Sourcing Program</h4>
                    <p className="mt-1 text-xs text-gray-400">Partnering with local suppliers within 50 miles</p>
                  </div>
                  <div className="bg-green-500/20 text-green-500 rounded-full px-2 py-0.5 text-xs font-medium">Active</div>
                </div>
                <div className="mt-3 flex justify-between items-center">
                  <div className="flex items-center space-x-1 text-xs text-gray-400">
                    <Calendar size={10} className="mr-0.5" />
                    <span>Ongoing since Sep 2022</span>
                  </div>
                  <div className="text-xs text-green-400">-25% transport emissions</div>
                </div>
              </div>
              
              <div className="rounded-lg bg-zinc-800 p-4 border-l-4 border-gray-500">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="flex items-center text-sm font-medium text-white">
                      <span>Add New Initiative</span>
                      <PlusCircle size={14} className="ml-2 text-amber-500" />
                    </h4>
                    <p className="mt-1 text-xs text-gray-400">Document a new sustainability program or project</p>
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <button className="text-xs text-amber-500 flex items-center">
                    Get started
                    <ChevronRight size={12} className="ml-1" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'input' && (
        <div className="space-y-6">
          <div className="rounded-lg bg-zinc-900 p-4 sm:p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-medium text-white">Enter Sustainability Metrics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <InputMetric 
                icon={<Zap size={18} />}
                title="Electricity Usage"
                unit="kWh"
                value={electricityUsage}
                onChange={setElectricityUsage}
                placeholder="e.g. 1250"
              />
              
              <InputMetric 
                icon={<Droplet size={18} />}
                title="Water Usage"
                unit="gallons"
                value={waterUsage}
                onChange={setWaterUsage}
                placeholder="e.g. 3500"
              />
              
              <InputMetric 
                icon={<Trash2 size={18} />}
                title="Waste Generated"
                unit="lbs"
                value={wasteGenerated}
                onChange={setWasteGenerated}
                placeholder="e.g. 450"
              />
              
              <InputMetric 
                icon={<Trash2 size={18} />}
                title="Waste Recycled"
                unit="lbs"
                value={wasteRecycled}
                onChange={setWasteRecycled}
                placeholder="e.g. 300"
              />
              
              <InputMetric 
                icon={<Leaf size={18} />}
                title="Carbon Footprint"
                unit="kg CO2e"
                value={carbonFootprint}
                onChange={setCarbonFootprint}
                placeholder="e.g. 2500"
              />
              
              <div className="rounded-lg bg-zinc-800 p-4">
                <div className="flex items-center mb-2">
                  <Calendar size={18} className="mr-2 text-gray-400" />
                  <h3 className="text-sm font-medium text-white">Reporting Period</h3>
                </div>
                <input
                  type="month"
                  className="block w-full rounded-md border border-zinc-700 bg-zinc-700 px-3 py-2 text-white focus:border-green-500 focus:outline-none focus:ring-green-500 text-sm"
                  defaultValue={`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`}
                />
              </div>
            </div>
            
            <div className="mt-4 bg-zinc-800 rounded-lg p-4">
              <h4 className="text-sm font-medium text-white mb-2">Event Association</h4>
              <select
                className="block w-full rounded-md border border-zinc-700 bg-zinc-700 px-3 py-2 text-white focus:border-green-500 focus:outline-none focus:ring-green-500 text-sm"
              >
                <option value="">Select an event (optional)</option>
                <option>Blues Night - May 15, 2025</option>
                <option>Jazz Festival - June 10, 2025</option>
                <option>Country Roads Tour - July 3, 2025</option>
                <option>Folk Music Showcase - July 22, 2025</option>
              </select>
              <p className="mt-2 text-xs text-gray-400">
                Associate these metrics with a specific event, or leave blank for general venue operations.
              </p>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveTab('charts')}
                className="inline-flex items-center rounded-lg bg-zinc-700 px-3 py-2 mr-2 text-sm font-medium text-white hover:bg-zinc-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveMetrics}
                className="inline-flex items-center rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none"
              >
                <Save size={16} className="mr-2" />
                Save Metrics
              </button>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="rounded-lg bg-zinc-900 p-4 sm:p-6 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-white">
                Sustainability Reports
              </h3>
              <button
                className="inline-flex items-center rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 focus:outline-none"
              >
                <Download size={16} className="mr-1.5" />
                Export Report
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="rounded-lg bg-zinc-800 p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-base font-medium text-white">Monthly Sustainability Report</h4>
                    <p className="mt-1 text-sm text-gray-400">Comprehensive breakdown of all sustainability metrics for the current month.</p>
                    <div className="mt-2 flex items-center text-xs text-gray-400">
                      <Calendar size={12} className="mr-1" />
                      <span>Generated: {new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="inline-flex items-center rounded-lg bg-zinc-700 px-2 py-1 text-xs font-medium text-white hover:bg-zinc-600 focus:outline-none"
                    >
                      <BarChart size={12} className="mr-1" />
                      View
                    </button>
                    <button
                      className="inline-flex items-center rounded-lg bg-zinc-700 px-2 py-1 text-xs font-medium text-white hover:bg-zinc-600 focus:outline-none"
                    >
                      <Download size={12} className="mr-1" />
                      Download
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="rounded-lg bg-zinc-800 p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-base font-medium text-white">Quarterly Carbon Report</h4>
                    <p className="mt-1 text-sm text-gray-400">Detailed analysis of carbon footprint and reduction efforts for Q2 2025.</p>
                    <div className="mt-2 flex items-center text-xs text-gray-400">
                      <Calendar size={12} className="mr-1" />
                      <span>Generated: June 15, 2025</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="inline-flex items-center rounded-lg bg-zinc-700 px-2 py-1 text-xs font-medium text-white hover:bg-zinc-600 focus:outline-none"
                    >
                      <BarChart size={12} className="mr-1" />
                      View
                    </button>
                    <button
                      className="inline-flex items-center rounded-lg bg-zinc-700 px-2 py-1 text-xs font-medium text-white hover:bg-zinc-600 focus:outline-none"
                    >
                      <Download size={12} className="mr-1" />
                      Download
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="rounded-lg bg-zinc-800 p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-base font-medium text-white">Annual Sustainability Report</h4>
                    <p className="mt-1 text-sm text-gray-400">Comprehensive sustainability performance for the entire year 2024.</p>
                    <div className="mt-2 flex items-center text-xs text-gray-400">
                      <Calendar size={12} className="mr-1" />
                      <span>Generated: January 10, 2025</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="inline-flex items-center rounded-lg bg-zinc-700 px-2 py-1 text-xs font-medium text-white hover:bg-zinc-600 focus:outline-none"
                    >
                      <BarChart size={12} className="mr-1" />
                      View
                    </button>
                    <button
                      className="inline-flex items-center rounded-lg bg-zinc-700 px-2 py-1 text-xs font-medium text-white hover:bg-zinc-600 focus:outline-none"
                    >
                      <Download size={12} className="mr-1" />
                      Download
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="rounded-lg bg-zinc-800 p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-base font-medium text-white">Event-Specific Report: Jazz Festival</h4>
                    <p className="mt-1 text-sm text-gray-400">Sustainability metrics and impact analysis for the May 2025 Jazz Festival.</p>
                    <div className="mt-2 flex items-center text-xs text-gray-400">
                      <Calendar size={12} className="mr-1" />
                      <span>Generated: May 28, 2025</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="inline-flex items-center rounded-lg bg-zinc-700 px-2 py-1 text-xs font-medium text-white hover:bg-zinc-600 focus:outline-none"
                    >
                      <BarChart size={12} className="mr-1" />
                      View
                    </button>
                    <button
                      className="inline-flex items-center rounded-lg bg-zinc-700 px-2 py-1 text-xs font-medium text-white hover:bg-zinc-600 focus:outline-none"
                    >
                      <Download size={12} className="mr-1" />
                      Download
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg bg-zinc-900 p-4 sm:p-6 shadow-lg">
            <h3 className="text-lg font-medium text-white mb-4">Sustainability Certificates & Achievements</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="rounded-lg bg-green-900/20 p-4 border border-green-700">
                <h4 className="text-base font-medium text-white flex items-center">
                  <Leaf size={18} className="mr-2 text-green-500" />
                  Green Business Certification
                </h4>
                <p className="mt-1 text-sm text-gray-300">Awarded for excellence in sustainable business practices.</p>
                <div className="mt-2 text-xs text-gray-400">Achieved: March 2024 • Valid until: March 2026</div>
              </div>
              
              <div className="rounded-lg bg-blue-900/20 p-4 border border-blue-700">
                <h4 className="text-base font-medium text-white flex items-center">
                  <Droplet size={18} className="mr-2 text-blue-500" />
                  Water Conservation Award
                </h4>
                <p className="mt-1 text-sm text-gray-300">Recognized for water-saving initiatives and technologies.</p>
                <div className="mt-2 text-xs text-gray-400">Achieved: August 2024</div>
              </div>
              
              <div className="rounded-lg bg-purple-900/20 p-4 border border-purple-700">
                <h4 className="text-base font-medium text-white flex items-center">
                  <Trash2 size={18} className="mr-2 text-purple-500" />
                  Zero Waste Achievement
                </h4>
                <p className="mt-1 text-sm text-gray-300">Over 90% waste diversion from landfill for 3 consecutive months.</p>
                <div className="mt-2 text-xs text-gray-400">Achieved: May 2025</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SustainabilityMetrics;