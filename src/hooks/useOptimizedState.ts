import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { debounce, throttle, memoizeWithTTL, batchStateUpdates } from '../utils/performance';

// Enhanced state hook with built-in performance optimizations
export const useOptimizedState = <T>(
  initialValue: T,
  options?: {
    debounceMs?: number;
    throttleMs?: number;
    batchUpdates?: boolean;
  }
) => {
  const [state, setState] = useState<T>(initialValue);
  const { debounceMs, throttleMs, batchUpdates = false } = options || {};

  // Create optimized setter based on options
  const optimizedSetState = useMemo(() => {
    let setter = setState;

    if (debounceMs) {
      setter = debounce(setState, debounceMs);
    } else if (throttleMs) {
      setter = throttle(setState, throttleMs);
    }

    if (batchUpdates) {
      return (newValue: T | ((prev: T) => T)) => {
        batchStateUpdates([() => setter(newValue)]);
      };
    }

    return setter;
  }, [debounceMs, throttleMs, batchUpdates]);

  return [state, optimizedSetState] as const;
};

// Memoized computed state hook
export const useComputedState = <T, R>(
  dependencies: T[],
  computeFn: (deps: T[]) => R,
  ttl?: number
) => {
  const memoizedCompute = useMemo(() => {
    return ttl ? memoizeWithTTL(computeFn, ttl) : computeFn;
  }, [computeFn, ttl]);

  return useMemo(() => {
    return memoizedCompute(dependencies);
  }, dependencies);
};

// Optimized async state management
export const useAsyncState = <T>(
  asyncFn: () => Promise<T>,
  dependencies: any[] = [],
  options?: {
    initialValue?: T;
    cacheKey?: string;
    cacheTTL?: number;
    retries?: number;
    retryDelay?: number;
  }
) => {
  const {
    initialValue,
    cacheKey,
    cacheTTL = 5 * 60 * 1000, // 5 minutes
    retries = 3,
    retryDelay = 1000
  } = options || {};

  const [state, setState] = useState<{
    data: T | undefined;
    loading: boolean;
    error: Error | null;
  }>({
    data: initialValue,
    loading: false,
    error: null
  });

  const cacheRef = useRef<Map<string, { data: T; timestamp: number }>>(new Map());
  const abortControllerRef = useRef<AbortController>();

  const execute = useCallback(async () => {
    // Check cache first
    if (cacheKey) {
      const cached = cacheRef.current.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < cacheTTL) {
        setState({ data: cached.data, loading: false, error: null });
        return;
      }
    }

    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setState(prev => ({ ...prev, loading: true, error: null }));

    let attempt = 0;
    while (attempt < retries) {
      try {
        const data = await asyncFn();
        
        // Cache the result
        if (cacheKey) {
          cacheRef.current.set(cacheKey, { data, timestamp: Date.now() });
        }

        setState({ data, loading: false, error: null });
        return;
      } catch (error) {
        attempt++;
        
        if (attempt >= retries) {
          setState(prev => ({ 
            ...prev, 
            loading: false, 
            error: error as Error 
          }));
          return;
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
      }
    }
  }, [asyncFn, cacheKey, cacheTTL, retries, retryDelay, ...dependencies]);

  // Execute on mount and dependency changes
  useEffect(() => {
    execute();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [execute]);

  const retry = useCallback(() => {
    execute();
  }, [execute]);

  return {
    ...state,
    retry,
    refresh: execute
  };
};

// Optimized form state management
export const useOptimizedForm = <T extends Record<string, any>>(
  initialValues: T,
  options?: {
    validation?: (values: T) => Record<keyof T, string | undefined>;
    debounceValidation?: number;
    onSubmit?: (values: T) => Promise<void> | void;
  }
) => {
  const { validation, debounceValidation = 300, onSubmit } = options || {};
  
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<keyof T, string | undefined>>({} as any);
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as any);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debounced validation
  const debouncedValidation = useMemo(() => {
    if (!validation) return null;
    return debounce((vals: T) => {
      const newErrors = validation(vals);
      setErrors(newErrors);
    }, debounceValidation);
  }, [validation, debounceValidation]);

  // Validate on value changes
  useEffect(() => {
    if (debouncedValidation) {
      debouncedValidation(values);
    } else if (validation) {
      const newErrors = validation(values);
      setErrors(newErrors);
    }
  }, [values, validation, debouncedValidation]);

  const setValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const setFieldTouched = useCallback((field: keyof T, isTouched: boolean = true) => {
    setTouched(prev => ({ ...prev, [field]: isTouched }));
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({} as any);
    setTouched({} as any);
    setIsSubmitting(false);
  }, [initialValues]);

  const handleSubmit = useCallback(async () => {
    if (!onSubmit) return;

    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key as keyof T] = true;
      return acc;
    }, {} as Record<keyof T, boolean>);
    setTouched(allTouched);

    // Final validation
    if (validation) {
      const finalErrors = validation(values);
      setErrors(finalErrors);
      
      // Check if there are any errors
      const hasErrors = Object.values(finalErrors).some(error => Boolean(error));
      if (hasErrors) return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validation, onSubmit]);

  const isValid = useMemo(() => {
    return !Object.values(errors).some(error => Boolean(error));
  }, [errors]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    setValue,
    setFieldTouched,
    reset,
    handleSubmit
  };
};

// Performance monitoring hook
export const usePerformanceOptimization = (componentName: string) => {
  const renderCountRef = useRef(0);
  const renderTimesRef = useRef<number[]>([]);
  const lastRenderTimeRef = useRef<number>(performance.now());

  useEffect(() => {
    renderCountRef.current++;
    const now = performance.now();
    const renderTime = now - lastRenderTimeRef.current;
    renderTimesRef.current.push(renderTime);
    lastRenderTimeRef.current = now;

    // Keep only last 10 render times
    if (renderTimesRef.current.length > 10) {
      renderTimesRef.current = renderTimesRef.current.slice(-10);
    }
  });

  const getPerformanceStats = useCallback(() => {
    const renderTimes = renderTimesRef.current;
    const avgRenderTime = renderTimes.length > 0
      ? renderTimes.reduce((sum, time) => sum + time, 0) / renderTimes.length
      : 0;

    return {
      renderCount: renderCountRef.current,
      averageRenderTime: avgRenderTime,
      lastRenderTime: renderTimes[renderTimes.length - 1] || 0,
      renderTimes: [...renderTimes]
    };
  }, []);

  const logPerformanceStats = useCallback(() => {
    const stats = getPerformanceStats();
    console.group(`Performance Stats: ${componentName}`);
    console.log('Render Count:', stats.renderCount);
    console.log('Average Render Time:', `${stats.averageRenderTime.toFixed(2)}ms`);
    console.log('Last Render Time:', `${stats.lastRenderTime.toFixed(2)}ms`);
    console.groupEnd();
  }, [componentName, getPerformanceStats]);

  return {
    getPerformanceStats,
    logPerformanceStats,
    renderCount: renderCountRef.current
  };
};

// Optimized list state for virtual scrolling
export const useVirtualizedListState = <T>(
  items: T[],
  options?: {
    pageSize?: number;
    preloadPages?: number;
    filterFn?: (item: T) => boolean;
    sortFn?: (a: T, b: T) => number;
  }
) => {
  const { pageSize = 50, preloadPages = 2, filterFn, sortFn } = options || {};

  // Memoize filtered and sorted items
  const processedItems = useMemo(() => {
    let result = [...items];

    if (filterFn) {
      result = result.filter(filterFn);
    }

    if (sortFn) {
      result = result.sort(sortFn);
    }

    return result;
  }, [items, filterFn, sortFn]);

  const [currentPage, setCurrentPage] = useState(0);
  const [loadedPages, setLoadedPages] = useState<Set<number>>(new Set([0]));

  // Calculate which pages should be loaded
  const requiredPages = useMemo(() => {
    const pages = new Set<number>();
    const startPage = Math.max(0, currentPage - preloadPages);
    const endPage = Math.min(
      Math.ceil(processedItems.length / pageSize) - 1,
      currentPage + preloadPages
    );

    for (let i = startPage; i <= endPage; i++) {
      pages.add(i);
    }

    return pages;
  }, [currentPage, preloadPages, processedItems.length, pageSize]);

  // Load required pages
  useEffect(() => {
    setLoadedPages(prev => {
      const newPages = new Set(prev);
      requiredPages.forEach(page => newPages.add(page));
      return newPages;
    });
  }, [requiredPages]);

  // Get visible items for current view
  const visibleItems = useMemo(() => {
    const startIndex = currentPage * pageSize;
    const endIndex = Math.min(startIndex + pageSize, processedItems.length);
    return processedItems.slice(startIndex, endIndex);
  }, [processedItems, currentPage, pageSize]);

  const totalPages = Math.ceil(processedItems.length / pageSize);

  const goToPage = useCallback((page: number) => {
    const validPage = Math.max(0, Math.min(page, totalPages - 1));
    setCurrentPage(validPage);
  }, [totalPages]);

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  return {
    visibleItems,
    currentPage,
    totalPages,
    totalItems: processedItems.length,
    pageSize,
    goToPage,
    nextPage,
    prevPage,
    hasNextPage: currentPage < totalPages - 1,
    hasPrevPage: currentPage > 0,
    loadedPages: Array.from(loadedPages)
  };
};

// Memory optimization hook
export const useMemoryOptimization = (options?: {
  maxCacheSize?: number;
  gcInterval?: number;
}) => {
  const { maxCacheSize = 100, gcInterval = 60000 } = options || {}; // 1 minute default
  const cacheRef = useRef<Map<string, { data: any; timestamp: number; accessCount: number }>>(new Map());

  // Garbage collection
  const runGarbageCollection = useCallback(() => {
    const now = Date.now();
    const entries = Array.from(cacheRef.current.entries());

    // Sort by access count and timestamp (LRU + LFU hybrid)
    entries.sort(([, a], [, b]) => {
      const scoreA = a.accessCount + (now - a.timestamp) / 1000;
      const scoreB = b.accessCount + (now - b.timestamp) / 1000;
      return scoreA - scoreB;
    });

    // Remove excess entries
    if (entries.length > maxCacheSize) {
      const toRemove = entries.slice(0, entries.length - maxCacheSize);
      toRemove.forEach(([key]) => cacheRef.current.delete(key));
    }
  }, [maxCacheSize]);

  // Setup periodic garbage collection
  useEffect(() => {
    const interval = setInterval(runGarbageCollection, gcInterval);
    return () => clearInterval(interval);
  }, [runGarbageCollection, gcInterval]);

  const set = useCallback((key: string, data: any) => {
    cacheRef.current.set(key, {
      data,
      timestamp: Date.now(),
      accessCount: 0
    });

    // Run GC if cache is getting too large
    if (cacheRef.current.size > maxCacheSize * 1.2) {
      runGarbageCollection();
    }
  }, [maxCacheSize, runGarbageCollection]);

  const get = useCallback((key: string) => {
    const entry = cacheRef.current.get(key);
    if (entry) {
      entry.accessCount++;
      entry.timestamp = Date.now();
      return entry.data;
    }
    return undefined;
  }, []);

  const has = useCallback((key: string) => {
    return cacheRef.current.has(key);
  }, []);

  const clear = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  const getStats = useCallback(() => {
    return {
      size: cacheRef.current.size,
      maxSize: maxCacheSize,
      utilizationPercent: (cacheRef.current.size / maxCacheSize) * 100
    };
  }, [maxCacheSize]);

  return {
    set,
    get,
    has,
    clear,
    getStats,
    runGarbageCollection
  };
}; 