"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteWatch, fetchWatches, watchKeys } from "@/lib/api";
import type { WatchDTO } from "@/lib/types";

export function WatchList({ initialWatches }: { initialWatches: WatchDTO[] }) {
  const { data: watches, isFetching, error } = useQuery({
    queryKey: watchKeys.all,
    queryFn: fetchWatches,
    initialData: initialWatches,
    refetchInterval: 10_000, // poll every 10s
  });

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteWatch,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: watchKeys.all });
      const previous = queryClient.getQueryData<WatchDTO[]>(watchKeys.all);
      queryClient.setQueryData<WatchDTO[]>(watchKeys.all, (old = []) =>
        old.filter((w) => w.id !== id)
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(watchKeys.all, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: watchKeys.all });
    },
  });

  return (
    <section>
      <h2>
        Your watches ({watches.length}){" "}
        <small style={{ fontWeight: "normal", color: "#888" }}>
          {isFetching ? "refreshing…" : "up to date"}
        </small>
      </h2>

      {error && <p style={{ color: "red" }}>Couldn't refresh: {error.message}</p>}

      <ul>
        {watches.map((w) => {
          const pending = w.id.startsWith("temp-");
          return (
            <li key={w.id} style={{ opacity: pending ? 0.5 : 1 }}>
              {pending ? w.label : <Link href={`/watches/${w.id}`}>{w.label}</Link>}
              {" — "}target {w.currency} {w.targetPrice} — status: {w.status}
              {pending && " (saving…)"}
              {!pending && (
                <button onClick={() => deleteMutation.mutate(w.id)} style={{ marginLeft: "0.5rem" }}>
                  Delete
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}