/**
 * Customer Schemas - Train Station Dashboard API Standards
 * Comprehensive validation schemas for Customer and CustomerInteraction entities
 * with business rule enforcement and CRM-specific validation
 */

import { z } from 'zod';

// Base validation schemas
const EmailSchema = z.string().email('Invalid email format').optional();
const PhoneSchema = z.string()
  .regex(/^[+]?[1-9][\d]{0,15}$/, 'Invalid phone number format')
  .optional();

const MarketingPreferencesSchema = z.object({
  emailPromotions: z.boolean().default(false),
  smsNotifications: z.boolean().default(false),
  newsletter: z.boolean().default(false),
  specialEvents: z.boolean().default(true),
  unsubscribed: z.boolean().default(false)
});

// Customer base fields for reuse
const CustomerBaseFields = z.object({
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
  address: z.string().max(200, 'Address must be less than 200 characters').optional(),
  city: z.string().max(50, 'City must be less than 50 characters').optional(),
  state: z.string().max(30, 'State must be less than 30 characters').optional(),
  zip: z.string()
    .regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format')
    .optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
  birthday: z.string().datetime().optional(),
  tags: z.array(z.string().trim().min(1)).max(20, 'Maximum 20 tags allowed').default([]),
  marketingPreferences: MarketingPreferencesSchema.default({
    emailPromotions: false,
    smsNotifications: false,
    newsletter: false,
    specialEvents: true,
    unsubscribed: false
  })
});

// Customer creation schema with business rules
export const CreateCustomerSchema = CustomerBaseFields.refine(
  (data) => data.email || data.phone,
  {
    message: 'Customer must have at least one contact method (email or phone)',
    path: ['email']
  }
).refine(
  (data) => {
    if (data.marketingPreferences?.unsubscribed && 
        (data.marketingPreferences?.emailPromotions || 
         data.marketingPreferences?.smsNotifications || 
         data.marketingPreferences?.newsletter)) {
      return false;
    }
    return true;
  },
  {
    message: 'Unsubscribed customers cannot have marketing preferences enabled',
    path: ['marketingPreferences']
  }
);

// Customer update schema with ID
export const UpdateCustomerSchema = z.object({
  id: z.string().uuid('Invalid customer ID'),
}).merge(CustomerBaseFields.partial()).refine(
  (data) => {
    // If both email and phone are being set to undefined/null, prevent it
    if (data.email === null && data.phone === null) {
      return false;
    }
    return true;
  },
  {
    message: 'Customer must have at least one contact method',
    path: ['email']
  }
);

// Customer query schema for filtering and pagination
export const CustomerQuerySchema = z.object({
  search: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  tags: z.array(z.string()).optional(),
  marketingOptIn: z.boolean().optional(),
  hasEmail: z.boolean().optional(),
  hasPhone: z.boolean().optional(),
  customerSince: z.object({
    start: z.string().datetime().optional(),
    end: z.string().datetime().optional()
  }).optional(),
  lastVisit: z.object({
    start: z.string().datetime().optional(),
    end: z.string().datetime().optional()
  }).optional(),
  // Pagination
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  // Sorting
  sortBy: z.enum(['firstName', 'lastName', 'email', 'customerSince', 'lastVisit']).default('lastName'),
  sortOrder: z.enum(['asc', 'desc']).default('asc')
});

// Customer ID validation
export const CustomerIdSchema = z.object({
  id: z.string().uuid('Invalid customer ID')
});

// Customer interaction schemas
const InteractionBaseFields = z.object({
  customerId: z.string().uuid('Invalid customer ID'),
  type: z.enum(['call', 'email', 'meeting', 'event', 'purchase', 'note', 'other'])
    .describe('Type of customer interaction'),
  date: z.string().datetime().default(() => new Date().toISOString()),
  description: z.string()
    .min(1, 'Description is required')
    .max(2000, 'Description must be less than 2000 characters'),
  staffMember: z.string().max(100, 'Staff member name must be less than 100 characters').optional(),
  relatedEntityId: z.string().uuid().optional(),
  relatedEntityType: z.enum(['event', 'ticket', 'booking', 'campaign', 'task']).optional()
});

export const CreateInteractionSchema = InteractionBaseFields.refine(
  (data) => {
    // If relatedEntityId is provided, relatedEntityType must also be provided
    if (data.relatedEntityId && !data.relatedEntityType) {
      return false;
    }
    return true;
  },
  {
    message: 'Related entity type is required when related entity ID is provided',
    path: ['relatedEntityType']
  }
);

export const UpdateInteractionSchema = z.object({
  id: z.string().uuid('Invalid interaction ID')
}).merge(InteractionBaseFields.partial());

export const InteractionQuerySchema = z.object({
  customerId: z.string().uuid().optional(),
  type: z.enum(['call', 'email', 'meeting', 'event', 'purchase', 'note', 'other']).optional(),
  staffMember: z.string().optional(),
  dateRange: z.object({
    start: z.string().datetime().optional(),
    end: z.string().datetime().optional()
  }).optional(),
  relatedEntityType: z.enum(['event', 'ticket', 'booking', 'campaign', 'task']).optional(),
  // Pagination
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  // Sorting
  sortBy: z.enum(['date', 'type', 'staffMember']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Bulk operations schemas
export const BulkCustomerUpdateSchema = z.object({
  customerIds: z.array(z.string().uuid()).min(1).max(100),
  updates: z.object({
    tags: z.array(z.string()).optional(),
    marketingPreferences: MarketingPreferencesSchema.partial().optional(),
    notes: z.string().max(1000).optional()
  })
});

export const BulkCustomerTagSchema = z.object({
  customerIds: z.array(z.string().uuid()).min(1).max(100),
  tagsToAdd: z.array(z.string()).optional(),
  tagsToRemove: z.array(z.string()).optional()
});

// Export TypeScript types
export type CreateCustomerRequest = z.infer<typeof CreateCustomerSchema>;
export type UpdateCustomerRequest = z.infer<typeof UpdateCustomerSchema>;
export type CustomerQueryRequest = z.infer<typeof CustomerQuerySchema>;
export type CustomerIdRequest = z.infer<typeof CustomerIdSchema>;
export type CreateInteractionRequest = z.infer<typeof CreateInteractionSchema>;
export type UpdateInteractionRequest = z.infer<typeof UpdateInteractionSchema>;
export type InteractionQueryRequest = z.infer<typeof InteractionQuerySchema>;
export type BulkCustomerUpdateRequest = z.infer<typeof BulkCustomerUpdateSchema>;
export type BulkCustomerTagRequest = z.infer<typeof BulkCustomerTagSchema>;

// Enhanced Customer interface
export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  notes?: string;
  birthday?: string;
  customerSince: string;
  lastVisit?: string;
  tags: string[];
  marketingPreferences: {
    emailPromotions: boolean;
    smsNotifications: boolean;
    newsletter: boolean;
    specialEvents: boolean;
    unsubscribed: boolean;
  };
  createdAt: string;
  updatedAt: string;
  // Enhanced fields for CRM
  metrics?: {
    totalInteractions: number;
    totalPurchases: number;
    totalSpent: number;
    averageSpend: number;
    lastInteractionDate?: string;
    lastPurchaseDate?: string;
    lifetimeValue: number;
    engagementScore: number;
  };
  interactions?: CustomerInteraction[];
}

export interface CustomerInteraction {
  id: string;
  customerId: string;
  type: 'call' | 'email' | 'meeting' | 'event' | 'purchase' | 'note' | 'other';
  date: string;
  description: string;
  staffMember?: string;
  relatedEntityId?: string;
  relatedEntityType?: 'event' | 'ticket' | 'booking' | 'campaign' | 'task';
  createdAt: string;
  updatedAt: string;
}

// Business rule validation utilities
export const validateCustomerBusinessRules = {
  canDelete: (customer: Customer): { valid: boolean; reason?: string } => {
    if (customer.metrics && customer.metrics.totalPurchases > 0) {
      return {
        valid: false,
        reason: 'Cannot delete customer with purchase history'
      };
    }
    return { valid: true };
  },

  canUnsubscribe: (customer: Customer): { valid: boolean; reason?: string } => {
    if (customer.marketingPreferences.unsubscribed) {
      return {
        valid: false,
        reason: 'Customer is already unsubscribed'
      };
    }
    return { valid: true };
  },

  canAddInteraction: (customer: Customer, interactionType: string): { valid: boolean; reason?: string } => {
    if (interactionType === 'purchase' && customer.marketingPreferences.unsubscribed) {
      // Still allow purchase interactions even for unsubscribed customers
      return { valid: true };
    }
    return { valid: true };
  },

  hasCompleteProfile: (customer: Customer): { valid: boolean; missing?: string[] } => {
    const missing: string[] = [];
    
    if (!customer.email && !customer.phone) missing.push('contact method');
    if (!customer.address) missing.push('address');
    if (!customer.city) missing.push('city');
    if (!customer.state) missing.push('state');
    
    return {
      valid: missing.length === 0,
      missing: missing.length > 0 ? missing : undefined
    };
  },

  validateMarketingContact: (customer: Customer): { valid: boolean; reason?: string } => {
    if (customer.marketingPreferences.unsubscribed) {
      return {
        valid: false,
        reason: 'Customer has unsubscribed from marketing communications'
      };
    }
    
    if (customer.marketingPreferences.emailPromotions && !customer.email) {
      return {
        valid: false,
        reason: 'Customer has email promotions enabled but no email address'
      };
    }
    
    if (customer.marketingPreferences.smsNotifications && !customer.phone) {
      return {
        valid: false,
        reason: 'Customer has SMS notifications enabled but no phone number'
      };
    }
    
    return { valid: true };
  }
}; 