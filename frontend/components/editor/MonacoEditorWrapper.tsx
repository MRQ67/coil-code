'use client';

import React from 'react';
import Editor from '@monaco-editor/react';
import '@/lib/monaco-setup';

interface MonacoEditorWrapperProps {
  onMount: (editor: any, monaco: any) => void;
  language: string;
  value?: string;
  onChange?: (value: string | undefined) => void;
  theme?: string;
  options?: any;
  height?: string;
}

const MonacoEditorWrapper: React.FC<MonacoEditorWrapperProps> = ({
  onMount,
  language,
  value,
  onChange,
  theme = 'vs-dark',
  options = {},
  height = '100%'
}) => {
  const handleEditorDidMount = (editor: any, monaco: any) => {
    onMount(editor, monaco);
  };

  return (
    <Editor
      height={height}
      language={language}
      value={value}
      onChange={onChange}
      theme={theme}
      onMount={handleEditorDidMount}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        automaticLayout: true,
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        lineNumbers: 'on',
        renderWhitespace: 'selection',
        tabSize: 2,
        padding: { top: 8, bottom: 8 },
        scrollbar: {
          vertical: 'auto',
          horizontal: 'auto',
        },
        ...options
      }}
    />
  );
};

export default MonacoEditorWrapper;