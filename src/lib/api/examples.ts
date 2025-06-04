/**
 * API Standards Usage Examples
 * Comprehensive examples demonstrating how to use Train Station Dashboard API standards
 */

import {
  ApiClient,
  API_ENDPOINTS,
  ValidationMiddleware,
  VenueSchema,
  EventSchema,
  createAuthMiddleware,
  rateLimitMiddleware,
  createRateLimiter,
  Permission,
  UserRole,
  buildErrorResponse,
  ApiErrorBase,
  generateRequestId,
  createApiResponse
} from './index';

// Example 1: Creating and configuring an API client
export const createConfiguredApiClient = () => {
  const client = new ApiClient({
    baseUrl: 'https://api.trainstation-dashboard.com',
    apiVersion: 'v1',
    timeout: 30000,
    retries: 3,
    auth: {
      type: 'bearer',
      token: 'your-jwt-token-here'
    },
    defaultHeaders: {
      'X-Client-Name': 'Train Station Dashboard',
      'X-Client-Version': '1.0.0'
    }
  });

  return client;
};

// Example 2: Making authenticated API calls
export const exampleApiCalls = async () => {
  const client = createConfiguredApiClient();

  try {
    // Get all venues with pagination
    const venuesResponse = await client.get(
      API_ENDPOINTS.VENUES_LIST,
      '/venues',
      {
        params: {
          page: '1',
          per_page: '20',
          sort: 'name',
          order: 'asc'
        }
      }
    );

    console.log('Venues:', venuesResponse.data);

    // Create a new venue
    const newVenue = {
      name: 'The Apollo Theater',
      capacity: 3000,
      address: '253 W 125th St, New York, NY 10027',
      email: 'info@apollotheater.org',
      phone: '+1-212-531-5300'
    };

    const createResponse = await client.post(
      API_ENDPOINTS.VENUES_CREATE,
      '/venues',
      newVenue
    );

    console.log('Created venue:', createResponse.data);

    // Update venue - properly access the ID from the created venue
    const createdVenue = createResponse.data as { id: string };
    const updateResponse = await client.put(
      API_ENDPOINTS.VENUES_UPDATE,
      ApiClient.interpolatePath('/venues/:id', { id: createdVenue.id }),
      { capacity: 3500 }
    );

    console.log('Updated venue:', updateResponse.data);

  } catch (error) {
    if (error instanceof ApiErrorBase) {
      console.error('API Error:', error.code, error.message);
    } else {
      console.error('Unexpected error:', error);
    }
  }
};

// Example 3: Edge Function with full middleware stack
export const createVenueEdgeFunction = () => {
  // Create rate limiter with valid configuration
  const rateLimiter = createRateLimiter('default');
  
  // Create authentication middleware
  const authMiddleware = createAuthMiddleware({
    required: true,
    permissions: [Permission.VENUE_CREATE],
    roles: [UserRole.ADMIN, UserRole.MANAGER]
  });

  return async (request: Request): Promise<Response> => {
    const requestId = generateRequestId();

    try {
      // Apply rate limiting
      const rateLimitResult = await rateLimitMiddleware(rateLimiter)(request);
      if (rateLimitResult) {
        return rateLimitResult; // Rate limit exceeded
      }

      // Apply authentication
      const { context, error } = await authMiddleware(request);
      if (error) {
        return error; // Authentication failed
      }

      // Validate request body
      const validatedData = ValidationMiddleware.validateBody(
        VenueSchema,
        await request.json()
      );

      // Process business logic (simplified)
      const venue = {
        id: crypto.randomUUID(),
        ...validatedData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Return standardized response
      return createApiResponse(venue, requestId, 201, {
        message: 'Venue created successfully'
      });

    } catch (error) {
      if (error instanceof ApiErrorBase) {
        return new Response(
          JSON.stringify(buildErrorResponse(error, requestId)),
          {
            status: error.status,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      // Handle unexpected errors
      return new Response(
        JSON.stringify(buildErrorResponse(new Error('Internal server error'), requestId)),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  };
};

// Example 4: Validation examples
export const validationExamples = () => {
  // Validate venue data
  try {
    const venueData = {
      name: 'Test Venue',
      capacity: 500,
      address: '123 Main St',
      email: 'venue@example.com',
      phone: '+1-555-0123'
    };

    const validatedVenue = ValidationMiddleware.validateBody(VenueSchema, venueData);
    console.log('Valid venue:', validatedVenue);
  } catch (error) {
    console.error('Venue validation failed:', error);
  }

  // Validate event data with relationships
  try {
    const eventData = {
      title: 'Rock Concert',
      venue_id: crypto.randomUUID(),
      start_date: '2024-06-15T20:00:00Z',
      capacity: 1000,
      ticket_price: 50.00
    };

    const validatedEvent = ValidationMiddleware.validateBody(EventSchema, eventData);
    console.log('Valid event:', validatedEvent);
  } catch (error) {
    console.error('Event validation failed:', error);
  }
};

// Example 5: Error handling patterns
export const errorHandlingExamples = () => {
  // Custom error handling
  const handleApiError = (error: unknown) => {
    if (error instanceof ApiErrorBase) {
      switch (error.code) {
        case 'VENUE_NOT_FOUND':
          console.log('Venue not found - redirect to venues list');
          break;
        case 'INSUFFICIENT_PERMISSIONS':
          console.log('Access denied - show permission error');
          break;
        case 'RATE_LIMIT_EXCEEDED':
          console.log('Rate limited - show retry message');
          break;
        default:
          console.log('API error:', error.message);
      }
    } else {
      console.error('Unexpected error:', error);
    }
  };

  // Example usage
  try {
    throw new ApiErrorBase('VENUE_NOT_FOUND');
  } catch (error) {
    handleApiError(error);
  }
};

// Example 6: React Hook integration
export const useApiWithStandards = () => {
  const client = createConfiguredApiClient();

  const fetchVenues = async (params?: Record<string, string>) => {
    try {
      const response = await client.get(
        API_ENDPOINTS.VENUES_LIST,
        '/venues',
        { params }
      );
      return {
        data: response.data,
        meta: response.meta,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        meta: null,
        error: error instanceof ApiErrorBase ? error : new Error('Unknown error')
      };
    }
  };

  const createVenue = async (venueData: unknown) => {
    try {
      // Validate on client side
      const validatedData = ValidationMiddleware.validateBody(VenueSchema, venueData);
      
      const response = await client.post(
        API_ENDPOINTS.VENUES_CREATE,
        '/venues',
        validatedData
      );
      
      return {
        data: response.data,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof ApiErrorBase ? error : new Error('Unknown error')
      };
    }
  };

  return {
    fetchVenues,
    createVenue
  };
};

// Example 7: Middleware composition
export const createComposedMiddleware = () => {
  const rateLimiter = createRateLimiter('default');
  const authMiddleware = createAuthMiddleware({
    required: true,
    permissions: [Permission.EVENT_CREATE]
  });

  return async (request: Request) => {
    const requestId = generateRequestId();

    // 1. Rate limiting
    const rateLimitResult = await rateLimitMiddleware(rateLimiter)(request);
    if (rateLimitResult) return rateLimitResult;

    // 2. Authentication
    const { context, error: authError } = await authMiddleware(request);
    if (authError) return authError;

    // 3. Request validation
    try {
      const validatedData = ValidationMiddleware.validateBody(
        EventSchema,
        await request.json()
      );

      // 4. Business logic would go here
      const result = { success: true, data: validatedData };

      return createApiResponse(result, requestId);
    } catch (error) {
      return new Response(
        JSON.stringify(buildErrorResponse(error as Error, requestId)),
        {
          status: error instanceof ApiErrorBase ? error.status : 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  };
};

// Example 8: Testing utilities
export const createTestHelpers = () => {
  const mockRequest = (method: string, url: string, body?: any): Request => {
    return new Request(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      body: body ? JSON.stringify(body) : undefined
    });
  };

  const mockApiClient = () => {
    return {
      get: async <T>(): Promise<any> => ({ 
        data: { id: '1', name: 'Test' } as T, 
        meta: { request_id: 'test', timestamp: new Date().toISOString(), version: 'v1', status: 'success' as const } 
      }),
      post: async <T>(): Promise<any> => ({ 
        data: { id: '2', name: 'Created' } as T, 
        meta: { request_id: 'test', timestamp: new Date().toISOString(), version: 'v1', status: 'success' as const } 
      }),
      put: async <T>(): Promise<any> => ({ 
        data: { id: '1', name: 'Updated' } as T, 
        meta: { request_id: 'test', timestamp: new Date().toISOString(), version: 'v1', status: 'success' as const } 
      }),
      delete: async <T>(): Promise<any> => ({ 
        data: null as T, 
        meta: { request_id: 'test', timestamp: new Date().toISOString(), version: 'v1', status: 'success' as const } 
      })
    };
  };

  return {
    mockRequest,
    mockApiClient
  };
};

// Example 9: Performance monitoring integration
export const createPerformanceMonitor = () => {
  const metrics = new Map<string, number[]>();

  const recordMetric = (operation: string, duration: number) => {
    if (!metrics.has(operation)) {
      metrics.set(operation, []);
    }
    metrics.get(operation)!.push(duration);
  };

  const instrumentedApiClient = (client: ApiClient) => {
    const originalGet = client.get.bind(client);
    const originalPost = client.post.bind(client);

    // Override the get method with proper typing
    client.get = async function<T>(endpoint: any, path: string, options?: any) {
      const start = performance.now();
      const result = await originalGet(endpoint, path, options);
      recordMetric('api.get', performance.now() - start);
      return result;
    };

    // Override the post method with proper typing
    client.post = async function<T>(endpoint: any, path: string, data?: any, options?: any) {
      const start = performance.now();
      const result = await originalPost(endpoint, path, data, options);
      recordMetric('api.post', performance.now() - start);
      return result;
    };

    return client;
  };

  const getMetrics = () => {
    const summary: Record<string, any> = {};
    for (const [operation, durations] of metrics) {
      const sorted = durations.slice().sort((a, b) => a - b);
      summary[operation] = {
        count: durations.length,
        average: durations.reduce((a, b) => a + b, 0) / durations.length,
        median: sorted[Math.floor(sorted.length / 2)],
        p95: sorted[Math.floor(sorted.length * 0.95)],
        min: sorted[0],
        max: sorted[sorted.length - 1]
      };
    }
    return summary;
  };

  return {
    instrumentedApiClient,
    getMetrics,
    recordMetric
  };
}; 