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
  "#FF6B6B", // Red - High visibility
  "#4ECDC4", // Teal - Calming, distinct
  "#45B7D1", // Blue - Professional
  "#FFA07A", // Light Salmon - Warm
  "#98D8C8", // Mint - Soft, visible
  "#F7DC6F", // Yellow - High contrast
  "#BB8FCE", // Purple - Royal
  "#85C1E2", // Sky Blue - Clear
  "#F8B739", // Gold - Attention-grabbing
  "#52B788", // Green - Natural
  "#F06292", // Pink - Vibrant
  "#7986CB", // Indigo - Deep
  "#4DB6AC", // Turquoise - Ocean
  "#FFD54F", // Amber - Bright
  "#A1887F", // Brown - Earthy
] as const;

/**
 * Assigns a deterministic color based on client ID
 * Same client always gets same color in a session
 *
 * @param clientId - The Yjs awareness client ID
 * @returns Hex color string
 */
export function assignUserColor(clientId: number): string {
  return CURSOR_COLORS[clientId % CURSOR_COLORS.length];
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
