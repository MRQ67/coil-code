/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Awareness Testing Utility
 *
 * This is a temporary utility for Phase 1 verification.
 * Use this to verify that Yjs awareness is properly syncing
 * user information across multiple clients.
 *
 * IMPORTANT: Remove this file and its imports after verification is complete.
 */

/**
 * Test awareness sync and display detailed information
 *
 * @param provider - YPartyKitProvider instance
 */
export function testAwareness(provider: any): void {
  if (!provider || !provider.awareness) {
    console.error("❌ Provider or awareness not available");
    return;
  }

  console.log("");
  console.log("========================================");
  console.log("=== AWARENESS VERIFICATION TEST ===");
  console.log("========================================");
  console.log("");

  // Local client information
  const clientId = provider.awareness.clientID;
  console.log("🆔 Local Client ID:", clientId);

  // Get all connected users
  const states = provider.awareness.getStates();
  const userCount = states.size;
  console.log("👥 Connected Users:", userCount);
  console.log("");

  // Display all user states
  if (userCount > 0) {
    console.log("📋 All User States:");
    console.log("-------------------");

    states.forEach((state: any, id: number) => {
      const isLocal = id === clientId;
      const prefix = isLocal ? "👤 YOU" : "👥 USER";

      console.log(`${prefix} (Client ID: ${id})`);

      if (state.user) {
        console.log("  ✅ User info present:");
        console.log("     - name:", state.user.name || "❌ MISSING");
        console.log("     - username:", state.user.username || "❌ MISSING");
        console.log("     - gender:", state.user.gender || "❌ MISSING");
        console.log("     - color:", state.user.color || "❌ MISSING");

        // Validate Y-Monaco required fields
        if (state.user.name) {
          console.log(
            '     ✅ "name" field present (Y-Monaco will show cursor label)',
          );
        } else {
          console.log(
            '     ⚠️  "name" field MISSING (cursor label will not appear!)',
          );
        }
      } else {
        console.log("  ❌ User info NOT SET");
      }
      console.log("");
    });
  } else {
    console.log("⚠️  No users connected");
  }

  // Check local user state specifically
  console.log("-------------------");
  console.log("🔍 Local State Check:");
  const localState = provider.awareness.getLocalState();

  if (localState?.user) {
    console.log("✅ Local user info is properly set");
    console.log("   Username:", localState.user.username);
    console.log("   Name (for cursors):", localState.user.name || "❌ MISSING");
    console.log("   Gender:", localState.user.gender);
    console.log("   Color:", localState.user.color);
  } else {
    console.log("❌ Local user info is NOT set");
    console.log("   This means cursors will not work for this user!");
  }

  console.log("");
  console.log("========================================");
  console.log("=== VERIFICATION RESULTS ===");
  console.log("========================================");

  // Verification checklist
  const checks = {
    hasMultipleUsers: userCount >= 2,
    hasLocalUserInfo: !!localState?.user,
    hasNameField: !!localState?.user?.name,
    hasColorField: !!localState?.user?.color,
    hasUsernameField: !!localState?.user?.username,
  };

  if (checks.hasMultipleUsers) {
    console.log("✅ Multiple users connected");
  } else {
    console.log("⚠️  Only 1 user connected (open another tab to test)");
  }

  if (checks.hasLocalUserInfo) {
    console.log("✅ Local user info is set");
  } else {
    console.log("❌ Local user info is NOT set");
  }

  if (checks.hasNameField) {
    console.log('✅ "name" field present (cursors will show labels)');
  } else {
    console.log('❌ "name" field MISSING (cursor labels will NOT appear!)');
  }

  if (checks.hasColorField) {
    console.log('✅ "color" field present');
  } else {
    console.log('⚠️  "color" field missing');
  }

  if (checks.hasUsernameField) {
    console.log('✅ "username" field present');
  } else {
    console.log('⚠️  "username" field missing');
  }

  console.log("");

  const allChecksPassed = Object.values(checks).every((check) => check);

  if (allChecksPassed) {
    console.log("🎉 ALL CHECKS PASSED! Awareness is working correctly.");
    console.log("   Cursors should be visible in the editor.");
  } else {
    console.log("⚠️  SOME CHECKS FAILED. Review the issues above.");
    if (!checks.hasNameField) {
      console.log(
        '   → Fix: Ensure awareness.setLocalState includes "name" field',
      );
    }
  }

  console.log("========================================");
  console.log("");
}

/**
 * Lightweight awareness monitor that logs changes
 * Use this to see real-time awareness updates
 *
 * @param provider - YPartyKitProvider instance
 * @returns Cleanup function to stop monitoring
 */
export function monitorAwareness(provider: any): () => void {
  if (!provider || !provider.awareness) {
    console.error("❌ Provider or awareness not available");
    return () => {};
  }

  console.log("👀 Monitoring awareness changes...");

  const handler = () => {
    const states = provider.awareness.getStates();
    const users = Array.from(states.values())
      .filter((state: any) => state.user)
      .map((state: any) => state.user.name || state.user.username);

    console.log(`👥 ${states.size} users connected:`, users.join(", "));
  };

  provider.awareness.on("change", handler);

  // Return cleanup function
  return () => {
    provider.awareness.off("change", handler);
    console.log("✋ Stopped monitoring awareness");
  };
}

/**
 * Quick test to verify awareness is initialized
 *
 * @param provider - YPartyKitProvider instance
 * @returns True if awareness is working
 */
export function quickAwarenessCheck(provider: any): boolean {
  if (!provider?.awareness) {
    console.error("❌ Awareness not available");
    return false;
  }

  const localState = provider.awareness.getLocalState();
  const hasUserInfo = !!localState?.user;
  const hasName = !!localState?.user?.name;

  if (!hasUserInfo) {
    console.error("❌ Local user info not set in awareness");
    return false;
  }

  if (!hasName) {
    console.warn(
      '⚠️  User "name" field not set - cursor labels will not appear',
    );
    return false;
  }

  console.log("✅ Awareness is properly configured");
  return true;
}
