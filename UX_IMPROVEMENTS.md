# UX Improvements Implementation Guide

## Overview
This document outlines 4 critical UX improvements for Coil Code based on industry best practices from CodeSandbox, CodePen, StackBlitz, and VS Code.

---

## 1. Resizable Panels with Drag Handles 🎯

**Priority:** HIGH - Most requested feature in code editors
**Effort:** Medium (1-2 hours)
**Impact:** HIGH - Dramatically improves user flexibility

### Current State
- Fixed panel widths: File Tree (15%), Editor (45%), Preview (40%)
- No way for users to adjust workspace based on their task
- Wastes screen space for different workflows

### Implementation

#### Install Dependencies
```bash
cd frontend
bun add react-resizable-panels
```

#### Update EditorLayout.tsx
Replace fixed-width divs with `PanelGroup` and `Panel` components.

**File:** `frontend/components/editor/EditorLayout.tsx`

```tsx
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

// Replace the entire main content area (lines 46-81) with:
<div className="flex flex-1 overflow-hidden">
  <PanelGroup direction="horizontal">
    {/* File Tree Panel */}
    <Panel
      defaultSize={15}
      minSize={10}
      maxSize={30}
      collapsible
      onCollapse={() => setIsFileTreeOpen(false)}
    >
      <FileTree
        activeFile={activeFile}
        onFileSelect={(fileType: string) => {
          if (fileType === 'html' || fileType === 'css' || fileType === 'js') {
            setActiveFile(fileType);
          }
        }}
        isCollapsed={!isFileTreeOpen}
        onToggleCollapse={() => setIsFileTreeOpen(!isFileTreeOpen)}
      />
    </Panel>

    {/* Drag Handle - Aceternity Style */}
    <PanelResizeHandle className="w-1 bg-[#3C3C3C] hover:bg-blue-500 transition-colors duration-200 relative group">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-12 rounded-full bg-blue-500/0 group-hover:bg-blue-500 transition-all duration-200" />
    </PanelResizeHandle>

    {/* Editor Panel */}
    <Panel
      defaultSize={45}
      minSize={30}
    >
      <div className="flex flex-col h-full">
        <MultiFileEditor
          ydoc={ydoc}
          provider={provider}
          username={username}
          gender={gender}
          activeFile={activeFile}
          onActiveFileChange={setActiveFile}
        />
      </div>
    </Panel>

    {/* Drag Handle */}
    <PanelResizeHandle className="w-1 bg-[#3C3C3C] hover:bg-blue-500 transition-colors duration-200 relative group">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-12 rounded-full bg-blue-500/0 group-hover:bg-blue-500 transition-all duration-200" />
    </PanelResizeHandle>

    {/* Preview Panel */}
    <Panel
      defaultSize={40}
      minSize={20}
      collapsible
      onCollapse={() => setIsPreviewOpen(false)}
    >
      <OptimizedPreviewPane
        htmlContent={getHtmlContent()}
        cssContent={getCssContent()}
        jsContent={getJsContent()}
        isPreviewOpen={isPreviewOpen}
        onTogglePreview={() => setIsPreviewOpen(!isPreviewOpen)}
      />
    </Panel>
  </PanelGroup>
</div>
```

### Features
- ✅ Drag to resize any panel
- ✅ Minimum/maximum sizes to prevent hiding
- ✅ Blue glow on hover for discoverability
- ✅ Collapsible panels (double-click handle)
- ✅ Smooth transitions

### User Benefits
- Adjust workspace for different tasks (coding CSS needs less preview)
- More screen space for debugging (expand preview + console)
- Presentation mode (collapse file tree + expand preview)

---

## 2. Layout Mode Switcher 🎯

**Priority:** HIGH
**Effort:** Medium (1-2 hours)
**Impact:** HIGH - Different layouts for different workflows

### Implementation

#### Install shadcn Toggle Group
```bash
cd frontend
bunx shadcn@latest add toggle-group
```

#### Add to Editor Header
**File:** `frontend/app/editor/[roomId]/page.tsx` (line ~287)

```tsx
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

// Add state
const [layout, setLayout] = useState<'split' | 'vertical' | 'preview' | 'focus'>('split');

// Add to header (after "Connected" badge)
<div className="flex items-center gap-2 px-3 py-1.5 bg-[#252526] rounded-lg border border-[#3C3C3C]">
  <span className="text-xs text-gray-400">Layout:</span>
  <ToggleGroup type="single" value={layout} onValueChange={setLayout}>
    <ToggleGroupItem
      value="split"
      aria-label="Split view"
      className="data-[state=on]:bg-blue-500 data-[state=on]:text-white px-2 py-1"
    >
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <rect x="3" y="3" width="8" height="18" rx="1"/>
        <rect x="13" y="3" width="8" height="18" rx="1"/>
      </svg>
    </ToggleGroupItem>

    <ToggleGroupItem value="vertical" aria-label="Vertical" className="px-2 py-1">
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="8" rx="1"/>
        <rect x="3" y="13" width="18" height="8" rx="1"/>
      </svg>
    </ToggleGroupItem>

    <ToggleGroupItem value="preview" aria-label="Preview only" className="px-2 py-1">
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="1"/>
      </svg>
    </ToggleGroupItem>

    <ToggleGroupItem value="focus" aria-label="Editor only" className="px-2 py-1">
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M4 6h16M4 12h16M4 18h16" strokeWidth="2" stroke="currentColor"/>
      </svg>
    </ToggleGroupItem>
  </ToggleGroup>
</div>
```

#### Update EditorLayout to Support Layouts
Pass `layout` prop to `EditorLayout` and conditionally render based on mode.

---

## 3. Keyboard Shortcuts Modal 🎯

**Priority:** MEDIUM
**Effort:** Medium (2-3 hours)
**Impact:** HIGH - Improves discoverability

### Implementation

#### Create Component
**File:** `frontend/components/KeyboardShortcutsModal.tsx`

```tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function KeyboardShortcutsModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+/ to toggle modal
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const shortcuts = [
    {
      category: 'File',
      items: [
        { keys: ['Ctrl', 'S'], description: 'Save file' },
        { keys: ['Ctrl', 'P'], description: 'Quick file switcher' },
      ]
    },
    {
      category: 'Editor',
      items: [
        { keys: ['Ctrl', 'B'], description: 'Toggle sidebar' },
        { keys: ['Ctrl', '/'], description: 'Toggle comment' },
        { keys: ['Ctrl', 'F'], description: 'Find in file' },
      ]
    },
    {
      category: 'Preview',
      items: [
        { keys: ['Ctrl', 'Shift', 'P'], description: 'Toggle preview' },
        { keys: ['Ctrl', 'R'], description: 'Refresh preview' },
      ]
    },
    {
      category: 'View',
      items: [
        { keys: ['Ctrl', '`'], description: 'Toggle console' },
        { keys: ['F11'], description: 'Fullscreen' },
      ]
    },
  ];

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 bg-[#252526] hover:bg-[#2A2D2E] rounded-lg text-sm text-gray-400 hover:text-white transition-all"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        <span className="hidden md:inline">Shortcuts</span>
        <kbd className="px-1.5 py-0.5 text-xs bg-[#1E1E1E] border border-[#3C3C3C] rounded">
          Ctrl /
        </kbd>
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl max-h-[80vh] overflow-hidden z-50"
            >
              {/* Gradient Border - Aceternity Style */}
              <div className="relative p-[1px] rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
                <div className="bg-[#1E1E1E] rounded-2xl p-6 overflow-y-auto max-h-[80vh]">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-white">Keyboard Shortcuts</h2>
                      <p className="text-sm text-gray-400 mt-1">
                        Speed up your workflow with these shortcuts
                      </p>
                    </div>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-2 hover:bg-[#2A2D2E] rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Shortcuts Grid */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {shortcuts.map((category) => (
                      <div key={category.category}>
                        <h3 className="text-sm font-semibold text-blue-400 mb-3 uppercase tracking-wider">
                          {category.category}
                        </h3>
                        <div className="space-y-2">
                          {category.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-3 bg-[#252526] hover:bg-[#2A2D2E] rounded-lg transition-colors group"
                            >
                              <span className="text-sm text-gray-300">{item.description}</span>
                              <div className="flex gap-1">
                                {item.keys.map((key, i) => (
                                  <kbd
                                    key={i}
                                    className="px-2 py-1 text-xs font-semibold text-white bg-[#1E1E1E] border border-[#3C3C3C] rounded shadow-sm group-hover:border-blue-500/50 transition-colors"
                                  >
                                    {key}
                                  </kbd>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer Tip */}
                  <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-sm text-blue-300">
                      💡 <strong>Pro tip:</strong> Press <kbd className="px-1.5 py-0.5 bg-[#1E1E1E] border border-blue-500/30 rounded">Ctrl /</kbd> anytime to toggle this menu
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
```

#### Add to Editor Header
In `frontend/app/editor/[roomId]/page.tsx`, import and add the component to the header.

---

## 4. Enhanced Preview Controls with Responsive Modes 🎯

**Priority:** HIGH
**Effort:** High (3-4 hours)
**Impact:** HIGH - Essential for responsive testing

### Implementation

#### Update PreviewPane Component
**File:** `frontend/components/editor/PreviewPane.tsx` or `OptimizedPreviewPane.tsx`

Add toolbar with:
- Responsive viewport selector (Desktop, Tablet, Mobile)
- Auto-refresh toggle
- Manual refresh button
- Device frame toggle
- Open in new tab
- Collapsible console

```tsx
type ViewportSize = 'desktop' | 'tablet' | 'mobile';

const viewports = {
  desktop: { width: '100%', height: '100%', label: 'Desktop', icon: '🖥️' },
  tablet: { width: 768, height: 1024, label: 'Tablet', icon: '📱' },
  mobile: { width: 375, height: 667, label: 'iPhone SE', icon: '📱' },
};

// Add state
const [viewport, setViewport] = useState<ViewportSize>('desktop');
const [autoRefresh, setAutoRefresh] = useState(true);
const [showDeviceFrame, setShowDeviceFrame] = useState(false);
const [consoleOpen, setConsoleOpen] = useState(true);
```

Add responsive toolbar and device frame rendering (see detailed implementation in sections above).

---

## Bonus: Copy Room Link Button ⚡

**Priority:** LOW
**Effort:** Low (15 minutes)
**Impact:** MEDIUM - Improves sharing

### Implementation

Add to header in `frontend/app/editor/[roomId]/page.tsx`:

```tsx
<button
  onClick={() => {
    navigator.clipboard.writeText(window.location.href);
    // TODO: Add toast notification
    console.log('Room link copied!');
  }}
  className="flex items-center gap-2 px-3 py-1.5 bg-[#252526] hover:bg-[#2A2D2E] rounded-lg text-sm text-gray-400 hover:text-white transition-all group"
>
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
  <span>Copy Link</span>
</button>
```

---

## Implementation Order

1. ✅ **Resizable Panels** (Start here - highest impact)
2. **Keyboard Shortcuts Modal**
3. **Enhanced Preview Controls**
4. **Layout Mode Switcher**
5. **Copy Room Link** (quick win anytime)

## Testing Checklist

### Resizable Panels
- [ ] Drag handles are visible and respond to hover
- [ ] Panels resize smoothly without lag
- [ ] Minimum sizes prevent panels from disappearing
- [ ] Double-click handle collapses panel
- [ ] Layout persists on page refresh (if implemented)

### Keyboard Shortcuts
- [ ] Ctrl+/ opens modal
- [ ] Escape closes modal
- [ ] Backdrop click closes modal
- [ ] All shortcuts are documented
- [ ] Modal is responsive on mobile

### Preview Controls
- [ ] Responsive modes change preview size
- [ ] Device frame renders correctly
- [ ] Auto-refresh toggle works
- [ ] Manual refresh updates preview
- [ ] Console is collapsible
- [ ] Open in new tab works

### Layout Switcher
- [ ] All 4 layouts work correctly
- [ ] Active layout is highlighted
- [ ] Transitions are smooth
- [ ] Layout choice persists

---

## Dependencies

```json
{
  "react-resizable-panels": "^2.1.7",
  "@radix-ui/react-toggle-group": "^1.1.0" // via shadcn
}
```

## Resources

- [react-resizable-panels docs](https://github.com/bvaughn/react-resizable-panels)
- [shadcn/ui components](https://ui.shadcn.com/)
- [Aceternity UI](https://ui.aceternity.com/)
- [Framer Motion](https://www.framer.com/motion/)
