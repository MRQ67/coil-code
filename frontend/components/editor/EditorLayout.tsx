'use client';

import React, { useState, useEffect } from 'react';
import * as Y from 'yjs';
import type YPartyKitProvider from 'y-partykit/provider';
import FileTree from './FileTree';
import MultiFileEditor from './MultiFileEditor';
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
  
  // Initialize content from ydoc if provided
  useEffect(() => {
    const yhtmlText = ydoc.getText('html');
    const ycssText = ydoc.getText('css');
    const yjsText = ydoc.getText('js');
    
    // Only set initial content if the texts are empty
    if (yhtmlText.length === 0 && initialHtmlContent) {
      yhtmlText.insert(0, initialHtmlContent);
    }
    if (ycssText.length === 0 && initialCssContent) {
      ycssText.insert(0, initialCssContent);
    }
    if (yjsText.length === 0 && initialJsContent) {
      yjsText.insert(0, initialJsContent);
    }
  }, [ydoc, initialHtmlContent, initialCssContent, initialJsContent]);

  // Get current content
  const getHtmlContent = () => ydoc.getText('html').toString();
  const getCssContent = () => ydoc.getText('css').toString();
  const getJsContent = () => ydoc.getText('js').toString();

  return (
    <div className="flex flex-col h-full bg-[#1E1E1E] text-[#CCCCCC]">
      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* File Tree Sidebar */}
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
        
        {/* Main Editor Area */}
        <div className={`${isFileTreeOpen ? 'w-[45%]' : 'w-[60%]'} flex flex-col border-r border-[#3C3C3C]`}>
          <MultiFileEditor
            ydoc={ydoc}
            provider={provider}
            username={username}
            gender={gender}
            activeFile={activeFile}
            onActiveFileChange={setActiveFile}
          />
        </div>
        
        {/* Preview Pane - OPTIMIZED */}
        <div className={`${isPreviewOpen ? 'w-[40%]' : 'w-0'} flex flex-col`}>
          <OptimizedPreviewPane
            htmlContent={getHtmlContent()}
            cssContent={getCssContent()}
            jsContent={getJsContent()}
            isPreviewOpen={isPreviewOpen}
            onTogglePreview={() => setIsPreviewOpen(!isPreviewOpen)}
          />
        </div>
      </div>
    </div>
  );
};

export default EditorLayout;