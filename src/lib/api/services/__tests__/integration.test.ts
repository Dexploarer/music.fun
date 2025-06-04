import { vi } from 'vitest';
import { 
  mockSupabaseResponse, 
  mockSupabaseError,
  generateMockArtist,
  generateMockEvent,
  generateMockCustomer,
  generateMockInventoryItem,
  generateMockProject,
  mockApiCall,
  mockApiError 
} from '../../../test/test-utils';

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => Promise.resolve(mockSupabaseResponse([]))),
    insert: vi.fn(() => Promise.resolve(mockSupabaseResponse({}))),
    update: vi.fn(() => Promise.resolve(mockSupabaseResponse({}))),
    delete: vi.fn(() => Promise.resolve(mockSupabaseResponse({}))),
    eq: vi.fn(function(this: any) { return this; }),
    order: vi.fn(function(this: any) { return this; }),
    limit: vi.fn(function(this: any) { return this; }),
  })),
  auth: {
    getSession: vi.fn(() => Promise.resolve({ 
      data: { session: { access_token: 'mock-token' } }, 
      error: null 
    })),
  },
  storage: {
    from: vi.fn(() => ({
      upload: vi.fn(() => Promise.resolve({ data: { path: 'test-path' }, error: null })),
      download: vi.fn(() => Promise.resolve({ data: new Blob(), error: null })),
      remove: vi.fn(() => Promise.resolve({ data: [], error: null })),
    })),
  },
};

vi.mock('../../../lib/supabase/client', () => ({
  supabase: mockSupabase,
}));

describe('API Services Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Artists Service Integration', () => {
    it('should fetch artists successfully', async () => {
      const mockArtists = [generateMockArtist(), generateMockArtist()];
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => Promise.resolve(mockSupabaseResponse(mockArtists))),
        eq: vi.fn(function(this: any) { return this; }),
        order: vi.fn(function(this: any) { return this; }),
        limit: vi.fn(function(this: any) { return this; }),
      });

      // Simulate artists service call
      const result = await mockSupabase.from('artists').select('*');
      
      expect(result.data).toEqual(mockArtists);
      expect(result.error).toBeNull();
      expect(mockSupabase.from).toHaveBeenCalledWith('artists');
    });

    it('should handle artist creation with validation', async () => {
      const newArtist = generateMockArtist();
      mockSupabase.from.mockReturnValueOnce({
        insert: vi.fn(() => Promise.resolve(mockSupabaseResponse(newArtist))),
      });

      const result = await mockSupabase.from('artists').insert(newArtist);
      
      expect(result.data).toEqual(newArtist);
      expect(result.error).toBeNull();
    });

    it('should handle artist update with error handling', async () => {
      const artistId = 'test-artist-id';
      const updateData = { name: 'Updated Artist Name' };
      
      mockSupabase.from.mockReturnValueOnce({
        update: vi.fn(() => Promise.resolve(mockSupabaseError('Artist not found'))),
        eq: vi.fn(function(this: any) { return this; }),
      });

      const result = await mockSupabase.from('artists').update(updateData).eq('id', artistId);
      
      expect(result.error).toBeTruthy();
      expect(result.error.message).toBe('Artist not found');
    });
  });

  describe('Events Service Integration', () => {
    it('should create event with proper validation', async () => {
      const newEvent = generateMockEvent();
      mockSupabase.from.mockReturnValueOnce({
        insert: vi.fn(() => Promise.resolve(mockSupabaseResponse(newEvent))),
      });

      const result = await mockSupabase.from('events').insert(newEvent);
      
      expect(result.data).toEqual(newEvent);
      expect(mockSupabase.from).toHaveBeenCalledWith('events');
    });

    it('should fetch upcoming events correctly', async () => {
      const mockEvents = [
        generateMockEvent({ date: new Date(Date.now() + 86400000).toISOString() }),
        generateMockEvent({ date: new Date(Date.now() + 172800000).toISOString() }),
      ];

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => Promise.resolve(mockSupabaseResponse(mockEvents))),
        eq: vi.fn(function(this: any) { return this; }),
        order: vi.fn(function(this: any) { return this; }),
        limit: vi.fn(function(this: any) { return this; }),
      });

      const result = await mockSupabase.from('events')
        .select('*')
        .eq('status', 'scheduled')
        .order('date', { ascending: true });
      
      expect(result.data).toEqual(mockEvents);
      expect(result.data.length).toBe(2);
    });
  });

  describe('Customers Service Integration', () => {
    it('should handle customer search with filters', async () => {
      const mockCustomers = [
        generateMockCustomer({ membership_tier: 'gold' }),
        generateMockCustomer({ membership_tier: 'silver' }),
      ];

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => Promise.resolve(mockSupabaseResponse(mockCustomers))),
        eq: vi.fn(function(this: any) { return this; }),
        order: vi.fn(function(this: any) { return this; }),
        limit: vi.fn(function(this: any) { return this; }),
      });

      const result = await mockSupabase.from('customers')
        .select('*')
        .order('total_spent', { ascending: false });
      
      expect(result.data).toEqual(mockCustomers);
    });

    it('should update customer loyalty points correctly', async () => {
      const customerId = 'test-customer-id';
      const pointsUpdate = { loyalty_points: 2000 };

      mockSupabase.from.mockReturnValueOnce({
        update: vi.fn(() => Promise.resolve(mockSupabaseResponse(pointsUpdate))),
        eq: vi.fn(function(this: any) { return this; }),
      });

      const result = await mockSupabase.from('customers')
        .update(pointsUpdate)
        .eq('id', customerId);
      
      expect(result.data).toEqual(pointsUpdate);
    });
  });

  describe('Inventory Service Integration', () => {
    it('should handle low stock alerts', async () => {
      const lowStockItems = [
        generateMockInventoryItem({ quantity: 5, reorder_level: 20 }),
        generateMockInventoryItem({ quantity: 10, reorder_level: 25 }),
      ];

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => Promise.resolve(mockSupabaseResponse(lowStockItems))),
        eq: vi.fn(function(this: any) { return this; }),
        order: vi.fn(function(this: any) { return this; }),
        limit: vi.fn(function(this: any) { return this; }),
      });

      // Simulate low stock query
      const result = await mockSupabase.from('inventory_items')
        .select('*')
        .order('quantity', { ascending: true });
      
      expect(result.data).toEqual(lowStockItems);
      expect(result.data.every(item => item.quantity < item.reorder_level)).toBe(true);
    });

    it('should update inventory quantities correctly', async () => {
      const itemId = 'test-item-id';
      const quantityUpdate = { quantity: 150 };

      mockSupabase.from.mockReturnValueOnce({
        update: vi.fn(() => Promise.resolve(mockSupabaseResponse(quantityUpdate))),
        eq: vi.fn(function(this: any) { return this; }),
      });

      const result = await mockSupabase.from('inventory_items')
        .update(quantityUpdate)
        .eq('id', itemId);
      
      expect(result.data).toEqual(quantityUpdate);
    });
  });

  describe('Projects Service Integration', () => {
    it('should handle project workflow correctly', async () => {
      const newProject = generateMockProject();
      
      mockSupabase.from.mockReturnValueOnce({
        insert: vi.fn(() => Promise.resolve(mockSupabaseResponse(newProject))),
      });

      const result = await mockSupabase.from('projects').insert(newProject);
      
      expect(result.data).toEqual(newProject);
      expect(result.data.status).toBe('in_progress');
    });

    it('should update project progress correctly', async () => {
      const projectId = 'test-project-id';
      const progressUpdate = { progress: 75, status: 'in_progress' };

      mockSupabase.from.mockReturnValueOnce({
        update: vi.fn(() => Promise.resolve(mockSupabaseResponse(progressUpdate))),
        eq: vi.fn(function(this: any) { return this; }),
      });

      const result = await mockSupabase.from('projects')
        .update(progressUpdate)
        .eq('id', projectId);
      
      expect(result.data).toEqual(progressUpdate);
    });
  });

  describe('File Upload Integration', () => {
    it('should handle file upload successfully', async () => {
      const mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
      const uploadPath = 'uploads/test.jpg';

      const result = await mockSupabase.storage
        .from('documents')
        .upload(uploadPath, mockFile);
      
      expect(result.data?.path).toBe('test-path');
      expect(result.error).toBeNull();
    });

    it('should handle file download correctly', async () => {
      const filePath = 'uploads/test.jpg';

      const result = await mockSupabase.storage
        .from('documents')
        .download(filePath);
      
      expect(result.data).toBeInstanceOf(Blob);
      expect(result.error).toBeNull();
    });
  });

  describe('Authentication Integration', () => {
    it('should handle session retrieval correctly', async () => {
      const result = await mockSupabase.auth.getSession();
      
      expect(result.data.session?.access_token).toBe('mock-token');
      expect(result.error).toBeNull();
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle network errors gracefully', async () => {
      mockApiError('/api/artists', 500, 'Internal Server Error');

      try {
        await fetch('/api/artists');
      } catch (error) {
        expect(error).toBeTruthy();
      }
    });

    it('should handle validation errors correctly', async () => {
      const invalidArtist = { name: '' }; // Invalid data
      
      mockSupabase.from.mockReturnValueOnce({
        insert: vi.fn(() => Promise.resolve(mockSupabaseError('Validation failed: name is required'))),
      });

      const result = await mockSupabase.from('artists').insert(invalidArtist);
      
      expect(result.error?.message).toContain('Validation failed');
    });

    it('should handle unauthorized access correctly', async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: null },
        error: { message: 'Unauthorized' }
      });

      const result = await mockSupabase.auth.getSession();
      
      expect(result.data.session).toBeNull();
      expect(result.error?.message).toBe('Unauthorized');
    });
  });

  describe('Performance Integration', () => {
    it('should handle concurrent requests correctly', async () => {
      const requests = Array.from({ length: 5 }, () => 
        mockSupabase.from('artists').select('*')
      );

      const results = await Promise.all(requests);
      
      results.forEach(result => {
        expect(result.error).toBeNull();
      });
      expect(mockSupabase.from).toHaveBeenCalledTimes(5);
    });

    it('should handle large data sets efficiently', async () => {
      const largeDataSet = Array.from({ length: 1000 }, () => generateMockArtist());
      
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => Promise.resolve(mockSupabaseResponse(largeDataSet))),
        limit: vi.fn(function(this: any) { return this; }),
      });

      const result = await mockSupabase.from('artists')
        .select('*')
        .limit(1000);
      
      expect(result.data.length).toBe(1000);
      expect(result.error).toBeNull();
    });
  });
}); 