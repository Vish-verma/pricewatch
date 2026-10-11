import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getWatchWithHistory } from "@/lib/watches";
import { PriceChart } from "@/components/price-chart";

export default async function WatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const { id } = await params;
  const result = await getWatchWithHistory(session.user.id, id);
  if (!result) notFound(); // doesn't exist, OR belongs to someone else

  const { watch, history } = result;
  const latest = history.at(-1);

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: 820 }}>
      <p><Link href="/">← Back to watches</Link></p>
      <h1>{watch.label}</h1>
      <p style={{ color: "#666", wordBreak: "break-all" }}>{watch.url}</p>
      <p>
        Target: <strong>{watch.currency} {watch.targetPrice}</strong>
        {latest && <> · Latest: <strong>{watch.currency} {latest.price}</strong></>}
        {" "}· Status: {watch.status}
      </p>
      <PriceChart data={history} targetPrice={watch.targetPrice} />
    </main>
  );
}