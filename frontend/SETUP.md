# Collaborative Code Editor - Frontend Setup

## 🎉 Setup Complete!

All core frontend files have been created successfully. Your collaborative code editor is ready to run!

## 📁 Project Structure

```
frontend/
├── app/
│   ├── page.tsx                    # Home page with room creation
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Global styles
│   └── editor/
│       └── [roomId]/
│           └── page.tsx            # Dynamic editor room page
├── components/
│   └── editor/
│       └── CollaborativeEditor.tsx # Monaco editor with Yjs binding
├── lib/
│   └── yjs-setup.ts               # Yjs document setup utilities
└── package.json                    # Dependencies
```

## 📝 File Descriptions

### 1. **lib/yjs-setup.ts**
Utility functions for creating and managing collaborative documents:
- `createCollaborativeDoc(roomId)` - Creates Y.Doc, Y.Text, and YPartyKitProvider
- `destroyCollaborativeDoc(doc)` - Cleans up resources on unmount
- Exports `CollaborativeDoc` TypeScript interface

### 2. **components/editor/CollaborativeEditor.tsx**
React component that renders the Monaco Editor with Yjs synchronization:
- Uses `@monaco-editor/react` for the editor
- Creates `MonacoBinding` to sync editor with Yjs
- Properly handles mounting, binding creation, and cleanup
- Configured with: minimap disabled, 14px font, dark theme, automatic layout

### 3. **app/editor/[roomId]/page.tsx**
Dynamic route page for collaborative editing sessions:
- Gets `roomId` from URL parameters
- Initializes collaborative document on mount
- Shows loading state while connecting
- Displays error state for invalid rooms
- Cleans up resources on unmount
- Beautiful header with room ID and connection status

### 4. **app/page.tsx**
Home page for creating new collaboration rooms:
- Clean, modern UI with gradient background
- "Create New Room" button generates unique 10-char IDs using nanoid
- Displays feature cards (Real-time Sync, Private Rooms, Modern Editor)
- Navigates to `/editor/[roomId]` on room creation
- Fully responsive design

## 🚀 Running the Application

### 1. Ensure Environment Variables are Set

Create `.env.local` in the frontend directory with:

```env
NEXT_PUBLIC_PARTYKIT_HOST=localhost:1999
NEXT_PUBLIC_APP_URL=http://localhost:3000
MONGODB_URI=mongodb+srv://editor-admin:your-password@cluster.mongodb.net/
```

### 2. Start the PartyKit Server

In the `partykit` directory:

```bash
cd ../partykit
npm run dev
```

This starts the PartyKit server on `localhost:1999`

### 3. Start the Next.js Frontend

In the `frontend` directory:

```bash
npm run dev
```

This starts Next.js on `http://localhost:3000`

### 4. Test the Application

1. Open `http://localhost:3000` in your browser
2. Click "Create New Room"
3. You'll be redirected to `/editor/[roomId]`
4. Open the same URL in another browser window/tab
5. Start typing - you should see real-time synchronization!

## 🔧 Key Technologies Used

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe code
- **Yjs** - CRDT for conflict-free collaborative editing
- **y-partykit** - Yjs provider for PartyKit WebSocket backend
- **y-monaco** - Monaco Editor binding for Yjs
- **Monaco Editor** - VS Code's editor component
- **Tailwind CSS** - Utility-first styling
- **nanoid** - Unique ID generation

## 🎨 Customization

### Change Editor Language

In `components/editor/CollaborativeEditor.tsx`:

```tsx
<Editor
  defaultLanguage="typescript" // Change to: python, java, etc.
  // ...
/>
```

### Change Editor Theme

```tsx
<Editor
  theme="vs-light" // Change to: vs-dark, hc-black, etc.
  // ...
/>
```

### Adjust Monaco Options

```tsx
options={{
  minimap: { enabled: true },      // Enable minimap
  fontSize: 16,                     // Larger font
  lineNumbers: "relative",          // Relative line numbers
  wordWrap: "on",                   // Word wrapping
  // ... more options
}}
```

## 🐛 Troubleshooting

### "Cannot connect to room"

- Ensure PartyKit server is running on `localhost:1999`
- Check `NEXT_PUBLIC_PARTYKIT_HOST` in `.env.local`
- Verify no firewall is blocking WebSocket connections

### Monaco Editor not loading

- Check browser console for errors
- Ensure `@monaco-editor/react` is installed: `npm install`
- Try clearing `.next` cache: `rm -rf .next && npm run dev`

### TypeScript errors

- Run `npm run build` to check for type errors
- Ensure all types are properly imported
- Check `tsconfig.json` configuration

### Synchronization not working

- Open browser DevTools Network tab
- Look for WebSocket connection to PartyKit
- Check for any connection errors in console
- Verify both clients are connected to the same room ID

## 📦 Dependencies

All required dependencies are already in `package.json`:

- `next` v16.0.0
- `react` & `react-dom` v19.2.0
- `yjs` v13.6.27
- `y-partykit` v0.0.33
- `y-monaco` v0.1.6
- `@monaco-editor/react` v4.7.0
- `nanoid` v5.1.6
- `tailwindcss` v4
- `typescript` v5

## 🚀 Next Steps

Consider adding these features:

1. **User Cursors & Awareness**
   - Show other users' cursor positions
   - Display user names/colors

2. **Language Selection**
   - Dropdown to change programming language
   - Persist language selection

3. **Room Management**
   - List of recent rooms
   - Room passwords/authentication
   - Room settings (read-only mode, etc.)

4. **Code Execution**
   - Run code button
   - Output panel
   - Support multiple languages

5. **Chat/Comments**
   - Sidebar chat using Yjs
   - Code comments/annotations

6. **Persistence**
   - Save code to MongoDB
   - Load previous sessions
   - Auto-save functionality

## 📄 License

MIT License - Feel free to use this in your projects!

## 🤝 Contributing

This is a starter template. Feel free to extend and customize it for your needs!

---

**Happy Collaborative Coding! 🎉**