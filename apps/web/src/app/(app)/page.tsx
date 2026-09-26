import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getWatchesForUser } from "@/lib/watches";
import { WatchList } from "@/components/watch-list";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const initialWatches = await getWatchesForUser(session.user.id);

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: 720 }}>
      {/* AddWatchForm goes here in Part G */}
      <WatchList initialWatches={initialWatches} />
    </main>
  );
}