/**
 * Security Middleware for Train Station Dashboard
 * Implements security headers, CSRF protection, and request validation
 */

import { defaultSecurityHeaders, defaultCSRFProtection, defaultSanitizer } from './index';

export interface SecurityMiddlewareConfig {
  enableCSRF: boolean;
  enableSecurityHeaders: boolean;
  enableInputSanitization: boolean;
  rateLimitBypass?: string[];
}

export class SecurityMiddleware {
  private config: SecurityMiddlewareConfig;

  constructor(config: Partial<SecurityMiddlewareConfig> = {}) {
    this.config = {
      enableCSRF: true,
      enableSecurityHeaders: true,
      enableInputSanitization: true,
      rateLimitBypass: [],
      ...config
    };
  }

  /**
   * Apply security headers to all responses
   */
  applySecurityHeaders(): Record<string, string> {
    if (!this.config.enableSecurityHeaders) return {};
    
    return defaultSecurityHeaders.getHeaders();
  }

  /**
   * Sanitize form data before submission
   */
  sanitizeFormData(formData: FormData | Record<string, any>): Record<string, any> {
    if (!this.config.enableInputSanitization) return formData as Record<string, any>;

    const sanitized: Record<string, any> = {};

    if (formData instanceof FormData) {
      for (const [key, value] of formData.entries()) {
        if (typeof value === 'string') {
          sanitized[key] = defaultSanitizer.sanitizeText(value);
        } else {
          sanitized[key] = value;
        }
      }
    } else {
      for (const [key, value] of Object.entries(formData)) {
        if (typeof value === 'string') {
          sanitized[key] = defaultSanitizer.sanitizeText(value);
        } else if (typeof value === 'object' && value !== null) {
          // Recursively sanitize nested objects
          sanitized[key] = this.sanitizeFormData(value);
        } else {
          sanitized[key] = value;
        }
      }
    }

    return sanitized;
  }

  /**
   * Generate CSRF token for forms
   */
  generateCSRFToken(sessionId: string): string {
    if (!this.config.enableCSRF) return '';
    
    return defaultCSRFProtection.generateToken(sessionId);
  }

  /**
   * Validate CSRF token
   */
  validateCSRFToken(sessionId: string, token: string): boolean {
    if (!this.config.enableCSRF) return true;
    
    return defaultCSRFProtection.validateToken(sessionId, token);
  }

  /**
   * Secure fetch wrapper with automatic security headers
   */
  async secureFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const securityHeaders = this.applySecurityHeaders();
    
    const enhancedOptions: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...securityHeaders,
        ...options.headers,
      }
    };

    // Add CSRF token for state-changing operations
    if (options.method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method.toUpperCase())) {
      const sessionId = this.getSessionId();
      if (sessionId && this.config.enableCSRF) {
        const csrfToken = this.generateCSRFToken(sessionId);
        enhancedOptions.headers = {
          ...enhancedOptions.headers,
          'X-CSRF-Token': csrfToken
        };
      }
    }

    // Sanitize request body if it's JSON
    if (options.body && typeof options.body === 'string') {
      try {
        const parsedBody = JSON.parse(options.body);
        const sanitizedBody = this.sanitizeFormData(parsedBody);
        enhancedOptions.body = JSON.stringify(sanitizedBody);
      } catch (e) {
        // If it's not JSON, leave it as is
      }
    }

    return fetch(url, enhancedOptions);
  }

  /**
   * Get session ID from localStorage or generate temporary one
   */
  private getSessionId(): string {
    if (typeof window === 'undefined') return '';
    
    let sessionId = localStorage.getItem('session-id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem('session-id', sessionId);
    }
    return sessionId;
  }

  /**
   * Validate file upload security
   */
  validateFileUpload(file: File): { valid: boolean; errors: string[] } {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    const maxSize = 10 * 1024 * 1024; // 10MB
    const errors: string[] = [];

    if (!allowedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} is not allowed`);
    }

    if (file.size > maxSize) {
      errors.push(`File size exceeds maximum limit of ${maxSize / (1024 * 1024)}MB`);
    }

    // Check for dangerous file extensions
    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.com', '.pif', '.vbs', '.js', '.jar'];
    const hasExtension = dangerousExtensions.some(ext => 
      file.name.toLowerCase().endsWith(ext)
    );

    if (hasExtension) {
      errors.push('File extension is not allowed for security reasons');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Sanitize URL parameters
   */
  sanitizeURLParams(params: URLSearchParams): URLSearchParams {
    const sanitized = new URLSearchParams();
    
    for (const [key, value] of params.entries()) {
      const sanitizedKey = defaultSanitizer.sanitizeText(key);
      const sanitizedValue = defaultSanitizer.sanitizeText(value);
      sanitized.append(sanitizedKey, sanitizedValue);
    }

    return sanitized;
  }

  /**
   * Create secure headers for API responses
   */
  createSecureResponseHeaders(): Headers {
    const headers = new Headers();
    const securityHeaders = this.applySecurityHeaders();

    Object.entries(securityHeaders).forEach(([key, value]) => {
      headers.set(key, value);
    });

    return headers;
  }
}

// Export singleton instance
export const securityMiddleware = new SecurityMiddleware();

// Export hook for React components
export const useSecurityMiddleware = () => {
  return securityMiddleware;
};

// Cleanup function for development
if (typeof window !== 'undefined') {
  // Clean up expired CSRF tokens every 15 minutes
  setInterval(() => {
    defaultCSRFProtection.cleanup();
  }, 15 * 60 * 1000);
} 