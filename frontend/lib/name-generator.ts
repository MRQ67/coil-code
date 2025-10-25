/**
 * Name Generator Utility
 * Generates random usernames and avatar URLs with gender support
 */

// Type definition for gender options
export type Gender = "boy" | "girl" | "random";

// Arrays for generating random names
const adjectives = [
  "Cosmic",
  "Stellar",
  "Quantum",
  "Neon",
  "Digital",
  "Electric",
  "Cyber",
  "Mystic",
  "Arctic",
  "Solar",
  "Lunar",
  "Crystal",
  "Thunder",
  "Shadow",
  "Phoenix",
  "Dragon",
  "Turbo",
  "Hyper",
  "Ultra",
  "Mega",
  "Super",
  "Epic",
  "Radiant",
  "Blazing",
  "Frosted",
  "Golden",
  "Silver",
  "Ruby",
  "Sapphire",
  "Emerald",
  "Plasma",
  "Atomic",
  "Nebula",
  "Galaxy",
  "Comet",
  "Meteor",
  "Nova",
  "Prism",
  "Pixel",
  "Vector",
  "Matrix",
  "Binary",
  "Hexa",
  "Octa",
];

const nouns = [
  "Panda",
  "Tiger",
  "Wolf",
  "Eagle",
  "Falcon",
  "Hawk",
  "Lion",
  "Bear",
  "Fox",
  "Owl",
  "Shark",
  "Whale",
  "Dolphin",
  "Phoenix",
  "Dragon",
  "Unicorn",
  "Ninja",
  "Samurai",
  "Knight",
  "Wizard",
  "Mage",
  "Warrior",
  "Ranger",
  "Hunter",
  "Scout",
  "Pilot",
  "Captain",
  "Commander",
  "Chief",
  "Master",
  "Coder",
  "Hacker",
  "Developer",
  "Engineer",
  "Architect",
  "Designer",
  "Artist",
  "Creator",
  "Builder",
  "Maker",
  "Crafter",
  "Forger",
  "Smith",
];

/**
 * Generates a random username from adjectives and nouns
 * @returns A random username like "Cosmic Panda" or "Quantum Tiger"
 */
export function generateRandomName(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adjective} ${noun}`;
}

/**
 * Gets the appropriate avatar URL based on username and gender
 * @param username - The user's username
 * @param gender - The gender preference ('boy', 'girl', or 'random')
 * @returns The avatar URL from iran.liara.run API
 */
export function getAvatarUrl(
  username: string,
  gender: Gender = "random",
): string {
  // Base URL for avatar API
  const baseUrl = "https://avatar.iran.liara.run/public";

  // Encode username for URL (only alphanumeric and spaces)
  const encodedUsername = encodeURIComponent(username.trim());

  // Return appropriate URL based on gender
  switch (gender) {
    case "boy":
      return `${baseUrl}/boy?username=${encodedUsername}`;
    case "girl":
      return `${baseUrl}/girl?username=${encodedUsername}`;
    case "random":
    default:
      // For random, randomly choose between boy and girl for consistency
      // Use username hash to deterministically pick one
      const hash = username
        .split("")
        .reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const randomGender = hash % 2 === 0 ? "boy" : "girl";
      return `${baseUrl}/${randomGender}?username=${encodedUsername}`;
  }
}

/**
 * Validates a username
 * @param username - The username to validate
 * @returns An object with isValid boolean and optional error message
 */
export function validateUsername(username: string): {
  isValid: boolean;
  error?: string;
} {
  if (!username || username.trim().length === 0) {
    return { isValid: false, error: "Username is required" };
  }

  if (username.length < 2) {
    return { isValid: false, error: "Username must be at least 2 characters" };
  }

  if (username.length > 20) {
    return { isValid: false, error: "Username must be 20 characters or less" };
  }

  return { isValid: true };
}

/**
 * Gets a random gender
 * @returns A random gender from the Gender type
 */
export function getRandomGender(): Gender {
  const genders: Gender[] = ["boy", "girl", "random"];
  return genders[Math.floor(Math.random() * genders.length)];
}
