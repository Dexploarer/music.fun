import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { CustomerService } from '../customerService';
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

describe('CustomerService', () => {
  let customerService: CustomerService;
  let mockFrom: any;

  beforeEach(() => {
    customerService = new CustomerService();
    mockFrom = {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
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

  describe('getCustomers', () => {
    it('should fetch customers successfully', async () => {
      const mockCustomers = [
        {
          id: '1',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          phone: '555-1234',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          tags: ['vip'],
          marketing_preferences: {
            emailPromotions: true,
            smsNotifications: false,
            newsletter: true,
            specialEvents: true,
            unsubscribed: false
          }
        }
      ];

      mockFrom.single.mockResolvedValue({ data: mockCustomers, error: null });

      const result = await customerService.getCustomers();

      expect(result.meta.status).toBe('success');
      expect(result.data).toHaveLength(1);
      expect(result.data[0].firstName).toBe('John');
      expect(supabase.from).toHaveBeenCalledWith('customers');
    });

    it('should handle search queries', async () => {
      const query = { search: 'john' };
      mockFrom.single.mockResolvedValue({ data: [], error: null });

      await customerService.getCustomers(query);

      expect(mockFrom.ilike).toHaveBeenCalledWith('first_name', '%john%');
    });

    it('should handle tag filters', async () => {
      const query = { tags: ['vip', 'member'] };
      mockFrom.single.mockResolvedValue({ data: [], error: null });

      await customerService.getCustomers(query);

      expect(mockFrom.select).toHaveBeenCalled();
    });

    it('should handle pagination', async () => {
      const query = { page: 2, limit: 10 };
      mockFrom.single.mockResolvedValue({ data: [], error: null });

      await customerService.getCustomers(query);

      expect(mockFrom.range).toHaveBeenCalledWith(10, 19);
    });

    it('should handle database errors', async () => {
      const error = new Error('Database connection failed');
      mockFrom.single.mockResolvedValue({ data: null, error });

      const result = await customerService.getCustomers();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.detail).toContain('Database connection failed');
      }
    });
  });

  describe('getCustomerById', () => {
    it('should fetch customer by id successfully', async () => {
      const mockCustomer = {
        id: '1',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com'
      };

      mockFrom.single.mockResolvedValue({ data: mockCustomer, error: null });

      const result = await customerService.getCustomerById('1');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.firstName).toBe('John');
      }
      expect(mockFrom.eq).toHaveBeenCalledWith('id', '1');
    });

    it('should handle customer not found', async () => {
      mockFrom.single.mockResolvedValue({ data: null, error: null });

      const result = await customerService.getCustomerById('999');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.status).toBe(404);
      }
    });
  });

  describe('createCustomer', () => {
    it('should create customer successfully', async () => {
      const customerData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        phone: '555-5678',
        tags: [],
        marketingPreferences: {
          emailPromotions: true,
          smsNotifications: false,
          newsletter: true,
          specialEvents: false,
          unsubscribed: false
        }
      };

      const mockCreatedCustomer = {
        id: '2',
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane@example.com',
        phone: '555-5678',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      mockFrom.select.mockResolvedValue({ data: [mockCreatedCustomer], error: null });

      const result = await customerService.createCustomer(customerData);

      expect(result.meta.status).toBe('success');
      expect(result.data.firstName).toBe('Jane');
      expect(mockFrom.insert).toHaveBeenCalled();
    });

    it('should validate required fields', async () => {
      const invalidData = {
        firstName: '',
        lastName: 'Smith',
        email: 'invalid-email',
        tags: [],
        marketingPreferences: {
          emailPromotions: true,
          smsNotifications: false,
          newsletter: true,
          specialEvents: false,
          unsubscribed: false
        }
      };

      const result = await customerService.createCustomer(invalidData);

      expect(result.meta.status).toBe('error');
      expect(result.error?.status).toBe(422);
    });

    it('should handle duplicate email', async () => {
      const customerData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'existing@example.com',
        tags: [],
        marketingPreferences: {
          emailPromotions: true,
          smsNotifications: false,
          newsletter: true,
          specialEvents: false,
          unsubscribed: false
        }
      };

      const duplicateError = { code: '23505', message: 'duplicate key value' };
      mockFrom.select.mockResolvedValue({ data: null, error: duplicateError });

      const result = await customerService.createCustomer(customerData);

      expect(result.meta.status).toBe('error');
      expect(result.error?.status).toBe(409);
    });
  });

  describe('updateCustomer', () => {
    it('should update customer successfully', async () => {
      const updates = {
        firstName: 'John Updated',
        email: 'john.updated@example.com'
      };

      const mockUpdatedCustomer = {
        id: '1',
        first_name: 'John Updated',
        last_name: 'Doe',
        email: 'john.updated@example.com'
      };

      mockFrom.select.mockResolvedValue({ data: [mockUpdatedCustomer], error: null });

      const result = await customerService.updateCustomer('1', updates);

      expect(result.meta.status).toBe('success');
      expect(result.data.firstName).toBe('John Updated');
      expect(mockFrom.update).toHaveBeenCalled();
      expect(mockFrom.eq).toHaveBeenCalledWith('id', '1');
    });

    it('should handle customer not found for update', async () => {
      mockFrom.select.mockResolvedValue({ data: [], error: null });

      const result = await customerService.updateCustomer('999', { firstName: 'Test' });

      expect(result.meta.status).toBe('error');
      expect(result.error?.status).toBe(404);
    });
  });

  describe('deleteCustomer', () => {
    it('should soft delete customer by default', async () => {
      mockFrom.select.mockResolvedValue({ data: [{ id: '1' }], error: null });

      const result = await customerService.deleteCustomer('1');

      expect(result.meta.status).toBe('success');
      expect(result.data.deleted).toBe(true);
      expect(mockFrom.update).toHaveBeenCalled(); // Soft delete uses update
    });

    it('should hard delete when specified', async () => {
      mockFrom.single.mockResolvedValue({ data: null, error: null });

      const result = await customerService.deleteCustomer('1', true);

      expect(result.meta.status).toBe('success');
      expect(mockFrom.delete).toHaveBeenCalled(); // Hard delete uses delete
    });
  });

  describe('createInteraction', () => {
    it('should create customer interaction successfully', async () => {
      const interactionData = {
        customerId: '1',
        type: 'call' as const,
        date: '2024-01-01',
        description: 'Follow-up call',
        staffMember: 'Staff Member'
      };

      const mockInteraction = {
        id: '1',
        customer_id: '1',
        type: 'call',
        date: '2024-01-01',
        description: 'Follow-up call',
        staff_member: 'Staff Member',
        created_at: '2024-01-01T00:00:00Z'
      };

      mockFrom.select.mockResolvedValue({ data: [mockInteraction], error: null });

      const result = await customerService.createInteraction(interactionData);

      expect(result.meta.status).toBe('success');
      expect(result.data.type).toBe('call');
      expect(mockFrom.insert).toHaveBeenCalled();
    });
  });

  describe('bulkUpdateCustomers', () => {
    it('should update multiple customers successfully', async () => {
      const updates = {
        customerIds: ['1', '2'],
        updates: { tags: ['bulk-updated'] }
      };

      mockFrom.select.mockResolvedValue({ data: [], error: null });

      const result = await customerService.bulkUpdateCustomers(updates);

      expect(result.meta.status).toBe('success');
      expect(result.data.updated).toBe(2);
    });
  });

  describe('calculateCustomerMetrics', () => {
    it('should calculate customer metrics successfully', async () => {
      // Mock the database queries for metrics calculation
      mockFrom.single.mockResolvedValueOnce({ data: [{ count: 5 }], error: null }); // interactions
      mockFrom.single.mockResolvedValueOnce({ data: [{ sum: 1500 }], error: null }); // purchases

      const result = await customerService.calculateCustomerMetrics('1');

      expect(result.meta.status).toBe('success');
      expect(result.data).toHaveProperty('totalInteractions');
      expect(result.data).toHaveProperty('totalSpent');
    });
  });
}); 