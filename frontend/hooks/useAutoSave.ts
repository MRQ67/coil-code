import { useEffect, useRef } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

interface UseAutoSaveProps {
  roomId: string;
  content: () => string;
  username: string;
  language?: string;
  interval?: number;
}

export function useAutoSave({
  roomId,
  content,
  username,
  language = 'javascript',
  interval = 30000,
}: UseAutoSaveProps) {
  const lastSaveRef = useRef<string>('');
  const saveRoom = useMutation(api.rooms.saveRoom);

  useEffect(() => {
    const save = async () => {
      const currentContent = content();
      
      if (currentContent === lastSaveRef.current) return;
      
      try {
        await saveRoom({
          roomId,
          content: currentContent,
          language,
          username,
        });
        
        lastSaveRef.current = currentContent;
        console.log('✅ Saved:', new Date().toLocaleTimeString());
      } catch (error) {
        console.error('❌ Save failed:', error);
      }
    };

    save(); // Initial save
    const id = setInterval(save, interval);
    
    const handleBeforeUnload = () => {
      save();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(id);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      save(); // Final save
    };
  }, [roomId, content, username, language, interval, saveRoom]);
}