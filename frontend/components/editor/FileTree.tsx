'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TreeProvider,
  TreeView,
  TreeNode,
  TreeNodeTrigger,
  TreeExpander,
  TreeIcon,
  TreeLabel,
  TreeNodeContent
} from '@/components/kibo-ui/tree';

interface FileType {
  id: string;
  name: string;
  type: 'file';
  icon: string;
}

interface FileTreeProps {
  activeFile: string;
  onFileSelect: (fileType: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const FileTree = ({ activeFile, onFileSelect, isCollapsed, onToggleCollapse }: FileTreeProps) => {
  const files: FileType[] = [
    { id: 'html', name: 'index.html', type: 'file', icon: '📄' },
    { id: 'css', name: 'style.css', type: 'file', icon: '📄' },
    { id: 'js', name: 'script.js', type: 'file', icon: '📄' },
  ];

  const handleSelection = (nodeId: string) => {
    onFileSelect(nodeId);
  };

  return (
    <div className="flex flex-col h-full bg-[#252526] border-r border-[#3C3C3C]">
      {/* File Tree Header */}
      <div className="flex items-center justify-between h-10 px-3 bg-[#2D2D30] text-sm font-medium text-[#CCCCCC]">
        <span>EXPLORER</span>
        <button 
          onClick={onToggleCollapse}
          className="text-[#CCCCCC] hover:text-white focus:outline-none"
          aria-label={isCollapsed ? "Expand file tree" : "Collapse file tree"}
        >
          {isCollapsed ? '◀' : '▶'}
        </button>
      </div>
      
      {/* File Tree Content */}
      {!isCollapsed && (
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: '250px' }}
          exit={{ width: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="w-[250px] overflow-hidden"
        >
          <TreeProvider
            defaultExpandedIds={['root']}
            showIcons={true}
            selectable={true}
            selectedIds={[activeFile]}
            onSelectionChange={(selectedIds) => {
              if (selectedIds.length > 0) {
                handleSelection(selectedIds[0]);
              }
            }}
          >
            <TreeView className="p-2">
              {files.map((file, index) => (
                <TreeNode 
                  key={file.id} 
                  nodeId={file.id}
                  level={0}
                  isLast={index === files.length - 1}
                >
                  <TreeNodeTrigger 
                    className={`px-2 py-1 text-sm rounded ${
                      activeFile === file.id 
                        ? 'bg-[#37373D] text-[#CCCCCC] border-l-2 border-[#007ACC]' 
                        : 'text-[#CCCCCC] hover:bg-[#2A2D2E]'
                    }`}
                  >
                    <TreeExpander />
                    <TreeIcon icon={<span>{file.icon}</span>} />
                    <TreeLabel>{file.name}</TreeLabel>
                  </TreeNodeTrigger>
                </TreeNode>
              ))}
            </TreeView>
          </TreeProvider>
        </motion.div>
      )}
      
      {/* Collapsed View */}
      {isCollapsed && (
        <motion.div
          initial={{ width: 250 }}
          animate={{ width: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="w-0 flex items-center justify-center"
        >
          <button 
            onClick={onToggleCollapse}
            className="text-[#CCCCCC] hover:text-white focus:outline-none w-full h-full flex items-center justify-center py-2"
            aria-label="Expand file tree"
          >
            ▶
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default FileTree;