import React, { useState, useMemo } from 'react';
import { Calendar, Views, momentLocalizer, SlotInfo } from 'react-big-calendar';
import moment from 'moment';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { useEvents } from '../../hooks/useEvents';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar-styles.css';

// Set up the moment localizer properly
const localizer = momentLocalizer(moment);

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource?: any;
}

// Define genre color mapping
const genreColors: Record<string, string> = {
  'Blues': '#3b82f6', // blue-500
  'Jazz': '#8b5cf6', // purple-500
  'Country': '#f59e0b', // amber-500
  'Folk': '#10b981', // green-500
  'Rock': '#ef4444', // red-500
  'Americana': '#f97316', // orange-500
  'Bluegrass': '#84cc16', // lime-500
  'Pop': '#ec4899', // pink-500
  'Other': '#6b7280', // gray-500
  'default': '#3b82f6' // Default color (blue-500)
};

const EventCalendar: React.FC = () => {
  const navigate = useNavigate();
  const { events, isLoading } = useEvents();
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());
  const [customGenreColors, setCustomGenreColors] = useState<Record<string, string>>(genreColors);
  const [showColorSettings, setShowColorSettings] = useState(false);

  // Convert database events to calendar events
  const calendarEvents = useMemo(() => {
    return events.map(event => {
      // Parse date string into Date object
      const eventDate = new Date(event.date);
      
      // Parse time strings into Date objects
      const startTime = event.start_time.split(':');
      const startHour = parseInt(startTime[0], 10);
      const startMinute = parseInt(startTime[1], 10);
      
      const endTime = event.end_time.split(':');
      const endHour = parseInt(endTime[0], 10);
      const endMinute = parseInt(endTime[1], 10);
      
      // Create start and end Date objects
      const start = new Date(eventDate);
      start.setHours(startHour, startMinute, 0);
      
      const end = new Date(eventDate);
      end.setHours(endHour, endMinute, 0);
      
      return {
        id: event.id,
        title: event.title,
        start,
        end,
        resource: {
          status: event.status,
          genre: event.genre,
          ticketsSold: event.tickets_sold,
          totalCapacity: event.total_capacity
        }
      };
    });
  }, [events]);

  const handleSelectEvent = (event: CalendarEvent) => {
    navigate(`/ticketing/${event.id}`);
  };

  const handleSelectSlot = (slotInfo: SlotInfo) => {
    // Navigate to create event page with pre-filled date/time
    const startDate = format(slotInfo.start, 'yyyy-MM-dd');
    const startTime = format(slotInfo.start, 'HH:mm');
    const endTime = format(slotInfo.end, 'HH:mm');
    
    navigate(`/ticketing/create?date=${startDate}&startTime=${startTime}&endTime=${endTime}`);
  };

  // Update a genre color
  const handleColorChange = (genre: string, color: string) => {
    setCustomGenreColors(prev => ({
      ...prev,
      [genre]: color
    }));
  };

  // Custom event styling based on event properties
  const eventStyleGetter = (event: CalendarEvent) => {
    // Get the genre from the event resource
    const genre = event.resource?.genre || 'default';
    
    // Get the color for this genre, or use default if not found
    let backgroundColor = customGenreColors[genre] || customGenreColors.default;
    
    // Style based on status
    if (event.resource?.status) {
      switch (event.resource.status) {
        case 'completed':
          backgroundColor = '#6b7280'; // gray-500
          break;
        case 'cancelled':
          backgroundColor = '#ef4444'; // red-500
          break;
      }
    }
    
    // If tickets are selling well, make it look more prominent
    if (event.resource?.ticketsSold && event.resource?.totalCapacity) {
      const soldPercentage = event.resource.ticketsSold / event.resource.totalCapacity;
      if (soldPercentage > 0.75) {
        backgroundColor = '#10b981'; // green-500
      }
    }
    
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: '0',
        display: 'block',
        fontWeight: 500
      }
    };
  };

  // Toggle color settings panel
  const toggleColorSettings = () => {
    setShowColorSettings(!showColorSettings);
  };

  // Reset colors to defaults
  const resetColors = () => {
    setCustomGenreColors(genreColors);
  };

  return (
    <div className="h-[calc(100vh-220px)] sm:h-[calc(100vh-220px)] lg:h-[calc(100vh-220px)] rounded-xl bg-zinc-900 p-3 sm:p-6 shadow-lg">
      {isLoading ? (
        <div className="flex h-full items-center justify-center">
          <div className="mr-3 h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent"></div>
          <p className="text-lg text-white">Loading events...</p>
        </div>
      ) : (
        <>
          {/* Color settings button */}
          <div className="mb-4 flex justify-end">
            <button 
              onClick={toggleColorSettings}
              className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700"
            >
              {showColorSettings ? 'Hide Color Settings' : 'Customize Colors'}
            </button>
          </div>

          {/* Color settings panel */}
          {showColorSettings && (
            <div className="mb-4 rounded-lg bg-zinc-800 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-medium text-white">Event Genre Colors</h3>
                <button 
                  onClick={resetColors}
                  className="text-xs text-amber-500 hover:text-amber-400"
                >
                  Reset to Defaults
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {Object.keys(customGenreColors).filter(genre => genre !== 'default').map(genre => (
                  <div key={genre} className="flex flex-col space-y-1">
                    <label className="text-xs text-gray-300">{genre}</label>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="color" 
                        value={customGenreColors[genre]}
                        onChange={(e) => handleColorChange(genre, e.target.value)}
                        className="h-6 w-6 cursor-pointer rounded border border-zinc-700"
                      />
                      <div 
                        className="flex-1 rounded px-2 py-1 text-xs text-white"
                        style={{ backgroundColor: customGenreColors[genre] }}
                      >
                        {genre}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: showColorSettings ? 'calc(100% - 140px)' : '100%' }}
            views={['month', 'week', 'day', 'agenda']}
            defaultView={Views.MONTH}
            view={view as any}
            date={date}
            onView={(newView) => setView(newView)}
            onNavigate={(newDate) => setDate(newDate)}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            selectable
            eventPropGetter={eventStyleGetter}
            tooltipAccessor={(event: CalendarEvent) => {
              const soldText = event.resource?.ticketsSold 
                ? `${event.resource.ticketsSold}/${event.resource.totalCapacity} tickets sold` 
                : '';
              const genreText = event.resource?.genre ? `Genre: ${event.resource.genre}` : '';
              return `${event.title} ${soldText ? '- ' + soldText : ''} ${genreText ? '- ' + genreText : ''}`;
            }}
            components={{
              toolbar: (props) => (
                <div className="rbc-toolbar">
                  <span className="rbc-btn-group">
                    <button type="button" onClick={() => props.onNavigate('TODAY')}>
                      Today
                    </button>
                    <button type="button" onClick={() => props.onNavigate('PREV')}>
                      Back
                    </button>
                    <button type="button" onClick={() => props.onNavigate('NEXT')}>
                      Next
                    </button>
                  </span>
                  <span className="rbc-toolbar-label">{props.label}</span>
                  <span className="rbc-btn-group rbc-btn-group-views">
                    {props.views.map((name) => (
                      <button
                        key={name}
                        type="button"
                        className={view === name ? 'rbc-active' : ''}
                        onClick={() => props.onView(name)}
                      >
                        {name.charAt(0).toUpperCase() + name.slice(1)}
                      </button>
                    ))}
                  </span>
                </div>
              )
            }}
            formats={{
              dateFormat: 'dd',
              dayFormat: 'EEEE dd/MM',
              monthHeaderFormat: 'MMMM yyyy',
              dayHeaderFormat: 'EEEE, MMMM dd, yyyy',
              dayRangeHeaderFormat: ({ start, end }) => {
                return `${format(start, 'MMMM dd, yyyy')} - ${format(end, 'MMMM dd, yyyy')}`;
              }
            }}
          />
        </>
      )}
    </div>
  );
};

export default EventCalendar;