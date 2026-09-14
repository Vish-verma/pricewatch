"use server";

import { db, watches } from "@pricewatch/db";
import { createWatchSchema } from "@pricewatch/schemas";
import { revalidatePath } from "next/cache";
import crypto from "node:crypto";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function createWatchAction(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("Not authenticated");
  }
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
    userId: session.user.id,
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