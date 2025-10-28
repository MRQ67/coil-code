/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Cursor Debugging Utility
 *
 * Comprehensive debugging tools to diagnose cursor visibility issues
 * Run these functions in the browser console to debug cursor problems
 */

/**
 * Main diagnostic function - checks everything related to cursors
 */
export function debugCursors(provider: any): void {
  console.clear();
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║          Y-MONACO CURSOR DEBUGGING UTILITY                 ║");
  console.log("╚════════════════════════════════════════════════════════════╝");
  console.log("");

  // 1. Check Provider & Awareness
  console.log("📋 STEP 1: Provider & Awareness Check");
  console.log("─────────────────────────────────────");

  if (!provider) {
    console.error("❌ CRITICAL: Provider is null/undefined");
    console.log("   → Check that provider is passed to debugCursors()");
    return;
  }
  console.log("✅ Provider exists");

  if (!provider.awareness) {
    console.error("❌ CRITICAL: Provider.awareness is null/undefined");
    console.log("   → Provider was not initialized with awareness");
    return;
  }
  console.log("✅ Provider.awareness exists");

  const clientId = provider.awareness.clientID;
  console.log(`✅ Local Client ID: ${clientId}`);
  console.log("");

  // 2. Check Awareness States
  console.log("📋 STEP 2: Awareness States");
  console.log("─────────────────────────────");

  const states = provider.awareness.getStates();
  console.log(`👥 Total users: ${states.size}`);

  if (states.size < 2) {
    console.warn("⚠️  WARNING: Only 1 user connected");
    console.log("   → Cursors only appear for OTHER users");
    console.log("   → Open another browser tab to test");
    console.log("");
  }

  states.forEach((state: any, id: number) => {
    const isLocal = id === clientId;
    console.log(`${isLocal ? "👤 YOU" : "👥 REMOTE"} (Client ${id}):`);

    if (!state.user) {
      console.error("   ❌ No user data in awareness");
      return;
    }

    console.log(`   name: ${state.user.name || "❌ MISSING"}`);
    console.log(`   username: ${state.user.username || "❌ MISSING"}`);
    console.log(`   color: ${state.user.color || "❌ MISSING"}`);
    console.log(`   gender: ${state.user.gender || "❌ MISSING"}`);

    // Check Y-Monaco required fields
    if (!state.user.name) {
      console.error(
        "   ❌ CRITICAL: 'name' field missing (Y-Monaco needs this!)",
      );
    }
    if (!state.user.color) {
      console.error(
        "   ❌ CRITICAL: 'color' field missing (cursors won't be colored)",
      );
    }
    console.log("");
  });

  // 3. Check DOM Elements
  console.log("📋 STEP 3: DOM Elements Check");
  console.log("─────────────────────────────");

  const monacoEditor = document.querySelector(".monaco-editor");
  if (!monacoEditor) {
    console.error("❌ CRITICAL: Monaco editor not found in DOM");
    console.log("   → Editor may not be mounted yet");
    return;
  }
  console.log("✅ Monaco editor found in DOM");

  const cursorContainers = document.querySelectorAll(".yRemoteSelection");
  console.log(
    `${cursorContainers.length > 0 ? "✅" : "❌"} Remote cursor containers: ${cursorContainers.length}`,
  );

  if (cursorContainers.length === 0) {
    console.error("❌ CRITICAL: No .yRemoteSelection elements found");
    console.log("   → Y-Monaco is not creating cursor elements");
    console.log("   → Possible causes:");
    console.log("      1. MonacoBinding not created with awareness");
    console.log("      2. No remote users (need 2+ users)");
    console.log("      3. Y-Monaco not loaded properly");
    console.log("");
  } else {
    console.log(`   Found ${cursorContainers.length} cursor container(s)`);
  }

  const cursorHeads = document.querySelectorAll(".yRemoteSelectionHead");
  console.log(
    `${cursorHeads.length > 0 ? "✅" : "❌"} Cursor heads: ${cursorHeads.length}`,
  );

  if (cursorHeads.length > 0) {
    cursorHeads.forEach((head, index) => {
      const htmlHead = head as HTMLElement;
      console.log(`   Cursor ${index + 1}:`);
      console.log(
        `      background-color: ${htmlHead.style.backgroundColor || "NOT SET"}`,
      );
      console.log(
        `      data-name: ${htmlHead.getAttribute("data-name") || "NOT SET"}`,
      );
      console.log(
        `      --cursor-bg-color: ${htmlHead.style.getPropertyValue("--cursor-bg-color") || "NOT SET"}`,
      );
    });
  }
  console.log("");

  // 4. Check CSS Styles
  console.log("📋 STEP 4: CSS Styles Check");
  console.log("─────────────────────────");

  const styleSheets = Array.from(document.styleSheets);
  let foundCursorStyles = false;

  for (const sheet of styleSheets) {
    try {
      const rules = Array.from(sheet.cssRules || []);
      for (const rule of rules) {
        const cssRule = rule as CSSStyleRule;
        if (cssRule.selectorText?.includes("yRemoteSelection")) {
          foundCursorStyles = true;
          console.log(`✅ Found cursor styles: ${cssRule.selectorText}`);
        }
      }
    } catch {
      // Cross-origin stylesheets can't be accessed
    }
  }

  if (!foundCursorStyles) {
    console.warn("⚠️  WARNING: Cursor CSS styles not found");
    console.log(
      "   → Check that globals.css includes .yRemoteSelection styles",
    );
  }
  console.log("");

  // 5. Check MonacoBinding
  console.log("📋 STEP 5: MonacoBinding Check");
  console.log("─────────────────────────────");
  console.log("⚠️  Cannot directly inspect MonacoBinding from here");
  console.log("   Check browser console for 'MonacoBinding created' message");
  console.log("");

  // 6. Summary & Recommendations
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║                    DIAGNOSIS SUMMARY                       ║");
  console.log("╚════════════════════════════════════════════════════════════╝");
  console.log("");

  const remoteUsers = Array.from(states.entries()).filter(
    (entry: any) => entry[0] !== clientId,
  );
  const hasRemoteUsers = remoteUsers.length > 0;
  const hasCursorElements = cursorHeads.length > 0;
  const allUsersHaveName = Array.from(states.values()).every(
    (s: any) => s.user?.name,
  );
  const allUsersHaveColor = Array.from(states.values()).every(
    (s: any) => s.user?.color,
  );

  if (
    hasRemoteUsers &&
    hasCursorElements &&
    allUsersHaveName &&
    allUsersHaveColor
  ) {
    console.log("✅ ALL CHECKS PASSED!");
    console.log("   Cursors should be visible. If not:");
    console.log("   1. Check that cursor color is not transparent");
    console.log("   2. Inspect .yRemoteSelectionHead elements in DevTools");
    console.log("   3. Try typing in the other tab to trigger cursor movement");
  } else {
    console.log("❌ ISSUES DETECTED:");

    if (!hasRemoteUsers) {
      console.log("   🔴 No remote users connected");
      console.log("      → Open another browser tab to the same room");
    }

    if (!hasCursorElements && hasRemoteUsers) {
      console.log("   🔴 Y-Monaco not creating cursor elements");
      console.log(
        "      → Check that MonacoBinding was created with awareness",
      );
      console.log("      → Check browser console for errors");
    }

    if (!allUsersHaveName) {
      console.log("   🔴 Some users missing 'name' field");
      console.log("      → Update lib/yjs-setup.ts to set user.name");
    }

    if (!allUsersHaveColor) {
      console.log("   🔴 Some users missing 'color' field");
      console.log("      → Check color assignment in lib/yjs-setup.ts");
    }
  }

  console.log("");
  console.log("═══════════════════════════════════════════════════════════");
}

/**
 * Quick check - minimal output
 */
export function quickCursorCheck(provider: any): boolean {
  if (!provider?.awareness) {
    console.error("❌ Provider/awareness not available");
    return false;
  }

  const states = provider.awareness.getStates();
  const clientId = provider.awareness.clientID;
  const remoteUsers = Array.from(states.entries()).filter(
    (entry: any) => entry[0] !== clientId,
  );
  const cursorElements = document.querySelectorAll(".yRemoteSelectionHead");

  console.log("🔍 Quick Check:");
  console.log(`   Remote users: ${remoteUsers.length}`);
  console.log(`   Cursor elements: ${cursorElements.length}`);

  if (remoteUsers.length === 0) {
    console.warn("⚠️  No remote users - open another tab");
    return false;
  }

  if (cursorElements.length === 0) {
    console.error("❌ No cursor elements - check MonacoBinding");
    return false;
  }

  console.log("✅ Cursors should be visible!");
  return true;
}

/**
 * Watch cursor elements in real-time
 */
export function watchCursors(provider: any): () => void {
  console.log("👀 Watching cursor elements...");
  console.log("   (Updates logged on awareness changes)");

  const logCursors = () => {
    const cursors = document.querySelectorAll(".yRemoteSelectionHead");
    console.log(
      `[${new Date().toLocaleTimeString()}] Cursors: ${cursors.length}`,
    );
    cursors.forEach((cursor, i) => {
      const head = cursor as HTMLElement;
      console.log(
        `   ${i + 1}. ${head.getAttribute("data-name") || "unnamed"} - ${head.style.backgroundColor}`,
      );
    });
  };

  provider.awareness.on("change", logCursors);
  logCursors(); // Initial log

  return () => {
    provider.awareness.off("change", logCursors);
    console.log("✋ Stopped watching cursors");
  };
}

/**
 * Force re-render cursor colors
 */
export function forceUpdateCursorColors(): void {
  console.log("🔄 Force updating cursor colors...");

  const cursorHeads = document.querySelectorAll(".yRemoteSelectionHead");
  let updated = 0;

  cursorHeads.forEach((head) => {
    const htmlHead = head as HTMLElement;
    const bgColor = htmlHead.style.backgroundColor;

    if (bgColor) {
      htmlHead.style.setProperty("--cursor-bg-color", bgColor);
      updated++;
    }
  });

  console.log(`✅ Updated ${updated} cursor(s)`);
}

/**
 * Test if CSS is working by adding a test element
 */
export function testCursorCSS(): void {
  console.log("🧪 Testing cursor CSS...");

  // Create a test cursor element
  const testContainer = document.createElement("div");
  testContainer.className = "yRemoteSelection";
  testContainer.style.position = "fixed";
  testContainer.style.top = "100px";
  testContainer.style.left = "100px";
  testContainer.style.zIndex = "9999";

  const testHead = document.createElement("div");
  testHead.className = "yRemoteSelectionHead";
  testHead.style.backgroundColor = "#FF6B6B";
  testHead.style.width = "2px";
  testHead.style.height = "20px";
  testHead.setAttribute("data-name", "TEST USER");
  testHead.style.setProperty("--cursor-bg-color", "#FF6B6B");

  testContainer.appendChild(testHead);
  document.body.appendChild(testContainer);

  console.log("✅ Test cursor added to DOM (top-left corner)");
  console.log("   Should show a red cursor with 'TEST USER' label");
  console.log("   Remove it by refreshing the page");
}

// Make functions available globally for console use
if (typeof window !== "undefined") {
  (window as any).debugCursors = debugCursors;
  (window as any).quickCursorCheck = quickCursorCheck;
  (window as any).watchCursors = watchCursors;
  (window as any).forceUpdateCursorColors = forceUpdateCursorColors;
  (window as any).testCursorCSS = testCursorCSS;
}
