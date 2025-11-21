'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Kbd } from '@/components/ui/kbd';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Keyboard } from 'lucide-react';

interface Shortcut {
  keys: string[];
  description: string;
}

interface ShortcutCategory {
  category: string;
  items: Shortcut[];
}

export default function KeyboardShortcutsModal() {
  const [isOpen, setIsOpen] = useState(false);

  // Listen for Ctrl+/ to toggle modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const shortcuts: ShortcutCategory[] = [
    {
      category: 'File',
      items: [
        { keys: ['Ctrl', 'S'], description: 'Save file' },
        { keys: ['Ctrl', 'P'], description: 'Quick file switcher' },
      ],
    },
    {
      category: 'Editor',
      items: [
        { keys: ['Ctrl', 'B'], description: 'Toggle sidebar' },
        { keys: ['Ctrl', '/'], description: 'Toggle line comment' },
        { keys: ['Ctrl', 'F'], description: 'Find in file' },
        { keys: ['Ctrl', 'H'], description: 'Find and replace' },
        { keys: ['Alt', '↑'], description: 'Move line up' },
        { keys: ['Alt', '↓'], description: 'Move line down' },
      ],
    },
    {
      category: 'Preview',
      items: [
        { keys: ['Ctrl', 'Shift', 'P'], description: 'Toggle preview' },
        { keys: ['Ctrl', 'R'], description: 'Refresh preview' },
      ],
    },
    {
      category: 'View',
      items: [
        { keys: ['Ctrl', '`'], description: 'Toggle console' },
        { keys: ['F11'], description: 'Fullscreen mode' },
        { keys: ['Ctrl', '+'], description: 'Zoom in' },
        { keys: ['Ctrl', '-'], description: 'Zoom out' },
      ],
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 bg-[#DFD0B8] hover:bg-[#d0c1a9] dark:bg-[#DFD0B8] dark:hover:bg-[#d0c1a9] border-transparent text-[#222831] hover:text-[#222831] dark:text-[#222831] dark:hover:text-[#222831]"
              >
                <Keyboard className="w-4 h-4" />
                <span className="hidden md:inline">Shortcuts</span>
                <Kbd className="hidden md:inline-flex bg-white/20 border-black/10 text-[#222831]">Ctrl /</Kbd>
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Keyboard Shortcuts</p>
            <p className="text-xs text-gray-400">Press Ctrl+/ anytime</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-[#1E1E1E] border-[#3C3C3C] text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <Keyboard className="w-6 h-6 text-blue-400" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Speed up your workflow with these shortcuts
          </DialogDescription>
        </DialogHeader>

        {/* Shortcuts Grid */}
        <div className="grid md:grid-cols-2 gap-6 mt-4">
          {shortcuts.map((category) => (
            <div key={category.category} className="space-y-3">
              {/* Category Header */}
              <Badge
                variant="outline"
                className="text-blue-400 border-blue-400/30 bg-blue-400/10 font-semibold"
              >
                {category.category}
              </Badge>

              {/* Shortcuts List */}
              <div className="space-y-2">
                {category.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-[#252526] hover:bg-[#2A2D2E] rounded-lg transition-colors group"
                  >
                    <span className="text-sm text-gray-300">
                      {item.description}
                    </span>
                    <div className="flex gap-1">
                      {item.keys.map((key, i) => (
                        <Kbd
                          key={i}
                          className="group-hover:border-blue-500/50 transition-colors"
                        >
                          {key}
                        </Kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Tip */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-sm text-blue-300 flex items-center gap-2">
            <span className="text-base">💡</span>
            <strong>Pro tip:</strong>
            <span>Press</span>
            <Kbd className="bg-[#1E1E1E] border-blue-500/30">Ctrl /</Kbd>
            <span>anytime to toggle this menu</span>
          </p>
        </div>

        {/* Quick Reference */}
        <div className="mt-4 pt-4 border-t border-[#3C3C3C]">
          <p className="text-xs text-gray-500 text-center">
            Monaco Editor also supports standard VS Code shortcuts
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
