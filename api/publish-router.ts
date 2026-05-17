import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { publishJobs, exports } from "@db/schema";
import { eq } from "drizzle-orm";

export const publishRouter = createRouter({
  start: publicQuery
    .input(
      z.object({
        exportId: z.number(),
        platforms: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const jobs = [];
      for (const platform of input.platforms) {
        const [item] = await db.insert(publishJobs).values({
          exportId: input.exportId,
          platform,
          status: "pending",
          progress: 0,
        });
        const [created] = await db
          .select()
          .from(publishJobs)
          .where(eq(publishJobs.id, Number(item.insertId)))
          .limit(1);
        jobs.push(created);
      }
      // Update export platforms
      await db
        .update(exports)
        .set({
          platforms: JSON.stringify(input.platforms),
          status: "processing",
          updatedAt: new Date(),
        })
        .where(eq(exports.id, input.exportId));
      return jobs;
    }),

  getJobs: publicQuery
    .input(z.object({ exportId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const items = await db
        .select()
        .from(publishJobs)
        .where(eq(publishJobs.exportId, input.exportId));
      return items;
    }),

  updateProgress: publicQuery
    .input(
      z.object({
        jobId: z.number(),
        progress: z.number().min(0).max(100),
        status: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const updates: Record<string, unknown> = { progress: input.progress };
      if (input.status) updates.status = input.status;
      await db
        .update(publishJobs)
        .set(updates)
        .where(eq(publishJobs.id, input.jobId));
      const [updated] = await db
        .select()
        .from(publishJobs)
        .where(eq(publishJobs.id, input.jobId))
        .limit(1);
      return updated;
    }),

  complete: publicQuery
    .input(
      z.object({
        jobId: z.number(),
        platformPostUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(publishJobs)
        .set({
          status: "published",
          progress: 100,
          platformPostUrl: input.platformPostUrl ?? null,
        })
        .where(eq(publishJobs.id, input.jobId));
      const [updated] = await db
        .select()
        .from(publishJobs)
        .where(eq(publishJobs.id, input.jobId))
        .limit(1);
      return updated;
    }),
});
