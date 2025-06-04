/**
 * Train Station Dashboard API Standards
 * Comprehensive API layer with RFC 7807 error handling, validation, authentication, and rate limiting
 * 
 * @author Train Station Dashboard Team
 * @version 1.0.0
 */

// Import required classes and enums for use in this file
import { ApiClient } from './client';
import { Permission, UserRole } from './auth';
import { rateLimitConfigs } from './rateLimit';

// Type definitions and response builders
export type {
  ApiResponse,
  ResponseMeta,
  PaginationMeta,
  CacheMeta,
  ResponseLinks,
  ListResponse,
  HttpMethod,
  RequestContext,
  ApiVersion,
  HealthCheckResponse,
  ServiceStatus
} from './types';

export {
  buildSuccessResponse,
  buildListResponse,
  buildPaginationMeta,
  buildPaginationLinks,
  generateRequestId,
  buildRequestContext,
  buildRateLimitHeaders,
  buildCacheHeaders,
  createApiResponse
} from './types';

// Error handling and definitions
export type {
  ApiError,
  ValidationError,
  ErrorDefinition
} from './errors';

export {
  ErrorCategory,
  errorDefinitions,
  ApiErrorBase,
  ValidationErrorClass,
  NotFoundError,
  AuthenticationError,
  AuthorizationError,
  buildErrorResponse,
  handleApiError,
  createValidationError,
  logError
} from './errors';

// Validation schemas and middleware
export {
  UuidSchema,
  EmailSchema,
  PhoneSchema,
  DateSchema,
  UrlSchema,
  PaginationSchema,
  VenueSchema,
  ArtistSchema,
  EventSchema,
  CustomerSchema,
  TicketSchema,
  SearchSchema,
  DateRangeSchema,
  FileUploadSchema,
  ConfigurationSchema,
  ValidationMiddleware,
  validateRequest,
  IdParamSchema,
  SlugParamSchema,
  BulkDeleteSchema,
  BulkUpdateSchema,
  isValidUuid,
  isValidEmail,
  isValidUrl,
  sanitizeString,
  sanitizeHtml
} from './validation';

// Authentication and authorization
export type {
  JWTPayload,
  ApiKey,
  AuthContext
} from './auth';

export {
  UserRole,
  Permission,
  AuthService,
  createAuthMiddleware,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  hasRole,
  hasAnyRole,
  securityHeaders,
  corsConfig,
  sessionConfig
} from './auth';

// Rate limiting (excluding RateLimitInfo to avoid duplicate)
export type {
  RateLimitConfig,
  RateLimitBypass
} from './rateLimit';

export {
  RateLimiter,
  keyGenerators,
  rateLimitConfigs,
  createRateLimiter,
  rateLimitMiddleware,
  getRateLimitStatus,
  resetRateLimit,
  SlidingWindowRateLimiter,
  TokenBucketRateLimiter
} from './rateLimit';

// Re-export RateLimitInfo from types to avoid conflict
export type { RateLimitInfo } from './types';

// API Client
export type {
  ApiClientConfig,
  RequestOptions,
  Endpoint
} from './client';

export {
  API_ENDPOINTS,
  ApiClient,
  createApiClient,
  setDefaultClient,
  getDefaultClient,
  api,
  healthCheck
} from './client';

// Utility constants
export const API_VERSION = '1.0.0' as const;
export const BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3000' as const;
export const REQUEST_TIMEOUT = 30000 as const; // 30 seconds
export const DEFAULT_CACHE_TTL = 300000 as const; // 5 minutes

// Pre-configured instances for common use cases
export const createStandardApiClient = () => {
  return new ApiClient({
    baseUrl: BASE_URL,
    apiVersion: API_VERSION,
    timeout: REQUEST_TIMEOUT,
    retries: 3,
    retryDelay: 1000,
    defaultHeaders: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Client-Version': API_VERSION
    }
  });
};

export const createAuthenticatedApiClient = (token: string) => {
  const client = createStandardApiClient();
  client.setAuthToken(token);
  return client;
};

export const createApiKeyClient = (apiKey: string) => {
  const client = createStandardApiClient();
  client.setApiKey(apiKey);
  return client;
};

// Common middleware configurations
export const standardAuthConfig = {
  required: true,
  permissions: [],
  roles: []
};

export const adminAuthConfig = {
  required: true,
  permissions: [Permission.SYSTEM_ADMIN],
  roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN]
};

export const managerAuthConfig = {
  required: true,
  permissions: [],
  roles: [UserRole.MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN]
};

// Common validation configurations
export const standardValidation = {
  validateBody: true,
  validateQuery: true,
  validateParams: true,
  abortEarly: false
};

// Rate limiting configurations for common use cases
export const getDefaultRateLimitConfig = () => rateLimitConfigs.default;
export const getAuthRateLimitConfig = () => rateLimitConfigs.auth;
export const getApiKeyRateLimitConfig = () => rateLimitConfigs.apiKey;

// Services
export { VenueService, venueService } from './services/venueService';
export type { Venue, VenueListResponse } from './services/venueService';
export { eventsService } from './services/eventsService';
export { ArtistService } from './services/artistService';
export { customerService } from './services/customerService';
export { inventoryService } from './services/inventoryService';
export { financeService } from './services/financeService';
export { staffService } from './services/staffService';

// Adapters
export { SupabaseAdapter } from './adapters/supabaseAdapter';
export type { SupabaseAdapterConfig, QueryOptions } from './adapters/supabaseAdapter';

// Schemas - All entity schemas with comprehensive validation
export * from './schemas/eventSchemas';
export * from './schemas/artistSchemas';
export * from './schemas/customerSchemas';
export * from './schemas/inventorySchemas';
export * from './schemas/financeSchemas';
export * from './schemas/staffSchemas';

// Inventory schemas with explicit exports to avoid conflicts
export {
  CreateInventoryItemSchema,
  UpdateInventoryItemSchema,
  InventoryQuerySchema,
  InventoryIdSchema,
  CreateInventoryTransactionSchema as CreateInventoryTransactionSchema,
  CreateCategorySchema,
  AlertConfigSchema,
  validateInventoryBusinessRules,
  type CreateInventoryItemRequest,
  type UpdateInventoryItemRequest,
  type InventoryQueryRequest,
  type InventoryItem,
  type InventoryTransaction,
  type CreateInventoryTransactionRequest as CreateInventoryTransactionRequest,
  type InventoryCategory,
  type CreateCategoryRequest,
  type InventoryAlert,
  type AlertConfigRequest,
  type EnhancedInventoryItem,
} from './schemas/inventorySchemas';
// Finance schemas with explicit exports to avoid conflicts
export {
  CreateTransactionSchema as CreateFinanceTransactionSchema,
  UpdateTransactionSchema as UpdateFinanceTransactionSchema,
  TransactionQuerySchema as FinanceTransactionQuerySchema,
  TransactionIdSchema as FinanceTransactionIdSchema,
  CreateAccountSchema,
  CreateBudgetSchema,
  RecurringTransactionSchema,
  validateFinanceBusinessRules,
  type CreateTransactionRequest as CreateFinanceTransactionRequest,
  type UpdateTransactionRequest as UpdateFinanceTransactionRequest,
  type TransactionQueryRequest as FinanceTransactionQueryRequest,
  type Transaction as FinanceTransaction,
  type Account,
  type CreateAccountRequest,
  type Budget,
  type CreateBudgetRequest,
  type RecurringTransaction,
  type CreateRecurringTransactionRequest,
  type FinancialReport,
  type EnhancedTransaction,
} from './schemas/financeSchemas';
export * from './schemas/staffSchemas';

// Enhanced Hooks
export { useEventsEnhanced } from '../../hooks/useEventsEnhanced';
export type { EnhancedEvent } from '../../hooks/useEventsEnhanced';

// Example usage
export * from './examples';

// Documentation
// See: CONFIG_GUIDE.md for implementation instructions
// See: IMPLEMENTATION_STATUS.md for current status and next steps

// Export all as a single namespace for convenience
export * as ApiStandards from './index';

// Export service response types
export * from './serviceResponse';

// Export all services and schemas
export * from './services/eventsService';
export * from './services/artistService';
export * from './services/customerService';
export * from './services/inventoryService';
export * from './services/financeService';
export * from './services/staffService';

// Export all schemas
export * from './schemas/eventSchemas';
export * from './schemas/artistSchemas';
export * from './schemas/customerSchemas';
export * from './schemas/inventorySchemas';
export * from './schemas/financeSchemas';
export * from './schemas/staffSchemas'; 