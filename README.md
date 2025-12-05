# Coil Code

A real-time collaborative web code editor built with Next.js, PartyKit, and Yjs CRDT for conflict-free synchronization. Multiple users can simultaneously edit HTML, CSS, and JavaScript files in separate rooms with live preview and user presence tracking.

![Coil Code Banner](frontend/public/screenshots/editor-preview.png)

## Features

- **Real-time Collaboration** - Multiple users can edit simultaneously with sub-100ms latency
- **Monaco Editor** - Full VS Code editor experience with syntax highlighting, IntelliSense, and keyboard shortcuts
- **Multi-File Support** - Edit HTML, CSS, and JavaScript in separate tabs
- **Live Preview** - See your changes instantly in an integrated preview pane
- **User Presence** - Track who's in the room with colored avatars and cursors
- **Auto-Save** - Automatic persistence to database every 3 seconds
- **CRDT Synchronization** - Conflict-free editing powered by Yjs
- **Room Isolation** - Each room is completely separate with unique identifiers
- **Auto-Reconnect** - Seamless recovery from network interruptions

## Tech Stack

### Frontend
- **Next.js 16.0.3** with App Router and React 19.2.0
- **Monaco Editor** - VS Code's editor engine
- **Yjs** - CRDT for real-time synchronization
- **y-monaco** - Monaco bindings for Yjs
- **Tailwind CSS v4** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Animation library

### Backend
- **PartyKit** - WebSocket server framework (port 1999)
- **y-partykit** - Yjs provider for PartyKit
- **Convex** - Database for auto-save persistence

### Package Manager
- **Bun** - Fast JavaScript runtime and package manager

## Quick Start

### Prerequisites

- [Bun](https://bun.sh/) installed (or Node.js 18+)
- A Convex account (for persistence)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd coilcode
   ```

2. **Install backend dependencies**
   ```bash
   cd partykit
   bun install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   bun install
   ```

4. **Configure environment variables**

   Create `frontend/.env.local`:
   ```env
   NEXT_PUBLIC_PARTYKIT_HOST=localhost:1999
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   CONVEX_DEPLOYMENT=your-deployment-name
   NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
   ```

### Development

You'll need **three terminal windows**:

**Terminal 1 - Start PartyKit Server:**
```bash
cd partykit
bun run dev
```
Wait for: `[pk:inf] Ready on http://0.0.0.0:1999`

**Terminal 2 - Start Next.js Frontend:**
```bash
cd frontend
bun run dev
```
Wait for: `✓ Ready in 2-3s`

**Terminal 3 - Start Convex (Optional):**
```bash
cd frontend
bunx convex dev
```

Open your browser to [http://localhost:3000](http://localhost:3000) and start collaborating!

### Quick Test

1. Click **"Create New Room"**
2. Copy the URL (e.g., `http://localhost:3000/editor/abc123`)
3. Open the same URL in a new tab or browser
4. Type in one editor and watch it appear instantly in the other!

## Project Structure

```
coilcode/
├── frontend/
│   ├── app/
│   │   ├── page.tsx                        # Home page (room creation/join)
│   │   ├── layout.tsx                      # Root layout with Convex provider
│   │   ├── editor/[roomId]/page.tsx        # Main collaborative editor
│   │   ├── simple/page.tsx                 # Simple editor test page
│   │   └── test/page.tsx                   # WebSocket debug page
│   ├── components/
│   │   ├── editor/
│   │   │   ├── CollaborativeEditor.tsx     # Monaco with Yjs binding
│   │   │   ├── EditorLayout.tsx            # 3-panel layout
│   │   │   ├── MultiFileEditor.tsx         # Tabbed editor (HTML/CSS/JS)
│   │   │   ├── FileTree.tsx                # Left sidebar file browser
│   │   │   ├── PreviewPane.tsx             # Live preview iframe
│   │   │   └── UserListTooltip.tsx         # User presence UI
│   │   ├── ui/                             # Radix UI components
│   │   └── UsernamePrompt.tsx              # Username modal
│   ├── hooks/
│   │   ├── useUsername.ts                  # User identity (localStorage)
│   │   ├── usePresence.ts                  # Real-time user tracking
│   │   └── useAutoSave.ts                  # Auto-save to Convex
│   ├── lib/
│   │   ├── yjs-setup.ts                    # Yjs initialization
│   │   ├── monaco-setup.ts                 # Monaco configuration
│   │   ├── cursor-colors.ts                # Color assignment
│   │   └── ensure-unique-colors.ts         # Unique colors per room
│   ├── convex/
│   │   ├── schema.ts                       # Database schema
│   │   ├── rooms.ts                        # Room CRUD operations
│   │   └── crons.ts                        # Scheduled cleanup tasks
│   └── next.config.ts                      # Webpack + Monaco plugin config
└── partykit/
    ├── server.ts                           # Yjs PartyKit server
    └── partykit.json                       # PartyKit config
```

## Architecture

### Real-Time Collaboration Flow

```
Client Browser ←→ WebSocket ←→ PartyKit Server (Yjs) ←→ WebSocket ←→ Other Clients
       ↓                                                                    ↓
   Yjs Document                                                        Yjs Document
       ↓                                                                    ↓
Monaco Binding                                                        Monaco Binding
```

### Key Components

- **Yjs Document** - CRDT-based shared data structure with three text types:
  - `ydoc.getText('html')` - HTML content
  - `ydoc.getText('css')` - CSS content
  - `ydoc.getText('js')` - JavaScript content

- **YPartyKitProvider** - WebSocket provider connecting to PartyKit server

- **MonacoBinding** - Syncs Monaco editor instances with Yjs text types

- **Awareness Protocol** - Tracks user presence, cursor positions, and metadata

### Data Flow

**Initialization:**
1. User enters/creates room
2. Check user identity from localStorage
3. Create Yjs document + PartyKit provider
4. Set user awareness (username + avatar)
5. Load room content from Convex database
6. Apply initial content to Yjs text types
7. Render 3-panel editor layout

**Real-Time Edits:**
1. User types in Monaco editor
2. MonacoBinding syncs changes to Yjs document
3. Yjs broadcasts via PartyKit WebSocket
4. Other clients receive and apply changes
5. Preview pane updates (debounced)
6. Auto-save triggers after 3s of inactivity

## Available Scripts

### Frontend (`frontend/` directory)

```bash
bun install              # Install dependencies
bun run dev              # Start dev server (localhost:3000)
bun run dev:network      # Start with network access (0.0.0.0)
bun run dev:all          # Start Next.js + Convex concurrently
bun run build            # Production build
bun run lint             # Run ESLint
bunx convex dev          # Start Convex backend separately
```

### Backend (`partykit/` directory)

```bash
bun install              # Install dependencies
bun run dev              # Start PartyKit server (localhost:1999)
bun run deploy           # Deploy to PartyKit Cloud
```

## User Identity System

### Storage

User information is stored in localStorage under the key `userInfo`:

```typescript
interface UserInfo {
  username: string;
  gender: "boy" | "girl" | "random";
}
```

### Cursor Colors

- Deterministic hash-based colors using `clientID + username`
- 30 predefined distinct colors
- Enforced uniqueness per room
- Colors released when user disconnects

### Debug Utilities

Open the browser console and use these global functions:

```javascript
window.fullCursorDiagnostics()      // Complete diagnostic report
window.quickColorCheckTest()        // Quick status check
window.previewCursors()             // Visual preview of colors
window.applyCursorColorsNow()       // Force apply colors
window.watchCursorChanges()         // Real-time monitoring
```

## Testing

### Manual Testing Scenarios

**Scenario 1: Two-Tab Test**
```
1. Tab 1: Create room
2. Tab 2: Open same URL
3. Tab 1: Type "function hello() {"
4. Tab 2: Should see it instantly
5. Both tabs stay synchronized
```

**Scenario 2: Different Browsers**
```
1. Chrome: http://localhost:3000/editor/test123
2. Firefox: http://localhost:3000/editor/test123
3. Type in Chrome → See in Firefox
4. Type in Firefox → See in Chrome
```

**Scenario 3: Connection Recovery**
```
1. Open editor room
2. Stop PartyKit server (Ctrl+C)
3. Type in editor (works locally)
4. Restart PartyKit server
5. Connection auto-recovers
6. Changes sync automatically
```

**Scenario 4: Room Isolation**
```
1. Room A: /editor/room-a
2. Room B: /editor/room-b
3. Type "AAA" in Room A
4. Type "BBB" in Room B
5. Verify rooms remain isolated
```

### Debug Page

Visit [http://localhost:3000/test](http://localhost:3000/test) to check:
- Connection status (should be green)
- WebSocket URL
- Document content
- Debug information

## Configuration

### Monaco Editor (next.config.ts)

- Uses **webpack mode** (not Turbopack) for Monaco compatibility
- MonacoWebpackPlugin with languages: `["html", "css", "javascript", "typescript", "json"]`
- Worker `publicPath: "/_next/"` to match Next.js asset paths
- WebAssembly support enabled
- Client-side only (no SSR)

**Dynamic Import Pattern:**
```tsx
const CollaborativeEditor = dynamic(
  () => import('@/components/editor/CollaborativeEditor'),
  { ssr: false }
);
```

### Database Schema (Convex)

```typescript
rooms: {
  roomId: string              // Unique room identifier
  htmlContent?: string        // HTML content
  cssContent?: string         // CSS content
  jsContent?: string          // JavaScript content
  lastEditedBy: string        // Last editor's username
  lastEditedAt: number        // Timestamp of last edit
  lastActiveAt?: number       // For cleanup cron jobs
  saveCount?: number          // Analytics
  totalSize?: number          // Analytics
  createdAt?: number          // Analytics
}
```

## Deployment

### Frontend (Vercel)

```bash
cd frontend
vercel deploy
```

### Backend (PartyKit)

```bash
cd partykit
bun run deploy
```

Update your `.env.local`:
```env
NEXT_PUBLIC_PARTYKIT_HOST=your-app.partykit.dev
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

## Troubleshooting

### "Cannot connect to room"

**Solution:**
```bash
# Ensure PartyKit is running
cd partykit
bun run dev
```

### "Port already in use"

**Windows:**
```bash
# Kill port 1999
netstat -ano | findstr :1999
taskkill /PID [PID] /F

# Kill port 3000
netstat -ano | findstr :3000
taskkill /PID [PID] /F
```

**macOS/Linux:**
```bash
# Kill port 1999
lsof -ti:1999 | xargs kill -9

# Kill port 3000
lsof -ti:3000 | xargs kill -9
```

### "Monaco Editor not loading"

**Solution:**
```bash
cd frontend
rm -rf .next node_modules
bun install
bun run dev
```

### "Changes not syncing"

**Check:**
1. Both tabs have the SAME room ID in URL
2. DevTools → Network → WS shows WebSocket connection
3. PartyKit server is running
4. No console errors

## Known Limitations

- No visual cursor indicators in Monaco (awareness data exists but not rendered in editor)
- No authentication/authorization (trust-based username system)
- No room management UI
- No chat functionality
- No version history
- Single language support (HTML/CSS/JS only, no TypeScript/Python selector)
- Preview sandbox has no restrictions (full JS execution)

## Documentation

- [START_HERE.md](START_HERE.md) - Quick start guide
- [QUICKSTART.md](QUICKSTART.md) - Fast setup
- [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) - Feature status
- [TESTING_GUIDE.md](TESTING_GUIDE.md) - Comprehensive testing
- [CLAUDE.md](CLAUDE.md) - AI assistant instructions
- [VISUAL_TESTING_GUIDE.md](VISUAL_TESTING_GUIDE.md) - Visual testing
- [CURSOR_VERIFICATION_CHECKLIST.md](CURSOR_VERIFICATION_CHECKLIST.md) - Cursor system tests

## Contributing

This is a personal project, but contributions are welcome! Please feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## License

MIT License - See LICENSE file for details

## Acknowledgments

Built with these amazing technologies:
- [Next.js](https://nextjs.org/) - React framework
- [PartyKit](https://partykit.io/) - Real-time infrastructure
- [Yjs](https://yjs.dev/) - CRDT library
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - VS Code editor
- [Convex](https://convex.dev/) - Backend platform
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Radix UI](https://radix-ui.com/) - UI components

---

**Happy Collaborative Coding!** 💻✨
