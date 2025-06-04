import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import { financeService } from '../lib/api/services/financeService';
import type { 
  FinancialTransaction, 
  CreateFinancialTransactionRequest, 
  UpdateFinancialTransactionRequest, 
  FinancialTransactionQueryRequest,
  FinancialReport 
} from '../lib/api/schemas/financeSchemas';
import type { ApiResponse } from '../lib/api/types';
import { toast } from 'react-hot-toast';

// Enhanced error handling interface
interface FinancesError {
  type: 'validation' | 'authentication' | 'authorization' | 'not_found' | 'server' | 'network';
  message: string;
  details?: any;
  fieldErrors?: Record<string, string>;
}

// Convert service response to React Query compatible format
const handleServiceResponse = <T>(response: ApiResponse<T>) => {
  if (!response.success) {
    const error: FinancesError = {
      type: response.error?.status === 422 ? 'validation' : 
             response.error?.status === 401 ? 'authentication' :
             response.error?.status === 403 ? 'authorization' :
             response.error?.status === 404 ? 'not_found' : 'server',
      message: response.error?.detail || 'Operation failed',
      details: response.error,
      fieldErrors: response.error?.errors?.reduce((acc, err) => ({
        ...acc,
        [err.field]: err.message
      }), {})
    };
    throw error;
  }
  return response.data;
};

export function useFinances(query?: Partial<FinancialTransactionQueryRequest>) {
  const queryClient = useQueryClient();

  const transactionsQuery = useQuery({
    queryKey: ['financial_transactions', query],
    queryFn: async () => {
      const response = await financeService.getTransactions(query);
      return handleServiceResponse(response);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  const createTransactionMutation = useMutation({
    mutationFn: async (transactionData: CreateFinancialTransactionRequest) => {
      const response = await financeService.createTransaction(transactionData);
      return handleServiceResponse(response);
    },
    onSuccess: (newTransaction) => {
      queryClient.invalidateQueries({ queryKey: ['financial_transactions'] });
      // Optimistically update cache
      queryClient.setQueryData(['financial_transactions', 'all'], (old: FinancialTransaction[] | undefined) => 
        old ? [newTransaction, ...old] : [newTransaction]
      );
      toast.success('Transaction created successfully!');
    },
    onError: (error: FinancesError) => {
      const errorMessage = error.fieldErrors ? 
        Object.values(error.fieldErrors).join(', ') : 
        error.message;
      toast.error(`Error creating transaction: ${errorMessage}`);
    }
  });

  const updateTransactionMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: Omit<UpdateFinancialTransactionRequest, 'id'> }) => {
      const response = await financeService.updateTransaction(id, updates);
      return handleServiceResponse(response);
    },
    onSuccess: (updatedTransaction) => {
      queryClient.invalidateQueries({ queryKey: ['financial_transactions'] });
      // Optimistically update individual transaction cache
      queryClient.setQueryData(['financial_transactions', updatedTransaction.id], updatedTransaction);
      // Update in lists cache
      queryClient.setQueryData(['financial_transactions', 'all'], (old: FinancialTransaction[] | undefined) => 
        old ? old.map(transaction => transaction.id === updatedTransaction.id ? updatedTransaction : transaction) : [updatedTransaction]
      );
      toast.success('Transaction updated successfully!');
    },
    onError: (error: FinancesError) => {
      const errorMessage = error.fieldErrors ? 
        Object.values(error.fieldErrors).join(', ') : 
        error.message;
      toast.error(`Error updating transaction: ${errorMessage}`);
    }
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await financeService.deleteTransaction(id);
      return handleServiceResponse(response);
    },
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['financial_transactions'] });
      // Remove from cache
      queryClient.removeQueries({ queryKey: ['financial_transactions', deletedId] });
      // Update lists cache
      queryClient.setQueryData(['financial_transactions', 'all'], (old: FinancialTransaction[] | undefined) => 
        old ? old.filter(transaction => transaction.id !== deletedId) : []
      );
      toast.success('Transaction deleted successfully!');
    },
    onError: (error: FinancesError) => {
      toast.error(`Error deleting transaction: ${error.message}`);
    }
  });

  // Enhanced mutation functions with better return types
  const createTransaction = useCallback(async (transactionData: CreateFinancialTransactionRequest): Promise<{ success: boolean; transaction?: FinancialTransaction; error?: FinancesError }> => {
    try {
      const transaction = await createTransactionMutation.mutateAsync(transactionData);
      return { success: true, transaction };
    } catch (error) {
      return { success: false, error: error as FinancesError };
    }
  }, [createTransactionMutation]);

  const updateTransaction = useCallback(async (id: string, updates: Omit<UpdateFinancialTransactionRequest, 'id'>): Promise<{ success: boolean; transaction?: FinancialTransaction; error?: FinancesError }> => {
    try {
      const transaction = await updateTransactionMutation.mutateAsync({ id, updates });
      return { success: true, transaction };
    } catch (error) {
      return { success: false, error: error as FinancesError };
    }
  }, [updateTransactionMutation]);

  const deleteTransaction = useCallback(async (id: string): Promise<{ success: boolean; error?: FinancesError }> => {
    try {
      await deleteTransactionMutation.mutateAsync(id);
      return { success: true };
    } catch (error) {
      return { success: false, error: error as FinancesError };
    }
  }, [deleteTransactionMutation]);

  return {
    transactions: transactionsQuery.data || [],
    isLoading: transactionsQuery.isLoading,
    isError: transactionsQuery.isError,
    error: transactionsQuery.error as FinancesError,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    // Legacy support for direct mutation calls
    createTransactionMutation: createTransactionMutation.mutate,
    updateTransactionMutation: updateTransactionMutation.mutate,
    deleteTransactionMutation: deleteTransactionMutation.mutate,
    // Loading states
    isCreating: createTransactionMutation.isPending,
    isUpdating: updateTransactionMutation.isPending,
    isDeleting: deleteTransactionMutation.isPending,
    // Additional utilities
    refetch: transactionsQuery.refetch,
    invalidate: () => queryClient.invalidateQueries({ queryKey: ['financial_transactions'] })
  };
}

export function useTransaction(id: string) {
  const transactionQuery = useQuery({
    queryKey: ['financial_transactions', id],
    queryFn: async () => {
      if (!id) throw new Error('Transaction ID is required');
      const response = await financeService.getTransactionById(id);
      return handleServiceResponse(response);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    transaction: transactionQuery.data,
    isLoading: transactionQuery.isLoading,
    isError: transactionQuery.isError,
    error: transactionQuery.error as FinancesError,
    refetch: transactionQuery.refetch
  };
}

// Financial reports hook
export function useFinancialReports() {
  const getProfitAndLossQuery = useQuery({
    queryKey: ['financial_reports', 'profit_loss'],
    queryFn: async () => {
      const response = await financeService.getProfitAndLossReport();
      return handleServiceResponse(response);
    },
    staleTime: 15 * 60 * 1000, // 15 minutes for reports
    cacheTime: 30 * 60 * 1000, // 30 minutes
  });

  const getBalanceSheetQuery = useQuery({
    queryKey: ['financial_reports', 'balance_sheet'],
    queryFn: async () => {
      const response = await financeService.getBalanceSheetReport();
      return handleServiceResponse(response);
    },
    staleTime: 15 * 60 * 1000, // 15 minutes for reports
    cacheTime: 30 * 60 * 1000, // 30 minutes
  });

  const getCashFlowQuery = useQuery({
    queryKey: ['financial_reports', 'cash_flow'],
    queryFn: async () => {
      const response = await financeService.getCashFlowReport();
      return handleServiceResponse(response);
    },
    staleTime: 15 * 60 * 1000, // 15 minutes for reports
    cacheTime: 30 * 60 * 1000, // 30 minutes
  });

  return {
    profitAndLoss: getProfitAndLossQuery.data,
    balanceSheet: getBalanceSheetQuery.data,
    cashFlow: getCashFlowQuery.data,
    isLoadingProfitAndLoss: getProfitAndLossQuery.isLoading,
    isLoadingBalanceSheet: getBalanceSheetQuery.isLoading,
    isLoadingCashFlow: getCashFlowQuery.isLoading,
    isErrorProfitAndLoss: getProfitAndLossQuery.isError,
    isErrorBalanceSheet: getBalanceSheetQuery.isError,
    isErrorCashFlow: getCashFlowQuery.isError,
    errorProfitAndLoss: getProfitAndLossQuery.error as FinancesError,
    errorBalanceSheet: getBalanceSheetQuery.error as FinancesError,
    errorCashFlow: getCashFlowQuery.error as FinancesError,
    refetchProfitAndLoss: getProfitAndLossQuery.refetch,
    refetchBalanceSheet: getBalanceSheetQuery.refetch,
    refetchCashFlow: getCashFlowQuery.refetch
  };
}

// Event-specific financial data hook
export function useEventFinances(eventId: string) {
  const queryClient = useQueryClient();

  const eventFinancesQuery = useQuery({
    queryKey: ['event_finances', eventId],
    queryFn: async () => {
      if (!eventId) throw new Error('Event ID is required');
      const response = await financeService.getEventFinancialSummary(eventId);
      return handleServiceResponse(response);
    },
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  const recordRevenueMutation = useMutation({
    mutationFn: async ({ eventId, amount, source }: { eventId: string, amount: number, source: string }) => {
      const response = await financeService.recordEventRevenue(eventId, amount, source);
      return handleServiceResponse(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event_finances', eventId] });
      queryClient.invalidateQueries({ queryKey: ['financial_transactions'] });
      toast.success('Revenue recorded successfully!');
    },
    onError: (error: FinancesError) => {
      toast.error(`Error recording revenue: ${error.message}`);
    }
  });

  const recordExpenseMutation = useMutation({
    mutationFn: async ({ eventId, amount, category, description }: { eventId: string, amount: number, category: string, description?: string }) => {
      const response = await financeService.recordEventExpense(eventId, amount, category, description);
      return handleServiceResponse(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event_finances', eventId] });
      queryClient.invalidateQueries({ queryKey: ['financial_transactions'] });
      toast.success('Expense recorded successfully!');
    },
    onError: (error: FinancesError) => {
      toast.error(`Error recording expense: ${error.message}`);
    }
  });

  const recordRevenue = useCallback(async (amount: number, source: string): Promise<{ success: boolean; transaction?: FinancialTransaction; error?: FinancesError }> => {
    try {
      const transaction = await recordRevenueMutation.mutateAsync({ eventId, amount, source });
      return { success: true, transaction };
    } catch (error) {
      return { success: false, error: error as FinancesError };
    }
  }, [recordRevenueMutation, eventId]);

  const recordExpense = useCallback(async (amount: number, category: string, description?: string): Promise<{ success: boolean; transaction?: FinancialTransaction; error?: FinancesError }> => {
    try {
      const transaction = await recordExpenseMutation.mutateAsync({ eventId, amount, category, description });
      return { success: true, transaction };
    } catch (error) {
      return { success: false, error: error as FinancesError };
    }
  }, [recordExpenseMutation, eventId]);

  return {
    eventFinances: eventFinancesQuery.data,
    isLoading: eventFinancesQuery.isLoading,
    isError: eventFinancesQuery.isError,
    error: eventFinancesQuery.error as FinancesError,
    recordRevenue,
    recordExpense,
    isRecordingRevenue: recordRevenueMutation.isPending,
    isRecordingExpense: recordExpenseMutation.isPending,
    refetch: eventFinancesQuery.refetch
  };
}

// Validation hook for real-time form feedback
export const useFinanceValidation = () => {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = useState(false);

  const validateField = useCallback(async (field: string, value: any): Promise<string | null> => {
    setIsValidating(true);
    
    try {
      // Import validation schema
      const { CreateFinancialTransactionSchema } = await import('../lib/api/schemas/financeSchemas');
      
      // Validate specific field
      const result = CreateFinancialTransactionSchema.shape[field as keyof typeof CreateFinancialTransactionSchema.shape]?.safeParse(value);
      
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
      const { CreateFinancialTransactionSchema } = await import('../lib/api/schemas/financeSchemas');
      const result = CreateFinancialTransactionSchema.safeParse(formData);
      
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
export type { 
  FinancialTransaction, 
  CreateFinancialTransactionRequest, 
  UpdateFinancialTransactionRequest, 
  FinancialTransactionQueryRequest,
  FinancialReport,
  FinancesError 
};