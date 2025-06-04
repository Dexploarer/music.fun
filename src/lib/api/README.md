# Train Station Dashboard - API Standards

A comprehensive, production-ready API standards implementation following RFC 7807 error handling, with robust validation, authentication, rate limiting, and standardized response formats.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Quick Start](#quick-start)
- [Core Components](#core-components)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)
- [Error Handling](#error-handling)
- [Authentication](#authentication)
- [Rate Limiting](#rate-limiting)
- [Validation](#validation)
- [Testing](#testing)
- [Configuration](#configuration)

## 🎯 Overview

This API standards library provides a unified, enterprise-grade foundation for all Train Station Dashboard API interactions. It ensures consistency, security, and reliability across all endpoints while following industry best practices.

### Key Benefits

- **RFC 7807 Compliant**: Standardized error responses with detailed problem information
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Security First**: Built-in authentication, authorization, and rate limiting
- **Production Ready**: Comprehensive error handling, logging, and monitoring
- **Developer Friendly**: Extensive documentation, examples, and testing utilities

## ✨ Features

### Error Handling
- RFC 7807 Problem Details for HTTP APIs
- Comprehensive error categorization and definitions
- Structured error responses with context and debug information
- Built-in error logging and monitoring

### Response Standardization
- Consistent API response format across all endpoints
- Pagination support with metadata
- Cache control headers
- Request tracing and correlation IDs

### Authentication & Authorization
- JWT token validation and management
- API key authentication
- Role-based access control (RBAC)
- Permission-based authorization
- Session management

### Rate Limiting
- Flexible rate limiting strategies (sliding window, token bucket)
- Per-user, per-endpoint, and global rate limiting
- Rate limit bypass for trusted sources
- Configurable limits based on user roles

### Input Validation
- Zod-based schema validation
- Request body, query parameters, and URL parameter validation
- Sanitization and normalization
- Custom validation rules

### API Client
- Full-featured HTTP client with retry logic
- Request/response interceptors
- Automatic error handling
- Performance monitoring and metrics

## 🚀 Quick Start

### Installation

The API standards are already included in the Train Station Dashboard project. Import components as needed:

```typescript
import {
  ApiClient,
  createStandardApiClient,
  VenueSchema,
  ValidationMiddleware,
  ApiErrorBase,
  Permission,
  UserRole
} from '@/lib/api';
```

### Basic Usage

```typescript
// Create an API client
const client = createStandardApiClient();

// Set authentication
client.setAuthToken('your-jwt-token');

// Make API calls
try {
  const response = await client.get(API_ENDPOINTS.VENUES_LIST, '/venues');
  console.log('Venues:', response.data);
} catch (error) {
  if (error instanceof ApiErrorBase) {
    console.error('API Error:', error.code, error.message);
  }
}
```

## 🏗️ Core Components

### 1. Error Handling (`errors.ts`)

Comprehensive error management following RFC 7807 standards:

```typescript
import { ApiErrorBase, NotFoundError, ValidationError } from '@/lib/api';

// Throw standardized errors
throw new NotFoundError('venue');
throw new ApiErrorBase('RATE_LIMIT_EXCEEDED');

// Handle errors consistently
try {
  // API call
} catch (error) {
  if (error instanceof ApiErrorBase) {
    // Handle known API errors
    console.log(error.code, error.status, error.message);
  }
}
```

### 2. Response Types (`types.ts`)

Standardized response formats for consistency:

```typescript
import { ApiResponse, buildSuccessResponse, buildListResponse } from '@/lib/api';

// Standard response structure
const response: ApiResponse<Venue> = {
  data: venue,
  meta: {
    timestamp: '2024-01-01T00:00:00Z',
    request_id: 'req_123',
    version: 'v1',
    status: 'success'
  }
};

// Build responses
const listResponse = buildListResponse(venues, totalCount, page, perPage);
```

### 3. Validation (`validation.ts`)

Zod-based input validation with predefined schemas:

```typescript
import { VenueSchema, ValidationMiddleware } from '@/lib/api';

// Validate request data
const validatedVenue = ValidationMiddleware.validateBody(VenueSchema, requestData);

// Use in middleware
app.post('/venues', async (req, res) => {
  const { body } = await ValidationMiddleware.validateBody(VenueSchema, req.body);
  // Process validated data
});
```

### 4. Authentication (`auth.ts`)

JWT and API key authentication with RBAC:

```typescript
import { createAuthMiddleware, Permission, UserRole } from '@/lib/api';

// Create auth middleware
const authMiddleware = createAuthMiddleware({
  required: true,
  permissions: [Permission.VENUE_CREATE],
  roles: [UserRole.ADMIN, UserRole.MANAGER]
});

// Use in endpoints
app.post('/venues', authMiddleware, handler);
```

### 5. Rate Limiting (`rateLimit.ts`)

Flexible rate limiting with multiple strategies:

```typescript
import { createRateLimiter, rateLimitMiddleware } from '@/lib/api';

// Create rate limiter
const limiter = createRateLimiter('api');

// Apply rate limiting
app.use(rateLimitMiddleware(limiter));
```

### 6. API Client (`client.ts`)

Full-featured HTTP client with built-in standards:

```typescript
import { ApiClient, API_ENDPOINTS } from '@/lib/api';

const client = new ApiClient({
  baseUrl: 'https://api.example.com',
  auth: { type: 'bearer', token: 'jwt-token' },
  timeout: 30000,
  retries: 3
});

// Make requests
const response = await client.post(
  API_ENDPOINTS.VENUES_CREATE,
  '/venues',
  venueData
);
```

## 📚 Usage Examples

### Creating a Complete Endpoint

```typescript
import {
  ValidationMiddleware,
  createAuthMiddleware,
  rateLimitMiddleware,
  createRateLimiter,
  VenueSchema,
  createApiResponse,
  Permission,
  UserRole
} from '@/lib/api';

// Supabase Edge Function
export default async function handler(req: Request): Promise<Response> {
  const requestId = generateRequestId();

  try {
    // 1. Rate limiting
    const rateLimiter = createRateLimiter('default');
    const rateLimitResult = await rateLimitMiddleware(rateLimiter)(req);
    if (rateLimitResult) return rateLimitResult;

    // 2. Authentication
    const authMiddleware = createAuthMiddleware({
      required: true,
      permissions: [Permission.VENUE_CREATE]
    });
    const { context, error } = await authMiddleware(req);
    if (error) return error;

    // 3. Validation
    const validatedData = ValidationMiddleware.validateBody(
      VenueSchema,
      await req.json()
    );

    // 4. Business logic
    const venue = await createVenue(validatedData, context.user);

    // 5. Response
    return createApiResponse(venue, requestId, 201);

  } catch (error) {
    return handleApiError(error, requestId);
  }
}
```

### React Hook Integration

```typescript
import { useApiWithStandards } from '@/lib/api/examples';

function VenueManager() {
  const { fetchVenues, createVenue } = useApiWithStandards();

  const handleCreateVenue = async (venueData: any) => {
    const result = await createVenue(venueData);
    if (result.error) {
      // Handle error with standardized error object
      console.error(result.error.code, result.error.message);
    } else {
      // Handle success
      console.log('Created venue:', result.data);
    }
  };

  // Component JSX...
}
```

## 🔒 Error Handling

### Error Categories

The system defines comprehensive error categories:

- **Venue Errors**: `VENUE_NOT_FOUND`, `VENUE_CAPACITY_EXCEEDED`, etc.
- **Event Errors**: `EVENT_NOT_FOUND`, `EVENT_CAPACITY_FULL`, etc.
- **Validation Errors**: `INVALID_INPUT`, `MISSING_REQUIRED_FIELD`, etc.
- **Authentication Errors**: `TOKEN_EXPIRED`, `INVALID_CREDENTIALS`, etc.
- **Authorization Errors**: `INSUFFICIENT_PERMISSIONS`, etc.
- **System Errors**: `INTERNAL_SERVER_ERROR`, `SERVICE_UNAVAILABLE`, etc.

### Error Response Format

All errors follow RFC 7807 Problem Details:

```json
{
  "type": "https://trainstation.example.com/problems/venue-not-found",
  "title": "Venue Not Found",
  "status": 404,
  "detail": "The venue with ID 'venue-123' could not be found",
  "instance": "/venues/venue-123",
  "code": "VENUE_NOT_FOUND",
  "request_id": "req_abc123",
  "timestamp": "2024-01-01T12:00:00Z",
  "context": {
    "venue_id": "venue-123",
    "user_id": "user-456"
  }
}
```

## 🔐 Authentication

### JWT Authentication

```typescript
// Configure JWT authentication
const authConfig = {
  required: true,
  permissions: [Permission.VENUE_READ],
  roles: [UserRole.STAFF, UserRole.MANAGER, UserRole.ADMIN]
};

const middleware = createAuthMiddleware(authConfig);
```

### API Key Authentication

```typescript
// Use API key authentication
const client = new ApiClient({
  baseUrl: 'https://api.example.com',
  auth: {
    type: 'api-key',
    apiKey: 'your-api-key'
  }
});
```

### Permission System

The system includes comprehensive permissions:

- **Venue**: `VENUE_READ`, `VENUE_CREATE`, `VENUE_UPDATE`, `VENUE_DELETE`
- **Event**: `EVENT_READ`, `EVENT_CREATE`, `EVENT_UPDATE`, `EVENT_DELETE`
- **Customer**: `CUSTOMER_READ`, `CUSTOMER_CREATE`, `CUSTOMER_UPDATE`
- **System**: `SYSTEM_ADMIN`, `ANALYTICS_VIEW`, `REPORTS_GENERATE`

## ⚡ Rate Limiting

### Configuration Options

```typescript
// Different rate limit configurations
const configs = {
  default: { windowMs: 900000, maxRequests: 100 },    // 100 req/15min
  auth: { windowMs: 900000, maxRequests: 5 },         // 5 req/15min
  search: { windowMs: 60000, maxRequests: 30 },       // 30 req/min
  upload: { windowMs: 3600000, maxRequests: 10 },     // 10 req/hour
  apiKey: { windowMs: 60000, maxRequests: 1000 },     // 1000 req/min
  public: { windowMs: 60000, maxRequests: 20 },       // 20 req/min
  critical: { windowMs: 60000, maxRequests: 5 }       // 5 req/min
};
```

### Rate Limit Bypass

```typescript
// Configure bypass for trusted sources
const bypass: RateLimitBypass = {
  apiKeys: ['trusted-service-key'],
  ipAddresses: ['192.168.1.100'],
  userRoles: ['SUPER_ADMIN']
};
```

## ✅ Validation

### Built-in Schemas

The system includes comprehensive validation schemas:

- **Common**: UUID, Email, Phone, Date, URL
- **Entities**: Venue, Event, Artist, Customer, Ticket
- **Search**: Search queries, filters, pagination
- **Files**: Upload validation

### Custom Validation

```typescript
import { z } from 'zod';

// Custom schema
const CustomSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  age: z.number().min(18).max(120)
});

// Use with middleware
const validated = ValidationMiddleware.validateBody(CustomSchema, data);
```

## 🧪 Testing

### Test Utilities

```typescript
import { createTestHelpers } from '@/lib/api/examples';

const { mockRequest, mockApiClient } = createTestHelpers();

// Mock requests
const request = mockRequest('POST', '/venues', { name: 'Test Venue' });

// Mock API client
const client = mockApiClient();
const response = await client.get('/venues');
```

### Testing Examples

```typescript
describe('API Standards', () => {
  it('should validate venue data', () => {
    const validVenue = {
      name: 'Test Venue',
      capacity: 500,
      address: '123 Main St'
    };

    expect(() => 
      ValidationMiddleware.validateBody(VenueSchema, validVenue)
    ).not.toThrow();
  });

  it('should handle authentication errors', async () => {
    const client = createStandardApiClient();
    
    try {
      await client.get(API_ENDPOINTS.VENUES_LIST, '/venues');
    } catch (error) {
      expect(error).toBeInstanceOf(AuthenticationError);
    }
  });
});
```

## ⚙️ Configuration

### Environment Variables

```bash
# API Configuration
VITE_API_BASE_URL=https://api.trainstation-dashboard.com
VITE_API_VERSION=v1
VITE_API_TIMEOUT=30000

# Authentication
VITE_JWT_SECRET=your-jwt-secret
VITE_JWT_EXPIRY=24h

# Rate Limiting
VITE_RATE_LIMIT_ENABLED=true
VITE_RATE_LIMIT_REDIS_URL=redis://localhost:6379
```

### Client Configuration

```typescript
const client = new ApiClient({
  baseUrl: process.env.VITE_API_BASE_URL,
  apiVersion: process.env.VITE_API_VERSION,
  timeout: parseInt(process.env.VITE_API_TIMEOUT || '30000'),
  retries: 3,
  retryDelay: 1000,
  defaultHeaders: {
    'X-Client-Version': '1.0.0',
    'X-Request-Source': 'web-app'
  }
});
```

## 📝 Best Practices

### 1. Error Handling
- Always use structured error responses
- Include request context in errors
- Log errors with appropriate severity levels
- Provide helpful error messages for debugging

### 2. Validation
- Validate all inputs at the API boundary
- Use schema validation for type safety
- Sanitize data to prevent injection attacks
- Provide clear validation error messages

### 3. Authentication
- Use short-lived JWT tokens with refresh capability
- Implement role-based access control
- Log authentication events for security monitoring
- Use secure session management

### 4. Rate Limiting
- Apply different limits based on endpoint sensitivity
- Allow bypass for trusted services
- Monitor rate limit metrics for abuse detection
- Provide clear rate limit information in responses

### 5. Performance
- Use request/response caching where appropriate
- Implement connection pooling for database access
- Monitor API performance metrics
- Use compression for large responses

## 🔧 Troubleshooting

### Common Issues

1. **Authentication Failures**
   - Check JWT token expiration
   - Verify token format and signature
   - Ensure user has required permissions

2. **Validation Errors**
   - Check request data against schema
   - Verify required fields are present
   - Ensure data types match schema

3. **Rate Limit Exceeded**
   - Check request frequency
   - Verify rate limit configuration
   - Consider using API key for higher limits

4. **Connection Issues**
   - Verify API base URL configuration
   - Check network connectivity
   - Review timeout settings

## 📊 Monitoring and Metrics

The API standards include built-in monitoring capabilities:

- Request/response timing
- Error rate tracking
- Rate limit hit rates
- Authentication success/failure rates
- Endpoint usage statistics

Access metrics through the performance monitor:

```typescript
import { createPerformanceMonitor } from '@/lib/api/examples';

const monitor = createPerformanceMonitor();
const instrumentedClient = monitor.instrumentedApiClient(client);

// View metrics
console.log(monitor.getMetrics());
```

## 🤝 Contributing

When extending the API standards:

1. Follow existing patterns and conventions
2. Add comprehensive tests for new features
3. Update documentation for any changes
4. Ensure TypeScript type safety
5. Follow security best practices

## 📚 Additional Resources

- [RFC 7807 - Problem Details for HTTP APIs](https://tools.ietf.org/html/rfc7807)
- [Zod Documentation](https://github.com/colinhacks/zod)
- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)
- [HTTP Status Codes](https://httpstatuses.com/)

---

**Train Station Dashboard API Standards v1.0.0**  
Built with ❤️ for production-grade API development 