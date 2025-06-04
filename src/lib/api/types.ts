/**
 * Standardized API Response Types
 * Following Train Station Dashboard API Standards
 */

export interface ApiResponse<T = unknown> {
  data: T;
  meta: ResponseMeta;
  links?: ResponseLinks;
}

export interface ResponseMeta {
  request_id: string;
  timestamp: string;
  version: string;
  status: 'success' | 'error';
  message?: string;
  pagination?: PaginationMeta;
  cache?: CacheMeta;
}

export interface PaginationMeta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface CacheMeta {
  cache_hit: boolean;
  cache_ttl?: number;
  cache_key?: string;
}

export interface ResponseLinks {
  self: string;
  first?: string;
  last?: string;
  prev?: string;
  next?: string;
  related?: Record<string, string>;
}

export interface ListResponse<T> {
  items: T[];
  meta: ResponseMeta;
  links: ResponseLinks;
}

// Standard HTTP method types
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// Request context
export interface RequestContext {
  request_id: string;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
  method: HttpMethod;
  path: string;
  query_params?: Record<string, string>;
}

// Rate limiting information
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  retry_after?: number;
}

// API versioning
export interface ApiVersion {
  version: string;
  deprecated?: boolean;
  sunset_date?: string;
  migration_guide?: string;
}

// Health check response
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  timestamp: string;
  uptime: number;
  services: ServiceStatus[];
}

export interface ServiceStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  response_time?: number;
  last_check: string;
  details?: Record<string, unknown>;
}

// Request/Response builders
export const buildSuccessResponse = <T>(
  data: T,
  requestId: string,
  options?: {
    message?: string;
    pagination?: PaginationMeta;
    links?: ResponseLinks;
    cache?: CacheMeta;
  }
): ApiResponse<T> => {
  return {
    data,
    meta: {
      request_id: requestId,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      status: 'success',
      message: options?.message,
      pagination: options?.pagination,
      cache: options?.cache,
    },
    links: options?.links,
  };
};

export const buildListResponse = <T>(
  items: T[],
  requestId: string,
  pagination: PaginationMeta,
  links: ResponseLinks,
  options?: {
    message?: string;
    cache?: CacheMeta;
  }
): ListResponse<T> => {
  return {
    items,
    meta: {
      request_id: requestId,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      status: 'success',
      message: options?.message,
      pagination,
      cache: options?.cache,
    },
    links,
  };
};

export const buildPaginationMeta = (
  page: number,
  perPage: number,
  total: number
): PaginationMeta => {
  const totalPages = Math.ceil(total / perPage);
  
  return {
    page,
    per_page: perPage,
    total,
    total_pages: totalPages,
    has_next: page < totalPages,
    has_prev: page > 1,
  };
};

export const buildPaginationLinks = (
  baseUrl: string,
  page: number,
  totalPages: number,
  queryParams?: Record<string, string>
): ResponseLinks => {
  const buildUrl = (pageNum: number) => {
    const params = new URLSearchParams(queryParams);
    params.set('page', pageNum.toString());
    return `${baseUrl}?${params.toString()}`;
  };

  const links: ResponseLinks = {
    self: buildUrl(page),
    first: buildUrl(1),
    last: buildUrl(totalPages),
  };

  if (page > 1) {
    links.prev = buildUrl(page - 1);
  }

  if (page < totalPages) {
    links.next = buildUrl(page + 1);
  }

  return links;
};

export const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const buildRequestContext = (
  request: Request,
  requestId: string
): RequestContext => {
  const url = new URL(request.url);
  const queryParams: Record<string, string> = {};
  
  url.searchParams.forEach((value, key) => {
    queryParams[key] = value;
  });

  return {
    request_id: requestId,
    ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
    user_agent: request.headers.get('user-agent') || undefined,
    timestamp: new Date().toISOString(),
    method: request.method as HttpMethod,
    path: url.pathname,
    query_params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
  };
};

export const buildRateLimitHeaders = (rateLimitInfo: RateLimitInfo): Record<string, string> => {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': rateLimitInfo.limit.toString(),
    'X-RateLimit-Remaining': rateLimitInfo.remaining.toString(),
    'X-RateLimit-Reset': rateLimitInfo.reset.toString(),
  };

  if (rateLimitInfo.retry_after) {
    headers['Retry-After'] = rateLimitInfo.retry_after.toString();
  }

  return headers;
};

export const buildCacheHeaders = (cacheMeta?: CacheMeta): Record<string, string> => {
  if (!cacheMeta) return {};

  const headers: Record<string, string> = {
    'X-Cache': cacheMeta.cache_hit ? 'HIT' : 'MISS',
  };

  if (cacheMeta.cache_ttl) {
    headers['Cache-Control'] = `public, max-age=${cacheMeta.cache_ttl}`;
  }

  return headers;
};

// Response wrapper for consistent HTTP responses
export const createApiResponse = <T>(
  data: T,
  requestId: string,
  status: number = 200,
  options?: {
    message?: string;
    pagination?: PaginationMeta;
    links?: ResponseLinks;
    cache?: CacheMeta;
    rateLimitInfo?: RateLimitInfo;
    additionalHeaders?: Record<string, string>;
  }
): Response => {
  const response = buildSuccessResponse(data, requestId, options);
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Request-ID': requestId,
    'X-API-Version': '1.0.0',
    ...buildCacheHeaders(options?.cache),
    ...(options?.rateLimitInfo ? buildRateLimitHeaders(options.rateLimitInfo) : {}),
    ...(options?.additionalHeaders || {}),
  };

  return new Response(JSON.stringify(response), {
    status,
    headers,
  });
}; 