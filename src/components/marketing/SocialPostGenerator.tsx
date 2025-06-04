import React, { useState, useEffect } from 'react';
import { useSocialGen } from '../../hooks/useSocialGen';
import { Music, Send, Loader, Copy, CheckCircle, MessageSquare } from 'lucide-react';

interface SocialPostGeneratorProps {
  onPostGenerated?: (post: string) => void;
  defaultValues?: {
    brandName?: string;
    trendTopic?: string;
    tone?: string;
  };
}

const SocialPostGenerator: React.FC<SocialPostGeneratorProps> = ({
  onPostGenerated,
  defaultValues
}) => {
  const [brandName, setBrandName] = useState(defaultValues?.brandName || 'The Train Station');
  const [trendTopic, setTrendTopic] = useState(defaultValues?.trendTopic || '');
  const [tone, setTone] = useState(defaultValues?.tone || 'casual');
  const [isGenerating, setIsGenerating] = useState(false);
  const [socialPost, setSocialPost] = useState('');
  const [copied, setCopied] = useState(false);
  
  const { generateSocialPost } = useSocialGen();

  // Reset copied state after 3 seconds
  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [copied]);

  const handleGeneratePost = async () => {
    if (!brandName || !trendTopic || !tone) {
      alert('Please fill in all required fields');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateSocialPost({
        brand_name: brandName,
        trend_topic: trendTopic,
        tone
      });

      setSocialPost(result);
      if (onPostGenerated) {
        onPostGenerated(result);
      }
    } catch (error) {
      console.error('Error generating social post:', error);
      alert('Failed to generate social post. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyPost = () => {
    if (!socialPost) return;
    
    navigator.clipboard.writeText(socialPost);
    setCopied(true);
  };

  const toneOptions = [
    { value: 'casual', label: 'Casual & Friendly' },
    { value: 'excited', label: 'Excited & Energetic' },
    { value: 'professional', label: 'Professional & Informative' },
    { value: 'urgent', label: 'Urgent & Time-Sensitive' },
    { value: 'humorous', label: 'Humorous & Light' },
    { value: 'nostalgic', label: 'Nostalgic & Sentimental' }
  ];

  // Current trend suggestions
  const trendSuggestions = [
    'Summer concert season',
    'Rising bluegrass artists',
    'Craft beer pairings',
    'Throwback Thursday',
    'Local artist spotlight',
    'Live music comeback',
    'Weekend getaway',
    'Acoustic sessions'
  ];

  return (
    <div className="rounded-lg bg-zinc-900 p-4 sm:p-6 shadow-md">
      <div className="mb-4 flex items-center">
        <div className="rounded-full bg-gradient-to-r from-blue-500 to-purple-500 p-2">
          <MessageSquare size={18} className="text-white" />
        </div>
        <h2 className="ml-3 text-lg font-semibold text-white">Social Media Post Generator</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="brandName" className="block text-sm font-medium text-gray-300">
              Brand Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="brandName"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
              placeholder="e.g. The Train Station"
              required
            />
          </div>
          
          <div>
            <label htmlFor="trendTopic" className="block text-sm font-medium text-gray-300">
              Trending Topic <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="trendTopic"
              value={trendTopic}
              onChange={(e) => setTrendTopic(e.target.value)}
              className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
              placeholder="e.g. Summer concert season"
              required
            />
            
            {trendSuggestions.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-gray-400 mb-1">Trend suggestions:</p>
                <div className="flex flex-wrap gap-2">
                  {trendSuggestions.map((trend, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setTrendTopic(trend)}
                      className="rounded-full bg-zinc-800 px-2 py-1 text-xs text-gray-300 hover:bg-zinc-700"
                    >
                      {trend}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div>
            <label htmlFor="tone" className="block text-sm font-medium text-gray-300">
              Tone <span className="text-red-500">*</span>
            </label>
            <select
              id="tone"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500"
              required
            >
              {toneOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="pt-2">
            <button
              type="button"
              onClick={handleGeneratePost}
              disabled={isGenerating || !brandName || !trendTopic || !tone}
              className="w-full justify-center inline-flex items-center rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-700 focus:outline-none disabled:opacity-70"
            >
              {isGenerating ? (
                <>
                  <Loader size={16} className="mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Send size={16} className="mr-2" />
                  Generate Post
                </>
              )}
            </button>
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-white mb-3">Generated Post</h3>
          
          {socialPost ? (
            <div className="rounded-lg bg-zinc-800 p-4 relative min-h-[150px]">
              <div className="mb-6 flex items-start">
                <Music size={16} className="mr-2 mt-1 text-amber-500 flex-shrink-0" />
                <p className="text-white whitespace-pre-line">{socialPost}</p>
              </div>
              
              <div className="absolute bottom-3 right-3 flex space-x-2">
                <span className="text-xs text-gray-400">
                  {socialPost.length} characters
                </span>
                <button 
                  onClick={handleCopyPost}
                  className="text-xs flex items-center text-amber-500 hover:text-amber-400"
                  title="Copy to clipboard"
                >
                  {copied ? <CheckCircle size={12} className="mr-1" /> : <Copy size={12} className="mr-1" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-lg bg-zinc-800 p-8 text-center flex flex-col items-center justify-center min-h-[150px]">
              <MessageSquare size={24} className="text-zinc-700 mb-3" />
              <p className="text-gray-400">Your social media post will appear here</p>
              <p className="text-xs text-gray-500 mt-2">Fill in the details to generate a trending post</p>
            </div>
          )}
          
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-zinc-800 rounded-lg p-3">
              <h3 className="text-xs font-medium text-white mb-2">Post Best Practices</h3>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• Keep it under 280 characters for Twitter</li>
                <li>• Include 1-2 relevant hashtags</li>
                <li>• Add a clear call-to-action</li>
                <li>• Be authentic and conversational</li>
                <li>• Relate to current trends when possible</li>
              </ul>
            </div>
            
            <div className="bg-zinc-800 rounded-lg p-3">
              <h3 className="text-xs font-medium text-white mb-2">Platform Tips</h3>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• Facebook: Add more detail and images</li>
                <li>• Instagram: Focus on visual elements</li>
                <li>• Twitter: Keep it brief and punchy</li>
                <li>• LinkedIn: More professional tone</li>
                <li>• TikTok: Trendy, casual language</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialPostGenerator;