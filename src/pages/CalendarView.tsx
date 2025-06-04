import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Filter, Search, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Breadcrumbs, { useBreadcrumbs } from '../components/navigation/Breadcrumbs';
import '../components/calendar/calendar-styles.css';

const localizer = momentLocalizer(moment);

interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  description?: string;
  venue?: string;
  genre?: string;
  ticketPrice?: number;
  status: 'upcoming' | 'completed' | 'cancelled';
  artistIds?: string[];
}

interface CalendarViewProps {}

const CalendarView: React.FC<CalendarViewProps> = () => {
  const navigate = useNavigate();
  const breadcrumbs = useBreadcrumbs();
  
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [view, setView] = useState<'month' | 'week' | 'day' | 'agenda'>('month');
  const [date, setDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGenre, setFilterGenre] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Load events from API or mock data
  useEffect(() => {
    const loadEvents = async () => {
      setIsLoading(true);
      try {
        // Mock data for demonstration
        const mockEvents: Event[] = [
          {
            id: '1',
            title: 'Blues Night with River Junction',
            start: new Date(2024, 0, 15, 19, 0), // Jan 15, 2024, 7:00 PM
            end: new Date(2024, 0, 15, 22, 0),
            description: 'An evening of authentic blues music with local favorites River Junction',
            venue: 'Main Stage',
            genre: 'Blues',
            ticketPrice: 25,
            status: 'upcoming',
            artistIds: ['1']
          },
          {
            id: '2',
            title: 'Acoustic Sunday Sessions',
            start: new Date(2024, 0, 21, 15, 0), // Jan 21, 2024, 3:00 PM
            end: new Date(2024, 0, 21, 18, 0),
            description: 'Intimate acoustic performances in our cozy setting',
            venue: 'Side Stage',
            genre: 'Folk',
            ticketPrice: 15,
            status: 'upcoming',
            artistIds: ['2', '3']
          },
          {
            id: '3',
            title: 'Country Crossroads',
            start: new Date(2024, 0, 28, 20, 0), // Jan 28, 2024, 8:00 PM
            end: new Date(2024, 0, 28, 23, 0),
            description: 'Modern country meets classic Americana',
            venue: 'Main Stage',
            genre: 'Country',
            ticketPrice: 30,
            status: 'upcoming',
            artistIds: ['4']
          },
          {
            id: '4',
            title: 'Jazz at the Station',
            start: new Date(2024, 1, 5, 19, 30), // Feb 5, 2024, 7:30 PM
            end: new Date(2024, 1, 5, 22, 30),
            description: 'Smooth jazz and sophisticated vibes',
            venue: 'Main Stage',
            genre: 'Jazz',
            ticketPrice: 35,
            status: 'upcoming',
            artistIds: ['5']
          }
        ];
        
        setEvents(mockEvents);
      } catch (error) {
        toast.error('Failed to load events');
        console.error('Error loading events:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, []);

  // Filter events based on search and filter criteria
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = filterGenre === '' || event.genre === filterGenre;
    const matchesStatus = filterStatus === '' || event.status === filterStatus;
    
    return matchesSearch && matchesGenre && matchesStatus;
  });

  // Event style getter for calendar
  const eventStyleGetter = (event: Event) => {
    let backgroundColor = '#3174ad';
    
    switch (event.genre) {
      case 'Blues':
        backgroundColor = '#1e40af'; // blue-800
        break;
      case 'Country':
        backgroundColor = '#dc2626'; // red-600
        break;
      case 'Folk':
        backgroundColor = '#059669'; // emerald-600
        break;
      case 'Jazz':
        backgroundColor = '#7c2d12'; // amber-800
        break;
      case 'Rock':
        backgroundColor = '#7c3aed'; // violet-600
        break;
      default:
        backgroundColor = '#374151'; // gray-700
    }

    if (event.status === 'cancelled') {
      backgroundColor = '#6b7280'; // gray-500
    } else if (event.status === 'completed') {
      backgroundColor = '#10b981'; // emerald-500
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  const handleSelectEvent = (event: Event) => {
    setSelectedEvent(event);
  };

  const handleSelectSlot = (slotInfo: any) => {
    // Navigate to create event with pre-selected date
    const selectedDate = moment(slotInfo.start).format('YYYY-MM-DD');
    const selectedTime = moment(slotInfo.start).format('HH:mm');
    navigate(`/events/create?date=${selectedDate}&startTime=${selectedTime}`);
  };

  const handleNavigate = (newDate: Date) => {
    setDate(newDate);
  };

  const handleViewChange = (newView: any) => {
    setView(newView);
  };

  const genres = [...new Set(events.map(event => event.genre).filter(Boolean))];
  const statuses = ['upcoming', 'completed', 'cancelled'];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span className="text-gray-400">Loading calendar...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center">
            <CalendarIcon className="h-8 w-8 mr-3 text-blue-400" />
            Event Calendar
          </h1>
          <p className="text-gray-400 mt-1">Manage and view all your venue events</p>
        </div>
        
        <button
          onClick={() => navigate('/events/create')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700/50">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Search Events
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-zinc-700/50 border border-zinc-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Search events..."
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Genre
            </label>
            <select
              value={filterGenre}
              onChange={(e) => setFilterGenre(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-700/50 border border-zinc-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Genres</option>
              {genres.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-700/50 border border-zinc-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              View
            </label>
            <select
              value={view}
              onChange={(e) => handleViewChange(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-700/50 border border-zinc-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="month">Month</option>
              <option value="week">Week</option>
              <option value="day">Day</option>
              <option value="agenda">Agenda</option>
            </select>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700/50">
        <div style={{ height: 600 }}>
          <Calendar
            localizer={localizer}
            events={filteredEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            selectable
            popup
            view={view}
            onView={handleViewChange}
            date={date}
            onNavigate={handleNavigate}
            eventPropGetter={eventStyleGetter}
            views={{
              month: true,
              week: true,
              day: true,
              agenda: true
            }}
            messages={{
              next: 'Next',
              previous: 'Previous',
              today: 'Today',
              month: 'Month',
              week: 'Week',
              day: 'Day',
              agenda: 'Agenda',
              date: 'Date',
              time: 'Time',
              event: 'Event',
              noEventsInRange: 'No events scheduled for this period.',
              showMore: (total) => `+${total} more`
            }}
            components={{
              toolbar: (toolbarProps) => (
                <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => toolbarProps.onNavigate('PREV')}
                      className="p-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <h2 className="text-xl font-semibold text-white min-w-[200px] text-center">
                      {toolbarProps.label}
                    </h2>
                    <button
                      onClick={() => toolbarProps.onNavigate('NEXT')}
                      className="p-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white transition-colors"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toolbarProps.onNavigate('TODAY')}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Today
                    </button>
                  </div>
                </div>
              )
            }}
          />
        </div>
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-800 rounded-xl p-6 max-w-md w-full border border-zinc-700">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">{selectedEvent.title}</h3>
                <p className="text-gray-400 text-sm">
                  {moment(selectedEvent.start).format('MMMM D, YYYY')}
                </p>
                <p className="text-gray-400 text-sm">
                  {moment(selectedEvent.start).format('h:mm A')} - {moment(selectedEvent.end).format('h:mm A')}
                </p>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="space-y-3">
              {selectedEvent.description && (
                <p className="text-gray-300">{selectedEvent.description}</p>
              )}
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Genre:</span>
                <span className="text-white">{selectedEvent.genre || 'N/A'}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Venue:</span>
                <span className="text-white">{selectedEvent.venue || 'Main Stage'}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Ticket Price:</span>
                <span className="text-white">
                  {selectedEvent.ticketPrice ? `$${selectedEvent.ticketPrice}` : 'Free'}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  selectedEvent.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                  selectedEvent.status === 'completed' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {selectedEvent.status.charAt(0).toUpperCase() + selectedEvent.status.slice(1)}
                </span>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg font-medium transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  navigate(`/events/${selectedEvent.id}`);
                  setSelectedEvent(null);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;