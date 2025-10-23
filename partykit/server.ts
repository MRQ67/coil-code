import type * as Party from "partykit/server";
import { onConnect } from "y-partykit";

// Y-PartyKit Server handles:
// - WebSocket connections for Yjs
// - Yjs document synchronization
// - Room management
// - User presence/awareness
// - Automatic persistence to PartyKit storage

export default class YjsServer implements Party.Server {
  constructor(public room: Party.Room) {}

  async onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    // Use y-partykit's onConnect to handle Yjs synchronization
    return onConnect(conn, this.room, {
      // Optional: persist the document to PartyKit's room storage
      // persist: { mode: "snapshot" },
      // Optional: enable read-only mode
      // readOnly: false,
      // Optional: custom load function
      // async load() {
      //   // Load document from external storage
      //   return null;
      // },
      // Optional: custom save callback
      // callback: {
      //   async handler(doc) {
      //     // Save document to external storage
      //   },
      //   debounceWait: 2000,
      //   debounceMaxWait: 10000,
      //   timeout: 5000
      // }
    });
  }
}
