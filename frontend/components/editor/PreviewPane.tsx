'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PreviewPaneProps {
  htmlContent: string;
  cssContent: string;
  jsContent: string;
  isPreviewOpen: boolean;
  onTogglePreview: () => void;
}

interface ConsoleMessage {
  id: number;
  type: 'log' | 'error';
  data: any[];
}

const PreviewPane = ({ 
  htmlContent, 
  cssContent, 
  jsContent, 
  isPreviewOpen, 
  onTogglePreview 
}: PreviewPaneProps) => {
  const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([]);
  const [iframeKey, setIframeKey] = useState(0); // For force refresh
  const consoleEndRef = useRef<HTMLDivElement>(null);
  
  // Debounced preview update
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIframeKey(prev => prev + 1); // Force iframe reload
    }, 500);
    
    return () => clearTimeout(timeout);
  }, [htmlContent, cssContent, jsContent]);

  // Handle messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'log') {
        setConsoleMessages(prev => [
          ...prev, 
          { id: Date.now(), type: 'log', data: event.data.data }
        ]);
      } else if (event.data.type === 'error') {
        setConsoleMessages(prev => [
          ...prev, 
          { id: Date.now(), type: 'error', data: [event.data.message] }
        ]);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Scroll to bottom of console
  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [consoleMessages]);

  // Generate bundled code
  const bundledCode = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Preview</title>
        <style>
          ${cssContent || '/* No CSS provided */'}
          body { margin: 0; padding: 10px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
        </style>
      </head>
      <body>
        ${htmlContent || '<!-- No HTML provided -->'}
        <script>
          // Console capture
          const originalLog = console.log;
          const originalError = console.error;
          
          console.log = (...args) => {
            window.parent.postMessage({type:'log', data:args}, '*');
            originalLog.apply(console, args);
          };
          
          console.error = (...args) => {
            window.parent.postMessage({type:'error', message:args.join(' ')}, '*');
            originalError.apply(console, args);
          };
          
          window.addEventListener('error', (e) => {
            window.parent.postMessage({type:'error', message:e.message}, '*');
          });
        </script>
        <script>
          ${jsContent || '// No JavaScript provided'}
        </script>
      </body>
    </html>
  `;

  // Clear console
  const clearConsole = () => {
    setConsoleMessages([]);
  };

  // Force refresh preview
  const refreshPreview = () => {
    setIframeKey(prev => prev + 1);
  };

  return (
    <div className={`flex flex-col h-full border-l border-[#3C3C3C] ${isPreviewOpen ? 'w-full' : 'w-0'}`}>
      {/* Preview Header */}
      <div className="h-8 bg-[#2D2D30] px-3 flex items-center justify-between text-sm font-medium text-[#CCCCCC]">
        <span>PREVIEW</span>
        <div className="flex gap-2">
          <button 
            onClick={refreshPreview}
            className="text-[#CCCCCC] hover:text-white focus:outline-none"
            aria-label="Refresh preview"
          >
            🔄
          </button>
          <button 
            onClick={onTogglePreview}
            className="text-[#CCCCCC] hover:text-white focus:outline-none"
            aria-label={isPreviewOpen ? "Collapse preview" : "Expand preview"}
          >
            ×
          </button>
        </div>
      </div>
      
      {/* Preview Content */}
      <AnimatePresence>
        {isPreviewOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {/* Iframe Preview */}
            <div className="flex-1 min-h-0">
              <iframe
                key={iframeKey} // Force reload when key changes
                srcDoc={bundledCode}
                sandbox="allow-scripts allow-same-origin"
                title="Preview"
                className="w-full h-full bg-white border-0"
                style={{ minHeight: '300px' }}
              />
            </div>
            
            {/* Console Output */}
            <div className="h-32 border-t border-[#3C3C3C] bg-[#1E1E1E] flex flex-col">
              <div className="h-6 bg-[#2D2D30] px-3 flex items-center justify-between text-xs font-medium text-[#CCCCCC]">
                <span>CONSOLE</span>
                <button 
                  onClick={clearConsole}
                  className="text-[#CCCCCC] hover:text-white focus:outline-none"
                  aria-label="Clear console"
                >
                  Clear
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2 font-mono text-xs">
                {consoleMessages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`mb-1 ${msg.type === 'error' ? 'text-[#F48771]' : 'text-[#CCCCCC]'}`}
                  >
                    {msg.type === 'error' ? '✗ ' : '> '}
                    {msg.data.map((d, i) => (
                      <React.Fragment key={i}>
                        {typeof d === 'string' ? d : JSON.stringify(d)}
                        {i < msg.data.length - 1 ? ' ' : ''}
                      </React.Fragment>
                    ))}
                  </div>
                ))}
                {consoleMessages.length === 0 && (
                  <div className="text-[#6E6E6E] italic">No console output</div>
                )}
                <div ref={consoleEndRef} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Collapsed Preview */}
      {!isPreviewOpen && (
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: 32 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="h-8 flex items-center justify-center bg-[#2D2D30] cursor-pointer"
          onClick={onTogglePreview}
        >
          <button className="text-[#CCCCCC] hover:text-white focus:outline-none">
            Preview
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default PreviewPane;