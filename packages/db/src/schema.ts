import {
  pgTable,
  pgEnum,
  text,
  varchar,
  integer,
  numeric,
  boolean,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ── Enums ────────────────────────────────────────────────

export const watchStatusEnum = pgEnum("watch_status", [
  "active",
  "paused",
  "failing",
  "dead",
]);

export const currencyEnum = pgEnum("currency", ["INR", "USD", "EUR", "GBP"]);

export const scrapeRunStatusEnum = pgEnum("scrape_run_status", [
  "queued",
  "running",
  "succeeded",
  "failed",
  "dead",
]);

export const alertChannelEnum = pgEnum("alert_channel", ["email", "webhook"]);

export const alertStatusEnum = pgEnum("alert_status", [
  "pending",
  "sent",
  "failed",
]);

// ── Watches ──────────────────────────────────────────────

export const watches = pgTable("watches", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  // No .references() yet — see §0. Becomes a real FK once
  // Better Auth's users table exists (Phase 1).
  userId: text("user_id").notNull(),

  url: text("url").notNull(),
  urlHash: text("url_hash").notNull().unique(),
  label: varchar("label", { length: 120 }).notNull(),

  targetPrice: numeric("target_price", {
    precision: 10,
    scale: 2,
    mode: "number",
  }).notNull(),
  currency: currencyEnum("currency").notNull(),

  checkIntervalMinutes: integer("check_interval_minutes").notNull().default(360),
  nextCheckAt: timestamp("next_check_at", { withTimezone: true }).notNull(),
  status: watchStatusEnum("status").notNull().default("active"),
  consecutiveFailures: integer("consecutive_failures").notNull().default(0),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const watchesRelations = relations(watches, ({ many }) => ({
  pricePoints: many(pricePoints),
  scrapeRuns: many(scrapeRuns),
  alerts: many(alerts),
}));

// ── Price points (time series) ───────────────────────────

export const pricePoints = pgTable(
  "price_points",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    watchId: text("watch_id")
      .notNull()
      .references(() => watches.id, { onDelete: "cascade" }),

    price: numeric("price", { precision: 10, scale: 2, mode: "number" }).notNull(),
    currency: currencyEnum("currency").notNull(),
    inStock: boolean("in_stock").notNull().default(true),

    observedAt: timestamp("observed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    // Postgres can scan a plain ascending b-tree index backwards
    // just as efficiently for ORDER BY DESC — no special
    // descending index needed for the history-chart query.
    watchObservedIdx: index("price_points_watch_observed_idx").on(
      table.watchId,
      table.observedAt
    ),
  })
);

export const pricePointsRelations = relations(pricePoints, ({ one }) => ({
  watch: one(watches, { fields: [pricePoints.watchId], references: [watches.id] }),
}));

// ── Scrape runs (audit log — see project spec §3) ────────

export const scrapeRuns = pgTable("scrape_runs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  watchId: text("watch_id")
    .notNull()
    .references(() => watches.id, { onDelete: "cascade" }),

  idempotencyKey: text("idempotency_key").notNull().unique(),
  status: scrapeRunStatusEnum("status").notNull().default("queued"),
  attempt: integer("attempt").notNull().default(1),

  errorType: text("error_type"),
  errorMessage: text("error_message"),
  durationMs: integer("duration_ms"),

  startedAt: timestamp("started_at", { withTimezone: true }),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
});

export const scrapeRunsRelations = relations(scrapeRuns, ({ one }) => ({
  watch: one(watches, { fields: [scrapeRuns.watchId], references: [watches.id] }),
}));

// ── Alerts ────────────────────────────────────────────────

export const alerts = pgTable("alerts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  watchId: text("watch_id")
    .notNull()
    .references(() => watches.id, { onDelete: "cascade" }),

  triggeredPrice: numeric("triggered_price", { precision: 10, scale: 2, mode: "number" }).notNull(),
  thresholdPrice: numeric("threshold_price", { precision: 10, scale: 2, mode: "number" }).notNull(),
  channel: alertChannelEnum("channel").notNull().default("email"),
  status: alertStatusEnum("status").notNull().default("pending"),

  sentAt: timestamp("sent_at", { withTimezone: true }),
});

export const alertsRelations = relations(alerts, ({ one }) => ({
  watch: one(watches, { fields: [alerts.watchId], references: [watches.id] }),
}));