/**
 * Authentication Middleware
 * Enhanced authentication and authorization for Train Station Dashboard API
 */

import { AuthenticationError } from './errors';

export interface JWTPayload {
  sub: string;                   // User ID
  iss: string;                   // Issuer
  aud: string;                   // Audience
  exp: number;                   // Expiration timestamp
  iat: number;                   // Issued at timestamp
  jti: string;                   // JWT ID
  
  // Custom claims
  role: UserRole;
  permissions: Permission[];
  venue_access: string[];        // Accessible venue IDs
  session_id: string;
}

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  STAFF = 'staff',
  CUSTOMER = 'customer',
  ARTIST = 'artist',
  VENDOR = 'vendor'
}

export enum Permission {
  // Venue permissions
  VENUE_CREATE = 'venue:create',
  VENUE_READ = 'venue:read',
  VENUE_UPDATE = 'venue:update',
  VENUE_DELETE = 'venue:delete',
  
  // Event permissions
  EVENT_CREATE = 'event:create',
  EVENT_READ = 'event:read',
  EVENT_UPDATE = 'event:update',
  EVENT_DELETE = 'event:delete',
  
  // Financial permissions
  FINANCE_READ = 'finance:read',
  FINANCE_WRITE = 'finance:write',
  
  // Customer permissions
  CUSTOMER_CREATE = 'customer:create',
  CUSTOMER_READ = 'customer:read',
  CUSTOMER_UPDATE = 'customer:update',
  CUSTOMER_DELETE = 'customer:delete',
  
  // Inventory permissions
  INVENTORY_CREATE = 'inventory:create',
  INVENTORY_READ = 'inventory:read',
  INVENTORY_UPDATE = 'inventory:update',
  INVENTORY_DELETE = 'inventory:delete',
  
  // Analytics permissions
  ANALYTICS_READ = 'analytics:read',
  ANALYTICS_WRITE = 'analytics:write',
  
  // Admin permissions
  USER_MANAGE = 'user:manage',
  SYSTEM_ADMIN = 'system:admin',
  
  // Staff permissions
  STAFF_MANAGE = 'staff:manage',
  STAFF_READ = 'staff:read',
  
  // Marketing permissions
  MARKETING_READ = 'marketing:read',
  MARKETING_WRITE = 'marketing:write',
}

export interface ApiKey {
  id: string;
  name: string;
  key_hash: string;              // Hashed API key
  permissions: Permission[];
  rate_limit: {
    requests_per_minute: number;
    requests_per_hour: number;
  };
  allowed_ips?: string[];        // IP whitelist
  expires_at?: string;
  created_at: string;
  last_used_at?: string;
  is_active: boolean;
}

export interface AuthContext {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    permissions: Permission[];
    venue_access: string[];
  };
  apiKey?: ApiKey;
  session?: {
    id: string;
    expires_at: string;
  };
  ip_address: string;
  user_agent?: string;
}

// Mock implementations for JWT operations (replace with actual JWT library)
const mockJwtVerify = async (token: string): Promise<JWTPayload> => {
  // In production, use a proper JWT library like jose or jsonwebtoken
  try {
    // Simplified mock verification
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }
    
    // Mock payload for demonstration
    return {
      sub: 'user-123',
      iss: 'trainstation-dashboard',
      aud: 'trainstation-api',
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
      iat: Math.floor(Date.now() / 1000),
      jti: `jwt-${Date.now()}`,
      role: UserRole.MANAGER,
      permissions: [Permission.EVENT_READ, Permission.EVENT_CREATE],
      venue_access: ['venue-1', 'venue-2'],
      session_id: 'session-123'
    };
  } catch (error) {
    throw new AuthenticationError();
  }
};

const mockHashApiKey = async (apiKey: string): Promise<string> => {
  // In production, use a proper crypto library
  return `hash_${apiKey.substring(0, 10)}`;
};

// Authentication service class
export class AuthService {
  private static instance: AuthService;
  private apiKeys = new Map<string, ApiKey>(); // In production, use database
  private sessions = new Map<string, { user_id: string; expires_at: string }>(); // In production, use Redis

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async validateToken(token: string): Promise<JWTPayload | null> {
    try {
      const payload = await mockJwtVerify(token);
      
      // Check token expiration
      if (payload.exp < Date.now() / 1000) {
        return null;
      }
      
      // Validate session
      const sessionValid = await this.validateSession(payload.session_id);
      if (!sessionValid) {
        return null;
      }
      
      return payload;
    } catch (error) {
      return null;
    }
  }

  async validateApiKey(apiKey: string): Promise<ApiKey | null> {
    try {
      const keyHash = await mockHashApiKey(apiKey);
      const storedKey = this.apiKeys.get(keyHash);
      
      if (!storedKey || !storedKey.is_active) {
        return null;
      }
      
      // Check expiration
      if (storedKey.expires_at && new Date(storedKey.expires_at) < new Date()) {
        return null;
      }
      
      // Update last used timestamp
      storedKey.last_used_at = new Date().toISOString();
      this.apiKeys.set(keyHash, storedKey);
      
      return storedKey;
    } catch (error) {
      return null;
    }
  }

  async validateSession(sessionId: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return false;
    }
    
    return new Date(session.expires_at) > new Date();
  }

  async revokeSession(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
  }

  async createApiKey(name: string, permissions: Permission[], config?: Partial<ApiKey>): Promise<{ key: string; apiKey: ApiKey }> {
    const key = `tsd_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    const keyHash = await mockHashApiKey(key);
    
    const apiKey: ApiKey = {
      id: `api_${Date.now()}`,
      name,
      key_hash: keyHash,
      permissions,
      rate_limit: {
        requests_per_minute: 1000,
        requests_per_hour: 10000
      },
      created_at: new Date().toISOString(),
      is_active: true,
      ...config
    };
    
    this.apiKeys.set(keyHash, apiKey);
    return { key, apiKey };
  }

  async revokeApiKey(keyHash: string): Promise<void> {
    const apiKey = this.apiKeys.get(keyHash);
    if (apiKey) {
      apiKey.is_active = false;
      this.apiKeys.set(keyHash, apiKey);
    }
  }

  async validateRoles(userRole: UserRole, requiredRoles: UserRole[]): Promise<{ error: Response | null }> {
    if (!requiredRoles.includes(userRole) && userRole !== UserRole.SUPER_ADMIN) {
      return {
        error: new Response(
          JSON.stringify({
            type: 'https://docs.trainstation-dashboard.com/errors/insufficient-permissions',
            title: 'Insufficient Permissions',
            status: 403,
            detail: `User role '${userRole}' does not have access to this resource`,
            instance: '/api/auth/validate',
            timestamp: new Date().toISOString()
          }),
          { status: 403, headers: { 'Content-Type': 'application/problem+json' } }
        )
      };
    }
    return { error: null };
  }

  async validatePermissions(userPermissions: string[], requiredPermissions: string[]): Promise<{ error: Response | null }> {
    const hasPermission = requiredPermissions.every(permission =>
      userPermissions.includes(permission) || userPermissions.includes('*')
    );

    if (!hasPermission) {
      return {
        error: new Response(
          JSON.stringify({
            type: 'https://docs.trainstation-dashboard.com/errors/insufficient-permissions',
            title: 'Insufficient Permissions',
            status: 403,
            detail: 'User does not have the required permissions for this action',
            instance: '/api/auth/validate',
            timestamp: new Date().toISOString(),
            extensions: {
              required: requiredPermissions,
              provided: userPermissions
            }
          }),
          { status: 403, headers: { 'Content-Type': 'application/problem+json' } }
        )
      };
    }
    return { error: null };
  }
}

// Authentication middleware
export const createAuthMiddleware = (options: {
  required?: boolean;
  permissions?: Permission[];
  roles?: UserRole[];
  allowApiKeys?: boolean;
} = {}) => {
  const { required = true, permissions = [], roles = [], allowApiKeys = true } = options;
  
  return async (request: Request): Promise<{ context: AuthContext | null; error: Response | null }> => {
    const authService = AuthService.getInstance();
    const context: AuthContext = {
      ip_address: getClientIp(request),
      user_agent: request.headers.get('User-Agent') || undefined
    };

    // Try JWT authentication first
    const authHeader = request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = await authService.validateToken(token);
      
      if (payload) {
        context.user = {
          id: payload.sub,
          email: '', // Would be extracted from database
          role: payload.role,
          permissions: payload.permissions,
          venue_access: payload.venue_access
        };
        context.session = {
          id: payload.session_id,
          expires_at: new Date(payload.exp * 1000).toISOString()
        };
      }
    }

    // Try API key authentication if JWT failed and API keys are allowed
    if (!context.user && allowApiKeys) {
      const apiKey = request.headers.get('X-API-Key');
      if (apiKey) {
        const validApiKey = await authService.validateApiKey(apiKey);
        if (validApiKey) {
          context.apiKey = validApiKey;
          
          // Check IP restrictions
          if (validApiKey.allowed_ips?.length) {
            if (!validApiKey.allowed_ips.includes(context.ip_address)) {
              return {
                context: null,
                error: new Response(
                  JSON.stringify({
                    type: 'https://docs.trainstation-dashboard.com/errors/ip-restricted',
                    title: 'IP Address Restricted',
                    status: 403,
                    detail: 'API key is restricted to specific IP addresses',
                    instance: new URL(request.url).pathname,
                    timestamp: new Date().toISOString()
                  }),
                  { status: 403, headers: { 'Content-Type': 'application/json' } }
                )
              };
            }
          }
        }
      }
    }

    // Check if authentication is required
    if (required && !context.user && !context.apiKey) {
      return {
        context: null,
        error: new Response(
          JSON.stringify({
            type: 'https://docs.trainstation-dashboard.com/errors/authentication-required',
            title: 'Authentication Required',
            status: 401,
            detail: 'Valid authentication credentials are required',
            instance: new URL(request.url).pathname,
            timestamp: new Date().toISOString()
          }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        )
      };
    }

    // Check role requirements
    if (roles.length > 0 && context.user) {
      const { error: _roleError } = await authService.validateRoles(context.user.role, roles);
      if (_roleError) {
        return {
          context: null,
          error: _roleError
        };
      }
    }

    // Check permission requirements
    if (permissions.length > 0) {
      const userPermissions = context.user?.permissions || context.apiKey?.permissions || [];
      const { error: _validationError } = await authService.validatePermissions(userPermissions, permissions);
      
      if (_validationError) {
        return {
          context: null,
          error: _validationError
        };
      }
    }

    return { context, error: null };
  };
};

// Utility functions
const getClientIp = (request: Request): string => {
  const headers = [
    'x-forwarded-for',
    'x-real-ip',
    'x-client-ip',
    'cf-connecting-ip'
  ];

  for (const header of headers) {
    const value = request.headers.get(header);
    if (value) {
      return value.split(',')[0].trim();
    }
  }

  return 'unknown';
};

// Permission checking utilities
export const hasPermission = (context: AuthContext, permission: Permission): boolean => {
  const permissions = context.user?.permissions || context.apiKey?.permissions || [];
  return permissions.includes(permission) || context.user?.role === UserRole.SUPER_ADMIN;
};

export const hasAnyPermission = (context: AuthContext, perms: Permission[]): boolean => {
  return perms.some(perm => hasPermission(context, perm));
};

export const hasAllPermissions = (context: AuthContext, perms: Permission[]): boolean => {
  return perms.every(perm => hasPermission(context, perm));
};

export const hasRole = (context: AuthContext, role: UserRole): boolean => {
  return context.user?.role === role;
};

export const hasAnyRole = (context: AuthContext, roles: UserRole[]): boolean => {
  return context.user ? roles.includes(context.user.role) : false;
};

// Security headers
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
};

// CORS configuration
export const corsConfig = {
  origin: [
    'https://trainstation-dashboard.com',
    'https://staging.trainstation-dashboard.com',
    ...(process.env.NODE_ENV === 'development' ? ['http://localhost:5173'] : []),
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-API-Key',
    'X-Request-ID'
  ],
  credentials: true,
  maxAge: 86400, // 24 hours
};

// Session configuration
export const sessionConfig = {
  cookieName: 'train-station-session',
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  domain: process.env.NODE_ENV === 'production' ? '.trainstation-dashboard.com' : undefined,
}; 