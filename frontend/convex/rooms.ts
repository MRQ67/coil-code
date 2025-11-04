import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Save or update room with race condition handling
export const saveRoom = mutation({
  args: {
    roomId: v.string(),
    content: v.string(),
    language: v.string(),
    username: v.string(),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    try {
      // Attempt to fetch the room with the given roomId
      const existing = await ctx.db
        .query("rooms")
        .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
        .first();
        
      if (existing) {
        // Update the existing room
        await ctx.db.patch(existing._id, {
          content: args.content,
          language: args.language,
          lastEditedBy: args.username,
          lastEditedAt: Date.now(),
        });
      } else {
        // Try to insert a new room
        // If another request creates the room before this one completes, 
        // the insert will fail but Convex will handle retries appropriately
        await ctx.db.insert("rooms", {
          roomId: args.roomId,
          content: args.content,
          language: args.language,
          lastEditedBy: args.username,
          lastEditedAt: Date.now(),
        });
      }
      
      return { success: true };
    } catch (error) {
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
          await ctx.db.patch(retryRoom._id, {
            content: args.content,
            language: args.language,
            lastEditedBy: args.username,
            lastEditedAt: Date.now(),
          });
          return { success: true };
        }
      }
      
      // Re-throw if it's a different error
      throw error;
    }
  },
});

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
      content: v.string(),
      language: v.string(),
      lastEditedBy: v.string(),
      lastEditedAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const room = await ctx.db
      .query("rooms")
      .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
      .first();
    
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
    content: v.string(),
    language: v.string(),
    lastEditedBy: v.string(),
    lastEditedAt: v.number(),
  })),
  handler: async (ctx) => {
    return await ctx.db
      .query("rooms")
      .order("desc")
      .take(100);
  },
});