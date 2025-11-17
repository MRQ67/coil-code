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
 * Returns hostname:port format (y-partykit will handle protocol)
 */
function getPartykitHost(): string {
  // Ensure we're in a browser environment
  if (typeof window === "undefined") {
    // Fallback for SSR (should not happen, but safety check)
    return "localhost:1999";
  }

  // Check for environment variable (for production or custom setup)
  const envHost = process.env.NEXT_PUBLIC_PARTYKIT_HOST;
  if (envHost && envHost.trim() !== "") {
    // Remove protocol if present (y-partykit handles this)
    const hostWithoutProtocol = envHost
      .replace(/^wss?:\/\//, "")
      .replace(/^https?:\/\//, "")
      .trim();
    if (hostWithoutProtocol) {
      return hostWithoutProtocol;
    }
  }

  // For development: try to use local network IP instead of localhost
  // This allows other devices on the same network to connect
  // Ensure window.location is available and has hostname
  if (
    window.location &&
    window.location.hostname &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
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
  if (!roomId || typeof roomId !== "string" || roomId.trim() === "") {
    throw new Error("roomId is required to create a collaborative document");
  }

  // Ensure we're in a browser environment
  if (typeof window === "undefined") {
    throw new Error("createCollaborativeDoc can only be called in a browser environment");
  }

  // Get PartyKit host based on environment
  let partykitHost = getPartykitHost();

  if (!partykitHost || typeof partykitHost !== "string") {
    throw new Error("Failed to determine PartyKit host");
  }

  // Clean and validate the host
  partykitHost = partykitHost.trim();
  if (partykitHost === "") {
    throw new Error("PartyKit host cannot be empty");
  }

  // Ensure host is in correct format: hostname:port (no protocol, no slashes)
  // Remove any protocol prefixes that might have been added
  partykitHost = partykitHost.replace(/^wss?:\/\//, "").replace(/^https?:\/\//, "");
  // Remove any trailing slashes
  partykitHost = partykitHost.replace(/\/+$/, "");
  
  // Validate format: should be hostname:port or just hostname
  if (!/^[\w\.-]+(:\d+)?$/.test(partykitHost)) {
    console.warn(`⚠️ PartyKit host format may be invalid: ${partykitHost}`);
  }

  console.log(`🔌 Connecting to PartyKit at: ${partykitHost}`);

  // Create a new Yjs document
  const ydoc = new Y.Doc();

  // Create a shared text type named 'content'
  const ytext = ydoc.getText("content");

  // Initialize YPartyKitProvider with the roomId and connect to PartyKit
  // Ensure all parameters are valid
  try {
    // Validate that we have all required parameters
    if (!ydoc) {
      throw new Error("Yjs document is required");
    }
    if (!roomId || roomId.trim() === "") {
      throw new Error("Room ID is required");
    }
    if (!partykitHost || partykitHost.trim() === "") {
      throw new Error("PartyKit host is required");
    }

    // Create provider with explicit options
    // Note: y-partykit expects hostname:port format, not a full URL
    // The provider will construct the WebSocket URL internally
    const providerOptions: any = {
      connect: true, // Connect immediately
    };

    // Only add party option if we have a specific party configured
    // Otherwise, y-partykit will use the default "main" party
    // (This matches the test page which doesn't specify a party)

    // Ensure all parameters are strings and not undefined
    const host = String(partykitHost);
    const room = String(roomId);

    if (!host || host === "undefined" || host === "null") {
      throw new Error(`Invalid PartyKit host: ${host}`);
    }
    if (!room || room === "undefined" || room === "null") {
      throw new Error(`Invalid room ID: ${room}`);
    }

    // Create the provider - y-partykit will handle URL construction internally
    const provider = new YPartyKitProvider(host, room, ydoc, providerOptions);

    if (!provider) {
      throw new Error("Failed to create YPartyKitProvider - provider is null");
    }

    // Verify provider has required properties
    if (typeof provider.connect !== "function" && providerOptions.connect) {
      console.warn("Provider created but connect method not available");
    }

    return {
      ydoc,
      ytext,
      provider,
    };
  } catch (error) {
    // Clean up on error
    if (ydoc) {
      try {
        ydoc.destroy();
      } catch (destroyError) {
        console.error("Error destroying Yjs document:", destroyError);
      }
    }
    // Re-throw with more context
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to create collaborative document: ${errorMessage}`);
  }
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
