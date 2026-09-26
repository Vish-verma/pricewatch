import type { CreateWatchInput } from "@pricewatch/schemas";
import type { WatchDTO } from "./types";

// One place for cache keys. Typos in keys cause silent cache bugs.
export const watchKeys = {
  all: ["watches"] as const,
};

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed (${res.status})`);
  }
  // 204 No Content has no body — calling res.json() on it throws.
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export function fetchWatches(): Promise<WatchDTO[]> {
  return fetch("/api/watches").then((r) => handle<WatchDTO[]>(r));
}

export function createWatch(input: CreateWatchInput): Promise<WatchDTO> {
  return fetch("/api/watches", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  }).then((r) => handle<WatchDTO>(r));
}