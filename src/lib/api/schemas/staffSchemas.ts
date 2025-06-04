/**
 * Staff Schemas - Train Station Dashboard API Standards
 * Comprehensive validation schemas for Staff, Roles, Schedules, and Time Tracking
 * with business rule enforcement and role-based permission validation
 */

import { z } from 'zod';

// Base validation schemas
const EmailSchema = z.string().email('Invalid email format');
const PhoneSchema = z.string()
  .regex(/^[+]?[1-9][\d]{0,15}$/, 'Invalid phone number format')
  .optional();

const HourlyRateSchema = z.number().min(0, 'Hourly rate must be positive');
const PasswordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase, uppercase, and number');

// Role and Permission schemas
const PermissionSchema = z.object({
  resource: z.enum([
    'events', 'artists', 'customers', 'inventory', 'finances', 'staff',
    'documents', 'analytics', 'settings', 'reports', 'marketing'
  ]),
  actions: z.array(z.enum(['create', 'read', 'update', 'delete', 'approve', 'export']))
    .min(1, 'At least one action is required')
});

const RoleBaseFields = z.object({
  name: z.string()
    .min(1, 'Role name is required')
    .max(50, 'Role name must be less than 50 characters')
    .trim(),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  permissions: z.array(PermissionSchema)
    .min(1, 'At least one permission is required'),
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false),
  hierarchy: z.number().min(1).max(10).default(5)
    .describe('Role hierarchy level (1=highest, 10=lowest)')
});

export const CreateRoleSchema = RoleBaseFields;

export const UpdateRoleSchema = z.object({
  id: z.string().uuid('Invalid role ID')
}).merge(RoleBaseFields.partial());

// Staff base fields
const StaffBaseFields = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .trim(),
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .trim(),
  email: EmailSchema,
  phone: PhoneSchema,
  employeeId: z.string()
    .min(1, 'Employee ID is required')
    .max(20, 'Employee ID must be less than 20 characters')
    .trim()
    .regex(/^[A-Za-z0-9-_]+$/, 'Employee ID can only contain letters, numbers, hyphens, and underscores'),
  roleId: z.string().uuid('Invalid role ID'),
  department: z.enum([
    'management', 'events', 'finance', 'marketing', 'operations', 
    'security', 'maintenance', 'customer_service', 'technical'
  ]).describe('Staff department'),
  position: z.string()
    .min(1, 'Position is required')
    .max(100, 'Position must be less than 100 characters')
    .trim(),
  hireDate: z.string().datetime(),
  hourlyRate: HourlyRateSchema.optional(),
  address: z.string().max(200, 'Address must be less than 200 characters').optional(),
  city: z.string().max(50, 'City must be less than 50 characters').optional(),
  state: z.string().max(30, 'State must be less than 30 characters').optional(),
  zip: z.string()
    .regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format')
    .optional(),
  emergencyContact: z.object({
    name: z.string().min(1).max(100),
    phone: z.string().regex(/^[+]?[1-9][\d]{0,15}$/),
    relationship: z.string().max(50)
  }).optional(),
  skills: z.array(z.string().trim().min(1)).max(20, 'Maximum 20 skills allowed').default([]),
  certifications: z.array(z.object({
    name: z.string().min(1).max(100),
    issuedBy: z.string().max(100),
    issuedDate: z.string().datetime(),
    expiryDate: z.string().datetime().optional()
  })).max(20, 'Maximum 20 certifications allowed').default([]),
  isActive: z.boolean().default(true),
  canLogin: z.boolean().default(true),
  requiresApproval: z.boolean().default(false)
});

// Staff creation with business rules
export const CreateStaffSchema = StaffBaseFields.merge(z.object({
  password: PasswordSchema,
  confirmPassword: z.string()
})).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  }
).refine(
  (data) => new Date(data.hireDate) <= new Date(),
  {
    message: 'Hire date cannot be in the future',
    path: ['hireDate']
  }
).refine(
  (data) => {
    // Check certification expiry dates
    return data.certifications.every(cert => 
      !cert.expiryDate || new Date(cert.expiryDate) > new Date(cert.issuedDate)
    );
  },
  {
    message: 'Certification expiry date must be after issued date',
    path: ['certifications']
  }
);

// Staff update schema (no password change here)
export const UpdateStaffSchema = z.object({
  id: z.string().uuid('Invalid staff ID')
}).merge(StaffBaseFields.partial().omit({ employeeId: true }));

// Password change schema
export const ChangePasswordSchema = z.object({
  staffId: z.string().uuid('Invalid staff ID'),
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: PasswordSchema,
  confirmPassword: z.string()
}).refine(
  (data) => data.newPassword === data.confirmPassword,
  {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  }
).refine(
  (data) => data.currentPassword !== data.newPassword,
  {
    message: 'New password must be different from current password',
    path: ['newPassword']
  }
);

// Schedule schemas
const ScheduleBaseFields = z.object({
  staffId: z.string().uuid('Invalid staff ID'),
  eventId: z.string().uuid().optional(),
  shiftType: z.enum(['regular', 'overtime', 'event', 'training', 'meeting', 'other'])
    .describe('Type of scheduled shift'),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  title: z.string()
    .min(1, 'Schedule title is required')
    .max(200, 'Title must be less than 200 characters'),
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  location: z.string()
    .max(200, 'Location must be less than 200 characters')
    .optional(),
  isRecurring: z.boolean().default(false),
  recurringPattern: z.object({
    frequency: z.enum(['daily', 'weekly', 'monthly']),
    interval: z.number().min(1).max(365),
    daysOfWeek: z.array(z.number().min(0).max(6)).optional(), // 0=Sunday, 6=Saturday
    endDate: z.string().datetime().optional()
  }).optional(),
  status: z.enum(['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'])
    .default('scheduled'),
  notes: z.string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional()
});

export const CreateScheduleSchema = ScheduleBaseFields.refine(
  (data) => new Date(data.endTime) > new Date(data.startTime),
  {
    message: 'End time must be after start time',
    path: ['endTime']
  }
).refine(
  (data) => {
    // Check for reasonable shift length (max 24 hours)
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return hours <= 24;
  },
  {
    message: 'Shift cannot be longer than 24 hours',
    path: ['endTime']
  }
).refine(
  (data) => {
    if (data.isRecurring && !data.recurringPattern) {
      return false;
    }
    return true;
  },
  {
    message: 'Recurring schedules must specify pattern',
    path: ['recurringPattern']
  }
);

export const UpdateScheduleSchema = z.object({
  id: z.string().uuid('Invalid schedule ID')
}).merge(ScheduleBaseFields.partial());

// Time tracking schemas
const TimeEntryBaseFields = z.object({
  staffId: z.string().uuid('Invalid staff ID'),
  scheduleId: z.string().uuid().optional(),
  clockInTime: z.string().datetime(),
  clockOutTime: z.string().datetime().optional(),
  breakDuration: z.number().min(0).max(480).default(0)
    .describe('Break duration in minutes'),
  overtime: z.boolean().default(false),
  notes: z.string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional(),
  status: z.enum(['active', 'completed', 'approved', 'disputed']).default('active')
});

export const CreateTimeEntrySchema = TimeEntryBaseFields.omit({ clockOutTime: true });

export const UpdateTimeEntrySchema = z.object({
  id: z.string().uuid('Invalid time entry ID')
}).merge(TimeEntryBaseFields.partial()).refine(
  (data) => {
    if (data.clockOutTime && data.clockInTime) {
      return new Date(data.clockOutTime) > new Date(data.clockInTime);
    }
    return true;
  },
  {
    message: 'Clock out time must be after clock in time',
    path: ['clockOutTime']
  }
);

// Query schemas
export const StaffQuerySchema = z.object({
  search: z.string().optional(),
  department: z.enum([
    'management', 'events', 'finance', 'marketing', 'operations', 
    'security', 'maintenance', 'customer_service', 'technical'
  ]).optional(),
  roleId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
  canLogin: z.boolean().optional(),
  skills: z.array(z.string()).optional(),
  hiredAfter: z.string().datetime().optional(),
  hiredBefore: z.string().datetime().optional(),
  // Pagination
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  // Sorting
  sortBy: z.enum(['firstName', 'lastName', 'email', 'department', 'hireDate']).default('lastName'),
  sortOrder: z.enum(['asc', 'desc']).default('asc')
});

export const ScheduleQuerySchema = z.object({
  staffId: z.string().uuid().optional(),
  eventId: z.string().uuid().optional(),
  shiftType: z.enum(['regular', 'overtime', 'event', 'training', 'meeting', 'other']).optional(),
  status: z.enum(['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show']).optional(),
  dateRange: z.object({
    start: z.string().datetime().optional(),
    end: z.string().datetime().optional()
  }).optional(),
  isRecurring: z.boolean().optional(),
  // Pagination
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  // Sorting
  sortBy: z.enum(['startTime', 'endTime', 'title', 'staffId']).default('startTime'),
  sortOrder: z.enum(['asc', 'desc']).default('asc')
});

export const TimeEntryQuerySchema = z.object({
  staffId: z.string().uuid().optional(),
  scheduleId: z.string().uuid().optional(),
  status: z.enum(['active', 'completed', 'approved', 'disputed']).optional(),
  dateRange: z.object({
    start: z.string().datetime().optional(),
    end: z.string().datetime().optional()
  }).optional(),
  overtime: z.boolean().optional(),
  // Pagination
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  // Sorting
  sortBy: z.enum(['clockInTime', 'clockOutTime', 'staffId']).default('clockInTime'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Bulk operations
export const BulkScheduleUpdateSchema = z.object({
  scheduleIds: z.array(z.string().uuid()).min(1).max(100),
  updates: z.object({
    status: z.enum(['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show']).optional(),
    notes: z.string().max(1000).optional()
  })
});

export const BulkStaffActivationSchema = z.object({
  staffIds: z.array(z.string().uuid()).min(1).max(100),
  isActive: z.boolean(),
  reason: z.string()
    .min(1, 'Reason is required')
    .max(500, 'Reason must be less than 500 characters')
});

// ID validation schemas
export const StaffIdSchema = z.object({
  id: z.string().uuid('Invalid staff ID')
});

export const RoleIdSchema = z.object({
  id: z.string().uuid('Invalid role ID')
});

export const ScheduleIdSchema = z.object({
  id: z.string().uuid('Invalid schedule ID')
});

export const TimeEntryIdSchema = z.object({
  id: z.string().uuid('Invalid time entry ID')
});

// Export TypeScript types
export type CreateStaffRequest = z.infer<typeof CreateStaffSchema>;
export type UpdateStaffRequest = z.infer<typeof UpdateStaffSchema>;
export type ChangePasswordRequest = z.infer<typeof ChangePasswordSchema>;
export type CreateRoleRequest = z.infer<typeof CreateRoleSchema>;
export type UpdateRoleRequest = z.infer<typeof UpdateRoleSchema>;
export type CreateScheduleRequest = z.infer<typeof CreateScheduleSchema>;
export type UpdateScheduleRequest = z.infer<typeof UpdateScheduleSchema>;
export type CreateTimeEntryRequest = z.infer<typeof CreateTimeEntrySchema>;
export type UpdateTimeEntryRequest = z.infer<typeof UpdateTimeEntrySchema>;
export type StaffQueryRequest = z.infer<typeof StaffQuerySchema>;
export type ScheduleQueryRequest = z.infer<typeof ScheduleQuerySchema>;
export type TimeEntryQueryRequest = z.infer<typeof TimeEntryQuerySchema>;
export type BulkScheduleUpdateRequest = z.infer<typeof BulkScheduleUpdateSchema>;
export type BulkStaffActivationRequest = z.infer<typeof BulkStaffActivationSchema>;

// Enhanced interfaces
export interface Permission {
  resource: string;
  actions: string[];
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  isActive: boolean;
  isDefault: boolean;
  hierarchy: number;
  memberCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  employeeId: string;
  roleId: string;
  role?: Role;
  department: string;
  position: string;
  hireDate: string;
  hourlyRate?: number;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  skills: string[];
  certifications: Array<{
    name: string;
    issuedBy: string;
    issuedDate: string;
    expiryDate?: string;
  }>;
  isActive: boolean;
  canLogin: boolean;
  requiresApproval: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  // Enhanced fields
  metrics?: {
    totalHours: number;
    overtimeHours: number;
    totalEarnings: number;
    shiftsCompleted: number;
    averageHoursPerWeek: number;
    attendanceRate: number;
    upcomingShifts: number;
  };
  schedules?: Schedule[];
  timeEntries?: TimeEntry[];
}

export interface Schedule {
  id: string;
  staffId: string;
  staff?: Staff;
  eventId?: string;
  shiftType: 'regular' | 'overtime' | 'event' | 'training' | 'meeting' | 'other';
  startTime: string;
  endTime: string;
  title: string;
  description?: string;
  location?: string;
  isRecurring: boolean;
  recurringPattern?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    daysOfWeek?: number[];
    endDate?: string;
  };
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Enhanced fields
  duration?: number; // in minutes
  isOvertime?: boolean;
  conflicts?: Schedule[];
}

export interface TimeEntry {
  id: string;
  staffId: string;
  staff?: Staff;
  scheduleId?: string;
  schedule?: Schedule;
  clockInTime: string;
  clockOutTime?: string;
  breakDuration: number; // in minutes
  overtime: boolean;
  notes?: string;
  status: 'active' | 'completed' | 'approved' | 'disputed';
  createdAt: string;
  updatedAt: string;
  // Enhanced fields
  totalHours?: number;
  regularHours?: number;
  overtimeHours?: number;
  earnings?: number;
}

// Business rule validation utilities
export const validateStaffBusinessRules = {
  canDelete: (staff: Staff): { valid: boolean; reason?: string } => {
    if (staff.metrics && staff.metrics.upcomingShifts > 0) {
      return {
        valid: false,
        reason: 'Cannot delete staff with upcoming shifts'
      };
    }
    return { valid: true };
  },

  canDeactivate: (staff: Staff): { valid: boolean; reason?: string } => {
    if (staff.metrics && staff.metrics.upcomingShifts > 0) {
      return {
        valid: false,
        reason: 'Cannot deactivate staff with upcoming shifts. Please reassign or cancel shifts first.'
      };
    }
    return { valid: true };
  },

  canChangeRole: (staff: Staff, newRoleHierarchy: number, currentUserHierarchy: number): { valid: boolean; reason?: string } => {
    if (currentUserHierarchy >= newRoleHierarchy) {
      return {
        valid: false,
        reason: 'Cannot assign a role with equal or higher hierarchy than your own'
      };
    }
    return { valid: true };
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canSchedule: (staff: Staff, _startTime: string, _endTime: string): { valid: boolean; reason?: string } => {
    if (!staff.isActive) {
      return {
        valid: false,
        reason: 'Cannot schedule inactive staff'
      };
    }

    // TODO: Check for scheduling conflicts using _startTime and _endTime (would need existing schedules)
    return { valid: true };
  },

  canClockIn: (staff: Staff): { valid: boolean; reason?: string } => {
    if (!staff.isActive) {
      return {
        valid: false,
        reason: 'Inactive staff cannot clock in'
      };
    }

    if (!staff.canLogin) {
      return {
        valid: false,
        reason: 'Staff without login access cannot clock in'
      };
    }

    return { valid: true };
  },

  validateScheduleConflict: (newSchedule: { startTime: string; endTime: string }, existingSchedules: Schedule[]): { valid: boolean; conflicts: Schedule[] } => {
    const newStart = new Date(newSchedule.startTime);
    const newEnd = new Date(newSchedule.endTime);

    const conflicts = existingSchedules.filter(schedule => {
      if (schedule.status === 'cancelled') return false;
      
      const existingStart = new Date(schedule.startTime);
      const existingEnd = new Date(schedule.endTime);

      // Check for overlap
      return (newStart < existingEnd && newEnd > existingStart);
    });

    return {
      valid: conflicts.length === 0,
      conflicts
    };
  },

  calculateOvertimeEligibility: (totalHours: number, weeklyLimit: number = 40): { isOvertime: boolean; overtimeHours: number; regularHours: number } => {
    if (totalHours <= weeklyLimit) {
      return {
        isOvertime: false,
        overtimeHours: 0,
        regularHours: totalHours
      };
    }

    return {
      isOvertime: true,
      overtimeHours: totalHours - weeklyLimit,
      regularHours: weeklyLimit
    };
  },

  hasPermission: (staff: Staff, resource: string, action: string): boolean => {
    if (!staff.role || !staff.isActive || !staff.canLogin) {
      return false;
    }

    const permission = staff.role.permissions.find(p => p.resource === resource);
    return permission ? permission.actions.includes(action) : false;
  },

  validateCertificationStatus: (certifications: Array<{ name: string; expiryDate?: string }>): { valid: boolean; expired: string[]; expiringSoon: string[] } => {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const expired: string[] = [];
    const expiringSoon: string[] = [];

    certifications.forEach(cert => {
      if (cert.expiryDate) {
        const expiryDate = new Date(cert.expiryDate);
        if (expiryDate < now) {
          expired.push(cert.name);
        } else if (expiryDate < thirtyDaysFromNow) {
          expiringSoon.push(cert.name);
        }
      }
    });

    return {
      valid: expired.length === 0,
      expired,
      expiringSoon
    };
  }
}; 