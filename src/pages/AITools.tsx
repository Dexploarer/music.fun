import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { FileText, Image, MessageSquare, BellRing, BarChart, Brain, Calendar, File, Send } from 'lucide-react';
import EventImageGenerator from '../components/marketing/EventImageGenerator';
import EventSummaryGenerator from '../components/reporting/EventSummaryGenerator';
import MetricAlertGenerator from '../components/alerts/MetricAlertGenerator';
import NotificationGenerator from '../components/marketing/NotificationGenerator';
import BrandMemoryManager from '../components/settings/BrandMemoryManager';
import SocialPostGenerator from '../components/marketing/SocialPostGenerator';
import EventProposalGenerator from '../components/documents/EventProposalGenerator';
import EventAgendaGenerator from '../components/documents/EventAgendaGenerator';
import Breadcrumbs, { useBreadcrumbs } from '../components/navigation/Breadcrumbs';

const AITools: React.FC = () => {
  const breadcrumbs = useBreadcrumbs();
  const [activeTab, setActiveTab] = useState('image-gen');

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbs} />
      
      <div className="flex flex-col justify-between space-y-2 sm:flex-row sm:items-center sm:space-y-0">
        <h1 className="font-playfair text-2xl sm:text-3xl font-bold tracking-tight text-white">AI Tools</h1>
        <div className="flex items-center space-x-2">
          <span className="text-xs sm:text-sm text-gray-300">Powered by OpenAI GPT-4o</span>
        </div>
      </div>

      <div className="rounded-xl bg-zinc-900 p-4 sm:p-6 shadow-lg">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            <TabsTrigger value="image-gen" className="flex items-center">
              <Image size={14} className="mr-2" />
              <span className="hidden sm:inline">Posters</span>
              <span className="sm:hidden">Images</span>
            </TabsTrigger>
            
            <TabsTrigger value="social-post" className="flex items-center">
              <Send size={14} className="mr-2" />
              <span className="hidden sm:inline">Social</span>
              <span className="sm:hidden">Social</span>
            </TabsTrigger>
            
            <TabsTrigger value="event-summary" className="flex items-center">
              <BarChart size={14} className="mr-2" />
              <span className="hidden sm:inline">Reports</span>
              <span className="sm:hidden">Reports</span>
            </TabsTrigger>
            
            <TabsTrigger value="alerts" className="flex items-center">
              <BellRing size={14} className="mr-2" />
              <span className="hidden sm:inline">Alerts</span>
              <span className="sm:hidden">Alerts</span>
            </TabsTrigger>
            
            <TabsTrigger value="notifications" className="flex items-center">
              <MessageSquare size={14} className="mr-2" />
              <span className="hidden sm:inline">Notify</span>
              <span className="sm:hidden">Notify</span>
            </TabsTrigger>
            
            <TabsTrigger value="proposals" className="flex items-center">
              <File size={14} className="mr-2" />
              <span className="hidden sm:inline">Proposals</span>
              <span className="sm:hidden">Docs</span>
            </TabsTrigger>
            
            <TabsTrigger value="agendas" className="flex items-center">
              <Calendar size={14} className="mr-2" />
              <span className="hidden sm:inline">Agendas</span>
              <span className="sm:hidden">Agenda</span>
            </TabsTrigger>
            
            <TabsTrigger value="brand-memory" className="flex items-center">
              <Brain size={14} className="mr-2" />
              <span className="hidden sm:inline">Memory</span>
              <span className="sm:hidden">Memory</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="image-gen">
            <EventImageGenerator />
          </TabsContent>
          
          <TabsContent value="social-post">
            <SocialPostGenerator />
          </TabsContent>
          
          <TabsContent value="event-summary">
            <EventSummaryGenerator />
          </TabsContent>
          
          <TabsContent value="alerts">
            <MetricAlertGenerator />
          </TabsContent>
          
          <TabsContent value="notifications">
            <NotificationGenerator />
          </TabsContent>
          
          <TabsContent value="proposals">
            <EventProposalGenerator />
          </TabsContent>
          
          <TabsContent value="agendas">
            <EventAgendaGenerator />
          </TabsContent>
          
          <TabsContent value="brand-memory">
            <BrandMemoryManager />
          </TabsContent>
        </Tabs>
      </div>

      <div className="rounded-xl bg-zinc-900 p-4 sm:p-6 shadow-lg">
        <div className="mb-4 flex items-center">
          <FileText size={18} className="mr-2 text-amber-500" />
          <h2 className="text-lg font-semibold text-white">About AI Tools</h2>
        </div>
        
        <div className="space-y-4">
          <p className="text-gray-300">
            Our AI tools help you streamline venue management tasks by leveraging the power of OpenAI's
            GPT-4o. Create professional event materials, analyze data, and communicate with your audience
            more effectively.
          </p>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 text-center">
            <div className="rounded-lg bg-zinc-800 p-4">
              <Image size={24} className="mx-auto mb-2 text-amber-500" />
              <h3 className="text-xs font-medium text-white">Posters</h3>
            </div>
            
            <div className="rounded-lg bg-zinc-800 p-4">
              <Send size={24} className="mx-auto mb-2 text-amber-500" />
              <h3 className="text-xs font-medium text-white">Social</h3>
            </div>
            
            <div className="rounded-lg bg-zinc-800 p-4">
              <BarChart size={24} className="mx-auto mb-2 text-amber-500" />
              <h3 className="text-xs font-medium text-white">Reports</h3>
            </div>
            
            <div className="rounded-lg bg-zinc-800 p-4">
              <BellRing size={24} className="mx-auto mb-2 text-amber-500" />
              <h3 className="text-xs font-medium text-white">Alerts</h3>
            </div>
            
            <div className="rounded-lg bg-zinc-800 p-4">
              <MessageSquare size={24} className="mx-auto mb-2 text-amber-500" />
              <h3 className="text-xs font-medium text-white">Notify</h3>
            </div>
            
            <div className="rounded-lg bg-zinc-800 p-4">
              <File size={24} className="mx-auto mb-2 text-amber-500" />
              <h3 className="text-xs font-medium text-white">Proposals</h3>
            </div>
            
            <div className="rounded-lg bg-zinc-800 p-4">
              <Calendar size={24} className="mx-auto mb-2 text-amber-500" />
              <h3 className="text-xs font-medium text-white">Agendas</h3>
            </div>
            
            <div className="rounded-lg bg-zinc-800 p-4">
              <Brain size={24} className="mx-auto mb-2 text-amber-500" />
              <h3 className="text-xs font-medium text-white">Memory</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AITools;