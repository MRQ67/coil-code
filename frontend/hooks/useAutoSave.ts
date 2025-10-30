import { useEffect, useRef } from 'react';

interface UseAutoSaveProps {
  roomId: string;
  content: () => string;
  username: string;
  interval?: number;
}

export function useAutoSave({ roomId, content, username, interval = 30000 }: UseAutoSaveProps) {
  const lastSaveRef = useRef<string>('');
  const retryCountRef = useRef<number>(0);
  const maxRetries = 3;
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const save = async () => {
      const current = content();
      // Only save if content has actually changed (with a small tolerance for empty content)
      if (current === lastSaveRef.current) return;
      
      // Clear any existing timeout
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
      
      try {
        const controller = new AbortController();
        timeoutIdRef.current = setTimeout(() => controller.abort(), 15000); // 15 second timeout

        const res = await fetch(`/api/rooms/${roomId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            content: current, 
            username,
            timestamp: Date.now() // Include timestamp to track when saved
          }),
          signal: controller.signal
        });
        
        if (timeoutIdRef.current) {
          clearTimeout(timeoutIdRef.current);
          timeoutIdRef.current = null;
        }

        if (res.ok) {
          lastSaveRef.current = current;
          retryCountRef.current = 0; // Reset retry count on success
          console.log('✅ Saved:', new Date().toLocaleTimeString(), `- Content length: ${current.length}`);
        } else if (res.status === 408) { // Request timeout
          console.warn('⚠️ Save timeout, will retry:', new Date().toLocaleTimeString());
          if (retryCountRef.current < maxRetries) {
            retryCountRef.current++;
            // Retry after a short delay
            setTimeout(save, 2000 * retryCountRef.current);
          }
        } else {
          console.error('❌ Save failed with status:', res.status);
          if (retryCountRef.current < maxRetries) {
            retryCountRef.current++;
            setTimeout(save, 2000 * retryCountRef.current);
          }
        }
      } catch (error) {
        if (timeoutIdRef.current) {
          clearTimeout(timeoutIdRef.current);
          timeoutIdRef.current = null;
        }
        
        const err = error as { name?: string; message?: string } | Error | unknown;
        if (err && typeof err === 'object' && 'name' in err && (err as { name: string }).name === 'AbortError') {
          console.warn('⚠️ Save timeout, will retry:', new Date().toLocaleTimeString());
        } else {
          console.error('❌ Save failed:', error);
        }
        
        if (retryCountRef.current < maxRetries) {
          retryCountRef.current++;
          // Retry after a progressively longer delay
          setTimeout(save, 2000 * retryCountRef.current);
        }
      }
    };

    // Initial save after a short delay to allow editor to initialize
    const initialSaveTimer = setTimeout(save, 500);
    
    const id = setInterval(save, interval);
    window.addEventListener('beforeunload', save);

    return () => {
      clearInterval(id);
      window.removeEventListener('beforeunload', save);
      clearTimeout(initialSaveTimer);
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
      // Don't retry on cleanup
      // Note: AbortSignal.timeout() is not supported in all environments, so using AbortController
      const cleanupController = new AbortController();
      setTimeout(() => cleanupController.abort(), 10000); // 10 second timeout for cleanup save
      fetch(`/api/rooms/${roomId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: content(), 
          username,
          timestamp: Date.now()
        }),
        signal: cleanupController.signal
      }).catch((err: unknown) => {
        // Check if it's an AbortError and handle it gracefully
        const error = err as { name?: string; message?: string } | Error | unknown;
        if (error && typeof error === 'object' && 'name' in error && (error as { name: string }).name === 'AbortError') {
          console.warn('Final save timeout (cleanup):', new Date().toLocaleTimeString());
        } else {
          console.error('Final save failed (cleanup):', err);
        }
      });
    };
  }, [roomId, content, username, interval]);
}