"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";
import * as Y from "yjs";
import type YPartyKitProvider from "y-partykit/provider";
import SimpleEditor from "./SimpleEditor";

interface CollaborativeEditorProps {
  ydoc: Y.Doc;
  ytext: Y.Text;
  provider: YPartyKitProvider;
}

export default function CollaborativeEditor({
  ydoc,
  ytext,
  provider,
}: CollaborativeEditorProps) {
  const [Editor, setEditor] = useState<React.ComponentType<any> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const editorRef = useRef<any>(null);
  const bindingRef = useRef<any>(null);

  // Load Monaco Editor dynamically
  useEffect(() => {
    let mounted = true;

    const loadMonaco = async () => {
      try {
        setIsLoading(true);
        const { default: MonacoEditor } = await import("@monaco-editor/react");

        if (mounted) {
          setEditor(() => MonacoEditor);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Failed to load Monaco Editor:", err);
        if (mounted) {
          setError("Failed to load editor. Please refresh the page.");
          setIsLoading(false);
        }
      }
    };

    loadMonaco();

    return () => {
      mounted = false;
    };
  }, []);

  // Handle editor mounting and create Yjs binding
  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;

    // Wait for provider to be ready
    setTimeout(() => {
      const model = editor.getModel();
      if (model && provider.awareness) {
        try {
          // Dynamically import MonacoBinding
          import("y-monaco")
            .then(({ MonacoBinding }) => {
              bindingRef.current = new MonacoBinding(
                ytext,
                model,
                new Set([editor]),
                provider.awareness,
              );
              console.log("✅ Monaco binding created successfully");
            })
            .catch((err) => {
              console.error("Failed to create Monaco binding:", err);
            });
        } catch (error) {
          console.error("Error creating Monaco binding:", error);
        }
      }
    }, 200);
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

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#1e1e1e]">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
          <p className="text-lg text-gray-300">Loading editor...</p>
          <p className="mt-2 text-sm text-gray-500">
            This may take a moment...
          </p>
        </div>
      </div>
    );
  }

  // Error state - use SimpleEditor as fallback
  if (error || !Editor) {
    console.warn("Monaco Editor failed to load, using simple fallback editor");
    return (
      <div className="h-full w-full">
        <div className="border-b border-yellow-500/50 bg-yellow-900/20 px-4 py-2 text-xs text-yellow-400">
          ⚠️ Monaco Editor failed to load. Using simple text editor. Your
          collaboration still works!
        </div>
        <div className="h-[calc(100%-36px)]">
          <SimpleEditor ydoc={ydoc} ytext={ytext} provider={provider} />
        </div>
      </div>
    );
  }

  // Render Monaco Editor
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
          padding: { top: 8, bottom: 8 },
          scrollbar: {
            vertical: "auto",
            horizontal: "auto",
          },
        }}
        loading={
          <div className="flex h-full w-full items-center justify-center bg-[#1e1e1e]">
            <div className="text-center">
              <div className="mb-2 inline-block h-8 w-8 animate-spin rounded-full border-2 border-solid border-blue-500 border-r-transparent"></div>
              <p className="text-sm text-gray-400">Initializing...</p>
            </div>
          </div>
        }
      />
    </div>
  );
}
