import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEvents, useEventsManagement, useEventValidation } from '../useEvents';
import { eventsService } from '@/lib/api/services/eventsService';
import { mockQueryClient } from '@/test/setup';
import React from 'react';

// Mock the events service
vi.mock('@/lib/api/services/eventsService', () => ({
  eventsService: {
    listEvents: vi.fn(),
    getEvent: vi.fn(),
    createEvent: vi.fn(),
    updateEvent: vi.fn(),
    deleteEvent: vi.fn(),
    cancelEvent: vi.fn(),
    sellTickets: vi.fn(),
  },
}));

// Mock React Hot Toast
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useEvents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.testUtils.resetAllMocks();
  });

  describe('useEvents hook', () => {
    it('should fetch events successfully', async () => {
      const mockEvents = [
        globalThis.testUtils.mockEvent(),
        globalThis.testUtils.mockEvent({ id: 'event-2', title: 'Event 2' }),
      ];

      (eventsService.listEvents as any).mockResolvedValueOnce({
        success: true,
        data: mockEvents,
        meta: { total: 2, page: 1, per_page: 20, total_pages: 1 },
      });

      const { result } = renderHook(() => useEvents(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockEvents);
      expect(result.current.isLoading).toBe(false);
      expect(eventsService.listEvents).toHaveBeenCalledWith(1, 20, undefined);
    });

    it('should handle pagination parameters', async () => {
      const mockEvents = [globalThis.testUtils.mockEvent()];

      (eventsService.listEvents as any).mockResolvedValueOnce({
        success: true,
        data: mockEvents,
        meta: { total: 1, page: 2, per_page: 10, total_pages: 1 },
      });

      const { result } = renderHook(() => useEvents(2, 10), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(eventsService.listEvents).toHaveBeenCalledWith(2, 10, undefined);
    });

    it('should handle search filter', async () => {
      const mockEvents = [globalThis.testUtils.mockEvent()];

      (eventsService.listEvents as any).mockResolvedValueOnce({
        success: true,
        data: mockEvents,
        meta: { total: 1, page: 1, per_page: 20, total_pages: 1 },
      });

      const { result } = renderHook(() => useEvents(1, 20, 'Rock Concert'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(eventsService.listEvents).toHaveBeenCalledWith(1, 20, 'Rock Concert');
    });

    it('should handle service errors', async () => {
      (eventsService.listEvents as any).mockResolvedValueOnce({
        success: false,
        error: {
          type: 'server',
          message: 'Database connection failed',
        },
      });

      const { result } = renderHook(() => useEvents(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });

    it('should handle network errors', async () => {
      (eventsService.listEvents as any).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useEvents(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  describe('useEventsManagement hook', () => {
    it('should create an event successfully', async () => {
      const newEvent = globalThis.testUtils.mockEvent({
        title: 'New Event',
        date: '2024-12-31T20:00:00Z',
      });

      (eventsService.createEvent as any).mockResolvedValueOnce({
        success: true,
        data: newEvent,
      });

      const { result } = renderHook(() => useEventsManagement(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.createEvent.mutate).toBeDefined();
      });

      const eventData = {
        title: 'New Event',
        description: 'A new event',
        date: '2024-12-31T20:00:00Z',
        startTime: '20:00',
        endTime: '23:00',
        artistIds: ['artist-1'],
        ticketPrice: 25.00,
        totalCapacity: 100,
        genre: 'Rock',
      };

      result.current.createEvent.mutate(eventData);

      await waitFor(() => {
        expect(result.current.createEvent.isSuccess).toBe(true);
      });

      expect(eventsService.createEvent).toHaveBeenCalledWith(eventData);
      expect(result.current.createEvent.data).toEqual({
        success: true,
        data: newEvent,
      });
    });

    it('should update an event successfully', async () => {
      const updatedEvent = globalThis.testUtils.mockEvent({
        id: 'event-1',
        title: 'Updated Event',
      });

      (eventsService.updateEvent as any).mockResolvedValueOnce({
        success: true,
        data: updatedEvent,
      });

      const { result } = renderHook(() => useEventsManagement(), {
        wrapper: createWrapper(),
      });

      const updateData = {
        id: 'event-1',
        title: 'Updated Event',
        description: 'Updated description',
      };

      result.current.updateEvent.mutate(updateData);

      await waitFor(() => {
        expect(result.current.updateEvent.isSuccess).toBe(true);
      });

      expect(eventsService.updateEvent).toHaveBeenCalledWith('event-1', updateData);
    });

    it('should delete an event successfully', async () => {
      (eventsService.deleteEvent as any).mockResolvedValueOnce({
        success: true,
        data: null,
      });

      const { result } = renderHook(() => useEventsManagement(), {
        wrapper: createWrapper(),
      });

      result.current.deleteEvent.mutate('event-1');

      await waitFor(() => {
        expect(result.current.deleteEvent.isSuccess).toBe(true);
      });

      expect(eventsService.deleteEvent).toHaveBeenCalledWith('event-1');
    });

    it('should cancel an event successfully', async () => {
      const cancelledEvent = globalThis.testUtils.mockEvent({
        id: 'event-1',
        status: 'cancelled',
      });

      (eventsService.cancelEvent as any).mockResolvedValueOnce({
        success: true,
        data: cancelledEvent,
      });

      const { result } = renderHook(() => useEventsManagement(), {
        wrapper: createWrapper(),
      });

      result.current.cancelEvent.mutate({
        eventId: 'event-1',
        reason: 'Artist cancellation',
      });

      await waitFor(() => {
        expect(result.current.cancelEvent.isSuccess).toBe(true);
      });

      expect(eventsService.cancelEvent).toHaveBeenCalledWith('event-1', 'Artist cancellation');
    });

    it('should sell tickets successfully', async () => {
      const updatedEvent = globalThis.testUtils.mockEvent({
        id: 'event-1',
        ticketsSold: 50,
      });

      (eventsService.sellTickets as any).mockResolvedValueOnce({
        success: true,
        data: updatedEvent,
      });

      const { result } = renderHook(() => useEventsManagement(), {
        wrapper: createWrapper(),
      });

      result.current.sellTickets.mutate({
        eventId: 'event-1',
        quantity: 10,
        customerEmail: 'customer@example.com',
      });

      await waitFor(() => {
        expect(result.current.sellTickets.isSuccess).toBe(true);
      });

      expect(eventsService.sellTickets).toHaveBeenCalledWith('event-1', 10, 'customer@example.com');
    });

    it('should handle mutation errors with proper error handling', async () => {
      (eventsService.createEvent as any).mockResolvedValueOnce({
        success: false,
        error: {
          type: 'validation',
          message: 'Event title is required',
          field: 'title',
        },
      });

      const { result } = renderHook(() => useEventsManagement(), {
        wrapper: createWrapper(),
      });

      const invalidEventData = {
        title: '',
        description: 'Invalid event',
        date: '2024-12-31T20:00:00Z',
        startTime: '20:00',
        endTime: '23:00',
        artistIds: [],
        ticketPrice: 0,
        totalCapacity: 0,
        genre: 'Rock',
      };

      result.current.createEvent.mutate(invalidEventData);

      await waitFor(() => {
        expect(result.current.createEvent.isError).toBe(true);
      });

      expect(result.current.createEvent.error).toBeDefined();
    });
  });

  describe('useEventValidation hook', () => {
    it('should validate event title correctly', async () => {
      const { result } = renderHook(() => useEventValidation());

      // Test valid title
      const validResult = result.current.validateTitle('Valid Event Title');
      expect(validResult.isValid).toBe(true);
      expect(validResult.error).toBeUndefined();

      // Test empty title
      const emptyResult = result.current.validateTitle('');
      expect(emptyResult.isValid).toBe(false);
      expect(emptyResult.error).toBe('Event title is required');

      // Test too long title
      const longTitle = 'A'.repeat(101);
      const longResult = result.current.validateTitle(longTitle);
      expect(longResult.isValid).toBe(false);
      expect(longResult.error).toBe('Title must not exceed 100 characters');
    });

    it('should validate event date correctly', async () => {
      const { result } = renderHook(() => useEventValidation());

      // Test future date
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const validResult = result.current.validateDate(futureDate);
      expect(validResult.isValid).toBe(true);

      // Test past date
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const pastResult = result.current.validateDate(pastDate);
      expect(pastResult.isValid).toBe(false);
      expect(pastResult.error).toBe('Event date must be in the future');

      // Test invalid date format
      const invalidResult = result.current.validateDate('invalid-date');
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.error).toBe('Invalid date format');
    });

    it('should validate ticket price correctly', async () => {
      const { result } = renderHook(() => useEventValidation());

      // Test valid price
      const validResult = result.current.validateTicketPrice(25.00);
      expect(validResult.isValid).toBe(true);

      // Test negative price
      const negativeResult = result.current.validateTicketPrice(-10);
      expect(negativeResult.isValid).toBe(false);
      expect(negativeResult.error).toBe('Ticket price must be positive');

      // Test too high price
      const highResult = result.current.validateTicketPrice(10001);
      expect(highResult.isValid).toBe(false);
      expect(highResult.error).toBe('Ticket price cannot exceed $10,000');
    });

    it('should validate capacity correctly', async () => {
      const { result } = renderHook(() => useEventValidation());

      // Test valid capacity
      const validResult = result.current.validateCapacity(100);
      expect(validResult.isValid).toBe(true);

      // Test zero capacity
      const zeroResult = result.current.validateCapacity(0);
      expect(zeroResult.isValid).toBe(false);
      expect(zeroResult.error).toBe('Capacity must be at least 1');

      // Test too high capacity
      const highResult = result.current.validateCapacity(50001);
      expect(highResult.isValid).toBe(false);
      expect(highResult.error).toBe('Capacity cannot exceed 50,000');
    });

    it('should validate complete event form', async () => {
      const { result } = renderHook(() => useEventValidation());

      // Test valid event
      const validEvent = {
        title: 'Valid Event',
        description: 'A valid event description',
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        startTime: '20:00',
        endTime: '23:00',
        artistIds: ['artist-1'],
        ticketPrice: 25.00,
        totalCapacity: 100,
        genre: 'Rock',
      };

      const validResult = result.current.validateEventForm(validEvent);
      expect(validResult.isValid).toBe(true);
      expect(validResult.errors).toEqual({});

      // Test invalid event
      const invalidEvent = {
        title: '',
        description: '',
        date: 'invalid-date',
        startTime: '',
        endTime: '',
        artistIds: [],
        ticketPrice: -10,
        totalCapacity: 0,
        genre: '',
      };

      const invalidResult = result.current.validateEventForm(invalidEvent);
      expect(invalidResult.isValid).toBe(false);
      expect(Object.keys(invalidResult.errors)).toContain('title');
      expect(Object.keys(invalidResult.errors)).toContain('date');
      expect(Object.keys(invalidResult.errors)).toContain('ticketPrice');
      expect(Object.keys(invalidResult.errors)).toContain('totalCapacity');
    });
  });
}); 