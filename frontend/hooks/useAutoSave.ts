import { useEffect, useRef, useCallback } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

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

export function useAutoSave({
  roomId,
  htmlContent,
  cssContent,
  jsContent,
  username,
  interval = 30000,
  minChangeThreshold = 10,
}: UseAutoSaveProps) {
  const lastSaveRef = useRef<{ html: string; css: string; js: string }>({
    html: '',
    css: '',
    js: '',
  });
  const saveRoom = useMutation(api.rooms.saveRoom);
  const timeoutRef = useRef<number | null>(null); // setTimeout returns number in browser environment

  // Helper function to perform the actual save
  const performSave = useCallback(async (currentHtml: string, currentCss: string, currentJs: string) => {
    try {
      // Save each content type separately
      await Promise.all([
        saveRoom({
          content: currentHtml,
          language: 'html',
          roomId,
          username,
        }),
        saveRoom({
          content: currentCss,
          language: 'css',
          roomId,
          username,
        }),
        saveRoom({
          content: currentJs,
          language: 'js',
          roomId,
          username,
        })
      ]);

      lastSaveRef.current = {
        html: currentHtml,
        css: currentCss,
        js: currentJs,
      };
      console.log('✅ Saved:', new Date().toLocaleTimeString(),
        'HTML:', currentHtml.length,
        'CSS:', currentCss.length,
        'JS:', currentJs.length);
    } catch (error) {
      console.error('❌ Save failed:', error);
    }
  }, [roomId, username, saveRoom]);

  // Memoize the save function to avoid recreating it on every render
  const save = useCallback(async () => {
    // Clear any existing timeout to prevent a pending debounced save from overwriting newer content
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null; // Also set to null as requested
    }

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
      timeoutRef.current = setTimeout(async () => {
        await performSave(currentHtml, currentCss, currentJs);
      }, 5000); // Wait 5 seconds before saving small changes

      return;
    }

    // Perform immediate save
    await performSave(currentHtml, currentCss, currentJs);
  }, [performSave, roomId, htmlContent, cssContent, jsContent, username, saveRoom, minChangeThreshold]);

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

  // Return the save function so it can be called manually if needed
  return { save };
}