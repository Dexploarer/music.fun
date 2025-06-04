import { SupabaseAdapter, type QueryOptions } from '../adapters/supabaseAdapter';
import { validateQuery, validateParams } from '../validation';
import { UserRole } from '../auth';
import type { ApiResponse } from '../types';
import {
  CreateCustomerSchema,
  UpdateCustomerSchema,
  CustomerQuerySchema,
  CustomerIdSchema,
  CreateInteractionSchema,
  BulkCustomerUpdateSchema,
  validateCustomerBusinessRules,
  type CreateCustomerRequest,
  type UpdateCustomerRequest,
  type CustomerQueryRequest,
  type Customer,
  type CustomerInteraction,
  type CreateInteractionRequest,
  type BulkCustomerUpdateRequest,
  type EnhancedCustomer,
} from '../schemas/customerSchemas';
import { ValidationError } from '../errors';
import { z } from 'zod';
import type { 
  CustomerListResponse,
  CustomerDetailsResponse,
  CustomerSegmentRequest,
  CustomerMetrics,
  CustomerTier
} from '../schemas/customerSchemas';
import { 
  customerSchema,
  createCustomerSchema,
  updateCustomerSchema,
  customerQuerySchema,
  createInteractionSchema 
} from '../schemas/customerSchemas';
import { supabaseAdapter } from '../adapters/supabaseAdapter';
import { buildSuccessResponse, buildListResponse, buildPaginationMeta, buildPaginationLinks, type ListResponse } from '../types';
import { createApiError, ErrorCode } from '../errors';

export class CustomerService {
  private adapter: SupabaseAdapter;

  constructor() {
    this.adapter = new SupabaseAdapter();
  }

  /**
   * Get all customers with filtering and pagination
   */
  async getCustomers(query: Partial<CustomerQueryRequest> = {}): Promise<ApiResponse<Customer[]>> {
    // 1. Validate query parameters with defaults
    const queryWithDefaults = {
      limit: 20,
      offset: 0,
      ...query
    };
    
    const validationResult = validateQuery(CustomerQuerySchema, queryWithDefaults);
    if (!validationResult.success) {
      return validationResult.error;
    }

    const { limit, offset, status, tier, tags, dateFrom, dateTo, search } = validationResult.data;

    // 2. Build query options
    const queryOptions: QueryOptions = {
      select: `
        *,
        customer_interactions(*),
        customer_purchases(*)
      `,
      orderBy: { column: 'created_at', ascending: false },
      limit,
      offset,
      filters: {}
    };

    // Apply filters
    if (status) queryOptions.filters!.status = status;
    if (tier) queryOptions.filters!.tier = tier;
    if (tags && tags.length > 0) queryOptions.filters!['tags'] = { operator: 'overlaps', value: tags };

    // 3. Execute query with adapter
    const response = await this.adapter.executeQuery(
      {
        tableName: 'customers',
        rateLimitKey: 'customers:read',
        enableLogging: true,
      },
      async () => {
        const query = this.adapter.buildQuery('customers', queryOptions);
        
        // Add search filter if provided
        if (search) {
          return query.or(`first_name.ilike.%${search}%, last_name.ilike.%${search}%, email.ilike.%${search}%`);
        }
        
        return query;
      },
      'read'
    );

    if (response.success) {
      // Transform data to our Customer format
      const customers = Array.isArray(response.data) ? response.data : [response.data];
      const transformedCustomers = customers.map(customer => this.transformCustomerFromDb(customer as Record<string, unknown>));
      
      return {
        ...response,
        data: transformedCustomers
      };
    }
    return response as ApiResponse<Customer[]>;
  }

  /**
   * Get enhanced customers with calculated metrics
   */
  async getEnhancedCustomers(query: Partial<CustomerQueryRequest> = {}): Promise<ApiResponse<EnhancedCustomer[]>> {
    const customersResponse = await this.getCustomers(query);
    if (!customersResponse.success) {
      return customersResponse as ApiResponse<EnhancedCustomer[]>;
    }

    const enhancedCustomers = await Promise.all(
      customersResponse.data.map(async (customer) => {
        const metrics = await this.calculateCustomerMetrics(customer.id);
        return {
          ...customer,
          metrics: metrics.success ? metrics.data : undefined
        } as EnhancedCustomer;
      })
    );

    return {
      ...customersResponse,
      data: enhancedCustomers
    };
  }

  /**
   * Get a single customer by ID
   */
  async getCustomerById(id: string): Promise<ApiResponse<Customer>> {
    // 1. Validate ID
    const validationResult = validateParams(CustomerIdSchema, { id });
    if (!validationResult.success) {
      return validationResult.error;
    }

    // 2. Execute query
    const response = await this.adapter.executeQuery(
      {
        tableName: 'customers',
        rateLimitKey: 'customers:read',
        enableLogging: true,
      },
      async () => {
        return this.adapter.buildQuery('customers', {
          select: `
            *,
            customer_interactions(*),
            customer_purchases(*)
          `,
          filters: { id }
        });
      },
      'read'
    );

    if (response.success) {
      return {
        ...response,
        data: this.transformCustomerFromDb(response.data as Record<string, unknown>)
      };
    }
    return response as ApiResponse<Customer>;
  }

  /**
   * Create a new customer
   */
  async createCustomer(customerData: CreateCustomerRequest): Promise<ApiResponse<Customer>> {
    // 1. Validate input data
    const validationResult = validateParams(CreateCustomerSchema, customerData);
    if (!validationResult.success) {
      return validationResult.error;
    }

    const validatedData = validationResult.data;

    // 2. Apply business rules
    const businessRuleCheck = validateCustomerBusinessRules.validateContactMethod(validatedData);
    if (!businessRuleCheck.valid) {
      return {
        success: false,
        error: {
          type: 'https://docs.trainstation-dashboard.com/errors/business-rule-violation',
          title: 'Business Rule Violation',
          status: 400,
          detail: businessRuleCheck.reason || 'Customer data violates business rules',
          instance: '/api/customers',
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
        tableName: 'customers',
        requiredRole: UserRole.STAFF, // Staff and above can create customers
        rateLimitKey: 'customers:create',
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
          address: validatedData.address,
          tier: validatedData.tier || 'bronze',
          status: validatedData.status || 'active',
          marketingOptIn: validatedData.marketingOptIn || false,
          notes: validatedData.notes,
          tags: validatedData.tags || [],
          source: validatedData.source || 'manual',
        });

        return this.adapter.buildQuery('customers')
          .insert([dbData])
          .select('*');
      },
      'write'
    );

    if (response.success) {
      const customerArray = Array.isArray(response.data) ? response.data : [response.data];
      return {
        ...response,
        data: this.transformCustomerFromDb(customerArray[0] as Record<string, unknown>)
      };
    }
    return response as ApiResponse<Customer>;
  }

  /**
   * Update an existing customer
   */
  async updateCustomer(id: string, updates: Omit<UpdateCustomerRequest, 'id'>): Promise<ApiResponse<Customer>> {
    // 1. Validate ID and updates
    const idValidation = validateParams(CustomerIdSchema, { id });
    if (!idValidation.success) {
      return idValidation.error;
    }

    const updateValidation = validateParams(
      UpdateCustomerSchema.omit({ id: true }), 
      updates
    );
    if (!updateValidation.success) {
      return updateValidation.error;
    }

    // 2. Check if customer exists and can be edited
    const existingCustomerResponse = await this.getCustomerById(id);
    if (!existingCustomerResponse.success) {
      return existingCustomerResponse;
    }

    const existingCustomer = existingCustomerResponse.data;
    const businessRuleCheck = validateCustomerBusinessRules.canEdit(existingCustomer);
    if (!businessRuleCheck.valid) {
      return {
        success: false,
        error: {
          type: 'https://docs.trainstation-dashboard.com/errors/business-rule-violation',
          title: 'Business Rule Violation',
          status: 400,
          detail: businessRuleCheck.reason || 'Cannot edit this customer',
          instance: `/api/customers/${id}`,
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
        tableName: 'customers',
        requiredRole: UserRole.STAFF,
        rateLimitKey: 'customers:update',
        enableLogging: true,
      },
      async () => {
        // Convert updates to database format
        const dbUpdates = this.adapter.toSnakeCase({
          ...updateValidation.data,
          updated_at: new Date().toISOString()
        });

        return this.adapter.buildQuery('customers')
          .update(dbUpdates)
          .eq('id', id)
          .select('*');
      },
      'write'
    );

    if (response.success) {
      const customerArray = Array.isArray(response.data) ? response.data : [response.data];
      return {
        ...response,
        data: this.transformCustomerFromDb(customerArray[0] as Record<string, unknown>)
      };
    }
    return response as ApiResponse<Customer>;
  }

  /**
   * Delete a customer (soft delete by default, hard delete for admins)
   */
  async deleteCustomer(id: string, hardDelete = false): Promise<ApiResponse<{ deleted: boolean }>> {
    // 1. Validate ID
    const validationResult = validateParams(CustomerIdSchema, { id });
    if (!validationResult.success) {
      return validationResult.error;
    }

    // 2. Check if customer can be deleted
    const existingCustomerResponse = await this.getCustomerById(id);
    if (!existingCustomerResponse.success) {
      return existingCustomerResponse;
    }

    const existingCustomer = existingCustomerResponse.data;
    const businessRuleCheck = validateCustomerBusinessRules.canDelete(existingCustomer);
    if (!businessRuleCheck.valid) {
      return {
        success: false,
        error: {
          type: 'https://docs.trainstation-dashboard.com/errors/business-rule-violation',
          title: 'Cannot Delete Customer',
          status: 400,
          detail: businessRuleCheck.reason || 'Customer cannot be deleted',
          instance: `/api/customers/${id}`,
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
          tableName: 'customers',
          requiredRole: UserRole.ADMIN,
          rateLimitKey: 'customers:delete',
          enableLogging: true,
        },
        async () => {
          return this.adapter.buildQuery('customers')
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
      // 4. Soft delete (set status to inactive)
      const updateResponse = await this.updateCustomer(id, { status: 'inactive' });
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
   * Create a customer interaction
   */
  async createInteraction(interactionData: CreateInteractionRequest): Promise<ApiResponse<CustomerInteraction>> {
    // 1. Validate input data
    const validationResult = validateParams(CreateInteractionSchema, interactionData);
    if (!validationResult.success) {
      return validationResult.error;
    }

    const validatedData = validationResult.data;

    // 2. Verify customer exists
    const customerResponse = await this.getCustomerById(validatedData.customerId);
    if (!customerResponse.success) {
      return customerResponse as ApiResponse<CustomerInteraction>;
    }

    // 3. Execute interaction creation
    const response = await this.adapter.executeQuery(
      {
        tableName: 'customer_interactions',
        requiredRole: UserRole.STAFF,
        rateLimitKey: 'customers:interactions:create',
        enableLogging: true,
      },
      async () => {
        const dbData = this.adapter.toSnakeCase({
          customerId: validatedData.customerId,
          type: validatedData.type,
          subject: validatedData.subject,
          description: validatedData.description,
          staffId: validatedData.staffId,
          relatedEntity: validatedData.relatedEntity,
          relatedEntityId: validatedData.relatedEntityId,
          outcome: validatedData.outcome,
          followUpRequired: validatedData.followUpRequired || false,
          followUpDate: validatedData.followUpDate,
          metadata: validatedData.metadata,
        });

        return this.adapter.buildQuery('customer_interactions')
          .insert([dbData])
          .select('*');
      },
      'write'
    );

    if (response.success) {
      const interactionArray = Array.isArray(response.data) ? response.data : [response.data];
      return {
        ...response,
        data: this.transformInteractionFromDb(interactionArray[0] as Record<string, unknown>)
      };
    }
    return response as ApiResponse<CustomerInteraction>;
  }

  /**
   * Get customer interactions
   */
  async getCustomerInteractions(customerId: string): Promise<ApiResponse<CustomerInteraction[]>> {
    // 1. Validate customer ID
    const validationResult = validateParams(CustomerIdSchema, { id: customerId });
    if (!validationResult.success) {
      return validationResult.error;
    }

    // 2. Execute query
    const response = await this.adapter.executeQuery(
      {
        tableName: 'customer_interactions',
        rateLimitKey: 'customers:interactions:read',
        enableLogging: true,
      },
      async () => {
        return this.adapter.buildQuery('customer_interactions', {
          select: '*',
          filters: { customer_id: customerId },
          orderBy: { column: 'created_at', ascending: false }
        });
      },
      'read'
    );

    if (response.success) {
      const interactions = Array.isArray(response.data) ? response.data : [response.data];
      const transformedInteractions = interactions.map(interaction => 
        this.transformInteractionFromDb(interaction as Record<string, unknown>)
      );
      
      return {
        ...response,
        data: transformedInteractions
      };
    }
    return response as ApiResponse<CustomerInteraction[]>;
  }

  /**
   * Bulk update customers
   */
  async bulkUpdateCustomers(updates: BulkCustomerUpdateRequest): Promise<ApiResponse<{ updated: number }>> {
    // 1. Validate bulk update data
    const validationResult = validateParams(BulkCustomerUpdateSchema, updates);
    if (!validationResult.success) {
      return validationResult.error;
    }

    const validatedData = validationResult.data;

    // 2. Execute bulk update
    const response = await this.adapter.executeQuery(
      {
        tableName: 'customers',
        requiredRole: UserRole.MANAGER, // Manager role required for bulk operations
        rateLimitKey: 'customers:bulk:update',
        enableLogging: true,
      },
      async () => {
        const dbUpdates = this.adapter.toSnakeCase({
          ...validatedData.updates,
          updated_at: new Date().toISOString()
        });

        let query = this.adapter.buildQuery('customers').update(dbUpdates);

        // Apply filters based on criteria
        if (validatedData.criteria.ids) {
          query = query.in('id', validatedData.criteria.ids);
        }
        if (validatedData.criteria.tier) {
          query = query.eq('tier', validatedData.criteria.tier);
        }
        if (validatedData.criteria.status) {
          query = query.eq('status', validatedData.criteria.status);
        }
        if (validatedData.criteria.tags) {
          query = query.overlaps('tags', validatedData.criteria.tags);
        }

        return query.select('id');
      },
      'write'
    );

    if (response.success) {
      const updated = Array.isArray(response.data) ? response.data.length : 1;
      return {
        ...response,
        data: { updated }
      };
    }
    return response as ApiResponse<{ updated: number }>;
  }

  /**
   * Calculate customer metrics
   */
  async calculateCustomerMetrics(customerId: string): Promise<ApiResponse<any>> {
    // This would typically involve complex queries across multiple tables
    // For now, return a placeholder structure
    return {
      success: true,
      data: {
        lifetimeValue: 0,
        totalPurchases: 0,
        averageOrderValue: 0,
        lastPurchaseDate: null,
        interactionCount: 0,
        engagementScore: 0,
        churnRisk: 'low'
      },
      meta: {
        requestId: crypto.randomUUID(),
        source: 'calculation'
      }
    };
  }

  /**
   * Transform database customer to API format
   */
  private transformCustomerFromDb(dbCustomer: Record<string, unknown>): Customer {
    const camelCaseCustomer = this.adapter.toCamelCase(dbCustomer);
    
    return {
      id: camelCaseCustomer.id as string,
      firstName: camelCaseCustomer.firstName as string,
      lastName: camelCaseCustomer.lastName as string,
      email: camelCaseCustomer.email as string || undefined,
      phone: camelCaseCustomer.phone as string || undefined,
      dateOfBirth: camelCaseCustomer.dateOfBirth as string || undefined,
      address: camelCaseCustomer.address as {
        street?: string;
        city?: string;
        state?: string;
        zipCode?: string;
        country?: string;
      } || undefined,
      tier: camelCaseCustomer.tier as 'bronze' | 'silver' | 'gold' | 'platinum',
      status: camelCaseCustomer.status as 'active' | 'inactive' | 'suspended',
      marketingOptIn: camelCaseCustomer.marketingOptIn as boolean,
      notes: camelCaseCustomer.notes as string || undefined,
      tags: camelCaseCustomer.tags as string[] || [],
      source: camelCaseCustomer.source as string || undefined,
      createdAt: camelCaseCustomer.createdAt as string,
      updatedAt: camelCaseCustomer.updatedAt as string,
      lastContactDate: camelCaseCustomer.lastContactDate as string || undefined,
      totalSpent: camelCaseCustomer.totalSpent as number || 0,
      totalVisits: camelCaseCustomer.totalVisits as number || 0,
    };
  }

  /**
   * Transform database interaction to API format
   */
  private transformInteractionFromDb(dbInteraction: Record<string, unknown>): CustomerInteraction {
    const camelCaseInteraction = this.adapter.toCamelCase(dbInteraction);
    
    return {
      id: camelCaseInteraction.id as string,
      customerId: camelCaseInteraction.customerId as string,
      type: camelCaseInteraction.type as 'call' | 'email' | 'meeting' | 'purchase' | 'complaint' | 'inquiry' | 'other',
      subject: camelCaseInteraction.subject as string,
      description: camelCaseInteraction.description as string || undefined,
      staffId: camelCaseInteraction.staffId as string,
      relatedEntity: camelCaseInteraction.relatedEntity as 'event' | 'booking' | 'payment' | 'other' || undefined,
      relatedEntityId: camelCaseInteraction.relatedEntityId as string || undefined,
      outcome: camelCaseInteraction.outcome as string || undefined,
      followUpRequired: camelCaseInteraction.followUpRequired as boolean,
      followUpDate: camelCaseInteraction.followUpDate as string || undefined,
      metadata: camelCaseInteraction.metadata as Record<string, unknown> || undefined,
      createdAt: camelCaseInteraction.createdAt as string,
      updatedAt: camelCaseInteraction.updatedAt as string,
    };
  }
}

// Export a singleton instance
export const customerService = new CustomerService(); 