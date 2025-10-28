/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Force Cursor Colors Utility
 *
 * Y-Monaco sometimes doesn't apply colors from awareness correctly.
 * This utility forcefully applies the colors by:
 * 1. Reading colors from awareness states
 * 2. Finding cursor elements in DOM
 * 3. Applying colors directly to elements
 */

/**
 * Force apply colors to all cursor elements from awareness
 * Call this after MonacoBinding is created and whenever awareness changes
 */
export function forceApplyCursorColors(provider: any): void {
  if (!provider?.awareness) {
    console.warn("⚠️ Provider or awareness not available");
    return;
  }

  // Get all awareness states
  const states = provider.awareness.getStates();
  const clientId = provider.awareness.clientID;

  // Create a map of user colors by clientId
  const colorMap = new Map<number, string>();
  states.forEach((state: any, id: number) => {
    if (state.user?.color && id !== clientId) {
      colorMap.set(id, state.user.color);
    }
  });

  console.log(
    `🎨 Forcing colors for ${colorMap.size} remote user(s)`,
    Array.from(colorMap.entries()),
  );

  // Wait for DOM to be ready
  requestAnimationFrame(() => {
    // Find all cursor elements
    const cursorHeads = document.querySelectorAll(".yRemoteSelectionHead");

    if (cursorHeads.length === 0) {
      console.log("⚠️ No cursor elements found yet");
      return;
    }

    console.log(`🔍 Found ${cursorHeads.length} cursor element(s)`);

    // Apply colors to each cursor
    cursorHeads.forEach((head, index) => {
      const htmlHead = head as HTMLElement;
      const dataName = htmlHead.getAttribute("data-name");

      // Find matching user by name
      let matchedColor: string | null = null;

      states.forEach((state: any, id: number) => {
        if (id !== clientId && state.user?.name === dataName) {
          matchedColor = state.user.color;
        }
      });

      if (matchedColor) {
        // Force set the background color
        htmlHead.style.backgroundColor = matchedColor;
        htmlHead.style.setProperty("background-color", matchedColor, "important");

        console.log(
          `✅ Cursor ${index + 1} (${dataName}): Applied color ${matchedColor}`,
        );
      } else {
        console.warn(`⚠️ Cursor ${index + 1} (${dataName}): No color found`);
      }
    });

    // Also apply colors to selection boxes
    const selectionBoxes = document.querySelectorAll(".yRemoteSelectionBox");
    selectionBoxes.forEach((box) => {
      const htmlBox = box as HTMLElement;
      const parent = htmlBox.closest(".yRemoteSelection");
      const head = parent?.querySelector(".yRemoteSelectionHead");

      if (head instanceof HTMLElement) {
        const color = head.style.backgroundColor;
        if (color) {
          htmlBox.style.backgroundColor = color;
        }
      }
    });
  });
}

/**
 * Setup automatic color enforcement
 * Watches for awareness changes and DOM mutations to apply colors
 */
export function setupCursorColorEnforcement(
  provider: any,
  editorElement: HTMLElement,
): () => void {
  if (!provider?.awareness) {
    console.warn("⚠️ Cannot setup color enforcement: provider not available");
    return () => {};
  }

  console.log("🎨 Setting up automatic cursor color enforcement");

  // Apply colors initially
  setTimeout(() => forceApplyCursorColors(provider), 100);
  setTimeout(() => forceApplyCursorColors(provider), 500);
  setTimeout(() => forceApplyCursorColors(provider), 1000);

  // Apply colors on awareness changes
  const awarenessHandler = () => {
    setTimeout(() => forceApplyCursorColors(provider), 50);
  };

  provider.awareness.on("change", awarenessHandler);

  // Watch for new cursor elements being added to DOM
  const observer = new MutationObserver((mutations) => {
    let hasNewCursors = false;

    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLElement) {
          if (
            node.classList.contains("yRemoteSelection") ||
            node.querySelector(".yRemoteSelection")
          ) {
            hasNewCursors = true;
          }
        }
      });
    });

    if (hasNewCursors) {
      console.log("🆕 New cursor elements detected, applying colors");
      setTimeout(() => forceApplyCursorColors(provider), 50);
    }
  });

  // Observe the editor for new cursor elements
  observer.observe(editorElement, {
    childList: true,
    subtree: true,
  });

  // Periodic color check (fallback)
  const intervalId = setInterval(() => {
    forceApplyCursorColors(provider);
  }, 2000);

  console.log("✅ Cursor color enforcement active");

  // Return cleanup function
  return () => {
    provider.awareness.off("change", awarenessHandler);
    observer.disconnect();
    clearInterval(intervalId);
    console.log("🛑 Cursor color enforcement stopped");
  };
}

/**
 * Debug function: Check if colors are correctly set
 */
export function debugCursorColors(provider: any): void {
  console.log("🔍 CURSOR COLOR DEBUG");
  console.log("=====================");

  if (!provider?.awareness) {
    console.error("❌ No provider/awareness");
    return;
  }

  const states = provider.awareness.getStates();
  const clientId = provider.awareness.clientID;

  console.log(`Local Client ID: ${clientId}`);
  console.log(`Total users: ${states.size}`);
  console.log("");

  // Check awareness states
  console.log("Awareness Colors:");
  states.forEach((state: any, id: number) => {
    const isLocal = id === clientId;
    console.log(
      `  ${isLocal ? "👤 YOU" : "👥 USER"} ${id}: ${state.user?.name || "unnamed"} - ${state.user?.color || "NO COLOR"}`,
    );
  });
  console.log("");

  // Check DOM elements
  const cursorHeads = document.querySelectorAll(".yRemoteSelectionHead");
  console.log(`Cursor Elements in DOM: ${cursorHeads.length}`);

  cursorHeads.forEach((head, i) => {
    const htmlHead = head as HTMLElement;
    const name = htmlHead.getAttribute("data-name");
    const bgColor = htmlHead.style.backgroundColor;
    const computedColor = window
      .getComputedStyle(htmlHead)
      .backgroundColor;

    console.log(`  Cursor ${i + 1}:`);
    console.log(`    Name: ${name}`);
    console.log(`    Inline BG: ${bgColor || "NOT SET"}`);
    console.log(`    Computed BG: ${computedColor}`);
  });

  console.log("=====================");
}
