import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useEquipmentManagement } from '../useEquipmentManagement';
import { equipmentApi } from '../../lib/supabase';

vi.mock('../../lib/supabase', () => ({
  equipmentApi: {
    getEquipment: vi.fn(),
    getMaintenanceRecords: vi.fn(),
    createEquipment: vi.fn(),
    updateEquipment: vi.fn(),
    createMaintenanceRecord: vi.fn(),
    updateMaintenanceRecord: vi.fn(),
  },
}));

vi.mock('react-hot-toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const mockEquipment = {
  id: 'eq1',
  name: 'Test',
  category: 'sound',
  condition: 'good' as const,
  location: 'Main',
  isActive: true,
};

describe('useEquipmentManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches equipment list', async () => {
    (equipmentApi.getEquipment as any).mockResolvedValueOnce([mockEquipment]);
    (equipmentApi.getMaintenanceRecords as any).mockResolvedValueOnce([]);

    const { result } = renderHook(() => useEquipmentManagement(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.equipment).toEqual([mockEquipment]);
    expect(equipmentApi.getEquipment).toHaveBeenCalled();
  });

  it('creates new equipment', async () => {
    (equipmentApi.getEquipment as any).mockResolvedValueOnce([]);
    (equipmentApi.getMaintenanceRecords as any).mockResolvedValueOnce([]);
    (equipmentApi.createEquipment as any).mockResolvedValueOnce(mockEquipment);

    const { result } = renderHook(() => useEquipmentManagement(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.createEquipment({
        name: 'Test',
        category: 'sound',
        condition: 'good',
        location: 'Main',
        isActive: true,
      } as any);
    });

    expect(equipmentApi.createEquipment).toHaveBeenCalled();
  });
});
