/**
 * API Client
 * Comprehensive HTTP client for Train Station Dashboard API
 */

import { ApiResponse, ResponseMeta } from './types';
import { ApiErrorBase, AuthenticationError, AuthorizationError, NotFoundError } from './errors';
import { rateLimitMiddleware, RateLimitConfig } from './rateLimit';
import { createAuthMiddleware, AuthContext, Permission, UserRole } from './auth';

export interface ApiClientConfig {
  baseUrl: string;
  apiVersion?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  defaultHeaders?: Record<string, string>;
  auth?: {
    type: 'bearer' | 'api-key';
    token?: string;
    apiKey?: string;
  };
  rateLimit?: RateLimitConfig;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  data?: unknown;
  timeout?: number;
  retries?: number;
  auth?: {
    required?: boolean;
    permissions?: Permission[];
    roles?: UserRole[];
  };
  cache?: {
    key?: string;
    ttl?: number;
  };
}

export interface Endpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  auth?: {
    required: boolean;
    permissions?: Permission[];
    roles?: UserRole[];
  };
  rateLimit?: Partial<RateLimitConfig>;
  cache?: {
    enabled: boolean;
    ttl: number;
  };
}

// API Endpoints Registry
export const API_ENDPOINTS = {
  // Authentication
  AUTH_LOGIN: { path: '/auth/login', method: 'POST' } as Endpoint,
  AUTH_LOGOUT: { path: '/auth/logout', method: 'POST', auth: { required: true } } as Endpoint,
  AUTH_REFRESH: { path: '/auth/refresh', method: 'POST' } as Endpoint,
  AUTH_PROFILE: { path: '/auth/profile', method: 'GET', auth: { required: true } } as Endpoint,

  // Venues
  VENUES_LIST: { 
    path: '/venues', 
    method: 'GET', 
    auth: { required: true, permissions: [Permission.VENUE_READ] },
    cache: { enabled: true, ttl: 300000 } // 5 minutes
  } as Endpoint,
  VENUES_CREATE: { 
    path: '/venues', 
    method: 'POST', 
    auth: { required: true, permissions: [Permission.VENUE_CREATE] } 
  } as Endpoint,
  VENUES_GET: { 
    path: '/venues/:id', 
    method: 'GET', 
    auth: { required: true, permissions: [Permission.VENUE_READ] },
    cache: { enabled: true, ttl: 600000 } // 10 minutes
  } as Endpoint,
  VENUES_UPDATE: { 
    path: '/venues/:id', 
    method: 'PUT', 
    auth: { required: true, permissions: [Permission.VENUE_UPDATE] } 
  } as Endpoint,
  VENUES_DELETE: { 
    path: '/venues/:id', 
    method: 'DELETE', 
    auth: { required: true, permissions: [Permission.VENUE_DELETE] } 
  } as Endpoint,

  // Events
  EVENTS_LIST: { 
    path: '/events', 
    method: 'GET', 
    auth: { required: true, permissions: [Permission.EVENT_READ] },
    cache: { enabled: true, ttl: 180000 } // 3 minutes
  } as Endpoint,
  EVENTS_CREATE: { 
    path: '/events', 
    method: 'POST', 
    auth: { required: true, permissions: [Permission.EVENT_CREATE] } 
  } as Endpoint,
  EVENTS_GET: { 
    path: '/events/:id', 
    method: 'GET', 
    auth: { required: true, permissions: [Permission.EVENT_READ] },
    cache: { enabled: true, ttl: 300000 } // 5 minutes
  } as Endpoint,
  EVENTS_UPDATE: { 
    path: '/events/:id', 
    method: 'PUT', 
    auth: { required: true, permissions: [Permission.EVENT_UPDATE] } 
  } as Endpoint,
  EVENTS_DELETE: { 
    path: '/events/:id', 
    method: 'DELETE', 
    auth: { required: true, permissions: [Permission.EVENT_DELETE] } 
  } as Endpoint,

  // Customers
  CUSTOMERS_LIST: { 
    path: '/customers', 
    method: 'GET', 
    auth: { required: true, permissions: [Permission.CUSTOMER_READ] } 
  } as Endpoint,
  CUSTOMERS_CREATE: { 
    path: '/customers', 
    method: 'POST', 
    auth: { required: true, permissions: [Permission.CUSTOMER_CREATE] } 
  } as Endpoint,
  CUSTOMERS_GET: { 
    path: '/customers/:id', 
    method: 'GET', 
    auth: { required: true, permissions: [Permission.CUSTOMER_READ] } 
  } as Endpoint,
  CUSTOMERS_UPDATE: { 
    path: '/customers/:id', 
    method: 'PUT', 
    auth: { required: true, permissions: [Permission.CUSTOMER_UPDATE] } 
  } as Endpoint,
  CUSTOMERS_DELETE: { 
    path: '/customers/:id', 
    method: 'DELETE', 
    auth: { required: true, permissions: [Permission.CUSTOMER_DELETE] } 
  } as Endpoint,

  // Analytics
  ANALYTICS_OVERVIEW: { 
    path: '/analytics/overview', 
    method: 'GET', 
    auth: { required: true, permissions: [Permission.ANALYTICS_READ] },
    cache: { enabled: true, ttl: 120000 } // 2 minutes
  } as Endpoint,
  ANALYTICS_REVENUE: { 
    path: '/analytics/revenue', 
    method: 'GET', 
    auth: { required: true, permissions: [Permission.ANALYTICS_READ, Permission.FINANCE_READ] } 
  } as Endpoint,
  ANALYTICS_ATTENDANCE: { 
    path: '/analytics/attendance', 
    method: 'GET', 
    auth: { required: true, permissions: [Permission.ANALYTICS_READ] } 
  } as Endpoint,

  // Inventory
  INVENTORY_LIST: { 
    path: '/inventory', 
    method: 'GET', 
    auth: { required: true, permissions: [Permission.INVENTORY_READ] } 
  } as Endpoint,
  INVENTORY_CREATE: { 
    path: '/inventory', 
    method: 'POST', 
    auth: { required: true, permissions: [Permission.INVENTORY_CREATE] } 
  } as Endpoint,
  INVENTORY_UPDATE: { 
    path: '/inventory/:id', 
    method: 'PUT', 
    auth: { required: true, permissions: [Permission.INVENTORY_UPDATE] } 
  } as Endpoint,

  // Finances
  FINANCES_TRANSACTIONS: { 
    path: '/finances/transactions', 
    method: 'GET', 
    auth: { required: true, permissions: [Permission.FINANCE_READ] } 
  } as Endpoint,
  FINANCES_REPORTS: { 
    path: '/finances/reports', 
    method: 'GET', 
    auth: { required: true, permissions: [Permission.FINANCE_READ] } 
  } as Endpoint,

  // Staff Management
  STAFF_LIST: { 
    path: '/staff', 
    method: 'GET', 
    auth: { required: true, permissions: [Permission.STAFF_READ] } 
  } as Endpoint,
  STAFF_CREATE: { 
    path: '/staff', 
    method: 'POST', 
    auth: { required: true, permissions: [Permission.STAFF_MANAGE] } 
  } as Endpoint,

  // Marketing
  MARKETING_CAMPAIGNS: { 
    path: '/marketing/campaigns', 
    method: 'GET', 
    auth: { required: true, permissions: [Permission.MARKETING_READ] } 
  } as Endpoint,
  MARKETING_CREATE_CAMPAIGN: { 
    path: '/marketing/campaigns', 
    method: 'POST', 
    auth: { required: true, permissions: [Permission.MARKETING_WRITE] } 
  } as Endpoint,
} as const;

// Simple in-memory cache
class ApiCache {
  private cache = new Map<string, { data: unknown; expires: number }>();

  set(key: string, data: unknown, ttl: number): void {
    this.cache.set(key, {
      data,
      expires: Date.now() + ttl
    });
  }

  get(key: string): unknown | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

export class ApiClient {
  private config: Required<ApiClientConfig>;
  private cache = new ApiCache();
  private requestId = 0;

  constructor(config: ApiClientConfig) {
    this.config = {
      baseUrl: config.baseUrl,
      apiVersion: config.apiVersion || 'v1',
      timeout: config.timeout || 30000,
      retries: config.retries || 3,
      retryDelay: config.retryDelay || 1000,
      defaultHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...config.defaultHeaders
      },
      auth: config.auth || { type: 'bearer' },
      rateLimit: config.rateLimit || {
        windowMs: 60000, // 1 minute
        maxRequests: 100,
        keyGenerator: () => 'default'
      }
    };
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${++this.requestId}`;
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
    let url = `${this.config.baseUrl}/api/${this.config.apiVersion}${endpoint}`;
    
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, String(value));
      });
      url += `?${searchParams.toString()}`;
    }
    
    return url;
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async makeRequest<T>(
    endpoint: Endpoint,
    path: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const requestId = this.generateRequestId();
    const startTime = Date.now();
    
    // Build headers
    const headers = new Headers({
      ...this.config.defaultHeaders,
      ...options.headers,
      'X-Request-ID': requestId,
      'X-API-Version': this.config.apiVersion
    });

    // Add authentication headers
    if (this.config.auth.type === 'bearer' && this.config.auth.token) {
      headers.set('Authorization', `Bearer ${this.config.auth.token}`);
    } else if (this.config.auth.type === 'api-key' && this.config.auth.apiKey) {
      headers.set('X-API-Key', this.config.auth.apiKey);
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || this.config.timeout);

    // Build request
    const request = new Request(this.buildUrl(path, options.params), {
      method: options.method || endpoint.method,
      headers,
      body: options.data ? JSON.stringify(options.data) : undefined,
      signal: controller.signal
    });

    const retries = options.retries ?? this.config.retries;
    let lastError: Error | null = null;

    try {
      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          // Check authentication requirements
          if (endpoint.auth?.required || options.auth?.required) {
            const authMiddleware = createAuthMiddleware({
              required: endpoint.auth?.required ?? options.auth?.required ?? true,
              permissions: options.auth?.permissions || endpoint.auth?.permissions || [],
              roles: options.auth?.roles || endpoint.auth?.roles || []
            });

            const { error } = await authMiddleware(request);
            if (error) {
              throw new Error('Authentication failed');
            }
          }

          // Check cache first (for GET requests)
          if (request.method === 'GET' && endpoint.cache?.enabled) {
            const cacheKey = options.cache?.key || `${request.method}:${request.url}`;
            const cached = this.cache.get(cacheKey);
            if (cached) {
              return cached as ApiResponse<T>;
            }
          }

          // Make the request
          const response = await fetch(request);
          const responseTime = Date.now() - startTime;

          // Parse response
          let data: unknown;
          const contentType = response.headers.get('Content-Type') || '';
          
          if (contentType.includes('application/json')) {
            data = await response.json();
          } else {
            data = await response.text();
          }

          // Handle errors
          if (!response.ok) {
            if (response.status >= 500) {
              throw new ApiErrorBase('INTERNAL_SERVER_ERROR');
            } else if (response.status === 401) {
              throw new AuthenticationError();
            } else if (response.status === 403) {
              throw new AuthorizationError();
            } else if (response.status === 404) {
              throw new NotFoundError('resource');
            } else if (response.status === 429) {
              throw new ApiErrorBase('RATE_LIMIT_EXCEEDED');
            } else {
              throw new ApiErrorBase('INVALID_INPUT', `Request failed with status ${response.status}`);
            }
          }

          // Build response metadata
          const meta: ResponseMeta = {
            timestamp: new Date().toISOString(),
            request_id: requestId,
            version: this.config.apiVersion,
            status: 'success'
          };

          const apiResponse: ApiResponse<T> = {
            data: data as T,
            meta
          };

          // Cache successful GET responses
          if (request.method === 'GET' && endpoint.cache?.enabled) {
            const cacheKey = options.cache?.key || `${request.method}:${request.url}`;
            this.cache.set(cacheKey, apiResponse, endpoint.cache.ttl);
          }

          return apiResponse;

        } catch (error) {
          lastError = error as Error;
          
          // Don't retry on authentication errors or client errors
          if (error instanceof ApiErrorBase && error.status < 500) {
            throw error;
          }

          // Don't retry on the last attempt
          if (attempt === retries) {
            break;
          }

          // Wait before retrying
          await this.sleep(this.config.retryDelay * Math.pow(2, attempt));
        }
      }
    } finally {
      clearTimeout(timeoutId);
    }

    // If we get here, all retries failed
    throw lastError || new Error('Request failed after all retries');
  }

  // Public API methods
  async get<T>(endpoint: Endpoint, path: string, options: Omit<RequestOptions, 'method' | 'data'> = {}): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, path, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: Endpoint, path: string, data?: unknown, options: Omit<RequestOptions, 'method'> = {}): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, path, { ...options, method: 'POST', data });
  }

  async put<T>(endpoint: Endpoint, path: string, data?: unknown, options: Omit<RequestOptions, 'method'> = {}): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, path, { ...options, method: 'PUT', data });
  }

  async delete<T>(endpoint: Endpoint, path: string, options: Omit<RequestOptions, 'method' | 'data'> = {}): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, path, { ...options, method: 'DELETE' });
  }

  async patch<T>(endpoint: Endpoint, path: string, data?: unknown, options: Omit<RequestOptions, 'method'> = {}): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, path, { ...options, method: 'PATCH', data });
  }

  // Utility methods
  setAuthToken(token: string): void {
    this.config.auth = { type: 'bearer', token };
  }

  setApiKey(apiKey: string): void {
    this.config.auth = { type: 'api-key', apiKey };
  }

  clearAuth(): void {
    this.config.auth = { type: 'bearer' };
  }

  clearCache(): void {
    this.cache.clear();
  }

  // Helper method to replace path parameters
  static interpolatePath(path: string, params: Record<string, string | number>): string {
    return path.replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, (match, paramName) => {
      if (paramName in params) {
        return String(params[paramName]);
      }
      throw new Error(`Missing path parameter: ${paramName}`);
    });
  }

  getConfig(): Required<ApiClientConfig> {
    return { ...this.config };
  }
}

// Default client instance
let defaultClient: ApiClient | null = null;

export const createApiClient = (config: ApiClientConfig): ApiClient => {
  return new ApiClient(config);
};

export const setDefaultClient = (client: ApiClient): void => {
  defaultClient = client;
};

export const getDefaultClient = (): ApiClient => {
  if (!defaultClient) {
    throw new Error('No default API client configured. Call setDefaultClient() first.');
  }
  return defaultClient;
};

// Convenience functions using the default client
export const api = {
  get: <T>(endpoint: Endpoint, path: string, options?: Omit<RequestOptions, 'method' | 'data'>) =>
    getDefaultClient().get<T>(endpoint, path, options),
  
  post: <T>(endpoint: Endpoint, path: string, data?: unknown, options?: Omit<RequestOptions, 'method'>) =>
    getDefaultClient().post<T>(endpoint, path, data, options),
  
  put: <T>(endpoint: Endpoint, path: string, data?: unknown, options?: Omit<RequestOptions, 'method'>) =>
    getDefaultClient().put<T>(endpoint, path, data, options),
  
  delete: <T>(endpoint: Endpoint, path: string, options?: Omit<RequestOptions, 'method' | 'data'>) =>
    getDefaultClient().delete<T>(endpoint, path, options),
  
  patch: <T>(endpoint: Endpoint, path: string, data?: unknown, options?: Omit<RequestOptions, 'method'>) =>
    getDefaultClient().patch<T>(endpoint, path, data, options),
};

// Health check utility
export const healthCheck = async (): Promise<{ status: 'healthy' | 'unhealthy'; details: Record<string, unknown> }> => {
  try {
    const client = getDefaultClient();
    const config = client.getConfig();
    const response = await fetch(`${config.baseUrl}/health`);
    const data = await response.json();
    
    return {
      status: response.ok ? 'healthy' : 'unhealthy',
      details: data
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    };
  }
}; 