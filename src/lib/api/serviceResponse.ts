/**
 * Service Response Types
 * Provides consistent response structure for all services
 */

export interface ServiceResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    type: string;
    title: string;
    status: number;
    detail: string;
    instance: string;
    timestamp: string;
    errors?: Array<{
      field: string;
      code: string;
      message: string;
      value?: unknown;
    }>;
  };
  meta?: {
    requestId: string;
    timestamp: string;
    source?: string;
    duration?: number;
  };
}

export const createSuccessResponse = <T>(
  data: T,
  meta?: {
    requestId?: string;
    source?: string;
    duration?: number;
  }
): ServiceResponse<T> => ({
  success: true,
  data,
  meta: {
    requestId: meta?.requestId || crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    source: meta?.source || 'api',
    duration: meta?.duration
  }
});

export const createErrorResponse = (
  error: {
    type?: string;
    title: string;
    status: number;
    detail: string;
    instance?: string;
    errors?: Array<{
      field: string;
      code: string;
      message: string;
      value?: unknown;
    }>;
  },
  meta?: {
    requestId?: string;
    source?: string;
  }
): ServiceResponse<never> => ({
  success: false,
  error: {
    type: error.type || 'https://docs.trainstation-dashboard.com/errors/api-error',
    title: error.title,
    status: error.status,
    detail: error.detail,
    instance: error.instance || '/api/error',
    timestamp: new Date().toISOString(),
    errors: error.errors
  },
  meta: {
    requestId: meta?.requestId || crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    source: meta?.source || 'api'
  }
});

export const createValidationErrorResponse = (
  validationErrors: Array<{
    field: string;
    code: string;
    message: string;
    value?: unknown;
  }>,
  meta?: {
    requestId?: string;
    source?: string;
  }
): ServiceResponse<never> => {
  return createErrorResponse(
    {
      type: 'https://docs.trainstation-dashboard.com/errors/validation-error',
      title: 'Validation Error',
      status: 400,
      detail: 'Request data validation failed',
      instance: '/validation',
      errors: validationErrors
    },
    meta
  );
};

export const createBusinessRuleErrorResponse = (
  rule: string,
  reason: string,
  meta?: {
    requestId?: string;
    source?: string;
  }
): ServiceResponse<never> => {
  return createErrorResponse(
    {
      type: 'https://docs.trainstation-dashboard.com/errors/business-rule-violation',
      title: 'Business Rule Violation',
      status: 400,
      detail: `${rule}: ${reason}`,
      instance: '/business-rules'
    },
    meta
  );
};

export const createNotFoundErrorResponse = (
  resource: string,
  meta?: {
    requestId?: string;
    source?: string;
  }
): ServiceResponse<never> => {
  return createErrorResponse(
    {
      type: 'https://docs.trainstation-dashboard.com/errors/not-found',
      title: 'Resource Not Found',
      status: 404,
      detail: `${resource} not found`,
      instance: '/not-found'
    },
    meta
  );
};

export const createAuthErrorResponse = (
  type: 'authentication' | 'authorization',
  detail: string,
  meta?: {
    requestId?: string;
    source?: string;
  }
): ServiceResponse<never> => {
  return createErrorResponse(
    {
      type: `https://docs.trainstation-dashboard.com/errors/${type}`,
      title: type === 'authentication' ? 'Authentication Required' : 'Insufficient Permissions',
      status: type === 'authentication' ? 401 : 403,
      detail,
      instance: '/auth'
    },
    meta
  );
}; 