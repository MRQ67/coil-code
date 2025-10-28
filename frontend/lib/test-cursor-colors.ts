/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Comprehensive Cursor Color Testing Utilities
 *
 * This file provides diagnostic and testing tools to verify that
 * cursor colors are being applied correctly in Y-Monaco.
 *
 * Usage: Import these functions in the browser console or use the
 * global window functions exposed by CollaborativeEditor.
 */

/**
 * Complete diagnostic report on cursor color system
 * This is the main function to run when debugging color issues
 */
export function fullCursorDiagnostics(provider: any): void {
  console.clear();
  console.log("");
  console.log("═══════════════════════════════════════════════════════");
  console.log("🔬 COMPREHENSIVE CURSOR COLOR DIAGNOSTICS");
  console.log("═══════════════════════════════════════════════════════");
  console.log("");

  if (!provider?.awareness) {
    console.error("❌ FATAL: Provider or awareness not available");
    console.error("   Make sure you're calling this after editor is mounted");
    return;
  }

  // Section 1: Awareness State
  console.log("📊 SECTION 1: AWARENESS STATE");
  console.log("─────────────────────────────────────────────────────");
  checkAwarenessState(provider);
  console.log("");

  // Section 2: DOM Elements
  console.log("🌐 SECTION 2: DOM ELEMENTS");
  console.log("─────────────────────────────────────────────────────");
  checkDOMElements();
  console.log("");

  // Section 3: Color Application Status
  console.log("🎨 SECTION 3: COLOR APPLICATION STATUS");
  console.log("─────────────────────────────────────────────────────");
  checkColorApplication(provider);
  console.log("");

  // Section 4: CSS and Styling
  console.log("💅 SECTION 4: CSS AND STYLING");
  console.log("─────────────────────────────────────────────────────");
  checkCSSStatus();
  console.log("");

  // Section 5: Recommendations
  console.log("💡 SECTION 5: RECOMMENDATIONS");
  console.log("─────────────────────────────────────────────────────");
  provideRecommendations(provider);
  console.log("");

  console.log("═══════════════════════════════════════════════════════");
  console.log("✅ Diagnostic complete!");
  console.log("═══════════════════════════════════════════════════════");
  console.log("");
}

/**
 * Check awareness state and user data
 */
function checkAwarenessState(provider: any): void {
  const states = provider.awareness.getStates();
  const localClientId = provider.awareness.clientID;
  const localState = provider.awareness.getLocalState();

  console.log(`   Local Client ID: ${localClientId}`);
  console.log(`   Total Connected Users: ${states.size}`);
  console.log("");

  // Check local user state
  console.log("   👤 LOCAL USER (YOU):");
  if (localState?.user) {
    const user = localState.user;
    console.log(`      Name: ${user.name || "NOT SET"}`);
    console.log(`      Username: ${user.username || "NOT SET"}`);
    console.log(
      `      Color: %c${user.color || "NOT SET"}`,
      `color: ${user.color}; font-weight: bold`,
    );
    console.log(`      Gender: ${user.gender || "NOT SET"}`);

    if (!user.name) {
      console.warn("      ⚠️  WARNING: 'name' field is missing!");
    }
    if (!user.color) {
      console.error("      ❌ ERROR: 'color' field is missing!");
    }
  } else {
    console.error("      ❌ ERROR: No user data in awareness!");
  }
  console.log("");

  // Check remote users
  const remoteUsers = Array.from(states.entries()).filter(
    ([id]) => id !== localClientId,
  );

  if (remoteUsers.length === 0) {
    console.log("   👥 REMOTE USERS: None");
    console.log("      ℹ️  Open another tab/browser to see remote cursors");
  } else {
    console.log(`   👥 REMOTE USERS (${remoteUsers.length}):`);
    remoteUsers.forEach(([id, state]: [number, any]) => {
      const user = state.user;
      console.log(`      User ${id}:`);
      console.log(`         Name: ${user?.name || "NOT SET"}`);
      console.log(
        `         Color: %c${user?.color || "NOT SET"}`,
        `color: ${user?.color}; font-weight: bold`,
      );

      if (!user?.name) {
        console.warn("         ⚠️  WARNING: 'name' field is missing!");
      }
      if (!user?.color) {
        console.error("         ❌ ERROR: 'color' field is missing!");
      }
    });
  }
}

/**
 * Check DOM elements for cursor presence
 */
function checkDOMElements(): void {
  const monacoEditor = document.querySelector(".monaco-editor");
  const cursorHeads = document.querySelectorAll(".yRemoteSelectionHead");
  const selectionBoxes = document.querySelectorAll(".yRemoteSelectionBox");
  const remoteCursors = document.querySelectorAll(".yRemoteSelection");

  console.log(
    `   Monaco Editor: ${monacoEditor ? "✅ Found" : "❌ Not found"}`,
  );
  console.log(`   Remote Cursor Containers: ${remoteCursors.length}`);
  console.log(`   Cursor Heads: ${cursorHeads.length}`);
  console.log(`   Selection Boxes: ${selectionBoxes.length}`);
  console.log("");

  if (cursorHeads.length === 0) {
    console.log("   ℹ️  No cursor elements found in DOM");
    console.log("      This is normal if no other users are connected");
    console.log("      Or if other users haven't typed yet");
  }
}

/**
 * Check if colors are properly applied to DOM elements
 */
function checkColorApplication(provider: any): void {
  const states = provider.awareness.getStates();
  const localClientId = provider.awareness.clientID;
  const cursorHeads = document.querySelectorAll(".yRemoteSelectionHead");

  const remoteUsers = Array.from(states.entries()).filter(
    ([id]) => id !== localClientId,
  );

  console.log(`   Expected Cursors: ${remoteUsers.length}`);
  console.log(`   Actual Cursor Elements: ${cursorHeads.length}`);
  console.log("");

  if (cursorHeads.length === 0) {
    if (remoteUsers.length > 0) {
      console.error("   ❌ ERROR: Remote users exist but no cursor elements!");
      console.error("      Y-Monaco binding might not be working");
    } else {
      console.log("   ℹ️  No remote users, so no cursors expected");
    }
    return;
  }

  // Check each cursor element
  console.log("   📋 CURSOR ELEMENT DETAILS:");
  let correctlyColored = 0;
  let missingColor = 0;
  let wrongColor = 0;

  cursorHeads.forEach((head, index) => {
    const htmlHead = head as HTMLElement;
    const dataName = htmlHead.getAttribute("data-name");
    const inlineBg = htmlHead.style.backgroundColor;
    const computedBg = window.getComputedStyle(htmlHead).backgroundColor;
    const cssVar = htmlHead.style.getPropertyValue("--cursor-bg-color");
    const parentClientId = htmlHead
      .closest(".yRemoteSelection")
      ?.getAttribute("data-clientid");

    console.log(`   Cursor ${index + 1}:`);
    console.log(`      Name: "${dataName || "NOT SET"}"`);
    console.log(`      Client ID: ${parentClientId || "NOT SET"}`);
    console.log(`      Inline BG: ${inlineBg || "NOT SET"}`);
    console.log(`      Computed BG: ${computedBg}`);
    console.log(`      CSS Variable: ${cssVar || "NOT SET"}`);

    // Determine status
    if (!inlineBg || inlineBg === "" || inlineBg === "transparent") {
      console.error(`      ❌ STATUS: Color NOT applied!`);
      missingColor++;
    } else {
      // Check if it matches a user color
      const matchingUser = remoteUsers.find(([, state]: [number, any]) => {
        const rgb = hexToRgb(state.user?.color);
        return inlineBg.includes(rgb);
      });

      if (matchingUser) {
        console.log(`      ✅ STATUS: Color correctly applied`);
        correctlyColored++;
      } else {
        console.warn(
          `      ⚠️  STATUS: Color applied but doesn't match any user`,
        );
        wrongColor++;
      }
    }
    console.log("");
  });

  // Summary
  console.log("   📊 SUMMARY:");
  console.log(`      ✅ Correctly Colored: ${correctlyColored}`);
  console.log(`      ❌ Missing Color: ${missingColor}`);
  console.log(`      ⚠️  Wrong Color: ${wrongColor}`);
}

/**
 * Check CSS status
 */
function checkCSSStatus(): void {
  const styleElements = document.querySelectorAll('style[id*="cursor"]');
  const globalStyles = document.querySelector(
    'style[id="y-monaco-cursor-styles"]',
  );

  console.log(`   Custom Cursor Styles: ${styleElements.length} element(s)`);
  console.log(
    `   Global Cursor Styles: ${globalStyles ? "✅ Found" : "❌ Not found"}`,
  );
  console.log("");

  // Check if CSS rules exist
  const testHead = document.querySelector(".yRemoteSelectionHead");
  if (testHead) {
    const computed = window.getComputedStyle(testHead);
    console.log("   Sample Cursor Styles:");
    console.log(`      Width: ${computed.width}`);
    console.log(`      Height: ${computed.height}`);
    console.log(`      Position: ${computed.position}`);
    console.log(`      Background: ${computed.backgroundColor}`);
  }
}

/**
 * Provide recommendations based on diagnostics
 */
function provideRecommendations(provider: any): void {
  const states = provider.awareness.getStates();
  const localClientId = provider.awareness.clientID;
  const cursorHeads = document.querySelectorAll(".yRemoteSelectionHead");
  const remoteUsers = Array.from(states.entries()).filter(
    ([id]) => id !== localClientId,
  );

  const recommendations: string[] = [];

  // Check for remote users
  if (remoteUsers.length === 0) {
    recommendations.push(
      "ℹ️  Open another tab/browser to test multi-user cursors",
    );
  }

  // Check if colors are missing in awareness
  remoteUsers.forEach(([id, state]: [number, any]) => {
    if (!state.user?.color) {
      recommendations.push(
        `❌ User ${id} has no color in awareness - check color assignment logic`,
      );
    }
    if (!state.user?.name) {
      recommendations.push(
        `⚠️  User ${id} has no name in awareness - cursor label won't show`,
      );
    }
  });

  // Check if cursor elements are missing
  if (remoteUsers.length > 0 && cursorHeads.length === 0) {
    recommendations.push(
      "❌ Y-Monaco binding might not be working - check MonacoBinding creation",
    );
    recommendations.push(
      "   Try: Verify that y-monaco package is properly installed",
    );
  }

  // Check if colors are not applied
  const missingColors = Array.from(cursorHeads).filter((head) => {
    const htmlHead = head as HTMLElement;
    const bg = htmlHead.style.backgroundColor;
    return !bg || bg === "" || bg === "transparent";
  }).length;

  if (missingColors > 0) {
    recommendations.push(
      `❌ ${missingColors} cursor(s) missing color - force color application`,
    );
    recommendations.push("   Try: forceApplyCursorColors(provider)");
    recommendations.push("   Or: applyCursorColorsNow()");
  }

  // Output recommendations
  if (recommendations.length === 0) {
    console.log("   ✅ Everything looks good!");
    console.log("   🎉 Cursor colors should be working correctly");
  } else {
    console.log("   🔧 ACTION ITEMS:");
    recommendations.forEach((rec) => {
      console.log(`      ${rec}`);
    });
  }
}

/**
 * Quick color check - lightweight version for rapid testing
 */
export function quickColorCheck(provider: any): void {
  if (!provider?.awareness) {
    console.error("❌ No provider/awareness");
    return;
  }

  const states = provider.awareness.getStates();
  const localClientId = provider.awareness.clientID;
  const cursorHeads = document.querySelectorAll(".yRemoteSelectionHead");
  const remoteUsers = Array.from(states.entries()).filter(
    ([id]) => id !== localClientId,
  );

  console.log("🔍 Quick Check:");
  console.log(`   Remote Users: ${remoteUsers.length}`);
  console.log(`   Cursor Elements: ${cursorHeads.length}`);

  const colored = Array.from(cursorHeads).filter((head) => {
    const bg = (head as HTMLElement).style.backgroundColor;
    return bg && bg !== "" && bg !== "transparent";
  }).length;

  console.log(`   Colored Cursors: ${colored}`);

  if (colored === cursorHeads.length && cursorHeads.length > 0) {
    console.log("   ✅ All cursors have colors!");
  } else if (cursorHeads.length === 0) {
    console.log("   ℹ️  No cursors to check");
  } else {
    console.log("   ❌ Some cursors missing colors!");
  }
}

/**
 * Watch cursor changes in real-time
 */
export function watchCursorChanges(provider: any): () => void {
  if (!provider?.awareness) {
    console.error("❌ No provider/awareness");
    return () => {};
  }

  console.log(
    "👁️  Watching cursor changes... (Press Ctrl+C or call stop() to end)",
  );

  const awarenessHandler = () => {
    const states = provider.awareness.getStates();
    const localClientId = provider.awareness.clientID;
    const remoteUsers = Array.from(states.entries()).filter(
      ([id]) => id !== localClientId,
    );

    console.log(`🔄 Awareness changed: ${remoteUsers.length} remote user(s)`);
    remoteUsers.forEach(([id, state]: [number, any]) => {
      console.log(
        `   User ${id}: ${state.user?.name} - %c${state.user?.color}`,
        `color: ${state.user?.color}; font-weight: bold`,
      );
    });
  };

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLElement) {
          if (node.classList.contains("yRemoteSelectionHead")) {
            console.log("🆕 New cursor element added to DOM");
          }
        }
      });

      mutation.removedNodes.forEach((node) => {
        if (node instanceof HTMLElement) {
          if (node.classList.contains("yRemoteSelectionHead")) {
            console.log("🗑️  Cursor element removed from DOM");
          }
        }
      });
    });
  });

  const monacoEditor = document.querySelector(".monaco-editor");
  if (monacoEditor) {
    observer.observe(monacoEditor, {
      childList: true,
      subtree: true,
    });
  }

  provider.awareness.on("change", awarenessHandler);

  const stop = () => {
    provider.awareness.off("change", awarenessHandler);
    observer.disconnect();
    console.log("🛑 Stopped watching cursor changes");
  };

  (window as any).stopWatching = stop;
  console.log("   Call stopWatching() to end");

  return stop;
}

/**
 * Test color assignment algorithm
 */
export function testColorAssignment(): void {
  console.log("🧪 Testing Color Assignment Algorithm:");
  console.log("");

  // Simulate different client IDs
  const testCases = [
    { clientId: 12345, username: "Alice" },
    { clientId: 67890, username: "Bob" },
    { clientId: 11111, username: "Charlie" },
    { clientId: 22222, username: "Diana" },
    { clientId: 33333, username: "Eve" },
  ];

  import("./cursor-colors").then(({ assignUserColor }) => {
    testCases.forEach((testCase) => {
      const color = assignUserColor(testCase.clientId, testCase.username);
      console.log(
        `   ${testCase.username} (${testCase.clientId}): %c${color}`,
        `color: ${color}; font-weight: bold; background: #1e1e1e; padding: 2px 8px; border-radius: 3px;`,
      );
    });

    // Check for duplicates
    const colors = testCases.map((tc) =>
      assignUserColor(tc.clientId, tc.username),
    );
    const uniqueColors = new Set(colors);

    console.log("");
    if (uniqueColors.size === colors.length) {
      console.log("   ✅ All colors are unique!");
    } else {
      console.error("   ❌ Duplicate colors detected!");
    }
  });
}

/**
 * Visual cursor preview in console
 */
export function previewCursors(provider: any): void {
  if (!provider?.awareness) {
    console.error("❌ No provider/awareness");
    return;
  }

  console.log("🎨 CURSOR PREVIEW:");
  console.log("");

  const states = provider.awareness.getStates();
  const localClientId = provider.awareness.clientID;

  states.forEach((state: any, id: number) => {
    const isLocal = id === localClientId;
    const user = state.user;
    const name = user?.name || user?.username || "Unknown";
    const color = user?.color || "#999999";

    console.log(
      `%c ${isLocal ? "YOU" : "   "} %c ${name} `,
      `background: ${color}; color: white; padding: 2px 8px; border-radius: 3px; font-weight: bold;`,
      `background: #1e1e1e; color: ${color}; padding: 2px 8px; border-radius: 3px;`,
    );
  });
}

/**
 * Helper: Convert hex color to RGB string for comparison
 */
function hexToRgb(hex?: string): string {
  if (!hex) return "";

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "";

  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);

  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Force refresh all cursor colors (aggressive)
 */
export function forceRefreshColors(provider: any): void {
  console.log("🔄 Force refreshing all cursor colors...");

  import("./force-cursor-colors").then(({ forceApplyCursorColors }) => {
    // Apply multiple times with delays
    forceApplyCursorColors(provider);
    setTimeout(() => forceApplyCursorColors(provider), 100);
    setTimeout(() => forceApplyCursorColors(provider), 300);
    setTimeout(() => forceApplyCursorColors(provider), 600);

    console.log("✅ Color refresh complete!");
  });
}

/**
 * Export all test functions for easy access
 */
export const cursorTests = {
  fullDiagnostics: fullCursorDiagnostics,
  quickCheck: quickColorCheck,
  watch: watchCursorChanges,
  testAssignment: testColorAssignment,
  preview: previewCursors,
  forceRefresh: forceRefreshColors,
};

// Make available globally for console access
if (typeof window !== "undefined") {
  (window as any).cursorTests = cursorTests;
}
