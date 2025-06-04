import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { crmApi } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import type { Customer, CustomerInteraction } from '../types';
import { useState, useCallback } from 'react';

export function useCustomers() {
  const queryClient = useQueryClient();

  const customersQuery = useQuery({
    queryKey: ['customers'],
    queryFn: crmApi.getCustomers
  });

  const createCustomerMutation = useMutation({
    mutationFn: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => crmApi.createCustomer(customer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer added successfully!');
    },
    onError: (error) => {
      toast.error(`Error adding customer: ${error.message}`);
    }
  });

  const updateCustomerMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<Customer> }) => 
      crmApi.updateCustomer(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer updated successfully!');
    },
    onError: (error) => {
      toast.error(`Error updating customer: ${error.message}`);
    }
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: (id: string) => crmApi.deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer deleted successfully!');
    },
    onError: (error) => {
      toast.error(`Error deleting customer: ${error.message}`);
    }
  });

  return {
    customers: customersQuery.data || [],
    isLoading: customersQuery.isLoading,
    isError: customersQuery.isError,
    error: customersQuery.error,
    createCustomer: createCustomerMutation.mutate,
    updateCustomer: updateCustomerMutation.mutate,
    deleteCustomer: deleteCustomerMutation.mutate,
    isCreating: createCustomerMutation.isPending,
    isUpdating: updateCustomerMutation.isPending,
    isDeleting: deleteCustomerMutation.isPending
  };
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: ['customers', id],
    queryFn: () => crmApi.getCustomerById(id),
    enabled: !!id
  });
}

export function useCustomerInteractions(customerId?: string) {
  const queryClient = useQueryClient();

  const interactionsQuery = useQuery({
    queryKey: ['customer_interactions', customerId],
    queryFn: () => crmApi.getCustomerInteractions(customerId),
    enabled: true
  });

  const createInteractionMutation = useMutation({
    mutationFn: (interaction: Omit<CustomerInteraction, 'id' | 'createdAt' | 'updatedAt'>) => 
      crmApi.createInteraction(interaction),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer_interactions'] });
      if (customerId) {
        queryClient.invalidateQueries({ queryKey: ['customer_interactions', customerId] });
      }
      toast.success('Interaction added successfully!');
    },
    onError: (error) => {
      toast.error(`Error adding interaction: ${error.message}`);
    }
  });

  const deleteInteractionMutation = useMutation({
    mutationFn: (id: string) => crmApi.deleteInteraction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer_interactions'] });
      if (customerId) {
        queryClient.invalidateQueries({ queryKey: ['customer_interactions', customerId] });
      }
      toast.success('Interaction deleted successfully!');
    },
    onError: (error) => {
      toast.error(`Error deleting interaction: ${error.message}`);
    }
  });

  return {
    interactions: interactionsQuery.data || [],
    isLoading: interactionsQuery.isLoading,
    isError: interactionsQuery.isError,
    error: interactionsQuery.error,
    createInteraction: createInteractionMutation.mutate,
    deleteInteraction: deleteInteractionMutation.mutate,
    isCreating: createInteractionMutation.isPending,
    isDeleting: deleteInteractionMutation.isPending
  };
}

// Validation hook for real-time customer form feedback
export const useCustomerValidation = () => {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = useState(false);

  const validateField = useCallback(async (field: string, value: any): Promise<string | null> => {
    setIsValidating(true);
    
    try {
      // Import validation schema
      const { CreateCustomerSchema } = await import('../lib/api/schemas/customerSchemas');
      
      // For ZodEffects schemas, we need to validate the whole object with just this field
      const partialData = { [field]: value };
      const result = CreateCustomerSchema.safeParse(partialData);
      
      if (!result.success) {
        // Find the specific error for this field
        const fieldError = result.error.errors.find(err => 
          err.path.length > 0 && err.path[0] === field
        );
        
        if (fieldError) {
          const error = fieldError.message || 'Invalid value';
          setFieldErrors(prev => ({ ...prev, [field]: error }));
          return error;
        }
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

  const validateForm = useCallback(async (formData: any): Promise<{ valid: boolean; errors: Record<string, string> }> => {
    setIsValidating(true);
    
    try {
      const { CreateCustomerSchema } = await import('../lib/api/schemas/customerSchemas');
      const result = CreateCustomerSchema.safeParse(formData);
      
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