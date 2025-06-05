import { SupabaseAdapter, type QueryOptions } from '../adapters/supabaseAdapter';
import { validateQuery, validateParams } from '../validation';
import { UserRole } from '../auth';
import type { ApiResponse } from '../types';
import {
  CreateStaffSchema,
  UpdateStaffSchema,
  StaffQuerySchema,
  StaffIdSchema,
  CreateScheduleSchema,
  CreateTimeEntrySchema,
  CreateCertificationSchema,
  RolePermissionSchema,
  validateStaffBusinessRules,
  type CreateStaffRequest,
  type UpdateStaffRequest,
  type StaffQueryRequest,
  type Staff,
  type Schedule,
  type CreateScheduleRequest,
  type TimeEntry,
  type CreateTimeEntryRequest,
  type Certification,
  type CreateCertificationRequest,
  type Role,
  type Permission,
  type EnhancedStaff,
} from '../schemas/staffSchemas';
import { ValidationError } from '../errors';

export class StaffService {
  private adapter: SupabaseAdapter;

  constructor() {
    this.adapter = new SupabaseAdapter();
  }

  /**
   * Get all staff members with filtering and pagination
   */
  async getStaff(query: Partial<StaffQueryRequest> = {}): Promise<ApiResponse<Staff[]>> {
    // 1. Validate query parameters with defaults
    const queryWithDefaults = {
      limit: 20,
      offset: 0,
      ...query
    };
    
    const validationResult = validateQuery(StaffQuerySchema, queryWithDefaults);
    if (!validationResult.success) {
      return validationResult.error;
    }

    const { limit, offset, department, position, isActive, role, search } = validationResult.data;

    // 2. Build query options
    const queryOptions: QueryOptions = {
      select: `
        *,
        staff_roles(*),
        staff_schedules(*),
        staff_certifications(*)
      `,
      orderBy: { column: 'first_name', ascending: true },
      limit,
      offset,
      filters: {}
    };

    // Apply filters
    if (department) queryOptions.filters!.department = department;
    if (position) queryOptions.filters!.position = position;
    if (isActive !== undefined) queryOptions.filters!.is_active = isActive;
    if (role) queryOptions.filters!.role = role;

    // 3. Execute query with adapter
    const response = await this.adapter.executeQuery(
      {
        tableName: 'staff',
        rateLimitKey: 'staff:read',
        enableLogging: true,
      },
      async () => {
        let query = this.adapter.buildQuery('staff', queryOptions);
        
        // Add search filter if provided
        if (search) {
          query = query.or(`first_name.ilike.%${search}%, last_name.ilike.%${search}%, email.ilike.%${search}%`);
        }
        
        return query;
      },
      'read'
    );

    if (response.success) {
      // Transform data to our Staff format
      const staff = Array.isArray(response.data) ? response.data : [response.data];
      const transformedStaff = staff.map(member => this.transformStaffFromDb(member as Record<string, unknown>));
      
      return {
        ...response,
        data: transformedStaff
      };
    }
    return response as ApiResponse<Staff[]>;
  }

  /**
   * Get enhanced staff with calculated metrics
   */
  async getEnhancedStaff(query: Partial<StaffQueryRequest> = {}): Promise<ApiResponse<EnhancedStaff[]>> {
    const staffResponse = await this.getStaff(query);
    if (!staffResponse.success) {
      return staffResponse as ApiResponse<EnhancedStaff[]>;
    }

    const enhancedStaff = await Promise.all(
      staffResponse.data.map(async (member) => {
        const metrics = await this.calculateStaffMetrics(member.id);
        return {
          ...member,
          metrics: metrics.success ? metrics.data : undefined
        } as EnhancedStaff;
      })
    );

    return {
      ...staffResponse,
      data: enhancedStaff
    };
  }

  /**
   * Get a single staff member by ID
   */
  async getStaffById(id: string): Promise<ApiResponse<Staff>> {
    // 1. Validate ID
    const validationResult = validateParams(StaffIdSchema, { id });
    if (!validationResult.success) {
      return validationResult.error;
    }

    // 2. Execute query
    const response = await this.adapter.executeQuery(
      {
        tableName: 'staff',
        rateLimitKey: 'staff:read',
        enableLogging: true,
      },
      async () => {
        return this.adapter.buildQuery('staff', {
          select: `
            *,
            staff_roles(*),
            staff_schedules(*),
            staff_certifications(*)
          `,
          filters: { id }
        });
      },
      'read'
    );

    if (response.success) {
      return {
        ...response,
        data: this.transformStaffFromDb(response.data as Record<string, unknown>)
      };
    }
    return response as ApiResponse<Staff>;
  }

  /**
   * Create a new staff member
   */
  async createStaff(staffData: CreateStaffRequest): Promise<ApiResponse<Staff>> {
    // 1. Validate input data
    const validationResult = validateParams(CreateStaffSchema, staffData);
    if (!validationResult.success) {
      return validationResult.error;
    }

    const validatedData = validationResult.data;

    // 2. Apply business rules
    const businessRuleCheck = validateStaffBusinessRules.validateRoleHierarchy(validatedData, 'manager'); // Assuming manager role for creator
    if (!businessRuleCheck.valid) {
      return {
        success: false,
        error: {
          type: 'https://docs.trainstation-dashboard.com/errors/business-rule-violation',
          title: 'Business Rule Violation',
          status: 400,
          detail: businessRuleCheck.reason || 'Staff data violates business rules',
          instance: '/api/staff',
          timestamp: new Date().toISOString()
        },
        meta: {
          requestId: crypto.randomUUID(),
          source: 'validation'
        }
      };
    }

    // 3. Execute with appropriate permissions
    const response = await this.adapter.executeQuery(
      {
        tableName: 'staff',
        requiredRole: UserRole.MANAGER, // Manager and above can create staff
        rateLimitKey: 'staff:create',
        enableLogging: true,
      },
      async () => {
        // Convert to database format
        const dbData = this.adapter.toSnakeCase({
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          email: validatedData.email,
          phone: validatedData.phone,
          dateOfBirth: validatedData.dateOfBirth,
          hireDate: validatedData.hireDate,
          department: validatedData.department,
          position: validatedData.position,
          salary: validatedData.salary,
          hourlyRate: validatedData.hourlyRate,
          role: validatedData.role,
          isActive: validatedData.isActive !== false, // Default to true
          address: validatedData.address,
          emergencyContact: validatedData.emergencyContact,
          skills: validatedData.skills || [],
          notes: validatedData.notes,
          avatar: validatedData.avatar,
        });

        return this.adapter.buildQuery('staff')
          .insert([dbData])
          .select('*');
      },
      'write'
    );

    if (response.success) {
      const staffArray = Array.isArray(response.data) ? response.data : [response.data];
      return {
        ...response,
        data: this.transformStaffFromDb(staffArray[0] as Record<string, unknown>)
      };
    }
    return response as ApiResponse<Staff>;
  }

  /**
   * Update an existing staff member
   */
  async updateStaff(id: string, updates: Omit<UpdateStaffRequest, 'id'>): Promise<ApiResponse<Staff>> {
    // 1. Validate ID and updates
    const idValidation = validateParams(StaffIdSchema, { id });
    if (!idValidation.success) {
      return idValidation.error;
    }

    const updateValidation = validateParams(
      UpdateStaffSchema.omit({ id: true }), 
      updates
    );
    if (!updateValidation.success) {
      return updateValidation.error;
    }

    // 2. Check if staff member exists and can be edited
    const existingStaffResponse = await this.getStaffById(id);
    if (!existingStaffResponse.success) {
      return existingStaffResponse;
    }

    const existingStaff = existingStaffResponse.data;
    const businessRuleCheck = validateStaffBusinessRules.canEdit(existingStaff);
    if (!businessRuleCheck.valid) {
      return {
        success: false,
        error: {
          type: 'https://docs.trainstation-dashboard.com/errors/business-rule-violation',
          title: 'Business Rule Violation',
          status: 400,
          detail: businessRuleCheck.reason || 'Cannot edit this staff member',
          instance: `/api/staff/${id}`,
          timestamp: new Date().toISOString()
        },
        meta: {
          requestId: crypto.randomUUID(),
          source: 'validation'
        }
      };
    }

    // 3. Execute update
    const response = await this.adapter.executeQuery(
      {
        tableName: 'staff',
        requiredRole: UserRole.MANAGER,
        rateLimitKey: 'staff:update',
        enableLogging: true,
      },
      async () => {
        // Convert updates to database format
        const dbUpdates = this.adapter.toSnakeCase({
          ...updateValidation.data,
          updated_at: new Date().toISOString()
        });

        return this.adapter.buildQuery('staff')
          .update(dbUpdates)
          .eq('id', id)
          .select('*');
      },
      'write'
    );

    if (response.success) {
      const staffArray = Array.isArray(response.data) ? response.data : [response.data];
      return {
        ...response,
        data: this.transformStaffFromDb(staffArray[0] as Record<string, unknown>)
      };
    }
    return response as ApiResponse<Staff>;
  }

  /**
   * Delete a staff member (soft delete by default, hard delete for admins)
   */
  async deleteStaff(id: string, hardDelete = false): Promise<ApiResponse<{ deleted: boolean }>> {
    // 1. Validate ID
    const validationResult = validateParams(StaffIdSchema, { id });
    if (!validationResult.success) {
      return validationResult.error;
    }

    // 2. Check if staff member can be deleted
    const existingStaffResponse = await this.getStaffById(id);
    if (!existingStaffResponse.success) {
      return existingStaffResponse;
    }

    const existingStaff = existingStaffResponse.data;
    const businessRuleCheck = validateStaffBusinessRules.canDelete(existingStaff);
    if (!businessRuleCheck.valid) {
      return {
        success: false,
        error: {
          type: 'https://docs.trainstation-dashboard.com/errors/business-rule-violation',
          title: 'Cannot Delete Staff Member',
          status: 400,
          detail: businessRuleCheck.reason || 'Staff member cannot be deleted',
          instance: `/api/staff/${id}`,
          timestamp: new Date().toISOString()
        },
        meta: {
          requestId: crypto.randomUUID(),
          source: 'validation'
        }
      };
    }

    if (hardDelete) {
      // 3. Hard delete (admin only)
      const response = await this.adapter.executeQuery(
        {
          tableName: 'staff',
          requiredRole: UserRole.ADMIN,
          rateLimitKey: 'staff:delete',
          enableLogging: true,
        },
        async () => {
          return this.adapter.buildQuery('staff')
            .delete()
            .eq('id', id);
        },
        'write'
      );

      if (response.success) {
        return {
          ...response,
          data: { deleted: true }
        };
      }
      return response as ApiResponse<{ deleted: boolean }>;
    } else {
      // 4. Soft delete (set isActive to false)
      const updateResponse = await this.updateStaff(id, { isActive: false });
      if (updateResponse.success) {
        return {
          success: true,
          data: { deleted: true },
          meta: updateResponse.meta
        };
      }
      return updateResponse as ApiResponse<{ deleted: boolean }>;
    }
  }

  /**
   * Create a schedule for a staff member
   */
  async createSchedule(scheduleData: CreateScheduleRequest): Promise<ApiResponse<Schedule>> {
    // 1. Validate input data
    const validationResult = validateParams(CreateScheduleSchema, scheduleData);
    if (!validationResult.success) {
      return validationResult.error;
    }

    const validatedData = validationResult.data;

    // 2. Verify staff member exists
    const staffResponse = await this.getStaffById(validatedData.staffId);
    if (!staffResponse.success) {
      return staffResponse as ApiResponse<Schedule>;
    }

    // 3. Check for scheduling conflicts
    const conflictCheck = await this.checkScheduleConflicts(validatedData);
    if (!conflictCheck.valid) {
      return {
        success: false,
        error: {
          type: 'https://docs.trainstation-dashboard.com/errors/schedule-conflict',
          title: 'Schedule Conflict',
          status: 400,
          detail: conflictCheck.reason || 'Schedule conflicts with existing schedules',
          instance: '/api/staff/schedules',
          timestamp: new Date().toISOString()
        },
        meta: {
          requestId: crypto.randomUUID(),
          source: 'validation'
        }
      };
    }

    // 4. Execute schedule creation
    const response = await this.adapter.executeQuery(
      {
        tableName: 'staff_schedules',
        requiredRole: UserRole.MANAGER,
        rateLimitKey: 'staff:schedules:create',
        enableLogging: true,
      },
      async () => {
        const dbData = this.adapter.toSnakeCase({
          staffId: validatedData.staffId,
          startTime: validatedData.startTime,
          endTime: validatedData.endTime,
          shiftType: validatedData.shiftType,
          isRecurring: validatedData.isRecurring || false,
          recurringPattern: validatedData.recurringPattern,
          eventId: validatedData.eventId,
          status: validatedData.status || 'scheduled',
          notes: validatedData.notes,
        });

        return this.adapter.buildQuery('staff_schedules')
          .insert([dbData])
          .select('*');
      },
      'write'
    );

    if (response.success) {
      const scheduleArray = Array.isArray(response.data) ? response.data : [response.data];
      return {
        ...response,
        data: this.transformScheduleFromDb(scheduleArray[0] as Record<string, unknown>)
      };
    }
    return response as ApiResponse<Schedule>;
  }

  /**
   * Get schedules for a staff member
   */
  async getStaffSchedules(staffId: string, dateFrom?: string, dateTo?: string): Promise<ApiResponse<Schedule[]>> {
    // 1. Validate staff ID
    const validationResult = validateParams(StaffIdSchema, { id: staffId });
    if (!validationResult.success) {
      return validationResult.error;
    }

    // 2. Execute query
    const response = await this.adapter.executeQuery(
      {
        tableName: 'staff_schedules',
        rateLimitKey: 'staff:schedules:read',
        enableLogging: true,
      },
      async () => {
        let query = this.adapter.buildQuery('staff_schedules', {
          select: '*',
          filters: { staff_id: staffId },
          orderBy: { column: 'start_time', ascending: true }
        });

        // Add date range filters if provided
        if (dateFrom) {
          query = query.gte('start_time', dateFrom);
        }
        if (dateTo) {
          query = query.lte('end_time', dateTo);
        }

        return query;
      },
      'read'
    );

    if (response.success) {
      const schedules = Array.isArray(response.data) ? response.data : [response.data];
      const transformedSchedules = schedules.map(schedule => 
        this.transformScheduleFromDb(schedule as Record<string, unknown>)
      );
      
      return {
        ...response,
        data: transformedSchedules
      };
    }
    return response as ApiResponse<Schedule[]>;
  }

  /**
   * Create a time entry
   */
  async createTimeEntry(timeEntryData: CreateTimeEntryRequest): Promise<ApiResponse<TimeEntry>> {
    // 1. Validate input data
    const validationResult = validateParams(CreateTimeEntrySchema, timeEntryData);
    if (!validationResult.success) {
      return validationResult.error;
    }

    const validatedData = validationResult.data;

    // 2. Execute time entry creation
    const response = await this.adapter.executeQuery(
      {
        tableName: 'staff_time_entries',
        requiredRole: UserRole.STAFF,
        rateLimitKey: 'staff:time:create',
        enableLogging: true,
      },
      async () => {
        const dbData = this.adapter.toSnakeCase({
          staffId: validatedData.staffId,
          clockIn: validatedData.clockIn,
          clockOut: validatedData.clockOut,
          breakDuration: validatedData.breakDuration || 0,
          hoursWorked: validatedData.hoursWorked,
          overtimeHours: validatedData.overtimeHours || 0,
          scheduleId: validatedData.scheduleId,
          notes: validatedData.notes,
        });

        return this.adapter.buildQuery('staff_time_entries')
          .insert([dbData])
          .select('*');
      },
      'write'
    );

    if (response.success) {
      const timeEntryArray = Array.isArray(response.data) ? response.data : [response.data];
      return {
        ...response,
        data: this.transformTimeEntryFromDb(timeEntryArray[0] as Record<string, unknown>)
      };
    }
    return response as ApiResponse<TimeEntry>;
  }

  /**
   * Create a certification for a staff member
   */
  async createCertification(certificationData: CreateCertificationRequest): Promise<ApiResponse<Certification>> {
    // 1. Validate input data
    const validationResult = validateParams(CreateCertificationSchema, certificationData);
    if (!validationResult.success) {
      return validationResult.error;
    }

    const validatedData = validationResult.data;

    // 2. Execute certification creation
    const response = await this.adapter.executeQuery(
      {
        tableName: 'staff_certifications',
        requiredRole: UserRole.MANAGER,
        rateLimitKey: 'staff:certifications:create',
        enableLogging: true,
      },
      async () => {
        const dbData = this.adapter.toSnakeCase({
          staffId: validatedData.staffId,
          name: validatedData.name,
          issuingAuthority: validatedData.issuingAuthority,
          issueDate: validatedData.issueDate,
          expiryDate: validatedData.expiryDate,
          certificateNumber: validatedData.certificateNumber,
          isActive: validatedData.isActive !== false, // Default to true
          notes: validatedData.notes,
        });

        return this.adapter.buildQuery('staff_certifications')
          .insert([dbData])
          .select('*');
      },
      'write'
    );

    if (response.success) {
      const certificationArray = Array.isArray(response.data) ? response.data : [response.data];
      return {
        ...response,
        data: this.transformCertificationFromDb(certificationArray[0] as Record<string, unknown>)
      };
    }
    return response as ApiResponse<Certification>;
  }

  /**
   * Check user permissions for a specific resource and action
   */
  async checkPermission(userId: string, resource: string, action: string): Promise<ApiResponse<{ hasPermission: boolean }>> {
    // This would implement complex permission checking logic
    // For now, return a simple validation
    return {
      success: true,
      data: { hasPermission: true },
      meta: {
        requestId: crypto.randomUUID(),
        source: 'permission-check'
      }
    };
  }

  /**
   * Check for schedule conflicts
   */
  private async checkScheduleConflicts(schedule: CreateScheduleRequest): Promise<{ valid: boolean; reason?: string }> {
    const response = await this.adapter.executeQuery(
      {
        tableName: 'staff_schedules',
        rateLimitKey: 'staff:schedules:conflict-check',
      },
      async () => {
        return this.adapter
          .buildQuery('staff_schedules', {
            select: 'id,start_time,end_time',
            filters: { staff_id: schedule.staffId },
          })
          .lt('start_time', schedule.endTime)
          .gt('end_time', schedule.startTime);
      },
      'read'
    );

    if (response.success) {
      const conflicts = Array.isArray(response.data) ? response.data : [response.data];
      if (conflicts.length > 0) {
        return { valid: false, reason: 'Schedule overlaps with existing shift' };
      }
    }

    return { valid: true };
  }

  /**
   * Calculate staff metrics
   */
  async calculateStaffMetrics(staffId: string): Promise<ApiResponse<any>> {
    const timeEntriesResponse = await this.adapter.executeQuery(
      {
        tableName: 'time_entries',
        rateLimitKey: 'staff:metrics',
        requiredRole: UserRole.MANAGER,
      },
      async () => {
        return this.adapter
          .buildQuery('time_entries', {
            select: 'clock_in_time, clock_out_time, total_hours',
            filters: { staff_id: staffId },
            orderBy: { column: 'clock_in_time', ascending: true },
          });
      },
      'read'
    );

    if (!timeEntriesResponse.success) {
      return timeEntriesResponse as ApiResponse<any>;
    }

    const entries = Array.isArray(timeEntriesResponse.data)
      ? timeEntriesResponse.data
      : [];

    let totalHours = 0;
    let overtime = 0;
    let firstDate: Date | null = null;
    let lastDate: Date | null = null;

    for (const entry of entries as any[]) {
      const hours = entry.total_hours ?? 0;
      totalHours += hours;
      if (hours > 8) overtime += hours - 8;

      const start = new Date(entry.clock_in_time);
      if (!firstDate || start < firstDate) firstDate = start;
      if (!lastDate || start > lastDate) lastDate = start;
    }

    const weeks = firstDate && lastDate
      ? Math.max(1, (lastDate.getTime() - firstDate.getTime()) / (7 * 24 * 60 * 60 * 1000))
      : 1;
    const averageHoursPerWeek = totalHours / weeks;

    const certResponse = await this.adapter.executeQuery(
      {
        tableName: 'staff_certifications',
        rateLimitKey: 'staff:metrics',
        requiredRole: UserRole.MANAGER,
      },
      async () => {
        return this.adapter
          .buildQuery('staff_certifications', {
            select: 'expiry_date',
            filters: { staff_id: staffId },
          });
      },
      'read'
    );

    if (!certResponse.success) {
      return certResponse as ApiResponse<any>;
    }

    const certs = Array.isArray(certResponse.data) ? certResponse.data : [];
    const now = Date.now();
    const upcomingExp = certs.filter((c: any) => {
      return c.expiry_date && new Date(c.expiry_date).getTime() - now < 30 * 24 * 60 * 60 * 1000;
    }).length;

    return {
      success: true,
      data: {
        totalHoursWorked: totalHours,
        overtimeHours: overtime,
        attendanceRate: 100,
        averageHoursPerWeek: Number(averageHoursPerWeek.toFixed(2)),
        certificationCount: certs.length,
        upcomingCertificationExpirations: upcomingExp,
      },
      meta: {
        requestId: crypto.randomUUID(),
        source: 'calculation',
      },
    };
  }

  /**
   * Transform database staff to API format
   */
  private transformStaffFromDb(dbStaff: Record<string, unknown>): Staff {
    const camelCaseStaff = this.adapter.toCamelCase(dbStaff);
    
    return {
      id: camelCaseStaff.id as string,
      firstName: camelCaseStaff.firstName as string,
      lastName: camelCaseStaff.lastName as string,
      email: camelCaseStaff.email as string,
      phone: camelCaseStaff.phone as string || undefined,
      dateOfBirth: camelCaseStaff.dateOfBirth as string || undefined,
      hireDate: camelCaseStaff.hireDate as string,
      department: camelCaseStaff.department as string,
      position: camelCaseStaff.position as string,
      salary: camelCaseStaff.salary as number || undefined,
      hourlyRate: camelCaseStaff.hourlyRate as number || undefined,
      role: camelCaseStaff.role as 'admin' | 'manager' | 'staff' | 'volunteer',
      isActive: camelCaseStaff.isActive as boolean,
      address: camelCaseStaff.address as {
        street?: string;
        city?: string;
        state?: string;
        zipCode?: string;
        country?: string;
      } || undefined,
      emergencyContact: camelCaseStaff.emergencyContact as {
        name: string;
        phone: string;
        relationship: string;
      } || undefined,
      skills: camelCaseStaff.skills as string[] || [],
      notes: camelCaseStaff.notes as string || undefined,
      avatar: camelCaseStaff.avatar as string || undefined,
      createdAt: camelCaseStaff.createdAt as string,
      updatedAt: camelCaseStaff.updatedAt as string,
      lastLoginAt: camelCaseStaff.lastLoginAt as string || undefined,
    };
  }

  /**
   * Transform database schedule to API format
   */
  private transformScheduleFromDb(dbSchedule: Record<string, unknown>): Schedule {
    const camelCaseSchedule = this.adapter.toCamelCase(dbSchedule);
    
    return {
      id: camelCaseSchedule.id as string,
      staffId: camelCaseSchedule.staffId as string,
      startTime: camelCaseSchedule.startTime as string,
      endTime: camelCaseSchedule.endTime as string,
      shiftType: camelCaseSchedule.shiftType as 'regular' | 'overtime' | 'holiday' | 'event',
      isRecurring: camelCaseSchedule.isRecurring as boolean,
      recurringPattern: camelCaseSchedule.recurringPattern as string || undefined,
      eventId: camelCaseSchedule.eventId as string || undefined,
      status: camelCaseSchedule.status as 'scheduled' | 'completed' | 'cancelled' | 'no_show',
      notes: camelCaseSchedule.notes as string || undefined,
      createdAt: camelCaseSchedule.createdAt as string,
      updatedAt: camelCaseSchedule.updatedAt as string,
    };
  }

  /**
   * Transform database time entry to API format
   */
  private transformTimeEntryFromDb(dbTimeEntry: Record<string, unknown>): TimeEntry {
    const camelCaseTimeEntry = this.adapter.toCamelCase(dbTimeEntry);
    
    return {
      id: camelCaseTimeEntry.id as string,
      staffId: camelCaseTimeEntry.staffId as string,
      clockIn: camelCaseTimeEntry.clockIn as string,
      clockOut: camelCaseTimeEntry.clockOut as string || undefined,
      breakDuration: camelCaseTimeEntry.breakDuration as number,
      hoursWorked: camelCaseTimeEntry.hoursWorked as number,
      overtimeHours: camelCaseTimeEntry.overtimeHours as number,
      scheduleId: camelCaseTimeEntry.scheduleId as string || undefined,
      notes: camelCaseTimeEntry.notes as string || undefined,
      createdAt: camelCaseTimeEntry.createdAt as string,
      updatedAt: camelCaseTimeEntry.updatedAt as string,
    };
  }

  /**
   * Transform database certification to API format
   */
  private transformCertificationFromDb(dbCertification: Record<string, unknown>): Certification {
    const camelCaseCertification = this.adapter.toCamelCase(dbCertification);
    
    return {
      id: camelCaseCertification.id as string,
      staffId: camelCaseCertification.staffId as string,
      name: camelCaseCertification.name as string,
      issuingAuthority: camelCaseCertification.issuingAuthority as string,
      issueDate: camelCaseCertification.issueDate as string,
      expiryDate: camelCaseCertification.expiryDate as string || undefined,
      certificateNumber: camelCaseCertification.certificateNumber as string || undefined,
      isActive: camelCaseCertification.isActive as boolean,
      notes: camelCaseCertification.notes as string || undefined,
      createdAt: camelCaseCertification.createdAt as string,
      updatedAt: camelCaseCertification.updatedAt as string,
    };
  }
}

// Export a singleton instance
export const staffService = new StaffService(); 