'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import * as Y from 'yjs';
import type YPartyKitProvider from 'y-partykit/provider';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { toast } from 'sonner';

// Dynamically import MultiFileEditor to avoid SSR issues with Monaco
const MultiFileEditor = dynamic(() => import('./MultiFileEditor'), { ssr: false });
import OptimizedPreviewPane from './OptimizedPreviewPane';

interface EditorLayoutProps {
  ydoc: Y.Doc;
  provider: YPartyKitProvider;
  username: string;
  gender: 'boy' | 'girl' | 'random';
  initialHtmlContent?: string;
  initialCssContent?: string;
  initialJsContent?: string;
  activeFile: 'html' | 'css' | 'js';
  onActiveFileChange: (file: 'html' | 'css' | 'js') => void;
}

const EditorLayout = ({
  ydoc,
  provider,
  username,
  gender,
  initialHtmlContent = '',
  initialCssContent = '',
  initialJsContent = '',
  activeFile,
  onActiveFileChange
}: EditorLayoutProps) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // NOTE: Content initialization is handled in page.tsx to avoid duplication
  // Do not initialize content here to prevent race conditions with PartyKit sync

  // Get current content
  const getHtmlContent = () => ydoc.getText('html').toString();
  const getCssContent = () => ydoc.getText('css').toString();
  const getJsContent = () => ydoc.getText('js').toString();

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Shift+P: Toggle preview panel
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        setIsPreviewOpen(prev => {
          const newState = !prev;
          toast.success(newState ? 'Preview opened' : 'Preview closed', {
            description: 'Press Ctrl+Shift+P to toggle',
            duration: 2000,
          });
          return newState;
        });
      }

      // Ctrl+R: Refresh preview (force reload)
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        setRefreshTrigger(prev => prev + 1);
        toast.success('Preview refreshed', {
          description: 'Force reloaded all content',
          duration: 2000,
        });
      }

      // Ctrl+P: Quick file switcher (cycle through HTML -> CSS -> JS)
      if ((e.ctrlKey || e.metaKey) && e.key === 'p' && !e.shiftKey) {
        e.preventDefault();
        // Cycle through files
        const files: Array<'html' | 'css' | 'js'> = ['html', 'css', 'js'];
        const currentIndex = files.indexOf(activeFile);
        const nextIndex = (currentIndex + 1) % files.length;
        const nextFile = files[nextIndex];
        
        onActiveFileChange(nextFile);
        
        toast.success(`Switched to ${nextFile.toUpperCase()}`, {
          description: 'Press Ctrl+P to cycle files',
          duration: 2000,
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeFile, onActiveFileChange]);

  return (
    <div className="flex flex-1 overflow-hidden h-full w-full">
      <PanelGroup direction="horizontal" autoSaveId="coil-code-layout">
        {/* Editor Panel */}
        <Panel
          defaultSize={60}
          minSize={30}
        >
          <div className="flex flex-col h-full border-r border-[#3C3C3C] relative">
            <MultiFileEditor
              ydoc={ydoc}
              provider={provider}
              username={username}
              gender={gender}
              activeFile={activeFile}
              onActiveFileChange={onActiveFileChange}
            />
          </div>
        </Panel>

        {/* Drag Handle */}
        <PanelResizeHandle className="w-1 bg-[#3C3C3C] hover:bg-blue-500 transition-colors duration-200 relative group">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-12 rounded-full bg-blue-500/0 group-hover:bg-blue-500 transition-all duration-200" />
        </PanelResizeHandle>

        {/* Preview Panel */}
        <Panel
          defaultSize={40}
          minSize={20}
          collapsible={true}
          onCollapse={() => setIsPreviewOpen(false)}
          onExpand={() => setIsPreviewOpen(true)}
        >
          <OptimizedPreviewPane
            htmlContent={getHtmlContent()}
            cssContent={getCssContent()}
            jsContent={getJsContent()}
            isPreviewOpen={isPreviewOpen}
            onTogglePreview={() => setIsPreviewOpen(!isPreviewOpen)}
            refreshTrigger={refreshTrigger}
          />
        </Panel>
      </PanelGroup>
    </div>
  );
};

export default EditorLayout;