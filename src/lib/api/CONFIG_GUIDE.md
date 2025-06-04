# API Standards Configuration Guide

## Quick Start

### 1. Environment Setup

First, ensure you have the required environment variables:

```bash
# .env
VITE_API_BASE_URL=https://api.trainstation-dashboard.com
VITE_API_VERSION=v1
VITE_API_TIMEOUT=30000

# Authentication
VITE_JWT_SECRET=your-jwt-secret-here
VITE_API_KEY=your-api-key-here

# Rate Limiting
VITE_RATE_LIMIT_WINDOW=60000
VITE_RATE_LIMIT_MAX_REQUESTS=100

# Monitoring
VITE_MONITORING_ENABLED=true
VITE_ERROR_REPORTING_URL=https://errors.trainstation-dashboard.com
```

### 2. Basic Client Setup

```typescript
import { ApiClient, API_ENDPOINTS } from '@/lib/api';

// Create the main API client
export const apiClient = new ApiClient({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  apiVersion: import.meta.env.VITE_API_VERSION,
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT),
  retries: 3,
  auth: {
    type: 'bearer',
    token: localStorage.getItem('auth_token') || undefined
  },
  defaultHeaders: {
    'X-Client-Name': 'Train Station Dashboard',
    'X-Client-Version': '1.0.0'
  }
});

// Update token when authentication changes
export const updateAuthToken = (token: string) => {
  apiClient.setAuthToken(token);
  localStorage.setItem('auth_token', token);
};

export const clearAuth = () => {
  apiClient.clearAuth();
  localStorage.removeItem('auth_token');
};
```

### 3. React Integration

Create a custom hook for API calls:

```typescript
// hooks/useApi.ts
import { useState, useCallback } from 'react';
import { apiClient, API_ENDPOINTS } from '@/lib/api';
import { ApiErrorBase } from '@/lib/api/errors';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiErrorBase | null>(null);

  const call = useCallback(async <T>(
    endpoint: typeof API_ENDPOINTS[keyof typeof API_ENDPOINTS],
    path: string,
    options?: any
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get(endpoint, path, options);
      return response.data as T;
    } catch (err) {
      const apiError = err instanceof ApiErrorBase ? err : new ApiErrorBase('INTERNAL_SERVER_ERROR');
      setError(apiError);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { call, loading, error };
};
```

## Advanced Configuration

### 4. Supabase Edge Functions Integration

For Supabase Edge Functions, use the middleware approach:

```typescript
// supabase/functions/example/index.ts
import { createAuthMiddleware, rateLimitMiddleware, ValidationMiddleware } from '@/lib/api';
import { VenueSchema } from '@/lib/api/validation';

const authMiddleware = createAuthMiddleware({
  required: true,
  permissions: ['VENUE_CREATE']
});

const rateLimiter = createRateLimiter('venue_creation');

Deno.serve(async (request: Request): Promise<Response> => {
  const requestId = generateRequestId();

  try {
    // 1. Rate limiting
    const rateLimitResult = await rateLimitMiddleware(rateLimiter)(request);
    if (rateLimitResult) return rateLimitResult;

    // 2. Authentication
    const { context, error } = await authMiddleware(request);
    if (error) return error;

    // 3. Validation
    const validatedData = ValidationMiddleware.validateBody(
      VenueSchema,
      await request.json()
    );

    // 4. Business logic
    const result = await processVenueCreation(validatedData, context);

    return createApiResponse(result, requestId, 201);
  } catch (error) {
    return handleApiError(error, requestId);
  }
});
```

### 5. Error Handling Setup

```typescript
// utils/errorHandler.ts
import { ApiErrorBase, buildErrorResponse } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';

export const handleApiError = (error: unknown) => {
  if (error instanceof ApiErrorBase) {
    switch (error.code) {
      case 'VENUE_NOT_FOUND':
        toast({
          title: 'Venue not found',
          description: 'The requested venue could not be found.',
          variant: 'destructive'
        });
        break;
      
      case 'INSUFFICIENT_PERMISSIONS':
        toast({
          title: 'Access denied',
          description: 'You do not have permission to perform this action.',
          variant: 'destructive'
        });
        break;
      
      case 'RATE_LIMIT_EXCEEDED':
        toast({
          title: 'Rate limit exceeded',
          description: 'Please wait before making another request.',
          variant: 'destructive'
        });
        break;
      
      default:
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive'
        });
    }
  } else {
    toast({
      title: 'Unexpected error',
      description: 'An unexpected error occurred. Please try again.',
      variant: 'destructive'
    });
  }
};
```

### 6. Validation Integration

```typescript
// components/forms/VenueForm.tsx
import { VenueSchema, ValidationMiddleware } from '@/lib/api/validation';
import { handleApiError } from '@/utils/errorHandler';

const VenueForm = () => {
  const [formData, setFormData] = useState({});
  const { call, loading, error } = useApi();

  const handleSubmit = async (data: any) => {
    try {
      // Client-side validation
      const validatedData = ValidationMiddleware.validateBody(VenueSchema, data);
      
      // API call
      const result = await call(
        API_ENDPOINTS.VENUES_CREATE,
        '/venues',
        { data: validatedData }
      );
      
      if (result) {
        toast({ title: 'Venue created successfully!' });
      }
    } catch (error) {
      handleApiError(error);
    }
  };

  return (
    // Your form JSX
  );
};
```

## Performance Configuration

### 7. Caching Setup

```typescript
// lib/api/cache.ts
export const cacheConfig = {
  venues: { ttl: 600000 }, // 10 minutes
  events: { ttl: 300000 }, // 5 minutes
  analytics: { ttl: 120000 }, // 2 minutes
  staff: { ttl: 900000 }, // 15 minutes
};

// In your API calls
const venuesResponse = await apiClient.get(
  API_ENDPOINTS.VENUES_LIST,
  '/venues',
  {
    cache: {
      key: 'venues_list',
      ttl: cacheConfig.venues.ttl
    }
  }
);
```

### 8. Rate Limiting Configuration

```typescript
// lib/api/rateLimitConfig.ts
export const rateLimitProfiles = {
  // Standard user limits
  default: {
    windowMs: 60000, // 1 minute
    maxRequests: 100,
    keyGenerator: (req: Request) => req.headers.get('x-user-id') || 'anonymous'
  },
  
  // Authentication endpoints
  auth: {
    windowMs: 900000, // 15 minutes
    maxRequests: 5,
    keyGenerator: (req: Request) => req.headers.get('x-forwarded-for') || 'unknown'
  },
  
  // Search endpoints
  search: {
    windowMs: 60000,
    maxRequests: 50,
    keyGenerator: (req: Request) => req.headers.get('x-user-id') || 'anonymous'
  },
  
  // File upload endpoints
  upload: {
    windowMs: 3600000, // 1 hour
    maxRequests: 20,
    keyGenerator: (req: Request) => req.headers.get('x-user-id') || 'anonymous'
  }
};
```

## Monitoring Setup

### 9. Error Tracking

```typescript
// lib/monitoring/errorTracking.ts
import { ApiErrorBase } from '@/lib/api';

export const trackError = (error: Error, context: Record<string, unknown> = {}) => {
  // Log to console in development
  if (import.meta.env.DEV) {
    console.error('API Error:', error, context);
  }

  // Send to monitoring service in production
  if (import.meta.env.PROD && import.meta.env.VITE_ERROR_REPORTING_URL) {
    fetch(import.meta.env.VITE_ERROR_REPORTING_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
          code: error instanceof ApiErrorBase ? error.code : undefined
        },
        context,
        user_agent: navigator.userAgent,
        url: window.location.href
      })
    }).catch(console.error);
  }
};
```

### 10. Performance Monitoring

```typescript
// lib/monitoring/performance.ts
export const trackApiPerformance = (
  endpoint: string,
  duration: number,
  success: boolean
) => {
  const metric = {
    timestamp: Date.now(),
    endpoint,
    duration,
    success,
    user_id: getCurrentUserId()
  };

  // Store metrics locally for analytics
  const metrics = JSON.parse(localStorage.getItem('api_metrics') || '[]');
  metrics.push(metric);
  
  // Keep only last 100 metrics
  if (metrics.length > 100) {
    metrics.splice(0, metrics.length - 100);
  }
  
  localStorage.setItem('api_metrics', JSON.stringify(metrics));
};
```

## Testing Configuration

### 11. Test Setup

```typescript
// tests/api.test.ts
import { ApiClient, API_ENDPOINTS } from '@/lib/api';
import { mockApiClient, mockRequest } from '@/lib/api/examples';

describe('API Standards', () => {
  let client: ApiClient;

  beforeEach(() => {
    client = new ApiClient({
      baseUrl: 'http://localhost:3000',
      apiVersion: 'v1'
    });
  });

  it('should handle venue creation', async () => {
    const venueData = {
      name: 'Test Venue',
      capacity: 500,
      address: '123 Test St'
    };

    const response = await client.post(
      API_ENDPOINTS.VENUES_CREATE,
      '/venues',
      venueData
    );

    expect(response.data).toBeDefined();
    expect(response.meta.status).toBe('success');
  });
});
```

## Next Steps

1. **Apply to Existing Endpoints**: Start with venue management endpoints
2. **Add Monitoring**: Implement error tracking and performance monitoring  
3. **Setup Testing**: Add comprehensive API tests
4. **Documentation**: Update API documentation with examples
5. **Training**: Train team on new standards and patterns

## Troubleshooting

### Common Issues

1. **Authentication Errors**: Check JWT token format and expiration
2. **Rate Limiting**: Verify rate limit configuration and key generation
3. **Validation Errors**: Ensure schema matches API expectations
4. **CORS Issues**: Configure proper CORS headers in Edge Functions
5. **Caching Problems**: Clear cache and verify TTL settings

For more help, see the [API Standards README](./README.md) and [examples](./examples.ts). 