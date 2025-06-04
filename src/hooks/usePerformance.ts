import { useState, useEffect, useCallback } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  navigationTiming: PerformanceNavigationTiming | null;
  vitals: {
    FCP: number | null; // First Contentful Paint
    LCP: number | null; // Largest Contentful Paint
    FID: number | null; // First Input Delay
    CLS: number | null; // Cumulative Layout Shift
    TTFB: number | null; // Time to First Byte
  };
}

interface PerformanceState extends PerformanceMetrics {
  isLoading: boolean;
  score: number; // Overall performance score 0-100
}

export const usePerformance = () => {
  const [performanceState, setPerformanceState] = useState<PerformanceState>({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    navigationTiming: null,
    vitals: {
      FCP: null,
      LCP: null,
      FID: null,
      CLS: null,
      TTFB: null
    },
    isLoading: true,
    score: 0
  });

  // Measure component render time
  const measureRenderTime = useCallback((componentName: string) => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      console.log(`${componentName} render time: ${renderTime.toFixed(2)}ms`);
      
      setPerformanceState(prev => ({
        ...prev,
        renderTime: Math.max(prev.renderTime, renderTime)
      }));
    };
  }, []);

  // Get Web Vitals metrics
  const measureWebVitals = useCallback(() => {
    // First Contentful Paint (FCP)
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
          setPerformanceState(prev => ({
            ...prev,
            vitals: { ...prev.vitals, FCP: entry.startTime }
          }));
        }
      }
    });

    try {
      observer.observe({ entryTypes: ['paint'] });
    } catch (error) {
      console.warn('Performance Observer not supported');
    }

    // Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      setPerformanceState(prev => ({
        ...prev,
        vitals: { ...prev.vitals, LCP: lastEntry.startTime }
      }));
    });

    try {
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (error) {
      console.warn('LCP Observer not supported');
    }

    // First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // Type assertion for PerformanceEventTiming which has processingStart
        const eventEntry = entry as any; // Using any due to limited browser support
        if (eventEntry.processingStart) {
          setPerformanceState(prev => ({
            ...prev,
            vitals: { ...prev.vitals, FID: eventEntry.processingStart - eventEntry.startTime }
          }));
        }
      }
    });

    try {
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (error) {
      console.warn('FID Observer not supported');
    }

    return () => {
      observer.disconnect();
      lcpObserver.disconnect();
      fidObserver.disconnect();
    };
  }, []);

  // Calculate performance score
  const calculatePerformanceScore = useCallback((metrics: PerformanceMetrics) => {
    let score = 100;
    
    // Deduct points based on load time
    if (metrics.loadTime > 3000) score -= 30;
    else if (metrics.loadTime > 1500) score -= 15;
    
    // Deduct points based on FCP
    if (metrics.vitals.FCP && metrics.vitals.FCP > 2500) score -= 20;
    else if (metrics.vitals.FCP && metrics.vitals.FCP > 1500) score -= 10;
    
    // Deduct points based on LCP
    if (metrics.vitals.LCP && metrics.vitals.LCP > 4000) score -= 25;
    else if (metrics.vitals.LCP && metrics.vitals.LCP > 2500) score -= 12;
    
    // Deduct points based on memory usage
    if (metrics.memoryUsage > 50) score -= 15;
    else if (metrics.memoryUsage > 25) score -= 8;
    
    return Math.max(0, score);
  }, []);

  // Get memory usage
  const getMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      return Math.round((memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit) * 100);
    }
    return 0;
  }, []);

  // Initialize performance monitoring
  useEffect(() => {
    const startTime = performance.now();
    
    // Get navigation timing
    const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    // Calculate initial metrics
    const loadTime = navigationTiming ? navigationTiming.loadEventEnd - navigationTiming.fetchStart : 0;
    const memoryUsage = getMemoryUsage();
    
    // Calculate TTFB
    const ttfb = navigationTiming ? navigationTiming.responseStart - navigationTiming.fetchStart : null;
    
    setPerformanceState(prev => {
      const newState = {
        ...prev,
        loadTime,
        memoryUsage,
        navigationTiming,
        vitals: { ...prev.vitals, TTFB: ttfb },
        isLoading: false
      };
      
      return {
        ...newState,
        score: calculatePerformanceScore(newState)
      };
    });

    // Setup Web Vitals monitoring
    const cleanup = measureWebVitals();
    
    // Monitor memory usage periodically
    const memoryInterval = setInterval(() => {
      const currentMemory = getMemoryUsage();
      setPerformanceState(prev => ({
        ...prev,
        memoryUsage: currentMemory
      }));
    }, 10000); // Check every 10 seconds

    return () => {
      cleanup?.();
      clearInterval(memoryInterval);
    };
  }, [calculatePerformanceScore, getMemoryUsage, measureWebVitals]);

  // Update performance score when metrics change
  useEffect(() => {
    const score = calculatePerformanceScore(performanceState);
    setPerformanceState(prev => ({ ...prev, score }));
  }, [performanceState.loadTime, performanceState.vitals, performanceState.memoryUsage, calculatePerformanceScore]);

  // Manual performance measurement
  const measurePageTransition = useCallback((pageName: string) => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const transitionTime = endTime - startTime;
      console.log(`Page transition to ${pageName}: ${transitionTime.toFixed(2)}ms`);
    };
  }, []);

  // Clear performance marks and measures
  const clearMeasurements = useCallback(() => {
    if (performance.clearMarks) {
      performance.clearMarks();
    }
    if (performance.clearMeasures) {
      performance.clearMeasures();
    }
  }, []);

  return {
    ...performanceState,
    measureRenderTime,
    measurePageTransition,
    clearMeasurements,
    getMemoryUsage
  };
}; 