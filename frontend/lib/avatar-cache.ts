/**
 * Avatar Cache Utility
 * Caches avatar URLs to reduce API calls and improve performance
 */

// In-memory cache for fast access
const memoryCache = new Map<string, string>();

// Cache expiry time (24 hours)
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000;

interface CacheEntry {
  url: string;
  timestamp: number;
}

/**
 * Generate cache key from username and gender
 */
function getCacheKey(username: string, gender: string): string {
  return `avatar_${gender}_${username.toLowerCase().replace(/\s+/g, "_")}`;
}

/**
 * Check if cache entry is expired
 */
function isExpired(timestamp: number): boolean {
  return Date.now() - timestamp > CACHE_EXPIRY_MS;
}

/**
 * Get avatar URL from cache
 * Checks memory cache first, then sessionStorage
 */
export function getCachedAvatar(
  username: string,
  gender: string,
): string | null {
  if (!username) return null;

  const cacheKey = getCacheKey(username, gender);

  // Check memory cache first (fastest)
  const memoryCached = memoryCache.get(cacheKey);
  if (memoryCached) {
    return memoryCached;
  }

  // Check sessionStorage
  try {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      const entry: CacheEntry = JSON.parse(cached);

      // Check if expired
      if (!isExpired(entry.timestamp)) {
        // Update memory cache for faster next access
        memoryCache.set(cacheKey, entry.url);
        return entry.url;
      } else {
        // Remove expired entry
        sessionStorage.removeItem(cacheKey);
      }
    }
  } catch (error) {
    console.warn("Error reading from sessionStorage:", error);
  }

  return null;
}

/**
 * Store avatar URL in cache
 */
export function setCachedAvatar(
  username: string,
  gender: string,
  url: string,
): void {
  if (!username || !url) return;

  const cacheKey = getCacheKey(username, gender);
  const entry: CacheEntry = {
    url,
    timestamp: Date.now(),
  };

  // Store in memory cache
  memoryCache.set(cacheKey, url);

  // Store in sessionStorage
  try {
    sessionStorage.setItem(cacheKey, JSON.stringify(entry));
  } catch (error) {
    // SessionStorage might be full or disabled
    console.warn("Error writing to sessionStorage:", error);
  }
}

/**
 * Preload an avatar image in the background
 * Returns a promise that resolves with the image URL
 */
export function preloadAvatar(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // Check if already cached in browser
    const img = new Image();

    img.onload = () => {
      resolve(url);
    };

    img.onerror = () => {
      reject(new Error(`Failed to preload avatar: ${url}`));
    };

    // Set crossOrigin to allow caching from external domain
    img.crossOrigin = "anonymous";
    img.src = url;
  });
}

/**
 * Preload avatar with caching
 */
export async function preloadAndCacheAvatar(
  username: string,
  gender: string,
  url: string,
): Promise<string> {
  try {
    // Check if already cached
    const cached = getCachedAvatar(username, gender);
    if (cached) {
      return cached;
    }

    // Preload the image
    await preloadAvatar(url);

    // Cache the URL
    setCachedAvatar(username, gender, url);

    return url;
  } catch (error) {
    console.warn("Error preloading avatar:", error);
    // Still cache the URL even if preload fails
    setCachedAvatar(username, gender, url);
    return url;
  }
}

/**
 * Clear all cached avatars
 */
export function clearAvatarCache(): void {
  // Clear memory cache
  memoryCache.clear();

  // Clear sessionStorage
  try {
    const keys = Object.keys(sessionStorage);
    keys.forEach((key) => {
      if (key.startsWith("avatar_")) {
        sessionStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn("Error clearing sessionStorage:", error);
  }
}

/**
 * Get cache statistics (for debugging)
 */
export function getCacheStats(): {
  memorySize: number;
  sessionSize: number;
} {
  let sessionSize = 0;

  try {
    const keys = Object.keys(sessionStorage);
    keys.forEach((key) => {
      if (key.startsWith("avatar_")) {
        sessionSize++;
      }
    });
  } catch {
    // Ignore sessionStorage errors
  }

  return {
    memorySize: memoryCache.size,
    sessionSize,
  };
}
