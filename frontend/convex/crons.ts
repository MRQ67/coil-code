import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// OPTIMIZED: Run cleanup every day at 3 AM UTC
// Removes rooms inactive for 30+ days to manage database size
crons.daily(
  "cleanup inactive rooms",
  { hourUTC: 3, minuteUTC: 0 },
  internal.rooms.cleanupInactiveRooms,
  { dryRun: false }
);

export default crons;
