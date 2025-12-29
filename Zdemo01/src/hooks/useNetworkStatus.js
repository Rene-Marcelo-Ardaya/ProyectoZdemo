import { useState, useEffect } from 'react';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Manejadores del navegador
    const handleBrowserOnline = () => setIsOnline(true);
    const handleBrowserOffline = () => setIsOnline(false);

    // Manejadores de estado del servidor (custom events)
    const handleServerOnline = () => setIsOnline(true);
    const handleServerOffline = () => setIsOnline(false);

    window.addEventListener('online', handleBrowserOnline);
    window.addEventListener('offline', handleBrowserOffline);
    window.addEventListener('zdemo:online-mode', handleServerOnline);
    window.addEventListener('zdemo:offline-mode', handleServerOffline);

    return () => {
      window.removeEventListener('online', handleBrowserOnline);
      window.removeEventListener('offline', handleBrowserOffline);
      window.removeEventListener('zdemo:online-mode', handleServerOnline);
      window.removeEventListener('zdemo:offline-mode', handleServerOffline);
    };
  }, []);

  return isOnline;
}
