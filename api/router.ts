import { authRouter } from "./auth-router";
import { exportRouter } from "./export-router";
import { platformRouter } from "./platform-router";
import { publishRouter } from "./publish-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  export: exportRouter,
  platform: platformRouter,
  publish: publishRouter,
});

export type AppRouter = typeof appRouter;
