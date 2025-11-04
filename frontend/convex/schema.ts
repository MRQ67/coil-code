import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  rooms: defineTable({
    roomId: v.string(),           // Room ID from URL
    content: v.string(),          // Editor content
    language: v.string(),         // Programming language
    lastEditedBy: v.string(),     // Username
    lastEditedAt: v.number(),     // Timestamp (Date.now())
  })
    .index("by_roomId", ["roomId"]), // Index for fast queries
});