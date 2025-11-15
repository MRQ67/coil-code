# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Coil Code** is a real-time collaborative web code editor built with Next.js 16, PartyKit, and Yjs CRDT for conflict-free synchronization. Users can simultaneously edit HTML, CSS, and JavaScript files in separate rooms with live preview and cursor tracking.

**Tech Stack:**
- Frontend: Next.js 16.0.0 (App Router) + React 19.2.0
- Backend: PartyKit WebSocket server (port 1999)
- Database: Convex (auto-save persistence)
- Editor: Monaco Editor (VS Code engine)
- Real-time Sync: Yjs CRDT with y-partykit provider
- Package Manager: Bun
- Styling: Tailwind CSS v4

## Development Commands

### Frontend (from `frontend/` directory)
```bash
bun install                    # Install dependencies
bun run dev                    # Start dev server (localhost:3000, webpack mode)
bun run dev:network            # Start with network access (0.0.0.0)
bun run dev:all                # Start Next.js + Convex concurrently
bun run build                  # Production build
bun run lint                   # Run ESLint
bunx convex dev                # Start Convex backend separately
```

### Backend (from `partykit/` directory)
```bash
bun install                    # Install dependencies
bun run dev                    # Start PartyKit server (localhost:1999)
bun run deploy                 # Deploy to PartyKit Cloud
```

### Typical Development Workflow
1. Terminal 1: `cd partykit && bun run dev`
2. Terminal 2: `cd frontend && bun run dev`
3. (Optional) Terminal 3: `cd frontend && bunx convex dev`

## Architecture Overview

### Real-Time Collaboration System

```
Client Browser ←→ WebSocket ←→ PartyKit Server (Yjs) ←→ WebSocket ←→ Other Clients
       ↓                                                                    ↓
   Yjs Document                                                        Yjs Document
       ↓                                                                    ↓
Monaco Binding                                                        Monaco Binding
```

**Key Components:**
- **Yjs Document**: CRDT-based shared data structure with three text types:
  - `ydoc.getText('html')` - HTML content
  - `ydoc.getText('css')` - CSS content
  - `ydoc.getText('js')` - JavaScript content
- **YPartyKitProvider**: WebSocket provider connecting to PartyKit server
- **MonacoBinding**: Syncs Monaco editor instances with Yjs text types (from `y-monaco`)
- **Awareness Protocol**: Tracks user presence, cursor positions, and metadata

### File Structure

```
coilcode/
├── frontend/
│   ├── app/
│   │   ├── page.tsx                        # Home page (room creation/joining)
│   │   ├── layout.tsx                      # Root layout with Convex provider
│   │   └── editor/[roomId]/page.tsx        # Main collaborative editor page
│   ├── components/
│   │   ├── editor/
│   │   │   ├── CollaborativeEditor.tsx     # Monaco editor wrapper with Yjs binding
│   │   │   ├── EditorLayout.tsx            # 3-panel layout (file tree, editor, preview)
│   │   │   ├── MultiFileEditor.tsx         # Tabbed editor for HTML/CSS/JS
│   │   │   ├── FileTree.tsx                # Left sidebar file browser
│   │   │   ├── PreviewPane.tsx             # Live preview iframe
│   │   │   └── UserListTooltip.tsx         # User presence UI
│   │   ├── ui/                             # Radix UI components
│   │   └── UsernamePrompt.tsx              # Username modal
│   ├── hooks/
│   │   ├── useUsername.ts                  # User identity (localStorage)
│   │   ├── usePresence.ts                  # Real-time user tracking
│   │   └── useAutoSave.ts                  # Auto-save to Convex (5s debounce)
│   ├── lib/
│   │   ├── yjs-setup.ts                    # Yjs initialization & cleanup
│   │   ├── monaco-setup.ts                 # Monaco configuration
│   │   ├── cursor-colors.ts                # Color assignment algorithm
│   │   └── ensure-unique-colors.ts         # Room-scoped color uniqueness
│   ├── convex/
│   │   ├── schema.ts                       # Convex database schema
│   │   └── rooms.ts                        # Room CRUD operations
│   └── next.config.ts                      # Webpack + Monaco plugin config
└── partykit/
    ├── server.ts                           # Yjs PartyKit server (y-partykit)
    └── partykit.json                       # PartyKit config
```

### Data Flow

**Initialization (editor/[roomId]/page.tsx):**
1. Check user identity from localStorage (`useUsername`)
2. Create Yjs document + PartyKit provider (`createCollaborativeDoc`)
3. Set user awareness (username + gender)
4. Load room content from Convex database
5. Apply initial content to Yjs text types in single transaction
6. Render `EditorLayout` with 3-panel UI

**Real-Time Edits:**
1. User types in Monaco editor
2. `MonacoBinding` syncs changes to Yjs document
3. Yjs broadcasts changes via PartyKit WebSocket
4. Other clients receive + apply changes automatically
5. Preview pane updates with debounced HTML/CSS/JS

**Persistence:**
- Auto-save hook (`useAutoSave`) saves to Convex every 5 seconds
- Also saves on window unload/visibility change
- PartyKit server is stateless (no persistence logic)

### Monaco Editor Configuration

**Important Details (next.config.ts:13-46):**
- Uses webpack mode (not Turbopack) for Monaco compatibility
- `MonacoWebpackPlugin` configured with languages: `["html", "css", "javascript", "typescript", "json"]`
- Worker `publicPath: "/_next/"` to match Next.js asset paths
- WebAssembly support enabled for Monaco
- Client-side only (no SSR for Monaco)

**Dynamic Import Pattern:**
```tsx
// Always use dynamic import for Monaco to avoid SSR issues
const CollaborativeEditor = dynamic(
  () => import('@/components/editor/CollaborativeEditor'),
  { ssr: false }
);
```

### User Identity System

**Storage:** localStorage key `userInfo`
```typescript
interface UserInfo {
  username: string;
  gender: "boy" | "girl" | "random";
}
```

**Cursor Colors:**
- Deterministic hash-based colors using `clientID + username`
- 30 predefined distinct colors in `cursor-colors.ts`
- Enforced uniqueness per room via `ensure-unique-colors.ts`
- Colors released when user disconnects

**Debug Utilities (exposed globally on CollaborativeEditor):**
```javascript
window.fullCursorDiagnostics()      // Complete diagnostic report
window.quickColorCheckTest()        // Quick status check
window.previewCursors()             // Visual preview
window.applyCursorColorsNow()       // Force apply colors
window.watchCursorChanges()         // Real-time monitoring
```

## Common Patterns

### Creating a New Component with Yjs Awareness

```typescript
import { useEffect, useState } from 'react';
import type { Awareness } from 'y-protocols/awareness';

export function MyComponent({ provider }: { provider: any }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!provider) return;

    const awareness: Awareness = provider.awareness;

    const updateUsers = () => {
      const states = Array.from(awareness.getStates().entries());
      setUsers(states.map(([clientId, state]) => ({
        clientId,
        username: state.username,
        gender: state.gender,
      })));
    };

    awareness.on('change', updateUsers);
    updateUsers();

    return () => awareness.off('change', updateUsers);
  }, [provider]);

  // ...
}
```

### Adding a New Yjs Text Type

If you need to add a fourth file type (e.g., TypeScript):

1. **Update MultiFileEditor.tsx:** Add new tab + Monaco instance
2. **Update lib/yjs-setup.ts:** Initialize `ydoc.getText('ts')`
3. **Update convex/schema.ts:** Add `tsContent: v.optional(v.string())`
4. **Update hooks/useAutoSave.ts:** Include new content in save
5. **Update editor/[roomId]/page.tsx:** Load/save new content

### Error Handling

- **Monaco Fails to Load:** Fallback to `SimpleEditor` component
- **WebSocket Disconnect:** Auto-reconnect handled by `y-partykit`
- **React StrictMode:** `isInitializing.current` ref prevents double initialization
- **Missing User Info:** Username modal blocks editor access

## Important Notes

- **Always use `bun` commands, not `npm` or `yarn`**
- **Run dev server with `--webpack` flag** (Monaco incompatible with Turbopack)
- **Never SSR Monaco components** - always use `dynamic(() => import(...), { ssr: false })`
- **Client-side only components** require `"use client"` directive
- **Yjs transactions:** Use `ydoc.transact(() => { ... })` for atomic multi-operation updates
- **Room isolation:** Each `roomId` gets separate Yjs document - no cross-room interference
- **No authentication:** Username system is trust-based (localStorage only)
- **Preview sandboxing:** iframe without `sandbox` attribute (full JS execution)

## Environment Variables

**frontend/.env.local:**
```env
NEXT_PUBLIC_PARTYKIT_HOST=coil-code.mrq67.partykit.dev
NEXT_PUBLIC_APP_URL=http://localhost:3000
CONVEX_DEPLOYMENT=dev:optimistic-jay-615
NEXT_PUBLIC_CONVEX_URL=https://optimistic-jay-615.convex.cloud
```

## Testing

No automated test framework configured. Manual testing via:
- `frontend/app/test/page.tsx` - WebSocket connection debug page
- Browser DevTools console - Cursor color debug functions

Extensive testing documentation in:
- `TESTING_GUIDE.md`
- `VISUAL_TESTING_GUIDE.md`
- `CURSOR_VERIFICATION_CHECKLIST.md`

## Known Limitations

- No visual cursor indicators in Monaco (awareness data exists but not rendered)
- No authentication/authorization
- No room management UI
- No chat functionality
- No version history
- Single language support (JavaScript only, no TypeScript/Python selector)
