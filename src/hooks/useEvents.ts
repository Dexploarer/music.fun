import { useEffect, useState, useCallback } from 'react';
import { eventsService, EventsService } from '../lib/api/services/eventsService';
import { supabase } from '../lib/supabase';
import type { Event, CreateEventRequest, UpdateEventRequest, EventQueryRequest } from '../lib/api/schemas/eventSchemas';
import type { ApiResponse } from '../lib/api/types';
import { ApiErrorBase, ValidationErrorClass } from '../lib/api/errors';

// Enhanced error handling interface
interface EventsError {
  type: 'validation' | 'authentication' | 'authorization' | 'not_found' | 'server' | 'network';
  message: string;
  details?: any;
  fieldErrors?: Record<string, string>;
}

// Enhanced loading states
interface LoadingState {
  isLoading: boolean;
  isValidating?: boolean;
  isCreating?: boolean;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

// Hook to fetch a single event by ID with enhanced error handling
export const useEvent = (id: string) => {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState<LoadingState>({ isLoading: true });
  const [error, setError] = useState<EventsError | null>(null);

  const fetchEvent = useCallback(async () => {
    if (!id) {
      setError({ type: 'validation', message: 'Event ID is required' });
      setLoading({ isLoading: false });
      return;
    }

    setLoading({ isLoading: true });
    setError(null);

    try {
      const response = await eventsService.getEventById(id);
      
      if (response.success) {
        setEvent(response.data);
        setError(null);
      } else {
        setError({
          type: 'server',
          message: response.error?.detail || 'Failed to fetch event',
          details: response.error
        });
      }
    } catch (err) {
      console.error('Error fetching event:', err);
      setError({
        type: 'network',
        message: 'Network error occurred while fetching event',
        details: err
      });
    } finally {
      setLoading({ isLoading: false });
    }
  }, [id]);

  useEffect(() => {
    fetchEvent();

    // Set up realtime subscription for this specific event
    const subscription = supabase
      .channel(`event-${id}-changes`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'events', filter: `id=eq.${id}` }, 
        () => {
          // Refresh data when changes happen
          fetchEvent();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchEvent]);

  return { 
    event, 
    loading, 
    error, 
    refetch: fetchEvent 
  };
};

// Main events hook with comprehensive CRUD operations
export const useEvents = (query?: Partial<EventQueryRequest>) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<LoadingState>({ isLoading: true });
  const [error, setError] = useState<EventsError | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(prev => ({ ...prev, isLoading: true }));
    setError(null);

    try {
      const response = await eventsService.getEvents(query);
      
      if (response.success) {
        setEvents(response.data);
        setError(null);
      } else {
        setError({
          type: 'server',
          message: response.error?.detail || 'Failed to fetch events',
          details: response.error
        });
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setError({
        type: 'network',
        message: 'Network error occurred while fetching events',
        details: err
      });
    } finally {
      setLoading(prev => ({ ...prev, isLoading: false }));
    }
  }, [query]);

  useEffect(() => {
    fetchEvents();

    // Set up realtime subscription for events
    const subscription = supabase
      .channel('events-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'events' }, 
        () => {
          // Refresh data when changes happen
          fetchEvents();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchEvents]);

  // Create event with validation feedback
  const createEvent = useCallback(async (eventData: CreateEventRequest): Promise<{ success: boolean; event?: Event; error?: EventsError }> => {
    setLoading(prev => ({ ...prev, isCreating: true }));
    setError(null);

    try {
      const response = await eventsService.createEvent(eventData);
      
      if (response.success) {
        // Add to local state optimistically
        setEvents(prev => [response.data, ...prev]);
        return { success: true, event: response.data };
      } else {
        const error: EventsError = {
          type: response.error?.status === 422 ? 'validation' : 'server',
          message: response.error?.detail || 'Failed to create event',
          details: response.error,
          fieldErrors: response.error?.errors?.reduce((acc, err) => ({
            ...acc,
            [err.field]: err.message
          }), {})
        };
        setError(error);
        return { success: false, error };
      }
    } catch (err) {
      console.error('Error creating event:', err);
      const error: EventsError = {
        type: 'network',
        message: 'Network error occurred while creating event',
        details: err
      };
      setError(error);
      return { success: false, error };
    } finally {
      setLoading(prev => ({ ...prev, isCreating: false }));
    }
  }, []);

  // Update event with validation feedback
  const updateEvent = useCallback(async (id: string, updates: Omit<UpdateEventRequest, 'id'>): Promise<{ success: boolean; event?: Event; error?: EventsError }> => {
    setLoading(prev => ({ ...prev, isUpdating: true }));
    setError(null);

    try {
      const response = await eventsService.updateEvent(id, updates);
      
      if (response.success) {
        // Update local state optimistically
        setEvents(prev => prev.map(event => 
          event.id === id ? response.data : event
        ));
        return { success: true, event: response.data };
      } else {
        const error: EventsError = {
          type: response.error?.status === 422 ? 'validation' : 'server',
          message: response.error?.detail || 'Failed to update event',
          details: response.error,
          fieldErrors: response.error?.errors?.reduce((acc, err) => ({
            ...acc,
            [err.field]: err.message
          }), {})
        };
        setError(error);
        return { success: false, error };
      }
    } catch (err) {
      console.error('Error updating event:', err);
      const error: EventsError = {
        type: 'network',
        message: 'Network error occurred while updating event',
        details: err
      };
      setError(error);
      return { success: false, error };
    } finally {
      setLoading(prev => ({ ...prev, isUpdating: false }));
    }
  }, []);

  // Delete event
  const deleteEvent = useCallback(async (id: string): Promise<{ success: boolean; error?: EventsError }> => {
    setLoading(prev => ({ ...prev, isDeleting: true }));
    setError(null);

    try {
      const response = await eventsService.deleteEvent(id);
      
      if (response.success) {
        // Remove from local state optimistically
        setEvents(prev => prev.filter(event => event.id !== id));
        return { success: true };
      } else {
        const error: EventsError = {
          type: response.error?.status === 403 ? 'authorization' : 'server',
          message: response.error?.detail || 'Failed to delete event',
          details: response.error
        };
        setError(error);
        return { success: false, error };
      }
    } catch (err) {
      console.error('Error deleting event:', err);
      const error: EventsError = {
        type: 'network',
        message: 'Network error occurred while deleting event',
        details: err
      };
      setError(error);
      return { success: false, error };
    } finally {
      setLoading(prev => ({ ...prev, isDeleting: false }));
    }
  }, []);

  // Cancel event (soft delete)
  const cancelEvent = useCallback(async (id: string, reason?: string): Promise<{ success: boolean; event?: Event; error?: EventsError }> => {
    setLoading(prev => ({ ...prev, isUpdating: true }));
    setError(null);

    try {
      const response = await eventsService.cancelEvent(id, reason);
      
      if (response.success) {
        // Update local state
        setEvents(prev => prev.map(event => 
          event.id === id ? response.data : event
        ));
        return { success: true, event: response.data };
      } else {
        const error: EventsError = {
          type: 'server',
          message: response.error?.detail || 'Failed to cancel event',
          details: response.error
        };
        setError(error);
        return { success: false, error };
      }
    } catch (err) {
      console.error('Error cancelling event:', err);
      const error: EventsError = {
        type: 'network',
        message: 'Network error occurred while cancelling event',
        details: err
      };
      setError(error);
      return { success: false, error };
    } finally {
      setLoading(prev => ({ ...prev, isUpdating: false }));
    }
  }, []);

  // Sell tickets for an event
  const sellTickets = useCallback(async (eventId: string, quantity: number): Promise<{ success: boolean; event?: Event; error?: EventsError }> => {
    setLoading(prev => ({ ...prev, isUpdating: true }));
    setError(null);

    try {
      const response = await eventsService.sellTickets(eventId, quantity);
      
      if (response.success) {
        // Update local state
        setEvents(prev => prev.map(event => 
          event.id === eventId ? response.data : event
        ));
        return { success: true, event: response.data };
      } else {
        const error: EventsError = {
          type: response.error?.status === 422 ? 'validation' : 'server',
          message: response.error?.detail || 'Failed to sell tickets',
          details: response.error
        };
        setError(error);
        return { success: false, error };
      }
    } catch (err) {
      console.error('Error selling tickets:', err);
      const error: EventsError = {
        type: 'network',
        message: 'Network error occurred while selling tickets',
        details: err
      };
      setError(error);
      return { success: false, error };
    } finally {
      setLoading(prev => ({ ...prev, isUpdating: false }));
    }
  }, []);

  return {
    events,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    cancelEvent,
    sellTickets,
    refetch: fetchEvents,
    clearError: () => setError(null)
  };
};

// Validation hook for real-time form feedback
export const useEventValidation = () => {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = useState(false);

  const validateField = useCallback(async (field: string, value: any): Promise<string | null> => {
    setIsValidating(true);
    
    try {
      // Import validation schema
      const { CreateEventSchema } = await import('../lib/api/schemas/eventSchemas');
      
      // Validate specific field
      const result = CreateEventSchema.shape[field as keyof typeof CreateEventSchema.shape]?.safeParse(value);
      
      if (result && !result.success) {
        const error = result.error.errors[0]?.message || 'Invalid value';
        setFieldErrors(prev => ({ ...prev, [field]: error }));
        return error;
      } else {
        setFieldErrors(prev => {
          const { [field]: _, ...rest } = prev;
          return rest;
        });
        return null;
      }
    } catch (err) {
      console.error('Validation error:', err);
      return 'Validation failed';
    } finally {
      setIsValidating(false);
    }
  }, []);

  const validateForm = useCallback(async (formData: any): Promise<{ valid: boolean; errors: Record<string, string> }> => {
    setIsValidating(true);
    
    try {
      const { CreateEventSchema } = await import('../lib/api/schemas/eventSchemas');
      const result = CreateEventSchema.safeParse(formData);
      
      if (!result.success) {
        const errors = result.error.errors.reduce((acc, err) => ({
          ...acc,
          [err.path.join('.')]: err.message
        }), {});
        setFieldErrors(errors);
        return { valid: false, errors };
      } else {
        setFieldErrors({});
        return { valid: true, errors: {} };
      }
    } catch (err) {
      console.error('Form validation error:', err);
      const errors = { form: 'Validation failed' };
      setFieldErrors(errors);
      return { valid: false, errors };
    } finally {
      setIsValidating(false);
    }
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setFieldErrors(prev => {
      const { [field]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setFieldErrors({});
  }, []);

  return {
    fieldErrors,
    isValidating,
    validateField,
    validateForm,
    clearFieldError,
    clearAllErrors
  };
};

// Export types for better TypeScript support
export type { Event, CreateEventRequest, UpdateEventRequest, EventQueryRequest, EventsError, LoadingState };