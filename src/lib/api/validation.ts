/**
 * API Input Validation Layer
 * Using Zod for type-safe validation
 */

import { z } from 'zod';
import { ValidationError, ValidationErrorClass, createValidationError } from './errors';

// Common validation schemas
export const UuidSchema = z.string().uuid('Invalid UUID format');
export const EmailSchema = z.string().email('Invalid email format');
export const PhoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format');
export const DateSchema = z.string().datetime('Invalid ISO datetime format');
export const UrlSchema = z.string().url('Invalid URL format');

// Pagination schemas
export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1, 'Page must be at least 1').default(1),
  per_page: z.coerce.number().int().min(1).max(100, 'Per page must be between 1 and 100').default(20),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('asc'),
});

// Base entity schemas
export const VenueSchema = z.object({
  id: UuidSchema.optional(),
  name: z.string().min(1, 'Name is required').max(255, 'Name must be less than 255 characters'),
  description: z.string().optional(),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State must be at least 2 characters').max(50),
  zip_code: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format'),
  country: z.string().min(2, 'Country must be at least 2 characters').max(2, 'Country must be 2 characters').default('US'),
  capacity: z.number().int().min(1, 'Capacity must be at least 1'),
  phone: PhoneSchema.optional(),
  email: EmailSchema.optional(),
  website: UrlSchema.optional(),
  timezone: z.string().default('America/New_York'),
  is_active: z.boolean().default(true),
});

export const ArtistSchema = z.object({
  id: UuidSchema.optional(),
  name: z.string().min(1, 'Name is required').max(255, 'Name must be less than 255 characters'),
  stage_name: z.string().max(255, 'Stage name must be less than 255 characters').optional(),
  genre: z.string().max(100, 'Genre must be less than 100 characters').optional(),
  bio: z.string().optional(),
  email: EmailSchema.optional(),
  phone: PhoneSchema.optional(),
  website: UrlSchema.optional(),
  spotify_url: UrlSchema.optional(),
  instagram_url: UrlSchema.optional(),
  facebook_url: UrlSchema.optional(),
  twitter_url: UrlSchema.optional(),
  booking_fee: z.number().min(0, 'Booking fee must be non-negative').optional(),
  rider_requirements: z.string().optional(),
  is_active: z.boolean().default(true),
});

export const EventSchema = z.object({
  id: UuidSchema.optional(),
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
  description: z.string().optional(),
  venue_id: UuidSchema,
  artist_id: UuidSchema.optional(),
  start_date: DateSchema,
  end_date: DateSchema.optional(),
  doors_time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)').optional(),
  show_time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)').optional(),
  ticket_price: z.number().min(0, 'Ticket price must be non-negative').optional(),
  capacity: z.number().int().min(1, 'Capacity must be at least 1'),
  age_restriction: z.enum(['all_ages', '18+', '21+']).default('all_ages'),
  status: z.enum(['draft', 'published', 'cancelled', 'completed']).default('draft'),
  is_featured: z.boolean().default(false),
}).refine(
  (data) => !data.end_date || new Date(data.end_date) >= new Date(data.start_date),
  {
    message: 'End date must be after start date',
    path: ['end_date'],
  }
);

export const CustomerSchema = z.object({
  id: UuidSchema.optional(),
  first_name: z.string().min(1, 'First name is required').max(100, 'First name must be less than 100 characters'),
  last_name: z.string().min(1, 'Last name is required').max(100, 'Last name must be less than 100 characters'),
  email: EmailSchema,
  phone: PhoneSchema.optional(),
  date_of_birth: z.string().date('Invalid date format (YYYY-MM-DD)').optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().max(50).optional(),
  zip_code: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format').optional(),
  emergency_contact_name: z.string().max(200).optional(),
  emergency_contact_phone: PhoneSchema.optional(),
  preferences: z.record(z.any()).optional(),
  marketing_consent: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

export const TicketSchema = z.object({
  id: UuidSchema.optional(),
  event_id: UuidSchema,
  customer_id: UuidSchema.optional(),
  ticket_type: z.enum(['general', 'vip', 'early_bird', 'group']).default('general'),
  price: z.number().min(0, 'Price must be non-negative'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  purchase_date: DateSchema.optional(),
  status: z.enum(['reserved', 'purchased', 'cancelled', 'refunded']).default('reserved'),
  notes: z.string().optional(),
});

// Search and filter schemas
export const SearchSchema = z.object({
  q: z.string().min(1, 'Search query must not be empty').optional(),
  filters: z.record(z.any()).optional(),
  ...PaginationSchema.shape,
});

export const DateRangeSchema = z.object({
  start_date: DateSchema.optional(),
  end_date: DateSchema.optional(),
}).refine(
  (data) => !data.start_date || !data.end_date || new Date(data.end_date) >= new Date(data.start_date),
  {
    message: 'End date must be after start date',
    path: ['end_date'],
  }
);

// File upload schema
export const FileUploadSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  content_type: z.string().min(1, 'Content type is required'),
  size: z.number().int().min(1, 'File size must be greater than 0').max(10 * 1024 * 1024, 'File size must be less than 10MB'),
  content: z.string().min(1, 'File content is required'),
});

// Configuration schema
export const ConfigurationSchema = z.object({
  venue_id: UuidSchema,
  settings: z.record(z.any()),
  updated_by: UuidSchema,
});

// Validation middleware
export class ValidationMiddleware {
  static validateBody<T>(schema: z.ZodSchema<T>, data: unknown): T {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors = error.errors.map(err => 
          createValidationError(
            err.path.join('.'),
            err.code,
            err.message,
            err.path.length > 0 ? this.getNestedValue(data, err.path) : data
          )
        );
        throw new ValidationErrorClass(validationErrors);
      }
      throw error;
    }
  }

  static validateQuery<T>(schema: z.ZodSchema<T>, searchParams: URLSearchParams): T {
    const queryObject: Record<string, unknown> = {};
    
    searchParams.forEach((value, key) => {
      // Handle array parameters (e.g., filters[])
      if (key.endsWith('[]')) {
        const baseKey = key.slice(0, -2);
        if (!queryObject[baseKey]) {
          queryObject[baseKey] = [];
        }
        (queryObject[baseKey] as unknown[]).push(value);
      } else {
        queryObject[key] = value;
      }
    });

    return this.validateBody(schema, queryObject);
  }

  static validateParams<T>(schema: z.ZodSchema<T>, params: Record<string, string>): T {
    return this.validateBody(schema, params);
  }

  private static getNestedValue(obj: unknown, path: (string | number)[]): unknown {
    return path.reduce((current, key) => (current as Record<string | number, unknown>)?.[key], obj);
  }
}

// Request validation helpers
export const validateRequest = async <TBody, TQuery, TParams>(
  request: Request,
  schemas: {
    body?: z.ZodSchema<TBody>;
    query?: z.ZodSchema<TQuery>;
    params?: z.ZodSchema<TParams>;
  },
  params?: Record<string, string>
): Promise<{
  body?: TBody;
  query?: TQuery;
  validatedParams?: TParams;
}> => {
  const result: {
    body?: TBody;
    query?: TQuery;
    validatedParams?: TParams;
  } = {};

  // Validate body
  if (schemas.body) {
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      throw new ValidationErrorClass([
        createValidationError('content-type', 'invalid_type', 'Content-Type must be application/json')
      ]);
    }

    try {
      const body = await request.json();
      result.body = ValidationMiddleware.validateBody(schemas.body, body);
    } catch (error) {
      if (error instanceof ValidationErrorClass) {
        throw error;
      }
      throw new ValidationErrorClass([
        createValidationError('body', 'invalid_json', 'Invalid JSON in request body')
      ]);
    }
  }

  // Validate query parameters
  if (schemas.query) {
    const url = new URL(request.url);
    result.query = ValidationMiddleware.validateQuery(schemas.query, url.searchParams);
  }

  // Validate path parameters
  if (schemas.params && params) {
    result.validatedParams = ValidationMiddleware.validateParams(schemas.params, params);
  }

  return result;
};

// Common parameter schemas
export const IdParamSchema = z.object({
  id: UuidSchema,
});

export const SlugParamSchema = z.object({
  slug: z.string().min(1, 'Slug is required'),
});

// Bulk operation schemas
export const BulkDeleteSchema = z.object({
  ids: z.array(UuidSchema).min(1, 'At least one ID is required').max(100, 'Maximum 100 IDs allowed'),
});

export const BulkUpdateSchema = z.object({
  updates: z.array(z.object({
    id: UuidSchema,
    data: z.record(z.any()),
  })).min(1, 'At least one update is required').max(100, 'Maximum 100 updates allowed'),
});

// Export common validation functions
export const isValidUuid = (value: string): boolean => {
  return UuidSchema.safeParse(value).success;
};

export const isValidEmail = (value: string): boolean => {
  return EmailSchema.safeParse(value).success;
};

export const isValidUrl = (value: string): boolean => {
  return UrlSchema.safeParse(value).success;
};

export const sanitizeString = (value: string, maxLength: number = 255): string => {
  return value.trim().slice(0, maxLength);
};

export const sanitizeHtml = (value: string): string => {
  // Basic HTML sanitization - in production, use a proper library like DOMPurify
  return value
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim();
};

// Direct export functions for service compatibility
export const validateQuery = <T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: any } => {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationErrors = error.errors.map(err => 
        createValidationError(
          err.path.join('.'),
          err.code,
          err.message,
          err.path.length > 0 ? getNestedValue(data, err.path) : data
        )
      );
      return { 
        success: false, 
        error: {
          type: 'https://docs.trainstation-dashboard.com/errors/validation-error',
          title: 'Validation Error',
          status: 400,
          detail: 'Request data validation failed',
          instance: '/validation',
          timestamp: new Date().toISOString(),
          errors: validationErrors
        }
      };
    }
    return { 
      success: false, 
      error: {
        type: 'https://docs.trainstation-dashboard.com/errors/validation-error',
        title: 'Validation Error',
        status: 400,
        detail: 'Unknown validation error',
        instance: '/validation',
        timestamp: new Date().toISOString()
      }
    };
  }
};

export const validateParams = <T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: any } => {
  return validateQuery(schema, data);
};

// Helper function for nested value extraction
const getNestedValue = (obj: unknown, path: (string | number)[]): unknown => {
  return path.reduce((current, key) => (current as Record<string | number, unknown>)?.[key], obj);
}; 