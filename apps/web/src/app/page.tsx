import { db, watches } from "@pricewatch/db";
import { desc } from "drizzle-orm";
import { createWatchAction } from "./actions";

export default async function DashboardPage() {
  const allWatches = await db.select().from(watches).orderBy(desc(watches.createdAt));

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: 640 }}>
      <h1>PriceWatch</h1>

      <form action={createWatchAction} style={{ display: "grid", gap: "0.5rem", marginBottom: "2rem" }}>
        <input name="url" type="url" placeholder="Product URL" required />
        <input name="label" placeholder="Label" required />
        <input name="targetPrice" type="number" step="0.01" placeholder="Target price" required />
        <select name="currency" defaultValue="INR">
          <option value="INR">INR</option>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="GBP">GBP</option>
        </select>
        <input name="checkIntervalMinutes" type="number" defaultValue={360} required />
        <button type="submit">Add watch</button>
      </form>

      <h2>Your watches ({allWatches.length})</h2>
      <ul>
        {allWatches.map((w) => (
          <li key={w.id}>
            {w.label} — target {w.currency} {w.targetPrice} — status: {w.status}
          </li>
        ))}
      </ul>
    </main>
  );
}