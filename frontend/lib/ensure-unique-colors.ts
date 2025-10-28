/**
 * Ensure Unique Colors System
 *
 * This module ensures that no two users in a room get the same cursor color.
 * It tracks assigned colors and resolves collisions automatically.
 */

import { CURSOR_COLORS } from "./cursor-colors";

/**
 * Global map to track which colors are already assigned in each room
 * Key: roomId, Value: Map of clientId to color
 */
const roomColorAssignments = new Map<string, Map<number, string>>();

/**
 * Global map to track color usage count in each room
 * Key: roomId, Value: Map of color to usage count
 */
const roomColorUsage = new Map<string, Map<string, number>>();

/**
 * Ensures a unique color for a user in a specific room
 * If the desired color is taken, assigns the next available color
 *
 * @param roomId - The room identifier
 * @param clientId - The client ID
 * @param desiredColor - The initially calculated color
 * @param awareness - The awareness instance to check other users
 * @returns A unique color for this user
 */
export function ensureUniqueColor(
  roomId: string,
  clientId: number,
  desiredColor: string,
  awareness?: { getStates: () => Map<number, { user?: { color?: string } }> },
): string {
  // Initialize room maps if needed
  if (!roomColorAssignments.has(roomId)) {
    roomColorAssignments.set(roomId, new Map());
    roomColorUsage.set(roomId, new Map());
  }

  const assignments = roomColorAssignments.get(roomId)!;
  const usage = roomColorUsage.get(roomId)!;

  // Check if this client already has a color assigned
  const existingColor = assignments.get(clientId);
  if (existingColor) {
    console.log(
      `🎨 Returning existing color for client ${clientId}: ${existingColor}`,
    );
    return existingColor;
  }

  // Build a set of colors currently in use by OTHER clients
  const colorsInUse = new Set<string>();

  // Check awareness for other users' colors
  if (awareness) {
    const states = awareness.getStates();
    states.forEach((state: { user?: { color?: string } }, id: number) => {
      if (id !== clientId && state.user?.color) {
        colorsInUse.add(state.user.color);
      }
    });
  }

  // Also check our local assignments
  assignments.forEach((color, id) => {
    if (id !== clientId) {
      colorsInUse.add(color);
    }
  });

  console.log(`🎨 Colors already in use:`, Array.from(colorsInUse));

  // If desired color is available, use it
  if (!colorsInUse.has(desiredColor)) {
    assignments.set(clientId, desiredColor);
    usage.set(desiredColor, (usage.get(desiredColor) || 0) + 1);
    console.log(
      `✅ Assigned desired color ${desiredColor} to client ${clientId}`,
    );
    return desiredColor;
  }

  // Find the first available color
  let assignedColor = desiredColor;
  for (const color of CURSOR_COLORS) {
    if (!colorsInUse.has(color)) {
      assignedColor = color;
      break;
    }
  }

  // If all colors are taken (unlikely with 15 colors), use the least used one
  if (colorsInUse.has(assignedColor)) {
    let minUsage = Infinity;
    let leastUsedColor: string = CURSOR_COLORS[0];

    for (const color of CURSOR_COLORS) {
      const colorUsage = usage.get(color) || 0;
      if (colorUsage < minUsage) {
        minUsage = colorUsage;
        leastUsedColor = color;
      }
    }
    assignedColor = leastUsedColor;
    console.log(`⚠️ All colors taken, using least used: ${assignedColor}`);
  } else {
    console.log(
      `✅ Collision resolved, assigned alternative color ${assignedColor} to client ${clientId}`,
    );
  }

  // Record the assignment
  assignments.set(clientId, assignedColor);
  usage.set(assignedColor, (usage.get(assignedColor) || 0) + 1);

  return assignedColor;
}

/**
 * Releases a color assignment when a user leaves
 *
 * @param roomId - The room identifier
 * @param clientId - The client ID leaving
 */
export function releaseColor(roomId: string, clientId: number): void {
  const assignments = roomColorAssignments.get(roomId);
  const usage = roomColorUsage.get(roomId);

  if (!assignments || !usage) {
    return;
  }

  const color = assignments.get(clientId);
  if (color) {
    assignments.delete(clientId);
    const currentUsage = usage.get(color) || 1;
    if (currentUsage <= 1) {
      usage.delete(color);
    } else {
      usage.set(color, currentUsage - 1);
    }
    console.log(`🎨 Released color ${color} from client ${clientId}`);
  }

  // Clean up empty room maps
  if (assignments.size === 0) {
    roomColorAssignments.delete(roomId);
    roomColorUsage.delete(roomId);
  }
}

/**
 * Gets the current color assignments for debugging
 *
 * @param roomId - The room identifier
 * @returns Map of clientId to color
 */
export function getColorAssignments(
  roomId: string,
): Map<number, string> | undefined {
  return roomColorAssignments.get(roomId);
}

/**
 * Clears all color assignments for a room (for testing)
 *
 * @param roomId - The room identifier
 */
export function clearRoomColors(roomId: string): void {
  roomColorAssignments.delete(roomId);
  roomColorUsage.delete(roomId);
  console.log(`🎨 Cleared all color assignments for room ${roomId}`);
}

/**
 * Debug function to display current color assignments
 *
 * @param roomId - The room identifier
 */
export function debugColorAssignments(roomId: string): void {
  const assignments = roomColorAssignments.get(roomId);
  const usage = roomColorUsage.get(roomId);

  console.log(`🎨 COLOR ASSIGNMENTS FOR ROOM: ${roomId}`);
  console.log("================================");

  if (!assignments || assignments.size === 0) {
    console.log("No color assignments in this room");
    return;
  }

  console.log("Client -> Color:");
  assignments.forEach((color, clientId) => {
    console.log(`  ${clientId} -> ${color}`);
  });

  console.log("\nColor Usage Count:");
  usage?.forEach((count, color) => {
    console.log(`  ${color}: ${count} user(s)`);
  });

  console.log("================================");
}
