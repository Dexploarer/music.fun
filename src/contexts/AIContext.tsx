import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import OpenAI from 'openai';
import { useBrandMemory, type DatabaseBrandMemory, type BrandMemorySummary } from '../hooks/useBrandMemory';

interface ConversationMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface GenerateContentOptions {
  maxTokens?: number;
  temperature?: number;
  useContext?: boolean;
}

interface GenerateImageOptions {
  size?: '1024x1024' | '1792x1024' | '1024x1792';
  style?: 'vivid' | 'natural';
  type?: 'poster' | 'banner' | 'ticket' | 'flyer' | 'infographic' | 'social' | 'general';
  venue?: {
    name?: string;
    theme?: string;
    branding?: string;
  };
  event?: {
    name?: string;
    date?: string;
    time?: string;
    artists?: string[];
    genre?: string;
    ticketPrice?: string;
  };
}

interface AnalyzeDataOptions {
  analysisType?: 'summary' | 'trends' | 'insights' | 'recommendations';
}

interface AIContextType {
  isProcessing: boolean;
  generateContent: (prompt: string, options?: GenerateContentOptions) => Promise<string>;
  generateImage: (prompt: string, options?: GenerateImageOptions) => Promise<string>;
  generateEventPoster: (eventDetails: any, options?: GenerateImageOptions) => Promise<string>;
  generateVenueBanner: (venueDetails: any, options?: GenerateImageOptions) => Promise<string>;
  generateTicketDesign: (ticketDetails: any, options?: GenerateImageOptions) => Promise<string>;
  generateEventFlyer: (eventDetails: any, options?: GenerateImageOptions) => Promise<string>;
  generateAgendaInfographic: (agendaData: any, options?: GenerateImageOptions) => Promise<string>;
  generateSocialMediaPost: (postDetails: any, options?: GenerateImageOptions) => Promise<string>;
  analyzeData: (data: any, question: string, options?: AnalyzeDataOptions) => Promise<any>;
  generateMarketingContent: (type: 'social' | 'email' | 'poster' | 'description', details: any) => Promise<string>;
  generateFinancialInsights: (financialData: any) => Promise<string>;
  generateEventRecommendations: (preferences: any, eventHistory: any) => Promise<string>;
  clearConversationHistory: () => void;
  conversationHistory: ConversationMessage[];
  aiPersonality: 'professional' | 'friendly' | 'analytical';
  setAiPersonality: (personality: 'professional' | 'friendly' | 'analytical') => void;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

// Initialize OpenAI with enhanced configuration
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true // For demo purposes - in production, use server proxy
});

export const useAI = () => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [brandMemory, setBrandMemory] = useState<string | null>(null);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [aiPersonality, setAiPersonality] = useState<'professional' | 'friendly' | 'analytical'>('friendly');
  const { getBrandMemory } = useBrandMemory();

  // Load brand memory on component mount
  useEffect(() => {
    const loadBrandMemory = async () => {
      try {
        const memory = await getBrandMemory('The Train Station');
        
        // Handle DatabaseBrandMemory type (from database)
        if (memory && 'memory_data' in memory) {
          const databaseMemory = memory as DatabaseBrandMemory;
          const memoryData = databaseMemory.memory_data;
          
          // Extract key information from the JSON memory_data structure
          const venueName = memoryData.name || 'The Train Station';
          const mission = memoryData.mission || '';
          const atmosphere = memoryData.atmosphere || '';
          const features = memoryData.features || {};
          
          // Build brand attributes from the features and atmosphere
          const brandAttributes = [
            'Intimate 1920s speakeasy atmosphere',
            'Best sound quality in Kentucky',
            'Line dancing venue',
            'Veteran-owned and operated',
            'Farm-to-table dining experience',
            'Kentucky singer-songwriter showcase'
          ];
          
          // Build keywords from the data
          const keywords = [
            'Train Station',
            'Corbin Kentucky',
            'Live music',
            'Line dancing',
            'Veterans support',
            'Kentucky Unplugged',
            'Speakeasy',
            'Event venue'
          ];
          
          const memoryString = `BRAND VOICE: ${mission}

VENUE ATMOSPHERE: ${atmosphere}

KEY BRAND ATTRIBUTES: ${brandAttributes.join(', ')}

KEY TERMS: ${keywords.join(', ')}

SPECIAL FEATURES: ${Object.values(features).join('. ')}`;
          
          setBrandMemory(memoryString);
        } 
        // Handle BrandMemorySummary type (fallback/default)
        else if (memory && 'summary' in memory) {
          const summaryMemory = memory as BrandMemorySummary;
          const toneAttributes = Array.isArray(summaryMemory.tone_attributes) ? summaryMemory.tone_attributes : [];
          const keywords = Array.isArray(summaryMemory.keywords) ? summaryMemory.keywords : [];
          
          const memoryString = `BRAND VOICE: ${summaryMemory.summary || 'Professional venue management platform'}

KEY BRAND ATTRIBUTES: ${toneAttributes.join(', ')}

KEY TERMS: ${keywords.join(', ')}`;
          
          setBrandMemory(memoryString);
        }
      } catch (error) {
        console.error('Error loading brand memory:', error);
        // Set a fallback brand memory to prevent crashes
        setBrandMemory('BRAND VOICE: Professional venue management platform for The Train Station - where music, storytelling, and camaraderie come together.');
      }
    };
    
    loadBrandMemory();
  }, []);

  // Clear conversation history
  const clearConversationHistory = useCallback(() => {
    setConversationHistory([]);
  }, []);

  // Get system message based on personality and context
  const getSystemMessage = useCallback((context?: string) => {
    const personalityMap = {
      professional: "You are Rowan, a professional AI assistant for The Train Station venue management platform. You provide clear, concise, and business-focused responses.",
      friendly: "You are Rowan, a friendly and enthusiastic AI assistant for The Train Station venue management platform. You're Michelle's personal conductor, helping with warmth and personality.",
      analytical: "You are Rowan, an analytical AI assistant for The Train Station venue management platform. You focus on data-driven insights and detailed analysis."
    };

    let systemMessage = personalityMap[aiPersonality];
    systemMessage += " You know every detail about artists, events, CRM, ticketing, inventory, finances, and overall venue operations.";
    
    if (brandMemory) {
      systemMessage += `\n\n${brandMemory}`;
    }
    
    if (context) {
      systemMessage += `\n\nCONTEXT: ${context}`;
    }
    
    return systemMessage;
  }, [aiPersonality, brandMemory]);

  // Enhanced content generation with conversation memory
  const generateContent = async (prompt: string, options: GenerateContentOptions = {}) => {
    const { maxTokens = 500, temperature = 0.7, useContext = true } = options;
    setIsProcessing(true);
    
    try {
      if (!import.meta.env.VITE_OPENAI_API_KEY) {
        // Provide mock intelligent responses when API key is not available
        const mockResponses: Record<string, string> = {
          'insight': 'Based on your venue data, your events are performing well with strong ticket sales. Consider expanding capacity for high-demand shows and promoting upcoming events through social media.',
          'revenue': 'Revenue trends show steady growth. Focus on premium ticket offerings and merchandise sales to maximize profitability.',
          'attendance': 'Attendance patterns suggest your audience prefers weekend shows. Consider scheduling more premium events on Fridays and Saturdays.',
          'marketing': 'Your marketing campaigns are reaching the right audience. Consider email marketing for repeat customers and social media advertising for new audience acquisition.',
          'default': 'Your venue operations are running smoothly. Key metrics show positive trends in attendance, revenue, and customer satisfaction. Consider focusing on customer retention and premium service offerings.'
        };
        
        // Determine response type based on prompt keywords
        let responseType = 'default';
        if (prompt.toLowerCase().includes('revenue') || prompt.toLowerCase().includes('financial')) responseType = 'revenue';
        else if (prompt.toLowerCase().includes('attendance') || prompt.toLowerCase().includes('ticket')) responseType = 'attendance';
        else if (prompt.toLowerCase().includes('marketing') || prompt.toLowerCase().includes('campaign')) responseType = 'marketing';
        else if (prompt.toLowerCase().includes('insight') || prompt.toLowerCase().includes('business')) responseType = 'insight';
        
        return mockResponses[responseType];
      }
      
      const messages: any[] = [
        {
          role: "system",
          content: getSystemMessage()
        }
      ];

      // Add conversation history if using context
      if (useContext && conversationHistory.length > 0) {
        // Add last 10 messages for context (to avoid token limits)
        const recentHistory = conversationHistory.slice(-10);
        messages.push(...recentHistory.map(msg => ({
          role: msg.role,
          content: msg.content
        })));
      }

      // Add current user message
      messages.push({
        role: "user",
        content: prompt
      });
      
      const response = await openai.chat.completions.create({
        model: "gpt-4.1-mini", // Current 2025 model - latest efficient text generation
        messages,
        max_tokens: maxTokens,
        temperature,
      });
      
      const content = response.choices[0].message.content || '';
      
      // Update conversation history
      if (useContext) {
        setConversationHistory(prev => [
          ...prev,
          { role: 'user', content: prompt, timestamp: new Date() },
          { role: 'assistant', content, timestamp: new Date() }
        ]);
      }
      
      return content;
    } catch (error: any) {
      console.error('AI content generation error:', error);
      if (error.status === 401) {
        return "Authentication failed. Please check your OpenAI API key.";
      } else if (error.status === 429) {
        return "Rate limit exceeded. Please try again in a moment.";
      } else if (error.status === 500) {
        return "OpenAI service is currently unavailable. Please try again later.";
      }
      return "Sorry, I encountered an error processing your request. Please try again later.";
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper function to parse brand memory string
  const parseBrandMemory = (brandMemoryString: string | null) => {
    if (!brandMemoryString) return null;
    
    // Extract venue name from brand memory string
    const venueMatch = brandMemoryString.match(/Train Station|venue/i);
    const venueName = venueMatch ? 'The Train Station' : 'The Venue';
    
    // Extract tone attributes
    const toneMatch = brandMemoryString.match(/BRAND ATTRIBUTES:\s*([^\n]+)/);
    const toneAttributes = toneMatch ? toneMatch[1].split(',').map(t => t.trim()) : ['modern'];
    
    return {
      venueName,
      toneAttributes
    };
  };

  // Enhanced image generation with multiple options
  const generateImage = async (prompt: string, options: GenerateImageOptions = {}) => {
    if (isProcessing) return '';
    
    setIsProcessing(true);
    try {
      const { size = '1024x1024', style = 'vivid', type = 'general', venue, event } = options;
      
      // Enhance prompt based on type and venue context
      let enhancedPrompt = prompt;
      
      if (type !== 'general') {
        enhancedPrompt = await enhanceVenueImagePrompt(prompt, type, venue, event);
      } else {
        // Apply brand memory for general images
        enhancedPrompt = `${brandMemory ? `[Venue Context: The Train Station music venue] ` : ''}${prompt}`;
      }

      const openai = new OpenAI({
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true
      });

      const response = await openai.images.generate({
        model: "gpt-4o", // Current 2025 model for image generation (replaces DALL-E 3)
        prompt: enhancedPrompt,
        n: 1,
        size,
        style,
        quality: 'hd'
      });

      if (response.data?.[0]?.url) {
        // Log the generation
        const newMessage: ConversationMessage = {
          role: 'user',
          content: `Generated ${type} image: ${prompt}`,
          timestamp: new Date()
        };
        setConversationHistory(prev => [...prev, newMessage]);
        
        return response.data[0].url;
      }
      
      throw new Error('No image URL returned');
    } catch (error) {
      console.error('Image generation error:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  // Enhanced prompt builder for venue-specific images
  const enhanceVenueImagePrompt = async (basePrompt: string, type: string, venue?: any, event?: any) => {
    const parsedMemory = parseBrandMemory(brandMemory);
    const venueName = venue?.name || parsedMemory?.venueName || 'The Train Station';
    const venueTheme = venue?.theme || parsedMemory?.toneAttributes?.[0] || 'modern';
    
    const templatePrompts = {
      poster: `Create a professional concert poster for "${event?.name || 'Live Music Event'}" at ${venueName}. 
              ${event?.artists?.length ? `Featuring: ${event.artists.join(', ')}. ` : ''}
              ${event?.date ? `Date: ${event.date}. ` : ''}
              ${event?.genre ? `Genre: ${event.genre}. ` : ''}
              Style: ${venueTheme}, vibrant, eye-catching, high-quality typography, concert poster design.
              Include venue branding elements and ticket information prominently.
              ${basePrompt}`,
              
      banner: `Design a professional venue banner for ${venueName}. 
              Theme: ${venueTheme}, wide format, prominent venue name, 
              elegant typography, live music atmosphere, stage lighting effects.
              Perfect for website headers and social media covers.
              ${basePrompt}`,
              
      ticket: `Create an elegant ticket design for "${event?.name || 'Concert'}" at ${venueName}.
              ${event?.date ? `Event date: ${event.date}. ` : ''}
              ${event?.time ? `Time: ${event.time}. ` : ''}
              ${event?.ticketPrice ? `Price: ${event.ticketPrice}. ` : ''}
              Include: ticket stub, perforation line, venue logo area, event details, 
              QR code placeholder, professional layout, premium feel.
              ${basePrompt}`,
              
      flyer: `Design a compact event flyer for "${event?.name || 'Live Event'}" at ${venueName}.
              ${event?.artists?.length ? `Artists: ${event.artists.join(', ')}. ` : ''}
              ${event?.date ? `Date: ${event.date}. ` : ''}
              Compact layout, essential information only, shareable format,
              eye-catching graphics, venue branding, call-to-action.
              ${basePrompt}`,
              
      infographic: `Create a professional agenda infographic for ${venueName}.
                   Clean layout, timeline format, easy to read typography,
                   professional design, venue branding, clear information hierarchy.
                   Include time slots, activities, and venue information.
                   ${basePrompt}`,
                   
      social: `Design a social media post for ${venueName}.
              ${event?.name ? `Event: ${event.name}. ` : ''}
              Square format, mobile-optimized, engaging visuals,
              venue branding, hashtag-ready, shareable design.
              ${basePrompt}`
    };

    return templatePrompts[type as keyof typeof templatePrompts] || basePrompt;
  };

  // Specialized venue image generation functions
  const generateEventPoster = async (eventDetails: any, options: GenerateImageOptions = {}) => {
    const prompt = `Concert poster featuring bold typography and dynamic stage lighting effects`;
    return generateImage(prompt, {
      ...options,
      type: 'poster',
      size: options.size || '1024x1792', // Portrait format for posters
      event: eventDetails
    });
  };

  const generateVenueBanner = async (venueDetails: any, options: GenerateImageOptions = {}) => {
    const prompt = `Professional venue banner with stage and audience atmosphere`;
    return generateImage(prompt, {
      ...options,
      type: 'banner',
      size: options.size || '1792x1024', // Landscape format for banners
      venue: venueDetails
    });
  };

  const generateTicketDesign = async (ticketDetails: any, options: GenerateImageOptions = {}) => {
    const prompt = `Elegant concert ticket design with premium aesthetics and clear layout`;
    return generateImage(prompt, {
      ...options,
      type: 'ticket',
      size: options.size || '1792x1024', // Landscape format for tickets
      event: ticketDetails
    });
  };

  const generateEventFlyer = async (eventDetails: any, options: GenerateImageOptions = {}) => {
    const prompt = `Compact event flyer with essential information and engaging visuals`;
    return generateImage(prompt, {
      ...options,
      type: 'flyer',
      size: options.size || '1024x1024', // Square format for flyers
      event: eventDetails
    });
  };

  const generateAgendaInfographic = async (agendaData: any, options: GenerateImageOptions = {}) => {
    const prompt = `Professional timeline infographic with clear information hierarchy and modern design`;
    return generateImage(prompt, {
      ...options,
      type: 'infographic',
      size: options.size || '1024x1792', // Portrait format for infographics
      event: agendaData
    });
  };

  const generateSocialMediaPost = async (postDetails: any, options: GenerateImageOptions = {}) => {
    const prompt = `Engaging social media post with vibrant colors and mobile-optimized design`;
    return generateImage(prompt, {
      ...options,
      type: 'social',
      size: options.size || '1024x1024', // Square format for social media
      event: postDetails
    });
  };

  // Enhanced data analysis with specific analysis types
  const analyzeData = async (data: any, question: string, options: AnalyzeDataOptions = {}) => {
    const { analysisType = 'insights' } = options;
    setIsProcessing(true);
    
    try {
      if (!import.meta.env.VITE_OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
      }

      const analysisPrompts: Record<string, string> = {
        summary: "Provide a concise summary of the key findings in this data.",
        trends: "Identify trends, patterns, and changes over time in this data.",
        insights: "Generate actionable insights and recommendations based on this data.",
        recommendations: "Provide specific, actionable recommendations for improvement based on this data."
      };

      const systemMessage = `You are an expert data analyst for The Train Station music venue. ${analysisPrompts[analysisType]} Focus on venue operations, financial performance, and customer insights.`;
      
      const response = await openai.chat.completions.create({
        model: "o4-mini", // Current 2025 reasoning model - best for data analysis
        messages: [
          {
            role: "system",
            content: systemMessage
          },
          {
            role: "user",
            content: `Data: ${JSON.stringify(data, null, 2)}\n\nQuestion: ${question}`
          }
        ],
        max_tokens: 800,
        temperature: 0.3, // Lower temperature for more consistent analysis
      });
      
      return response.choices[0].message.content || '';
    } catch (error) {
      console.error('AI data analysis error:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  // Specialized marketing content generation
  const generateMarketingContent = async (type: 'social' | 'email' | 'poster' | 'description', details: any) => {
    setIsProcessing(true);
    
    try {
      const contentPrompts = {
        social: `Create an engaging social media post for ${details.eventName || 'an event'} at The Train Station. Include hashtags and compelling call-to-action.`,
        email: `Write a professional email announcing ${details.eventName || 'an event'} to our venue newsletter subscribers.`,
        poster: `Create descriptive text for an event poster for ${details.eventName || 'an event'} including key details and visual elements.`,
        description: `Write a compelling event description for ${details.eventName || 'an event'} for our website and promotional materials.`
      };

      const content = await generateContent(contentPrompts[type], { 
        maxTokens: 300, 
        temperature: 0.8,
        useContext: false 
      });
      
      return content;
    } finally {
      setIsProcessing(false);
    }
  };

  // Specialized financial insights
  const generateFinancialInsights = async (financialData: any) => {
    return await analyzeData(financialData, "What are the key financial insights and recommendations for venue performance?", {
      analysisType: 'insights'
    });
  };

  // Event recommendations based on user preferences
  const generateEventRecommendations = async (preferences: any, eventHistory: any) => {
    setIsProcessing(true);
    
    try {
      const prompt = `Based on customer preferences: ${JSON.stringify(preferences)} and event history: ${JSON.stringify(eventHistory)}, recommend upcoming events and marketing strategies for The Train Station venue.`;
      
      const content = await generateContent(prompt, { 
        maxTokens: 400, 
        temperature: 0.6,
        useContext: false 
      });
      
      return content;
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AIContext.Provider
      value={{
        isProcessing,
        generateContent,
        generateImage,
        generateEventPoster,
        generateVenueBanner,
        generateTicketDesign,
        generateEventFlyer,
        generateAgendaInfographic,
        generateSocialMediaPost,
        analyzeData,
        generateMarketingContent,
        generateFinancialInsights,
        generateEventRecommendations,
        clearConversationHistory,
        conversationHistory,
        aiPersonality,
        setAiPersonality,
      }}
    >
      {children}
    </AIContext.Provider>
  );
};