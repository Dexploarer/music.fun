import { supabase } from '../../supabase';
import { AuthService, UserRole } from '../auth';
import { RateLimiter, rateLimitConfigs, keyGenerators } from '../rateLimit';
import { buildSuccessResponse } from '../types';
import { buildErrorResponse } from '../errors';
import type { ApiResponse } from '../types';
import { 
  ValidationErrorClass, 
  DatabaseError, 
  NotFoundError, 
  AuthenticationError,
  AuthorizationError 
} from '../errors';

export interface SupabaseAdapterConfig {
  tableName: string;
  requiredRole?: UserRole;
  rateLimitKey?: string;
  enableLogging?: boolean;
}

export interface QueryOptions {
  select?: string;
  filters?: Record<string, unknown>;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  offset?: number;
}

export class SupabaseAdapter {
  private auth: AuthService;
  private rateLimiter: RateLimiter;

  constructor() {
    this.auth = new AuthService();
    // Initialize RateLimiter with default configuration
    this.rateLimiter = new RateLimiter({
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 1000,
      keyGenerator: keyGenerators.user,
      message: 'Too many requests, please try again later.'
    });
  }

  /**
   * Execute a Supabase query with full API standards integration
   */
  async executeQuery<T>(
    config: SupabaseAdapterConfig,
    operation: () => Promise<{ data: T | null; error: unknown | null }>,
    operationType: 'read' | 'write' = 'read'
  ): Promise<ApiResponse<T>> {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();

    try {
      // 1. Authentication Check
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        const errorResponse = buildErrorResponse(
          new AuthenticationError(),
          requestId
        );
        return {
          data: null as any,
          meta: {
            request_id: requestId,
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            status: 'error',
            message: errorResponse.detail
          },
          error: errorResponse
        } as ApiResponse<T>;
      }

      // 2. Authorization Check (if role required)
      if (config.requiredRole) {
        const userRole = await this.getUserRole(session.user.id);
        const authResult = await this.auth.validateRoles(userRole, [config.requiredRole]);
        if (authResult.error) {
          const errorResponse = buildErrorResponse(
            new AuthorizationError(),
            requestId
          );
          return {
            data: null as any,
            meta: {
              request_id: requestId,
              timestamp: new Date().toISOString(),
              version: '1.0.0',
              status: 'error',
              message: errorResponse.detail
            },
            error: errorResponse
          } as ApiResponse<T>;
        }
      }

      // 3. Rate Limiting
      if (config.rateLimitKey) {
        try {
          // Create a mock request object for the rate limiter
          const mockRequest = new Request('http://localhost', {
            headers: {
              'user-id': session.user.id,
              'x-forwarded-for': '127.0.0.1'
            }
          });
          
          const rateLimitResult = await this.rateLimiter.check(mockRequest);
          if (!rateLimitResult.allowed) {
            const errorResponse = buildErrorResponse(
              new ValidationErrorClass([{
                field: 'rate_limit',
                code: 'RATE_LIMIT_EXCEEDED',
                message: 'Rate limit exceeded. Please try again later.'
              }]),
              requestId
            );
            return {
              data: null as any,
              meta: {
                request_id: requestId,
                timestamp: new Date().toISOString(),
                version: '1.0.0',
                status: 'error',
                message: errorResponse.detail
              },
              error: errorResponse
            } as ApiResponse<T>;
          }
        } catch (rateLimitError) {
          // If rate limiting fails, log but continue (fail-open approach for development)
          console.warn('Rate limiting check failed, continuing:', rateLimitError);
        }
      }

      // 4. Execute Operation
      const { data, error } = await operation();

      // 5. Handle Supabase Errors
      if (error) {
        return this.handleSupabaseError(error, requestId);
      }

      // 6. Handle Not Found
      if (!data) {
        const errorResponse = buildErrorResponse(
          new NotFoundError('Resource'),
          requestId
        );
        return {
          data: null as any,
          meta: {
            request_id: requestId,
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            status: 'error',
            message: errorResponse.detail
          },
          error: errorResponse
        } as ApiResponse<T>;
      }

      // 7. Success Response
      const duration = Date.now() - startTime;
      
      if (config.enableLogging) {
        console.log(`[SupabaseAdapter] ${operationType.toUpperCase()} ${config.tableName}`, {
          requestId,
          duration: `${duration}ms`,
          userId: session.user.id,
          success: true
        });
      }

      return buildSuccessResponse(data, requestId, {
        message: `${operationType} operation completed successfully`
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      
      if (config.enableLogging) {
        console.error(`[SupabaseAdapter] Error in ${config.tableName}`, {
          requestId,
          duration: `${duration}ms`,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      const errorResponse = buildErrorResponse(
        error instanceof Error ? error : new DatabaseError('Unknown error occurred'),
        requestId
      );
      
      return {
        data: null as any,
        meta: {
          request_id: requestId,
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          status: 'error',
          message: errorResponse.detail
        },
        error: errorResponse
      } as ApiResponse<T>;
    }
  }

  /**
   * Build a Supabase query with standard options
   */
  buildQuery(tableName: string, options: QueryOptions = {}) {
    let query = supabase.from(tableName);

    // Select fields
    if (options.select) {
      query = query.select(options.select);
    } else {
      query = query.select('*');
    }

    // Apply filters
    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
    }

    // Order by
    if (options.orderBy) {
      query = query.order(options.orderBy.column, { 
        ascending: options.orderBy.ascending !== false 
      });
    }

    // Pagination
    if (options.limit) {
      query = query.limit(options.limit);
    }
    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
    }

    return query;
  }

  /**
   * Convert snake_case to camelCase for frontend consumption
   */
  toCamelCase(obj: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    
    Object.entries(obj).forEach(([key, value]) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      result[camelKey] = value;
    });
    
    return result;
  }

  /**
   * Convert camelCase to snake_case for database operations
   */
  toSnakeCase(obj: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    
    Object.entries(obj).forEach(([key, value]) => {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      result[snakeKey] = value;
    });
    
    return result;
  }

  /**
   * Handle Supabase-specific errors and convert to our error format
   */
  private handleSupabaseError<T>(error: unknown, requestId: string): ApiResponse<T> {
    let errorResponse;
    
    if (typeof error === 'object' && error !== null) {
      const supabaseError = error as { code?: string; message?: string; details?: string };
      
      // Map common Supabase error codes
      switch (supabaseError.code) {
        case 'PGRST116':
          errorResponse = buildErrorResponse(
            new NotFoundError('Resource'),
            requestId
          );
          break;
        case '23505':
          errorResponse = buildErrorResponse(
            new ValidationErrorClass([{
              field: 'unique_constraint',
              code: 'DUPLICATE_ENTRY',
              message: 'Duplicate entry. This resource already exists.'
            }]),
            requestId
          );
          break;
        case '23503':
          errorResponse = buildErrorResponse(
            new ValidationErrorClass([{
              field: 'foreign_key',
              code: 'INVALID_REFERENCE',
              message: 'Referenced resource does not exist.'
            }]),
            requestId
          );
          break;
        case '42501':
          errorResponse = buildErrorResponse(
            new AuthorizationError(),
            requestId
          );
          break;
        default:
          errorResponse = buildErrorResponse(
            new DatabaseError(supabaseError.message || 'Database operation failed'),
            requestId
          );
      }
    } else {
      // Fallback for unknown errors
      errorResponse = buildErrorResponse(
        new DatabaseError('An unexpected database error occurred'),
        requestId
      );
    }

    return {
      data: null as any,
      meta: {
        request_id: requestId,
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        status: 'error',
        message: errorResponse.detail
      },
      error: errorResponse
    } as ApiResponse<T>;
  }

  /**
   * Get user role from the database
   */
  private async getUserRole(userId: string): Promise<UserRole> {
    try {
      const { data } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      return (data?.role as UserRole) || UserRole.USER;
    } catch {
      return UserRole.USER;
    }
  }
} 