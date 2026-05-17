import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { exports } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const exportRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        limit: z.number().min(1).max(100).optional().default(20),
        offset: z.number().min(0).optional().default(0),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const items = await db
        .select()
        .from(exports)
        .orderBy(desc(exports.createdAt))
        .limit(input.limit)
        .offset(input.offset);
      return items;
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const [item] = await db
        .select()
        .from(exports)
        .where(eq(exports.id, input.id))
        .limit(1);
      return item ?? null;
    }),

  create: publicQuery
    .input(
      z.object({
        title: z.string().min(1).max(255),
        caption: z.string().optional(),
        filterName: z.string().optional(),
        duration: z.number().min(0),
        trimStart: z.number().optional(),
        trimEnd: z.number().optional(),
        resolution: z.string().optional(),
        thumbnailUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const [item] = await db.insert(exports).values({
        title: input.title,
        caption: input.caption ?? null,
        filterName: input.filterName ?? null,
        duration: input.duration,
        trimStart: input.trimStart ?? 0,
        trimEnd: input.trimEnd ?? null,
        resolution: input.resolution ?? "1080p",
        thumbnailUrl: input.thumbnailUrl ?? null,
        status: "draft",
      });
      const [created] = await db
        .select()
        .from(exports)
        .where(eq(exports.id, Number(item.insertId)))
        .limit(1);
      return created;
    }),

  update: publicQuery
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        caption: z.string().optional(),
        filterName: z.string().optional(),
        trimStart: z.number().optional(),
        trimEnd: z.number().optional(),
        status: z.string().optional(),
        thumbnailUrl: z.string().optional(),
        fileUrl: z.string().optional(),
        platforms: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, platforms, ...updates } = input;
      const setData: Record<string, unknown> = { ...updates };
      if (platforms !== undefined) {
        setData.platforms = JSON.stringify(platforms);
      }
      await db
        .update(exports)
        .set(setData)
        .where(eq(exports.id, id));
      const [updated] = await db
        .select()
        .from(exports)
        .where(eq(exports.id, id))
        .limit(1);
      return updated;
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(exports).where(eq(exports.id, input.id));
      return { success: true };
    }),
});
