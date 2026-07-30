import { z } from "zod";

// ── Watch ────────────────────────────────────────────────

export const watchStatusSchema = z.enum([
  "active",
  "paused",
  "failing",
  "dead",
]);
export type WatchStatus = z.infer<typeof watchStatusSchema>;

export const currencySchema = z.enum(["INR", "USD", "EUR", "GBP"]);
export type Currency = z.infer<typeof currencySchema>;

// The shape used when a user creates a new watch via the form/API.
// No id, no timestamps — those get generated server-side.
export const createWatchSchema = z.object({
  url: z.url(),
  label: z.string().min(1).max(120),
  targetPrice: z.number().positive(),
  currency: currencySchema,
  checkIntervalMinutes: z.number().int().min(60), // don't allow < 1hr checks
});
export type CreateWatchInput = z.infer<typeof createWatchSchema>;

// The full stored shape, as it comes back out of the database.
export const watchSchema = createWatchSchema.extend({
  id: z.uuid(),
  userId: z.uuid(),
  status: watchStatusSchema,
  consecutiveFailures: z.number().int().min(0),
  nextCheckAt: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Watch = z.infer<typeof watchSchema>;

// ── Price points ─────────────────────────────────────────

export const pricePointSchema = z.object({
  id: z.uuid(),
  watchId: z.uuid(),
  price: z.number().positive(),
  currency: currencySchema,
  inStock: z.boolean(),
  observedAt: z.date(),
});
export type PricePoint = z.infer<typeof pricePointSchema>;

// ── Queue messages ───────────────────────────────────────
// This is what the scheduler publishes and the worker consumes.
// Keeping it minimal on purpose — the worker looks up everything
// else it needs from the database using watchId.

export const scrapeJobSchema = z.object({
  watchId: z.uuid(),
  url: z.url(),
  scheduledSlot: z.string(), // ISO string, e.g. "2026-07-30T12:00:00.000Z"
  attempt: z.number().int().min(1),
});
export type ScrapeJob = z.infer<typeof scrapeJobSchema>;

// A little utility type you'll reach for a lot: builds the
// idempotency key described in the project spec, §8.
export function buildIdempotencyKey(job: Pick<ScrapeJob, "watchId" | "scheduledSlot">): string {
  return `${job.watchId}:${job.scheduledSlot}`;
}