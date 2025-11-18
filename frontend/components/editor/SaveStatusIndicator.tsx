'use client';

import React from 'react';
import type { SaveStatus } from '@/hooks/useAutoSave';

interface SaveStatusIndicatorProps {
  status: SaveStatus;
}

const SaveStatusIndicator: React.FC<SaveStatusIndicatorProps> = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'saving':
        return {
          text: 'Saving...',
          bgColor: 'bg-blue-500/20',
          textColor: 'text-blue-400',
          icon: (
            <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ),
        };
      case 'saved':
        return {
          text: 'All changes saved',
          bgColor: 'bg-green-500/20',
          textColor: 'text-green-400',
          icon: (
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ),
        };
      case 'error':
        return {
          text: 'Save failed',
          bgColor: 'bg-red-500/20',
          textColor: 'text-red-400',
          icon: (
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ),
        };
      case 'idle':
      default:
        return null;
    }
  };

  const config = getStatusConfig();

  if (!config) return null;

  return (
    <div className={`flex items-center gap-2 rounded-full ${config.bgColor} px-3 py-1 text-sm ${config.textColor} transition-all duration-200`}>
      {config.icon}
      <span>{config.text}</span>
    </div>
  );
};

export default SaveStatusIndicator;
