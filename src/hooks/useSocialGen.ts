import { openai } from '../lib/openaiClient';

interface SocialPostInputs {
  brand_name: string;
  trend_topic: string;
  tone: string;
}

/**
 * Generates a trending social media post based on current trends
 * @param inputs Brand and trend data
 * @returns Formatted social media post text
 */
export async function generateTrendingSocialPost(inputs: SocialPostInputs): Promise<string> {
  const { brand_name, trend_topic, tone } = inputs;
  
  const prompt = `You are a social media AI for The Train Station venue in Corbin, Kentucky. 
  
Create a single social media post related to the following:

Brand: ${brand_name}
Trending Topic: ${trend_topic}
Tone: ${tone}

Guidelines:
- Keep it under 280 characters (Twitter-friendly)
- Include 1-2 relevant hashtags
- Be attention-grabbing and engaging
- Maintain the requested tone
- Relate the trend to the music venue context when possible
- Write in a way that encourages engagement
- Make it sound authentic, not corporate

Return ONLY the social media post with no additional explanations or quotation marks.`;

  const res = await openai.chat.completions.create({
    model: "gpt-4.1-mini", // Current 2025 model for social media content
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 300
  });
  
  return res.choices[0].message.content || '';
}

/**
 * Hook for using social media content generation functionality
 */
export const useSocialGen = () => {
  const generateSocialPost = async (inputs: SocialPostInputs) => {
    try {
      return await generateTrendingSocialPost(inputs);
    } catch (error) {
      console.error('Error generating social post:', error);
      throw error;
    }
  };

  return {
    generateSocialPost
  };
};