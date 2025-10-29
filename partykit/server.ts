import type * as Party from "partykit/server";
import { onConnect } from "y-partykit";

// Y-PartyKit Server handles:
// - WebSocket connections for Yjs
// - Yjs document synchronization
// - Room management
// - User presence/awareness
// 
// Note: Persistence is handled by Next.js API routes, not in the PartyKit server

export default class YjsServer implements Party.Server {
  constructor(public room: Party.Room) {}

  async onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    // Use y-partykit's onConnect to handle Yjs synchronization
    return onConnect(conn, this.room, {
      // Document persistence is handled by the Next.js application
      // through API routes that interact with MongoDB
    });
  }
}
