# PartyKit Yjs Server

A real-time collaborative editing server using PartyKit and Yjs.

## 🎯 Overview

This PartyKit server enables real-time collaborative code editing using:
- **PartyKit** - WebSocket server framework
- **y-partykit** - Yjs provider for PartyKit
- **Yjs** - CRDT (Conflict-free Replicated Data Type) for real-time collaboration

## 📦 Installation

```bash
bun install
```

## 🚀 Running the Server

### Development Mode

```bash
bun run dev
```

The server will start on `http://localhost:1999`

### Production Deployment

```bash
bun run deploy
```

## 📁 Project Structure

```
partykit/
├── server.ts           # Main Yjs server implementation
├── partykit.json      # PartyKit configuration
├── package.json       # Dependencies
└── tsconfig.json      # TypeScript configuration
```

## 🔧 Configuration

### partykit.json

```json
{
  "name": "coil-code",
  "main": "server.ts",
  "compatibilityDate": "2025-01-01",
  "parties": {
    "editor": "server.ts"
  }
}
```

### Server Endpoints

- **Main Party**: `ws://localhost:1999/parties/editor/:roomId`
- Each room is isolated by its unique `roomId`

## 📝 Server Implementation

The server uses `y-partykit` which provides:

1. **Automatic Yjs Synchronization** - Handles Yjs protocol messages
2. **WebSocket Management** - Manages connections and disconnections
3. **Awareness Protocol** - Tracks user presence and cursors
4. **Conflict Resolution** - CRDT-based automatic conflict resolution

### Basic Server Structure

```typescript
import type * as Party from "partykit/server";
import { onConnect } from "y-partykit";

export default class YjsServer implements Party.Server {
  constructor(public room: Party.Room) {}

  async onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    return onConnect(conn, this.room, {
      // Optional configuration
    });
  }
}
```

## ⚙️ Optional Configuration

### Persistence

Enable persistent storage to PartyKit's room storage:

```typescript
onConnect(conn, this.room, {
  persist: { mode: "snapshot" },
});
```

### Read-Only Mode

Disable editing for all connections:

```typescript
onConnect(conn, this.room, {
  readOnly: true,
});
```

### Custom Load/Save

Use external storage (e.g., MongoDB, S3):

```typescript
onConnect(conn, this.room, {
  async load() {
    // Load Yjs document from external storage
    const data = await fetchFromDatabase(this.room.id);
    return data ? Y.Doc.fromUint8Array(data) : null;
  },
  callback: {
    async handler(doc) {
      // Save Yjs document to external storage
      const data = Y.encodeStateAsUpdate(doc);
      await saveToDatabase(this.room.id, data);
    },
    debounceWait: 2000,      // Wait 2s after last edit
    debounceMaxWait: 10000,  // Save at least every 10s
    timeout: 5000            // Timeout for save operation
  }
});
```

## 🔌 Client Connection

Connect from the frontend using `y-partykit/provider`:

```typescript
import YPartyKitProvider from "y-partykit/provider";
import * as Y from "yjs";

const ydoc = new Y.Doc();
const provider = new YPartyKitProvider(
  "localhost:1999",  // PartyKit host
  "my-room-id",      // Room ID
  ydoc,              // Yjs document
  {
    party: "editor"  // Party name from partykit.json
  }
);
```

## 🐛 Troubleshooting

### Server Won't Start

**Error**: `No such module "partykit-exposed-cloudflare-workers"`
- **Solution**: Make sure you're using `y-partykit` (not `y-partyserver`)
- `y-partykit` is for PartyKit
- `y-partyserver` is for PartyServer (Cloudflare Workers)

### Port Already in Use

```bash
# Kill process on port 1999
lsof -ti:1999 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :1999   # Windows
```

### Module Not Found

```bash
# Reinstall dependencies
rm -rf node_modules bun.lock
bun install
```

### TypeScript Errors

```bash
# Check TypeScript configuration
bunx tsc --noEmit
```

## 📚 Key Differences: y-partykit vs y-partyserver

| Feature | y-partykit | y-partyserver |
|---------|-----------|---------------|
| **Platform** | PartyKit | PartyServer (Cloudflare Workers) |
| **Use Case** | PartyKit projects | Direct Cloudflare Workers |
| **Server API** | `Party.Server` interface | `Server` class (extends DurableObject) |
| **Setup** | Uses `onConnect` function | Extends `YServer` class |
| **This Project** | ✅ **We use this** | ❌ Not compatible |

## 🔗 Resources

- [PartyKit Documentation](https://docs.partykit.io/)
- [y-partykit API Reference](https://docs.partykit.io/reference/y-partykit-api/)
- [Yjs Documentation](https://docs.yjs.dev/)
- [PartyKit GitHub](https://github.com/partykit/partykit)

## 📄 License

MIT