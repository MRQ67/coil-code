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
  username: string;
  gender: "boy" | "girl" | "random";
}

export default function CollaborativeEditor({
  ydoc,
  ytext,
  provider,
  username,
  gender,
}: CollaborativeEditorProps) {
  const [Editor, setEditor] = useState<React.ComponentType<any> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const editorRef = useRef<any>(null);
  const bindingRef = useRef<any>(null);
  const cursorCleanupRef = useRef<(() => void) | null>(null);

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

    const model = editor.getModel();
    if (!model) {
      console.error("❌ Editor model not available");
      return;
    }

    if (!provider.awareness) {
      console.error("❌ Provider awareness not available");
      return;
    }

    // Dynamically import y-monaco and debug tools (client-side only)
    Promise.all([
      import("y-monaco"),
      import("@/lib/cursor-style-manager"),
      import("@/lib/debug-cursors"),
      import("@/lib/force-cursor-colors"),
    ])
      .then(
        ([
          { MonacoBinding },
          { initializeCursorStyling },
          {
            debugCursors,
            quickCursorCheck,
            watchCursors,
            forceUpdateCursorColors,
            testCursorCSS,
          },
          {
            forceApplyCursorColors: runForceApplyCursorColors,
            debugCursorColors,
            setupCursorColorEnforcement,
          },
        ]) => {
          // Create MonacoBinding - THIS IS CRITICAL FOR CURSORS
          bindingRef.current = new MonacoBinding(
            ytext,
            model,
            new Set([editor]),
            provider.awareness, // This enables cursor sync
          );

          // Expose debug functions globally for console access
          if (typeof window !== "undefined") {
            (window as any).provider = provider;
            (window as any).debugCursors = () => debugCursors(provider);
            (window as any).quickCursorCheck = () => quickCursorCheck(provider);
            (window as any).watchCursors = () => watchCursors(provider);
            (window as any).forceUpdateCursorColors = forceUpdateCursorColors;
            (window as any).testCursorCSS = testCursorCSS;
            // Avoid potential global name collisions causing recursion
            (window as any).forceApplyCursorColors = () =>
              runForceApplyCursorColors(provider);
            (window as any).debugCursorColors = () =>
              debugCursorColors(provider);

            // Expose color assignment debugging
            (window as any).debugColorAssignments = () => {
              import("@/lib/ensure-unique-colors").then(
                ({ debugColorAssignments }) => {
                  const roomId =
                    window.location.pathname.split("/").pop() || "default";
                  debugColorAssignments(roomId);
                },
              );
            };
            (window as any).clearRoomColors = () => {
              import("@/lib/ensure-unique-colors").then(
                ({ clearRoomColors }) => {
                  const roomId =
                    window.location.pathname.split("/").pop() || "default";
                  clearRoomColors(roomId);
                  console.log(
                    "🎨 Room colors cleared! Refresh both tabs to reassign.",
                  );
                },
              );
            };
            // Clear any stale global to prevent accidental recursion
            try {
              delete (window as any).forceApplyCursorColors;
            } catch {}

            console.log("");
            console.log("🔧 DEBUG TOOLS AVAILABLE:");
            console.log("   debugCursors()            - Full diagnostic");
            console.log("   quickCursorCheck()        - Quick check");
            console.log("   watchCursors()            - Monitor changes");
            console.log("   forceUpdateCursorColors() - Force color update");
            console.log(
              "   applyCursorColorsNow()    - Force apply colors NOW",
            );
            console.log(
              "   debugCursorColors()       - Debug color application",
            );
            console.log("   testCursorCSS()           - Test cursor styling");
            console.log(
              "   debugColorAssignments()   - Show color assignments",
            );
            console.log(
              "   clearRoomColors()         - Clear all colors (refresh after)",
            );
            console.log("========================================");
            console.log("");
          }

          // CURSOR SYSTEM VERIFICATION LOGS
          const clientId = provider.awareness.clientID;
          const localState = provider.awareness.getLocalState();

          console.log("========================================");
          console.log("CURSOR SYSTEM INITIALIZED");
          console.log("========================================");
          console.log("✅ User:", username);
          console.log("✅ Gender:", gender);
          console.log("✅ Client ID:", clientId);
          console.log("✅ Color:", localState?.user?.color || "NOT SET");
          console.log("✅ Name:", localState?.user?.name || "NOT SET");
          console.log("✅ Awareness enabled:", !!provider.awareness);
          console.log("✅ MonacoBinding created");

          // Debug: Check all connected users
          const states = provider.awareness.getStates();
          console.log("📊 Total users in awareness:", states.size);
          states.forEach((state: any, id: number) => {
            console.log(`   User ${id}:`, {
              name: state.user?.name,
              color: state.user?.color,
            });
          });

          console.log("========================================");

          // Initialize cursor styling system
          cursorCleanupRef.current = initializeCursorStyling(provider);

          // Optional: set up automatic enforcement after binding
          const editorNode = editor.getDomNode?.();
          if (editorNode) {
            // If needed, uncomment to enforce colors automatically
            // setupCursorColorEnforcement(provider, editorNode as HTMLElement);
          }

          // Apply colors to cursor name tags
          const applyCursorColors = () => {
            const cursorHeads = editor
              .getDomNode()
              ?.querySelectorAll(".yRemoteSelectionHead");
            if (cursorHeads) {
              cursorHeads.forEach((head: Element) => {
                const bgColor = (head as HTMLElement).style.backgroundColor;
                if (bgColor) {
                  (head as HTMLElement).style.setProperty(
                    "--cursor-bg-color",
                    bgColor,
                  );
                }
              });
            }
          };

          // Apply colors initially and on changes
          setTimeout(applyCursorColors, 100);

          // Listen for awareness changes (other users' cursors)
          provider.awareness.on("change", () => {
            const states = provider.awareness.getStates();
            const remoteUsers = Array.from(states.entries())
              .filter(([id]) => id !== clientId)
              .map(([id, state]: [number, any]) => ({
                id,
                name: state.user?.name || state.user?.username || "Unknown",
                color: state.user?.color || "No color",
              }));

            if (remoteUsers.length > 0) {
              console.log(`👥 ${states.size} users connected:`);
              remoteUsers.forEach((user) => {
                console.log(`  - ${user.name} (${user.color})`);
              });
            }

            // Re-apply colors when awareness changes
            setTimeout(applyCursorColors, 50);
            setTimeout(() => runForceApplyCursorColors(provider), 100);
          });
        },
      )
      .catch((error) => {
        console.error("❌ Error loading Monaco binding:", error);
      });
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
      if (cursorCleanupRef.current) {
        try {
          cursorCleanupRef.current();
          cursorCleanupRef.current = null;
        } catch (error) {
          console.error("Error cleaning up cursor styling:", error);
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
