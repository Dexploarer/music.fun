import { useEffect, useState, useCallback } from 'react';
import { eventsApi, supabase } from '../lib/supabase';
import { buildSuccessResponse, buildErrorResponse, ApiClient } from '../lib/api/client';
import type { ApiResponse } from '../lib/api/types';
import {
  CreateEventSchema,
  UpdateEventSchema,
  validateEventBusinessRules,
  type CreateEventRequest,
  type UpdateEventRequest,
  type Event,
} from '../lib/api/schemas/eventSchemas';
import { 
  ValidationError, 
  AuthenticationError, 
  NotFoundError,
  logError 
} from '../lib/api/errors';

// Enhanced Event interface with API standards
export interface EnhancedEvent extends Event {
  canEdit: boolean;
  canCancel: boolean;
  canSellTickets: boolean;
  availableTickets: number;
}

// Hook state interface
interface EventsState {
  events: EnhancedEvent[];
  isLoading: boolean;
  error: string | null;
  lastFetch: Date | null;
}

/**
 * Enhanced Events hook with API standards integration
 * 
 * Features:
 * - RFC 7807 compliant error handling
 * - Input validation with Zod schemas
 * - Business rule validation
 * - Structured response format
 * - Enhanced error logging
 * - Rate limiting awareness
 */
export const useEventsEnhanced = () => {
  const [state, setState] = useState<EventsState>({
    events: [],
    isLoading: true,
    error: null,
    lastFetch: null,
  });

  const apiClient = new ApiClient();

  /**
   * Transform raw event data with business rule checks
   */
  const enhanceEvent = useCallback((event: any): EnhancedEvent => {
    const canEditResult = validateEventBusinessRules.canEdit(event);
    const canCancelResult = validateEventBusinessRules.canCancel(event);
    const canSellTicketsResult = validateEventBusinessRules.canSellTickets(event, 1);

    return {
      ...event,
      canEdit: canEditResult.valid,
      canCancel: canCancelResult.valid,
      canSellTickets: canSellTicketsResult.valid,
      availableTickets: event.totalCapacity - event.ticketsSold,
    };
  }, []);

  /**
   * Handle API errors with structured logging
   */
  const handleApiError = useCallback((error: unknown, operation: string): string => {
    const requestId = crypto.randomUUID();
    
    if (error instanceof Error) {
      logError(error, {
        operation,
        requestId,
        timestamp: new Date().toISOString(),
        source: 'useEventsEnhanced'
      });
      return error.message;
    }
    
    const fallbackMessage = `Failed to ${operation}`;
    logError(new Error(fallbackMessage), {
      operation,
      requestId,
      error: String(error),
      source: 'useEventsEnhanced'
    });
    
    return fallbackMessage;
  }, []);

  /**
   * Fetch events with enhanced error handling
   */
  const fetchEvents = useCallback(async (): Promise<ApiResponse<EnhancedEvent[]>> => {
    const requestId = crypto.randomUUID();
    
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Check authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        const authError = new AuthenticationError('Authentication required. Please log in.');
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: authError.message 
        }));
        return buildErrorResponse(authError, requestId);
      }

      // Fetch events
      const eventsData = await eventsApi.getEvents();
      
      // Transform and enhance events
      const enhancedEvents = eventsData.map(enhanceEvent);
      
      setState(prev => ({
        ...prev,
        events: enhancedEvents,
        isLoading: false,
        error: null,
        lastFetch: new Date(),
      }));

      return buildSuccessResponse(enhancedEvents, {
        requestId,
        source: 'useEventsEnhanced',
        cached: false,
      });

    } catch (error) {
      const errorMessage = handleApiError(error, 'fetch events');
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));
      
      return buildErrorResponse(
        error instanceof Error ? error : new Error(errorMessage),
        requestId
      );
    }
  }, [enhanceEvent, handleApiError]);

  /**
   * Create event with validation and enhanced error handling
   */
  const createEvent = useCallback(async (eventData: CreateEventRequest): Promise<ApiResponse<EnhancedEvent>> => {
    const requestId = crypto.randomUUID();

    try {
      // Validate input
      const validation = CreateEventSchema.safeParse(eventData);
      if (!validation.success) {
        const validationError = new ValidationError('Invalid event data', validation.error.issues);
        return buildErrorResponse(validationError, requestId);
      }

      // Create event
      const newEvent = await eventsApi.createEvent(validation.data);
      const enhancedEvent = enhanceEvent(newEvent);

      // Update local state
      setState(prev => ({
        ...prev,
        events: [...prev.events, enhancedEvent],
      }));

      return buildSuccessResponse(enhancedEvent, {
        requestId,
        source: 'useEventsEnhanced',
        operation: 'create',
      });

    } catch (error) {
      const errorMessage = handleApiError(error, 'create event');
      return buildErrorResponse(
        error instanceof Error ? error : new Error(errorMessage),
        requestId
      );
    }
  }, [enhanceEvent, handleApiError]);

  /**
   * Update event with business rule validation
   */
  const updateEvent = useCallback(async (
    id: string, 
    updates: Partial<UpdateEventRequest>
  ): Promise<ApiResponse<EnhancedEvent>> => {
    const requestId = crypto.randomUUID();

    try {
      // Find existing event
      const existingEvent = state.events.find(e => e.id === id);
      if (!existingEvent) {
        const notFoundError = new NotFoundError(`Event with ID ${id} not found`);
        return buildErrorResponse(notFoundError, requestId);
      }

      // Check business rules
      if (!existingEvent.canEdit) {
        const businessRuleError = new ValidationError('Event cannot be edited at this time');
        return buildErrorResponse(businessRuleError, requestId);
      }

      // Validate updates
      const validation = UpdateEventSchema.omit({ id: true }).safeParse(updates);
      if (!validation.success) {
        const validationError = new ValidationError('Invalid update data', validation.error.issues);
        return buildErrorResponse(validationError, requestId);
      }

      // Update event
      const updatedEvent = await eventsApi.updateEvent(id, validation.data);
      const enhancedEvent = enhanceEvent(updatedEvent);

      // Update local state
      setState(prev => ({
        ...prev,
        events: prev.events.map(e => e.id === id ? enhancedEvent : e),
      }));

      return buildSuccessResponse(enhancedEvent, {
        requestId,
        source: 'useEventsEnhanced',
        operation: 'update',
      });

    } catch (error) {
      const errorMessage = handleApiError(error, 'update event');
      return buildErrorResponse(
        error instanceof Error ? error : new Error(errorMessage),
        requestId
      );
    }
  }, [state.events, enhanceEvent, handleApiError]);

  /**
   * Cancel event with business rule validation
   */
  const cancelEvent = useCallback(async (id: string): Promise<ApiResponse<EnhancedEvent>> => {
    const requestId = crypto.randomUUID();

    try {
      // Find existing event
      const existingEvent = state.events.find(e => e.id === id);
      if (!existingEvent) {
        const notFoundError = new NotFoundError(`Event with ID ${id} not found`);
        return buildErrorResponse(notFoundError, requestId);
      }

      // Check if event can be cancelled
      if (!existingEvent.canCancel) {
        const businessRuleError = new ValidationError('Event cannot be cancelled at this time');
        return buildErrorResponse(businessRuleError, requestId);
      }

      // Cancel event
      return updateEvent(id, { status: 'cancelled' });

    } catch (error) {
      const errorMessage = handleApiError(error, 'cancel event');
      return buildErrorResponse(
        error instanceof Error ? error : new Error(errorMessage),
        requestId
      );
    }
  }, [state.events, updateEvent, handleApiError]);

  /**
   * Sell tickets with availability validation
   */
  const sellTickets = useCallback(async (
    eventId: string, 
    quantity: number
  ): Promise<ApiResponse<EnhancedEvent>> => {
    const requestId = crypto.randomUUID();

    try {
      // Find existing event
      const existingEvent = state.events.find(e => e.id === eventId);
      if (!existingEvent) {
        const notFoundError = new NotFoundError(`Event with ID ${eventId} not found`);
        return buildErrorResponse(notFoundError, requestId);
      }

      // Validate ticket quantity
      if (!Number.isInteger(quantity) || quantity <= 0) {
        const validationError = new ValidationError('Ticket quantity must be a positive integer');
        return buildErrorResponse(validationError, requestId);
      }

      // Check business rules
      const canSellResult = validateEventBusinessRules.canSellTickets(existingEvent, quantity);
      if (!canSellResult.valid) {
        const businessRuleError = new ValidationError(canSellResult.reason || 'Cannot sell tickets');
        return buildErrorResponse(businessRuleError, requestId);
      }

      // Update tickets sold
      const newTicketsSold = existingEvent.ticketsSold + quantity;
      return updateEvent(eventId, { ticketsSold: newTicketsSold });

    } catch (error) {
      const errorMessage = handleApiError(error, 'sell tickets');
      return buildErrorResponse(
        error instanceof Error ? error : new Error(errorMessage),
        requestId
      );
    }
  }, [state.events, updateEvent, handleApiError]);

  /**
   * Delete event (admin only)
   */
  const deleteEvent = useCallback(async (id: string): Promise<ApiResponse<{ deleted: boolean }>> => {
    const requestId = crypto.randomUUID();

    try {
      await eventsApi.deleteEvent(id);

      // Update local state
      setState(prev => ({
        ...prev,
        events: prev.events.filter(e => e.id !== id),
      }));

      return buildSuccessResponse({ deleted: true }, {
        requestId,
        source: 'useEventsEnhanced',
        operation: 'delete',
      });

    } catch (error) {
      const errorMessage = handleApiError(error, 'delete event');
      return buildErrorResponse(
        error instanceof Error ? error : new Error(errorMessage),
        requestId
      );
    }
  }, [handleApiError]);

  /**
   * Get event by ID with enhanced data
   */
  const getEventById = useCallback((id: string): EnhancedEvent | null => {
    return state.events.find(e => e.id === id) || null;
  }, [state.events]);

  // Initial data fetch
  useEffect(() => {
    fetchEvents();

    // Set up realtime subscription
    const subscription = supabase
      .channel('events-enhanced-changes')
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

  return {
    // State
    events: state.events,
    isLoading: state.isLoading,
    error: state.error,
    lastFetch: state.lastFetch,
    
    // Actions
    createEvent,
    updateEvent,
    cancelEvent,
    deleteEvent,
    sellTickets,
    getEventById,
    refresh: fetchEvents,
    
    // Utilities
    getTotalCapacity: () => state.events.reduce((sum, e) => sum + e.totalCapacity, 0),
    getTotalTicketsSold: () => state.events.reduce((sum, e) => sum + e.ticketsSold, 0),
    getEventsByStatus: (status: 'upcoming' | 'completed' | 'cancelled') => 
      state.events.filter(e => e.status === status),
    getAvailableTickets: () => state.events.reduce((sum, e) => sum + e.availableTickets, 0),
  };
}; 