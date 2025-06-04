import { openai } from '../lib/openaiClient';

interface AlertData {
  metric_name: string;
  current_value: number;
  threshold: number;
  comparison: 'above' | 'below';
}

/**
 * Generates a real-time alert when metrics cross thresholds
 * @param data Alert data including metric, value, and threshold
 * @returns Formatted alert text with recommended action
 */
export async function generateRealTimeAlert(data: AlertData): Promise<string> {
  const { metric_name, current_value, threshold, comparison } = data;
  
  const prompt = `You are an AI operations assistant for The Train Station venue. 
  
Create a concise, actionable alert for the following situation:

- Metric: ${metric_name}
- Current Value: ${current_value}
- Threshold: ${threshold}
- Condition: Current value is ${comparison} threshold

The alert should:
1. Be brief and clear (maximum 2 sentences for the alert itself)
2. Include the current value and threshold
3. Provide ONE specific, actionable recommendation based on the context
4. Be appropriate for real-time notification via dashboard or messaging system

Format as a simple text alert with recommended action.`;

  const res = await openai.chat.completions.create({
    model: "gpt-4.1-mini", // Current 2025 model for alert generation
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 150
  });

  return res.choices[0].message.content || '';
}

/**
 * Hook for using real-time alerting functionality
 */
export const useAlerts = () => {
  const createAlert = async (data: AlertData) => {
    try {
      return await generateRealTimeAlert(data);
    } catch (error) {
      console.error('Error generating alert:', error);
      throw error;
    }
  };

  return {
    createAlert
  };
};