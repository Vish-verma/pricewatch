import { db } from "./client";
import { pricePoints, watches } from "./schema";

async function main() {
  const allWatches = await db.select().from(watches);
  if (allWatches.length === 0) {
    console.log("No watches found — add some in the app first.");
    return;
  }

  const DAYS = 30;
  const DAY_MS = 86_400_000;
  const now = Date.now();

  for (const w of allWatches) {
    // Start ~15% above target and random-walk, drifting slightly down.
    let price = w.targetPrice * 1.15;
    const rows: (typeof pricePoints.$inferInsert)[] = [];

    for (let d = DAYS; d >= 0; d--) {
      price = Math.max(1, price * (1 + (Math.random() - 0.55) * 0.04));
      rows.push({
        watchId: w.id,
        price: Math.round(price * 100) / 100,
        currency: w.currency,
        inStock: Math.random() > 0.05,
        observedAt: new Date(now - d * DAY_MS),
      });
    }

    await db.insert(pricePoints).values(rows);
    console.log(`Seeded ${rows.length} points for "${w.label}"`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });