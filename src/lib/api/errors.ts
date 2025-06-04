/**
 * RFC 7807 Problem Details for HTTP APIs
 * Standardized error response format for Train Station Dashboard
 */

export interface ApiError {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  timestamp: string;
  request_id: string;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  code: string;
  message: string;
  value?: unknown;
}

export enum ErrorCategory {
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NOT_FOUND = 'not_found',
  CONFLICT = 'conflict',
  RATE_LIMIT = 'rate_limit',
  SERVER_ERROR = 'server_error',
  EXTERNAL_SERVICE = 'external_service'
}

export interface ErrorDefinition {
  code: string;
  title: string;
  status: number;
  category: ErrorCategory;
  message_template: string;
  documentation_url?: string;
}

export const errorDefinitions: Record<string, ErrorDefinition> = {
  VENUE_NOT_FOUND: {
    code: 'VENUE_NOT_FOUND',
    title: 'Venue Not Found',
    status: 404,
    category: ErrorCategory.NOT_FOUND,
    message_template: 'Venue not found',
    documentation_url: 'https://docs.trainstation-dashboard.com/errors/venue-not-found'
  },
  EVENT_NOT_FOUND: {
    code: 'EVENT_NOT_FOUND',
    title: 'Event Not Found',
    status: 404,
    category: ErrorCategory.NOT_FOUND,
    message_template: 'Event not found',
  },
  ARTIST_NOT_FOUND: {
    code: 'ARTIST_NOT_FOUND',
    title: 'Artist Not Found',
    status: 404,
    category: ErrorCategory.NOT_FOUND,
    message_template: 'Artist not found',
  },
  CUSTOMER_NOT_FOUND: {
    code: 'CUSTOMER_NOT_FOUND',
    title: 'Customer Not Found',
    status: 404,
    category: ErrorCategory.NOT_FOUND,
    message_template: 'Customer not found',
  },
  INVALID_INPUT: {
    code: 'INVALID_INPUT',
    title: 'Invalid Input',
    status: 422,
    category: ErrorCategory.VALIDATION,
    message_template: 'The request contains invalid data',
  },
  AUTHENTICATION_REQUIRED: {
    code: 'AUTHENTICATION_REQUIRED',
    title: 'Authentication Required',
    status: 401,
    category: ErrorCategory.AUTHENTICATION,
    message_template: 'Authentication is required to access this resource',
  },
  INSUFFICIENT_PERMISSIONS: {
    code: 'INSUFFICIENT_PERMISSIONS',
    title: 'Insufficient Permissions',
    status: 403,
    category: ErrorCategory.AUTHORIZATION,
    message_template: 'User lacks required permissions',
  },
  RATE_LIMIT_EXCEEDED: {
    code: 'RATE_LIMIT_EXCEEDED',
    title: 'Rate Limit Exceeded',
    status: 429,
    category: ErrorCategory.RATE_LIMIT,
    message_template: 'Rate limit exceeded',
  },
  INTERNAL_SERVER_ERROR: {
    code: 'INTERNAL_SERVER_ERROR',
    title: 'Internal Server Error',
    status: 500,
    category: ErrorCategory.SERVER_ERROR,
    message_template: 'An unexpected error occurred',
  },
  EXTERNAL_SERVICE_ERROR: {
    code: 'EXTERNAL_SERVICE_ERROR',
    title: 'External Service Error',
    status: 502,
    category: ErrorCategory.EXTERNAL_SERVICE,
    message_template: 'External service is unavailable',
  },
};

export class ApiErrorBase extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly category: ErrorCategory;

  constructor(code: string, message?: string) {
    const definition = errorDefinitions[code];
    if (!definition) {
      throw new Error(`Unknown error code: ${code}`);
    }

    super(message || definition.message_template);
    this.name = this.constructor.name;
    this.code = code;
    this.status = definition.status;
    this.category = definition.category;
  }
}

export class ValidationErrorClass extends ApiErrorBase {
  public readonly validationErrors: ValidationError[];

  constructor(errors: ValidationError[]) {
    super('INVALID_INPUT', 'The request contains invalid data');
    this.validationErrors = errors;
  }
}

export class NotFoundError extends ApiErrorBase {
  constructor(resource: string) {
    const errorCode = `${resource.toUpperCase()}_NOT_FOUND`;
    super(errorCode);
  }
}

export class AuthenticationError extends ApiErrorBase {
  constructor() {
    super('AUTHENTICATION_REQUIRED');
  }
}

export class AuthorizationError extends ApiErrorBase {
  constructor() {
    super('INSUFFICIENT_PERMISSIONS');
  }
}

export class DatabaseError extends ApiErrorBase {
  constructor(message?: string) {
    super('INTERNAL_SERVER_ERROR', message || 'Database operation failed');
  }
}

export const buildErrorResponse = (
  error: Error | ApiErrorBase,
  requestId: string,
  instancePath?: string
): ApiError => {
  if (error instanceof ApiErrorBase) {
    const definition = errorDefinitions[error.code];
    
    const response: ApiError = {
      type: definition.documentation_url || `https://docs.trainstation-dashboard.com/errors/${error.code.toLowerCase()}`,
      title: definition.title,
      status: error.status,
      detail: error.message,
      instance: instancePath || `/api/v1/request/${requestId}`,
      timestamp: new Date().toISOString(),
      request_id: requestId,
    };

    if (error instanceof ValidationErrorClass) {
      response.errors = error.validationErrors;
    }

    return response;
  }

  return {
    type: 'https://docs.trainstation-dashboard.com/errors/internal-server-error',
    title: 'Internal Server Error',
    status: 500,
    detail: 'An unexpected error occurred',
    instance: instancePath || `/api/v1/request/${requestId}`,
    timestamp: new Date().toISOString(),
    request_id: requestId,
  };
};

export const handleApiError = (
  error: Error,
  requestId: string,
  instancePath?: string
): Response => {
  console.error(`API Error [${requestId}]:`, error);
  
  const errorResponse = buildErrorResponse(error, requestId, instancePath);
  
  return new Response(JSON.stringify(errorResponse), {
    status: errorResponse.status,
    headers: {
      'Content-Type': 'application/json',
      'X-Request-ID': requestId,
    },
  });
};

export const createValidationError = (
  field: string,
  code: string,
  message: string,
  value?: unknown
): ValidationError => ({
  field,
  code,
  message,
  value,
});

export const logError = (error: Error, context: Record<string, unknown> = {}) => {
  console.error('API Error:', {
    timestamp: new Date().toISOString(),
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    context,
  });
}; 