import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Save, 
  ChevronLeft, 
  Calendar, 
  Briefcase, 
  MessageCircle, 
  Facebook, 
  Instagram, 
  Twitter, 
  Globe, 
  Zap 
} from 'lucide-react';
import { useMarketing } from '../hooks/useMarketing';
import { useEvents } from '../hooks/useEvents';
import { useAI } from '../contexts/AIContext';
import { toast } from 'react-hot-toast';
import { MarketingCampaign } from '../types';

const CreateCampaign: React.FC = () => {
  const navigate = useNavigate();
  const { createCampaign, isCreating } = useMarketing();
  const { events, isLoading: isLoadingEvents } = useEvents();
  const { generateContent, isProcessing } = useAI();
  
  const [formData, setFormData] = useState<Omit<MarketingCampaign, 'id'>>({
    title: '',
    description: '',
    date: '',
    platforms: [],
    status: 'draft',
    eventId: '',
    content: {
      text: '',
      images: []
    },
    performance: {
      reach: 0,
      engagement: 0,
      clicks: 0,
      conversions: 0
    }
  });
  
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResult, setAiResult] = useState('');
  
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        [name]: value
      }
    }));
  };
  
  const handlePlatformToggle = (platform: string) => {
    setFormData((prev) => {
      const platforms = [...prev.platforms];
      if (platforms.includes(platform)) {
        return { ...prev, platforms: platforms.filter(p => p !== platform) };
      } else {
        return { ...prev, platforms: [...platforms, platform] };
      }
    });
  };
  
  const handleGenerateContent = async () => {
    if (!aiPrompt && !formData.eventId) {
      toast.error('Please select an event or enter a prompt');
      return;
    }
    
    try {
      let prompt = aiPrompt;
      if (!prompt) {
        const selectedEvent = events.find(e => e.id === formData.eventId);
        prompt = `Create marketing copy for a ${selectedEvent?.genre || 'music'} event titled "${selectedEvent?.title || 'upcoming event'}" at The Train Station venue.`;
      }
      
      const content = await generateContent(prompt);
      setAiResult(content);
    } catch (error: any) {
      toast.error(`Error generating content: ${error.message}`);
    }
  };
  
  const applyGeneratedContent = () => {
    if (!aiResult) return;
    
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        text: aiResult
      }
    }));
    
    toast.success('AI content applied!');
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title) {
      toast.error('Please enter a campaign title');
      return;
    }
    
    try {
      await createCampaign(formData);
      toast.success('Campaign created successfully!');
      navigate('/marketing');
    } catch (error: any) {
      toast.error(`Error creating campaign: ${error.message}`);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
        <div>
          <button 
            onClick={() => navigate('/marketing')}
            className="mb-2 flex items-center text-sm font-medium text-gray-400 hover:text-white"
          >
            <ChevronLeft size={16} className="mr-1" />
            Back to Marketing
          </button>
          <h1 className="font-playfair text-3xl font-bold tracking-tight text-white">Create Campaign</h1>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="rounded-xl bg-zinc-900 p-6 shadow-lg">
            <div className="mb-6 space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-300">
                  Campaign Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  placeholder="e.g. Summer Blues Festival Promotion"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300">
                  Campaign Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  placeholder="Describe the goals and strategy of this campaign..."
                />
              </div>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-300">
                    Launch Date
                  </label>
                  <div className="mt-1 flex items-center">
                    <Calendar size={18} className="mr-2 text-gray-400" />
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white shadow-sm focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-300">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white shadow-sm focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label htmlFor="eventId" className="block text-sm font-medium text-gray-300">
                  Related Event
                </label>
                <select
                  id="eventId"
                  name="eventId"
                  value={formData.eventId}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white shadow-sm focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                >
                  <option value="">Select an event</option>
                  {isLoadingEvents ? (
                    <option disabled>Loading events...</option>
                  ) : (
                    events.map(event => (
                      <option key={event.id} value={event.id}>
                        {event.title} ({new Date(event.date).toLocaleDateString()})
                      </option>
                    ))
                  )}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Platforms
                </label>
                <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <button
                    type="button"
                    onClick={() => handlePlatformToggle('Facebook')}
                    className={`flex items-center justify-center rounded-lg p-3 text-sm ${
                      formData.platforms.includes('Facebook')
                        ? 'bg-blue-600 text-white'
                        : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
                    }`}
                  >
                    <Facebook size={18} className="mr-2" />
                    Facebook
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePlatformToggle('Instagram')}
                    className={`flex items-center justify-center rounded-lg p-3 text-sm ${
                      formData.platforms.includes('Instagram')
                        ? 'bg-pink-600 text-white'
                        : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
                    }`}
                  >
                    <Instagram size={18} className="mr-2" />
                    Instagram
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePlatformToggle('Twitter')}
                    className={`flex items-center justify-center rounded-lg p-3 text-sm ${
                      formData.platforms.includes('Twitter')
                        ? 'bg-blue-400 text-white'
                        : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
                    }`}
                  >
                    <Twitter size={18} className="mr-2" />
                    Twitter
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePlatformToggle('Website')}
                    className={`flex items-center justify-center rounded-lg p-3 text-sm ${
                      formData.platforms.includes('Website')
                        ? 'bg-amber-600 text-white'
                        : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
                    }`}
                  >
                    <Globe size={18} className="mr-2" />
                    Website
                  </button>
                </div>
              </div>
              
              <div>
                <label htmlFor="text" className="block text-sm font-medium text-gray-300">
                  Campaign Content
                </label>
                <textarea
                  id="text"
                  name="text"
                  value={formData.content?.text || ''}
                  onChange={handleContentChange}
                  rows={6}
                  className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  placeholder="Enter your marketing copy here..."
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate('/marketing')}
                className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 focus:outline-none"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating || !formData.title}
                className="inline-flex items-center rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 focus:outline-none disabled:opacity-70"
              >
                <Save size={16} className="mr-2" />
                {isCreating ? 'Saving...' : 'Save Campaign'}
              </button>
            </div>
          </form>
        </div>
        
        {/* AI Assistant Panel */}
        <div className="space-y-6">
          <div className="rounded-xl bg-zinc-900 p-6 shadow-lg">
            <div className="mb-4 flex items-center">
              <div className="rounded-full bg-gradient-to-r from-amber-500 to-amber-600 p-2">
                <Zap size={18} className="text-white" />
              </div>
              <h2 className="ml-3 text-lg font-semibold text-white">AI Content Generator</h2>
            </div>
            
            <div className="mb-4">
              <label htmlFor="aiPrompt" className="block text-sm font-medium text-gray-300">
                What kind of content would you like to create?
              </label>
              <textarea
                id="aiPrompt"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white shadow-sm focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                rows={3}
                placeholder="e.g. Create posts for an acoustic night featuring local artists"
              />
            </div>
            
            <div className="mb-4">
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleGenerateContent}
                className="flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-sm font-medium text-white hover:from-amber-600 hover:to-amber-700 focus:outline-none disabled:opacity-70"
              >
                <Zap size={16} className="mr-2" />
                {isProcessing ? 'Generating...' : 'Generate Content'}
              </button>
            </div>
            
            {aiResult && (
              <div className="rounded-lg bg-zinc-800 p-4">
                <h3 className="mb-2 text-sm font-medium text-white">Generated Content</h3>
                <p className="mb-3 text-sm text-gray-300">{aiResult}</p>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={applyGeneratedContent}
                    className="rounded-lg bg-zinc-700 px-3 py-1 text-xs font-medium text-white hover:bg-zinc-600 focus:outline-none"
                  >
                    Apply to Campaign
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="rounded-xl bg-zinc-900 p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold text-white">Marketing Tips</h2>
            <div className="space-y-3">
              <div className="flex items-start rounded-lg bg-zinc-800 p-3">
                <Briefcase size={16} className="mr-2 mt-0.5 text-amber-500" />
                <p className="text-sm text-gray-300">
                  Target your promotion to the specific genre and audience of your event.
                </p>
              </div>
              <div className="flex items-start rounded-lg bg-zinc-800 p-3">
                <Calendar size={16} className="mr-2 mt-0.5 text-amber-500" />
                <p className="text-sm text-gray-300">
                  Start promoting at least 2-3 weeks before the event date.
                </p>
              </div>
              <div className="flex items-start rounded-lg bg-zinc-800 p-3">
                <MessageCircle size={16} className="mr-2 mt-0.5 text-amber-500" />
                <p className="text-sm text-gray-300">
                  Engage with your audience by asking questions and encouraging shares.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCampaign;