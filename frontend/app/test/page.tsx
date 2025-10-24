"use client";

import React, { useEffect, useState } from "react";
import * as Y from "yjs";
import YPartyKitProvider from "y-partykit/provider";

export default function TestPage() {
  const [status, setStatus] = useState<string>("Initializing...");
  const [text, setText] = useState<string>("");
  const [connected, setConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ydoc: Y.Doc | null = null;
    let provider: YPartyKitProvider | null = null;
    let ytext: Y.Text | null = null;

    try {
      // Create Yjs document
      ydoc = new Y.Doc();
      ytext = ydoc.getText("content");

      // Defer state update to avoid cascading renders
      Promise.resolve().then(() => {
        setStatus("Connecting to PartyKit...");
      });

      // Create provider
      provider = new YPartyKitProvider("localhost:1999", "test-room", ydoc, {
        connect: true,
      });

      // Listen for connection events
      provider.on("status", (event: { status: string }) => {
        console.log("Provider status:", event.status);
        if (event.status === "connected") {
          setConnected(true);
          setStatus("Connected to PartyKit!");
        } else if (event.status === "disconnected") {
          setConnected(false);
          setStatus("Disconnected from PartyKit");
        }
      });

      provider.on("sync", (isSynced: boolean) => {
        console.log("Sync status:", isSynced);
        if (isSynced) {
          setStatus("Synced!");
        }
      });

      // Listen for text changes
      ytext.observe(() => {
        setText(ytext?.toString() || "");
      });

      // Set initial text
      setText(ytext.toString());
    } catch (err) {
      console.error("Error initializing:", err);
      Promise.resolve().then(() => {
        setError(err instanceof Error ? err.message : "Unknown error");
        setStatus("Error!");
      });
    }

    // Cleanup
    return () => {
      if (provider) {
        provider.disconnect();
        provider.destroy();
      }
      if (ydoc) {
        ydoc.destroy();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Yjs Connection Test</h1>

        <div className="space-y-4">
          {/* Status */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-2">Connection Status</h2>
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  connected ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span>{status}</span>
            </div>
            {error && <div className="mt-2 text-red-400">Error: {error}</div>}
          </div>

          {/* Document Content */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-2">Document Content</h2>
            <div className="bg-gray-900 rounded p-3 font-mono text-sm">
              {text || "(empty)"}
            </div>
            <p className="mt-2 text-sm text-gray-400">
              Length: {text.length} characters
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-2">Test Instructions</h2>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Make sure PartyKit server is running on port 1999</li>
              <li>Check if connection status shows &quot;Connected&quot;</li>
              <li>Open this page in another tab</li>
              <li>Open browser console and check for Yjs messages</li>
              <li>
                Check Network tab for WebSocket connection to
                ws://localhost:1999
              </li>
            </ol>
          </div>

          {/* Debug Info */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-2">Debug Info</h2>
            <div className="space-y-1 text-sm font-mono">
              <div>Room: test-room</div>
              <div>Host: localhost:1999</div>
              <div>Party: main (default)</div>
              <div>
                WebSocket URL: ws://localhost:1999/parties/main/test-room
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-4">
            <a
              href="/"
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
            >
              Back to Home
            </a>
            <a
              href="/editor/test-room"
              className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
            >
              Open in Editor
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
