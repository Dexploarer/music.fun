import React, { useState, useRef, useEffect } from 'react';
import { useAI } from '../../contexts/AIContext';
import { 
  X, 
  Send, 
  Zap, 
  Loader, 
  Settings, 
  Trash2, 
  Brain, 
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  MessageCircle,
  Sparkles,
  Copy,
  Check
} from 'lucide-react';

interface AIAssistantProps {
  open: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'text' | 'analysis' | 'recommendation';
}

interface QuickAction {
  id: string;
  label: string;
  prompt: string;
  icon: React.ReactNode;
  category: 'analysis' | 'content' | 'insights';
}

const AIAssistant: React.FC<AIAssistantProps> = ({ open, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm Rowan, your Train Station venue assistant. I can help with analytics, event planning, financial insights, and much more. How can I assist you today?",
      sender: 'ai',
      timestamp: new Date(),
      type: 'text'
    },
  ]);
  const [input, setInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { 
    generateContent, 
    isProcessing, 
    aiPersonality, 
    setAiPersonality, 
    clearConversationHistory,
    conversationHistory,
    generateFinancialInsights,
    generateMarketingContent
  } = useAI();
  const [isMobile, setIsMobile] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quick action prompts
  const quickActions: QuickAction[] = [
    {
      id: 'financial-summary',
      label: 'Financial Summary',
      prompt: 'Give me a quick financial overview of the venue including revenue trends and recommendations.',
      icon: <DollarSign className="h-4 w-4" />,
      category: 'analysis'
    },
    {
      id: 'event-analysis',
      label: 'Event Performance',
      prompt: 'Analyze recent event performance and suggest improvements for upcoming events.',
      icon: <BarChart3 className="h-4 w-4" />,
      category: 'analysis'
    },
    {
      id: 'marketing-ideas',
      label: 'Marketing Ideas',
      prompt: 'Generate creative marketing ideas for our upcoming events and social media campaigns.',
      icon: <Sparkles className="h-4 w-4" />,
      category: 'content'
    },
    {
      id: 'customer-insights',
      label: 'Customer Insights',
      prompt: 'Provide insights about our customer base and recommendations for improving customer experience.',
      icon: <Users className="h-4 w-4" />,
      category: 'insights'
    },
    {
      id: 'revenue-optimization',
      label: 'Revenue Tips',
      prompt: 'What are the best strategies to optimize revenue for our venue?',
      icon: <TrendingUp className="h-4 w-4" />,
      category: 'insights'
    },
    {
      id: 'event-planning',
      label: 'Event Planning',
      prompt: 'Help me plan an upcoming event with budget considerations and marketing strategies.',
      icon: <Calendar className="h-4 w-4" />,
      category: 'content'
    }
  ];

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', checkMobile);
    checkMobile(); // Initial check
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (messageText?: string, messageType: 'text' | 'analysis' | 'recommendation' = 'text') => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isProcessing) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: textToSend,
      sender: 'user',
      timestamp: new Date(),
      type: messageType
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setError(null);

    try {
      // Get AI response with enhanced options
      const aiResponse = await generateContent(textToSend, {
        maxTokens: 800,
        temperature: 0.7,
        useContext: true
      });
      
      // Add AI message
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
        type: messageType === 'analysis' ? 'analysis' : 'text'
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I couldn't process your request. Please try again.",
        sender: 'ai',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages((prev) => [...prev, errorMessage]);
      setError("An error occurred while processing your request. Please check your OpenAI API key configuration.");
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    handleSendMessage(action.prompt, action.category === 'analysis' ? 'analysis' : 'recommendation');
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: '1',
        content: "Conversation cleared! I'm ready to help you with a fresh start. What would you like to know?",
        sender: 'ai',
        timestamp: new Date(),
        type: 'text'
      }
    ]);
    clearConversationHistory();
  };

  const copyToClipboard = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Width of drawer depends on screen size
  const drawerWidth = isMobile ? 'w-full' : 'w-96';
  
  const drawerClasses = open
    ? 'translate-x-0 shadow-2xl'
    : 'translate-x-full';

  return (
    <div 
      className={`fixed right-0 top-0 z-50 h-screen ${drawerWidth} bg-gradient-to-b from-zinc-900 to-zinc-800 transition-transform duration-300 ease-in-out ${drawerClasses} border-l border-zinc-700`}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-zinc-700 px-4 bg-zinc-900/90 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 p-1.5">
            <Brain size={16} className="text-white" />
          </div>
          <div>
            <h2 className="font-playfair text-lg font-semibold text-white">Rowan AI</h2>
            <p className="text-xs text-gray-400 capitalize">{aiPersonality} mode</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="rounded-full p-1.5 text-gray-400 hover:bg-zinc-800 hover:text-white transition-colors"
            aria-label="AI Settings"
          >
            <Settings size={14} />
          </button>
        <button
          onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 hover:bg-zinc-800 hover:text-white transition-colors"
          aria-label="Close AI Assistant"
        >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="border-b border-zinc-700 bg-zinc-800/50 p-4">
          <div className="mb-3">
            <label className="text-sm font-medium text-gray-300 mb-2 block">AI Personality</label>
            <div className="grid grid-cols-3 gap-2">
              {['professional', 'friendly', 'analytical'].map((personality) => (
                <button
                  key={personality}
                  onClick={() => setAiPersonality(personality as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    aiPersonality === personality
                      ? 'bg-amber-600 text-white'
                      : 'bg-zinc-700 text-gray-300 hover:bg-zinc-600'
                  }`}
                >
                  {personality.charAt(0).toUpperCase() + personality.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={handleClearHistory}
            className="flex items-center justify-center w-full px-3 py-2 bg-red-600/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-600/30 transition-colors text-sm"
          >
            <Trash2 size={12} className="mr-2" />
            Clear History
          </button>
        </div>
      )}

      {/* Quick Actions */}
      <div className="border-b border-zinc-700 bg-zinc-800/30 p-3">
        <h3 className="text-xs font-medium text-gray-400 mb-2">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-2">
          {quickActions.slice(0, 4).map((action) => (
            <button
              key={action.id}
              onClick={() => handleQuickAction(action)}
              disabled={isProcessing}
              className="flex items-center justify-center p-2 bg-zinc-700/50 hover:bg-zinc-600/50 rounded-lg text-xs font-medium text-gray-300 hover:text-white transition-colors disabled:opacity-50"
            >
              {action.icon}
              <span className="ml-1 truncate">{action.label}</span>
        </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex h-[calc(100%-12rem)] flex-col overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`group flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
              <div
                className={`rounded-lg p-3 ${
              message.sender === 'user'
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white'
                    : message.type === 'analysis'
                    ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/30 text-white'
                    : 'bg-zinc-800 text-white border border-zinc-700'
            }`}
          >
                <div className="flex items-start justify-between">
                  <p className="break-words text-sm leading-relaxed flex-1">{message.content}</p>
                  {message.sender === 'ai' && (
                    <button
                      onClick={() => copyToClipboard(message.content, message.id)}
                      className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {copiedMessageId === message.id ? (
                        <Check size={12} className="text-green-400" />
                      ) : (
                        <Copy size={12} className="text-gray-400 hover:text-white" />
                      )}
                    </button>
                  )}
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="text-xs opacity-70">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  {message.type === 'analysis' && (
                    <div className="flex items-center text-xs text-blue-400">
                      <BarChart3 size={10} className="mr-1" />
                      Analysis
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 max-w-[85%]">
              <div className="flex items-center space-x-2">
                <Loader size={14} className="animate-spin text-amber-500" />
                <span className="text-sm text-gray-300">Rowan is thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="mx-4">
            <div className="rounded-lg bg-red-900/20 border border-red-800/50 p-3 text-center">
            <p className="text-sm text-red-400">{error}</p>
            <p className="text-xs text-gray-400 mt-1">Check your .env file configuration for VITE_OPENAI_API_KEY</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-zinc-700 bg-zinc-900/90 backdrop-blur-sm p-4">
        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="space-y-3">
          {/* Conversation Context Indicator */}
          {conversationHistory.length > 0 && (
            <div className="flex items-center text-xs text-gray-400">
              <MessageCircle size={10} className="mr-1" />
              <span>{conversationHistory.length} messages in context</span>
            </div>
          )}
          
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about the venue..."
                className="w-full resize-none rounded-lg border-0 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 max-h-20"
            disabled={isProcessing}
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
          />
            </div>
          <button
            type="submit"
              disabled={isProcessing || !input.trim()}
              className="flex items-center justify-center rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 px-3 py-2 text-white hover:from-amber-700 hover:to-orange-700 focus:outline-none disabled:opacity-50 transition-all"
            aria-label="Send message"
          >
              {isProcessing ? <Loader size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </div>
      </form>
      </div>
    </div>
  );
};

export default AIAssistant;