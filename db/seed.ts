import { getDb } from "../api/queries/connection";
import { exports, platformConnections } from "./schema";

async function seed() {
  const db = getDb();

  // Seed sample exports
  await db.insert(exports).values({
    title: "Epic Mountain Hike",
    caption: "Ready to turn your ideas into something epic?",
    filterName: "cinematic",
    duration: 5,
    trimStart: 0,
    trimEnd: 5,
    platforms: JSON.stringify(["youtube", "tiktok"]),
    status: "completed",
    thumbnailUrl: "/assets/thumb-hike.jpg",
    resolution: "1080p",
  });

  await db.insert(exports).values({
    title: "Cyberpunk Nightwalk",
    caption: "Exploring neon-lit streets of Tokyo",
    filterName: "neon",
    duration: 5,
    trimStart: 0,
    trimEnd: 5,
    platforms: JSON.stringify(["instagram", "x"]),
    status: "completed",
    thumbnailUrl: "/assets/thumb-city.jpg",
    resolution: "1080p",
  });

  await db.insert(exports).values({
    title: "Flame Feast Cooking",
    caption: "The art of fire cooking",
    filterName: "warm",
    duration: 5,
    trimStart: 0,
    trimEnd: 5,
    platforms: JSON.stringify(["youtube"]),
    status: "completed",
    thumbnailUrl: "/assets/thumb-cooking.jpg",
    resolution: "1080p",
  });

  // Seed a connected platform
  await db.insert(platformConnections).values({
    userId: 1,
    platform: "youtube",
    accountHandle: "CineStudio",
    accountName: "Cine Studio",
    isConnected: true,
  });

  console.log("Seed complete!");
}

seed().catch(console.error);
