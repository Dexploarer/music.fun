import { useState } from 'react';
import { openai } from '../lib/openaiClient';
import { toast } from 'react-hot-toast';

interface ImageGenInputs {
  event_name: string;
  date: string;
  venue?: string;
  artist_list: string[];
  style?: string;
}

interface GeneratedImageResult {
  url: string | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook for generating event banner images using OpenAI
 */
export const useImageGen = () => {
  const [result, setResult] = useState<GeneratedImageResult>({
    url: null,
    isLoading: false,
    error: null
  });

  /**
   * Generates a prompt for OpenAI image generation based on event details
   */
  const generateEventBannerPrompt = async (inputs: ImageGenInputs): Promise<string> => {
    const { event_name, date, venue = 'The Train Station', artist_list, style = 'modern' } = inputs;
    
    const artistsText = artist_list.length > 0 
      ? `featuring ${artist_list.join(', ')}`
      : '';
    
    try {
      const msg = `You are a pro graphic designer AI. Generate only the JSON prompt string for creating a compelling music event poster.
      
      Create a detailed prompt for a ${style} style digital poster for the event "${event_name}" 
      on ${date} at ${venue}, ${artistsText}.
      
      The poster should have bold typography, cohesive color scheme, and a visually striking layout.
      Include specific visual elements that match the event style and music genre.
      
      Return ONLY the JSON with a single "prompt" field containing your detailed image generation prompt.`;
      
      const res = await openai.chat.completions.create({
        model: 'gpt-4.1-mini', // Current 2025 model for prompt generation
        messages: [{ role: 'user', content: msg }],
        response_format: { type: "json_object" }
      });
      
      const content = res.choices[0].message.content;
      if (!content) {
        throw new Error('Failed to generate prompt');
      }
      
      const parsedContent = JSON.parse(content);
      return parsedContent.prompt;
    } catch (error) {
      console.error('Error generating prompt:', error);
      throw error;
    }
  };

  /**
   * Generates an event banner image using OpenAI DALL-E
   */
  const generateEventBannerImage = async (inputs: ImageGenInputs): Promise<string | null> => {
    setResult({
      url: null,
      isLoading: true,
      error: null
    });

    try {
      const prompt = await generateEventBannerPrompt(inputs);
      
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        style: "vivid"
      });

      const imageUrl = response.data[0]?.url || null;
      
      setResult({
        url: imageUrl,
        isLoading: false,
        error: null
      });
      
      return imageUrl;
    } catch (error: any) {
      console.error('Error generating image:', error);
      
      setResult({
        url: null,
        isLoading: false,
        error: error.message || 'Failed to generate image'
      });
      
      toast.error('Failed to generate image. Please try again.');
      return null;
    }
  };

  return {
    generateEventBannerImage,
    imageUrl: result.url,
    isLoading: result.isLoading,
    error: result.error,
    reset: () => setResult({ url: null, isLoading: false, error: null })
  };
};