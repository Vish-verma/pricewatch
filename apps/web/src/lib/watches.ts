import "server-only";
import crypto from "node:crypto";
import { db, watches, pricePoints, and, asc, desc, eq } from "@pricewatch/db";
import type { CreateWatchInput } from "@pricewatch/schemas";
import type { PricePointDTO, WatchDTO } from "./types";

type WatchRow = typeof watches.$inferSelect;

function toWatchDTO(w: WatchRow): WatchDTO {
  return {
    id: w.id,
    url: w.url,
    label: w.label,
    targetPrice: w.targetPrice,
    currency: w.currency,
    checkIntervalMinutes: w.checkIntervalMinutes,
    status: w.status,
    nextCheckAt: w.nextCheckAt.toISOString(),
    createdAt: w.createdAt.toISOString(),
  };
}

export async function getWatchesForUser(userId: string): Promise<WatchDTO[]> {
  const rows = await db
    .select()
    .from(watches)
    .where(eq(watches.userId, userId))
    .orderBy(desc(watches.createdAt));
  return rows.map(toWatchDTO);
}

export async function createWatchForUser(
  userId: string,
  input: CreateWatchInput
): Promise<WatchDTO> {
  const urlHash = crypto.createHash("sha256").update(input.url).digest("hex");
  const [row] = await db
    .insert(watches)
    .values({ ...input, userId, urlHash, nextCheckAt: new Date() })
    .returning();

  // `row` is typed `WatchRow | undefined` because of
  // noUncheckedIndexedAccess from Session 2. The flag doing its job.
  if (!row) throw new Error("Insert returned no row");
  return toWatchDTO(row);
}

export async function getWatchWithHistory(userId: string, watchId: string) {
  const [row] = await db
    .select()
    .from(watches)
    .where(and(eq(watches.id, watchId), eq(watches.userId, userId)));
  if (!row) return null;

  const points = await db
    .select()
    .from(pricePoints)
    .where(eq(pricePoints.watchId, watchId))
    .orderBy(asc(pricePoints.observedAt));

  const history: PricePointDTO[] = points.map((p) => ({
    observedAt: p.observedAt.toISOString(),
    price: p.price,
    inStock: p.inStock,
  }));

  return { watch: toWatchDTO(row), history };
}

// Postgres error code 23505 = unique constraint violated.
// Drizzle wraps the driver's error, so check both levels.
export function isUniqueViolation(err: unknown): boolean {
  const e = err as { code?: string; cause?: { code?: string } } | null;
  return e?.code === "23505" || e?.cause?.code === "23505";
}