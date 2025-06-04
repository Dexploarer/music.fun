import { renderHook, act } from '@testing-library/react';
import { usePerformance } from '../usePerformance';
import { vi } from 'vitest';

// Mock performance APIs
const mockPerformanceObserver = vi.fn().mockImplementation((callback) => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
}));

// Create a proper mock for PerformanceObserver
Object.defineProperty(global, 'PerformanceObserver', {
  writable: true,
  value: mockPerformanceObserver,
});

// Add supportedEntryTypes as a static property
Object.defineProperty(mockPerformanceObserver, 'supportedEntryTypes', {
  value: ['paint', 'largest-contentful-paint', 'first-input'],
});

describe('usePerformance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset performance mock
    Object.defineProperty(global, 'performance', {
      writable: true,
      value: {
        now: vi.fn(() => Date.now()),
        mark: vi.fn(),
        measure: vi.fn(),
        clearMarks: vi.fn(),
        clearMeasures: vi.fn(),
        getEntriesByName: vi.fn(() => []),
        getEntriesByType: vi.fn(() => [{
          fetchStart: 0,
          loadEventEnd: 1000,
          responseStart: 100,
        }]),
        memory: {
          usedJSHeapSize: 1000000,
          totalJSHeapSize: 2000000,
          jsHeapSizeLimit: 4000000,
        }
      }
    });
  });

  it('initializes with default performance state', () => {
    const { result } = renderHook(() => usePerformance());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.score).toBeGreaterThanOrEqual(0);
    expect(result.current.score).toBeLessThanOrEqual(100);
    expect(result.current.memoryUsage).toBe(25); // 1MB / 4MB * 100
  });

  it('calculates performance score correctly', () => {
    const { result } = renderHook(() => usePerformance());

    expect(typeof result.current.score).toBe('number');
    expect(result.current.score).toBeGreaterThanOrEqual(0);
    expect(result.current.score).toBeLessThanOrEqual(100);
  });

  it('measures render time correctly', () => {
    const { result } = renderHook(() => usePerformance());
    
    const mockStart = 1000;
    const mockEnd = 1100;
    
    (performance.now as any)
      .mockReturnValueOnce(mockStart)
      .mockReturnValueOnce(mockEnd);

    const endMeasure = result.current.measureRenderTime('TestComponent');
    endMeasure();

    expect(performance.now).toHaveBeenCalledTimes(2);
  });

  it('measures page transition correctly', () => {
    const { result } = renderHook(() => usePerformance());
    
    const mockStart = 1000;
    const mockEnd = 1200;
    
    (performance.now as any)
      .mockReturnValueOnce(mockStart)
      .mockReturnValueOnce(mockEnd);

    const endMeasure = result.current.measurePageTransition('HomePage');
    endMeasure();

    expect(performance.now).toHaveBeenCalledTimes(2);
  });

  it('clears performance measurements', () => {
    const { result } = renderHook(() => usePerformance());

    act(() => {
      result.current.clearMeasurements();
    });

    expect(performance.clearMarks).toHaveBeenCalled();
    expect(performance.clearMeasures).toHaveBeenCalled();
  });

  it('gets memory usage correctly', () => {
    const { result } = renderHook(() => usePerformance());

    const memoryUsage = result.current.getMemoryUsage();
    expect(memoryUsage).toBe(25); // 1MB / 4MB * 100
  });

  it('handles missing performance.memory gracefully', () => {
    // Mock performance without memory property
    Object.defineProperty(global, 'performance', {
      writable: true,
      value: {
        now: vi.fn(() => Date.now()),
        mark: vi.fn(),
        measure: vi.fn(),
        clearMarks: vi.fn(),
        clearMeasures: vi.fn(),
        getEntriesByName: vi.fn(() => []),
        getEntriesByType: vi.fn(() => [{
          fetchStart: 0,
          loadEventEnd: 1000,
          responseStart: 100,
        }]),
        // No memory property
      }
    });

    const { result } = renderHook(() => usePerformance());
    const memoryUsage = result.current.getMemoryUsage();
    
    expect(memoryUsage).toBe(0);
  });

  it('sets up performance observers correctly', () => {
    renderHook(() => usePerformance());

    // Should create observers for paint, largest-contentful-paint, and first-input
    expect(mockPerformanceObserver).toHaveBeenCalledTimes(3);
  });

  it('calculates load time from navigation timing', () => {
    const { result } = renderHook(() => usePerformance());

    expect(result.current.loadTime).toBe(1000); // loadEventEnd - fetchStart
  });

  it('calculates TTFB from navigation timing', () => {
    const { result } = renderHook(() => usePerformance());

    expect(result.current.vitals.TTFB).toBe(100); // responseStart - fetchStart
  });
}); 