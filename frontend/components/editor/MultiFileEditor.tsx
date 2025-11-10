'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as Y from 'yjs';
import type YPartyKitProvider from 'y-partykit/provider';

interface MultiFileEditorProps {
  ydoc: Y.Doc;
  provider: YPartyKitProvider;
  username: string;
  gender: 'boy' | 'girl' | 'random';
  activeFile: 'html' | 'css' | 'js';
  onActiveFileChange: (fileType: 'html' | 'css' | 'js') => void;
}

const MultiFileEditor = ({ 
  ydoc, 
  provider, 
  username, 
  gender,
  activeFile,
  onActiveFileChange
}: MultiFileEditorProps) => {
  const [Editor, setEditor] = useState<React.ComponentType<any> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const editorRef = useRef<any>(null);
  const bindingRef = useRef<any>(null);
  const cursorCleanupRef = useRef<(() => void) | null>(null);
  
  // Create separate Yjs texts for each file
  const yhtmlText = ydoc.getText('html');
  const ycssText = ydoc.getText('css');
  const yjsText = ydoc.getText('js');
  
  // Create separate Monaco models for each file
  const htmlModelRef = useRef<any>(null);
  const cssModelRef = useRef<any>(null);
  const jsModelRef = useRef<any>(null);
  
  // Current active model
  const activeModelRef = useRef<any>(null);

  // File icons and names
  const fileConfig = {
    html: { name: 'index.html', icon: '📄', language: 'html' },
    css: { name: 'style.css', icon: '📄', language: 'css' },
    js: { name: 'script.js', icon: '📄', language: 'javascript' }
  };

  // Load Monaco Editor dynamically
  useEffect(() => {
    let mounted = true;

    const loadMonaco = async () => {
      try {
        setIsLoading(true);
        const { default: MonacoEditor } = await import('@monaco-editor/react');

        if (mounted) {
          setEditor(() => MonacoEditor);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to load Monaco Editor:', err);
        if (mounted) {
          setError('Failed to load editor. Please refresh the page.');
          setIsLoading(false);
        }
      }
    };

    loadMonaco();

    return () => {
      mounted = false;
    };
  }, []);

  // Initialize models when editor is ready
  useEffect(() => {
    if (!ydoc) return;

    // Create models for each file type
    Promise.all([
      import('monaco-editor'),
      import('y-monaco'),
    ]).then(([monaco, { MonacoBinding }]) => {
      // Create models only once
      if (!htmlModelRef.current) {
        htmlModelRef.current = monaco.editor.createModel('', 'html');
      }
      if (!cssModelRef.current) {
        cssModelRef.current = monaco.editor.createModel('', 'css');
      }
      if (!jsModelRef.current) {
        jsModelRef.current = monaco.editor.createModel('', 'javascript');
      }

      // Create Yjs bindings for each file
      const htmlBinding = new MonacoBinding(
        yhtmlText,
        htmlModelRef.current,
        new Set(),
        provider.awareness
      );
      
      const cssBinding = new MonacoBinding(
        ycssText,
        cssModelRef.current,
        new Set(),
        provider.awareness
      );
      
      const jsBinding = new MonacoBinding(
        yjsText,
        jsModelRef.current,
        new Set(),
        provider.awareness
      );

      // Store bindings
      bindingRef.current = {
        html: htmlBinding,
        css: cssBinding,
        js: jsBinding
      };
    });

    return () => {
      // Cleanup models
      if (htmlModelRef.current) {
        htmlModelRef.current.dispose();
        htmlModelRef.current = null;
      }
      if (cssModelRef.current) {
        cssModelRef.current.dispose();
        cssModelRef.current = null;
      }
      if (jsModelRef.current) {
        jsModelRef.current.dispose();
        jsModelRef.current = null;
      }
    };
  }, [ydoc]);

  // Handle editor mounting and switching models
  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;

    // Set initial active model based on activeFile
    switch (activeFile) {
      case 'html':
        activeModelRef.current = htmlModelRef.current;
        break;
      case 'css':
        activeModelRef.current = cssModelRef.current;
        break;
      case 'js':
        activeModelRef.current = jsModelRef.current;
        break;
    }

    if (activeModelRef.current) {
      editor.setModel(activeModelRef.current);
    }

    if (!provider.awareness) {
      console.error('❌ Provider awareness not available');
      return;
    }

    // Dynamically import cursor styling and debug tools
    Promise.all([
      import('@/lib/cursor-style-manager'),
      import('@/lib/debug-cursors'),
      import('@/lib/force-cursor-colors'),
      import('@/lib/test-cursor-colors'),
    ])
      .then(
        ([
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
          // Expose debug functions globally
          if (typeof window !== 'undefined') {
            (window as any).provider = provider;
            (window as any).debugCursors = () => debugCursors(provider);
            (window as any).quickCursorCheck = () => quickCursorCheck(provider);
            (window as any).watchCursors = () => watchCursors(provider);
            (window as any).forceUpdateCursorColors = forceUpdateCursorColors;
            (window as any).testCursorCSS = testCursorCSS;
            (window as any).forceApplyCursorColors = () =>
              runForceApplyCursorColors(provider);
            (window as any).debugCursorColors = () =>
              debugCursorColors(provider);

            // Expose color assignment debugging
            (window as any).debugColorAssignments = () => {
              import('@/lib/ensure-unique-colors').then(
                ({ debugColorAssignments }) => {
                  const roomId =
                    window.location.pathname.split('/').pop() || 'default';
                  debugColorAssignments(roomId);
                },
              );
            };
            (window as any).clearRoomColors = () => {
              import('@/lib/ensure-unique-colors').then(
                ({ clearRoomColors }) => {
                  const roomId =
                    window.location.pathname.split('/').pop() || 'default';
                  clearRoomColors(roomId);
                  console.log(
                    '🎨 Room colors cleared! Refresh both tabs to reassign.',
                  );
                },
              );
            };

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
          }

          // Initialize cursor styling system
          cursorCleanupRef.current = initializeCursorStyling(provider);

          // CURSOR SYSTEM VERIFICATION LOGS
          const clientId = provider.awareness.clientID;
          const localState = provider.awareness.getLocalState();

          console.log('========================================');
          console.log('CURSOR SYSTEM INITIALIZED');
          console.log('========================================');
          console.log('✅ User:', username);
          console.log('✅ Gender:', gender);
          console.log('✅ Client ID:', clientId);
          console.log('✅ Color:', localState?.user?.color || 'NOT SET');
          console.log('✅ Name:', localState?.user?.name || 'NOT SET');
          console.log('✅ Awareness enabled:', !!provider.awareness);
          console.log('✅ MonacoBindings created for HTML, CSS, JS');

          // Debug: Check all connected users
          const states = provider.awareness.getStates();
          console.log('📊 Total users in awareness:', states.size);
          states.forEach((state: any, id: number) => {
            console.log(`   User ${id}:`, {
              name: state.user?.name,
              color: state.user?.color,
            });
          });

          console.log('========================================');
          
          // Expose color application function globally
          if (typeof window !== 'undefined') {
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
                    name: state.user.name || state.user.username || 'User',
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
              const allCursors = document.querySelectorAll('.yRemoteSelection');
              const cursorHeads = document.querySelectorAll(
                '.yRemoteSelectionHead',
              );
              const selectionBoxes = document.querySelectorAll(
                '.yRemoteSelectionBox',
              );

              console.log(
                `🔍 DOM elements found: ${cursorHeads.length} cursor heads, ${selectionBoxes.length} selection boxes`,
              );

              if (cursorHeads.length === 0) {
                console.log('⏳ No cursor elements in DOM yet');
                return;
              }

              // Strategy 1: Try to match by data-clientid attribute
              let appliedCount = 0;
              colorMap.forEach((userData, clientId) => {
                const selector = `.yRemoteSelection[data-clientid="${clientId}"]`;
                const cursorElement = document.querySelector(selector);

                if (cursorElement) {
                  const head = cursorElement.querySelector(
                    '.yRemoteSelectionHead',
                  ) as HTMLElement;
                  const boxes = cursorElement.querySelectorAll(
                    '.yRemoteSelectionBox',
                  );

                  if (head) {
                    head.style.backgroundColor = userData.color;
                    head.style.setProperty('--cursor-bg-color', userData.color);
                    head.setAttribute('data-name', userData.name);
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
                console.log('📋 Trying name-based matching...');

                cursorHeads.forEach((head) => {
                  const htmlHead = head as HTMLElement;
                  const dataName = htmlHead.getAttribute('data-name');

                  if (dataName && dataName !== 'null') {
                    // Find user with matching name
                    colorMap.forEach((userData) => {
                      if (userData.name === dataName) {
                        htmlHead.style.backgroundColor = userData.color;
                        htmlHead.style.setProperty(
                          '--cursor-bg-color',
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
                console.log('🔢 Using sequential color assignment...');

                const colorArray = Array.from(colorMap.values());
                cursorHeads.forEach((head, index) => {
                  const htmlHead = head as HTMLElement;
                  const userData = colorArray[index];

                  if (userData) {
                    htmlHead.style.backgroundColor = userData.color;
                    htmlHead.style.setProperty(
                      '--cursor-bg-color',
                      userData.color,
                    );
                    htmlHead.setAttribute('data-name', userData.name);
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
                  '🎲 Applying first available color to all cursors...',
                );

                const firstUser = Array.from(colorMap.values())[0];
                cursorHeads.forEach((head) => {
                  const htmlHead = head as HTMLElement;
                  htmlHead.style.backgroundColor = firstUser.color;
                  htmlHead.style.setProperty(
                    '--cursor-bg-color',
                    firstUser.color,
                  );
                  htmlHead.setAttribute('data-name', firstUser.name);
                  appliedCount++;
                });
                console.log(`✅ Applied fallback color ${firstUser.color}`);
              }

              // Always apply colors to selection boxes
              const parent = document.querySelector('.monaco-editor');
              if (parent) {
                const boxes = parent.querySelectorAll('.yRemoteSelectionBox');
                boxes.forEach((box) => {
                  const htmlBox = box as HTMLElement;
                  const parentCursor = htmlBox.closest('.yRemoteSelection');
                  const head = parentCursor?.querySelector(
                    '.yRemoteSelectionHead',
                  ) as HTMLElement;

                  if (head?.style.backgroundColor) {
                    htmlBox.style.backgroundColor = head.style.backgroundColor;
                    htmlBox.style.opacity = '0.25';
                  }
                });
              }

              console.log(`🎨 Total colors applied: ${appliedCount}`);
            };

            (window as any).applyCursorColorsNow = applyCursorColors;
            console.log('   applyCursorColorsNow()    - Apply colors NOW');
          }

          // Initialize cursor styling system
          initializeCursorStyling(provider);
        },
      )
      .catch((error) => {
        console.error('❌ Error loading Monaco binding:', error);
      });
  };

  // Switch model when active file changes
  useEffect(() => {
    if (editorRef.current && activeModelRef.current) {
      let newModel;
      switch (activeFile) {
        case 'html':
          newModel = htmlModelRef.current;
          break;
        case 'css':
          newModel = cssModelRef.current;
          break;
        case 'js':
          newModel = jsModelRef.current;
          break;
        default:
          newModel = htmlModelRef.current;
      }
      
      if (newModel) {
        activeModelRef.current = newModel;
        editorRef.current.setModel(newModel);
      }
    }
  }, [activeFile]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (bindingRef.current) {
        Object.values(bindingRef.current).forEach((binding: any) => {
          try {
            if (binding && typeof binding.destroy === 'function') {
              binding.destroy();
            }
          } catch (error) {
            console.error('Error destroying Monaco binding:', error);
          }
        });
        bindingRef.current = null;
      }
      if (cursorCleanupRef.current) {
        try {
          cursorCleanupRef.current();
          cursorCleanupRef.current = null;
        } catch (error) {
          console.error('Error cleaning up cursor styling:', error);
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

  // Error state
  if (error || !Editor) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-[#1e1e1e] text-gray-400">
        <p>Editor failed to load. Please refresh the page.</p>
      </div>
    );
  }

  // Render Monaco Editor with active file indicator
  return (
    <div className="flex flex-col h-full w-full">
      {/* File indicator */}
      <div className="h-8 bg-[#2D2D30] px-3 flex items-center text-sm text-[#CCCCCC] border-b border-[#3C3C3C]">
        <span>{fileConfig[activeFile].icon} {fileConfig[activeFile].name}</span>
      </div>
      
      {/* Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          defaultLanguage={fileConfig[activeFile].language}
          theme="vs-dark"
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
          }}
          loading={
            <div className="flex h-full w-full items-center justify-center bg-[#1e1e1e]">
              <div className="text-center">
                <p className="text-sm text-gray-400">Initializing...</p>
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default MultiFileEditor;