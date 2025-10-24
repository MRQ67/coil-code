"use client";

import React from "react";
import dynamic from "next/dynamic";

const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-full items-center justify-center bg-gray-900">
      <div className="text-center">
        <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
        <p className="text-lg text-gray-300">Loading Editor...</p>
      </div>
    </div>
  ),
});

export default function SimplePage() {
  return (
    <div className="h-screen w-full bg-gray-900">
      <div className="flex h-16 items-center justify-between border-b border-gray-700 bg-gray-800 px-6">
        <h1 className="text-lg font-semibold text-white">Simple Editor Test</h1>
        <a
          href="/"
          className="rounded-lg bg-gray-700 px-4 py-2 text-sm text-white transition-colors hover:bg-gray-600"
        >
          Back to Home
        </a>
      </div>
      <div className="h-[calc(100vh-4rem)]">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          defaultValue="// Type here to test Monaco Editor\nfunction hello() {\n  return 'Hello World!';\n}"
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            automaticLayout: true,
            scrollBeyondLastLine: false,
            wordWrap: "on",
            lineNumbers: "on",
          }}
        />
      </div>
    </div>
  );
}
