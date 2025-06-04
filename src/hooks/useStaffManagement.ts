import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffApi } from '../lib/supabase';
import { StaffMember, Shift, TimeEntry } from '../types';
import { toast } from 'react-hot-toast';
import { useState, useCallback } from 'react';

export function useStaffManagement() {
  const queryClient = useQueryClient();

  // Fetch staff members
  const staffQuery = useQuery({
    queryKey: ['staff'],
    queryFn: staffApi.getStaffMembers
  });

  // Fetch shifts
  const shiftsQuery = useQuery({
    queryKey: ['shifts'],
    queryFn: staffApi.getShifts
  });

  // Fetch time entries
  const timeEntriesQuery = useQuery({
    queryKey: ['time_entries'],
    queryFn: staffApi.getTimeEntries
  });

  // Create staff mutation
  const createStaffMutation = useMutation({
    mutationFn: (staffData: Omit<StaffMember, 'id' | 'createdAt' | 'updatedAt'>) => 
      staffApi.createStaffMember(staffData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast.success('Staff member created successfully!');
    },
    onError: (error) => {
      toast.error(`Error creating staff member: ${error.message}`);
    }
  });

  // Update staff mutation
  const updateStaffMutation = useMutation({
    mutationFn: ({ 
      id, 
      data 
    }: { 
      id: string; 
      data: Omit<StaffMember, 'id' | 'createdAt' | 'updatedAt'> 
    }) => staffApi.updateStaffMember(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast.success('Staff member updated successfully!');
    },
    onError: (error) => {
      toast.error(`Error updating staff member: ${error.message}`);
    }
  });

  // Delete staff mutation
  const deleteStaffMutation = useMutation({
    mutationFn: (id: string) => staffApi.deleteStaffMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast.success('Staff member deleted successfully!');
    },
    onError: (error) => {
      toast.error(`Error deleting staff member: ${error.message}`);
    }
  });

  // Create shift mutation
  const createShiftMutation = useMutation({
    mutationFn: (shiftData: Omit<Shift, 'id' | 'createdAt' | 'updatedAt'>) => 
      staffApi.createShift(shiftData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      toast.success('Shift created successfully!');
    },
    onError: (error) => {
      toast.error(`Error creating shift: ${error.message}`);
    }
  });

  // Update shift mutation
  const updateShiftMutation = useMutation({
    mutationFn: ({ 
      id, 
      data 
    }: { 
      id: string; 
      data: Omit<Shift, 'id' | 'createdAt' | 'updatedAt'> 
    }) => staffApi.updateShift(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      toast.success('Shift updated successfully!');
    },
    onError: (error) => {
      toast.error(`Error updating shift: ${error.message}`);
    }
  });

  // Delete shift mutation
  const deleteShiftMutation = useMutation({
    mutationFn: (id: string) => staffApi.deleteShift(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      toast.success('Shift deleted successfully!');
    },
    onError: (error) => {
      toast.error(`Error deleting shift: ${error.message}`);
    }
  });

  // Clock in mutation
  const clockInMutation = useMutation({
    mutationFn: (staffId: string) => staffApi.clockIn(staffId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time_entries'] });
      toast.success('Clocked in successfully!');
    },
    onError: (error) => {
      toast.error(`Error clocking in: ${error.message}`);
    }
  });

  // Clock out mutation
  const clockOutMutation = useMutation({
    mutationFn: (timeEntryId: string) => staffApi.clockOut(timeEntryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time_entries'] });
      toast.success('Clocked out successfully!');
    },
    onError: (error) => {
      toast.error(`Error clocking out: ${error.message}`);
    }
  });

  // Approve time entry mutation
  const approveTimeEntryMutation = useMutation({
    mutationFn: (timeEntryId: string) => staffApi.approveTimeEntry(timeEntryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time_entries'] });
      toast.success('Time entry approved successfully!');
    },
    onError: (error) => {
      toast.error(`Error approving time entry: ${error.message}`);
    }
  });

  return {
    // Data
    staff: staffQuery.data || [],
    isLoading: staffQuery.isLoading,
    isError: staffQuery.isError,
    error: staffQuery.error,
    
    shifts: shiftsQuery.data || [],
    isLoadingShifts: shiftsQuery.isLoading,
    isErrorShifts: shiftsQuery.isError,
    errorShifts: shiftsQuery.error,
    
    timeEntries: timeEntriesQuery.data || [],
    isLoadingTimeEntries: timeEntriesQuery.isLoading,
    isErrorTimeEntries: timeEntriesQuery.isError,
    errorTimeEntries: timeEntriesQuery.error,
    
    // Staff operations
    createStaff: (staffData: Omit<StaffMember, 'id' | 'createdAt' | 'updatedAt'>) => 
      createStaffMutation.mutateAsync(staffData),
      
    updateStaff: (id: string, staffData: Omit<StaffMember, 'id' | 'createdAt' | 'updatedAt'>) => 
      updateStaffMutation.mutateAsync({ id, data: staffData }),
      
    deleteStaff: (id: string) => 
      deleteStaffMutation.mutateAsync(id),
      
    // Shift operations
    createShift: (shiftData: Omit<Shift, 'id' | 'createdAt' | 'updatedAt'>) => 
      createShiftMutation.mutateAsync(shiftData),
      
    updateShift: (id: string, shiftData: Omit<Shift, 'id' | 'createdAt' | 'updatedAt'>) => 
      updateShiftMutation.mutateAsync({ id, data: shiftData }),
      
    deleteShift: (id: string) => 
      deleteShiftMutation.mutateAsync(id),
      
    // Time tracking operations
    clockIn: (staffId: string) => 
      clockInMutation.mutateAsync(staffId),
      
    clockOut: (timeEntryId: string) => 
      clockOutMutation.mutateAsync(timeEntryId),
      
    approveTimeEntry: (timeEntryId: string) => 
      approveTimeEntryMutation.mutateAsync(timeEntryId),
    
    // Loading states
    isCreatingStaff: createStaffMutation.isPending,
    isUpdatingStaff: updateStaffMutation.isPending,
    isDeletingStaff: deleteStaffMutation.isPending,
    
    isCreatingShift: createShiftMutation.isPending,
    isUpdatingShift: updateShiftMutation.isPending,
    isDeletingShift: deleteShiftMutation.isPending,
    
    isClockingIn: clockInMutation.isPending,
    isClockingOut: clockOutMutation.isPending,
    isApproving: approveTimeEntryMutation.isPending,
    
    // Legacy aliases for backward compatibility
    isCreating: createStaffMutation.isPending || createShiftMutation.isPending,
    isUpdating: updateStaffMutation.isPending || updateShiftMutation.isPending
  };
}

// Validation hook for real-time staff form feedback
export const useStaffValidation = () => {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = useState(false);

  const validateField = useCallback(async (field: string, value: any): Promise<string | null> => {
    setIsValidating(true);
    
    try {
      // Create a partial object with just the field to validate
      const partialData = { [field]: value };
      const { CreateStaffSchema } = await import('../lib/api/schemas/staffSchemas');
      
      // Validate using the full schema but only check for errors on this field
      const result = CreateStaffSchema.safeParse(partialData);
      
      if (!result.success) {
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
      const { CreateStaffSchema } = await import('../lib/api/schemas/staffSchemas');
      const result = CreateStaffSchema.safeParse(formData);
      
      if (!result.success) {
        const errors = result.error.errors.reduce((acc: Record<string, string>, err: any) => ({
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