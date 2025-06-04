import type { ServiceResponse } from '../lib/api/serviceResponse';

// Generic error interface that all hooks will use
export interface AppError {
  type: 'validation' | 'authentication' | 'authorization' | 'not_found' | 'server' | 'network' | 'unknown';
  message: string;
  details?: any;
  fieldErrors?: Record<string, string>;
}

// Convert service response to React Query compatible format
export const handleServiceResponse = <T>(response: ServiceResponse<T>, entityName: string = 'data'): T => {
  if (!response.success) {
    const error: AppError = {
      type: response.error?.status === 422 ? 'validation' : 
             response.error?.status === 401 ? 'authentication' :
             response.error?.status === 403 ? 'authorization' :
             response.error?.status === 404 ? 'not_found' : 'server',
      message: response.error?.detail || `Failed to process ${entityName}`,
      details: response.error,
      fieldErrors: response.error?.errors?.reduce((acc: Record<string, string>, err: any) => ({
        ...acc,
        [err.field]: err.message
      }), {})
    };
    throw error;
  }
  return response.data!;
};

// Error handling for network issues and unexpected errors
export const handleNetworkError = (error: any, operation: string): AppError => {
  console.error(`Network error during ${operation}:`, error);
  
  if (error instanceof Error) {
    return {
      type: 'network',
      message: `Network error occurred while ${operation}`,
      details: error
    };
  }
  
  return {
    type: 'unknown',
    message: `Unknown error occurred while ${operation}`,
    details: error
  };
};

// Format error messages for display
export const formatErrorMessage = (error: AppError): string => {
  if (error.fieldErrors && Object.keys(error.fieldErrors).length > 0) {
    return Object.values(error.fieldErrors).join(', ');
  }
  return error.message;
};

// Standard toast error display
export const displayError = (error: AppError, operation: string, toast?: any) => {
  const message = formatErrorMessage(error);
  if (toast) {
    toast.error(`Error ${operation}: ${message}`);
  } else {
    console.error(`Error ${operation}:`, message, error);
  }
};

// Standard success toast
export const displaySuccess = (message: string, toast?: any) => {
  if (toast) {
    toast.success(message);
  } else {
    console.log('Success:', message);
  }
};

// Enhanced mutation result type
export interface MutationResult<T = any> {
  success: boolean;
  data?: T;
  error?: AppError;
}

// Create standardized mutation wrapper
export const createMutationWrapper = <T, P extends any[]>(
  mutationFn: (...args: P) => Promise<T>,
  operation: string
) => {
  return async (...args: P): Promise<MutationResult<T>> => {
    try {
      const data = await mutationFn(...args);
      return { success: true, data };
    } catch (error) {
      // Check if error is already an AppError type
      const isAppError = error && typeof error === 'object' && 'type' in error && 'message' in error;
      const appError = isAppError 
        ? error as AppError 
        : handleNetworkError(error, operation);
      return { success: false, error: appError };
    }
  };
};

// Validation utilities
export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export const createFieldValidator = (schemaLoader: () => Promise<any>) => {
  return async (field: string, value: any): Promise<string | null> => {
    try {
      const schema = await schemaLoader();
      const fieldSchema = schema.shape?.[field];
      
      if (!fieldSchema) {
        return null; // Field not found in schema, consider valid
      }
      
      const result = fieldSchema.safeParse(value);
      
      if (!result.success) {
        return result.error.errors[0]?.message || 'Invalid value';
      }
      
      return null;
    } catch (err) {
      console.error('Field validation error:', err);
      return 'Validation failed';
    }
  };
};

export const createFormValidator = (schemaLoader: () => Promise<any>) => {
  return async (formData: any): Promise<ValidationResult> => {
    try {
      const schema = await schemaLoader();
      const result = schema.safeParse(formData);
      
      if (!result.success) {
        const errors = result.error.errors.reduce((acc: Record<string, string>, err: any) => ({
          ...acc,
          [err.path.join('.')]: err.message
        }), {});
        return { valid: false, errors };
      }
      
      return { valid: true, errors: {} };
    } catch (err) {
      console.error('Form validation error:', err);
      return { valid: false, errors: { form: 'Validation failed' } };
    }
  };
};

// React Query cache update utilities
export const updateCacheList = <T extends { id: string }>(
  queryClient: any,
  queryKey: string[],
  item: T,
  operation: 'add' | 'update' | 'remove'
) => {
  queryClient.setQueryData(queryKey, (old: T[] | undefined) => {
    if (!old) return operation === 'add' ? [item] : [];
    
    switch (operation) {
      case 'add':
        return [item, ...old];
      case 'update':
        return old.map(existing => existing.id === item.id ? item : existing);
      case 'remove':
        return old.filter(existing => existing.id !== item.id);
      default:
        return old;
    }
  });
};

// Standard cache times
export const CACHE_TIMES = {
  SHORT: 2 * 60 * 1000,    // 2 minutes
  MEDIUM: 5 * 60 * 1000,   // 5 minutes  
  LONG: 15 * 60 * 1000,    // 15 minutes
  VERY_LONG: 30 * 60 * 1000 // 30 minutes
};

export const STALE_TIMES = {
  SHORT: 1 * 60 * 1000,    // 1 minute
  MEDIUM: 3 * 60 * 1000,   // 3 minutes
  LONG: 10 * 60 * 1000,    // 10 minutes
  VERY_LONG: 20 * 60 * 1000 // 20 minutes
};

// Export common types
export type { ServiceResponse }; 