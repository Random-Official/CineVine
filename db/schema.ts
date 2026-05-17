import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
  float,
  bigint,
  boolean,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Video exports table
export const exports = mysqlTable("exports", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }),
  title: varchar("title", { length: 255 }).notNull(),
  caption: text("caption"),
  filterName: varchar("filterName", { length: 100 }),
  duration: int("duration").notNull().default(0),
  trimStart: float("trimStart").default(0),
  trimEnd: float("trimEnd"),
  platforms: text("platforms"),
  status: mysqlEnum("status", ["draft", "processing", "completed", "failed"])
    .default("draft")
    .notNull(),
  thumbnailUrl: varchar("thumbnailUrl", { length: 500 }),
  fileUrl: varchar("fileUrl", { length: 500 }),
  fileSize: bigint("fileSize", { mode: "number", unsigned: true }).default(0),
  resolution: varchar("resolution", { length: 20 }).default("1080p"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Export = typeof exports.$inferSelect;
export type InsertExport = typeof exports.$inferInsert;

// Platform connections table
export const platformConnections = mysqlTable("platform_connections", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  platform: varchar("platform", { length: 50 }).notNull(),
  accountHandle: varchar("accountHandle", { length: 255 }),
  accountName: varchar("accountName", { length: 255 }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  tokenExpiresAt: timestamp("tokenExpiresAt"),
  isConnected: boolean("isConnected").notNull().default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type PlatformConnection = typeof platformConnections.$inferSelect;
export type InsertPlatformConnection = typeof platformConnections.$inferInsert;

// Publish jobs table
export const publishJobs = mysqlTable("publish_jobs", {
  id: serial("id").primaryKey(),
  exportId: bigint("exportId", { mode: "number", unsigned: true }).notNull(),
  platform: varchar("platform", { length: 50 }).notNull(),
  status: mysqlEnum("status", [
    "pending",
    "uploading",
    "processing",
    "published",
    "failed",
  ])
    .default("pending")
    .notNull(),
  progress: int("progress").default(0),
  platformPostUrl: varchar("platformPostUrl", { length: 500 }),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type PublishJob = typeof publishJobs.$inferSelect;
export type InsertPublishJob = typeof publishJobs.$inferInsert;
