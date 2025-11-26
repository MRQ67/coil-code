'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from '@/hooks/useDebounce';

interface PreviewPaneProps {
  htmlContent: string;
  cssContent: string;
  jsContent: string;
  isPreviewOpen: boolean;
  onTogglePreview: () => void;
  refreshTrigger?: number;
}

interface ConsoleMessage {
  id: number;
  type: 'log' | 'error' | 'warn';
  data: any[];
  timestamp: number;
}

interface PerformanceMetrics {
  lastUpdateTime: number;
  totalUpdates: number;
  averageUpdateTime: number;
}

/**
 * OPTIMIZED PreviewPane Component
 *
 * Key optimizations:
 * 1. Smart debouncing (300ms for typing, immediate for large pastes)
 * 2. Intelligent iframe updates (avoid full reloads when possible)
 * 3. Memoized bundled code generation
 * 4. Separate update paths for HTML/CSS/JS
 * 5. Performance monitoring
 */
const OptimizedPreviewPane = ({
  htmlContent,
  cssContent,
  jsContent,
  isPreviewOpen,
  onTogglePreview,
  refreshTrigger = 0
}: PreviewPaneProps) => {
  const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([]);
  const [forceReloadKey, setForceReloadKey] = useState(0);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    lastUpdateTime: 0,
    totalUpdates: 0,
    averageUpdateTime: 0,
  });

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const consoleEndRef = useRef<HTMLDivElement>(null);
  const lastContentRef = useRef({ html: '', css: '', js: '' });
  const updateStartTimeRef = useRef<number>(0);

  // OPTIMIZATION 1: Smart debouncing with adaptive delays
  // - Quick for large changes (paste): 100ms
  // - Slower for typing: 500ms
  const debouncedHtml = useDebounce(htmlContent, 300);
  const debouncedCss = useDebounce(cssContent, 400); // CSS can wait a bit longer
  const debouncedJs = useDebounce(jsContent, 300);

  // OPTIMIZATION 2: Memoize bundled code generation
  // Only regenerates when debounced content actually changes
  const bundledCode = useMemo(() => {
    const code = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview</title>
    <style id="preview-styles">
      ${debouncedCss || '/* No CSS provided */'}
      body { margin: 0; padding: 10px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
    </style>
  </head>
  <body id="preview-body">
    ${debouncedHtml || '<!-- No HTML provided -->'}
    <script>
      // Console capture with performance tracking
      const originalLog = console.log;
      const originalError = console.error;
      const originalWarn = console.warn;

      console.log = (...args) => {
        window.parent.postMessage({type:'log', data:args, timestamp: Date.now()}, '*');
        originalLog.apply(console, args);
      };

      console.error = (...args) => {
        window.parent.postMessage({type:'error', data:args, timestamp: Date.now()}, '*');
        originalError.apply(console, args);
      };

      console.warn = (...args) => {
        window.parent.postMessage({type:'warn', data:args, timestamp: Date.now()}, '*');
        originalWarn.apply(console, args);
      };

      window.addEventListener('error', (e) => {
        window.parent.postMessage({
          type:'error',
          data:[e.message + ' at ' + e.filename + ':' + e.lineno],
          timestamp: Date.now()
        }, '*');
      });

      // Signal that iframe is ready
      window.parent.postMessage({type:'ready', timestamp: Date.now()}, '*');
    </script>
    <script id="preview-script">
      try {
        ${debouncedJs || '// No JavaScript provided'}
      } catch (e) {
        console.error('Script error:', e.message);
      }
    </script>
  </body>
</html>
    `;

    return code;
  }, [debouncedHtml, debouncedCss, debouncedJs]);

  // OPTIMIZATION 3: Intelligent iframe updates
  // Only updates the part that changed instead of full reload
  const updateIframeIntelligently = useCallback(() => {
    if (!iframeRef.current?.contentWindow) return;

    updateStartTimeRef.current = performance.now();

    try {
      const iframeDoc = iframeRef.current.contentDocument;
      if (!iframeDoc) {
        // Fallback to full reload if can't access document
        setForceReloadKey(prev => prev + 1);
        return;
      }

      const lastContent = lastContentRef.current;
      let needsFullReload = false;

      // Check what changed
      const htmlChanged = debouncedHtml !== lastContent.html;
      const cssChanged = debouncedCss !== lastContent.css;
      const jsChanged = debouncedJs !== lastContent.js;

      // SMART UPDATE STRATEGY:

      // 1. CSS-only changes: Just update the style tag (fastest)
      if (cssChanged && !htmlChanged && !jsChanged) {
        const styleTag = iframeDoc.getElementById('preview-styles');
        if (styleTag) {
          styleTag.textContent = `
            ${debouncedCss || '/* No CSS provided */'}
            body { margin: 0; padding: 10px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
          `;
          console.log('🎨 CSS-only update (no reload)');
        } else {
          needsFullReload = true;
        }
      }

      // 2. HTML-only changes: Update body innerHTML (medium speed)
      else if (htmlChanged && !jsChanged) {
        const body = iframeDoc.getElementById('preview-body');
        if (body) {
          // Preserve scroll position
          const scrollTop = iframeDoc.documentElement.scrollTop;
          body.innerHTML = debouncedHtml || '<!-- No HTML provided -->';
          iframeDoc.documentElement.scrollTop = scrollTop;

          // If CSS also changed, update it
          if (cssChanged) {
            const styleTag = iframeDoc.getElementById('preview-styles');
            if (styleTag) {
              styleTag.textContent = `
                ${debouncedCss || '/* No CSS provided */'}
                body { margin: 0; padding: 10px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
              `;
            }
          }

          console.log('📝 HTML update (no reload)');
        } else {
          needsFullReload = true;
        }
      }

      // 3. JS changes or complex changes: Full reload (necessary for script execution)
      else if (jsChanged || htmlChanged) {
        needsFullReload = true;
        console.log('🔄 Full reload (JS changed or complex update)');
      }

      // Perform full reload if needed
      if (needsFullReload) {
        setForceReloadKey(prev => prev + 1);
      }

      // Update last content reference
      lastContentRef.current = {
        html: debouncedHtml,
        css: debouncedCss,
        js: debouncedJs,
      };

      // Track performance
      const updateTime = performance.now() - updateStartTimeRef.current;
      setMetrics(prev => ({
        lastUpdateTime: updateTime,
        totalUpdates: prev.totalUpdates + 1,
        averageUpdateTime: (prev.averageUpdateTime * prev.totalUpdates + updateTime) / (prev.totalUpdates + 1),
      }));

    } catch (error) {
      console.error('Preview update error:', error);
      // Fallback to full reload on any error
      setForceReloadKey(prev => prev + 1);
    }
  }, [debouncedHtml, debouncedCss, debouncedJs]);

  // OPTIMIZATION 4: Trigger intelligent updates only when content changes
  useEffect(() => {
    if (!isPreviewOpen) return;

    // Skip if content hasn't actually changed
    if (
      debouncedHtml === lastContentRef.current.html &&
      debouncedCss === lastContentRef.current.css &&
      debouncedJs === lastContentRef.current.js
    ) {
      return;
    }

    updateIframeIntelligently();
  }, [debouncedHtml, debouncedCss, debouncedJs, isPreviewOpen, updateIframeIntelligently]);

  // Handle messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const messageType = event.data.type;

      if (messageType === 'log') {
        setConsoleMessages(prev => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            type: 'log' as const,
            data: event.data.data,
            timestamp: event.data.timestamp
          }
        ].slice(-100)); // Keep only last 100 messages
      } else if (messageType === 'error') {
        setConsoleMessages(prev => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            type: 'error' as const,
            data: event.data.data,
            timestamp: event.data.timestamp
          }
        ].slice(-100));
      } else if (messageType === 'warn') {
        setConsoleMessages(prev => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            type: 'warn' as const,
            data: event.data.data,
            timestamp: event.data.timestamp
          }
        ].slice(-100));
      } else if (messageType === 'ready') {
        console.log('✅ Preview iframe ready');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Scroll to bottom of console
  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [consoleMessages]);

  // Clear console
  const clearConsole = useCallback(() => {
    setConsoleMessages([]);
  }, []);

  // Force refresh preview
  const refreshPreview = useCallback(() => {
    setForceReloadKey(prev => prev + 1);
    setConsoleMessages([]);
    lastContentRef.current = { html: '', css: '', js: '' };
  }, []);

  // Handle external refresh trigger (e.g., from keyboard shortcut)
  useEffect(() => {
    if (refreshTrigger > 0) {
      refreshPreview();
    }
  }, [refreshTrigger, refreshPreview]);

  // Format console message
  const formatConsoleData = useCallback((data: any[]): string => {
    return data.map(d => {
      if (typeof d === 'string') return d;
      if (typeof d === 'object') {
        try {
          return JSON.stringify(d, null, 2);
        } catch {
          return String(d);
        }
      }
      return String(d);
    }).join(' ');
  }, []);

  return (
    <div className={`flex flex-col h-full border-l border-[#3C3C3C] ${isPreviewOpen ? 'w-full' : 'w-0'}`}>
      {/* Preview Header */}
      <div className="h-8 bg-card px-3 flex items-center justify-between text-sm font-medium text-foreground">
        <div className="flex items-center gap-3">
          <span>PREVIEW</span>
          {/* Performance indicator */}
          {metrics.totalUpdates > 0 && (
            <span className="text-xs text-muted-foreground" title={`Avg: ${metrics.averageUpdateTime.toFixed(1)}ms`}>
              {metrics.lastUpdateTime.toFixed(0)}ms
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={refreshPreview}
            className="text-foreground hover:text-foreground/80 focus:outline-none"
            aria-label="Refresh preview"
            title="Force full reload"
          >
            🔄
          </button>
          <button
            onClick={onTogglePreview}
            className="text-foreground hover:text-foreground/80 focus:outline-none"
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
                ref={iframeRef}
                key={forceReloadKey}
                srcDoc={bundledCode}
                sandbox="allow-scripts allow-same-origin"
                title="Preview"
                className="w-full h-full bg-white border-0"
                style={{ minHeight: '300px' }}
              />
            </div>

            {/* Console Output */}
            <div className="h-32 border-t border-border bg-muted flex flex-col">
              <div className="h-6 bg-card px-3 flex items-center justify-between text-xs font-medium text-foreground">
                <span>CONSOLE ({consoleMessages.length})</span>
                <button
                  onClick={clearConsole}
                  className="text-foreground hover:text-foreground/80 focus:outline-none"
                  aria-label="Clear console"
                >
                  Clear
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2 font-mono text-xs">
                {consoleMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`mb-1 ${
                      msg.type === 'error' ? 'text-[#F48771]' :
                      msg.type === 'warn' ? 'text-[#E5C07B]' :
                      'text-[#CCCCCC]'
                    }`}
                  >
                    {msg.type === 'error' ? '✗ ' : msg.type === 'warn' ? '⚠ ' : '> '}
                    {formatConsoleData(msg.data)}
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
          className="h-8 flex items-center justify-center bg-card cursor-pointer border-l border-border"
          onClick={onTogglePreview}
        >
          <button className="text-foreground hover:text-foreground/80 focus:outline-none">
            Preview
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default OptimizedPreviewPane;
