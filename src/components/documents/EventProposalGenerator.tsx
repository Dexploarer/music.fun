import React, { useState, useEffect } from 'react';
import { useDocsGen } from '../../hooks/useDocsGen';
import { FileText, Save, Loader, Download, Copy, CheckCircle, Plus, X } from 'lucide-react';

interface EventProposalGeneratorProps {
  onProposalGenerated?: (proposal: string) => void;
  defaultValues?: {
    clientName?: string;
    eventDate?: string;
    services?: string;
    cancellationPolicy?: string;
  };
}

const EventProposalGenerator: React.FC<EventProposalGeneratorProps> = ({
  onProposalGenerated,
  defaultValues
}) => {
  const [clientName, setClientName] = useState(defaultValues?.clientName || '');
  const [eventDate, setEventDate] = useState(defaultValues?.eventDate || '');
  const [services, setServices] = useState(defaultValues?.services || '');
  const [cancellationPolicy, setCancellationPolicy] = useState(
    defaultValues?.cancellationPolicy || '30-day notice required for full refund'
  );
  const [fees, setFees] = useState<Array<{ name: string; amount: string }>>([
    { name: 'Venue Rental', amount: '1000' },
    { name: 'Staff', amount: '500' }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [proposal, setProposal] = useState('');
  const [copied, setCopied] = useState(false);
  
  const { createEventProposal } = useDocsGen();

  // Reset copied state after 3 seconds
  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [copied]);

  const handleAddFee = () => {
    setFees([...fees, { name: '', amount: '' }]);
  };

  const handleRemoveFee = (index: number) => {
    setFees(fees.filter((_, i) => i !== index));
  };

  const handleFeeChange = (index: number, field: 'name' | 'amount', value: string) => {
    const updatedFees = [...fees];
    updatedFees[index][field] = value;
    setFees(updatedFees);
  };

  const handleGenerateProposal = async () => {
    if (!clientName || !eventDate || !services || fees.some(fee => !fee.name || !fee.amount)) {
      alert('Please fill in all required fields');
      return;
    }

    setIsGenerating(true);
    try {
      // Convert fees array to object for the API
      const feesObject: Record<string, number> = {};
      fees.forEach(fee => {
        if (fee.name && fee.amount) {
          feesObject[fee.name] = parseFloat(fee.amount);
        }
      });

      const result = await createEventProposal({
        client_name: clientName,
        event_details: {
          date: eventDate,
          services: services,
          fees: feesObject
        },
        cancellation_policy: cancellationPolicy
      });

      setProposal(result);
      if (onProposalGenerated) {
        onProposalGenerated(result);
      }
    } catch (error) {
      console.error('Error generating proposal:', error);
      alert('Failed to generate proposal. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyProposal = () => {
    if (!proposal) return;
    
    navigator.clipboard.writeText(proposal);
    setCopied(true);
  };

  const handleDownloadProposal = () => {
    if (!proposal) return;
    
    const blob = new Blob([proposal], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `proposal-${clientName.toLowerCase().replace(/\s+/g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const policyOptions = [
    '30-day notice required for full refund',
    'Non-refundable 50% deposit, balance due 14 days before event',
    'Full refund available up to 45 days before event, 50% refund up to 14 days before',
    'No refunds, but one-time rescheduling allowed with 14-day notice',
    'Custom policy'
  ];

  return (
    <div className="rounded-lg bg-zinc-900 p-4 sm:p-6 shadow-md">
      <div className="mb-4 flex items-center">
        <div className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 p-2">
          <FileText size={18} className="text-white" />
        </div>
        <h2 className="ml-3 text-lg font-semibold text-white">Event Proposal Generator</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="clientName" className="block text-sm font-medium text-gray-300">
              Client Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="clientName"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
              placeholder="e.g. Luna Collective"
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
              placeholder="e.g. September 15, 2025"
              required
            />
          </div>
          
          <div>
            <label htmlFor="services" className="block text-sm font-medium text-gray-300">
              Services Requested <span className="text-red-500">*</span>
            </label>
            <textarea
              id="services"
              value={services}
              onChange={(e) => setServices(e.target.value)}
              className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
              placeholder="e.g. Full venue rental, bar services, sound system, lighting"
              rows={3}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Fees <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 space-y-2">
              {fees.map((fee, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={fee.name}
                    onChange={(e) => handleFeeChange(index, 'name', e.target.value)}
                    className="block w-full rounded-l-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                    placeholder="Fee name"
                    required
                  />
                  <div className="relative flex-shrink-0">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-white">$</span>
                    <input
                      type="text"
                      value={fee.amount}
                      onChange={(e) => handleFeeChange(index, 'amount', e.target.value)}
                      className="block w-24 rounded-none border border-l-0 border-zinc-700 bg-zinc-800 pl-7 pr-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFee(index)}
                    className="inline-flex items-center justify-center rounded-r-md border border-l-0 border-zinc-700 bg-zinc-700 px-3 py-2 text-white hover:bg-zinc-600"
                    disabled={fees.length <= 1}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              
              <button
                type="button"
                onClick={handleAddFee}
                className="flex items-center text-sm text-amber-500 hover:text-amber-400"
              >
                <Plus size={14} className="mr-1" />
                Add Another Fee
              </button>
            </div>
          </div>
          
          <div>
            <label htmlFor="cancellationPolicy" className="block text-sm font-medium text-gray-300">
              Cancellation Policy
            </label>
            <select
              id="cancellationPolicy"
              value={policyOptions.includes(cancellationPolicy) ? cancellationPolicy : 'Custom policy'}
              onChange={(e) => e.target.value !== 'Custom policy' && setCancellationPolicy(e.target.value)}
              className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500"
            >
              {policyOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            
            {(!policyOptions.includes(cancellationPolicy) || cancellationPolicy === 'Custom policy') && (
              <textarea
                value={cancellationPolicy === 'Custom policy' ? '' : cancellationPolicy}
                onChange={(e) => setCancellationPolicy(e.target.value)}
                className="mt-2 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                placeholder="Enter custom cancellation policy..."
                rows={2}
              />
            )}
          </div>
          
          <div className="pt-2">
            <button
              type="button"
              onClick={handleGenerateProposal}
              disabled={isGenerating || !clientName || !eventDate || !services || fees.some(fee => !fee.name || !fee.amount)}
              className="w-full justify-center inline-flex items-center rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-700 focus:outline-none disabled:opacity-70"
            >
              {isGenerating ? (
                <>
                  <Loader size={16} className="mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText size={16} className="mr-2" />
                  Generate Proposal
                </>
              )}
            </button>
          </div>
        </div>
        
        <div>
          {proposal ? (
            <div className="rounded-lg bg-zinc-800 p-4 h-full overflow-auto relative">
              <div className="mb-2 flex justify-between items-center sticky top-0 bg-zinc-800 py-2 z-10">
                <h3 className="text-sm font-medium text-white">Generated Proposal</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={handleCopyProposal}
                    className="rounded-lg bg-zinc-700 p-1.5 text-xs text-white hover:bg-zinc-600 flex items-center"
                  >
                    {copied ? <CheckCircle size={12} className="mr-1" /> : <Copy size={12} className="mr-1" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <button
                    onClick={handleDownloadProposal}
                    className="rounded-lg bg-zinc-700 p-1.5 text-xs text-white hover:bg-zinc-600 flex items-center"
                  >
                    <Download size={12} className="mr-1" />
                    Download
                  </button>
                </div>
              </div>
              <div className="prose prose-invert prose-sm max-w-none text-gray-300">
                <div dangerouslySetInnerHTML={{ 
                  __html: proposal
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
              <p className="text-gray-400">Your event proposal will appear here</p>
              <p className="text-xs text-gray-500 mt-2">Fill in the client and event details to generate a professional proposal</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventProposalGenerator;