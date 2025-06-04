import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import { inventoryService } from '../lib/api/services/inventoryService';
import type { 
  InventoryItem, 
  InventoryCategory, 
  InventoryTransaction,
  CreateInventoryItemRequest, 
  UpdateInventoryItemRequest, 
  InventoryQueryRequest,
  CreateInventoryCategoryRequest,
  UpdateInventoryCategoryRequest,
  CreateInventoryTransactionRequest
} from '../lib/api/schemas/inventorySchemas';
import { toast } from 'react-hot-toast';
import { 
  handleServiceResponse, 
  AppError, 
  formatErrorMessage, 
  updateCacheList,
  CACHE_TIMES,
  STALE_TIMES
} from './useErrorHandling';

// Enhanced mutation result type
interface MutationResult<T = any> {
  success: boolean;
  data?: T;
  error?: AppError;
}

// Categories hook
export function useInventoryCategories() {
  const queryClient = useQueryClient();

  const categoriesQuery = useQuery({
    queryKey: ['inventory_categories'],
    queryFn: async () => {
      const response = await inventoryService.getCategories();
      return handleServiceResponse(response, 'categories');
    },
    staleTime: STALE_TIMES.MEDIUM,
    cacheTime: CACHE_TIMES.MEDIUM,
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (categoryData: CreateInventoryCategoryRequest) => {
      const response = await inventoryService.createCategory(categoryData);
      return handleServiceResponse(response, 'category');
    },
    onSuccess: (newCategory) => {
      queryClient.invalidateQueries({ queryKey: ['inventory_categories'] });
      updateCacheList(queryClient, ['inventory_categories'], newCategory, 'add');
      toast.success('Category added successfully!');
    },
    onError: (error: AppError) => {
      const errorMessage = formatErrorMessage(error);
      toast.error(`Error adding category: ${errorMessage}`);
    }
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: Omit<UpdateInventoryCategoryRequest, 'id'> }) => {
      const response = await inventoryService.updateCategory(id, updates);
      return handleServiceResponse(response, 'category');
    },
    onSuccess: (updatedCategory) => {
      queryClient.invalidateQueries({ queryKey: ['inventory_categories'] });
      updateCacheList(queryClient, ['inventory_categories'], updatedCategory, 'update');
      toast.success('Category updated successfully!');
    },
    onError: (error: AppError) => {
      const errorMessage = formatErrorMessage(error);
      toast.error(`Error updating category: ${errorMessage}`);
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await inventoryService.deleteCategory(id);
      return handleServiceResponse(response, 'category deletion');
    },
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['inventory_categories'] });
      queryClient.removeQueries({ queryKey: ['inventory_categories', deletedId] });
      toast.success('Category deleted successfully!');
    },
    onError: (error: AppError) => {
      toast.error(`Error deleting category: ${error.message}`);
    }
  });

  // Enhanced mutation functions
  const createCategory = useCallback(async (categoryData: CreateInventoryCategoryRequest): Promise<MutationResult<InventoryCategory>> => {
    try {
      const category = await createCategoryMutation.mutateAsync(categoryData);
      return { success: true, data: category };
    } catch (error) {
      return { success: false, error: error as AppError };
    }
  }, [createCategoryMutation]);

  const updateCategory = useCallback(async (id: string, updates: Omit<UpdateInventoryCategoryRequest, 'id'>): Promise<MutationResult<InventoryCategory>> => {
    try {
      const category = await updateCategoryMutation.mutateAsync({ id, updates });
      return { success: true, data: category };
    } catch (error) {
      return { success: false, error: error as AppError };
    }
  }, [updateCategoryMutation]);

  const deleteCategory = useCallback(async (id: string): Promise<MutationResult<void>> => {
    try {
      await deleteCategoryMutation.mutateAsync(id);
      return { success: true };
    } catch (error) {
      return { success: false, error: error as AppError };
    }
  }, [deleteCategoryMutation]);

  return {
    categories: categoriesQuery.data || [],
    isLoading: categoriesQuery.isLoading,
    isError: categoriesQuery.isError,
    error: categoriesQuery.error as AppError,
    createCategory,
    updateCategory,
    deleteCategory,
    // Legacy support
    createCategoryMutation: createCategoryMutation.mutate,
    updateCategoryMutation: updateCategoryMutation.mutate,
    deleteCategoryMutation: deleteCategoryMutation.mutate,
    isCreating: createCategoryMutation.isPending,
    isUpdating: updateCategoryMutation.isPending,
    isDeleting: deleteCategoryMutation.isPending,
    refetch: categoriesQuery.refetch
  };
}

// Inventory Items hook
export function useInventoryItems(query?: Partial<InventoryQueryRequest>) {
  const queryClient = useQueryClient();

  const itemsQuery = useQuery({
    queryKey: ['inventory_items', query],
    queryFn: async () => {
      const response = await inventoryService.getItems(query);
      return handleServiceResponse(response, 'inventory items');
    },
    staleTime: STALE_TIMES.MEDIUM,
    cacheTime: CACHE_TIMES.MEDIUM,
  });

  const createItemMutation = useMutation({
    mutationFn: async (itemData: CreateInventoryItemRequest) => {
      const response = await inventoryService.createItem(itemData);
      return handleServiceResponse(response, 'inventory item');
    },
    onSuccess: (newItem) => {
      queryClient.invalidateQueries({ queryKey: ['inventory_items'] });
      updateCacheList(queryClient, ['inventory_items'], newItem, 'add');
      toast.success('Item added successfully!');
    },
    onError: (error: AppError) => {
      const errorMessage = formatErrorMessage(error);
      toast.error(`Error adding item: ${errorMessage}`);
    }
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: Omit<UpdateInventoryItemRequest, 'id'> }) => {
      const response = await inventoryService.updateItem(id, updates);
      return handleServiceResponse(response, 'inventory item');
    },
    onSuccess: (updatedItem) => {
      queryClient.invalidateQueries({ queryKey: ['inventory_items'] });
      queryClient.setQueryData(['inventory_items', updatedItem.id], updatedItem);
      updateCacheList(queryClient, ['inventory_items'], updatedItem, 'update');
      toast.success('Item updated successfully!');
    },
    onError: (error: AppError) => {
      const errorMessage = formatErrorMessage(error);
      toast.error(`Error updating item: ${errorMessage}`);
    }
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await inventoryService.deleteItem(id);
      return handleServiceResponse(response, 'inventory item deletion');
    },
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['inventory_items'] });
      queryClient.removeQueries({ queryKey: ['inventory_items', deletedId] });
      toast.success('Item deleted successfully!');
    },
    onError: (error: AppError) => {
      toast.error(`Error deleting item: ${error.message}`);
    }
  });

  // Enhanced mutation functions
  const createItem = useCallback(async (itemData: CreateInventoryItemRequest): Promise<MutationResult<InventoryItem>> => {
    try {
      const item = await createItemMutation.mutateAsync(itemData);
      return { success: true, data: item };
    } catch (error) {
      return { success: false, error: error as AppError };
    }
  }, [createItemMutation]);

  const updateItem = useCallback(async (id: string, updates: Omit<UpdateInventoryItemRequest, 'id'>): Promise<MutationResult<InventoryItem>> => {
    try {
      const item = await updateItemMutation.mutateAsync({ id, updates });
      return { success: true, data: item };
    } catch (error) {
      return { success: false, error: error as AppError };
    }
  }, [updateItemMutation]);

  const deleteItem = useCallback(async (id: string): Promise<MutationResult<void>> => {
    try {
      await deleteItemMutation.mutateAsync(id);
      return { success: true };
    } catch (error) {
      return { success: false, error: error as AppError };
    }
  }, [deleteItemMutation]);

  return {
    items: itemsQuery.data || [],
    isLoading: itemsQuery.isLoading,
    isError: itemsQuery.isError,
    error: itemsQuery.error as AppError,
    createItem,
    updateItem,
    deleteItem,
    // Legacy support
    createItemMutation: createItemMutation.mutate,
    updateItemMutation: updateItemMutation.mutate,
    deleteItemMutation: deleteItemMutation.mutate,
    isCreating: createItemMutation.isPending,
    isUpdating: updateItemMutation.isPending,
    isDeleting: deleteItemMutation.isPending,
    refetch: itemsQuery.refetch
  };
}

export function useInventoryItem(id: string) {
  const itemQuery = useQuery({
    queryKey: ['inventory_items', id],
    queryFn: async () => {
      if (!id) throw new Error('Item ID is required');
      const response = await inventoryService.getItemById(id);
      return handleServiceResponse(response, 'inventory item');
    },
    enabled: !!id,
    staleTime: STALE_TIMES.MEDIUM,
    cacheTime: CACHE_TIMES.MEDIUM,
  });

  return {
    item: itemQuery.data,
    isLoading: itemQuery.isLoading,
    isError: itemQuery.isError,
    error: itemQuery.error as AppError,
    refetch: itemQuery.refetch
  };
}

// Inventory Transactions hook
export function useInventoryTransactions(itemId?: string, query?: Partial<InventoryQueryRequest>) {
  const queryClient = useQueryClient();

  const transactionsQuery = useQuery({
    queryKey: ['inventory_transactions', itemId, query],
    queryFn: async () => {
      const response = await inventoryService.getTransactions({ 
        ...query, 
        itemId 
      });
      return handleServiceResponse(response, 'inventory transactions');
    },
    staleTime: STALE_TIMES.SHORT,
    cacheTime: CACHE_TIMES.SHORT,
  });

  const createTransactionMutation = useMutation({
    mutationFn: async (transactionData: CreateInventoryTransactionRequest) => {
      const response = await inventoryService.createTransaction(transactionData);
      return handleServiceResponse(response, 'inventory transaction');
    },
    onSuccess: (newTransaction) => {
      queryClient.invalidateQueries({ queryKey: ['inventory_transactions'] });
      queryClient.invalidateQueries({ queryKey: ['inventory_items'] });
      if (itemId) {
        queryClient.invalidateQueries({ queryKey: ['inventory_transactions', itemId] });
        queryClient.invalidateQueries({ queryKey: ['inventory_items', itemId] });
      }
      toast.success('Transaction recorded successfully!');
    },
    onError: (error: AppError) => {
      const errorMessage = formatErrorMessage(error);
      toast.error(`Error recording transaction: ${errorMessage}`);
    }
  });

  const createTransaction = useCallback(async (transactionData: CreateInventoryTransactionRequest): Promise<MutationResult<InventoryTransaction>> => {
    try {
      const transaction = await createTransactionMutation.mutateAsync(transactionData);
      return { success: true, data: transaction };
    } catch (error) {
      return { success: false, error: error as AppError };
    }
  }, [createTransactionMutation]);

  return {
    transactions: transactionsQuery.data || [],
    isLoading: transactionsQuery.isLoading,
    isError: transactionsQuery.isError,
    error: transactionsQuery.error as AppError,
    createTransaction,
    // Legacy support
    createTransactionMutation: createTransactionMutation.mutate,
    isCreating: createTransactionMutation.isPending,
    refetch: transactionsQuery.refetch
  };
}

// Low stock items hook
export function useLowStockItems(threshold?: number) {
  return useQuery({
    queryKey: ['low_stock_items', threshold],
    queryFn: async () => {
      const response = await inventoryService.getLowStockItems(threshold);
      return handleServiceResponse(response, 'low stock items');
    },
    staleTime: STALE_TIMES.SHORT,
    cacheTime: CACHE_TIMES.SHORT,
  });
}

// Validation hook for inventory forms
export const useInventoryValidation = () => {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = useState(false);

  const validateField = useCallback(async (field: string, value: any, schema: 'item' | 'category' | 'transaction'): Promise<string | null> => {
    setIsValidating(true);
    
    try {
      let schemaModule;
      switch (schema) {
        case 'item':
          schemaModule = await import('../lib/api/schemas/inventorySchemas');
          const itemResult = schemaModule.CreateInventoryItemSchema.shape[field as keyof typeof schemaModule.CreateInventoryItemSchema.shape]?.safeParse(value);
          if (itemResult && !itemResult.success) {
            const error = itemResult.error.errors[0]?.message || 'Invalid value';
            setFieldErrors(prev => ({ ...prev, [field]: error }));
            return error;
          }
          break;
        case 'category':
          schemaModule = await import('../lib/api/schemas/inventorySchemas');
          const categoryResult = schemaModule.CreateInventoryCategorySchema.shape[field as keyof typeof schemaModule.CreateInventoryCategorySchema.shape]?.safeParse(value);
          if (categoryResult && !categoryResult.success) {
            const error = categoryResult.error.errors[0]?.message || 'Invalid value';
            setFieldErrors(prev => ({ ...prev, [field]: error }));
            return error;
          }
          break;
        case 'transaction':
          schemaModule = await import('../lib/api/schemas/inventorySchemas');
          const transactionResult = schemaModule.CreateInventoryTransactionSchema.shape[field as keyof typeof schemaModule.CreateInventoryTransactionSchema.shape]?.safeParse(value);
          if (transactionResult && !transactionResult.success) {
            const error = transactionResult.error.errors[0]?.message || 'Invalid value';
            setFieldErrors(prev => ({ ...prev, [field]: error }));
            return error;
          }
          break;
      }
      
      setFieldErrors(prev => {
        const { [field]: _, ...rest } = prev;
        return rest;
      });
      return null;
    } catch (err) {
      console.error('Validation error:', err);
      return 'Validation failed';
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
    clearFieldError,
    clearAllErrors
  };
};

// Export types for better TypeScript support
export type { 
  InventoryItem, 
  InventoryCategory, 
  InventoryTransaction,
  CreateInventoryItemRequest, 
  UpdateInventoryItemRequest, 
  InventoryQueryRequest,
  CreateInventoryCategoryRequest,
  UpdateInventoryCategoryRequest,
  CreateInventoryTransactionRequest,
  AppError,
  MutationResult
};