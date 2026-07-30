import { createWatchSchema, buildIdempotencyKey, pricePointSchema} from "@pricewatch/schemas";


const result = createWatchSchema.safeParse({
  url: "https://example.com/product/123",
  label: "Test watch",
  targetPrice: 4000,
  currency: "INR",
  checkIntervalMinutes: 360,
});

if (result.success) {
  console.log("Valid:", result.data);
} else {
  console.log("Invalid:", result.error.format());
}

console.log(buildIdempotencyKey({ watchId: "abc-123", scheduledSlot: "2026-07-30T12:00" }));