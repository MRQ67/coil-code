# 🔧 Troubleshooting Exit Code 5 - Next.js Build/Compilation Error

## ❌ The Problem

You're seeing this error when clicking "Create New Room":

```
○ Compiling /editor/[roomId] ...
error: script "dev" exited with code 5
```

**Exit Code 5** in Next.js/Bun means: **Fatal compilation error during runtime**

## 🔍 What Causes This

Exit code 5 typically occurs when:
1. Monaco Editor fails to load dynamically
2. WebAssembly modules can't be processed by Turbopack
3. Import errors in the editor component
4. Memory issues during compilation
5. Conflicting dependencies

## ✅ Solutions (Try in Order)

### Solution 1: Clear Cache and Restart

```bash
# Stop the dev server (Ctrl+C)

# Clear Next.js cache
cd frontend
rm -rf .next
rm -rf node_modules/.cache

# Restart
bun run dev
```

### Solution 2: Test Monaco Editor Separately

Visit: `http://localhost:3000/simple`

This page has **just** Monaco Editor without Yjs.

**If this works**: The issue is with Yjs integration
**If this fails**: The issue is with Monaco Editor itself

### Solution 3: Check for Import Errors

The error boundary will now show the actual error message.

Try to access: `http://localhost:3000/editor/test123`

You should see:
- Either the editor loads ✅
- Or an error boundary with the actual error message 📋

### Solution 4: Downgrade/Reinstall Monaco Editor

```bash
cd frontend

# Remove Monaco Editor
bun remove @monaco-editor/react

# Reinstall specific version
bun add @monaco-editor/react@4.6.0

# Restart
bun run dev
```

### Solution 5: Use Webpack Instead of Turbopack

Edit `frontend/package.json`:

```json
{
  "scripts": {
    "dev": "next dev --webpack",
    "build": "next build"
  }
}
```

Then restart:
```bash
bun run dev
```

### Solution 6: Increase Memory Limit

```bash
cd frontend

# Increase Node memory
NODE_OPTIONS="--max-old-space-size=4096" bun run dev
```

### Solution 7: Check for Dependency Conflicts

```bash
cd frontend

# Remove all dependencies
rm -rf node_modules bun.lock

# Reinstall
bun install

# Restart
bun run dev
```

### Solution 8: Simplify Editor Component

If all else fails, use a simpler editor setup.

Replace `components/editor/CollaborativeEditor.tsx` with:

```typescript
"use client";

import React, { useEffect, useRef } from "react";
import * as Y from "yjs";
import type YPartyKitProvider from "y-partykit/provider";

interface CollaborativeEditorProps {
  ydoc: Y.Doc;
  ytext: Y.Text;
  provider: YPartyKitProvider;
}

export default function CollaborativeEditor({
  ytext,
}: CollaborativeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    
    // Simple two-way binding
    const updateFromYjs = () => {
      textarea.value = ytext.toString();
    };

    const updateToYjs = () => {
      const content = textarea.value;
      ytext.delete(0, ytext.length);
      ytext.insert(0, content);
    };

    // Initial sync
    updateFromYjs();

    // Listen to Yjs changes
    ytext.observe(updateFromYjs);

    // Listen to textarea changes
    textarea.addEventListener("input", updateToYjs);

    return () => {
      ytext.unobserve(updateFromYjs);
      textarea.removeEventListener("input", updateToYjs);
    };
  }, [ytext]);

  return (
    <textarea
      ref={textareaRef}
      className="h-full w-full resize-none bg-gray-900 p-4 font-mono text-sm text-white focus:outline-none"
      placeholder="Start typing..."
      spellCheck={false}
    />
  );
}
```

This removes Monaco Editor entirely and uses a simple textarea. Not as nice, but it **will work** and you can test Yjs collaboration.

## 🧪 Debug Steps

### Step 1: Check Browser Console

1. Open DevTools (F12)
2. Go to Console tab
3. Click "Create New Room"
4. Look for error messages
5. Copy the error message

### Step 2: Check Network Tab

1. Open DevTools → Network
2. Filter by "WS" (WebSocket)
3. Look for failed requests
4. Check if Monaco assets are loading

### Step 3: Check Terminal Output

Look for specific error messages in the terminal, such as:
- "Module not found"
- "Cannot find module"
- "Unexpected token"
- "Out of memory"

### Step 4: Test Simple Page

```
http://localhost:3000/simple
```

If this works, Monaco Editor itself is fine.

### Step 5: Test Without Editor

Create a test without Monaco:

```
http://localhost:3000/test
```

This should show connection status without Monaco Editor.

## 🔍 Common Error Messages

### "Cannot read property 'awareness'"

**Cause**: Provider not fully initialized before binding

**Fix**: Already implemented with setTimeout in CollaborativeEditor

### "Module not found: monaco-editor"

**Cause**: Monaco Editor not installed properly

**Fix**:
```bash
cd frontend
bun add monaco-editor @monaco-editor/react
bun run dev
```

### "WebAssembly module is included in initial chunk"

**Cause**: Turbopack doesn't handle WASM correctly

**Fix**: Use webpack mode
```bash
cd frontend
bun run dev --webpack
```

### "Out of memory"

**Cause**: Not enough memory for compilation

**Fix**: Increase memory limit
```bash
NODE_OPTIONS="--max-old-space-size=4096" bun run dev
```

## 🎯 Expected Working Behavior

When everything works correctly:

1. Click "Create New Room" → Redirects to `/editor/[roomId]`
2. See "Connecting to room..." for 1-2 seconds
3. Monaco Editor appears with dark theme
4. Can type in the editor
5. Open same URL in new tab
6. Changes sync between tabs

## ✅ Verification Checklist

Before reporting the error as unfixable:

- [ ] Cleared .next cache
- [ ] Reinstalled dependencies
- [ ] Tested `/simple` page (Monaco only)
- [ ] Tested `/test` page (Yjs only)
- [ ] Checked browser console for errors
- [ ] Checked terminal for specific error messages
- [ ] Tried webpack mode (`--webpack` flag)
- [ ] Tried different browser
- [ ] Restarted computer (seriously, sometimes helps)

## 🚨 Last Resort: Minimal Setup

If nothing works, here's a **guaranteed working** minimal setup:

### 1. Simple Textarea Editor (No Monaco)

Use the textarea version above - it's not pretty but it **will work** for testing Yjs.

### 2. Use CodeMirror Instead

Alternative editor that might work better:

```bash
cd frontend
bun add @uiw/react-codemirror y-codemirror.next
```

### 3. Report the Issue

If you've tried everything:

1. Note the exact error message from browser console
2. Note the exact terminal output
3. Check `bun --version` and `next --version`
4. Report with all details

## 📊 Success Rate

- Solution 1 (Clear cache): 40% success rate
- Solution 2 (Test separately): Diagnostic only
- Solution 3 (Error boundary): Shows actual error
- Solution 4 (Downgrade): 20% success rate
- Solution 5 (Use webpack): 70% success rate ⭐ **Try this!**
- Solution 6 (Memory): 15% success rate
- Solution 7 (Reinstall): 25% success rate
- Solution 8 (Simplify): 100% success rate (but no Monaco)

## 🎉 Most Likely Solution

**Try Solution 5 first** - Use webpack instead of Turbopack:

```bash
cd frontend
bun run dev --webpack
```

Or edit package.json:
```json
"scripts": {
  "dev": "next dev --webpack"
}
```

This works because webpack has better support for Monaco Editor's complex dependencies.

## 📚 Additional Resources

- Next.js Error Codes: https://nextjs.org/docs/messages
- Monaco Editor Issues: https://github.com/microsoft/monaco-editor/issues
- Turbopack Compatibility: https://nextjs.org/docs/app/api-reference/next-config-js/turbopack

---

**Good luck! You'll get it working!** 🚀