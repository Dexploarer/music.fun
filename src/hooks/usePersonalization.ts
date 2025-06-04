import { openai } from '../lib/openaiClient';

interface PersonalizationInputs {
  user_name: string;
  preferences: string[];
  upcoming_event: {
    name: string;
    date: string;
  };
}

/**
 * Generates a personalized notification based on user preferences and upcoming events
 * @param inputs User data and event details for personalization
 * @returns Personalized notification text
 */
export async function generatePersonalizedNotification(inputs: PersonalizationInputs): Promise<string> {
  const { user_name, preferences, upcoming_event } = inputs;
  
  const prompt = `You are a personalized marketing AI for The Train Station music venue. 
  
Create a brief, engaging notification message for the following user and event:

User: ${user_name}
User Preferences: ${preferences.join(', ')}
Upcoming Event: "${upcoming_event.name}" on ${upcoming_event.date}

Guidelines:
- Keep the message under 160 characters
- Be casual but compelling
- Mention one preference that aligns with the event if possible
- Include a clear call to action
- Use a warm, friendly tone as if from a friend
- Make it feel specifically tailored to this user's interests
- Do not use emojis

Return ONLY the personalized message text with no additional explanations or formatting.`;
  
  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4.1-mini", // Current 2025 model for personalized content
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7, // Slightly creative but still focused
      max_tokens: 200
    });
    
    return res.choices[0].message.content || '';
  } catch (error) {
    console.error('Error generating personalized notification:', error);
    throw error;
  }
}

/**
 * Hook for using personalization features
 */
export const usePersonalization = () => {
  const createPersonalizedMessage = async (inputs: PersonalizationInputs) => {
    try {
      return await generatePersonalizedNotification(inputs);
    } catch (error) {
      console.error('Error in personalization hook:', error);
      throw error;
    }
  };

  return {
    createPersonalizedMessage
  };
};