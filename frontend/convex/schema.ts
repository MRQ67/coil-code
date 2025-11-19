import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  rooms: defineTable({
    roomId: v.string(),                       // Room ID from URL
    htmlContent: v.optional(v.string()),      // HTML content
    cssContent: v.optional(v.string()),       // CSS content
    jsContent: v.optional(v.string()),        // JavaScript content
    lastEditedBy: v.string(),                 // Username of last editor
    lastEditedAt: v.number(),                 // Timestamp (Date.now())

    // Analytics fields
    lastActiveAt: v.number(),                 // Last activity timestamp (for cleanup)
    saveCount: v.optional(v.number()),        // Total number of saves
    totalSize: v.optional(v.number()),        // Total content size in bytes
    createdAt: v.optional(v.number()),        // Room creation timestamp
  })
    .index("by_roomId", ["roomId"])           // Index for fast lookup by roomId
    .index("by_lastActiveAt", ["lastActiveAt"]), // Index for cleanup queries
});