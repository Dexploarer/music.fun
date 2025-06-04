import { useState, useEffect } from 'react';

interface MobileState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  orientation: 'portrait' | 'landscape';
  viewportWidth: number;
  viewportHeight: number;
  isOnline: boolean;
  installPrompt: BeforeInstallPromptEvent | null;
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const useMobile = (): MobileState & {
  showInstallPrompt: () => Promise<void>;
  isInstallable: boolean;
  isStandalone: boolean;
} => {
  const [state, setState] = useState<MobileState>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    orientation: 'landscape',
    viewportWidth: typeof window !== 'undefined' ? window.innerWidth : 1024,
    viewportHeight: typeof window !== 'undefined' ? window.innerHeight : 768,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    installPrompt: null
  });

  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setState(prev => ({
        ...prev,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        orientation: width > height ? 'landscape' : 'portrait',
        viewportWidth: width,
        viewportHeight: height
      }));
    };

    const handleOnlineStatusChange = () => {
      setState(prev => ({ ...prev, isOnline: navigator.onLine }));
    };

    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setState(prev => ({ ...prev, installPrompt: e }));
    };

    // Check if app is running in standalone mode (installed as PWA)
    const checkStandalone = () => {
      const isStandaloneMode = 
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone ||
        document.referrer.includes('android-app://');
      
      setIsStandalone(isStandaloneMode);
    };

    // Initial setup
    updateViewport();
    checkStandalone();

    // Event listeners
    window.addEventListener('resize', updateViewport);
    window.addEventListener('orientationchange', updateViewport);
    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);

    // Handle viewport changes with debounce
    let resizeTimeout: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateViewport, 150);
    };

    window.addEventListener('resize', debouncedResize);

    return () => {
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('orientationchange', updateViewport);
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  const showInstallPrompt = async () => {
    if (state.installPrompt) {
      await state.installPrompt.prompt();
      const result = await state.installPrompt.userChoice;
      
      if (result.outcome === 'accepted') {
        setState(prev => ({ ...prev, installPrompt: null }));
      }
    }
  };

  return {
    ...state,
    showInstallPrompt,
    isInstallable: state.installPrompt !== null,
    isStandalone
  };
}; 