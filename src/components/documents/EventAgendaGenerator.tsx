import React, { useState, useEffect } from 'react';
import { useDocsGen } from '../../hooks/useDocsGen';
import { FileText, Calendar, Save, Loader, Download, Copy, CheckCircle, Plus, X, Clock, User } from 'lucide-react';

interface EventAgendaGeneratorProps {
  onAgendaGenerated?: (agenda: string) => void;
  defaultValues?: {
    eventName?: string;
    eventDate?: string;
  };
}

const EventAgendaGenerator: React.FC<EventAgendaGeneratorProps> = ({
  onAgendaGenerated,
  defaultValues
}) => {
  const [eventName, setEventName] = useState(defaultValues?.eventName || '');
  const [eventDate, setEventDate] = useState(defaultValues?.eventDate || '');
  const [agendaItems, setAgendaItems] = useState<Array<{time: string; activity: string; lead: string}>>([
    { time: '', activity: '', lead: '' }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [agenda, setAgenda] = useState('');
  const [copied, setCopied] = useState(false);
  
  const { createEventAgenda } = useDocsGen();

  // Reset copied state after 3 seconds
  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [copied]);

  const handleAddAgendaItem = () => {
    setAgendaItems([...agendaItems, { time: '', activity: '', lead: '' }]);
  };

  const handleRemoveAgendaItem = (index: number) => {
    setAgendaItems(agendaItems.filter((_, i) => i !== index));
  };

  const handleAgendaItemChange = (index: number, field: 'time' | 'activity' | 'lead', value: string) => {
    const updatedItems = [...agendaItems];
    updatedItems[index][field] = value;
    setAgendaItems(updatedItems);
  };

  const handleGenerateAgenda = async () => {
    if (!eventName || !eventDate || agendaItems.some(item => !item.time || !item.activity)) {
      alert('Please fill in all required fields');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await createEventAgenda({
        event_name: eventName,
        date: eventDate,
        agenda_items: agendaItems
      });

      setAgenda(result);
      if (onAgendaGenerated) {
        onAgendaGenerated(result);
      }
    } catch (error) {
      console.error('Error generating agenda:', error);
      alert('Failed to generate agenda. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyAgenda = () => {
    if (!agenda) return;
    
    navigator.clipboard.writeText(agenda);
    setCopied(true);
  };

  const handleDownloadAgenda = () => {
    if (!agenda) return;
    
    const blob = new Blob([agenda], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agenda-${eventName.toLowerCase().replace(/\s+/g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-lg bg-zinc-900 p-4 sm:p-6 shadow-md">
      <div className="mb-4 flex items-center">
        <div className="rounded-full bg-gradient-to-r from-green-500 to-teal-500 p-2">
          <Calendar size={18} className="text-white" />
        </div>
        <h2 className="ml-3 text-lg font-semibold text-white">Event Agenda Generator</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                placeholder="e.g. Summer Jazz Festival"
                required
              />
            </div>
            
            <div>
              <label htmlFor="eventDate" className="block text-sm font-medium text-gray-300">
                Event Date <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="eventDate"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                placeholder="e.g. August 15, 2025"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Agenda Items <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 space-y-3">
              {agendaItems.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2">
                  <div className="col-span-3">
                    <div className="flex items-center">
                      <Clock size={14} className="mr-2 text-gray-400 hidden sm:block" />
                      <input
                        type="text"
                        value={item.time}
                        onChange={(e) => handleAgendaItemChange(index, 'time', e.target.value)}
                        className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                        placeholder="Time"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-span-5">
                    <input
                      type="text"
                      value={item.activity}
                      onChange={(e) => handleAgendaItemChange(index, 'activity', e.target.value)}
                      className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                      placeholder="Activity"
                      required
                    />
                  </div>
                  <div className="col-span-3">
                    <div className="flex items-center">
                      <User size={14} className="mr-2 text-gray-400 hidden sm:block" />
                      <input
                        type="text"
                        value={item.lead}
                        onChange={(e) => handleAgendaItemChange(index, 'lead', e.target.value)}
                        className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                        placeholder="Lead"
                      />
                    </div>
                  </div>
                  <div className="col-span-1 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveAgendaItem(index)}
                      className="inline-flex items-center justify-center rounded-md border border-zinc-700 bg-zinc-700 p-2 text-white hover:bg-zinc-600"
                      disabled={agendaItems.length <= 1}
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={handleAddAgendaItem}
                className="flex items-center text-sm text-amber-500 hover:text-amber-400"
              >
                <Plus size={14} className="mr-1" />
                Add Agenda Item
              </button>
            </div>
          </div>
          
          <div className="pt-2">
            <button
              type="button"
              onClick={handleGenerateAgenda}
              disabled={isGenerating || !eventName || !eventDate || agendaItems.some(item => !item.time || !item.activity)}
              className="w-full justify-center inline-flex items-center rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-700 focus:outline-none disabled:opacity-70"
            >
              {isGenerating ? (
                <>
                  <Loader size={16} className="mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Calendar size={16} className="mr-2" />
                  Generate Agenda
                </>
              )}
            </button>
          </div>
        </div>
        
        <div>
          {agenda ? (
            <div className="rounded-lg bg-zinc-800 p-4 h-full overflow-auto relative">
              <div className="mb-2 flex justify-between items-center sticky top-0 bg-zinc-800 py-2 z-10">
                <h3 className="text-sm font-medium text-white">Generated Agenda</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={handleCopyAgenda}
                    className="rounded-lg bg-zinc-700 p-1.5 text-xs text-white hover:bg-zinc-600 flex items-center"
                  >
                    {copied ? <CheckCircle size={12} className="mr-1" /> : <Copy size={12} className="mr-1" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <button
                    onClick={handleDownloadAgenda}
                    className="rounded-lg bg-zinc-700 p-1.5 text-xs text-white hover:bg-zinc-600 flex items-center"
                  >
                    <Download size={12} className="mr-1" />
                    Download
                  </button>
                </div>
              </div>
              <div className="prose prose-invert prose-sm max-w-none text-gray-300">
                <div dangerouslySetInnerHTML={{ 
                  __html: agenda
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
                    // Handle tables
                    .replace(/\|(.+)\|/g, '<tr>$1</tr>')
                    .replace(/<tr>(.+)<\/tr>/g, (match) => {
                      return match.replace(/\|/g, '</td><td>').replace('</td><td>', '<td>').replace(/<\/td>$/, '</td></tr>');
                    })
                    .replace(/(<tr>.*?<\/tr>)/s, '<table class="border-collapse w-full"><thead>$1</thead><tbody>')
                    .replace(/<\/tbody>$/, '</tbody></table>')
                    .replace(/---/g, '')
                }} />
              </div>
            </div>
          ) : (
            <div className="rounded-lg bg-zinc-800 p-8 h-full flex flex-col items-center justify-center text-center">
              <Calendar size={48} className="text-zinc-700 mb-3" />
              <p className="text-gray-400">Your event agenda will appear here</p>
              <p className="text-xs text-gray-500 mt-2">Fill in the event details and add agenda items to generate a professional run-of-show</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventAgendaGenerator;