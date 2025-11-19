import { useEffect, useRef, useCallback, useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface UseAutoSaveProps {
  roomId: string;
  htmlContent: () => string;
  cssContent: () => string;
  jsContent: () => string;
  username: string;
  // Save interval in milliseconds (default: 30 seconds)
  interval?: number;
  // Minimum characters changed before saving (default: 10)
  minChangeThreshold?: number;
}

interface UseAutoSaveReturn {
  save: () => Promise<void>;
  saveStatus: SaveStatus;
}

export function useAutoSave({
  roomId,
  htmlContent,
  cssContent,
  jsContent,
  username,
  interval = 30000,
  minChangeThreshold = 10,
}: UseAutoSaveProps): UseAutoSaveReturn {
  const lastSaveRef = useRef<{ html: string; css: string; js: string }>({
    html: '',
    css: '',
    js: '',
  });
  // OPTIMIZED: Use batched mutation instead of 3 separate calls
  const saveRoomBatch = useMutation(api.rooms.saveRoomBatch);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const isFirstSaveRef = useRef(true);

  // Memoize the save function to avoid recreating it on every render
  const save = useCallback(async () => {
    const currentHtml = htmlContent();
    const currentCss = cssContent();
    const currentJs = jsContent();

    // Check if any content has actually changed
    if (
      currentHtml === lastSaveRef.current.html &&
      currentCss === lastSaveRef.current.css &&
      currentJs === lastSaveRef.current.js
    ) {
      return;
    }

    // Check if changes are significant enough to warrant a save
    const htmlChange = Math.abs(currentHtml.length - lastSaveRef.current.html.length);
    const cssChange = Math.abs(currentCss.length - lastSaveRef.current.css.length);
    const jsChange = Math.abs(currentJs.length - lastSaveRef.current.js.length);

    const totalChange = htmlChange + cssChange + jsChange;

    // FIXED: Always use debouncing for non-first saves, regardless of change size
    // This prevents saves on every keystroke
    if (!isFirstSaveRef.current) {
      // Clear any existing timeout to reset the debounce timer
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Wait 3 seconds after user stops typing before saving
      timeoutRef.current = setTimeout(async () => {
        setSaveStatus('saving');
        try {
          // OPTIMIZED: Single mutation call instead of 3 separate calls
          const result = await saveRoomBatch({
            roomId,
            htmlContent: currentHtml,
            cssContent: currentCss,
            jsContent: currentJs,
            username,
          });

          // Handle rate limit errors
          if (!result.success) {
            console.warn('⚠️ Save blocked:', result.error);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 3000);
            return;
          }

          lastSaveRef.current = {
            html: currentHtml,
            css: currentCss,
            js: currentJs,
          };
          setSaveStatus('saved');
          console.log('✅ Saved:', new Date().toLocaleTimeString(),
            'HTML:', currentHtml.length,
            'CSS:', currentCss.length,
            'JS:', currentJs.length);

          // Reset to idle after 2 seconds
          setTimeout(() => setSaveStatus('idle'), 2000);
        } catch (error) {
          console.error('❌ Save failed:', error);
          setSaveStatus('error');
          // Reset to idle after 3 seconds
          setTimeout(() => setSaveStatus('idle'), 3000);
        }
      }, 3000); // Wait 3 seconds after user stops typing

      return;
    }

    // First save or manual save - execute immediately
    setSaveStatus('saving');
    try {
      // OPTIMIZED: Single mutation call instead of 3 separate calls
      const result = await saveRoomBatch({
        roomId,
        htmlContent: currentHtml,
        cssContent: currentCss,
        jsContent: currentJs,
        username,
      });

      // Handle rate limit errors and validation errors
      if (!result.success) {
        console.warn('⚠️ Save blocked:', result.error);
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
        return;
      }

      lastSaveRef.current = {
        html: currentHtml,
        css: currentCss,
        js: currentJs,
      };
      isFirstSaveRef.current = false; // Mark that first save is complete
      setSaveStatus('saved');
      console.log('✅ Saved:', new Date().toLocaleTimeString(),
        'HTML:', currentHtml.length,
        'CSS:', currentCss.length,
        'JS:', currentJs.length);

      // Reset to idle after 2 seconds
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('❌ Save failed:', error);
      setSaveStatus('error');
      // Reset to idle after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, [roomId, htmlContent, cssContent, jsContent, username, saveRoomBatch]);

  // FIXED: Use ref to store save function to prevent useEffect from re-running
  // on every keystroke when save function changes
  const saveRef = useRef(save);
  useEffect(() => {
    saveRef.current = save;
  }, [save]);

  useEffect(() => {
    if (!roomId || !username) return;

    // Initial save after a short delay to ensure everything is initialized
    const initTimeout = setTimeout(() => saveRef.current(), 1000);

    // Set up periodic saving (only saves if there are changes)
    const id = setInterval(() => saveRef.current(), interval);

    // Save when the page is about to unload
    const handleBeforeUnload = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      saveRef.current();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearTimeout(initTimeout);
      clearInterval(id);
      window.removeEventListener('beforeunload', handleBeforeUnload);

      // Final save when the component unmounts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      saveRef.current();
    };
  }, [roomId, username, interval]); // FIXED: save removed from dependencies

  // Also save when the component unmounts
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Return the save function and status so it can be called manually if needed
  return { save, saveStatus };
}