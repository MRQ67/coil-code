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
      import("@/lib/test-cursor-colors"),
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
            startContinuousColorEnforcement,
          },
          {
            fullCursorDiagnostics,
            quickColorCheck: quickColorCheckTest,
            watchCursorChanges,
            testColorAssignment,
            previewCursors,
            forceRefreshColors,
          },
        ]) => {
          // Create MonacoBinding - THIS IS CRITICAL FOR CURSORS
          // The MonacoBinding properly manages multi-user cursors via the awareness protocol
          // Each user's cursor position is tracked independently while sharing the same document
          bindingRef.current = new MonacoBinding(
            ytext,
            model,
            new Set([editor]),
            provider.awareness, // This enables cursor sync between users
          );

          // Add custom cursor position handling to prevent interference between users
          // when cursors are at the same position
          const handleCursorChange = (e: any) => {
            // Ensure that local cursor changes don't interfere with remote cursors
            if (provider.awareness && editor) {
              const selection = editor.getSelection();
              if (selection) {
                // Update only the local user's cursor position in awareness
                // This helps maintain independence between user cursors
                const localState = provider.awareness.getLocalState();
                if (localState) {
                  provider.awareness.setLocalStateField("cursor", {
                    ...localState.cursor,
                    position: {
                      lineNumber: selection.positionLineNumber,
                      column: selection.positionColumn,
                    },
                    selectionStart: {
                      lineNumber: selection.selectionStartLineNumber,
                      column: selection.selectionStartColumn,
                    },
                  });
                }
              }
            }
          };

          // Subscribe to cursor position changes
          const cursorChangeListener = editor.onDidChangeCursorPosition(handleCursorChange);

          // Cleanup function for cursor change listener
          const cleanupCursorListener = () => {
            cursorChangeListener?.dispose();
          };

          // Store reference to cleanup function
          if (!cursorCleanupRef.current) {
            cursorCleanupRef.current = cleanupCursorListener;
          } else {
            const oldCleanup = cursorCleanupRef.current;
            cursorCleanupRef.current = () => {
              oldCleanup();
              cleanupCursorListener();
            };
          }

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

            // Expose comprehensive test utilities
            (window as any).fullCursorDiagnostics = () =>
              fullCursorDiagnostics(provider);
            (window as any).quickColorCheckTest = () =>
              quickColorCheckTest(provider);
            (window as any).watchCursorChanges = () =>
              watchCursorChanges(provider);
            (window as any).testColorAssignment = testColorAssignment;
            (window as any).previewCursors = () => previewCursors(provider);
            (window as any).forceRefreshColors = () =>
              forceRefreshColors(provider);
            (window as any).startContinuousColors = () =>
              startContinuousColorEnforcement(provider);

            console.log("");
            console.log("🔧 ════════════════════════════════════════════");
            console.log("🔧 CURSOR COLOR DEBUG TOOLS");
            console.log("🔧 ════════════════════════════════════════════");
            console.log("");
            console.log("📊 DIAGNOSTICS:");
            console.log(
              "   fullCursorDiagnostics()   - Complete diagnostic report",
            );
            console.log("   quickColorCheckTest()     - Quick status check");
            console.log("   previewCursors()          - Visual preview");
            console.log("");
            console.log("🔧 FIXING:");
            console.log("   applyCursorColorsNow()    - Apply colors now");
            console.log(
              "   forceRefreshColors()      - Force refresh (aggressive)",
            );
            console.log(
              "   startContinuousColors()   - Nuclear option (100ms loop)",
            );
            console.log("");
            console.log("👁️  MONITORING:");
            console.log("   watchCursorChanges()      - Watch in real-time");
            console.log("");
            console.log("🧪 TESTING:");
            console.log("   testColorAssignment()     - Test color algorithm");
            console.log("   debugCursors()            - Legacy diagnostic");
            console.log(
              "   debugCursorColors()       - Color application debug",
            );
            console.log("   testCursorCSS()           - CSS styling test");
            console.log("");
            console.log("📋 COLOR MANAGEMENT:");
            console.log("   debugColorAssignments()   - Show assignments");
            console.log("   clearRoomColors()         - Clear & reassign");
            console.log("");
            console.log("🔧 ════════════════════════════════════════════");
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

          // ===================================================
          // AGGRESSIVE CURSOR COLOR APPLICATION SYSTEM
          // ===================================================

          /**
           * Comprehensive cursor color application function
           * Reads from awareness and directly injects styles into DOM
           */
          const applyCursorColors = () => {
            if (!provider?.awareness) return;

            const states = provider.awareness.getStates();
            const localClientId = provider.awareness.clientID;

            // Build color map from awareness
            const colorMap = new Map<number, { color: string; name: string }>();
            states.forEach((state: any, clientId: number) => {
              if (clientId !== localClientId && state.user?.color) {
                colorMap.set(clientId, {
                  color: state.user.color,
                  name: state.user.name || state.user.username || "User",
                });
              }
            });

            if (colorMap.size === 0) {
              // No remote users yet
              return;
            }

            console.log(
              `🎨 Applying colors for ${colorMap.size} remote user(s)`,
            );

            // Find all cursor elements
            const allCursors = document.querySelectorAll(".yRemoteSelection");
            const cursorHeads = document.querySelectorAll(
              ".yRemoteSelectionHead",
            );
            const selectionBoxes = document.querySelectorAll(
              ".yRemoteSelectionBox",
            );

            console.log(
              `🔍 DOM elements found: ${cursorHeads.length} cursor heads, ${selectionBoxes.length} selection boxes`,
            );

            if (cursorHeads.length === 0) {
              console.log("⏳ No cursor elements in DOM yet");
              return;
            }

            // Strategy 1: Try to match by data-clientid attribute
            let appliedCount = 0;
            colorMap.forEach((userData, clientId) => {
              const selector = `.yRemoteSelection[data-clientid="${clientId}"]`;
              const cursorElement = document.querySelector(selector);

              if (cursorElement) {
                const head = cursorElement.querySelector(
                  ".yRemoteSelectionHead",
                ) as HTMLElement;
                const boxes = cursorElement.querySelectorAll(
                  ".yRemoteSelectionBox",
                );

                if (head) {
                  head.style.backgroundColor = userData.color;
                  head.style.setProperty("--cursor-bg-color", userData.color);
                  head.setAttribute("data-name", userData.name);
                  appliedCount++;
                  console.log(
                    `✅ Applied ${userData.color} to ${userData.name}'s cursor (via data-clientid)`,
                  );
                }

                boxes.forEach((box) => {
                  (box as HTMLElement).style.backgroundColor = userData.color;
                });
              }
            });

            // Strategy 2: Match by data-name attribute (fallback)
            if (appliedCount === 0) {
              console.log("📋 Trying name-based matching...");

              cursorHeads.forEach((head) => {
                const htmlHead = head as HTMLElement;
                const dataName = htmlHead.getAttribute("data-name");

                if (dataName && dataName !== "null") {
                  // Find user with matching name
                  colorMap.forEach((userData) => {
                    if (userData.name === dataName) {
                      htmlHead.style.backgroundColor = userData.color;
                      htmlHead.style.setProperty(
                        "--cursor-bg-color",
                        userData.color,
                      );
                      appliedCount++;
                      console.log(
                        `✅ Applied ${userData.color} to ${userData.name}'s cursor (via name match)`,
                      );
                    }
                  });
                }
              });
            }

            // Strategy 3: Sequential assignment (if we have equal counts)
            if (appliedCount === 0 && cursorHeads.length === colorMap.size) {
              console.log("🔢 Using sequential color assignment...");

              const colorArray = Array.from(colorMap.values());
              cursorHeads.forEach((head, index) => {
                const htmlHead = head as HTMLElement;
                const userData = colorArray[index];

                if (userData) {
                  htmlHead.style.backgroundColor = userData.color;
                  htmlHead.style.setProperty(
                    "--cursor-bg-color",
                    userData.color,
                  );
                  htmlHead.setAttribute("data-name", userData.name);
                  appliedCount++;
                  console.log(
                    `✅ Applied ${userData.color} to cursor ${index + 1} (sequential)`,
                  );
                }
              });
            }

            // Strategy 4: Apply first available color to uncolored cursors
            if (appliedCount === 0 && colorMap.size > 0) {
              console.log(
                "🎲 Applying first available color to all cursors...",
              );

              const firstUser = Array.from(colorMap.values())[0];
              cursorHeads.forEach((head) => {
                const htmlHead = head as HTMLElement;
                htmlHead.style.backgroundColor = firstUser.color;
                htmlHead.style.setProperty(
                  "--cursor-bg-color",
                  firstUser.color,
                );
                htmlHead.setAttribute("data-name", firstUser.name);
                appliedCount++;
              });
              console.log(`✅ Applied fallback color ${firstUser.color}`);
            }

            // Always apply colors to selection boxes
            const parent = document.querySelector(".monaco-editor");
            if (parent) {
              const boxes = parent.querySelectorAll(".yRemoteSelectionBox");
              boxes.forEach((box) => {
                const htmlBox = box as HTMLElement;
                const parentCursor = htmlBox.closest(".yRemoteSelection");
                const head = parentCursor?.querySelector(
                  ".yRemoteSelectionHead",
                ) as HTMLElement;

                if (head?.style.backgroundColor) {
                  htmlBox.style.backgroundColor = head.style.backgroundColor;
                  htmlBox.style.opacity = "0.25";
                }
              });
            }

            console.log(`🎨 Total colors applied: ${appliedCount}`);
          };

          // Apply colors with multiple timing strategies
          setTimeout(applyCursorColors, 50);
          setTimeout(applyCursorColors, 150);
          setTimeout(applyCursorColors, 300);
          setTimeout(applyCursorColors, 600);
          setTimeout(applyCursorColors, 1000);

          // Listen for awareness changes
          const awarenessChangeHandler = () => {
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
            setTimeout(applyCursorColors, 200);
            setTimeout(() => runForceApplyCursorColors(provider), 100);
          };

          provider.awareness.on("change", awarenessChangeHandler);

          // MutationObserver to watch for new cursor elements
          const editorDom = editor.getDomNode();
          let mutationObserver: MutationObserver | null = null;

          if (editorDom) {
            mutationObserver = new MutationObserver((mutations) => {
              let hasNewCursors = false;

              mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                  if (node instanceof HTMLElement) {
                    if (
                      node.classList.contains("yRemoteSelection") ||
                      node.classList.contains("yRemoteSelectionHead") ||
                      node.querySelector(".yRemoteSelection") ||
                      node.querySelector(".yRemoteSelectionHead")
                    ) {
                      hasNewCursors = true;
                    }
                  }
                });
              });

              if (hasNewCursors) {
                console.log("🆕 New cursor elements detected in DOM");
                setTimeout(applyCursorColors, 30);
                setTimeout(applyCursorColors, 100);
              }
            });

            mutationObserver.observe(editorDom, {
              childList: true,
              subtree: true,
              attributes: true,
              attributeFilter: ["class", "style", "data-name"],
            });

            console.log("👁️ MutationObserver active on Monaco editor");
          }

          // Periodic color enforcement (every 2 seconds)
          const colorCheckInterval = setInterval(() => {
            applyCursorColors();
          }, 2000);

          // Store cleanup function
          const cleanupColorSystem = () => {
            provider.awareness.off("change", awarenessChangeHandler);
            if (mutationObserver) {
              mutationObserver.disconnect();
            }
            clearInterval(colorCheckInterval);
            console.log("🧹 Cursor color system cleaned up");
          };

          // Store in ref for cleanup
          if (!cursorCleanupRef.current) {
            cursorCleanupRef.current = cleanupColorSystem;
          } else {
            const oldCleanup = cursorCleanupRef.current;
            cursorCleanupRef.current = () => {
              oldCleanup();
              cleanupColorSystem();
            };
          }

          // Expose color application function globally
          if (typeof window !== "undefined") {
            (window as any).applyCursorColorsNow = applyCursorColors;
            console.log("   applyCursorColorsNow()    - Apply colors NOW");
          }

          // Initialize cursor styling system
          initializeCursorStyling(provider);

          // Optional: Enable continuous enforcement (nuclear option)
          // Uncomment the lines below if colors still don't stick
          // const editorNode = editor.getDomNode?.();
          // if (editorNode) {
          //   setupCursorColorEnforcement(provider, editorNode as HTMLElement);
          // }
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
