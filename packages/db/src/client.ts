import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Are you running this without --env-file, " +
    "or inside an app that hasn't loaded .env yet?"
  );
}

// Next.js's Fast Refresh re-evaluates this module on every save in
// dev. Without caching, that creates a brand-new connection pool
// each time, leaving old ones stale — which is what causes ECONNRESET
// errors after a few edits. Stashing the client on `globalThis`
// survives Fast Refresh so dev keeps reusing the same pool. In
// production this file only runs once per process anyway, so the
// cache has no effect there.
const globalForDb = globalThis as unknown as {
  queryClient?: ReturnType<typeof postgres>;
};

const queryClient = globalForDb.queryClient ?? postgres(process.env.DATABASE_URL);

if (process.env.NODE_ENV !== "production") {
  globalForDb.queryClient = queryClient;
}

export const db = drizzle(queryClient, { schema });