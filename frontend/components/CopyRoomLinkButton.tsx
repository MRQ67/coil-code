'use client';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { Link2, Check } from 'lucide-react';
import { useState } from 'react';

interface CopyRoomLinkButtonProps {
  roomId: string;
}

export default function CopyRoomLinkButton({ roomId }: CopyRoomLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);

      setCopied(true);
      toast.success('Room link copied!', {
        description: `Share this link with your team to collaborate on room: ${roomId}`,
        duration: 3000,
      });

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
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
            className="flex items-center gap-2 bg-[#252526] hover:bg-[#2A2D2E] border-[#3C3C3C] text-gray-400 hover:text-white transition-all group"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-400" />
                <span className="hidden md:inline text-green-400">Copied!</span>
              </>
            ) : (
              <>
                <Link2 className="w-4 h-4" />
                <span className="hidden md:inline">Copy Link</span>
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
