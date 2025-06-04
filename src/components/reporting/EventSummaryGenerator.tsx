import React, { useState } from 'react';
import { useReporting } from '../../hooks/useReporting';
import { BarChart, Download, FileText, Loader, RefreshCw } from 'lucide-react';

interface EventSummaryGeneratorProps {
  defaultValues?: {
    eventName?: string;
    attendance?: number;
    revenue?: number;
    ticketsSold?: number;
    premiumTickets?: number;
  };
  onSummaryGenerated?: (summary: string) => void;
}

const EventSummaryGenerator: React.FC<EventSummaryGeneratorProps> = ({
  defaultValues,
  onSummaryGenerated
}) => {
  const [eventName, setEventName] = useState(defaultValues?.eventName || '');
  const [attendance, setAttendance] = useState(defaultValues?.attendance?.toString() || '');
  const [revenue, setRevenue] = useState(defaultValues?.revenue?.toString() || '');
  const [ticketsSold, setTicketsSold] = useState(defaultValues?.ticketsSold?.toString() || '');
  const [premiumTickets, setPremiumTickets] = useState(defaultValues?.premiumTickets?.toString() || '');
  const [feedbackComments, setFeedbackComments] = useState<string[]>([]);
  const [feedbackInput, setFeedbackInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState('');

  const { generateEventSummary } = useReporting();

  const handleAddFeedback = () => {
    if (feedbackInput.trim()) {
      setFeedbackComments([...feedbackComments, feedbackInput.trim()]);
      setFeedbackInput('');
    }
  };

  const handleRemoveFeedback = (index: number) => {
    setFeedbackComments(feedbackComments.filter((_, i) => i !== index));
  };

  const handleGenerateSummary = async () => {
    if (!eventName || !attendance || !revenue || !ticketsSold) {
      alert('Please fill in all required fields');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateEventSummary({
        event_name: eventName,
        attendance: Number(attendance),
        sales_data: {
          revenue: Number(revenue),
          tickets_sold: Number(ticketsSold),
          topTierSales: Number(premiumTickets) || 0
        },
        feedback_comments: feedbackComments
      });

      setSummary(result);
      if (onSummaryGenerated) {
        onSummaryGenerated(result);
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      alert('Failed to generate summary. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!summary) return;
    
    const blob = new Blob([summary], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `event-summary-${eventName.toLowerCase().replace(/\s+/g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-lg bg-zinc-900 p-4 sm:p-6 shadow-md">
      <div className="mb-4 flex items-center">
        <div className="rounded-full bg-gradient-to-r from-blue-500 to-blue-600 p-2">
          <BarChart size={18} className="text-white" />
        </div>
        <h2 className="ml-3 text-lg font-semibold text-white">Event Summary Generator</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="eventName" className="block text-sm font-medium text-gray-300">
              Event Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="eventName"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
              placeholder="e.g. Summer Blues Festival"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="attendance" className="block text-sm font-medium text-gray-300">
                Attendance <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="attendance"
                value={attendance}
                onChange={(e) => setAttendance(e.target.value)}
                min="0"
                className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                placeholder="e.g. 250"
                required
              />
            </div>
            <div>
              <label htmlFor="revenue" className="block text-sm font-medium text-gray-300">
                Revenue ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="revenue"
                value={revenue}
                onChange={(e) => setRevenue(e.target.value)}
                min="0"
                className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                placeholder="e.g. 5000"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="ticketsSold" className="block text-sm font-medium text-gray-300">
                Tickets Sold <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="ticketsSold"
                value={ticketsSold}
                onChange={(e) => setTicketsSold(e.target.value)}
                min="0"
                className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                placeholder="e.g. 200"
                required
              />
            </div>
            <div>
              <label htmlFor="premiumTickets" className="block text-sm font-medium text-gray-300">
                Premium Tickets
              </label>
              <input
                type="number"
                id="premiumTickets"
                value={premiumTickets}
                onChange={(e) => setPremiumTickets(e.target.value)}
                min="0"
                className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                placeholder="e.g. 50"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Customer Feedback
            </label>
            <div className="mt-1 flex">
              <input
                type="text"
                value={feedbackInput}
                onChange={(e) => setFeedbackInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeedback())}
                className="block w-full rounded-l-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                placeholder="Add customer feedback"
              />
              <button
                type="button"
                onClick={handleAddFeedback}
                className="inline-flex items-center rounded-r-md border border-l-0 border-zinc-700 bg-zinc-700 px-3 py-2 font-medium text-white hover:bg-zinc-600"
              >
                Add
              </button>
            </div>
            
            {feedbackComments.length > 0 && (
              <div className="mt-2 rounded-md bg-zinc-800 p-3 max-h-40 overflow-y-auto">
                <ul className="space-y-1">
                  {feedbackComments.map((comment, index) => (
                    <li key={index} className="flex items-start justify-between text-sm">
                      <span className="text-gray-300 mr-2 flex-grow">{comment}</span>
                      <button
                        onClick={() => handleRemoveFeedback(index)}
                        className="text-gray-400 hover:text-red-400"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div className="pt-2">
            <button
              type="button"
              onClick={handleGenerateSummary}
              disabled={isGenerating || !eventName || !attendance || !revenue || !ticketsSold}
              className="w-full justify-center inline-flex items-center rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-700 focus:outline-none disabled:opacity-70"
            >
              {isGenerating ? (
                <>
                  <Loader size={16} className="mr-2 animate-spin" />
                  Generating report...
                </>
              ) : (
                <>
                  <BarChart size={16} className="mr-2" />
                  Generate Event Summary
                </>
              )}
            </button>
          </div>
        </div>
        
        <div>
          {summary ? (
            <div className="rounded-lg bg-zinc-800 p-4 h-full overflow-auto relative">
              <div className="mb-2 flex justify-between items-center sticky top-0 bg-zinc-800 py-2 z-10">
                <h3 className="text-sm font-medium text-white">Generated Summary</h3>
                <button
                  onClick={handleDownload}
                  className="rounded-lg bg-zinc-700 p-1.5 text-xs text-white hover:bg-zinc-600 flex items-center"
                >
                  <Download size={12} className="mr-1" />
                  Download MD
                </button>
              </div>
              <div className="prose prose-invert prose-sm max-w-none text-gray-300">
                <div dangerouslySetInnerHTML={{ 
                  __html: summary
                    .replace(/^#\s+/gm, '<h1>')
                    .replace(/^##\s+/gm, '<h2>')
                    .replace(/^###\s+/gm, '<h3>')
                    .replace(/^####\s+/gm, '<h4>')
                    .replace(/^#####\s+/gm, '<h5>')
                    .replace(/^######\s+/gm, '<h6>')
                    .replace(/\n\n/g, '<br/><br/>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/- (.*)/g, '<li>$1</li>')
                    .replace(/<\/h(\d)>/g, '</h$1><br/>')
                }} />
              </div>
            </div>
          ) : (
            <div className="rounded-lg bg-zinc-800 p-8 h-full flex flex-col items-center justify-center text-center">
              <FileText size={48} className="text-zinc-700 mb-3" />
              <p className="text-gray-400">Your executive summary will appear here</p>
              <p className="text-xs text-gray-500 mt-2">Fill in the event details and add any customer feedback to generate a comprehensive report</p>
              
              <div className="mt-6 bg-zinc-900 rounded-md p-3 w-full max-w-sm">
                <h3 className="text-sm font-medium text-amber-500 mb-2">Report will include:</h3>
                <ul className="text-xs text-gray-400 space-y-1 text-left">
                  <li className="flex items-center">
                    <svg className="h-3 w-3 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Executive summary with key insights
                  </li>
                  <li className="flex items-center">
                    <svg className="h-3 w-3 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Detailed metrics analysis
                  </li>
                  <li className="flex items-center">
                    <svg className="h-3 w-3 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Audience insights
                  </li>
                  <li className="flex items-center">
                    <svg className="h-3 w-3 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Customer feedback analysis
                  </li>
                  <li className="flex items-center">
                    <svg className="h-3 w-3 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Actionable recommendations
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventSummaryGenerator;