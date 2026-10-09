'use client';

import { useEffect } from 'react';

export function PwaClient() {
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' })
        .catch(() => { /* Installation is optional; the website remains usable. */ });
    }
    // Safari may ignore viewport scaling limits. Block pinch gestures on touch
    // devices while leaving ordinary scrolling, keyboard and browser zoom alone.
    const preventPinch = (event: Event) => event.preventDefault();
    const preventMultitouch = (event: TouchEvent) => {
      if (event.touches.length > 1) event.preventDefault();
    };
    document.addEventListener('gesturestart', preventPinch, { passive: false });
    document.addEventListener('gesturechange', preventPinch, { passive: false });
    document.addEventListener('touchmove', preventMultitouch, { passive: false });
    return () => {
      document.removeEventListener('gesturestart', preventPinch);
      document.removeEventListener('gesturechange', preventPinch);
      document.removeEventListener('touchmove', preventMultitouch);
    };
  }, []);
  return null;
}
