# 🚀 Quick Start Guide - Collaborative Code Editor

Get your collaborative code editor running in under 5 minutes!

## ✅ Prerequisites

- **Bun** or **Node.js** (v18+) installed
- **MongoDB URI** (for persistence - optional for now)

## 📋 Step-by-Step Setup

### 1️⃣ Install Dependencies

```bash
# Install PartyKit server dependencies
cd partykit
bun install  # or: npm install

# Install frontend dependencies
cd ../frontend
bun install  # or: npm install
```

### 2️⃣ Configure Environment Variables

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_PARTYKIT_HOST=localhost:1999
NEXT_PUBLIC_APP_URL=http://localhost:3000
MONGODB_URI=mongodb+srv://your-connection-string  # Optional
```

### 3️⃣ Start the PartyKit Server

Open **Terminal 1**:

```bash
cd partykit
bun run dev
```

✅ You should see:
```
🎈 PartyKit v0.0.115
---------------------
Build succeeded, starting server...
[pk:inf] Ready on http://0.0.0.0:1999
```

### 4️⃣ Start the Next.js Frontend

Open **Terminal 2**:

```bash
cd frontend
bun run dev  # or: npm run dev
```

✅ You should see:
```
▲ Next.js 16.0.0
- Local:        http://localhost:3000
```

### 5️⃣ Test the Application

1. Open your browser to **http://localhost:3000**
2. Click the **"Create New Room"** button
3. You'll be redirected to `/editor/[unique-room-id]`
4. Open the **same URL** in another browser tab/window
5. Start typing in one tab and watch it appear in the other! ✨

## 🎯 Architecture Overview

```
┌─────────────────┐          WebSocket          ┌─────────────────┐
│   Browser 1     │◄──────────────────────────►│   PartyKit      │
│  Monaco Editor  │        (Port 1999)         │   Yjs Server    │
└─────────────────┘                             └─────────────────┘
                                                         ▲
                                                         │
┌─────────────────┐          WebSocket                  │
│   Browser 2     │◄────────────────────────────────────┘
│  Monaco Editor  │
└─────────────────┘
```

## 🔍 What's Happening?

1. **Frontend** (Next.js) connects to **PartyKit server** via WebSocket
2. **Yjs** uses CRDTs to sync document state between clients
3. **Monaco Editor** binding updates the editor in real-time
4. All edits are **automatically merged** without conflicts

## 🛠️ Project Structure

```
collaborative-editor/
├── partykit/                # WebSocket server (Port 1999)
│   ├── server.ts           # Yjs PartyKit server
│   ├── partykit.json       # PartyKit config
│   └── package.json
│
└── frontend/               # Next.js app (Port 3000)
    ├── app/
    │   ├── page.tsx                    # Home page
    │   └── editor/[roomId]/page.tsx    # Editor page
    ├── components/
    │   └── editor/CollaborativeEditor.tsx
    ├── lib/
    │   └── yjs-setup.ts
    └── package.json
```

## 📝 Testing Collaboration

### Method 1: Multiple Browser Tabs
1. Open room in Tab 1
2. Copy the URL
3. Open same URL in Tab 2
4. Type in either tab - see real-time sync! ✨

### Method 2: Different Browsers
1. Open in Chrome: `http://localhost:3000/editor/abc123`
2. Open in Firefox: `http://localhost:3000/editor/abc123`
3. Edit from both - perfect sync! 🎉

### Method 3: Private/Incognito Mode
1. Normal window: Create room
2. Incognito window: Open same room URL
3. Edit from both - watch the magic! ⚡

## 🎨 Features to Try

- ✅ **Real-time Sync** - Type and see updates instantly
- ✅ **Multi-cursor** - See where others are editing
- ✅ **Conflict-free** - Yjs CRDTs handle conflicts automatically
- ✅ **Low Latency** - WebSocket connection for fast updates
- ✅ **Offline-ready** - Edits sync when connection restored

## 🔧 Common Issues

### ❌ "Cannot connect to room"

**Problem**: Frontend can't reach PartyKit server

**Solutions**:
```bash
# 1. Check PartyKit is running
cd partykit
bun run dev

# 2. Verify port 1999 is not blocked
curl http://localhost:1999

# 3. Check .env.local
cat frontend/.env.local
# Should have: NEXT_PUBLIC_PARTYKIT_HOST=localhost:1999
```

### ❌ "Module not found" errors

**Solution**:
```bash
# Reinstall dependencies
cd partykit
rm -rf node_modules bun.lock
bun install

cd ../frontend
rm -rf node_modules bun.lock .next
bun install
```

### ❌ Monaco Editor not loading

**Solution**:
```bash
# Clear Next.js cache
cd frontend
rm -rf .next
bun run dev
```

### ❌ Port already in use

**Solution**:
```bash
# For port 1999 (PartyKit)
lsof -ti:1999 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :1999   # Windows (then kill PID)

# For port 3000 (Next.js)
lsof -ti:3000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :3000   # Windows (then kill PID)
```

## 🚀 Next Steps

### Add More Features

1. **User Cursors & Colors**
   ```typescript
   // Show colored cursors for each user
   provider.awareness.setLocalStateField('user', {
     name: 'Alice',
     color: '#ff0000'
   });
   ```

2. **Language Selection**
   - Add dropdown to change editor language
   - Support TypeScript, Python, Java, etc.

3. **Code Execution**
   - Add "Run Code" button
   - Use Judge0 API or similar

4. **Persistence**
   - Save to MongoDB after edits
   - Load previous sessions

5. **Authentication**
   - Add user login
   - Private/public rooms

### Deploy to Production

**Frontend (Vercel)**:
```bash
cd frontend
vercel deploy
```

**Backend (PartyKit)**:
```bash
cd partykit
bun run deploy
```

Update `.env.local`:
```env
NEXT_PUBLIC_PARTYKIT_HOST=your-app.partykit.dev
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

## 📚 Learn More

- [PartyKit Docs](https://docs.partykit.io/)
- [Yjs Guide](https://docs.yjs.dev/)
- [Monaco Editor API](https://microsoft.github.io/monaco-editor/)
- [Next.js Documentation](https://nextjs.org/docs)

## 🎉 Success!

If you see real-time synchronization between multiple tabs/browsers, congratulations! Your collaborative code editor is working perfectly! 🚀

**Happy Collaborative Coding!** 💻✨

---

### Need Help?

- Check the detailed `SETUP.md` in the frontend directory
- Review `README.md` in the partykit directory
- Open an issue if you encounter problems

**Built with:** Next.js 15 • Yjs • PartyKit • Monaco Editor • TypeScript