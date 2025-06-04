// Performance optimization utilities

// Debounce function for performance optimization
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
};

// Throttle function for performance optimization
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Enhanced memoization with TTL support
export const memoizeWithTTL = <T extends (...args: any[]) => any>(
  fn: T,
  ttlMs: number = 5 * 60 * 1000 // 5 minutes default
): T => {
  const cache = new Map<string, { result: ReturnType<T>; timestamp: number }>();
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);
    const now = Date.now();
    const cached = cache.get(key);
    
    if (cached && (now - cached.timestamp) < ttlMs) {
      return cached.result;
    }
    
    const result = fn(...args);
    cache.set(key, { result, timestamp: now });
    
    // Clean expired entries periodically
    if (cache.size > 100) {
      for (const [k, v] of cache.entries()) {
        if ((now - v.timestamp) >= ttlMs) {
          cache.delete(k);
        }
      }
    }
    
    return result;
  }) as T;
};

// Basic memoization for expensive calculations
export const memoize = <T extends (...args: any[]) => any>(fn: T): T => {
  const cache = new Map();
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    
    return result;
  }) as T;
};

// Intersection Observer for lazy loading
export const createIntersectionObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit
): IntersectionObserver => {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  };
  
  return new IntersectionObserver(callback, defaultOptions);
};

// Preload critical resources
export const preloadResource = (href: string, as: string, type?: string): void => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  if (type) link.type = type;
  
  document.head.appendChild(link);
};

// Enhanced resource preloading with priority hints
export const preloadModuleWithPriority = (
  moduleSpecifier: string,
  priority: 'high' | 'low' | 'auto' = 'auto'
): void => {
  const link = document.createElement('link');
  link.rel = 'modulepreload';
  link.href = moduleSpecifier;
  if ('fetchPriority' in link) {
    (link as any).fetchPriority = priority;
  }
  document.head.appendChild(link);
};

// Bundle size optimization utilities
export const dynamicImportWithRetry = async <T>(
  importFn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> => {
  for (let i = 0; i < retries; i++) {
    try {
      return await importFn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
  throw new Error('All retry attempts failed');
};

// Critical resource loading with preload hints
export const loadCriticalChunks = async (): Promise<void> => {
  const criticalModules = [
    '/assets/components/ui/Button.js',
    '/assets/components/ui/Card.js',
    '/assets/hooks/usePerformance.js',
  ];

  await Promise.all(
    criticalModules.map(module => 
      preloadModuleWithPriority(module, 'high')
    )
  );
};

// Virtual scrolling utilities
export interface VirtualizedListConfig {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  threshold?: number;
}

export const calculateVirtualizedRange = (
  scrollTop: number,
  itemCount: number,
  config: VirtualizedListConfig
): { startIndex: number; endIndex: number; visibleRange: number } => {
  const { itemHeight, containerHeight, overscan = 5 } = config;
  
  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    itemCount - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight)
  );
  
  const startIndex = Math.max(0, visibleStart - overscan);
  const endIndex = Math.min(itemCount - 1, visibleEnd + overscan);
  const visibleRange = endIndex - startIndex + 1;
  
  return { startIndex, endIndex, visibleRange };
};

// Memory usage monitoring
export const monitorMemoryUsage = (): void => {
  if ('memory' in performance) {
    const memInfo = (performance as any).memory;
    const usedPercent = (memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit) * 100;
    
    console.log(`Memory Usage: ${usedPercent.toFixed(2)}%`);
    console.log(`Used: ${(memInfo.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Total: ${(memInfo.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Limit: ${(memInfo.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`);
    
    if (usedPercent > 70) {
      console.warn('High memory usage detected. Consider optimizing.');
    }
  }
};

// Network status detection
export const getNetworkStatus = () => {
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  
  return {
    online: navigator.onLine,
    effectiveType: connection?.effectiveType || 'unknown',
    downlink: connection?.downlink || 0,
    rtt: connection?.rtt || 0,
    saveData: connection?.saveData || false
  };
};

// Performance budget checking
export const checkPerformanceBudget = (budget: { loadTime: number; memoryUsage: number }) => {
  const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  const loadTime = navigationTiming ? navigationTiming.loadEventEnd - navigationTiming.fetchStart : 0;
  
  let memoryUsage = 0;
  if ('memory' in performance) {
    const memInfo = (performance as any).memory;
    memoryUsage = (memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit) * 100;
  }
  
  const violations: string[] = [];
  
  if (loadTime > budget.loadTime) {
    violations.push(`Load time exceeded: ${loadTime}ms > ${budget.loadTime}ms`);
  }
  
  if (memoryUsage > budget.memoryUsage) {
    violations.push(`Memory usage exceeded: ${memoryUsage.toFixed(1)}% > ${budget.memoryUsage}%`);
  }
  
  return {
    passed: violations.length === 0,
    violations
  };
};

// Clear performance data
export const clearPerformanceData = (): void => {
  if (performance.clearMarks) {
    performance.clearMarks();
  }
  if (performance.clearMeasures) {
    performance.clearMeasures();
  }
  if (performance.clearResourceTimings) {
    performance.clearResourceTimings();
  }
};

// Lazy loading utility for components
export const isElementInViewport = (element: Element): boolean => {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

// Performance timing utilities
export const measureExecutionTime = <T>(
  name: string,
  fn: () => T
): T => {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  console.log(`${name} execution time: ${(end - start).toFixed(2)}ms`);
  return result;
};

export const measureAsyncExecutionTime = async <T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> => {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  
  console.log(`${name} async execution time: ${(end - start).toFixed(2)}ms`);
  return result;
};

// Image optimization utilities
export const getOptimalImageFormat = (): 'webp' | 'avif' | 'jpg' => {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  // Check for AVIF support
  if (canvas.toDataURL('image/avif').startsWith('data:image/avif')) {
    return 'avif';
  }
  
  // Check for WebP support
  if (canvas.toDataURL('image/webp').startsWith('data:image/webp')) {
    return 'webp';
  }
  
  return 'jpg';
};

export const generateResponsiveImageSrcSet = (
  baseUrl: string,
  widths: number[],
  format?: string
): string => {
  const optimalFormat = format || getOptimalImageFormat();
  
  return widths
    .map(width => `${baseUrl}?w=${width}&f=${optimalFormat} ${width}w`)
    .join(', ');
};

// Service Worker utilities
export const registerServiceWorker = async (swPath: string = '/sw.js'): Promise<ServiceWorkerRegistration | undefined> => {
  if ('serviceWorker' in navigator && 'caches' in window) {
    try {
      const registration = await navigator.serviceWorker.register(swPath);
      
      registration.addEventListener('updatefound', () => {
        console.log('New service worker version available');
      });
      
      return registration;
    } catch (error) {
      console.error('Service worker registration failed:', error);
    }
  }
  
  return undefined;
};

// Cache management
export const createCacheManager = (cacheName: string) => {
  return {
    async get<T>(key: string): Promise<T | null> {
      try {
        const cache = await caches.open(cacheName);
        const response = await cache.match(key);
        
        if (response) {
          return response.json();
        }
        
        return null;
      } catch {
        return null;
      }
    },
    
    async set<T>(key: string, data: T, ttl?: number): Promise<void> {
      try {
        const cache = await caches.open(cacheName);
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };
        
        if (ttl) {
          headers['Cache-Control'] = `max-age=${ttl}`;
        }
        
        const response = new Response(JSON.stringify(data), { headers });
        await cache.put(key, response);
      } catch (error) {
        console.error('Cache set failed:', error);
      }
    },
    
    async delete(key: string): Promise<void> {
      try {
        const cache = await caches.open(cacheName);
        await cache.delete(key);
      } catch (error) {
        console.error('Cache delete failed:', error);
      }
    },
    
    async clear(): Promise<void> {
      try {
        await caches.delete(cacheName);
      } catch (error) {
        console.error('Cache clear failed:', error);
      }
    }
  };
};

// React performance utilities
export const createMemoizedSelector = <T, R>(
  selector: (state: T) => R,
  dependencies?: any[]
) => {
  let lastState: T;
  let lastResult: R;
  let lastDeps: any[] | undefined;
  
  return (state: T): R => {
    const depsChanged = dependencies && (!lastDeps || 
      dependencies.some((dep, index) => dep !== lastDeps![index]));
    
    if (state !== lastState || depsChanged) {
      lastResult = selector(state);
      lastState = state;
      lastDeps = dependencies;
    }
    
    return lastResult;
  };
};

// Batch state updates for React
export const batchStateUpdates = <T>(
  updates: Array<() => void>
): void => {
  // Use React's unstable_batchedUpdates if available
  if (typeof (window as any).React?.unstable_batchedUpdates === 'function') {
    (window as any).React.unstable_batchedUpdates(() => {
      updates.forEach(update => update());
    });
  } else {
    // Fallback to immediate execution
    updates.forEach(update => update());
  }
}; 