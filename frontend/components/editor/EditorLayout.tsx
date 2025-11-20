'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import * as Y from 'yjs';
import type YPartyKitProvider from 'y-partykit/provider';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import FileTree from './FileTree';
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
}

const EditorLayout = ({ 
  ydoc, 
  provider, 
  username, 
  gender,
  initialHtmlContent = '',
  initialCssContent = '',
  initialJsContent = ''
}: EditorLayoutProps) => {
  const [activeFile, setActiveFile] = useState<'html' | 'css' | 'js'>('html');
  const [isFileTreeOpen, setIsFileTreeOpen] = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(true);

  // NOTE: Content initialization is handled in page.tsx to avoid duplication
  // Do not initialize content here to prevent race conditions with PartyKit sync

  // Get current content
  const getHtmlContent = () => ydoc.getText('html').toString();
  const getCssContent = () => ydoc.getText('css').toString();
  const getJsContent = () => ydoc.getText('js').toString();

  return (
    <div className="flex flex-col h-full bg-[#1E1E1E] text-[#CCCCCC]">
      {/* Main Content Area with Resizable Panels */}
      <div className="flex flex-1 overflow-hidden">
        <PanelGroup direction="horizontal" autoSaveId="coil-code-layout">
          {/* File Tree Panel */}
          <Panel
            defaultSize={15}
            minSize={10}
            maxSize={30}
            collapsible={true}
            onCollapse={() => setIsFileTreeOpen(false)}
            onExpand={() => setIsFileTreeOpen(true)}
          >
            <FileTree
              activeFile={activeFile}
              onFileSelect={(fileType: string) => {
                if (fileType === 'html' || fileType === 'css' || fileType === 'js') {
                  setActiveFile(fileType);
                }
              }}
              isCollapsed={!isFileTreeOpen}
              onToggleCollapse={() => setIsFileTreeOpen(!isFileTreeOpen)}
            />
          </Panel>

          {/* Drag Handle - Aceternity Style */}
          <PanelResizeHandle className="w-1 bg-[#3C3C3C] hover:bg-blue-500 transition-colors duration-200 relative group">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-12 rounded-full bg-blue-500/0 group-hover:bg-blue-500 transition-all duration-200" />
          </PanelResizeHandle>

          {/* Editor Panel */}
          <Panel
            defaultSize={45}
            minSize={30}
          >
            <div className="flex flex-col h-full border-r border-[#3C3C3C]">
              <MultiFileEditor
                ydoc={ydoc}
                provider={provider}
                username={username}
                gender={gender}
                activeFile={activeFile}
                onActiveFileChange={setActiveFile}
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
            />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
};

export default EditorLayout;