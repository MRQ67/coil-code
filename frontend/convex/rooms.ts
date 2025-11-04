import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Save or update room
export const saveRoom = mutation({
  args: {
    roomId: v.string(),
    content: v.string(),
    language: v.string(),
    username: v.string(),
  },
  handler: async (ctx, args) => {
    // Try to update an existing room first
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
      // If another request created the room in the meantime, the insert will fail
      // In that case, we'll catch the error and update instead
      try {
        await ctx.db.insert("rooms", {
          roomId: args.roomId,
          content: args.content,
          language: args.language,
          lastEditedBy: args.username,
          lastEditedAt: Date.now(),
        });
      } catch (e) {
        // If the insert failed because another request created the room, 
        // try updating the existing room
        const room = await ctx.db
          .query("rooms")
          .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
          .first();
          
        if (room) {
          await ctx.db.patch(room._id, {
            content: args.content,
            language: args.language,
            lastEditedBy: args.username,
            lastEditedAt: Date.now(),
          });
        } else {
          // This shouldn't happen - but if it does, throw an error
          throw new Error(`Could not find or create room with ID: ${args.roomId}`);
        }
      }
    }
    
    return { success: true };
  },
});

// Get room by ID
export const getRoom = query({
  args: { roomId: v.string() },
  handler: async (ctx, args) => {
    const room = await ctx.db
      .query("rooms")
      .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
      .first();
    
    return room || null;
  },
});

// Get all rooms (for future "My Rooms" feature)
export const getAllRooms = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("rooms")
      .order("desc")
      .take(100);
  },
});