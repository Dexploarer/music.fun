import { renderHook, act } from '@testing-library/react';
import { useMobile } from '../useMobile';
import { vi } from 'vitest';

// Mock window properties
const mockMatchMedia = vi.fn();
const mockAddEventListener = vi.fn();
const mockRemoveEventListener = vi.fn();

// Create a mock for matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia.mockImplementation(query => ({
    matches: query === '(display-mode: standalone)',
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('useMobile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768,
    });

    // Mock navigator
    Object.defineProperty(window, 'navigator', {
      writable: true,
      value: {
        onLine: true,
        standalone: false,
      },
    });

    // Mock event listeners
    window.addEventListener = mockAddEventListener;
    window.removeEventListener = mockRemoveEventListener;
  });

  it('initializes with desktop viewport by default', () => {
    const { result } = renderHook(() => useMobile());

    expect(result.current.isDesktop).toBe(true);
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.orientation).toBe('landscape');
    expect(result.current.viewportWidth).toBe(1024);
    expect(result.current.viewportHeight).toBe(768);
  });

  it('detects mobile viewport correctly', () => {
    // Set mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });
    
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 667,
    });

    const { result } = renderHook(() => useMobile());

    expect(result.current.isMobile).toBe(true);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.orientation).toBe('portrait');
  });

  it('detects tablet viewport correctly', () => {
    // Set tablet viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    });
    
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    const { result } = renderHook(() => useMobile());

    expect(result.current.isTablet).toBe(true);
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.orientation).toBe('portrait');
  });

  it('detects online status correctly', () => {
    const { result } = renderHook(() => useMobile());

    expect(result.current.isOnline).toBe(true);
  });

  it('detects offline status correctly', () => {
    Object.defineProperty(window, 'navigator', {
      writable: true,
      value: {
        onLine: false,
        standalone: false,
      },
    });

    const { result } = renderHook(() => useMobile());

    expect(result.current.isOnline).toBe(false);
  });

  it('sets up event listeners correctly', () => {
    renderHook(() => useMobile());

    expect(mockAddEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
    expect(mockAddEventListener).toHaveBeenCalledWith('orientationchange', expect.any(Function));
    expect(mockAddEventListener).toHaveBeenCalledWith('online', expect.any(Function));
    expect(mockAddEventListener).toHaveBeenCalledWith('offline', expect.any(Function));
    expect(mockAddEventListener).toHaveBeenCalledWith('beforeinstallprompt', expect.any(Function));
  });

  it('cleans up event listeners on unmount', () => {
    const { unmount } = renderHook(() => useMobile());

    unmount();

    expect(mockRemoveEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
    expect(mockRemoveEventListener).toHaveBeenCalledWith('orientationchange', expect.any(Function));
    expect(mockRemoveEventListener).toHaveBeenCalledWith('online', expect.any(Function));
    expect(mockRemoveEventListener).toHaveBeenCalledWith('offline', expect.any(Function));
    expect(mockRemoveEventListener).toHaveBeenCalledWith('beforeinstallprompt', expect.any(Function));
  });

  it('detects standalone mode correctly', () => {
    // Mock standalone mode
    mockMatchMedia.mockImplementation(query => ({
      matches: query === '(display-mode: standalone)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => useMobile());

    expect(result.current.isStandalone).toBe(true);
  });

  it('handles install prompt correctly', async () => {
    const mockPrompt = vi.fn();
    const mockUserChoice = Promise.resolve({ outcome: 'accepted', platform: 'web' });
    
    const mockInstallPrompt = {
      prompt: mockPrompt,
      userChoice: mockUserChoice,
      platforms: ['web'],
    };

    const { result } = renderHook(() => useMobile());

    // Simulate beforeinstallprompt event
    act(() => {
      result.current.installPrompt = mockInstallPrompt as any;
    });

    expect(result.current.isInstallable).toBe(true);

    // Test showInstallPrompt
    await act(async () => {
      await result.current.showInstallPrompt();
    });

    expect(mockPrompt).toHaveBeenCalled();
  });

  it('handles viewport changes with debounce', () => {
    vi.useFakeTimers();
    
    const { result } = renderHook(() => useMobile());

    // Trigger multiple resize events
    act(() => {
      window.dispatchEvent(new Event('resize'));
      window.dispatchEvent(new Event('resize'));
      window.dispatchEvent(new Event('resize'));
    });

    // Fast-forward time to trigger debounced function
    act(() => {
      vi.advanceTimersByTime(200);
    });

    vi.useRealTimers();
  });

  it('calculates orientation correctly', () => {
    // Portrait orientation
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });
    
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 667,
    });

    const { result } = renderHook(() => useMobile());
    expect(result.current.orientation).toBe('portrait');

    // Landscape orientation
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 667,
    });
    
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 375,
    });

    const { result: result2 } = renderHook(() => useMobile());
    expect(result2.current.orientation).toBe('landscape');
  });
}); 