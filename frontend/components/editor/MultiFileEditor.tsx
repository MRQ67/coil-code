'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as Y from 'yjs';
import type YPartyKitProvider from 'y-partykit/provider';
// MonacoBinding is imported dynamically to avoid SSR issues
import type { editor } from 'monaco-editor';
import Editor from '@monaco-editor/react';

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
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const [isReady, setIsReady] = useState(false);
  
  // Model refs
  const htmlModelRef = useRef<editor.ITextModel | null>(null);
  const cssModelRef = useRef<editor.ITextModel | null>(null);
  const jsModelRef = useRef<editor.ITextModel | null>(null);
  
  // Binding refs (using any to avoid SSR import of y-monaco types)
  const htmlBindingRef = useRef<any>(null);
  const cssBindingRef = useRef<any>(null);
  const jsBindingRef = useRef<any>(null);
  
  // Cursor cleanup ref
  const cursorCleanupRef = useRef<(() => void) | null>(null);
  
  // Yjs texts
  const yhtmlText = ydoc.getText('html');
  const ycssText = ydoc.getText('css');
  const yjsText = ydoc.getText('js');

  // File config
  const fileConfig = {
    html: { name: 'index.html', icon: '📄', language: 'html' },
    css: { name: 'style.css', icon: '📄', language: 'css' },
    js: { name: 'script.js', icon: '📄', language: 'javascript' }
  };

  // Define custom theme before editor mounts
  const handleEditorWillMount = (monaco: any) => {
    monaco.editor.defineTheme('coil-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [{ background: '1E1E1E' }],
      colors: {
        'editor.background': '#1E1E1E',
      },
    });
  };

  // CRITICAL: Handle editor mount - create models and bindings here
  const handleEditorDidMount = async (editorInstance: editor.IStandaloneCodeEditor, monaco: any) => {
    try {
      editorRef.current = editorInstance;
      
      // Force apply theme
      monaco.editor.setTheme('coil-dark');

      if (!provider.awareness) {
        console.error('❌ Provider awareness not available');
        return;
      }

      // Dynamically import MonacoBinding to avoid SSR issues
      const { MonacoBinding } = await import('y-monaco');

      // 1. Create models (only once, only here after Monaco loads)
      if (!htmlModelRef.current) {
        htmlModelRef.current = monaco.editor.createModel('', 'html');
      }
      if (!cssModelRef.current) {
        cssModelRef.current = monaco.editor.createModel('', 'css');
      }
      if (!jsModelRef.current) {
        jsModelRef.current = monaco.editor.createModel('', 'javascript');
      }

      // 2. Create bindings immediately after models
      if (!htmlBindingRef.current && htmlModelRef.current) {
        htmlBindingRef.current = new MonacoBinding(
          yhtmlText,
          htmlModelRef.current,
          new Set([editorInstance]),
          provider.awareness
        );
      }

      if (!cssBindingRef.current && cssModelRef.current) {
        cssBindingRef.current = new MonacoBinding(
          ycssText,
          cssModelRef.current,
          new Set([editorInstance]),
          provider.awareness
        );
      }

      if (!jsBindingRef.current && jsModelRef.current) {
        jsBindingRef.current = new MonacoBinding(
          yjsText,
          jsModelRef.current,
          new Set([editorInstance]),
          provider.awareness
        );
      }

      // 3. Set active model
      const modelMap = {
        html: htmlModelRef.current,
        css: cssModelRef.current,
        js: jsModelRef.current
      };
      
      const activeModel = modelMap[activeFile];
      if (activeModel) {
        editorInstance.setModel(activeModel);
      }

      // 4. Initialize cursor styling system (keep all existing cursor code)
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
          console.error('❌ Error loading cursor styling:', error);
        });

      setIsReady(true);
      console.log('✅ Editor initialized successfully');
      
    } catch (error) {
      console.error('❌ Error in handleEditorDidMount:', error);
    }
  };

  // Switch model when activeFile changes
  useEffect(() => {
    if (!editorRef.current || !isReady) return;

    const modelMap = {
      html: htmlModelRef.current,
      css: cssModelRef.current,
      js: jsModelRef.current
    };

    const newModel = modelMap[activeFile];
    if (newModel) {
      try {
        editorRef.current.setModel(newModel);
      } catch (error) {
        console.error('Error switching model:', error);
      }
    }
  }, [activeFile, isReady]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (htmlBindingRef.current) {
        try {
          htmlBindingRef.current.destroy();
        } catch (error) {
          console.error('Error destroying HTML binding:', error);
        }
      }
      if (cssBindingRef.current) {
        try {
          cssBindingRef.current.destroy();
        } catch (error) {
          console.error('Error destroying CSS binding:', error);
        }
      }
      if (jsBindingRef.current) {
        try {
          jsBindingRef.current.destroy();
        } catch (error) {
          console.error('Error destroying JS binding:', error);
        }
      }
      
      if (htmlModelRef.current) {
        try {
          htmlModelRef.current.dispose();
        } catch (error) {
          console.error('Error disposing HTML model:', error);
        }
      }
      if (cssModelRef.current) {
        try {
          cssModelRef.current.dispose();
        } catch (error) {
          console.error('Error disposing CSS model:', error);
        }
      }
      if (jsModelRef.current) {
        try {
          jsModelRef.current.dispose();
        } catch (error) {
          console.error('Error disposing JS model:', error);
        }
      }

      if (cursorCleanupRef.current) {
        try {
          cursorCleanupRef.current();
        } catch (error) {
          console.error('Error cleaning up cursor styling:', error);
        }
      }

      editorRef.current = null;
    };
  }, []);

  return (
    <div className="flex flex-col h-full w-full">
      {/* File indicator */}
      <div className="h-8 bg-[#222831] px-3 flex items-center text-sm text-[#CCCCCC] border-b border-[#3C3C3C]">
        <span>{fileConfig[activeFile].icon} {fileConfig[activeFile].name}</span>
      </div>

      {/* Editor - use regular import, not dynamic */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={fileConfig[activeFile].language}
          theme="coil-dark"
          beforeMount={handleEditorWillMount}
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
            <div className="flex h-full items-center justify-center bg-[#1E1E1E]">
              <div className="text-center">
                <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
                <p className="text-gray-400">Loading editor...</p>
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default MultiFileEditor;
