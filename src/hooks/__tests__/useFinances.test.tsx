import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useFinances } from '../useFinances';
import { supabase } from '../../lib/supabase';

// Mock Supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn()
    }
  }
}));

// Mock toast notifications
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn()
  }
}));

describe('useFinances', () => {
  let mockFrom: any;

  beforeEach(() => {
    mockFrom = {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
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

  describe('initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useFinances());

      expect(result.current.transactions).toEqual([]);
      expect(result.current.budgets).toEqual([]);
      expect(result.current.expenses).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });
  });

  describe('loadTransactions', () => {
    it('should load transactions successfully', async () => {
      const mockTransactions = [
        {
          id: '1',
          type: 'revenue',
          amount: 1500,
          description: 'Event ticket sales',
          date: '2024-01-15',
          category: 'ticket_sales'
        },
        {
          id: '2',
          type: 'expense',
          amount: 500,
          description: 'Equipment rental',
          date: '2024-01-10',
          category: 'equipment'
        }
      ];

      mockFrom.single.mockResolvedValue({ data: mockTransactions, error: null });

      const { result } = renderHook(() => useFinances());

      await act(async () => {
        await result.current.loadTransactions();
      });

      await waitFor(() => {
        expect(result.current.transactions).toHaveLength(2);
        expect(result.current.transactions[0].type).toBe('revenue');
        expect(result.current.loading).toBe(false);
      });
    });

    it('should handle loading errors', async () => {
      const error = new Error('Database connection failed');
      mockFrom.single.mockResolvedValue({ data: null, error });

      const { result } = renderHook(() => useFinances());

      await act(async () => {
        await result.current.loadTransactions();
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to load transactions');
        expect(result.current.loading).toBe(false);
      });
    });

    it('should filter transactions by date range', async () => {
      const mockTransactions = [
        {
          id: '1',
          type: 'revenue',
          amount: 1500,
          date: '2024-01-15'
        }
      ];

      mockFrom.single.mockResolvedValue({ data: mockTransactions, error: null });

      const { result } = renderHook(() => useFinances());

      await act(async () => {
        await result.current.loadTransactions('2024-01-01', '2024-01-31');
      });

      expect(mockFrom.gte).toHaveBeenCalledWith('date', '2024-01-01');
      expect(mockFrom.lte).toHaveBeenCalledWith('date', '2024-01-31');
    });
  });

  describe('addTransaction', () => {
    it('should add a new transaction successfully', async () => {
      const newTransaction = {
        type: 'revenue' as const,
        amount: 2000,
        description: 'Merchandise sales',
        date: '2024-01-20',
        category: 'merchandise',
        eventId: 'event-1'
      };

      const mockCreatedTransaction = {
        id: '3',
        ...newTransaction,
        created_at: '2024-01-20T00:00:00Z'
      };

      mockFrom.select.mockResolvedValue({ data: [mockCreatedTransaction], error: null });

      const { result } = renderHook(() => useFinances());

      await act(async () => {
        await result.current.addTransaction(newTransaction);
      });

      expect(mockFrom.insert).toHaveBeenCalledWith([newTransaction]);
      expect(result.current.transactions).toContainEqual(
        expect.objectContaining({
          id: '3',
          type: 'revenue',
          amount: 2000
        })
      );
    });

    it('should validate transaction data', async () => {
      const invalidTransaction = {
        type: 'revenue' as const,
        amount: -100, // Invalid negative amount for revenue
        description: '',
        date: '2024-01-20',
        category: 'merchandise'
      };

      const { result } = renderHook(() => useFinances());

      await act(async () => {
        await result.current.addTransaction(invalidTransaction);
      });

      expect(result.current.error).toContain('Invalid transaction data');
    });

    it('should handle duplicate transaction prevention', async () => {
      const duplicateError = { code: '23505', message: 'duplicate key value' };
      mockFrom.select.mockResolvedValue({ data: null, error: duplicateError });

      const transaction = {
        type: 'revenue' as const,
        amount: 1000,
        description: 'Duplicate transaction',
        date: '2024-01-20',
        category: 'other'
      };

      const { result } = renderHook(() => useFinances());

      await act(async () => {
        await result.current.addTransaction(transaction);
      });

      expect(result.current.error).toContain('Transaction already exists');
    });
  });

  describe('updateTransaction', () => {
    it('should update an existing transaction', async () => {
      const existingTransaction = {
        id: '1',
        type: 'revenue' as const,
        amount: 1500,
        description: 'Event ticket sales',
        date: '2024-01-15',
        category: 'ticket_sales'
      };

      const updates = {
        amount: 1800,
        description: 'Updated event ticket sales'
      };

      mockFrom.select.mockResolvedValue({ 
        data: [{ ...existingTransaction, ...updates }], 
        error: null 
      });

      const { result } = renderHook(() => useFinances());

      // Initialize with existing transaction
      await act(async () => {
        result.current.transactions.push(existingTransaction);
      });

      await act(async () => {
        await result.current.updateTransaction('1', updates);
      });

      expect(mockFrom.update).toHaveBeenCalledWith(updates);
      expect(mockFrom.eq).toHaveBeenCalledWith('id', '1');
    });

    it('should handle transaction not found', async () => {
      mockFrom.select.mockResolvedValue({ data: [], error: null });

      const { result } = renderHook(() => useFinances());

      await act(async () => {
        await result.current.updateTransaction('999', { amount: 1000 });
      });

      expect(result.current.error).toContain('Transaction not found');
    });
  });

  describe('deleteTransaction', () => {
    it('should delete a transaction', async () => {
      mockFrom.single.mockResolvedValue({ data: null, error: null });

      const { result } = renderHook(() => useFinances());

      // Initialize with a transaction
      const existingTransaction = {
        id: '1',
        type: 'revenue' as const,
        amount: 1500,
        description: 'Event ticket sales',
        date: '2024-01-15',
        category: 'ticket_sales'
      };

      await act(async () => {
        result.current.transactions.push(existingTransaction);
      });

      await act(async () => {
        await result.current.deleteTransaction('1');
      });

      expect(mockFrom.delete).toHaveBeenCalled();
      expect(mockFrom.eq).toHaveBeenCalledWith('id', '1');
      expect(result.current.transactions).not.toContainEqual(
        expect.objectContaining({ id: '1' })
      );
    });
  });

  describe('generateReport', () => {
    it('should generate financial report successfully', async () => {
      const mockReportData = {
        totalRevenue: 5000,
        totalExpenses: 2000,
        netIncome: 3000,
        transactionsByCategory: {
          ticket_sales: 3000,
          merchandise: 2000,
          equipment: 1500,
          staff: 500
        },
        monthlyTrends: [
          { month: '2024-01', revenue: 2500, expenses: 1000 },
          { month: '2024-02', revenue: 2500, expenses: 1000 }
        ]
      };

      // Mock multiple database calls for report generation
      mockFrom.single.mockResolvedValueOnce({ data: [{ sum: 5000 }], error: null }); // revenue
      mockFrom.single.mockResolvedValueOnce({ data: [{ sum: 2000 }], error: null }); // expenses
      mockFrom.single.mockResolvedValue({ data: mockReportData.transactionsByCategory, error: null }); // categories

      const { result } = renderHook(() => useFinances());

      let report: any;
      await act(async () => {
        report = await result.current.generateReport('2024-01-01', '2024-02-29');
      });

      expect(report).toHaveProperty('totalRevenue');
      expect(report).toHaveProperty('totalExpenses');
      expect(report).toHaveProperty('netIncome');
      expect(report.netIncome).toBe(3000);
    });

    it('should handle report generation errors', async () => {
      const error = new Error('Report generation failed');
      mockFrom.single.mockResolvedValue({ data: null, error });

      const { result } = renderHook(() => useFinances());

      await act(async () => {
        await result.current.generateReport('2024-01-01', '2024-02-29');
      });

      expect(result.current.error).toContain('Failed to generate report');
    });
  });

  describe('calculateMetrics', () => {
    it('should calculate financial metrics correctly', async () => {
      const mockTransactions = [
        { type: 'revenue', amount: 1500, date: '2024-01-15' },
        { type: 'revenue', amount: 2000, date: '2024-01-20' },
        { type: 'expense', amount: 500, date: '2024-01-10' },
        { type: 'expense', amount: 300, date: '2024-01-25' }
      ];

      const { result } = renderHook(() => useFinances());

      await act(async () => {
        result.current.transactions.push(...mockTransactions);
      });

      const metrics = result.current.calculateMetrics();

      expect(metrics.totalRevenue).toBe(3500);
      expect(metrics.totalExpenses).toBe(800);
      expect(metrics.netIncome).toBe(2700);
      expect(metrics.profitMargin).toBeCloseTo(77.14, 2);
    });

    it('should handle empty transaction list', () => {
      const { result } = renderHook(() => useFinances());

      const metrics = result.current.calculateMetrics();

      expect(metrics.totalRevenue).toBe(0);
      expect(metrics.totalExpenses).toBe(0);
      expect(metrics.netIncome).toBe(0);
      expect(metrics.profitMargin).toBe(0);
    });
  });

  describe('budget management', () => {
    it('should create a new budget', async () => {
      const newBudget = {
        name: 'Event Marketing',
        category: 'marketing',
        amount: 5000,
        period: 'monthly' as const,
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      };

      const mockCreatedBudget = {
        id: '1',
        ...newBudget,
        spent: 0,
        remaining: 5000
      };

      mockFrom.select.mockResolvedValue({ data: [mockCreatedBudget], error: null });

      const { result } = renderHook(() => useFinances());

      await act(async () => {
        await result.current.createBudget(newBudget);
      });

      expect(result.current.budgets).toContainEqual(
        expect.objectContaining({
          name: 'Event Marketing',
          amount: 5000
        })
      );
    });

    it('should track budget utilization', async () => {
      const budget = {
        id: '1',
        name: 'Event Marketing',
        category: 'marketing',
        amount: 5000,
        spent: 3000,
        remaining: 2000
      };

      const { result } = renderHook(() => useFinances());

      await act(async () => {
        result.current.budgets.push(budget);
      });

      const utilization = result.current.getBudgetUtilization('1');

      expect(utilization).toBe(60); // 3000/5000 * 100
    });
  });
}); 