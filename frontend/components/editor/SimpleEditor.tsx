"use client";

import React, { useEffect, useRef, useState } from "react";
import * as Y from "yjs";
import type YPartyKitProvider from "y-partykit/provider";

interface SimpleEditorProps {
  ydoc: Y.Doc;
  ytext: Y.Text;
  provider: YPartyKitProvider;
}

export default function SimpleEditor({
  ytext,
  provider,
}: SimpleEditorProps) {
  const [content, setContent] = useState("");
  const [isSyncing, setIsSyncing] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isUpdatingRef = useRef(false);

  useEffect(() => {
    // Initial sync from Yjs
    const initialContent = ytext.toString();
    setContent(initialContent);

    // Listen to Yjs changes
    const updateFromYjs = () => {
      if (!isUpdatingRef.current) {
        const newContent = ytext.toString();
        setContent(newContent);
      }
    };

    ytext.observe(updateFromYjs);

    // Mark as synced after initial load
    setTimeout(() => setIsSyncing(false), 500);

    return () => {
      ytext.unobserve(updateFromYjs);
    };
  }, [ytext]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);

    // Update Yjs document
    isUpdatingRef.current = true;

    try {
      ytext.delete(0, ytext.length);
      ytext.insert(0, newContent);
    } catch (error) {
      console.error("Error updating Yjs:", error);
    } finally {
      isUpdatingRef.current = false;
    }
  };

  return (
    <div className="relative h-full w-full bg-gray-900">
      {isSyncing && (
        <div className="absolute right-4 top-4 z-10 rounded-lg bg-blue-600/20 border border-blue-500/50 px-3 py-1 text-xs text-blue-400">
          Syncing...
        </div>
      )}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleChange}
        className="h-full w-full resize-none bg-gray-900 p-4 font-mono text-sm leading-relaxed text-gray-100 placeholder-gray-600 focus:outline-none"
        placeholder="Start typing here... (Simple text editor - Monaco failed to load)"
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
      />
      <div className="absolute bottom-2 right-2 rounded bg-gray-800/80 px-2 py-1 text-xs text-gray-500">
        {content.length} characters
      </div>
    </div>
  );
}
