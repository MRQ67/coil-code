'use client';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { Link2, Check } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface CopyRoomLinkButtonProps {
  roomId: string;
}

export default function CopyRoomLinkButton({ roomId }: CopyRoomLinkButtonProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleCopyLink = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);

      setExpanded(true);
      setCopied(true);
      toast.success('Room link copied!', {
        description: `Share this link with your team to collaborate on room: ${roomId}`,
        duration: 3000,
      });

      // Reset to collapsed state after 2 seconds
      setTimeout(() => {
        setCopied(false);
        setExpanded(false);
      }, 2000);
    } catch (error) {
      toast.error('Failed to copy link', {
        description: 'Please try again or copy the URL from your browser',
      });
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="flex items-center gap-2 bg-[#252526] hover:bg-[#2A2D2E] border-[#3C3C3C] text-gray-400 hover:text-white transition-colors group overflow-hidden"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                <AnimatePresence mode="wait">
                  {expanded && (
                    <motion.span
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 'auto', opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="text-green-400 whitespace-nowrap overflow-hidden"
                    >
                      Copied!
                    </motion.span>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <>
                <Link2 className="w-4 h-4 flex-shrink-0" />
                <AnimatePresence mode="wait">
                  {expanded && (
                    <motion.span
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 'auto', opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="whitespace-nowrap overflow-hidden"
                    >
                      Copy Link
                    </motion.span>
                  )}
                </AnimatePresence>
              </>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Copy room link to clipboard</p>
          <p className="text-xs text-gray-400">Share with your team</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
