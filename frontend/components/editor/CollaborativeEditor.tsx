"use client";

import React, { useEffect, useRef } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import * as Y from "yjs";
import { MonacoBinding } from "y-monaco";
import type { editor } from "monaco-editor";
import type YPartyKitProvider from "y-partykit/provider";

interface CollaborativeEditorProps {
  ydoc: Y.Doc;
  ytext: Y.Text;
  provider: YPartyKitProvider;
}

export default function CollaborativeEditor({
  ytext,
  provider,
}: CollaborativeEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const bindingRef = useRef<MonacoBinding | null>(null);

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;

    // Create Monaco binding to sync editor with Yjs
    const model = editor.getModel();
    if (model) {
      try {
        bindingRef.current = new MonacoBinding(
          ytext,
          model,
          new Set([editor]),
          provider.awareness,
        );
      } catch (error) {
        console.error("Error creating Monaco binding:", error);
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (bindingRef.current) {
        try {
          bindingRef.current.destroy();
          bindingRef.current = null;
        } catch (error) {
          console.error("Error destroying Monaco binding:", error);
        }
      }
      editorRef.current = null;
    };
  }, []);

  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        defaultLanguage="javascript"
        theme="vs-dark"
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          automaticLayout: true,
          scrollBeyondLastLine: false,
          wordWrap: "on",
          lineNumbers: "on",
          renderWhitespace: "selection",
          tabSize: 2,
        }}
      />
    </div>
  );
}
