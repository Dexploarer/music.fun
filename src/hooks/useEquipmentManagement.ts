import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Equipment, MaintenanceRecord } from '../types';
import { toast } from 'react-hot-toast';
import { addMonths, format } from 'date-fns';

// Mock data for equipment
const mockEquipment: Equipment[] = [
  {
    id: 'eq1',
    name: 'Soundboard - Allen & Heath SQ-6',
    category: 'sound',
    serialNumber: 'SQ6-12345',
    manufacturer: 'Allen & Heath',
    model: 'SQ-6',
    purchaseDate: '2023-01-15',
    purchasePrice: 4999.99,
    condition: 'excellent',
    location: 'Main Stage',
    notes: 'Main digital mixer for house sound',
    lastMaintenance: '2023-08-15',
    nextMaintenance: '2024-02-15',
    isActive: true,
    createdAt: '2023-01-15T12:00:00Z',
    updatedAt: '2023-08-15T14:30:00Z'
  },
  {
    id: 'eq2',
    name: 'JBL EON615 PA Speaker (Left)',
    category: 'sound',
    serialNumber: 'EON615-789123',
    manufacturer: 'JBL',
    model: 'EON615',
    purchaseDate: '2022-06-10',
    purchasePrice: 699.95,
    condition: 'good',
    location: 'Main Stage',
    notes: 'Left main PA speaker',
    lastMaintenance: '2023-06-10',
    nextMaintenance: format(addMonths(new Date(), 1), 'yyyy-MM-dd'),
    isActive: true,
    createdAt: '2022-06-10T12:00:00Z',
    updatedAt: '2023-06-10T14:30:00Z'
  },
  {
    id: 'eq3',
    name: 'JBL EON615 PA Speaker (Right)',
    category: 'sound',
    serialNumber: 'EON615-789124',
    manufacturer: 'JBL',
    model: 'EON615',
    purchaseDate: '2022-06-10',
    purchasePrice: 699.95,
    condition: 'good',
    location: 'Main Stage',
    notes: 'Right main PA speaker',
    lastMaintenance: '2023-06-10',
    nextMaintenance: format(addMonths(new Date(), 1), 'yyyy-MM-dd'),
    isActive: true,
    createdAt: '2022-06-10T12:00:00Z',
    updatedAt: '2023-06-10T14:30:00Z'
  },
  {
    id: 'eq4',
    name: 'Shure SM58 Microphone',
    category: 'sound',
    serialNumber: 'SM58-456789',
    manufacturer: 'Shure',
    model: 'SM58',
    purchaseDate: '2022-03-20',
    purchasePrice: 99.99,
    condition: 'excellent',
    location: 'Storage Room',
    notes: 'Vocal microphone',
    lastMaintenance: '2023-09-01',
    nextMaintenance: '2024-03-01',
    isActive: true,
    createdAt: '2022-03-20T12:00:00Z',
    updatedAt: '2023-09-01T14:30:00Z'
  },
  {
    id: 'eq5',
    name: 'Chauvet DJ SlimPAR Pro',
    category: 'lighting',
    serialNumber: 'SLIM123456',
    manufacturer: 'Chauvet DJ',
    model: 'SlimPAR Pro',
    purchaseDate: '2022-11-05',
    purchasePrice: 249.99,
    condition: 'good',
    location: 'Main Stage',
    notes: 'RGB LED lighting fixture',
    lastMaintenance: '2023-11-05',
    nextMaintenance: format(addMonths(new Date(), 2), 'yyyy-MM-dd'),
    isActive: true,
    createdAt: '2022-11-05T12:00:00Z',
    updatedAt: '2023-11-05T14:30:00Z'
  },
  {
    id: 'eq6',
    name: 'Roland Jazz Chorus JC-120',
    category: 'instruments',
    serialNumber: 'JC120-987654',
    manufacturer: 'Roland',
    model: 'Jazz Chorus JC-120',
    purchaseDate: '2021-07-15',
    purchasePrice: 1299.99,
    condition: 'fair',
    location: 'Side Stage',
    notes: 'Guitar amplifier - needs new speaker',
    lastMaintenance: '2023-02-10',
    nextMaintenance: format(addMonths(new Date(), -1), 'yyyy-MM-dd'),
    isActive: true,
    createdAt: '2021-07-15T12:00:00Z',
    updatedAt: '2023-02-10T14:30:00Z'
  },
  {
    id: 'eq7',
    name: 'Fender American Professional Stratocaster',
    category: 'instruments',
    serialNumber: 'US21023456',
    manufacturer: 'Fender',
    model: 'American Professional Stratocaster',
    purchaseDate: '2022-09-12',
    purchasePrice: 1699.99,
    condition: 'excellent',
    location: 'Storage Room',
    notes: 'House electric guitar',
    lastMaintenance: '2023-09-12',
    nextMaintenance: '2024-03-12',
    isActive: true,
    createdAt: '2022-09-12T12:00:00Z',
    updatedAt: '2023-09-12T14:30:00Z'
  },
  {
    id: 'eq8',
    name: 'Behringer X32 Mixer',
    category: 'sound',
    serialNumber: 'X32-123987',
    manufacturer: 'Behringer',
    model: 'X32',
    purchaseDate: '2020-03-15',
    purchasePrice: 2499.99,
    condition: 'poor',
    location: 'Storage Room',
    notes: 'Backup mixer - needs repair on channel 5-8',
    lastMaintenance: '2022-10-05',
    nextMaintenance: format(addMonths(new Date(), -2), 'yyyy-MM-dd'),
    isActive: false,
    createdAt: '2020-03-15T12:00:00Z',
    updatedAt: '2022-10-05T14:30:00Z'
  }
];

// Mock data for maintenance records
const mockMaintenanceRecords: MaintenanceRecord[] = [
  {
    id: 'maint1',
    equipmentId: 'eq1',
    maintenanceDate: '2023-08-15',
    maintenanceType: 'routine',
    performedBy: 'John Smith',
    cost: 150.00,
    notes: 'Firmware updated, faders cleaned and calibrated',
    createdAt: '2023-08-15T14:30:00Z',
    updatedAt: '2023-08-15T14:30:00Z'
  },
  {
    id: 'maint2',
    equipmentId: 'eq2',
    maintenanceDate: '2023-06-10',
    maintenanceType: 'inspection',
    performedBy: 'Audio Solutions Inc',
    cost: 75.00,
    notes: 'Checked connections and speaker cone, all in good condition',
    createdAt: '2023-06-10T14:30:00Z',
    updatedAt: '2023-06-10T14:30:00Z'
  },
  {
    id: 'maint3',
    equipmentId: 'eq3',
    maintenanceDate: '2023-06-10',
    maintenanceType: 'inspection',
    performedBy: 'Audio Solutions Inc',
    cost: 75.00,
    notes: 'Checked connections and speaker cone, all in good condition',
    createdAt: '2023-06-10T14:30:00Z',
    updatedAt: '2023-06-10T14:30:00Z'
  },
  {
    id: 'maint4',
    equipmentId: 'eq6',
    maintenanceDate: '2023-02-10',
    maintenanceType: 'repair',
    performedBy: 'Guitar Center',
    cost: 220.00,
    notes: 'Replaced faulty power cable, cleaned input jacks',
    createdAt: '2023-02-10T14:30:00Z',
    updatedAt: '2023-02-10T14:30:00Z'
  },
  {
    id: 'maint5',
    equipmentId: 'eq8',
    maintenanceDate: '2022-10-05',
    maintenanceType: 'repair',
    performedBy: 'Audio Solutions Inc',
    cost: 350.00,
    notes: 'Attempted repair of channels 5-8, still not functioning correctly. Unit may need to be sent to manufacturer.',
    createdAt: '2022-10-05T14:30:00Z',
    updatedAt: '2022-10-05T14:30:00Z'
  }
];

export function useEquipmentManagement() {
  const queryClient = useQueryClient();
  const [localEquipment, setLocalEquipment] = useState<Equipment[]>(mockEquipment);
  const [localMaintenanceRecords, setLocalMaintenanceRecords] = useState<MaintenanceRecord[]>(mockMaintenanceRecords);
  
  // Fetch equipment
  const equipmentQuery = useQuery({
    queryKey: ['equipment'],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return localEquipment;
    }
  });
  
  // Fetch maintenance records
  const maintenanceRecordsQuery = useQuery({
    queryKey: ['maintenance_records'],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return localMaintenanceRecords;
    }
  });
  
  // Create equipment mutation
  const createEquipmentMutation = useMutation({
    mutationFn: async (equipmentData: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>) => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newEquipment: Equipment = {
        ...equipmentData,
        id: `eq${localEquipment.length + 1}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setLocalEquipment(prev => [...prev, newEquipment]);
      return newEquipment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    }
  });
  
  // Update equipment mutation
  const updateEquipmentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'> }) => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedEquipment: Equipment = {
        ...data,
        id,
        updatedAt: new Date().toISOString(),
        createdAt: localEquipment.find(e => e.id === id)?.createdAt || new Date().toISOString()
      };
      
      setLocalEquipment(prev => 
        prev.map(equipment => equipment.id === id ? updatedEquipment : equipment)
      );
      
      return updatedEquipment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    }
  });
  
  // Create maintenance record mutation
  const createMaintenanceRecordMutation = useMutation({
    mutationFn: async (recordData: Omit<MaintenanceRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newRecord: MaintenanceRecord = {
        ...recordData,
        id: `maint${localMaintenanceRecords.length + 1}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setLocalMaintenanceRecords(prev => [...prev, newRecord]);
      
      // Update equipment last maintenance and next maintenance
      const equipment = localEquipment.find(e => e.id === recordData.equipmentId);
      if (equipment) {
        const updatedEquipment: Equipment = {
          ...equipment,
          lastMaintenance: recordData.maintenanceDate,
          nextMaintenance: format(addMonths(new Date(recordData.maintenanceDate), 6), 'yyyy-MM-dd'),
          updatedAt: new Date().toISOString()
        };
        
        setLocalEquipment(prev => 
          prev.map(e => e.id === equipment.id ? updatedEquipment : e)
        );
      }
      
      return newRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance_records'] });
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    }
  });
  
  // Update maintenance record mutation
  const updateMaintenanceRecordMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Omit<MaintenanceRecord, 'id' | 'createdAt' | 'updatedAt'> }) => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedRecord: MaintenanceRecord = {
        ...data,
        id,
        updatedAt: new Date().toISOString(),
        createdAt: localMaintenanceRecords.find(r => r.id === id)?.createdAt || new Date().toISOString()
      };
      
      setLocalMaintenanceRecords(prev => 
        prev.map(record => record.id === id ? updatedRecord : record)
      );
      
      return updatedRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance_records'] });
    }
  });
  
  return {
    equipment: equipmentQuery.data || [],
    isLoading: equipmentQuery.isLoading,
    isError: equipmentQuery.isError,
    error: equipmentQuery.error,
    
    maintenanceRecords: maintenanceRecordsQuery.data || [],
    isLoadingMaintenanceRecords: maintenanceRecordsQuery.isLoading,
    
    createEquipment: (equipmentData: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>) => 
      createEquipmentMutation.mutateAsync(equipmentData),
      
    updateEquipment: (id: string, data: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>) => 
      updateEquipmentMutation.mutateAsync({ id, data }),
      
    createMaintenanceRecord: (recordData: Omit<MaintenanceRecord, 'id' | 'createdAt' | 'updatedAt'>) => 
      createMaintenanceRecordMutation.mutateAsync(recordData),
      
    updateMaintenanceRecord: (id: string, data: Omit<MaintenanceRecord, 'id' | 'createdAt' | 'updatedAt'>) => 
      updateMaintenanceRecordMutation.mutateAsync({ id, data }),
      
    isCreating: createEquipmentMutation.isPending || createMaintenanceRecordMutation.isPending,
    isUpdating: updateEquipmentMutation.isPending || updateMaintenanceRecordMutation.isPending
  };
}