import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEvent, useEvents } from '../hooks/useEvents';
import { useEventFinances } from '../hooks/useFinances';
import { useTickets } from '../hooks/useTicketing';
import { Edit, Trash, DollarSign, Ticket, Calendar, Clock, ChevronLeft, Music, Users, Save, X, PlusCircle, MessageSquare, Star, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import AddTicketModal from '../components/tickets/AddTicketModal';
import Breadcrumbs, { useBreadcrumbs } from '../components/navigation/Breadcrumbs';

interface Artist {
  id: string;
  name: string;
  image?: string;
  genre?: string;
}

interface EventDetail {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  genre: string;
  ticketPrice: number;
  totalCapacity: number;
  ticketsSold: number;
  status: 'upcoming' | 'completed' | 'cancelled';
  image?: string;
  artists: Artist[];
  createdAt: string;
  updatedAt: string;
}

const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: event, isLoading, isError } = useEvent(id || '');
  const { updateEvent, deleteEvent } = useEvents();
  const { tickets, isLoading: isLoadingTickets, createTicket } = useTickets(id);
  const { 
    revenue, 
    expenses, 
    isLoadingRevenue, 
    isLoadingExpenses,
    updateRevenue,
    updateExpenses
  } = useEventFinances(id || '');
  const breadcrumbs = useBreadcrumbs();
  
  // State
  const [activeTab, setActiveTab] = useState<'overview' | 'tickets' | 'finances'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddTicketModal, setShowAddTicketModal] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Financial data state (moved here to follow Rules of Hooks)
  const [revenueData, setRevenueData] = useState({
    bar: revenue?.bar || 0,
    merchandise: revenue?.merchandise || 0,
    other: revenue?.other || 0
  });

  const [expensesData, setExpensesData] = useState({
    artists: expenses?.artists || 0,
    staff: expenses?.staff || 0,
    marketing: expenses?.marketing || 0,
    other: expenses?.other || 0
  });

  // Initialize form data when event data is loaded
  useEffect(() => {
    if (event && !formData) {
      setFormData({
        title: event.title,
        description: event.description || '',
        date: event.date,
        startTime: event.start_time,
        endTime: event.end_time,
        genre: event.genre || '',
        image: event.image || '',
        ticketPrice: event.ticket_price,
        totalCapacity: event.total_capacity,
        status: event.status
      });
    }
  }, [event, formData]);

  // Update financial data when revenue/expenses change
  useEffect(() => {
    if (revenue) {
      setRevenueData({
        bar: revenue.bar || 0,
        merchandise: revenue.merchandise || 0,
        other: revenue.other || 0
      });
    }
    
    if (expenses) {
      setExpensesData({
        artists: expenses.artists || 0,
        staff: expenses.staff || 0,
        marketing: expenses.marketing || 0,
        other: expenses.other || 0
      });
    }
  }, [revenue, expenses]);
  
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="mr-3 h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"></div>
        <p className="text-lg text-white">Loading event details...</p>
      </div>
    );
  }
  
  if (isError || !event) {
    return (
      <div className="rounded-xl bg-zinc-900 p-8 text-center">
        <h2 className="text-2xl font-semibold text-white">Event not found</h2>
        <p className="mt-2 text-gray-400">The event you're looking for doesn't exist or you don't have permission to view it.</p>
        <button 
          onClick={() => navigate('/ticketing')}
          className="mt-4 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
        >
          Back to Events
        </button>
      </div>
    );
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!id) return;
    
    setIsSubmitting(true);
    try {
      await updateEvent({
        id,
        updates: {
          title: formData.title,
          description: formData.description,
          date: formData.date,
          startTime: formData.startTime,
          endTime: formData.endTime,
          genre: formData.genre,
          image: formData.image,
          ticketPrice: parseFloat(formData.ticketPrice),
          totalCapacity: parseInt(formData.totalCapacity),
          status: formData.status
        }
      });
      setIsEditing(false);
      toast.success('Event updated successfully');
    } catch (error: any) {
      toast.error(`Error updating event: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    setIsSubmitting(true);
    try {
      await deleteEvent(id);
      toast.success('Event deleted successfully');
      navigate('/ticketing');
    } catch (error: any) {
      toast.error(`Error deleting event: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTicket = async (ticketData: any) => {
    if (!id) return;
    
    try {
      await createTicket({
        eventId: id,
        purchaserName: ticketData.purchaserName,
        purchaserEmail: ticketData.purchaserEmail,
        price: parseFloat(ticketData.price),
        type: ticketData.type,
        status: 'valid'
      });
      setShowAddTicketModal(false);
      toast.success('Ticket added successfully');
    } catch (error: any) {
      toast.error(`Error adding ticket: ${error.message}`);
    }
  };
  
  // Calculate financial metrics
  const calculateFinancials = () => {
    const ticketRevenue = (event.tickets_sold || 0) * event.ticket_price;
    const barRevenue = revenue?.bar || 0;
    const merchRevenue = revenue?.merchandise || 0;
    const otherRevenue = revenue?.other || 0;
    
    const artistExpenses = expenses?.artists || 0;
    const staffExpenses = expenses?.staff || 0;
    const marketingExpenses = expenses?.marketing || 0;
    const otherExpenses = expenses?.other || 0;
    
    const totalRevenue = ticketRevenue + barRevenue + merchRevenue + otherRevenue;
    const totalExpenses = artistExpenses + staffExpenses + marketingExpenses + otherExpenses;
    
    return {
      ticketRevenue,
      totalRevenue,
      totalExpenses,
      profit: totalRevenue - totalExpenses
    };
  };
  
  const financials = calculateFinancials();



  const handleRevenueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRevenueData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const handleExpensesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setExpensesData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  const handleUpdateFinancials = async () => {
    if (!id) return;
    
    try {
      await updateRevenue({
        eventId: id,
        tickets: (event.tickets_sold || 0) * event.ticket_price,
        ...revenueData
      });
      
      await updateExpenses({
        eventId: id,
        ...expensesData
      });
      
      toast.success('Financial data updated successfully');
    } catch (error: any) {
      toast.error(`Error updating financial data: ${error.message}`);
    }
  };

  const handleEdit = () => {
    navigate(`/events/${id}/edit`);
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/events/${id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Event link copied to clipboard!');
    setShowShareModal(false);
  };

  const calculateProgress = () => {
    if (!event) return 0;
    return (event.tickets_sold / event.total_capacity) * 100;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbs} />

      {/* Header */}
      <div className="flex flex-col items-start justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
        <div>
          <button 
            onClick={() => navigate('/ticketing')}
            className="mb-2 flex items-center text-sm font-medium text-gray-400 hover:text-white"
          >
            <ChevronLeft size={16} className="mr-1" />
            Back to Events
          </button>
          <h1 className="font-playfair text-3xl font-bold tracking-tight text-white">
            {isEditing ? (
              <input
                type="text"
                name="title"
                value={formData?.title || ''}
                onChange={handleInputChange}
                className="bg-transparent text-3xl font-bold focus:outline-none"
                style={{ width: '100%' }}
              />
            ) : (
              event.title
            )}
          </h1>
        </div>
        <div className="flex space-x-2">
          {!isEditing ? (
            <>
              <button 
                onClick={() => navigate(`/ticketing/${id}/reviews`)}
                className="inline-flex items-center rounded-lg bg-zinc-800 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 focus:outline-none"
              >
                <Star size={16} className="mr-2" />
                Reviews
              </button>
              <button 
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center rounded-lg bg-zinc-800 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 focus:outline-none"
              >
                <Edit size={16} className="mr-2" />
                Edit
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none"
              >
                <Trash size={16} className="mr-2" />
                Delete
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => setIsEditing(false)}
                className="inline-flex items-center rounded-lg bg-zinc-800 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 focus:outline-none"
              >
                <X size={16} className="mr-2" />
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={isSubmitting}
                className="inline-flex items-center rounded-lg bg-amber-600 px-3 py-2 text-sm font-medium text-white hover:bg-amber-700 focus:outline-none disabled:opacity-70"
              >
                <Save size={16} className="mr-2" />
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* Event Banner */}
      <div className="relative h-48 overflow-hidden rounded-xl sm:h-64">
        {isEditing ? (
          <div className="absolute inset-0 bg-zinc-800 p-4">
            <label htmlFor="image" className="block text-sm font-medium text-gray-300 mb-2">
              Event Image URL
            </label>
            <input
              type="text"
              id="image"
              name="image"
              value={formData?.image || ''}
              onChange={handleInputChange}
              className="block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
              placeholder="https://example.com/image.jpg"
            />
          </div>
        ) : (
          <>
            <img 
              src={event.image || "https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"} 
              alt={event.title} 
              className="h-full w-full object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="flex flex-col items-start justify-between space-y-2 sm:flex-row sm:items-end sm:space-y-0">
                <div>
                  <div className="mb-1 flex items-center">
                    <Calendar size={16} className="mr-1 text-amber-500" />
                    <span className="text-sm font-medium text-white">
                      {format(new Date(event.date), 'EEEE, MMMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Clock size={16} className="mr-1 text-amber-500" />
                    <span className="text-sm font-medium text-white">
                      {event.start_time.slice(0, 5)} - {event.end_time.slice(0, 5)}
                    </span>
                  </div>
                </div>
                <div className="rounded-lg bg-zinc-800/80 px-3 py-1.5">
                  <div className="flex items-center">
                    <Ticket size={16} className="mr-1 text-amber-500" />
                    <span className="text-sm font-medium text-white">
                      {event.tickets_sold || 0}/{event.total_capacity} tickets sold
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Tabs */}
      <div className="border-b border-zinc-700">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`inline-flex items-center border-b-2 py-4 text-sm font-medium ${
              activeTab === 'overview' 
                ? 'border-amber-500 text-amber-500' 
                : 'border-transparent text-gray-400 hover:border-gray-600 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`inline-flex items-center border-b-2 py-4 text-sm font-medium ${
              activeTab === 'tickets' 
                ? 'border-amber-500 text-amber-500' 
                : 'border-transparent text-gray-400 hover:border-gray-600 hover:text-white'
            }`}
          >
            Tickets
          </button>
          <button
            onClick={() => setActiveTab('finances')}
            className={`inline-flex items-center border-b-2 py-4 text-sm font-medium ${
              activeTab === 'finances' 
                ? 'border-amber-500 text-amber-500' 
                : 'border-transparent text-gray-400 hover:border-gray-600 hover:text-white'
            }`}
          >
            Finances
          </button>
        </div>
      </div>
      
      {/* Tab Content */}
      <div>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Event Details */}
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-xl bg-zinc-900 p-6 shadow-lg">
                <h2 className="mb-4 text-xl font-semibold text-white">Event Details</h2>
                
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-300">
                        Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData?.description || ''}
                        onChange={handleInputChange}
                        rows={4}
                        className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-300">
                          Date
                        </label>
                        <input
                          type="date"
                          id="date"
                          name="date"
                          value={formData?.date || ''}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="startTime" className="block text-sm font-medium text-gray-300">
                          Start Time
                        </label>
                        <input
                          type="time"
                          id="startTime"
                          name="startTime"
                          value={formData?.startTime || ''}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="endTime" className="block text-sm font-medium text-gray-300">
                          End Time
                        </label>
                        <input
                          type="time"
                          id="endTime"
                          name="endTime"
                          value={formData?.endTime || ''}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div>
                        <label htmlFor="genre" className="block text-sm font-medium text-gray-300">
                          Genre
                        </label>
                        <select
                          id="genre"
                          name="genre"
                          value={formData?.genre || ''}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                        >
                          <option value="">Select Genre</option>
                          <option value="Blues">Blues</option>
                          <option value="Bluegrass">Bluegrass</option>
                          <option value="Country">Country</option>
                          <option value="Folk">Folk</option>
                          <option value="Jazz">Jazz</option>
                          <option value="Rock">Rock</option>
                          <option value="Americana">Americana</option>
                          <option value="Pop">Pop</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="ticketPrice" className="block text-sm font-medium text-gray-300">
                          Ticket Price ($)
                        </label>
                        <input
                          type="number"
                          id="ticketPrice"
                          name="ticketPrice"
                          value={formData?.ticketPrice || ''}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                          className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="totalCapacity" className="block text-sm font-medium text-gray-300">
                          Total Capacity
                        </label>
                        <input
                          type="number"
                          id="totalCapacity"
                          name="totalCapacity"
                          value={formData?.totalCapacity || ''}
                          onChange={handleInputChange}
                          min="1"
                          className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-300">
                        Status
                      </label>
                      <select
                        id="status"
                        name="status"
                        value={formData?.status || ''}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                      >
                        <option value="upcoming">Upcoming</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-gray-300">{event.description}</p>
                    </div>
                    
                    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-sm font-medium text-gray-400">Genre</p>
                        <p className="text-white">{event.genre || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-400">Status</p>
                        <p className={`inline-flex rounded-full ${getStatusColor(event.status)}`}>
                          {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-400">Ticket Price</p>
                        <p className="text-white">${event.ticket_price}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-400">Total Capacity</p>
                        <p className="text-white">{event.total_capacity}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              <div className="rounded-xl bg-zinc-900 p-6 shadow-lg">
                <h2 className="mb-4 text-xl font-semibold text-white">Artists</h2>
                
                {event.artist_ids && event.artist_ids.length > 0 ? (
                  <div className="space-y-4">
                    {event.artist_ids.map((artist, index) => (
                      <div key={index} className="flex items-center rounded-lg bg-zinc-800 p-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-600 text-white">
                          <Music size={16} />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-white">{artist}</p>
                          <p className="text-xs text-gray-400">Performer</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg bg-zinc-800 p-4 text-center">
                    <p className="text-sm text-gray-300">No artists specified for this event</p>
                    <button className="mt-2 text-xs font-medium text-amber-500 hover:text-amber-400">
                      Add Artists
                    </button>
                  </div>
                )}
              </div>
              
              <div className="rounded-xl bg-zinc-900 p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white">Feedback & Reviews</h2>
                  <button 
                    onClick={() => navigate(`/ticketing/${id}/reviews`)}
                    className="text-sm font-medium text-amber-500 hover:text-amber-400 flex items-center"
                  >
                    <Star size={14} className="mr-1" />
                    Manage Reviews
                  </button>
                </div>
                
                <div className="rounded-lg bg-zinc-800 p-4 text-center">
                  <MessageSquare size={24} className="mx-auto text-gray-500 mb-2" />
                  <p className="text-gray-400">No reviews yet</p>
                  <p className="text-sm text-gray-500 mt-1">Collect feedback from attendees after the event</p>
                  <button 
                    onClick={() => navigate(`/ticketing/${id}/reviews`)}
                    className="mt-2 text-xs font-medium text-amber-500"
                  >
                    Set up feedback forms
                  </button>
                </div>
              </div>
            </div>
            
            {/* Event Stats */}
            <div className="space-y-6">
              <div className="rounded-xl bg-zinc-900 p-6 shadow-lg">
                <h2 className="mb-4 text-xl font-semibold text-white">Event Statistics</h2>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400">Ticket Sales</p>
                    <div className="mt-1 flex items-center justify-between">
                      <p className="text-2xl font-bold text-white">{event.tickets_sold || 0}</p>
                      <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                        {Math.round(((event.tickets_sold || 0) / event.total_capacity) * 100)}% sold
                      </span>
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full bg-zinc-800">
                      <div 
                        className="h-2 rounded-full bg-amber-500" 
                        style={{ width: `${((event.tickets_sold || 0) / event.total_capacity) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-400">Ticket Revenue</p>
                    <p className="text-2xl font-bold text-white">
                      ${financials.ticketRevenue.toLocaleString()}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-400">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-500">
                      ${financials.totalRevenue.toLocaleString()}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-400">Profit</p>
                    <p className={`text-2xl font-bold ${financials.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      ${financials.profit.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="rounded-xl bg-zinc-900 p-6 shadow-lg">
                <h2 className="mb-4 text-xl font-semibold text-white">Quick Actions</h2>
                
                <div className="space-y-3">
                  <button 
                    onClick={() => setShowAddTicketModal(true)}
                    className="flex w-full items-center justify-between rounded-lg bg-zinc-800 p-3 text-left text-white transition-all hover:bg-zinc-700"
                  >
                    <span>Add Tickets</span>
                    <Ticket size={16} />
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('finances')}
                    className="flex w-full items-center justify-between rounded-lg bg-zinc-800 p-3 text-left text-white transition-all hover:bg-zinc-700"
                  >
                    <span>Update Finances</span>
                    <DollarSign size={16} />
                  </button>
                  
                  <button 
                    onClick={() => navigate(`/ticketing/${id}/reviews`)}
                    className="flex w-full items-center justify-between rounded-lg bg-zinc-800 p-3 text-left text-white transition-all hover:bg-zinc-700"
                  >
                    <span>Manage Reviews</span>
                    <Star size={16} />
                  </button>
                  
                  <button className="flex w-full items-center justify-between rounded-lg bg-zinc-800 p-3 text-left text-white transition-all hover:bg-zinc-700">
                    <span>Contact Artists</span>
                    <Users size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Tickets Tab */}
        {activeTab === 'tickets' && (
          <div className="rounded-xl bg-zinc-900 p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Tickets</h2>
              <button 
                onClick={() => setShowAddTicketModal(true)}
                className="rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700"
              >
                <PlusCircle size={16} className="mr-2 inline-block" />
                Add Tickets
              </button>
            </div>
            
            {isLoadingTickets ? (
              <div className="flex items-center justify-center py-10">
                <div className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"></div>
                <p className="text-white">Loading tickets...</p>
              </div>
            ) : tickets.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-zinc-800">
                  <thead>
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                        Ticket ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                        Purchaser
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                        Price
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                        Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                        Purchase Date
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {tickets.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-zinc-800">
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-white">
                          {ticket.id.slice(0, 8)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                          {ticket.purchaser_name || 'N/A'}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                          ${ticket.price}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                          {ticket.type?.charAt(0).toUpperCase() + ticket.type?.slice(1) || 'General'}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            ticket.status === 'valid' ? 'bg-green-100 text-green-800' :
                            ticket.status === 'used' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {ticket.status?.charAt(0).toUpperCase() + ticket.status?.slice(1)}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                          {ticket.purchase_date ? format(new Date(ticket.purchase_date), 'MMM d, yyyy') : 'N/A'}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                          <button className="text-amber-500 hover:text-amber-400">
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-lg bg-zinc-800 p-8 text-center">
                <h3 className="text-xl font-semibold text-white">No tickets found</h3>
                <p className="mt-2 text-gray-400">No tickets have been sold for this event yet.</p>
                <button 
                  onClick={() => setShowAddTicketModal(true)}
                  className="mt-4 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
                >
                  Add Tickets
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Finances Tab */}
        {activeTab === 'finances' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Revenue */}
            <div className="rounded-xl bg-zinc-900 p-6 shadow-lg">
              <h2 className="mb-4 text-xl font-semibold text-white">Revenue</h2>
              
              {isLoadingRevenue ? (
                <div className="flex items-center justify-center py-10">
                  <div className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"></div>
                  <p className="text-white">Loading revenue data...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg bg-zinc-800 p-4">
                    <span className="text-sm text-gray-300">Tickets</span>
                    <span className="text-lg font-medium text-white">${financials.ticketRevenue.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex items-center justify-between rounded-lg bg-zinc-800 p-4">
                    <span className="text-sm text-gray-300">Bar Sales</span>
                    <input
                      type="number"
                      name="bar"
                      value={revenueData.bar}
                      onChange={handleRevenueChange}
                      min="0"
                      step="0.01"
                      className="w-32 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1 text-right text-lg font-medium text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between rounded-lg bg-zinc-800 p-4">
                    <span className="text-sm text-gray-300">Merchandise</span>
                    <input
                      type="number"
                      name="merchandise"
                      value={revenueData.merchandise}
                      onChange={handleRevenueChange}
                      min="0"
                      step="0.01"
                      className="w-32 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1 text-right text-lg font-medium text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between rounded-lg bg-zinc-800 p-4">
                    <span className="text-sm text-gray-300">Other</span>
                    <input
                      type="number"
                      name="other"
                      value={revenueData.other}
                      onChange={handleRevenueChange}
                      min="0"
                      step="0.01"
                      className="w-32 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1 text-right text-lg font-medium text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                    />
                  </div>
                  
                  <div className="h-px bg-zinc-800"></div>
                  
                  <div className="flex items-center justify-between rounded-lg bg-green-900/20 p-4">
                    <span className="text-base font-medium text-gray-300">Total Revenue</span>
                    <span className="text-xl font-bold text-green-500">
                      ${(
                        financials.ticketRevenue + 
                        parseFloat(revenueData.bar.toString()) + 
                        parseFloat(revenueData.merchandise.toString()) + 
                        parseFloat(revenueData.other.toString())
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Expenses */}
            <div className="rounded-xl bg-zinc-900 p-6 shadow-lg">
              <h2 className="mb-4 text-xl font-semibold text-white">Expenses</h2>
              
              {isLoadingExpenses ? (
                <div className="flex items-center justify-center py-10">
                  <div className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"></div>
                  <p className="text-white">Loading expenses data...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg bg-zinc-800 p-4">
                    <span className="text-sm text-gray-300">Artists</span>
                    <input
                      type="number"
                      name="artists"
                      value={expensesData.artists}
                      onChange={handleExpensesChange}
                      min="0"
                      step="0.01"
                      className="w-32 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1 text-right text-lg font-medium text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between rounded-lg bg-zinc-800 p-4">
                    <span className="text-sm text-gray-300">Staff</span>
                    <input
                      type="number"
                      name="staff"
                      value={expensesData.staff}
                      onChange={handleExpensesChange}
                      min="0"
                      step="0.01"
                      className="w-32 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1 text-right text-lg font-medium text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between rounded-lg bg-zinc-800 p-4">
                    <span className="text-sm text-gray-300">Marketing</span>
                    <input
                      type="number"
                      name="marketing"
                      value={expensesData.marketing}
                      onChange={handleExpensesChange}
                      min="0"
                      step="0.01"
                      className="w-32 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1 text-right text-lg font-medium text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between rounded-lg bg-zinc-800 p-4">
                    <span className="text-sm text-gray-300">Other</span>
                    <input
                      type="number"
                      name="other"
                      value={expensesData.other}
                      onChange={handleExpensesChange}
                      min="0"
                      step="0.01"
                      className="w-32 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1 text-right text-lg font-medium text-white focus:border-amber-500 focus:outline-none focus:ring-amber-500"
                    />
                  </div>
                  
                  <div className="h-px bg-zinc-800"></div>
                  
                  <div className="flex items-center justify-between rounded-lg bg-red-900/20 p-4">
                    <span className="text-base font-medium text-gray-300">Total Expenses</span>
                    <span className="text-xl font-bold text-red-500">
                      ${(
                        parseFloat(expensesData.artists.toString()) + 
                        parseFloat(expensesData.staff.toString()) + 
                        parseFloat(expensesData.marketing.toString()) + 
                        parseFloat(expensesData.other.toString())
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Profit Summary */}
            <div className="lg:col-span-2 rounded-xl bg-zinc-900 p-6 shadow-lg">
              <h2 className="mb-4 text-xl font-semibold text-white">Profit Summary</h2>
              
              <div className="flex items-center justify-between rounded-lg bg-zinc-800 p-6">
                <div>
                  <p className="text-base font-medium text-gray-300">Total Profit</p>
                  <p className="text-xs text-gray-400">Revenue - Expenses</p>
                </div>
                <div className="text-right">
                  <p className={`text-3xl font-bold ${
                    (
                      financials.ticketRevenue + 
                      parseFloat(revenueData.bar.toString()) + 
                      parseFloat(revenueData.merchandise.toString()) + 
                      parseFloat(revenueData.other.toString()) -
                      (
                        parseFloat(expensesData.artists.toString()) + 
                        parseFloat(expensesData.staff.toString()) + 
                        parseFloat(expensesData.marketing.toString()) + 
                        parseFloat(expensesData.other.toString())
                      )
                    ) >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    ${(
                      financials.ticketRevenue + 
                      parseFloat(revenueData.bar.toString()) + 
                      parseFloat(revenueData.merchandise.toString()) + 
                      parseFloat(revenueData.other.toString()) -
                      (
                        parseFloat(expensesData.artists.toString()) + 
                        parseFloat(expensesData.staff.toString()) + 
                        parseFloat(expensesData.marketing.toString()) + 
                        parseFloat(expensesData.other.toString())
                      )
                    ).toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <button 
                  onClick={handleUpdateFinancials}
                  className="inline-flex items-center rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 focus:outline-none"
                >
                  <Save size={16} className="mr-2" />
                  Save Financial Data
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-zinc-900 p-6 shadow-xl">
            <h3 className="mb-4 text-xl font-semibold text-white">Confirm Deletion</h3>
            <p className="mb-6 text-gray-300">
              Are you sure you want to delete <span className="font-medium text-white">{event.title}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isSubmitting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none disabled:opacity-70"
              >
                {isSubmitting ? 'Deleting...' : 'Delete Event'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Ticket Modal */}
      {showAddTicketModal && (
        <AddTicketModal
          isOpen={showAddTicketModal}
          onClose={() => setShowAddTicketModal(false)}
          onAddTicket={handleAddTicket}
          eventId={id || ''}
          defaultPrice={event.ticket_price}
        />
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-800 rounded-xl p-6 max-w-md w-full border border-zinc-700">
            <h3 className="text-xl font-bold text-white mb-4">Share Event</h3>
            <p className="text-gray-300 mb-4">Share this event with others:</p>
            <div className="space-y-3">
              <button
                onClick={handleShare}
                className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Copy Link
              </button>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetail;