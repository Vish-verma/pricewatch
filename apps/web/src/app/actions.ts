"use server";

import { db, watches } from "@pricewatch/db";
import { createWatchSchema } from "@pricewatch/schemas";
import { revalidatePath } from "next/cache";
import crypto from "node:crypto";

// TEMP: no auth yet. Every watch is owned by this placeholder user
// until Better Auth is wired up next session — see the FK note
// in the Session 3 schema file.
const DEV_USER_ID = "00000000-0000-0000-0000-000000000000";

export async function createWatchAction(formData: FormData) {
  const raw = {
    url: formData.get("url"),
    label: formData.get("label"),
    targetPrice: Number(formData.get("targetPrice")),
    currency: formData.get("currency"),
    checkIntervalMinutes: Number(formData.get("checkIntervalMinutes")),
  };

  const parsed = createWatchSchema.safeParse(raw);
  if (!parsed.success) {
    // Proper inline error display comes with the TanStack Query
    // rewrite in Phase 3. For now, a bad submission just no-ops.
    console.error("Invalid watch input:", parsed.error.format());
    return;
  }

  const { url, label, targetPrice, currency, checkIntervalMinutes } = parsed.data;
  const urlHash = crypto.createHash("sha256").update(url).digest("hex");

  await db.insert(watches).values({
    userId: DEV_USER_ID,
    url,
    urlHash,
    label,
    targetPrice,
    currency,
    checkIntervalMinutes,
    nextCheckAt: new Date(),
  });

  revalidatePath("/");
}