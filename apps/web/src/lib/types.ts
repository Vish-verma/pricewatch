import type { Currency, WatchStatus } from "@pricewatch/schemas";

// The shape of a watch once it leaves the server. Dates are ISO
// strings because that's what survives JSON.
export type WatchDTO = {
  id: string;
  url: string;
  label: string;
  targetPrice: number;
  currency: Currency;
  checkIntervalMinutes: number;
  status: WatchStatus;
  nextCheckAt: string;
  createdAt: string;
};

export type PricePointDTO = {
  observedAt: string;
  price: number;
  inStock: boolean;
};