import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Define Room type
interface Room {
  _id: Id<"rooms">;
  _creationTime: number; // System field that's automatically added
  roomId: string;
  htmlContent?: string;
  cssContent?: string;
  jsContent?: string;
  lastEditedBy: string;
  lastEditedAt: number;
  lastActiveAt: number;
  saveCount?: number;
  totalSize?: number;
  createdAt?: number;
}

// Content size limits (1MB per file, 3MB total)
const MAX_FILE_SIZE = 1024 * 1024; // 1MB
const MAX_TOTAL_SIZE = 3 * 1024 * 1024; // 3MB

// Cleanup threshold (30 days of inactivity)
const INACTIVE_THRESHOLD_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// Rate limiting: max saves per minute per room
const MAX_SAVES_PER_MINUTE = 20;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

// OPTIMIZED: Batch save all content types in a single mutation
// This reduces database calls from 3 to 1, improving performance by ~66%
// Includes analytics tracking and content size validation
export const saveRoomBatch = mutation({
  args: {
    roomId: v.string(),
    htmlContent: v.string(),
    cssContent: v.string(),
    jsContent: v.string(),
    username: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    error: v.optional(v.string()),
    sizeInfo: v.optional(v.object({
      htmlSize: v.number(),
      cssSize: v.number(),
      jsSize: v.number(),
      totalSize: v.number(),
    })),
  }),
  handler: async (ctx, args) => {
    try {
      const timestamp = Date.now();

      // OPTIMIZED: Rate limiting check
      // Prevent spam by limiting saves per minute
      const existing = await ctx.db
        .query("rooms")
        .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
        .first();

      if (existing) {
        // Backfill lastActiveAt if it doesn't exist (for old rooms)
        const lastActiveAt = existing.lastActiveAt || existing.lastEditedAt || timestamp;
        const timeSinceLastSave = timestamp - existing.lastEditedAt;
        const recentSaveCount = existing.saveCount || 0;

        // Reset save count if outside rate limit window
        const isInRateLimitWindow = timeSinceLastSave < RATE_LIMIT_WINDOW_MS;

        if (isInRateLimitWindow && recentSaveCount >= MAX_SAVES_PER_MINUTE) {
          return {
            success: false,
            error: `Rate limit exceeded. Maximum ${MAX_SAVES_PER_MINUTE} saves per minute. Please wait ${Math.ceil((RATE_LIMIT_WINDOW_MS - timeSinceLastSave) / 1000)}s.`,
          };
        }
      }

      // Calculate content sizes
      const htmlSize = new TextEncoder().encode(args.htmlContent).length;
      const cssSize = new TextEncoder().encode(args.cssContent).length;
      const jsSize = new TextEncoder().encode(args.jsContent).length;
      const totalSize = htmlSize + cssSize + jsSize;

      // Validate content size limits
      if (htmlSize > MAX_FILE_SIZE) {
        return {
          success: false,
          error: `HTML content too large (${(htmlSize / 1024 / 1024).toFixed(2)}MB). Maximum allowed is 1MB.`,
        };
      }
      if (cssSize > MAX_FILE_SIZE) {
        return {
          success: false,
          error: `CSS content too large (${(cssSize / 1024 / 1024).toFixed(2)}MB). Maximum allowed is 1MB.`,
        };
      }
      if (jsSize > MAX_FILE_SIZE) {
        return {
          success: false,
          error: `JavaScript content too large (${(jsSize / 1024 / 1024).toFixed(2)}MB). Maximum allowed is 1MB.`,
        };
      }
      if (totalSize > MAX_TOTAL_SIZE) {
        return {
          success: false,
          error: `Total content too large (${(totalSize / 1024 / 1024).toFixed(2)}MB). Maximum allowed is 3MB.`,
        };
      }

      if (existing) {
        // OPTIMIZED: Smart save count tracking with rate limit window reset
        const timeSinceLastSave = timestamp - existing.lastEditedAt;
        const isInRateLimitWindow = timeSinceLastSave < RATE_LIMIT_WINDOW_MS;

        // Reset save count if outside rate limit window, otherwise increment
        const newSaveCount = isInRateLimitWindow
          ? (existing.saveCount || 0) + 1
          : 1;

        // Update all content fields in a single transaction with analytics
        await ctx.db.patch(existing._id, {
          htmlContent: args.htmlContent,
          cssContent: args.cssContent,
          jsContent: args.jsContent,
          lastEditedBy: args.username,
          lastEditedAt: timestamp,
          lastActiveAt: timestamp, // Update last activity (will backfill if missing)
          saveCount: newSaveCount, // Smart save count tracking
          totalSize: totalSize, // Update total size
        });
      } else {
        // Create new room with all content fields and analytics
        await ctx.db.insert("rooms", {
          roomId: args.roomId,
          htmlContent: args.htmlContent,
          cssContent: args.cssContent,
          jsContent: args.jsContent,
          lastEditedBy: args.username,
          lastEditedAt: timestamp,
          lastActiveAt: timestamp, // Set initial activity
          saveCount: 1, // First save
          totalSize: totalSize, // Initial size
          createdAt: timestamp, // Room creation time
        });
      }

      return {
        success: true,
        sizeInfo: {
          htmlSize,
          cssSize,
          jsSize,
          totalSize,
        },
      };
    } catch (error) {
      // Catch any errors and return them as proper error responses
      console.error("saveRoomBatch error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred during save",
      };
    }
  },
});

// DEPRECATED: Keep for backward compatibility (use saveRoomBatch instead)
// Save or update room with race condition handling
export const saveRoom = mutation({
  args: {
    content: v.string(),
    language: v.string(),
    roomId: v.string(),
    username: v.string(),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    try {
      // Determine which content field to update based on the language
      let contentField: 'jsContent' | 'cssContent' | 'htmlContent' = 'jsContent';
      if (args.language === 'css') {
        contentField = 'cssContent';
      } else if (args.language === 'html') {
        contentField = 'htmlContent';
      }

      // Attempt to fetch the room with the given roomId
      const existing = await ctx.db
        .query("rooms")
        .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
        .first();

      if (existing) {
        // Update the existing room, setting the appropriate content field
        const timestamp = Date.now();
        const updateData: Partial<Room> = {
          [contentField]: args.content,
          lastEditedBy: args.username,
          lastEditedAt: timestamp,
          lastActiveAt: timestamp, // Update activity timestamp
        };
        await ctx.db.patch(existing._id, updateData);
      } else {
        // Try to insert a new room
        // If another request creates the room before this one completes,
        // the insert will fail but Convex will handle retries appropriately
        const timestamp = Date.now();
        const insertData: Omit<Room, '_id' | '_creationTime'> = {
          roomId: args.roomId,
          [contentField]: args.content,
          lastEditedBy: args.username,
          lastEditedAt: timestamp,
          lastActiveAt: timestamp, // Required field added in Priority 2
        };
        // Initialize other content fields if not present
        if (args.language !== 'js') insertData.jsContent = '// Start coding JavaScript here';
        if (args.language !== 'css') insertData.cssContent = '/* Start coding CSS here */';
        if (args.language !== 'html') insertData.htmlContent = '<!-- Start coding HTML here -->';

        await ctx.db.insert("rooms", insertData);
      }

      return { success: true };
    } catch (error) {
      // Determine which content field to update based on the language (for error handling)
      let contentField: 'jsContent' | 'cssContent' | 'htmlContent' = 'jsContent';
      if (args.language === 'css') {
        contentField = 'cssContent';
      } else if (args.language === 'html') {
        contentField = 'htmlContent';
      }

      // If we get a unique constraint error, it likely means another
      // request created the same room, so we should update instead
      if (error instanceof Error &&
          (error.message.includes('unique') || error.message.includes('duplicate'))) {
        // Try to find and update the existing room
        const retryRoom = await ctx.db
          .query("rooms")
          .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
          .first();

        if (retryRoom) {
          const timestamp = Date.now();
          const updateData: Partial<Room> = {
            [contentField]: args.content,
            lastEditedBy: args.username,
            lastEditedAt: timestamp,
            lastActiveAt: timestamp, // Update activity timestamp
          };
          await ctx.db.patch(retryRoom._id, updateData);
          return { success: true };
        }
      }

      // Re-throw if it's a different error
      throw error;
    }
  },
});

// Get room by ID

// Get room by ID
export const getRoom = query({
  args: {
    roomId: v.string()
  },
  returns: v.union(
    v.object({
      _id: v.id("rooms"),
      _creationTime: v.number(), // System field that's automatically added
      roomId: v.string(),
      htmlContent: v.optional(v.string()),
      cssContent: v.optional(v.string()),
      jsContent: v.optional(v.string()),
      lastEditedBy: v.string(),
      lastEditedAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const room = await ctx.db
      .query("rooms")
      .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
      .first() as Room | null;

    return room;
  },
});

// OPTIMIZED: Get all rooms with pagination (for "My Rooms" feature)
// Returns lightweight data without content to reduce payload size
export const getAllRooms = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  returns: v.object({
    rooms: v.array(v.object({
      _id: v.id("rooms"),
      _creationTime: v.number(),
      roomId: v.string(),
      lastEditedBy: v.string(),
      lastEditedAt: v.number(),
      lastActiveAt: v.number(),
      saveCount: v.optional(v.number()),
      totalSize: v.optional(v.number()),
      createdAt: v.optional(v.number()),
    })),
    hasMore: v.boolean(),
    nextCursor: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    // Query rooms ordered by lastActiveAt (most recent first)
    let query = ctx.db
      .query("rooms")
      .withIndex("by_lastActiveAt")
      .order("desc");

    // Fetch one extra to check if there are more results
    const rooms = await query.take(limit + 1);

    const hasMore = rooms.length > limit;
    const roomsToReturn = hasMore ? rooms.slice(0, limit) : rooms;

    // Return lightweight data without content fields to reduce payload
    return {
      rooms: roomsToReturn.map(room => ({
        _id: room._id,
        _creationTime: room._creationTime,
        roomId: room.roomId,
        lastEditedBy: room.lastEditedBy,
        lastEditedAt: room.lastEditedAt,
        lastActiveAt: room.lastActiveAt,
        saveCount: room.saveCount,
        totalSize: room.totalSize,
        createdAt: room.createdAt,
      })),
      hasMore,
      nextCursor: hasMore ? roomsToReturn[roomsToReturn.length - 1]._id : undefined,
    };
  },
});

// OPTIMIZED: Get room stats without content (for quick checks)
export const getRoomStats = query({
  args: {
    roomId: v.string()
  },
  returns: v.union(
    v.object({
      exists: v.boolean(),
      lastEditedBy: v.string(),
      lastEditedAt: v.number(),
      lastActiveAt: v.number(),
      saveCount: v.optional(v.number()),
      totalSize: v.optional(v.number()),
      createdAt: v.optional(v.number()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const room = await ctx.db
      .query("rooms")
      .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
      .first();

    if (!room) return null;

    return {
      exists: true,
      lastEditedBy: room.lastEditedBy,
      lastEditedAt: room.lastEditedAt,
      lastActiveAt: room.lastActiveAt,
      saveCount: room.saveCount,
      totalSize: room.totalSize,
      createdAt: room.createdAt,
    };
  },
});

// OPTIMIZED: Cleanup inactive rooms (older than 30 days)
// This helps manage database size and costs
// Internal mutation for scheduled cron jobs
export const cleanupInactiveRooms = internalMutation({
  args: {
    dryRun: v.optional(v.boolean()), // Set to true to see what would be deleted
  },
  returns: v.object({
    deletedCount: v.number(),
    roomIds: v.array(v.string()),
    totalSizeFreed: v.number(),
  }),
  handler: async (ctx, args) => {
    const now = Date.now();
    const cutoffTime = now - INACTIVE_THRESHOLD_MS;

    // Query rooms that haven't been active in 30+ days
    const inactiveRooms = await ctx.db
      .query("rooms")
      .withIndex("by_lastActiveAt")
      .filter((q) => q.lt(q.field("lastActiveAt"), cutoffTime))
      .collect();

    const roomIds: string[] = [];
    let totalSizeFreed = 0;

    // Delete inactive rooms (unless dry run)
    for (const room of inactiveRooms) {
      roomIds.push(room.roomId);
      totalSizeFreed += room.totalSize || 0;

      if (!args.dryRun) {
        await ctx.db.delete(room._id);
      }
    }

    return {
      deletedCount: roomIds.length,
      roomIds,
      totalSizeFreed,
    };
  },
});