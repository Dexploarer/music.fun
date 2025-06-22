import { staffApi } from '../../supabase';
import { financeService } from './financeService';
import type { TimeEntry, StaffMember } from '../../types';

export const payrollService = {
  async logClockIn(staffId: string) {
    return staffApi.clockIn(staffId);
  },

  async logClockOut(timeEntryId: string) {
    const entry = await staffApi.clockOut(timeEntryId);
    await this.recordPayroll(entry);
    return entry;
  },

  async recordPayroll(entry: TimeEntry) {
    const staff: StaffMember = await staffApi.getStaffMemberById(entry.staffId);
    const hours = entry.totalHours ?? 0;
    const rate = staff.hourlyRate ?? 0;
    const amount = Number((hours * rate).toFixed(2));

    await financeService.createTransaction({
      type: 'expense',
      category: 'payroll',
      amount,
      description: `Payroll for ${staff.firstName} ${staff.lastName}`,
      date: entry.clockOutTime ?? new Date().toISOString()
    });

    return { ...entry, payrollAmount: amount };
  },

  calculateHours(entries: TimeEntry[], staffId: string) {
    return entries
      .filter(e => e.staffId === staffId && e.clockOutTime)
      .reduce((sum, e) => sum + (e.totalHours ?? 0), 0);
  }
};

