# Qwen Code - Collaborative Code Editor Project

## Project Overview

This is a real-time collaborative code editor built with a modern tech stack featuring:
- **Frontend**: Next.js 16 with React 19, Monaco Editor, TypeScript, Tailwind CSS
- **Backend**: PartyKit server with Yjs for CRDT-based real-time synchronization
- **Architecture**: WebSocket-based collaboration using Yjs PartyKit provider

The project enables multiple users to edit code simultaneously in the same document with instant synchronization and conflict resolution via Conflict-free Replicated Data Types (CRDTs).

## Architecture

### Tech Stack
- **Yjs**: CRDT for real-time synchronization
- **PartyKit**: WebSocket server framework
- **y-partykit**: Yjs provider for PartyKit
- **Monaco Editor**: VS Code editor component
- **y-monaco**: Monaco + Yjs binding
- **Next.js 16**: React framework with Turbopack
- **TypeScript**: Type-safe code
- **Tailwind CSS**: Utility-first styling
- **framer-motion**: Animation library

### File Structure
```
coilcode/
├── frontend/
│   ├── app/
│   │   ├── page.tsx                    # Home page
│   │   ├── test/page.tsx              # Debug test page
│   │   └── editor/[roomId]/page.tsx   # Editor room
│   ├── components/
│   │   └── editor/CollaborativeEditor.tsx
│   │   └── UsernamePrompt.tsx         # Enhanced username modal
│   │   └── UserAvatar.tsx             # Avatar display component
│   ├── hooks/
│   │   └── useUsername.ts             # Username management hook
│   ├── lib/
│   │   ├── yjs-setup.ts               # Yjs utilities
│   │   ├── name-generator.ts          # Avatar and name utilities
│   │   └── [other cursor utilities]
│   └── package.json
├── partykit/
│   ├── server.ts                      # Yjs PartyKit server
│   ├── partykit.json                  # Configuration
│   └── package.json
└── [documentation files]
```

## Building and Running

### Prerequisites
- Node.js and bun package manager

### Setup Commands
1. **Start PartyKit Server** (Terminal 1):
```bash
cd partykit
bun run dev
```
Wait for: `[pk:inf] Ready on http://0.0.0.0:1999` ✅

2. **Start Next.js Frontend** (Terminal 2):
```bash
cd frontend
bun run dev
```
Wait for: `✓ Ready in 2-3s` ✅

### Test Collaboration
1. Open Browser: `http://localhost:3000`
2. Click "Create New Room" button
3. Copy URL: Example: `http://localhost:3000/editor/abc1234567`
4. Open New Tab: Paste the same URL
5. Type in Tab 1: Type "Hello World!"
6. Watch Tab 2: Should see "Hello World!" appear instantly! ✨

## Key Features

### ✅ Current Implementation
- **Real-time Collaboration**: Multiple users can edit simultaneously with instant sync (< 100ms)
- **Monaco Editor**: Full VS Code editor experience with syntax highlighting
- **CRDT Conflict Resolution**: Automatic conflict resolution with no overwrites
- **Room Isolation**: Each room is completely separate with unique 100-character room IDs
- **Connection Handling**: Auto-reconnect on disconnect, syncs when connection restored
- **User Awareness**: Enhanced username system with gender selection, live avatar preview
- **Cursor Visualization**: Multi-cursor support with unique colors per user
- **Enhanced UI**: Dark mode with gradient accents and smooth animations

### ❌ What's NOT Implemented (Yet)
- **MongoDB Persistence**: Documents are NOT saved to database (lost when all users disconnect)
- **User Authentication**: All users are anonymous
- **Language Selector**: Fixed to JavaScript
- **Theme Toggle**: Fixed to dark mode
- **Code Execution**: No run button
- **Chat/Comments**: No communication features
- **Room List/History**: No document history

## Development Conventions

### Code Style
- TypeScript strict mode
- Follow existing code patterns
- Use Tailwind CSS classes (no custom CSS)
- Include `'use client'` for client components
- Add JSDoc comments for public functions

### Data Flow
1. User enters room → Username system checks localStorage
2. If no stored credentials → Show UsernamePrompt modal
3. Save credentials to localStorage → Connect to Yjs document
4. Monaco Editor binds to Yjs document → Real-time sync begins
5. User awareness data (name, color) syncs via Yjs awareness protocol

### Environment Configuration
- Use `.env.local` for frontend environment variables
- Use `.env` for partykit environment variables
- Configure MongoDB URI for persistence (not yet implemented)

## Unique Features

### Enhanced Username System
- Gender selection (Boy/Girl/Random)
- Live avatar preview as users type
- Random name generator (e.g., "Cosmic Panda", "Quantum Tiger")
- localStorage persistence
- Edit profile anytime from editor

### Advanced Cursor Visualization
- Unique color per user (deterministic based on username + client ID)
- 15+ color palette to ensure uniqueness
- 4-layer redundancy system to ensure colors persist
- Selection highlights match cursor colors
- Multiple fallback strategies for edge cases
- 15+ debug tools in browser console

## Testing

### Basic Test (2 Tabs)
1. Open Tab 1 (Alice) → Enter username → Join room
2. Copy room URL
3. Open Tab 2 (Bob) → Paste URL → Join room
4. Tab 1: Type "Hello" → Tab 2 should see colored cursor
5. Tab 2: Type "World" → Tab 1 should see different colored cursor

### Debug Features
- Visit `http://localhost:3000/test` for connection status
- Browser console exposes many debug functions:
  - `quickColorCheckTest()` - Fast verification
  - `fullCursorDiagnostics()` - Complete diagnostic report
  - `applyCursorColorsNow()` - Apply colors immediately
  - `watchCursorChanges()` - Real-time monitoring
  - `debugColorAssignments()` - Show color assignments

## MongoDB Persistence Implementation

To add persistence, implement the load/save functions in `partykit/server.ts`:

```typescript
onConnect(conn, this.room, {
  async load() {
    // Load document from MongoDB when first user connects
  },
  callback: {
    async handler(doc) {
      // Save document to MongoDB after edits
    },
    debounceWait: 2000, // Save 2 seconds after last edit
    debounceMaxWait: 10000, // Save at least every 10 seconds
    timeout: 5000 // Timeout for save operation
  }
});
```

## Troubleshooting

### Common Issues
- **"Cannot connect to room"**: Ensure PartyKit server (port 1999) is running
- **"Page won't load"**: Ensure frontend (port 3000) is running
- **"Changes not syncing"**: Check both tabs have same room ID, refresh if needed
- **"Avatars not loading"**: Verify internet connection and check Network tab
- **"Console errors"**: Check browser console for detailed error messages

### Port Conflicts
```bash
# Windows kill ports
netstat -ano | findstr :1999
taskkill /PID [PID] /F

# Mac/Linux kill ports
lsof -ti:1999 | xargs kill -9
```

## Deployment

### Pre-Deployment Checklist
- [ ] All tests pass
- [ ] No console errors
- [ ] Mobile responsive verified
- [ ] localStorage works
- [ ] Avatars load correctly
- [ ] TypeScript compiles
- [ ] Build succeeds

### Build Commands
```bash
cd frontend
npm run build
npm run start  # Test locally before deployment
```

### Deploy
- Frontend → Vercel
- Backend → PartyKit Cloud