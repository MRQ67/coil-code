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

    if (totalChange < minChangeThreshold &&
        lastSaveRef.current.html &&
        lastSaveRef.current.css &&
        lastSaveRef.current.js) {
      // If changes are small, delay the save to batch multiple small changes
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(async () => {
        setSaveStatus('saving');
        try {
          // OPTIMIZED: Single mutation call instead of 3 separate calls
          await saveRoomBatch({
            roomId,
            htmlContent: currentHtml,
            cssContent: currentCss,
            jsContent: currentJs,
            username,
          });

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
      }, 5000); // Wait 5 seconds before saving small changes

      return;
    }

    setSaveStatus('saving');
    try {
      // OPTIMIZED: Single mutation call instead of 3 separate calls
      await saveRoomBatch({
        roomId,
        htmlContent: currentHtml,
        cssContent: currentCss,
        jsContent: currentJs,
        username,
      });

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
  }, [roomId, htmlContent, cssContent, jsContent, username, saveRoomBatch, minChangeThreshold]);

  useEffect(() => {
    if (!roomId || !username) return;

    // Initial save after a short delay to ensure everything is initialized
    const initTimeout = setTimeout(save, 1000);

    // Set up periodic saving
    const id = setInterval(save, interval);

    // Save when the page is about to unload
    const handleBeforeUnload = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      save();
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
      save();
    };
  }, [roomId, username, save, interval]);

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