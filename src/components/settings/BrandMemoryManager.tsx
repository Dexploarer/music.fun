import React, { useState, useEffect } from 'react';
import { useBrandMemory } from '../../hooks/useBrandMemory';
import { Building, Save, Loader, Plus, X, RefreshCw, Archive, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface BrandMemoryManagerProps {
  defaultValues?: {
    venueName?: string;
    brandTone?: string;
    pastEvents?: string[];
  };
  onMemoryUpdated?: (memory: any) => void;
}

const BrandMemoryManager: React.FC<BrandMemoryManagerProps> = ({
  defaultValues,
  onMemoryUpdated
}) => {
  const [venueName, setVenueName] = useState(defaultValues?.venueName || 'The Train Station');
  const [brandTone, setBrandTone] = useState(defaultValues?.brandTone || '');
  const [pastEvents, setPastEvents] = useState<string[]>(defaultValues?.pastEvents || []);
  const [eventInput, setEventInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [memoryData, setMemoryData] = useState<{
    summary: string;
    keywords: string[];
    tone_attributes: string[];
  } | null>(null);
  
  const { createBrandMemory, getBrandMemory } = useBrandMemory();

  // Load existing brand memory on mount
  useEffect(() => {
    const loadMemory = async () => {
      try {
        const memory = await getBrandMemory(venueName);
        if (memory) {
          setMemoryData(memory);
        }
      } catch (error) {
        console.error('Error loading brand memory:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMemory();
  }, [venueName]);

  const handleAddEvent = () => {
    if (eventInput.trim() && !pastEvents.includes(eventInput.trim())) {
      setPastEvents([...pastEvents, eventInput.trim()]);
      setEventInput('');
    }
  };

  const handleRemoveEvent = (index: number) => {
    setPastEvents(pastEvents.filter((_, i) => i !== index));
  };

  const handleUpdateMemory = async () => {
    if (!venueName || !brandTone || pastEvents.length === 0) {
      toast.error('Please fill in all required fields and add at least one past event');
      return;
    }

    setIsProcessing(true);
    try {
      const memory = await createBrandMemory({
        venue_name: venueName,
        brand_tone: brandTone,
        past_events: pastEvents
      });
      
      setMemoryData(memory);
      
      if (onMemoryUpdated) {
        onMemoryUpdated(memory);
      }
      
      toast.success('Brand memory updated successfully');
    } catch (error) {
      console.error('Error updating brand memory:', error);
      toast.error('Failed to update brand memory');
    } finally {
      setIsProcessing(false);
    }
  };

  // Brand tone suggestions
  const toneOptions = [
    'Warm and rustic with a touch of Southern hospitality',
    'Edgy and contemporary with vibrant energy',
    'Sophisticated and refined with acoustic excellence',
    'Casual and approachable, focused on community',
    'Nostalgic and authentic, celebrating musical heritage',
    'Vibrant and energetic, perfect for dancing and socializing',
    'Intimate and soulful, with exceptional musical craftsmanship'
  ];

  return (
    <div className="rounded-lg bg-zinc-900 p-4 sm:p-6 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 p-2">
            <Building size={18} className="text-white" />
          </div>
          <h2 className="ml-3 text-lg font-semibold text-white">Brand Voice Memory</h2>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Input Form */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <label htmlFor="venueName" className="block text-sm font-medium text-gray-300">
              Venue Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="venueName"
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
              placeholder="e.g. The Train Station"
              required
            />
          </div>
          
          <div>
            <label htmlFor="brandTone" className="block text-sm font-medium text-gray-300">
              Brand Tone & Voice <span className="text-red-500">*</span>
            </label>
            <textarea
              id="brandTone"
              value={brandTone}
              onChange={(e) => setBrandTone(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
              placeholder="Describe your venue's unique voice and personality..."
              required
            />
            
            <div className="mt-2">
              <p className="text-xs text-gray-400 mb-1">Suggestions:</p>
              <div className="flex flex-wrap gap-2">
                {toneOptions.map((tone, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setBrandTone(tone)}
                    className="rounded-full bg-zinc-800 px-2 py-1 text-xs text-gray-300 hover:bg-zinc-700"
                  >
                    {tone.length > 30 ? `${tone.substring(0, 27)}...` : tone}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Past Events <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 flex">
              <input
                type="text"
                value={eventInput}
                onChange={(e) => setEventInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddEvent())}
                className="block w-full rounded-l-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                placeholder="Add past events"
              />
              <button
                type="button"
                onClick={handleAddEvent}
                className="inline-flex items-center rounded-r-md border border-l-0 border-zinc-700 bg-zinc-700 px-3 py-2 font-medium text-white hover:bg-zinc-600"
              >
                <Plus size={16} />
              </button>
            </div>
            
            {pastEvents.length > 0 ? (
              <div className="mt-2 space-y-2">
                {pastEvents.map((event, index) => (
                  <div key={index} className="flex items-center justify-between rounded-md bg-zinc-800 px-3 py-2 text-sm">
                    <span className="text-gray-300">{event}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveEvent(index)}
                      className="ml-2 text-gray-400 hover:text-white"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-1 text-xs text-amber-500">Add at least one past event</p>
            )}
          </div>
          
          <div className="pt-4">
            <button
              type="button"
              onClick={handleUpdateMemory}
              disabled={isProcessing || !venueName || !brandTone || pastEvents.length === 0}
              className="w-full justify-center inline-flex items-center rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-700 focus:outline-none disabled:opacity-70"
            >
              {isProcessing ? (
                <>
                  <Loader size={16} className="mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Update Brand Memory
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Memory Display */}
        <div className="lg:col-span-3 rounded-lg bg-zinc-800 p-4">
          <h3 className="flex items-center text-sm font-medium text-white mb-3">
            <Archive size={14} className="mr-2" />
            Brand Memory
          </h3>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader size={24} className="animate-spin text-amber-500 mr-3" />
              <p className="text-gray-400">Loading brand memory...</p>
            </div>
          ) : memoryData ? (
            <div>
              <div className="mb-4 rounded-lg bg-zinc-900 p-3">
                <h4 className="text-xs font-medium text-gray-300 mb-2 uppercase tracking-wide">Brand Summary</h4>
                <p className="text-sm text-white">{memoryData.summary}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg bg-zinc-900 p-3">
                  <h4 className="text-xs font-medium text-gray-300 mb-2 uppercase tracking-wide">Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {memoryData.keywords.map((keyword, index) => (
                      <span key={index} className="rounded-full bg-purple-900/30 border border-purple-800/50 px-2 py-1 text-xs text-purple-300">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="rounded-lg bg-zinc-900 p-3">
                  <h4 className="text-xs font-medium text-gray-300 mb-2 uppercase tracking-wide">Tone Attributes</h4>
                  <div className="flex flex-wrap gap-2">
                    {memoryData.tone_attributes.map((attr, index) => (
                      <span key={index} className="rounded-full bg-indigo-900/30 border border-indigo-800/50 px-2 py-1 text-xs text-indigo-300">
                        {attr}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 rounded-lg bg-amber-900/20 border border-amber-800/30 p-3">
                <div className="flex items-center text-xs font-medium text-amber-400 mb-2">
                  <FileText size={12} className="mr-2" />
                  How this memory is used
                </div>
                <p className="text-xs text-gray-300">
                  This brand memory is automatically injected into AI system prompts to ensure all 
                  generated content maintains consistent voice, tone, and style across all customer 
                  touchpoints.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Archive size={24} className="mx-auto text-zinc-700 mb-3" />
              <p className="text-gray-400">No brand memory created yet</p>
              <p className="text-xs text-gray-500 mt-2">Fill in the details and click Update to create your venue's brand memory</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4 bg-zinc-800 p-3 rounded-lg">
        <h3 className="text-xs font-medium text-white mb-2">About Brand Memory</h3>
        <p className="text-xs text-gray-400">
          Brand memory ensures consistency in all AI-generated content by maintaining your venue's unique 
          voice and style. This memory is used to guide the AI when creating marketing materials, 
          responding to customers, and generating event descriptions. Update this periodically as your 
          brand evolves or after significant events.
        </p>
      </div>
    </div>
  );
};

export default BrandMemoryManager;