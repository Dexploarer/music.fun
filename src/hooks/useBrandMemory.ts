import { openai } from '../lib/openaiClient';
import { supabase } from '../lib/supabase';

interface BrandMemoryInputs {
  venue_name: string;
  brand_tone: string;
  past_events: string[];
}

export interface BrandMemorySummary {
  summary: string;
  keywords: string[];
  tone_attributes: string[];
}

// Database brand memory structure (what's actually stored in the database)
export interface DatabaseBrandMemory {
  id?: string;
  venue_name: string;
  memory_data: {
    name?: string;
    mission?: string;
    atmosphere?: string;
    features?: Record<string, string>;
    [key: string]: any;
  };
  created_at?: string;
  updated_at?: string;
}

/**
 * Stores venue brand voice, past events, and style for consistent AI responses
 * @param inputs Venue details including name, brand tone, and past events
 * @returns JSON summary of the brand memory
 */
export async function persistBrandMemory(inputs: BrandMemoryInputs): Promise<BrandMemorySummary> {
  const { venue_name, brand_tone, past_events } = inputs;
  
  const prompt = `You are a brand memory module for The Train Station venue management system.
  
Analyze and create a concise brand memory from the following information:

Venue Name: ${venue_name}
Brand Tone: ${brand_tone}
Past Events: ${past_events.join(', ')}

Your task is to:
1. Create a concise paragraph that captures the essence of the venue's brand identity
2. Extract key distinctive words/phrases that define the brand voice
3. Identify tone attributes that should be consistent across all AI-generated content

Format the response as JSON with these fields:
- summary: A concise paragraph (max 100 words) summarizing the venue's brand identity
- keywords: An array of 5-10 distinctive words or short phrases that define the brand
- tone_attributes: An array of 3-5 tone attributes (e.g. "friendly", "professional", "nostalgic")

This memory will be used to ensure all AI-generated content maintains consistent brand voice.`;

  try {
    // Check if OpenAI API key exists
    if (!import.meta.env.VITE_OPENAI_API_KEY) {
      // Return a fallback memory when API key is missing
      return getDefaultBrandMemory();
    }

    const res = await openai.chat.completions.create({
      model: "gpt-4.1-mini", // Current 2025 model for brand memory generation
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.5
    });
    
    const content = res.choices[0].message.content;
    if (!content) {
      return getDefaultBrandMemory();
    }
    
    const result: BrandMemorySummary = JSON.parse(content);
    
    // Try to store in database but don't fail if it doesn't work
    try {
      await storeBrandMemory(venue_name, result);
    } catch (e) {
      console.warn("Failed to store brand memory, but continuing with memory in memory:", e);
    }
    
    return result;
  } catch (error) {
    console.error('Error generating brand memory:', error);
    return getDefaultBrandMemory();
  }
}

/**
 * Default brand memory to use when API is unavailable
 */
function getDefaultBrandMemory(): BrandMemorySummary {
  return {
    summary: "The Train Station is a rustic, authentic music venue with Southern charm, known for intimate live performances and a welcoming atmosphere. Housed in a renovated historic train station, it embraces its railway heritage while offering exceptional acoustic experiences to music lovers and local community.",
    keywords: ["rustic", "authentic", "intimate", "acoustic", "heritage", "Southern hospitality", "railway history", "live music", "community-focused", "welcoming"],
    tone_attributes: ["warm", "genuine", "nostalgic", "conversational", "passionate"]
  };
}

/**
 * Stores brand memory in the database
 */
async function storeBrandMemory(venueName: string, memory: BrandMemorySummary): Promise<void> {
  try {
    // Check if Supabase client is properly initialized
    if (!supabase) {
      console.error('Supabase client not initialized');
      throw new Error('Supabase client not initialized');
    }
    
    // Check if we have valid credentials before making the request
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.warn('No active Supabase session, skipping database store');
      return;
    }
    
    const { error } = await supabase
      .from('brand_memory')
      .upsert(
        { 
          venue_name: venueName,
          memory_data: memory,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'venue_name' }
      );
      
    if (error) {
      console.error('Error storing brand memory:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in Supabase operation:', error);
    throw error;
  }
}

/**
 * Retrieves brand memory from the database
 */
async function retrieveBrandMemory(venueName: string): Promise<DatabaseBrandMemory | null> {
  // If venue name is empty, return null early to prevent unnecessary API calls
  if (!venueName) {
    console.log('No venue name provided, skipping brand memory retrieval');
    return null;
  }

  try {
    // Check if Supabase client is properly initialized
    if (!supabase) {
      console.warn('Supabase client not initialized, using default memory');
      return null;
    }
    
    // Check if we have valid credentials before making the request
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.warn('No active Supabase session, using default memory');
      return null;
    }
    
    // Changed from .single() to .maybeSingle() to handle cases where no rows are found
    const { data, error } = await supabase
      .from('brand_memory')
      .select('*')
      .eq('venue_name', venueName)
      .maybeSingle();
      
    if (error) {
      // Log error but return null
      console.warn('Error retrieving brand memory:', error);
      return null;
    }
    
    // Return the full database record if found
    return data as DatabaseBrandMemory || null;
  } catch (error) {
    console.warn('Error in retrieveBrandMemory:', error);
    return null;
  }
}

/**
 * Hook for using brand memory features
 */
export const useBrandMemory = () => {
  const createBrandMemory = async (inputs: BrandMemoryInputs) => {
    try {
      return await persistBrandMemory(inputs);
    } catch (error) {
      console.error('Error in brand memory hook:', error);
      return getDefaultBrandMemory();
    }
  };

  const getBrandMemory = async (venueName: string): Promise<DatabaseBrandMemory | BrandMemorySummary> => {
    if (!venueName) {
      console.log('No venue name provided to getBrandMemory');
      return getDefaultBrandMemory();
    }
    
    try {
      const databaseMemory = await retrieveBrandMemory(venueName);
      if (databaseMemory) {
        return databaseMemory;
      } else {
        // Return default memory as BrandMemorySummary if no database record found
        return getDefaultBrandMemory();
      }
    } catch (error) {
      console.warn('Error retrieving brand memory, using default:', error);
      return getDefaultBrandMemory();
    }
  };

  return {
    createBrandMemory,
    getBrandMemory
  };
};