import { useEffect, useRef, useCallback } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

interface UseAutoSaveProps {
  roomId: string;
  content: () => string;
  username: string;
  language?: string;
  // Save interval in milliseconds (default: 30 seconds)
  interval?: number;
  // Minimum characters changed before saving (default: 10)
  minChangeThreshold?: number;
}

export function useAutoSave({
  roomId,
  content,
  username,
  language = 'javascript',
  interval = 30000,
  minChangeThreshold = 10,
}: UseAutoSaveProps) {
  const lastSaveRef = useRef<string>('');
  const saveRoom = useMutation(api.rooms.saveRoom);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Memoize the save function to avoid recreating it on every render
  const save = useCallback(async () => {
    const currentContent = content();
    
    // Check if content has actually changed
    if (currentContent === lastSaveRef.current) return;
    
    // Check if the change is significant enough to warrant a save
    const changeSize = Math.abs(currentContent.length - lastSaveRef.current.length);
    if (changeSize < minChangeThreshold && lastSaveRef.current) {
      // If change is small, delay the save to batch multiple small changes
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(async () => {
        try {
          await saveRoom({
            roomId,
            content: currentContent,
            language,
            username,
          });
          
          lastSaveRef.current = currentContent;
          console.log('✅ Saved:', new Date().toLocaleTimeString(), 'Content length:', currentContent.length);
        } catch (error) {
          console.error('❌ Save failed:', error);
        }
      }, 5000); // Wait 5 seconds before saving small changes
      
      return;
    }

    try {
      await saveRoom({
        roomId,
        content: currentContent,
        language,
        username,
      });
      
      lastSaveRef.current = currentContent;
      console.log('✅ Saved:', new Date().toLocaleTimeString(), 'Content length:', currentContent.length);
    } catch (error) {
      console.error('❌ Save failed:', error);
    }
  }, [roomId, content, language, username, saveRoom, minChangeThreshold]);

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
}