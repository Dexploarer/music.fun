import { describe, it, expect, vi, beforeEach } from 'vitest';
import { payrollService } from '../payrollService';
import { staffApi } from '../../supabase';
import { financeService } from './financeService';

vi.mock('../../supabase', () => ({
  staffApi: {
    getStaffMemberById: vi.fn(),
    clockIn: vi.fn(),
    clockOut: vi.fn(),
    getTimeEntries: vi.fn()
  }
}));

vi.mock('./financeService', () => ({
  financeService: { createTransaction: vi.fn() }
}));

describe('payrollService', () => {
  const entry = {
    id: 'e1',
    staffId: 's1',
    clockInTime: '',
    clockOutTime: 'now',
    totalHours: 5,
    approved: false
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calculates hours for a staff member', () => {
    const entries = [
      { ...entry, staffId: 's1', totalHours: 2 },
      { ...entry, staffId: 's1', totalHours: 3 },
      { ...entry, staffId: 's2', totalHours: 4 }
    ];
    const hours = payrollService.calculateHours(entries as any, 's1');
    expect(hours).toBe(5);
  });

  it('records payroll transaction on clock out', async () => {
    (staffApi.clockOut as any).mockResolvedValue(entry);
    (staffApi.getStaffMemberById as any).mockResolvedValue({
      id: 's1',
      firstName: 'Test',
      lastName: 'User',
      hourlyRate: 10
    });

    await payrollService.logClockOut('e1');

    expect(staffApi.clockOut).toHaveBeenCalledWith('e1');
    expect(financeService.createTransaction).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 50, category: 'payroll' })
    );
  });
});

