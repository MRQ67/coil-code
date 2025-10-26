/**
 * usePresence Hook
 * Tracks all connected users in real-time using Yjs awareness API
 * Provides live updates when users join/leave the collaboration session
 */

"use client";

import { useState, useEffect } from "react";
import type YPartyKitProvider from "y-partykit/provider";

// User information interface
export interface User {
  clientId: number; // Yjs client ID (unique per connection)
  username: string; // User's chosen name
  gender: "boy" | "girl" | "random"; // Avatar gender preference
  isCurrentUser: boolean; // True for the current user
  color?: string; // Optional: User's cursor color
}

// Awareness state structure from Yjs
interface AwarenessState {
  user?: {
    username: string;
    gender: "boy" | "girl" | "random";
    color?: string;
  };
}

// Hook return type
export interface UsePresenceReturn {
  users: User[]; // All connected users
  userCount: number; // Total number of users
  currentUser: User | null; // The current user
}

/**
 * Hook to track presence of all users in the collaboration session
 * @param provider - YPartyKitProvider instance from Yjs setup
 * @returns Object containing users array, count, and current user
 */
export function usePresence(
  provider: YPartyKitProvider | null,
): UsePresenceReturn {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (!provider || !provider.awareness) {
      return;
    }

    const awareness = provider.awareness;

    /**
     * Updates the users list from awareness states
     * Filters out invalid states and maps to User objects
     */
    const updateUsers = () => {
      // Get all awareness states (Map<clientId, state>)
      const states = awareness.getStates();
      const currentClientId = awareness.clientID;

      const userList: User[] = [];

      // Iterate through all connected clients
      states.forEach((state: AwarenessState, clientId: number) => {
        // Only include users with valid user info
        if (state.user && state.user.username) {
          userList.push({
            clientId,
            username: state.user.username,
            gender: state.user.gender || "random",
            isCurrentUser: clientId === currentClientId,
            color: state.user.color,
          });
        }
      });

      // Sort users: current user first, then by clientId
      userList.sort((a, b) => {
        if (a.isCurrentUser) return -1;
        if (b.isCurrentUser) return 1;
        return a.clientId - b.clientId;
      });

      setUsers(userList);
    };

    // Initial update
    updateUsers();

    // Subscribe to awareness changes
    // Fires when users join, leave, or update their state
    awareness.on("change", updateUsers);

    // Cleanup: unsubscribe on unmount
    return () => {
      awareness.off("change", updateUsers);
    };
  }, [provider]);

  // Calculate derived values
  const userCount = users.length;
  const currentUser = users.find((user) => user.isCurrentUser) || null;

  return {
    users,
    userCount,
    currentUser,
  };
}
