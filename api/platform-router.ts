import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { platformConnections } from "@db/schema";
import { eq } from "drizzle-orm";

export const platformRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    const items = await db.select().from(platformConnections);
    return items;
  }),

  connect: publicQuery
    .input(
      z.object({
        platform: z.string().min(1),
        accountHandle: z.string().min(1),
        accountName: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      // Check if connection already exists
      const [existing] = await db
        .select()
        .from(platformConnections)
        .where(eq(platformConnections.platform, input.platform))
        .limit(1);

      if (existing) {
        await db
          .update(platformConnections)
          .set({
            accountHandle: input.accountHandle,
            accountName: input.accountName ?? input.accountHandle,
            isConnected: true,
            updatedAt: new Date(),
          })
          .where(eq(platformConnections.id, existing.id));
        const [updated] = await db
          .select()
          .from(platformConnections)
          .where(eq(platformConnections.id, existing.id))
          .limit(1);
        return updated;
      }

      const [item] = await db.insert(platformConnections).values({
        userId: 1,
        platform: input.platform,
        accountHandle: input.accountHandle,
        accountName: input.accountName ?? input.accountHandle,
        isConnected: true,
      });
      const [created] = await db
        .select()
        .from(platformConnections)
        .where(eq(platformConnections.id, Number(item.insertId)))
        .limit(1);
      return created;
    }),

  disconnect: publicQuery
    .input(z.object({ platform: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(platformConnections)
        .set({
          isConnected: false,
          accountHandle: null,
          accountName: null,
          updatedAt: new Date(),
        })
        .where(eq(platformConnections.platform, input.platform));
      return { success: true };
    }),

  updateStatus: publicQuery
    .input(
      z.object({
        platform: z.string(),
        isConnected: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(platformConnections)
        .set({
          isConnected: input.isConnected,
          updatedAt: new Date(),
        })
        .where(eq(platformConnections.platform, input.platform));
      const [updated] = await db
        .select()
        .from(platformConnections)
        .where(eq(platformConnections.platform, input.platform))
        .limit(1);
      return updated;
    }),
});
