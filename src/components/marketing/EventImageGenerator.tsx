import React, { useState } from 'react';
import { useAI } from '../../contexts/AIContext';
import { Download, Palette, Calendar, Users, Music } from 'lucide-react';

interface EventImageGeneratorProps {
  onImageGenerated?: (imageUrl: string) => void;
  defaultValues?: {
    eventName?: string;
    eventDate?: string;
    artists?: string[];
    venue?: string;
    genre?: string;
    ticketPrice?: string;
  };
}

const EventImageGenerator: React.FC<EventImageGeneratorProps> = ({ 
  onImageGenerated,
  defaultValues 
}) => {
  const { 
    generateEventPoster, 
    generateVenueBanner, 
    generateTicketDesign, 
    generateEventFlyer, 
    generateAgendaInfographic, 
    generateSocialMediaPost,
    isProcessing 
  } = useAI();

  const [imageType, setImageType] = useState<'poster' | 'banner' | 'ticket' | 'flyer' | 'infographic' | 'social'>('poster');
  const [eventDetails, setEventDetails] = useState({
    name: defaultValues?.eventName || '',
    date: defaultValues?.eventDate || '',
    time: '',
    artists: defaultValues?.artists || [''],
    genre: defaultValues?.genre || '',
    ticketPrice: defaultValues?.ticketPrice || '',
    venue: defaultValues?.venue || 'The Train Station',
    description: '',
    customPrompt: ''
  });
  
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAddArtist = () => {
    setEventDetails(prev => ({
      ...prev,
      artists: [...prev.artists, '']
    }));
  };

  const handleRemoveArtist = (index: number) => {
    setEventDetails(prev => ({
      ...prev,
      artists: prev.artists.filter((_, i) => i !== index)
    }));
  };

  const handleArtistChange = (index: number, value: string) => {
    setEventDetails(prev => ({
      ...prev,
      artists: prev.artists.map((artist, i) => i === index ? value : artist)
    }));
  };

  const handleGenerateImage = async () => {
    if (!eventDetails.name.trim()) {
      setError('Event name is required');
      return;
    }

    try {
      setError(null);
      let imageUrl = '';

      const eventData = {
        ...eventDetails,
        artists: eventDetails.artists.filter(artist => artist.trim())
      };

      const venueData = {
        name: eventDetails.venue,
        theme: 'modern music venue',
        branding: 'professional live music'
      };

      switch (imageType) {
        case 'poster':
          imageUrl = await generateEventPoster(eventData);
          break;
        case 'banner':
          imageUrl = await generateVenueBanner(venueData);
          break;
        case 'ticket':
          imageUrl = await generateTicketDesign(eventData);
          break;
        case 'flyer':
          imageUrl = await generateEventFlyer(eventData);
          break;
        case 'infographic':
          imageUrl = await generateAgendaInfographic(eventData);
          break;
        case 'social':
          imageUrl = await generateSocialMediaPost(eventData);
          break;
      }

      if (imageUrl) {
        setGeneratedImageUrl(imageUrl);
        onImageGenerated?.(imageUrl);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to generate image');
    }
  };

  const handleDownloadImage = () => {
    if (generatedImageUrl) {
      const link = document.createElement('a');
      link.href = generatedImageUrl;
      link.download = `${eventDetails.name}-${imageType}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getImageTypeIcon = (type: string) => {
    switch (type) {
      case 'poster': return <Palette className="h-4 w-4" />;
      case 'banner': return <Calendar className="h-4 w-4" />;
      case 'ticket': return <Users className="h-4 w-4" />;
      case 'flyer': return <Music className="h-4 w-4" />;
      case 'infographic': return <Calendar className="h-4 w-4" />;
      case 'social': return <Music className="h-4 w-4" />;
      default: return <Palette className="h-4 w-4" />;
    }
  };

  const getImageTypeDescription = (type: string) => {
    switch (type) {
      case 'poster': return 'Large format concert poster (1024x1792)';
      case 'banner': return 'Website/social media banner (1792x1024)';
      case 'ticket': return 'Professional ticket design (1792x1024)';
      case 'flyer': return 'Compact promotional flyer (1024x1024)';
      case 'infographic': return 'Event agenda timeline (1024x1792)';
      case 'social': return 'Social media post (1024x1024)';
      default: return '';
    }
  };

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
        <Palette className="h-5 w-5 mr-2 text-purple-400" />
        AI Venue Image Generator
      </h3>

      {/* Image Type Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Image Type
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {['poster', 'banner', 'ticket', 'flyer', 'infographic', 'social'].map((type) => (
            <button
              key={type}
              onClick={() => setImageType(type as any)}
              className={`p-3 rounded-lg border transition-all ${
                imageType === type
                  ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                  : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center justify-center mb-2">
                {getImageTypeIcon(type)}
              </div>
              <div className="text-sm font-medium capitalize">{type}</div>
              <div className="text-xs text-gray-400 mt-1">
                {getImageTypeDescription(type)}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Event Details Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Event Name *
          </label>
          <input
            type="text"
            value={eventDetails.name}
            onChange={(e) => setEventDetails(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white"
            placeholder="Enter event name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Event Date
          </label>
          <input
            type="date"
            value={eventDetails.date}
            onChange={(e) => setEventDetails(prev => ({ ...prev, date: e.target.value }))}
            className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Event Time
          </label>
          <input
            type="time"
            value={eventDetails.time}
            onChange={(e) => setEventDetails(prev => ({ ...prev, time: e.target.value }))}
            className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Genre
          </label>
          <select
            value={eventDetails.genre}
            onChange={(e) => setEventDetails(prev => ({ ...prev, genre: e.target.value }))}
            className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white"
          >
            <option value="">Select genre</option>
            <option value="Rock">Rock</option>
            <option value="Country">Country</option>
            <option value="Blues">Blues</option>
            <option value="Jazz">Jazz</option>
            <option value="Folk">Folk</option>
            <option value="Alternative">Alternative</option>
            <option value="Indie">Indie</option>
            <option value="Electronic">Electronic</option>
          </select>
        </div>

        {(imageType === 'ticket' || imageType === 'flyer') && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Ticket Price
            </label>
            <input
              type="text"
              value={eventDetails.ticketPrice}
              onChange={(e) => setEventDetails(prev => ({ ...prev, ticketPrice: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white"
              placeholder="$25"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Venue Name
          </label>
          <input
            type="text"
            value={eventDetails.venue}
            onChange={(e) => setEventDetails(prev => ({ ...prev, venue: e.target.value }))}
            className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white"
            placeholder="The Train Station"
          />
        </div>
      </div>

      {/* Artists Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Performing Artists
        </label>
        {eventDetails.artists.map((artist, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={artist}
              onChange={(e) => handleArtistChange(index, e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white"
              placeholder={`Artist ${index + 1}`}
            />
            {eventDetails.artists.length > 1 && (
              <button
                onClick={() => handleRemoveArtist(index)}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          onClick={handleAddArtist}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
        >
          Add Artist
        </button>
      </div>

      {/* Custom Prompt */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Custom Style Instructions (Optional)
        </label>
        <textarea
          value={eventDetails.customPrompt}
          onChange={(e) => setEventDetails(prev => ({ ...prev, customPrompt: e.target.value }))}
          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white h-20 resize-none"
          placeholder="Add specific style, color, or design instructions..."
        />
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerateImage}
        disabled={isProcessing || !eventDetails.name.trim()}
        className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center"
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Generating {imageType}...
          </>
        ) : (
          <>
            <Palette className="h-4 w-4 mr-2" />
            Generate {imageType.charAt(0).toUpperCase() + imageType.slice(1)}
          </>
        )}
      </button>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
          {error}
        </div>
      )}

      {/* Generated Image Display */}
      {generatedImageUrl && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-white">Generated {imageType}</h4>
            <button
              onClick={handleDownloadImage}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </button>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-4">
            <img
              src={generatedImageUrl}
              alt={`Generated ${imageType} for ${eventDetails.name}`}
              className="w-full h-auto rounded-lg border border-gray-600"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EventImageGenerator;