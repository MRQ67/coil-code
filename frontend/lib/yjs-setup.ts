import * as Y from "yjs";
import YPartyKitProvider from "y-partykit/provider";

export interface CollaborativeDoc {
  ydoc: Y.Doc;
  ytext: Y.Text;
  provider: YPartyKitProvider;
}

/**
 * Creates and initializes a collaborative document with Yjs and PartyKit
 * @param roomId - Unique identifier for the collaboration room
 * @returns Object containing ydoc, ytext, and provider
 */
export function createCollaborativeDoc(roomId: string): CollaborativeDoc {
  if (!roomId) {
    throw new Error("roomId is required to create a collaborative document");
  }

  // Get PartyKit host - default to localhost:1999 for development
  const partykitHost = "localhost:1999";

  // Create a new Yjs document
  const ydoc = new Y.Doc();

  // Create a shared text type named 'content'
  const ytext = ydoc.getText("content");

  // Initialize YPartyKitProvider with the roomId and connect to PartyKit
  const provider = new YPartyKitProvider(partykitHost, roomId, ydoc, {
    connect: true, // Connect immediately
  });

  return {
    ydoc,
    ytext,
    provider,
  };
}

/**
 * Cleans up and destroys a collaborative document
 * @param doc - The collaborative document to destroy
 */
export function destroyCollaborativeDoc(doc: CollaborativeDoc | null): void {
  if (!doc) return;

  try {
    // Disconnect and destroy the provider
    doc.provider.disconnect();
    doc.provider.destroy();

    // Destroy the Yjs document
    doc.ydoc.destroy();
  } catch (error) {
    console.error("Error destroying collaborative document:", error);
  }
}
