/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Force Cursor Colors Utility - Enhanced Version
 *
 * Y-Monaco sometimes doesn't apply colors from awareness correctly.
 * This utility forcefully applies the colors by:
 * 1. Reading colors from awareness states
 * 2. Finding cursor elements in DOM with multiple strategies
 * 3. Applying colors directly to elements with !important
 * 4. Re-applying when cursors move (MutationObserver)
 * 5. Re-applying when users join/leave (awareness change event)
 */

/**
 * Throttle mechanism to prevent excessive applications
 */
let isApplying = false;
let lastApply = 0;
const MIN_APPLY_INTERVAL = 16; // ~60fps max

/**
 * Force apply colors to all cursor elements from awareness
 * Call this after MonacoBinding is created and whenever awareness changes
 */
export function forceApplyCursorColors(provider: any): void {
  if (!provider?.awareness) {
    console.warn("⚠️ Provider or awareness not available");
    return;
  }

  // Throttle to prevent excessive calls
  const now = Date.now();
  if (isApplying || now - lastApply < MIN_APPLY_INTERVAL) {
    return;
  }
  isApplying = true;
  lastApply = now;

  try {
    // Get all awareness states
    const states = provider.awareness.getStates();
    const localClientId = provider.awareness.clientID;

    // Build a map of user colors by clientId
    const userDataMap = new Map<
      number,
      { color: string; name: string; username: string }
    >();

    states.forEach((state: any, id: number) => {
      if (state.user?.color && id !== localClientId) {
        userDataMap.set(id, {
          color: state.user.color,
          name: state.user.name || state.user.username || "User",
          username: state.user.username || state.user.name || "User",
        });
      }
    });

    if (userDataMap.size === 0) {
      console.log("👻 No remote users to apply colors for");
      isApplying = false;
      return;
    }

    console.log(
      `🎨 Force-applying colors for ${userDataMap.size} remote user(s):`,
      Array.from(userDataMap.entries()).map(([id, data]) => ({
        clientId: id,
        name: data.name,
        color: data.color,
      })),
    );

    // Wait for DOM to be ready
    requestAnimationFrame(() => {
      try {
        applyColorsToDOM(userDataMap);
      } finally {
        isApplying = false;
      }
    });
  } catch (error) {
    console.error("❌ Error in forceApplyCursorColors:", error);
    isApplying = false;
  }
}

/**
 * Apply colors to DOM elements using multiple strategies
 */
function applyColorsToDOM(
  userDataMap: Map<number, { color: string; name: string; username: string }>,
): void {
  // Find all cursor-related elements
  const cursorHeads = document.querySelectorAll(".yRemoteSelectionHead");
  const selectionBoxes = document.querySelectorAll(".yRemoteSelectionBox");
  const remoteCursors = document.querySelectorAll(".yRemoteSelection");

  if (cursorHeads.length === 0) {
    console.log("⏳ No cursor elements found in DOM yet");
    return;
  }

  console.log(
    `🔍 Found ${cursorHeads.length} cursor heads, ${selectionBoxes.length} selection boxes, ${remoteCursors.length} remote cursor containers`,
  );

  let appliedCount = 0;

  // Strategy 1: Try to match by data-clientid attribute
  appliedCount += applyByClientId(userDataMap);

  // Strategy 2: Try to match by data-name attribute
  if (appliedCount === 0) {
    console.log("📋 Trying name-based matching...");
    appliedCount += applyByName(userDataMap);
  }

  // Strategy 3: Sequential assignment if counts match
  if (appliedCount === 0 && cursorHeads.length === userDataMap.size) {
    console.log("🔢 Using sequential color assignment...");
    appliedCount += applySequentially(userDataMap);
  }

  // Strategy 4: Apply to all uncolored cursors
  if (appliedCount === 0) {
    console.log("🎲 Applying to all cursors as fallback...");
    appliedCount += applyToAllCursors(userDataMap);
  }

  // Always sync selection box colors with cursor head colors
  syncSelectionBoxColors();

  console.log(`✨ Successfully applied colors to ${appliedCount} cursor(s)`);
}

/**
 * Strategy 1: Apply colors by matching data-clientid attribute
 */
function applyByClientId(
  userDataMap: Map<number, { color: string; name: string; username: string }>,
): number {
  let count = 0;

  userDataMap.forEach((userData, clientId) => {
    // Try multiple selector variations
    const selectors = [
      `.yRemoteSelection[data-clientid="${clientId}"]`,
      `[data-clientid="${clientId}"] .yRemoteSelectionHead`,
      `.yRemoteSelectionHead[data-clientid="${clientId}"]`,
    ];

    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);

      elements.forEach((element) => {
        let head: HTMLElement | null = null;

        if (element.classList.contains("yRemoteSelectionHead")) {
          head = element as HTMLElement;
        } else {
          head = element.querySelector(".yRemoteSelectionHead") as HTMLElement;
        }

        if (head) {
          applyColorToHead(head, userData.color, userData.name);
          count++;
          console.log(
            `✅ Applied ${userData.color} to ${userData.name}'s cursor (via clientid ${clientId})`,
          );
        }
      });

      if (count > 0) break;
    }
  });

  return count;
}

/**
 * Strategy 2: Apply colors by matching data-name attribute
 */
function applyByName(
  userDataMap: Map<number, { color: string; name: string; username: string }>,
): number {
  let count = 0;
  const cursorHeads = document.querySelectorAll(".yRemoteSelectionHead");

  cursorHeads.forEach((head) => {
    const htmlHead = head as HTMLElement;
    const dataName = htmlHead.getAttribute("data-name");

    if (dataName && dataName !== "null" && dataName !== "") {
      // Find user with matching name
      userDataMap.forEach((userData) => {
        if (userData.name === dataName || userData.username === dataName) {
          applyColorToHead(htmlHead, userData.color, userData.name);
          count++;
          console.log(
            `✅ Applied ${userData.color} to ${userData.name}'s cursor (via name match)`,
          );
        }
      });
    }
  });

  return count;
}

/**
 * Strategy 3: Apply colors sequentially when counts match
 */
function applySequentially(
  userDataMap: Map<number, { color: string; name: string; username: string }>,
): number {
  let count = 0;
  const cursorHeads = document.querySelectorAll(".yRemoteSelectionHead");
  const userDataArray = Array.from(userDataMap.values());

  cursorHeads.forEach((head, index) => {
    const htmlHead = head as HTMLElement;
    const userData = userDataArray[index];

    if (userData) {
      applyColorToHead(htmlHead, userData.color, userData.name);
      count++;
      console.log(
        `✅ Applied ${userData.color} to cursor ${index + 1} (sequential)`,
      );
    }
  });

  return count;
}

/**
 * Strategy 4: Apply first available color to all cursors (fallback)
 */
function applyToAllCursors(
  userDataMap: Map<number, { color: string; name: string; username: string }>,
): number {
  let count = 0;
  const cursorHeads = document.querySelectorAll(".yRemoteSelectionHead");
  const userDataArray = Array.from(userDataMap.values());

  // Distribute colors evenly if we have more cursors than users
  cursorHeads.forEach((head, index) => {
    const htmlHead = head as HTMLElement;
    const userData = userDataArray[index % userDataArray.length];

    if (userData) {
      applyColorToHead(htmlHead, userData.color, userData.name);
      count++;
    }
  });

  if (count > 0) {
    console.log(`✅ Applied fallback colors to ${count} cursor(s)`);
  }

  return count;
}

/**
 * Apply color to a single cursor head element
 */
function applyColorToHead(
  head: HTMLElement,
  color: string,
  name: string,
): void {
  // Set background color with multiple methods for maximum compatibility
  head.style.backgroundColor = color;
  head.style.setProperty("background-color", color, "important");
  head.style.setProperty("--cursor-bg-color", color);

  // Set data-name for the name tag
  head.setAttribute("data-name", name);

  // Ensure the cursor is visible
  if (!head.style.width || head.style.width === "0px") {
    head.style.width = "2px";
  }
  if (!head.style.height || head.style.height === "0px") {
    head.style.height = "100%";
    head.style.minHeight = "19px";
  }
}

/**
 * Sync selection box colors with their parent cursor head colors
 */
function syncSelectionBoxColors(): void {
  const selectionBoxes = document.querySelectorAll(".yRemoteSelectionBox");

  selectionBoxes.forEach((box) => {
    const htmlBox = box as HTMLElement;
    const parentCursor = htmlBox.closest(".yRemoteSelection");
    const head = parentCursor?.querySelector(
      ".yRemoteSelectionHead",
    ) as HTMLElement;

    if (head?.style.backgroundColor) {
      htmlBox.style.backgroundColor = head.style.backgroundColor;
      htmlBox.style.setProperty(
        "background-color",
        head.style.backgroundColor,
        "important",
      );
      htmlBox.style.opacity = "0.25";
    }
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

  console.log("🎨 Setting up AUTOMATIC cursor color enforcement");

  // Apply colors initially with multiple attempts
  const initialApply = () => {
    setTimeout(() => forceApplyCursorColors(provider), 100);
    setTimeout(() => forceApplyCursorColors(provider), 300);
    setTimeout(() => forceApplyCursorColors(provider), 600);
    setTimeout(() => forceApplyCursorColors(provider), 1000);
    setTimeout(() => forceApplyCursorColors(provider), 2000);
  };

  initialApply();

  // Apply colors on awareness changes
  const awarenessHandler = () => {
    console.log("👥 Awareness changed, reapplying colors...");
    setTimeout(() => forceApplyCursorColors(provider), 50);
    setTimeout(() => forceApplyCursorColors(provider), 200);
  };

  provider.awareness.on("change", awarenessHandler);

  // Watch for new cursor elements being added to DOM
  const observer = new MutationObserver((mutations) => {
    let hasNewCursors = false;
    let hasStyleChanges = false;

    mutations.forEach((mutation) => {
      // Check for new nodes
      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLElement) {
          if (
            node.classList.contains("yRemoteSelection") ||
            node.classList.contains("yRemoteSelectionHead") ||
            node.querySelector(".yRemoteSelection") ||
            node.querySelector(".yRemoteSelectionHead")
          ) {
            hasNewCursors = true;
          }
        }
      });

      // Check for style/attribute changes on cursor elements
      if (
        mutation.type === "attributes" &&
        mutation.target instanceof HTMLElement
      ) {
        if (
          mutation.target.classList.contains("yRemoteSelection") ||
          mutation.target.classList.contains("yRemoteSelectionHead")
        ) {
          hasStyleChanges = true;
        }
      }
    });

    if (hasNewCursors) {
      console.log("🆕 New cursor elements detected, applying colors");
      setTimeout(() => forceApplyCursorColors(provider), 30);
      setTimeout(() => forceApplyCursorColors(provider), 150);
    } else if (hasStyleChanges) {
      // Reapply less frequently for style changes
      setTimeout(() => forceApplyCursorColors(provider), 100);
    }
  });

  // Observe the editor for changes
  observer.observe(editorElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["class", "style", "data-name", "data-clientid"],
  });

  // Periodic color check (every 3 seconds as safety net)
  const intervalId = setInterval(() => {
    forceApplyCursorColors(provider);
  }, 3000);

  console.log("✅ Automatic cursor color enforcement ACTIVE");
  console.log("   - Watching DOM mutations");
  console.log("   - Listening to awareness changes");
  console.log("   - Periodic checks every 3 seconds");

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
  console.log("");
  console.log("🔍 ════════════════════════════════════");
  console.log("🔍 CURSOR COLOR DEBUG REPORT");
  console.log("🔍 ════════════════════════════════════");
  console.log("");

  if (!provider?.awareness) {
    console.error("❌ No provider/awareness available");
    return;
  }

  const states = provider.awareness.getStates();
  const clientId = provider.awareness.clientID;

  console.log(`📊 Basic Info:`);
  console.log(`   Local Client ID: ${clientId}`);
  console.log(`   Total users: ${states.size}`);
  console.log("");

  // Check awareness states
  console.log(`👥 Awareness States:`);
  states.forEach((state: any, id: number) => {
    const isLocal = id === clientId;
    const user = state.user;
    console.log(
      `   ${isLocal ? "👤 YOU" : "👥 USER"} ${id}:`,
      `name="${user?.name || "?"}"`,
      `color="${user?.color || "NO COLOR"}"`,
    );
  });
  console.log("");

  // Check DOM elements
  const cursorHeads = document.querySelectorAll(".yRemoteSelectionHead");
  const selectionBoxes = document.querySelectorAll(".yRemoteSelectionBox");
  const remoteCursors = document.querySelectorAll(".yRemoteSelection");

  console.log(`🔍 DOM Elements:`);
  console.log(`   Cursor Heads: ${cursorHeads.length}`);
  console.log(`   Selection Boxes: ${selectionBoxes.length}`);
  console.log(`   Remote Cursor Containers: ${remoteCursors.length}`);
  console.log("");

  if (cursorHeads.length > 0) {
    console.log(`🎨 Cursor Details:`);
    cursorHeads.forEach((head, i) => {
      const htmlHead = head as HTMLElement;
      const name = htmlHead.getAttribute("data-name");
      const clientIdAttr = htmlHead
        .closest(".yRemoteSelection")
        ?.getAttribute("data-clientid");
      const inlineBg = htmlHead.style.backgroundColor;
      const computedBg = window.getComputedStyle(htmlHead).backgroundColor;
      const cssVar = htmlHead.style.getPropertyValue("--cursor-bg-color");

      console.log(`   Cursor ${i + 1}:`);
      console.log(`      Name: "${name || "NOT SET"}"`);
      console.log(`      Client ID: ${clientIdAttr || "NOT SET"}`);
      console.log(`      Inline BG: ${inlineBg || "NOT SET"}`);
      console.log(`      Computed BG: ${computedBg}`);
      console.log(`      CSS Variable: ${cssVar || "NOT SET"}`);

      // Check if color is actually visible
      if (!inlineBg || inlineBg === "transparent" || inlineBg === "") {
        console.log(`      ❌ COLOR NOT APPLIED!`);
      } else {
        console.log(`      ✅ Color is set`);
      }
    });
  }

  console.log("");
  console.log("🔍 ════════════════════════════════════");
  console.log("");
}

/**
 * Nuclear option: Continuous color enforcement
 * Use only if colors keep getting reset by Monaco
 */
export function startContinuousColorEnforcement(provider: any): () => void {
  console.log("☢️  NUCLEAR OPTION: Starting continuous color enforcement");
  console.log("⚠️  This will apply colors every 100ms - use as last resort!");

  const intervalId = setInterval(() => {
    forceApplyCursorColors(provider);
  }, 100);

  return () => {
    clearInterval(intervalId);
    console.log("🛑 Continuous color enforcement stopped");
  };
}
