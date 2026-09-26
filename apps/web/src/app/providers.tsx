"use client";

import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With server-provided initialData, a staleTime of 0 would make
        // every component refetch the instant it mounts — a pointless
        // duplicate request. 5s says "fresh data is fresh for 5s."
        staleTime: 5_000,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  // Server: a brand-new client for every request.
  if (typeof window === "undefined") return makeQueryClient();
  // Browser: create once, reuse across renders so the cache survives.
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={getQueryClient()}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}