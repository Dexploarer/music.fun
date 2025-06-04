import React, { useState } from 'react';
import { usePersonalization } from '../../hooks/usePersonalization';
import { MessageSquare, Send, Loader, Users, Tag, Copy, CheckCircle, Plus, X } from 'lucide-react';

interface NotificationGeneratorProps {
  onNotificationGenerated?: (notification: string) => void;
  defaultValues?: {
    userName?: string;
    preferences?: string[];
    eventName?: string;
    eventDate?: string;
  };
}

const NotificationGenerator: React.FC<NotificationGeneratorProps> = ({
  onNotificationGenerated,
  defaultValues
}) => {
  const [userName, setUserName] = useState(defaultValues?.userName || '');
  const [preferences, setPreferences] = useState<string[]>(defaultValues?.preferences || []);
  const [preferenceInput, setPreferenceInput] = useState('');
  const [eventName, setEventName] = useState(defaultValues?.eventName || '');
  const [eventDate, setEventDate] = useState(defaultValues?.eventDate || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [notification, setNotification] = useState('');
  const [copied, setCopied] = useState(false);
  
  const { createPersonalizedMessage } = usePersonalization();

  // Reset copied state after 3 seconds
  React.useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [copied]);

  const handleAddPreference = () => {
    if (preferenceInput.trim() && !preferences.includes(preferenceInput.trim())) {
      setPreferences([...preferences, preferenceInput.trim()]);
      setPreferenceInput('');
    }
  };

  const handleRemovePreference = (index: number) => {
    setPreferences(preferences.filter((_, i) => i !== index));
  };

  const handleGenerateNotification = async () => {
    if (!userName || !eventName || !eventDate || preferences.length === 0) {
      alert('Please fill in all required fields and add at least one user preference');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await createPersonalizedMessage({
        user_name: userName,
        preferences: preferences,
        upcoming_event: {
          name: eventName,
          date: eventDate
        }
      });

      setNotification(result);
      if (onNotificationGenerated) {
        onNotificationGenerated(result);
      }
    } catch (error) {
      console.error('Error generating notification:', error);
      alert('Failed to generate notification. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyNotification = () => {
    if (!notification) return;
    
    navigator.clipboard.writeText(notification);
    setCopied(true);
  };

  const commonPreferences = [
    'Blues', 'Country', 'Folk', 'Jazz', 'Rock', 'Live Music', 'Acoustic Sets',
    'Beer', 'Cocktails', 'Wine', 'Food Pairings',
    'Dancing', 'Seated Events', 'Weekend Events', 'Weekday Events', 
    'Early Shows', 'Late Night', 'VIP Experiences'
  ];

  return (
    <div className="rounded-lg bg-zinc-900 p-4 sm:p-6 shadow-md">
      <div className="mb-4 flex items-center">
        <div className="rounded-full bg-gradient-to-r from-green-500 to-teal-500 p-2">
          <MessageSquare size={18} className="text-white" />
        </div>
        <h2 className="ml-3 text-lg font-semibold text-white">Personalized Notification Generator</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="userName" className="block text-sm font-medium text-gray-300">
              Customer Name <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 flex items-center">
              <Users size={16} className="mr-2 text-gray-400" />
              <input
                type="text"
                id="userName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                placeholder="e.g. Alex"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Customer Preferences <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 relative">
              <div className="flex items-center">
                <Tag size={16} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={preferenceInput}
                  onChange={(e) => setPreferenceInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPreference())}
                  list="preferenceOptions"
                  className="block w-full rounded-md border border-zinc-700 bg-zinc-800 pl-10 pr-24 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                  placeholder="Add preferences"
                />
                <button
                  type="button"
                  onClick={handleAddPreference}
                  className="absolute right-1.5 top-1.5 inline-flex items-center rounded-md border border-zinc-600 bg-zinc-700 px-2.5 py-1 text-xs font-medium text-white hover:bg-zinc-600"
                >
                  <Plus size={12} className="mr-1" /> Add
                </button>
              </div>
              
              <datalist id="preferenceOptions">
                {commonPreferences.map((pref) => (
                  <option key={pref} value={pref} />
                ))}
              </datalist>
              
              {preferences.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {preferences.map((pref, index) => (
                    <div key={index} className="flex items-center rounded-full bg-zinc-800 pl-2 pr-1 py-1 text-xs">
                      <span className="text-white">{pref}</span>
                      <button
                        type="button"
                        onClick={() => handleRemovePreference(index)}
                        className="ml-1.5 rounded-full p-0.5 text-gray-400 hover:bg-zinc-700 hover:text-white"
                        aria-label="Remove"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {preferences.length === 0 && (
              <p className="mt-1 text-xs text-amber-500">Add at least one preference</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="eventName" className="block text-sm font-medium text-gray-300">
                Upcoming Event Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="eventName"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                placeholder="e.g. Bluegrass Bonanza"
                required
              />
            </div>
            <div>
              <label htmlFor="eventDate" className="block text-sm font-medium text-gray-300">
                Event Date <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="eventDate"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                placeholder="e.g. June 15"
                required
              />
            </div>
          </div>
          
          <div className="pt-2">
            <button
              type="button"
              onClick={handleGenerateNotification}
              disabled={isGenerating || !userName || !eventName || !eventDate || preferences.length === 0}
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
                  Generate Notification
                </>
              )}
            </button>
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-white mb-3">Generated Notification</h3>
          
          {notification ? (
            <div className="rounded-lg bg-zinc-800 p-4 relative min-h-[150px]">
              <div className="mb-6">
                <p className="text-white whitespace-pre-line">{notification}</p>
              </div>
              
              <div className="absolute bottom-3 right-3 flex space-x-2">
                <span className="text-xs text-gray-400">
                  {notification.length} characters
                </span>
                <button 
                  onClick={handleCopyNotification}
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
              <p className="text-gray-400">Your personalized notification will appear here</p>
              <p className="text-xs text-gray-500 mt-2">Fill in the details to generate a tailored message</p>
            </div>
          )}
          
          <div className="mt-4 bg-zinc-800 rounded-lg p-4">
            <h3 className="text-xs font-medium text-white mb-2">Use Cases:</h3>
            <ul className="text-xs text-gray-400 space-y-1">
              <li className="flex items-start">
                <svg className="h-3 w-3 mr-1 mt-0.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Email campaign subject lines</span>
              </li>
              <li className="flex items-start">
                <svg className="h-3 w-3 mr-1 mt-0.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>SMS notifications for upcoming events</span>
              </li>
              <li className="flex items-start">
                <svg className="h-3 w-3 mr-1 mt-0.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Push notifications for mobile app users</span>
              </li>
              <li className="flex items-start">
                <svg className="h-3 w-3 mr-1 mt-0.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Personalized website banners</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationGenerator;