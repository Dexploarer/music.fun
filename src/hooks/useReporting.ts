import { openai } from '../lib/openaiClient';

interface EventHighlightsData {
  event_name: string;
  attendance: number;
  feedback_comments: string[];
  sales_data: {
    revenue: number;
    tickets_sold: number;
    topTierSales: number;
  };
}

/**
 * Generates an executive summary report for an event
 * @param data Event data including metrics and feedback
 * @returns Markdown formatted summary report
 */
export async function summarizeEventHighlights(data: EventHighlightsData): Promise<string> {
  const prompt = `You are a professional event analyst for The Train Station venue. Create a comprehensive post-event summary report for "${data.event_name}" with the following information:

Attendance: ${data.attendance}
Revenue: $${data.sales_data.revenue}
Tickets Sold: ${data.sales_data.tickets_sold}
Premium/VIP Tickets Sold: ${data.sales_data.topTierSales}

Customer Feedback:
${data.feedback_comments.map(comment => `- "${comment}"`).join('\n')}

Structure this report with these sections:
1. Executive Summary (High-level overview with critical insights)
2. Key Metrics (Including attendance, revenue, ticket sales breakdown)
3. Audience Insights (Analysis of attendance demographics and patterns)
4. Financial Performance (Revenue analysis, comparison to expectations)
5. Customer Feedback Analysis (Key themes and sentiment analysis)
6. Actionable Recommendations (3-5 data-driven suggestions for improvement)

Use markdown formatting. Be clear, concise, and insightful. Focus on patterns, anomalies, and actionable insights. Include specific, data-driven recommendations.`;

  const res = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
  });

  return res.choices[0].message.content || '';
}

/**
 * Hook for using event reporting functionalities
 */
export const useReporting = () => {
  const generateEventSummary = async (data: EventHighlightsData) => {
    try {
      return await summarizeEventHighlights(data);
    } catch (error) {
      console.error('Error generating event summary:', error);
      throw error;
    }
  };

  return {
    generateEventSummary
  };
};