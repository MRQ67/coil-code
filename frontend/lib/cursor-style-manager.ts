/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Cursor Style Manager
 *
 * Dynamically injects CSS styles for Y-Monaco cursors to match user colors.
 * This solves the issue where CSS ::after pseudo-elements can't access
 * inline styles set by Y-Monaco.
 */

/**
 * Injects dynamic CSS styles for cursor name tags
 * Each user gets their own CSS rule with their cursor color
 */
export function injectCursorStyles(
  provider: any,
  styleElementId = "y-monaco-cursor-styles"
): void {
  if (!provider?.awareness) return;

  // Create or get the style element
  let styleElement = document.getElementById(styleElementId) as HTMLStyleElement;

  if (!styleElement) {
    styleElement = document.createElement("style");
    styleElement.id = styleElementId;
    document.head.appendChild(styleElement);
  }

  // Update styles whenever awareness changes
  const updateStyles = () => {
    const states = provider.awareness.getStates();
    const styles: string[] = [];

    states.forEach((state: any, clientId: number) => {
      if (state.user?.color && state.user?.name) {
        // Create a CSS rule for each user's cursor
        styles.push(`
          .yRemoteSelection[data-clientid="${clientId}"] .yRemoteSelectionHead::after {
            background-color: ${state.user.color} !important;
          }
        `);
      }
    });

    styleElement.textContent = styles.join("\n");
  };

  // Initial update
  updateStyles();

  // Listen for awareness changes
  provider.awareness.on("change", updateStyles);
}

/**
 * Add data attributes to cursor elements for styling
 * This helps target specific user cursors with CSS
 */
export function enhanceCursorElements(): void {
  // Observe DOM for new cursor elements
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLElement) {
          // Check if this is a Y-Monaco cursor element
          if (node.classList.contains("yRemoteSelection")) {
            // Y-Monaco doesn't add client ID by default, so we need to
            // parse it from the element's data or add it via awareness
            enhanceSingleCursor(node);
          }

          // Also check children
          const cursors = node.querySelectorAll(".yRemoteSelection");
          cursors.forEach((cursor) => {
            if (cursor instanceof HTMLElement) {
              enhanceSingleCursor(cursor);
            }
          });
        }
      });
    });
  });

  // Start observing the Monaco editor container
  const editorContainer = document.querySelector(".monaco-editor");
  if (editorContainer) {
    observer.observe(editorContainer, {
      childList: true,
      subtree: true,
    });
  }
}

/**
 * Enhance a single cursor element with data attributes
 */
function enhanceSingleCursor(cursorElement: HTMLElement): void {
  // Y-Monaco creates cursor elements but doesn't add client IDs
  // We'll add them based on the cursor's color and awareness state
  const head = cursorElement.querySelector(".yRemoteSelectionHead");

  if (head instanceof HTMLElement) {
    const bgColor = head.style.backgroundColor;
    const dataName = head.getAttribute("data-name");

    if (bgColor && dataName) {
      // Try to find matching client ID from awareness
      // This is a workaround since Y-Monaco doesn't expose client IDs directly
      cursorElement.setAttribute("data-cursor-name", dataName);
      cursorElement.setAttribute("data-cursor-color", bgColor);
    }
  }
}

/**
 * Alternative simpler approach: Set name tag colors via DOM manipulation
 * This directly sets the background color on cursor name tags
 * ALSO sets data-name attribute since MonacoBinding doesn't do it automatically
 */
export function updateCursorNameTagColors(provider: any): void {
  if (!provider?.awareness) return;

  const updateColors = () => {
    const states = provider.awareness.getStates();
    const localClientId = provider.awareness.clientID;

    // Wait for next frame to ensure DOM is updated
    requestAnimationFrame(() => {
      const cursorHeads = document.querySelectorAll(".yRemoteSelectionHead");

      cursorHeads.forEach((head) => {
        if (head instanceof HTMLElement) {
          // CRITICAL: Extract client ID from the class name (e.g., yRemoteSelectionHead-123)
          const classNames = Array.from(head.classList);
          const clientIdClass = classNames.find(cls => cls.startsWith('yRemoteSelectionHead-'));

          if (clientIdClass) {
            const clientId = parseInt(clientIdClass.replace('yRemoteSelectionHead-', ''));

            // Skip if this is the local user's cursor
            if (clientId === localClientId) return;

            // Get awareness state for this client
            const state = states.get(clientId);

            if (state) {
              // Get name from awareness (try multiple fields for compatibility)
              const name = state.name || state.user?.name || state.user?.username || 'Unknown';
              const color = state.color || state.user?.color;

              // CRITICAL: Set the data-name attribute that CSS uses
              if (name && !head.getAttribute("data-name")) {
                head.setAttribute("data-name", name);
                console.log(`🏷️  Set cursor name for client ${clientId}: "${name}"`);
              }

              // Set the color if available
              if (color && head.style.backgroundColor !== color) {
                head.style.backgroundColor = color;
                head.style.setProperty("--cursor-bg-color", color);
                console.log(`🎨 Set cursor color for ${name}: ${color}`);
              }
            }
          }
        }
      });
    });
  };

  // Initial update
  updateColors();

  // Update on awareness changes
  provider.awareness.on("change", updateColors);

  // Also update periodically (fallback) - less frequently to reduce overhead
  setInterval(updateColors, 1000);
}

/**
 * Initialize cursor styling system
 * Call this after MonacoBinding is created
 */
export function initializeCursorStyling(provider: any): () => void {
  // Use the simpler DOM manipulation approach
  updateCursorNameTagColors(provider);

  console.log("✅ Cursor styling initialized");

  // Return cleanup function
  return () => {
    const styleElement = document.getElementById("y-monaco-cursor-styles");
    if (styleElement) {
      styleElement.remove();
    }
  };
}
