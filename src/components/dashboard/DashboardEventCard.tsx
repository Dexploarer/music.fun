import React, { memo, useMemo } from 'react';
import { Clock, MapPin, ChevronRight } from 'lucide-react';
import { format, isToday, isTomorrow, differenceInDays } from 'date-fns';

// Enhanced event card component
interface EventCardProps {
  event: any;
  onViewDetails: (id: string) => void;
}

export const DashboardEventCard: React.FC<EventCardProps> = memo(({ event, onViewDetails }) => {
  // Memoize calculations
  const { eventDate, dateLabel, ticketSalesPercentage } = useMemo(() => {
    const eventDate = new Date(event.date);
    const daysUntil = differenceInDays(eventDate, new Date());
    
    const getDateLabel = () => {
      if (isToday(eventDate)) return 'Today';
      if (isTomorrow(eventDate)) return 'Tomorrow';
      if (daysUntil > 0) return `In ${daysUntil} days`;
      return format(eventDate, 'MMM d, yyyy');
    };

    const ticketSalesPercentage = ((event.tickets_sold || 0) / (event.total_capacity || 1)) * 100;

    return {
      eventDate,
      dateLabel: getDateLabel(),
      ticketSalesPercentage
    };
  }, [event.date, event.tickets_sold, event.total_capacity]);

  const handleViewDetails = useMemo(() => {
    return (e: React.MouseEvent) => {
      e.stopPropagation();
      onViewDetails(event.id);
    };
  }, [event.id, onViewDetails]);

  const eventImageSrc = useMemo(() => {
    return event.image || "https://images.pexels.com/photos/2747446/pexels-photo-2747446.jpeg?auto=compress&cs=tinysrgb&w=400";
  }, [event.image]);

  const eventTime = useMemo(() => {
    return format(eventDate, 'h:mm a');
  }, [eventDate]);

  const venueDisplay = useMemo(() => {
    return event.venue || 'Main Stage';
  }, [event.venue]);

  const ticketInfo = useMemo(() => {
    return `${event.tickets_sold || 0}/${event.total_capacity || 0}`;
  }, [event.tickets_sold, event.total_capacity]);

  return (
    <div className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-zinc-800 to-zinc-700 p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl border border-zinc-600/50">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <img
            src={eventImageSrc}
            alt={event.title}
            className="h-16 w-16 rounded-lg object-cover shadow-lg"
            loading="lazy"
          />
          <div className="absolute -top-1 -right-1 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-black">
            {Math.round(ticketSalesPercentage)}%
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-white truncate group-hover:text-amber-300 transition-colors">
              {event.title}
            </h3>
            <span className="text-xs text-amber-400 font-medium">{dateLabel}</span>
          </div>
          
          <div className="flex items-center text-xs text-gray-400 mb-2">
            <Clock className="h-3 w-3 mr-1" />
            <span>{eventTime}</span>
            <MapPin className="h-3 w-3 ml-3 mr-1" />
            <span>{venueDisplay}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-2 w-24 rounded-full bg-zinc-600 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                  style={{ width: `${Math.min(ticketSalesPercentage, 100)}%` }}
                ></div>
              </div>
              <span className="ml-2 text-xs text-gray-400">
                {ticketInfo}
              </span>
            </div>
            
            <button 
              onClick={handleViewDetails}
              className="flex items-center text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors"
            >
              View <ChevronRight className="h-3 w-3 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

DashboardEventCard.displayName = 'DashboardEventCard';

export default DashboardEventCard; 