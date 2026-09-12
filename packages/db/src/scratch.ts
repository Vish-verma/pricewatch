import { db } from "./client.js";
import { watches } from "./schema.js";

async function main() {
  const [inserted] = await db
    .insert(watches)
    .values({
      userId: "00000000-0000-0000-0000-000000000000", // placeholder — no FK yet, see §0
      url: "https://example.com/product/123",
      urlHash: "placeholder-hash-1",
      label: "Test watch",
      targetPrice: 4000,
      currency: "INR",
      checkIntervalMinutes: 360,
      nextCheckAt: new Date(),
    })
    .returning();

  console.log("Inserted:", inserted);

  const all = await db.select().from(watches);
  console.log("All watches in table:", all);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });