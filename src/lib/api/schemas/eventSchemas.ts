import { z } from 'zod';

// Base Event object schema (without refinements)
const EventBaseObject = z.object({
  title: z.string()
    .min(1, 'Event title is required')
    .max(200, 'Event title must not exceed 200 characters')
    .trim(),
  
  description: z.string()
    .max(2000, 'Description must not exceed 2000 characters')
    .optional(),
  
  date: z.string()
    .refine((date) => {
      const eventDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return eventDate >= today;
    }, 'Event date must be today or in the future'),
  
  startTime: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Start time must be in HH:MM format'),
  
  endTime: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'End time must be in HH:MM format'),
  
  totalCapacity: z.number()
    .int('Capacity must be a whole number')
    .min(1, 'Capacity must be at least 1')
    .max(50000, 'Capacity cannot exceed 50,000'),
  
  ticketPrice: z.number()
    .min(0, 'Ticket price cannot be negative')
    .max(10000, 'Ticket price cannot exceed $10,000')
    .multipleOf(0.01, 'Price must be in cents (e.g., 19.99)'),
  
  artistIds: z.array(z.string().uuid('Invalid artist ID format'))
    .optional()
    .default([]),
  
  genre: z.string()
    .max(50, 'Genre must not exceed 50 characters')
    .optional(),
  
  image: z.string()
    .url('Image must be a valid URL')
    .optional(),
  
  status: z.enum(['upcoming', 'completed', 'cancelled'])
    .optional()
    .default('upcoming'),
});

// Base Event Schema with refinements
export const EventBaseSchema = EventBaseObject
.refine((data) => {
  // Business rule: End time must be after start time
  const [startHour, startMin] = data.startTime.split(':').map(Number);
  const [endHour, endMin] = data.endTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  return endMinutes > startMinutes;
}, {
  message: 'End time must be after start time',
  path: ['endTime']
})
.refine((data) => {
  // Business rule: Event duration should be reasonable (15 minutes to 12 hours)
  const [startHour, startMin] = data.startTime.split(':').map(Number);
  const [endHour, endMin] = data.endTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  const duration = endMinutes - startMinutes;
  
  return duration >= 15 && duration <= 720; // 15 minutes to 12 hours
}, {
  message: 'Event duration must be between 15 minutes and 12 hours',
  path: ['endTime']
});

// Create Event Schema - use the base object instead of refined schema
export const CreateEventSchema = EventBaseObject.extend({
  // Additional validations for event creation
  ticketsSold: z.number()
    .int('Tickets sold must be a whole number')
    .min(0, 'Tickets sold cannot be negative')
    .optional()
    .default(0),
})
.refine((data) => {
  // Business rule: End time must be after start time
  const [startHour, startMin] = data.startTime.split(':').map(Number);
  const [endHour, endMin] = data.endTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  return endMinutes > startMinutes;
}, {
  message: 'End time must be after start time',
  path: ['endTime']
})
.refine((data) => {
  // Business rule: Event duration should be reasonable (15 minutes to 12 hours)
  const [startHour, startMin] = data.startTime.split(':').map(Number);
  const [endHour, endMin] = data.endTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  const duration = endMinutes - startMinutes;
  
  return duration >= 15 && duration <= 720; // 15 minutes to 12 hours
}, {
  message: 'Event duration must be between 15 minutes and 12 hours',
  path: ['endTime']
})
.refine((data) => {
  // Business rule: Tickets sold cannot exceed capacity
  const ticketsSold = data.ticketsSold || 0;
  return ticketsSold <= data.totalCapacity;
}, {
  message: 'Tickets sold cannot exceed total capacity',
  path: ['ticketsSold']
});

// Update Event Schema - use partial of base object
export const UpdateEventSchema = EventBaseObject.partial().extend({
  id: z.string().uuid('Invalid event ID format'),
  ticketsSold: z.number()
    .int('Tickets sold must be a whole number')
    .min(0, 'Tickets sold cannot be negative')
    .optional(),
})
.refine((data) => {
  // Only validate capacity vs tickets sold if both are provided
  if (data.ticketsSold !== undefined && data.totalCapacity !== undefined) {
    return data.ticketsSold <= data.totalCapacity;
  }
  return true;
}, {
  message: 'Tickets sold cannot exceed total capacity',
  path: ['ticketsSold']
})
.refine((data) => {
  // Only validate time logic if both times are provided
  if (data.startTime && data.endTime) {
    const [startHour, startMin] = data.startTime.split(':').map(Number);
    const [endHour, endMin] = data.endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    return endMinutes > startMinutes;
  }
  return true;
}, {
  message: 'End time must be after start time',
  path: ['endTime']
});

// Event Query Schema (for filtering and pagination)
export const EventQuerySchema = z.object({
  limit: z.number()
    .int('Limit must be a whole number')
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .optional()
    .default(20),
  
  offset: z.number()
    .int('Offset must be a whole number')
    .min(0, 'Offset cannot be negative')
    .optional()
    .default(0),
  
  status: z.enum(['upcoming', 'completed', 'cancelled'])
    .optional(),
  
  genre: z.string()
    .max(50, 'Genre filter must not exceed 50 characters')
    .optional(),
  
  artistId: z.string()
    .uuid('Invalid artist ID format')
    .optional(),
  
  dateFrom: z.string()
    .refine((date) => !isNaN(Date.parse(date)), 'Invalid date format')
    .optional(),
  
  dateTo: z.string()
    .refine((date) => !isNaN(Date.parse(date)), 'Invalid date format')
    .optional(),
  
  search: z.string()
    .max(100, 'Search term must not exceed 100 characters')
    .optional(),
})
.refine((data) => {
  // Business rule: dateTo must be after dateFrom
  if (data.dateFrom && data.dateTo) {
    return new Date(data.dateTo) >= new Date(data.dateFrom);
  }
  return true;
}, {
  message: 'End date must be after or equal to start date',
  path: ['dateTo']
});

// Event ID Parameter Schema
export const EventIdSchema = z.object({
  id: z.string().uuid('Invalid event ID format'),
});

// TypeScript types derived from schemas
export type CreateEventRequest = z.infer<typeof CreateEventSchema>;
export type UpdateEventRequest = z.infer<typeof UpdateEventSchema>;
export type EventQueryRequest = z.infer<typeof EventQuerySchema>;
export type EventIdRequest = z.infer<typeof EventIdSchema>;

// Enhanced Event type (what we return from API)
export interface Event {
  id: string;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  artistIds: string[];
  ticketsSold: number;
  totalCapacity: number;
  ticketPrice: number;
  status: 'upcoming' | 'completed' | 'cancelled';
  image?: string;
  genre?: string;
  createdAt: string;
  updatedAt: string;
  // Enhanced fields
  revenue?: {
    tickets: number;
    bar: number;
    merchandise: number;
    other: number;
  };
  expenses?: {
    artist: number;
    venue: number;
    marketing: number;
    other: number;
  };
  artists?: Array<{
    id: string;
    name: string;
    genre: string;
  }>;
}

// Business rule validation utilities
export const validateEventBusinessRules = {
  /**
   * Check if an event can be cancelled
   */
  canCancel: (event: Event): { valid: boolean; reason?: string } => {
    const eventDate = new Date(event.date);
    const now = new Date();
    
    if (event.status === 'cancelled') {
      return { valid: false, reason: 'Event is already cancelled' };
    }
    
    if (event.status === 'completed') {
      return { valid: false, reason: 'Cannot cancel a completed event' };
    }
    
    if (eventDate <= now) {
      return { valid: false, reason: 'Cannot cancel an event that has already started' };
    }
    
    return { valid: true };
  },

  /**
   * Check if tickets can be sold for an event
   */
  canSellTickets: (event: Event, quantity: number): { valid: boolean; reason?: string } => {
    if (event.status === 'cancelled') {
      return { valid: false, reason: 'Cannot sell tickets for a cancelled event' };
    }
    
    if (event.status === 'completed') {
      return { valid: false, reason: 'Cannot sell tickets for a completed event' };
    }
    
    const availableTickets = event.totalCapacity - event.ticketsSold;
    if (quantity > availableTickets) {
      return { 
        valid: false, 
        reason: `Only ${availableTickets} tickets available` 
      };
    }
    
    return { valid: true };
  },

  /**
   * Check if an event can be edited
   */
  canEdit: (event: Event): { valid: boolean; reason?: string } => {
    if (event.status === 'completed') {
      return { valid: false, reason: 'Cannot edit a completed event' };
    }
    
    const eventDate = new Date(event.date);
    const now = new Date();
    
    if (eventDate <= now && event.status !== 'cancelled') {
      return { valid: false, reason: 'Cannot edit an event that has already started' };
    }
    
    return { valid: true };
  }
}; 