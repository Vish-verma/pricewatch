"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PricePointDTO } from "@/lib/types";

// Fixed locale + timezone so the server render and the browser render
// produce identical text. Otherwise the browser's timezone can differ
// from the server's and React reports a hydration mismatch.
const dayFormat = new Intl.DateTimeFormat("en-IN", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

export function PriceChart({
  data,
  targetPrice,
}: {
  data: PricePointDTO[];
  targetPrice: number;
}) {
  if (data.length === 0) {
    return <p>No price history yet. Run the seed script, or wait for the worker (Phase 4).</p>;
  }

  const chartData = data.map((p) => ({
    ...p,
    day: dayFormat.format(new Date(p.observedAt)),
  }));

  return (
    <div style={{ width: "100%", height: 320 }}>
      <ResponsiveContainer>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis domain={["auto", "auto"]} />
          <Tooltip />
          <ReferenceLine y={targetPrice} strokeDasharray="4 4" label="Target" />
          {/* Animation off: Recharts' animation causes server/client
              hydration mismatches in Next.js. Known issue. */}
          <Line type="monotone" dataKey="price" dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}