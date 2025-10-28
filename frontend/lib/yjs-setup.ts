import * as Y from "yjs";
import YPartyKitProvider from "y-partykit/provider";
import { assignUserColor } from "./cursor-colors";
import { ensureUniqueColor, releaseColor } from "./ensure-unique-colors";

export interface CollaborativeDoc {
  ydoc: Y.Doc;
  ytext: Y.Text;
  provider: YPartyKitProvider;
}

/**
 * Get the appropriate PartyKit host based on environment
 * Priority: Environment variable > Local network IP > localhost
 */
function getPartykitHost(): string {
  // Check for environment variable (for production or custom setup)
  if (typeof window !== "undefined") {
    const envHost = process.env.NEXT_PUBLIC_PARTYKIT_HOST;
    if (envHost) {
      return envHost;
    }
  }

  // For development: try to use local network IP instead of localhost
  // This allows other devices on the same network to connect
  if (
    typeof window !== "undefined" &&
    window.location.hostname !== "localhost"
  ) {
    // If accessing via IP (e.g., 192.168.1.x), use that IP with PartyKit port
    return `${window.location.hostname}:1999`;
  }

  // Fallback to localhost for same-machine development
  return "localhost:1999";
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

  // Get PartyKit host based on environment
  const partykitHost = getPartykitHost();

  console.log(`🔌 Connecting to PartyKit at: ${partykitHost}`);

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
 * Sets user awareness information in the Yjs provider
 * @param provider - YPartyKitProvider instance
 * @param userInfo - User information including username and gender
 */
export function setUserAwareness(
  provider: YPartyKitProvider,
  userInfo: {
    username: string;
    gender: "boy" | "girl" | "random";
  },
): void {
  if (!provider || !provider.awareness) {
    console.warn("Provider or awareness not available");
    return;
  }

  // Get deterministic color per user using username + clientId
  // Ensures different users get different colors even across sessions
  const clientId = provider.awareness.clientID;
  const desiredColor = assignUserColor(clientId, userInfo.username);

  // Extract room ID from URL (provider doesn't have room property)
  const roomId = window.location.pathname.split("/").pop() || "default";

  // Ensure the color is unique in this room
  const color = ensureUniqueColor(
    roomId,
    clientId,
    desiredColor,
    provider.awareness,
  );

  // Set local user state in awareness
  // IMPORTANT: Y-Monaco looks for 'name' field for cursor labels
  const awarenessData = {
    name: userInfo.username, // Y-Monaco reads this for cursor labels
    username: userInfo.username, // Keep for app logic compatibility
    gender: userInfo.gender, // For avatar display
    color: color, // Deterministic cursor color
  };

  provider.awareness.setLocalStateField("user", awarenessData);

  console.log(`👤 User awareness set: ${userInfo.username} (${color})`);
  console.log(`📋 Full awareness data:`, awarenessData);
  console.log(
    `🔍 Verifying awareness was set:`,
    provider.awareness.getLocalState(),
  );

  // Double-check that name field is set correctly
  const localState = provider.awareness.getLocalState();
  if (!localState?.user?.name) {
    console.error(`❌ CRITICAL: 'name' field not set in awareness!`);
    console.error(`   Awareness state:`, localState);
  } else {
    console.log(
      `✅ Confirmed: name="${localState.user.name}" is set in awareness`,
    );
  }
}

/**
 * Cleans up and destroys a collaborative document
 * @param doc - The collaborative document to destroy
 */
export function destroyCollaborativeDoc(doc: CollaborativeDoc | null): void {
  if (!doc) return;

  try {
    // Release the color assignment for this client
    const roomId = window.location.pathname.split("/").pop() || "default";
    const clientId = doc.provider.awareness?.clientID;
    if (clientId) {
      releaseColor(roomId, clientId);
    }

    // Disconnect and destroy the provider
    doc.provider.disconnect();
    doc.provider.destroy();

    // Destroy the Yjs document
    doc.ydoc.destroy();
  } catch (error) {
    console.error("Error destroying collaborative document:", error);
  }
}
