import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { EventsService } from '../eventsService';
import { supabase } from '../../../supabase';

// Mock Supabase
vi.mock('../../../supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn()
    }
  }
}));

describe('EventsService', () => {
  let eventsService: EventsService;
  let mockFrom: any;

  beforeEach(() => {
    eventsService = new EventsService();
    mockFrom = {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      single: vi.fn(),
      maybeSingle: vi.fn()
    };
    
    (supabase.from as any).mockReturnValue(mockFrom);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getEvents', () => {
    it('should fetch events successfully', async () => {
      const mockEvents = [
        {
          id: '1',
          title: 'Jazz Night',
          description: 'Live jazz performance',
          start_date: '2024-06-01T19:00:00Z',
          end_date: '2024-06-01T23:00:00Z',
          status: 'confirmed',
          venue_id: 'venue-1',
          capacity: 150,
          tickets_sold: 120,
          created_at: '2024-01-01T00:00:00Z'
        }
      ];

      mockFrom.single.mockResolvedValue({ data: mockEvents, error: null });

      const result = await eventsService.getEvents();

      expect(result.meta.status).toBe('success');
      expect(result.data).toHaveLength(1);
      expect(result.data[0].title).toBe('Jazz Night');
      expect(supabase.from).toHaveBeenCalledWith('events');
    });

    it('should handle date range filters', async () => {
      const query = { 
        dateFrom: '2024-06-01',
        dateTo: '2024-06-30'
      };
      mockFrom.single.mockResolvedValue({ data: [], error: null });

      await eventsService.getEvents(query);

      expect(mockFrom.gte).toHaveBeenCalledWith('date', '2024-06-01');
      expect(mockFrom.lte).toHaveBeenCalledWith('date', '2024-06-30');
    });

    it('should handle status filters', async () => {
      const query = { status: 'upcoming' as const };
      mockFrom.single.mockResolvedValue({ data: [], error: null });

      await eventsService.getEvents(query);

      expect(mockFrom.eq).toHaveBeenCalledWith('status', 'upcoming');
    });

    it('should handle search queries', async () => {
      const query = { search: 'jazz' };
      mockFrom.single.mockResolvedValue({ data: [], error: null });

      await eventsService.getEvents(query);

      expect(mockFrom.ilike).toHaveBeenCalledWith('title', '%jazz%');
    });

    it('should handle database errors', async () => {
      const error = new Error('Database connection failed');
      mockFrom.single.mockResolvedValue({ data: null, error });

      const result = await eventsService.getEvents();

      expect(result.meta.status).toBe('error');
    });
  });

  describe('getEventById', () => {
    it('should fetch event by id successfully', async () => {
      const mockEvent = {
        id: '1',
        title: 'Jazz Night',
        description: 'Live jazz performance',
        start_date: '2024-06-01T19:00:00Z',
        end_date: '2024-06-01T23:00:00Z',
        status: 'confirmed'
      };

      mockFrom.single.mockResolvedValue({ data: mockEvent, error: null });

      const result = await eventsService.getEventById('1');

      expect(result.meta.status).toBe('success');
      expect(result.data.title).toBe('Jazz Night');
      expect(mockFrom.eq).toHaveBeenCalledWith('id', '1');
    });

    it('should handle event not found', async () => {
      mockFrom.single.mockResolvedValue({ data: null, error: null });

      const result = await eventsService.getEventById('999');

      expect(result.meta.status).toBe('error');
    });
  });

  describe('createEvent', () => {
    it('should create event successfully', async () => {
      const eventData = {
        title: 'Rock Concert',
        description: 'Amazing rock performance',
        date: '2024-07-01',
        startTime: '20:00',
        endTime: '23:00',
        totalCapacity: 200,
        ticketPrice: 50,
        artistIds: ['artist-1'],
        ticketsSold: 0,
        status: 'upcoming' as const
      };

      const mockCreatedEvent = {
        id: '2',
        title: 'Rock Concert',
        description: 'Amazing rock performance',
        start_date: '2024-07-01T20:00:00Z',
        end_date: '2024-07-01T23:00:00Z',
        venue_id: 'venue-1',
        capacity: 200,
        status: 'draft',
        created_at: '2024-01-01T00:00:00Z'
      };

      mockFrom.select.mockResolvedValue({ data: [mockCreatedEvent], error: null });

      const result = await eventsService.createEvent(eventData);

      expect(result.meta.status).toBe('success');
      expect(result.data.title).toBe('Rock Concert');
      expect(mockFrom.insert).toHaveBeenCalled();
    });

    it('should validate required fields', async () => {
      const invalidData = {
        title: '',
        description: 'Test event',
        date: '2024-07-01',
        startTime: '20:00',
        endTime: '19:00', // End before start
        totalCapacity: -5, // Negative capacity
        ticketPrice: 50,
        artistIds: [],
        ticketsSold: 0,
        status: 'upcoming' as const
      };

      const result = await eventsService.createEvent(invalidData);

      expect(result.meta.status).toBe('error');
    });

    it('should handle venue capacity conflicts', async () => {
      const eventData = {
        title: 'Concert',
        description: 'Test event',
        startDate: '2024-07-01T20:00:00Z',
        endDate: '2024-07-01T23:00:00Z',
        venueId: 'venue-1',
        capacity: 1000, // Exceeds venue capacity
        artistIds: ['artist-1'],
        ticketTiers: [
          {
            name: 'General Admission',
            price: 50,
            quantity: 150
          }
        ]
      };

      const venueError = { message: 'Venue capacity exceeded' };
      mockFrom.select.mockResolvedValue({ data: null, error: venueError });

      const result = await eventsService.createEvent(eventData);

      expect(result.meta.status).toBe('error');
    });
  });

  describe('updateEvent', () => {
    it('should update event successfully', async () => {
      const updates = {
        title: 'Updated Jazz Night',
        capacity: 180
      };

      const mockUpdatedEvent = {
        id: '1',
        title: 'Updated Jazz Night',
        description: 'Live jazz performance',
        capacity: 180,
        updated_at: '2024-01-01T00:00:00Z'
      };

      mockFrom.select.mockResolvedValue({ data: [mockUpdatedEvent], error: null });

      const result = await eventsService.updateEvent('1', updates);

      expect(result.meta.status).toBe('success');
      expect(result.data.title).toBe('Updated Jazz Night');
      expect(mockFrom.update).toHaveBeenCalled();
      expect(mockFrom.eq).toHaveBeenCalledWith('id', '1');
    });

    it('should prevent updates to past events', async () => {
      const updates = { title: 'Updated Title' };
      
      // Mock existing event that's in the past
      const pastEvent = {
        id: '1',
        title: 'Past Event',
        start_date: '2023-01-01T00:00:00Z',
        status: 'completed'
      };
      
      mockFrom.single.mockResolvedValue({ data: pastEvent, error: null });

      const result = await eventsService.updateEvent('1', updates);

      expect(result.meta.status).toBe('error');
    });
  });

  describe('deleteEvent', () => {
    it('should soft delete event by default', async () => {
      mockFrom.select.mockResolvedValue({ data: [{ id: '1' }], error: null });

      const result = await eventsService.deleteEvent('1');

      expect(result.meta.status).toBe('success');
      expect(result.data.deleted).toBe(true);
      expect(mockFrom.update).toHaveBeenCalled(); // Soft delete uses update
    });

    it('should hard delete when specified', async () => {
      mockFrom.single.mockResolvedValue({ data: null, error: null });

      const result = await eventsService.deleteEvent('1', true);

      expect(result.meta.status).toBe('success');
      expect(mockFrom.delete).toHaveBeenCalled(); // Hard delete uses delete
    });

    it('should prevent deletion of events with sold tickets', async () => {
      const eventWithTickets = {
        id: '1',
        title: 'Event with tickets',
        tickets_sold: 50
      };

      mockFrom.single.mockResolvedValue({ data: eventWithTickets, error: null });

      const result = await eventsService.deleteEvent('1');

      expect(result.meta.status).toBe('error');
    });
  });

  // Note: Analytics, publishing, and duplication features to be implemented in future versions
}); 