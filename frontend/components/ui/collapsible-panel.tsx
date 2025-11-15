'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CollapsiblePanelProps {
  children: React.ReactNode;
  title: string;
  defaultOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
  headerRightContent?: React.ReactNode;
  className?: string;
}

const CollapsiblePanel: React.FC<CollapsiblePanelProps> = ({
  children,
  title,
  defaultOpen = true,
  onToggle,
  headerRightContent,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggleOpen = () => {
    const newOpenState = !isOpen;
    setIsOpen(newOpenState);
    if (onToggle) {
      onToggle(newOpenState);
    }
  };

  return (
    <div className={`flex flex-col border-l border-[#3C3C3C] ${className}`}>
      {/* Panel Header */}
      <div className="h-8 bg-[#2D2D30] px-3 flex items-center justify-between text-sm font-medium text-[#CCCCCC]">
        <span>{title}</span>
        <div className="flex items-center gap-2">
          {headerRightContent}
          <button
            onClick={toggleOpen}
            className="text-[#CCCCCC] hover:text-white focus:outline-none"
            aria-label={isOpen ? "Collapse panel" : "Expand panel"}
          >
            {isOpen ? '×' : '+'}
          </button>
        </div>
      </div>

      {/* Panel Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="flex-1 overflow-hidden"
          >
            <div className="h-full">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed Panel */}
      {!isOpen && (
        <motion.div
          initial={{ height: 'auto' }}
          animate={{ height: 32 }}
          exit={{ height: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="h-8 flex items-center justify-center bg-[#2D2D30] cursor-pointer"
          onClick={toggleOpen}
        >
          <button className="text-[#CCCCCC] hover:text-white focus:outline-none">
            {title}
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default CollapsiblePanel;