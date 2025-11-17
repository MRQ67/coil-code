import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  rooms: defineTable({
    roomId: v.string(),           // Room ID from URL
    htmlContent: v.optional(v.string()),      // HTML content
    cssContent: v.optional(v.string()),       // CSS content
    jsContent: v.optional(v.string()),        // JavaScript content
    lastEditedBy: v.string(),     // Username
    lastEditedAt: v.number(),     // Timestamp (Date.now())
  })
    .index("by_roomId", ["roomId"]), // Index for fast queries
});