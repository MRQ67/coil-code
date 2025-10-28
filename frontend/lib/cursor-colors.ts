/**
 * Cursor Color Palette and Assignment Utilities
 *
 * Provides deterministic color assignment for collaborative cursors
 * optimized for dark backgrounds (Monaco's vs-dark theme)
 */

/**
 * Predefined color palette for user cursors
 *
 * Requirements:
 * - High contrast on dark background (vs-dark Monaco theme)
 * - Visually distinct from each other
 * - 15 colors to support up to 15 simultaneous users
 * - Colors rotate if more users join
 */
export const CURSOR_COLORS = [
  "#FF6B6B", // 0 - Red - High visibility
  "#4ECDC4", // 1 - Teal - Calming, distinct
  "#45B7D1", // 2 - Blue - Professional
  "#FFA07A", // 3 - Light Salmon - Warm
  "#98D8C8", // 4 - Mint - Soft, visible
  "#F7DC6F", // 5 - Yellow - High contrast
  "#BB8FCE", // 6 - Purple - Royal
  "#85C1E2", // 7 - Sky Blue - Clear
  "#F8B739", // 8 - Gold - Attention-grabbing
  "#52B788", // 9 - Green - Natural
  "#F06292", // 10 - Pink - Vibrant
  "#7986CB", // 11 - Indigo - Deep
  "#4DB6AC", // 12 - Turquoise - Ocean
  "#FFD54F", // 13 - Amber - Bright
  "#A1887F", // 14 - Brown - Earthy
] as const;

/**
 * Better hash function for strings to produce a stable integer
 * Uses FNV-1a algorithm for better distribution
 */
function hashString(input: string): number {
  let hash = 2166136261; // FNV offset basis
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = (hash * 16777619) >>> 0; // FNV prime, keep as unsigned 32-bit
  }
  // Additional mixing for better distribution
  hash ^= hash >>> 16;
  hash = (hash * 0x85ebca6b) >>> 0;
  hash ^= hash >>> 13;
  hash = (hash * 0xc2b2ae35) >>> 0;
  hash ^= hash >>> 16;
  return hash >>> 0; // Ensure positive
}

/**
 * Assigns a deterministic color based on client ID and username
 * Uses combined hash to ensure different users get different colors
 * even if they have the same client ID (browser session sharing)
 *
 * @param clientId - The Yjs awareness client ID
 * @param username - Username for additional uniqueness
 * @returns Hex color string
 */
export function assignUserColor(clientId: number, username?: string): string {
  let colorIndex: number;

  if (username) {
    // Create a unique seed by combining username and clientId
    // This ensures even similar usernames get different colors
    const uniqueSeed = `${username}_${clientId}_${username.length}`;
    const hash = hashString(uniqueSeed);

    // Use prime multiplication for better distribution
    const mixedHash = (hash * 2654435761) >>> 0;
    colorIndex = mixedHash % CURSOR_COLORS.length;

    console.log(
      `🎨 Hash details: username="${username}", clientId=${clientId}, hash=${hash}, mixed=${mixedHash}, index=${colorIndex}`,
    );
  } else {
    // Fallback to clientId only
    colorIndex = Math.abs(clientId) % CURSOR_COLORS.length;
  }

  const color = CURSOR_COLORS[colorIndex];
  console.log(
    `🎨 Color assigned: ${color} (index: ${colorIndex}) for clientId: ${clientId}, username: ${username || "none"}`,
  );

  return color;
}

/**
 * Test function: Display all colors in console
 * Useful for previewing the color palette during development
 */
export function previewCursorColors(): void {
  console.log("=== CURSOR COLOR PALETTE ===");
  CURSOR_COLORS.forEach((color, index) => {
    console.log(
      `%c Color ${index + 1}: ${color}`,
      `color: ${color}; font-weight: bold; font-size: 14px; background: #1e1e1e; padding: 4px 8px; border-radius: 4px;`,
    );
  });
  console.log("============================");
  console.log(`Total colors: ${CURSOR_COLORS.length}`);
  console.log("Colors will rotate for users 16+");
}

/**
 * Get color name for a given hex color (for debugging)
 *
 * @param hexColor - Hex color string
 * @returns Color name or 'Unknown'
 */
export function getColorName(hexColor: string): string {
  const colorNames = [
    "Red",
    "Teal",
    "Blue",
    "Salmon",
    "Mint",
    "Yellow",
    "Purple",
    "Sky Blue",
    "Gold",
    "Green",
    "Pink",
    "Indigo",
    "Turquoise",
    "Amber",
    "Brown",
  ];

  const index = CURSOR_COLORS.indexOf(
    hexColor as (typeof CURSOR_COLORS)[number],
  );
  return index !== -1 ? colorNames[index] : "Unknown";
}

/**
 * Validate that a color is in the palette
 *
 * @param color - Color to validate
 * @returns True if color is in the palette
 */
export function isValidCursorColor(color: string): boolean {
  return CURSOR_COLORS.includes(color as (typeof CURSOR_COLORS)[number]);
}

/**
 * Get a random color from the palette
 * Note: This should only be used for fallback scenarios
 * Prefer deterministic assignment via assignUserColor()
 *
 * @returns Hex color string
 */
export function getRandomCursorColor(): string {
  return CURSOR_COLORS[Math.floor(Math.random() * CURSOR_COLORS.length)];
}
