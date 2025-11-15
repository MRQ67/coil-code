import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
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
}

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
        const updateData: Partial<Room> = {
          [contentField]: args.content,
          lastEditedBy: args.username,
          lastEditedAt: Date.now(),
        };
        await ctx.db.patch(existing._id, updateData);
      } else {
        // Try to insert a new room
        // If another request creates the room before this one completes,
        // the insert will fail but Convex will handle retries appropriately
        const insertData: Omit<Room, '_id' | '_creationTime'> = {
          roomId: args.roomId,
          [contentField]: args.content,
          lastEditedBy: args.username,
          lastEditedAt: Date.now(),
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
          const updateData: Partial<Room> = {
            [contentField]: args.content,
            lastEditedBy: args.username,
            lastEditedAt: Date.now(),
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

// Get all rooms (for future "My Rooms" feature)
export const getAllRooms = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("rooms"),
    _creationTime: v.number(), // System field that's automatically added
    roomId: v.string(),
    htmlContent: v.optional(v.string()),
    cssContent: v.optional(v.string()),
    jsContent: v.optional(v.string()),
    lastEditedBy: v.string(),
    lastEditedAt: v.number(),
  })),
  handler: async (ctx) => {
    const rooms = await ctx.db
      .query("rooms")
      .order("desc")
      .take(100);
    
    return rooms as Room[];
  },
});