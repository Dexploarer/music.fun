import { SupabaseAdapter, type QueryOptions } from '../adapters/supabaseAdapter';
import { validateQuery, validateParams } from '../validation';
import { UserRole } from '../auth';
import type { ApiResponse } from '../types';
import {
  CreateEventSchema,
  UpdateEventSchema,
  EventQuerySchema,
  EventIdSchema,
  validateEventBusinessRules,
  type CreateEventRequest,
  type UpdateEventRequest,
  type EventQueryRequest,
  type Event,
} from '../schemas/eventSchemas';
import { ValidationError } from '../errors';

export class EventsService {
  private adapter: SupabaseAdapter;

  constructor() {
    this.adapter = new SupabaseAdapter();
  }

  /**
   * Get all events with filtering and pagination
   */
  async getEvents(query: Partial<EventQueryRequest> = {}): Promise<ApiResponse<Event[]>> {
    // 1. Validate query parameters with defaults
    const queryWithDefaults = {
      limit: 20,
      offset: 0,
      ...query
    };
    
    const validationResult = validateQuery(EventQuerySchema, queryWithDefaults);
    if (!validationResult.success) {
      return validationResult.error;
    }

    const { limit, offset, status, genre, artistId, dateFrom, dateTo, search } = validationResult.data;

    // 2. Build query options
    const queryOptions: QueryOptions = {
      select: `
        *,
        event_revenue(*),
        event_expenses(*)
      `,
      orderBy: { column: 'date', ascending: true },
      limit,
      offset,
      filters: {}
    };

    // Apply filters
    if (status) queryOptions.filters!.status = status;
    if (genre) queryOptions.filters!.genre = genre;

    // 3. Execute query with adapter
    const response = await this.adapter.executeQuery(
      {
        tableName: 'events',
        rateLimitKey: 'events:read',
        enableLogging: true,
      },
      async () => {
        const query = this.adapter.buildQuery('events', queryOptions);
        
        // Add search filter if provided
        if (search) {
          return query.or(`title.ilike.%${search}%, description.ilike.%${search}%`);
        }
        
        return query;
      },
      'read'
    );

    if (response.success) {
      // Transform data to our Event format
      const events = Array.isArray(response.data) ? response.data : [response.data];
      const transformedEvents = events.map(event => this.transformEventFromDb(event as Record<string, unknown>));
      
      return {
        ...response,
        data: transformedEvents
      };
    }
    return response as ApiResponse<Event[]>;
  }

  /**
   * Get a single event by ID
   */
  async getEventById(id: string): Promise<ApiResponse<Event>> {
    // 1. Validate ID
    const validationResult = validateParams(EventIdSchema, { id });
    if (!validationResult.success) {
      return validationResult.error;
    }

    // 2. Execute query
    const response = await this.adapter.executeQuery(
      {
        tableName: 'events',
        rateLimitKey: 'events:read',
        enableLogging: true,
      },
      async () => {
        return this.adapter.buildQuery('events', {
          select: `
            *,
            event_revenue(*),
            event_expenses(*)
          `,
          filters: { id }
        });
      },
      'read'
    );

    if (response.success) {
      return {
        ...response,
        data: this.transformEventFromDb(response.data as Record<string, unknown>)
      };
    }
    return response as ApiResponse<Event>;
  }

  /**
   * Create a new event
   */
  async createEvent(eventData: CreateEventRequest): Promise<ApiResponse<Event>> {
    // 1. Validate input data
    const validationResult = validateParams(CreateEventSchema, eventData);
    if (!validationResult.success) {
      return validationResult.error;
    }

    const validatedData = validationResult.data;

    // 2. Execute with elevated permissions
    const response = await this.adapter.executeQuery(
      {
        tableName: 'events',
        requiredRole: UserRole.MANAGER, // Only managers can create events
        rateLimitKey: 'events:create',
        enableLogging: true,
      },
      async () => {
        // Convert to database format
        const dbData = this.adapter.toSnakeCase({
          title: validatedData.title,
          description: validatedData.description,
          date: validatedData.date,
          startTime: validatedData.startTime,
          endTime: validatedData.endTime,
          totalCapacity: validatedData.totalCapacity,
          ticketPrice: validatedData.ticketPrice,
          artistIds: validatedData.artistIds,
          ticketsSold: validatedData.ticketsSold || 0,
          genre: validatedData.genre,
          image: validatedData.image,
          status: validatedData.status || 'upcoming',
        });

        return this.adapter.buildQuery('events')
          .insert([dbData])
          .select('*');
      },
      'write'
    );

    if (response.success) {
      const eventArray = Array.isArray(response.data) ? response.data : [response.data];
      return {
        ...response,
        data: this.transformEventFromDb(eventArray[0] as Record<string, unknown>)
      };
    }
    return response as ApiResponse<Event>;
  }

  /**
   * Update an existing event
   */
  async updateEvent(id: string, updates: Omit<UpdateEventRequest, 'id'>): Promise<ApiResponse<Event>> {
    // 1. Validate ID and updates
    const idValidation = validateParams(EventIdSchema, { id });
    if (!idValidation.success) {
      return idValidation.error;
    }

    const updateValidation = validateParams(
      UpdateEventSchema.omit({ id: true }), 
      updates
    );
    if (!updateValidation.success) {
      return updateValidation.error;
    }

    // 2. Check if event exists and can be edited
    const existingEventResponse = await this.getEventById(id);
    if (!existingEventResponse.success) {
      return existingEventResponse;
    }

    const existingEvent = existingEventResponse.data;
    const businessRuleCheck = validateEventBusinessRules.canEdit(existingEvent);
    if (!businessRuleCheck.valid) {
      return {
        success: false,
        error: {
          type: 'https://docs.trainstation-dashboard.com/errors/business-rule-violation',
          title: 'Business Rule Violation',
          status: 400,
          detail: businessRuleCheck.reason || 'Cannot edit this event',
          instance: `/api/events/${id}`,
          timestamp: new Date().toISOString()
        },
        meta: {
          requestId: crypto.randomUUID(),
          source: 'validation'
        }
      };
    }

    // 3. Execute update
    const response = await this.adapter.executeQuery(
      {
        tableName: 'events',
        requiredRole: UserRole.MANAGER,
        rateLimitKey: 'events:update',
        enableLogging: true,
      },
      async () => {
        // Convert updates to database format
        const dbUpdates = this.adapter.toSnakeCase({
          ...updateValidation.data,
          updated_at: new Date().toISOString()
        });

        return this.adapter.buildQuery('events')
          .update(dbUpdates)
          .eq('id', id)
          .select('*');
      },
      'write'
    );

    if (response.success) {
      const eventArray = Array.isArray(response.data) ? response.data : [response.data];
      return {
        ...response,
        data: this.transformEventFromDb(eventArray[0] as Record<string, unknown>)
      };
    }
    return response as ApiResponse<Event>;
  }

  /**
   * Cancel an event (soft delete)
   */
  async cancelEvent(id: string, reason?: string): Promise<ApiResponse<Event>> {
    // 1. Validate ID
    const validationResult = validateParams(EventIdSchema, { id });
    if (!validationResult.success) {
      return validationResult.error;
    }

    // 2. Check if event can be cancelled
    const existingEventResponse = await this.getEventById(id);
    if (!existingEventResponse.success) {
      return existingEventResponse;
    }

    const existingEvent = existingEventResponse.data;
    const businessRuleCheck = validateEventBusinessRules.canCancel(existingEvent);
    if (!businessRuleCheck.valid) {
      return {
        success: false,
        error: {
          type: 'https://docs.trainstation-dashboard.com/errors/business-rule-violation',
          title: 'Cannot Cancel Event',
          status: 400,
          detail: businessRuleCheck.reason || 'Event cannot be cancelled',
          instance: `/api/events/${id}/cancel`,
          timestamp: new Date().toISOString()
        },
        meta: {
          requestId: crypto.randomUUID(),
          source: 'validation'
        }
      };
    }

    // 3. Update event status to cancelled
    return this.updateEvent(id, {
      status: 'cancelled',
      // Could add cancellation reason to a notes field
    });
  }

  /**
   * Delete an event (hard delete - admin only)
   */
  async deleteEvent(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
    // 1. Validate ID
    const validationResult = validateParams(EventIdSchema, { id });
    if (!validationResult.success) {
      return validationResult.error;
    }

    // 2. Execute deletion with admin permissions
    const response = await this.adapter.executeQuery(
      {
        tableName: 'events',
        requiredRole: UserRole.ADMIN, // Only admins can permanently delete
        rateLimitKey: 'events:delete',
        enableLogging: true,
      },
      async () => {
        return this.adapter.buildQuery('events')
          .delete()
          .eq('id', id);
      },
      'write'
    );

    if (response.success) {
      return {
        ...response,
        data: { deleted: true }
      };
    }
    return response as ApiResponse<{ deleted: boolean }>;
  }

  /**
   * Sell tickets for an event
   */
  async sellTickets(eventId: string, quantity: number): Promise<ApiResponse<Event>> {
    // 1. Validate inputs
    const idValidation = validateParams(EventIdSchema, { id: eventId });
    if (!idValidation.success) {
      return idValidation.error;
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return {
        success: false,
        error: {
          type: 'https://docs.trainstation-dashboard.com/errors/validation',
          title: 'Invalid Ticket Quantity',
          status: 400,
          detail: 'Ticket quantity must be a positive integer',
          instance: `/api/events/${eventId}/tickets`,
          timestamp: new Date().toISOString()
        },
        meta: {
          requestId: crypto.randomUUID(),
          source: 'validation'
        }
      };
    }

    // 2. Check if tickets can be sold
    const existingEventResponse = await this.getEventById(eventId);
    if (!existingEventResponse.success) {
      return existingEventResponse;
    }

    const existingEvent = existingEventResponse.data;
    const businessRuleCheck = validateEventBusinessRules.canSellTickets(existingEvent, quantity);
    if (!businessRuleCheck.valid) {
      return {
        success: false,
        error: {
          type: 'https://docs.trainstation-dashboard.com/errors/business-rule-violation',
          title: 'Cannot Sell Tickets',
          status: 400,
          detail: businessRuleCheck.reason || 'Tickets cannot be sold for this event',
          instance: `/api/events/${eventId}/tickets`,
          timestamp: new Date().toISOString()
        },
        meta: {
          requestId: crypto.randomUUID(),
          source: 'validation'
        }
      };
    }

    // 3. Update tickets sold
    const newTicketsSold = existingEvent.ticketsSold + quantity;
    return this.updateEvent(eventId, {
      ticketsSold: newTicketsSold
    });
  }

  /**
   * Transform database event to API format
   */
  private transformEventFromDb(dbEvent: Record<string, unknown>): Event {
    // Convert snake_case to camelCase and structure data
    const camelCaseEvent = this.adapter.toCamelCase(dbEvent);
    
    return {
      id: camelCaseEvent.id as string,
      title: camelCaseEvent.title as string,
      description: camelCaseEvent.description as string || undefined,
      date: camelCaseEvent.date as string,
      startTime: camelCaseEvent.startTime as string,
      endTime: camelCaseEvent.endTime as string,
      artistIds: camelCaseEvent.artistIds as string[] || [],
      ticketsSold: camelCaseEvent.ticketsSold as number || 0,
      totalCapacity: camelCaseEvent.totalCapacity as number,
      ticketPrice: camelCaseEvent.ticketPrice as number,
      status: camelCaseEvent.status as 'upcoming' | 'completed' | 'cancelled',
      image: camelCaseEvent.image as string || undefined,
      genre: camelCaseEvent.genre as string || undefined,
      createdAt: camelCaseEvent.createdAt as string,
      updatedAt: camelCaseEvent.updatedAt as string,
      // Enhanced fields
      revenue: camelCaseEvent.eventRevenue ? {
        tickets: (camelCaseEvent.eventRevenue as Record<string, unknown>).tickets as number || 0,
        bar: (camelCaseEvent.eventRevenue as Record<string, unknown>).bar as number || 0,
        merchandise: (camelCaseEvent.eventRevenue as Record<string, unknown>).merchandise as number || 0,
        other: (camelCaseEvent.eventRevenue as Record<string, unknown>).other as number || 0,
      } : undefined,
      expenses: camelCaseEvent.eventExpenses ? {
        artist: (camelCaseEvent.eventExpenses as Record<string, unknown>).artist as number || 0,
        venue: (camelCaseEvent.eventExpenses as Record<string, unknown>).venue as number || 0,
        marketing: (camelCaseEvent.eventExpenses as Record<string, unknown>).marketing as number || 0,
        other: (camelCaseEvent.eventExpenses as Record<string, unknown>).other as number || 0,
      } : undefined,
      artists: camelCaseEvent.artists ? 
        (camelCaseEvent.artists as Array<Record<string, unknown>>).map(artist => ({
          id: artist.id as string,
          name: artist.name as string,
          genre: artist.genre as string,
        })) : undefined,
    };
  }
}

// Export a singleton instance
export const eventsService = new EventsService(); 