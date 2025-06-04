import React, { useState, useEffect } from 'react';
import { useMobile } from '../../hooks/useMobile';
import { Download, X, Smartphone, Monitor, Wifi, WifiOff } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const PWAInstallPrompt: React.FC = () => {
  const { isInstallable, showInstallPrompt, isStandalone, isMobile, isOnline } = useMobile();
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenDismissed, setHasBeenDismissed] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed the prompt
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      setHasBeenDismissed(true);
      return;
    }

    // Show prompt after a delay if conditions are met
    const timer = setTimeout(() => {
      if (isInstallable && !isStandalone && !hasBeenDismissed) {
        setIsVisible(true);
      }
    }, 3000); // Show after 3 seconds

    return () => clearTimeout(timer);
  }, [isInstallable, isStandalone, hasBeenDismissed]);

  const handleInstall = async () => {
    try {
      await showInstallPrompt();
      setIsVisible(false);
      toast.success('Thanks for installing TrainStation Dashboard!');
    } catch (error) {
      console.error('Install failed:', error);
      toast.error('Installation failed. Please try again.');
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setHasBeenDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  const handleDismissTemporary = () => {
    setIsVisible(false);
    // Don't set localStorage, allow showing again later
  };

  if (!isVisible || !isInstallable || isStandalone) {
    return null;
  }

  return (
    <>
      {/* Offline indicator */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-amber-600 text-white text-center py-2 px-4 z-50">
          <div className="flex items-center justify-center gap-2">
            <WifiOff className="h-4 w-4" />
            <span className="text-sm font-medium">You're offline. Some features may be limited.</span>
          </div>
        </div>
      )}

      {/* Install prompt */}
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-40">
        <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                {isMobile ? (
                  <Smartphone className="h-5 w-5 text-white" />
                ) : (
                  <Monitor className="h-5 w-5 text-white" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-white">Install App</h3>
                <p className="text-xs text-gray-400">Get the best experience</p>
              </div>
            </div>
            <button
              onClick={handleDismissTemporary}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="mb-4">
              <h4 className="font-medium text-white mb-2">Why install?</h4>
              <ul className="space-y-1 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                  Faster loading and offline access
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                  Full-screen experience
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                  Push notifications
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                  Easy access from home screen
                </li>
              </ul>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleInstall}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Download className="h-4 w-4" />
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2.5 text-gray-400 hover:text-gray-300 transition-colors text-sm"
              >
                Not now
              </button>
            </div>
          </div>

          {/* Online status indicator */}
          <div className="px-4 pb-3">
            <div className="flex items-center gap-2 text-xs">
              {isOnline ? (
                <>
                  <Wifi className="h-3 w-3 text-green-400" />
                  <span className="text-green-400">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3 text-amber-400" />
                  <span className="text-amber-400">Offline</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Update status component for showing update notifications
export const PWAUpdateNotification: React.FC = () => {
  const [showUpdate, setShowUpdate] = useState(false);
  const { isOnline } = useMobile();

  useEffect(() => {
    const handleSWUpdate = () => {
      setShowUpdate(true);
    };

    // Listen for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', handleSWUpdate);
      
      return () => {
        navigator.serviceWorker.removeEventListener('controllerchange', handleSWUpdate);
      };
    }
  }, []);

  const handleUpdate = () => {
    window.location.reload();
  };

  const handleDismiss = () => {
    setShowUpdate(false);
  };

  if (!showUpdate || !isOnline) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50">
      <div className="bg-blue-600 text-white rounded-lg shadow-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Update Available</h3>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-blue-700 rounded transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm mb-3 text-blue-100">
          A new version of the app is available with improvements and bug fixes.
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleUpdate}
            className="flex-1 bg-white text-blue-600 px-3 py-2 rounded font-medium hover:bg-blue-50 transition-colors"
          >
            Update Now
          </button>
          <button
            onClick={handleDismiss}
            className="px-3 py-2 text-blue-100 hover:text-white transition-colors"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}; 