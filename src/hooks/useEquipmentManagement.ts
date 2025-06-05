import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Equipment, MaintenanceRecord } from '../types';
import { equipmentApi } from '../lib/supabase';

export function useEquipmentManagement() {
  const queryClient = useQueryClient();

  const equipmentQuery = useQuery({
    queryKey: ['equipment'],
    queryFn: () => equipmentApi.getEquipment(),
  });

  const maintenanceRecordsQuery = useQuery({
    queryKey: ['maintenance_records'],
    queryFn: () => equipmentApi.getMaintenanceRecords(),
  });

  const createEquipmentMutation = useMutation({
    mutationFn: (data: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>) =>
      equipmentApi.createEquipment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      toast.success('Equipment created successfully');
    },
    onError: () => toast.error('Failed to create equipment'),
  });

  const updateEquipmentMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'> }) =>
      equipmentApi.updateEquipment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      toast.success('Equipment updated');
    },
    onError: () => toast.error('Failed to update equipment'),
  });

  const createMaintenanceRecordMutation = useMutation({
    mutationFn: (data: Omit<MaintenanceRecord, 'id' | 'createdAt' | 'updatedAt'>) =>
      equipmentApi.createMaintenanceRecord(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance_records'] });
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      toast.success('Maintenance record added');
    },
    onError: () => toast.error('Failed to add record'),
  });

  const updateMaintenanceRecordMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<MaintenanceRecord, 'id' | 'createdAt' | 'updatedAt'> }) =>
      equipmentApi.updateMaintenanceRecord(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance_records'] });
      toast.success('Maintenance record updated');
    },
    onError: () => toast.error('Failed to update record'),
  });

  return {
    equipment: equipmentQuery.data || [],
    isLoading: equipmentQuery.isLoading,
    isError: equipmentQuery.isError,
    error: equipmentQuery.error,
    maintenanceRecords: maintenanceRecordsQuery.data || [],
    isLoadingMaintenanceRecords: maintenanceRecordsQuery.isLoading,
    createEquipment: createEquipmentMutation.mutateAsync,
    updateEquipment: (id: string, data: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>) =>
      updateEquipmentMutation.mutateAsync({ id, data }),
    createMaintenanceRecord: createMaintenanceRecordMutation.mutateAsync,
    updateMaintenanceRecord: (id: string, data: Omit<MaintenanceRecord, 'id' | 'createdAt' | 'updatedAt'>) =>
      updateMaintenanceRecordMutation.mutateAsync({ id, data }),
    isCreating: createEquipmentMutation.isPending || createMaintenanceRecordMutation.isPending,
    isUpdating: updateEquipmentMutation.isPending || updateMaintenanceRecordMutation.isPending,
  };
}
