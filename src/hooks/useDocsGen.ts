import { openai } from '../lib/openaiClient';

interface EventProposalInputs {
  client_name: string;
  event_details: {
    date: string;
    services: string;
    fees: Record<string, number>;
  };
  cancellation_policy: string;
}

interface EventAgendaInputs {
  event_name: string;
  date: string;
  agenda_items: {
    time: string;
    activity: string;
    lead: string;
  }[];
}

/**
 * Generates an event proposal based on client details and requirements
 * @param inputs Client and event details
 * @returns Markdown formatted event proposal
 */
export async function generateEventProposal(inputs: EventProposalInputs): Promise<string> {
  const { client_name, event_details, cancellation_policy } = inputs;
  
  const feesString = Object.entries(event_details.fees)
    .map(([name, amount]) => `${name}: $${amount}`)
    .join('\n');
  
  const prompt = `You are a legal AI drafting assistant for The Train Station venue in Corbin, Kentucky.

Create a professional event proposal document for the following client and event details:

Client Name: ${client_name}
Event Date: ${event_details.date}
Services Requested: ${event_details.services}

Fees:
${feesString}

Cancellation Policy: ${cancellation_policy}

Format the proposal as follows:
1. Header with title "Event Proposal for [Client Name]"
2. Client information section
3. Event details section with date, time, and services
4. Pricing breakdown showing all fees
5. Terms and conditions including the cancellation policy
6. Signature section for both parties
7. Contact information for follow-up questions

Use professional but approachable language. Format in Markdown with appropriate headers and sections.`;

  const res = await openai.chat.completions.create({
    model: "gpt-4.1-mini", // Current 2025 model for document generation
    messages: [{ role: "user", content: prompt }],
    temperature: 0.5,
    max_tokens: 1500
  });
  
  return res.choices[0].message.content || '';
}

/**
 * Generates a detailed event agenda with timeline and responsibilities
 * @param inputs Event details and agenda items
 * @returns Markdown formatted agenda with table
 */
export async function generateEventAgenda(inputs: EventAgendaInputs): Promise<string> {
  const { event_name, date, agenda_items } = inputs;
  
  const agendaItemsText = agenda_items.map(item => 
    `- ${item.time}: ${item.activity} (Lead: ${item.lead})`
  ).join('\n');
  
  const prompt = `You are an AI event planner for The Train Station venue in Corbin, Kentucky.

Create a detailed run-of-show / event agenda document for the following event:

Event Name: ${event_name}
Event Date: ${date}

Agenda Items:
${agendaItemsText}

Format the agenda as a professional Markdown document with:
1. Header with event name and date
2. Brief introduction explaining the agenda's purpose
3. A formatted table with columns for:
   - Time
   - Activity
   - Lead/Responsible Person
   - Notes (add reasonable notes where appropriate)
4. Footer with contact information for the event manager

The table should be properly formatted with Markdown table syntax and aligned columns.
Add any relevant setup times, breaks, or transition periods that would make sense for the event flow.`;

  const res = await openai.chat.completions.create({
    model: "gpt-4.1-mini", // Current 2025 model for document generation
    messages: [{ role: "user", content: prompt }],
    temperature: 0.5,
    max_tokens: 1500
  });
  
  return res.choices[0].message.content || '';
}

/**
 * Hook for using document generation functionality
 */
export const useDocsGen = () => {
  const createEventProposal = async (inputs: EventProposalInputs) => {
    try {
      return await generateEventProposal(inputs);
    } catch (error) {
      console.error('Error generating event proposal:', error);
      throw error;
    }
  };

  const createEventAgenda = async (inputs: EventAgendaInputs) => {
    try {
      return await generateEventAgenda(inputs);
    } catch (error) {
      console.error('Error generating event agenda:', error);
      throw error;
    }
  };

  return {
    createEventProposal,
    createEventAgenda
  };
};