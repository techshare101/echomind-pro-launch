/**
 * ============================================================
 * 🧩 EchoMind Background Health Monitor Hook
 * Keeps the background service worker alive & self-recovering
 * ============================================================
 */

import { useEffect, useState } from 'react';

export type HealthStatus = 'active' | 'recovering' | 'offline';

export function useBackgroundHealth(intervalMs = 30000) {
  const [status, setStatus] = useState<HealthStatus>('active');

  useEffect(() => {
    let isMounted = true;

    async function pingBackground() {
      try {
        const response = await chrome.runtime.sendMessage({ type: 'ping' });
        
        if (response && response.ok) {
          if (isMounted) {
            setStatus('active');
            console.debug('[EchoMind Health] Background worker is healthy 💚');
          }
        } else {
          throw new Error('Invalid response from background');
        }
      } catch (err) {
        console.warn('[EchoMind Health] Background not responding, attempting recovery...', err);
        
        if (isMounted) {
          setStatus('recovering');
        }

        // Wait a moment and try one more time before reloading
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        try {
          const retryResponse = await chrome.runtime.sendMessage({ type: 'ping' });
          
          if (retryResponse && retryResponse.ok) {
            console.info('[EchoMind Health] Background recovered on retry 💚');
            if (isMounted) {
              setStatus('active');
            }
            return;
          }
        } catch (retryErr) {
          console.error('[EchoMind Health] Retry failed, triggering full reload');
        }

        try {
          // Attempt to restart the extension runtime
          await chrome.runtime.reload();
          console.info('[EchoMind Health] Extension reloaded successfully 🔄');
          
          if (isMounted) {
            setStatus('active');
          }
        } catch (reloadErr) {
          console.error('[EchoMind Health] Recovery failed:', reloadErr);
          
          if (isMounted) {
            setStatus('offline');
          }
        }
      }
    }

    // Run immediately on mount
    pingBackground();
    
    // Then run periodically
    const interval = setInterval(pingBackground, intervalMs);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [intervalMs]);

  return status;
}
