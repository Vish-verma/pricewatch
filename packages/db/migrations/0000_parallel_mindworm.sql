CREATE TYPE "public"."alert_channel" AS ENUM('email', 'webhook');--> statement-breakpoint
CREATE TYPE "public"."alert_status" AS ENUM('pending', 'sent', 'failed');--> statement-breakpoint
CREATE TYPE "public"."currency" AS ENUM('INR', 'USD', 'EUR', 'GBP');--> statement-breakpoint
CREATE TYPE "public"."scrape_run_status" AS ENUM('queued', 'running', 'succeeded', 'failed', 'dead');--> statement-breakpoint
CREATE TYPE "public"."watch_status" AS ENUM('active', 'paused', 'failing', 'dead');--> statement-breakpoint
CREATE TABLE "alerts" (
	"id" text PRIMARY KEY NOT NULL,
	"watch_id" text NOT NULL,
	"triggered_price" numeric(10, 2) NOT NULL,
	"threshold_price" numeric(10, 2) NOT NULL,
	"channel" "alert_channel" DEFAULT 'email' NOT NULL,
	"status" "alert_status" DEFAULT 'pending' NOT NULL,
	"sent_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "price_points" (
	"id" text PRIMARY KEY NOT NULL,
	"watch_id" text NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"currency" "currency" NOT NULL,
	"in_stock" boolean DEFAULT true NOT NULL,
	"observed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scrape_runs" (
	"id" text PRIMARY KEY NOT NULL,
	"watch_id" text NOT NULL,
	"idempotency_key" text NOT NULL,
	"status" "scrape_run_status" DEFAULT 'queued' NOT NULL,
	"attempt" integer DEFAULT 1 NOT NULL,
	"error_type" text,
	"error_message" text,
	"duration_ms" integer,
	"started_at" timestamp with time zone,
	"finished_at" timestamp with time zone,
	CONSTRAINT "scrape_runs_idempotency_key_unique" UNIQUE("idempotency_key")
);
--> statement-breakpoint
CREATE TABLE "watches" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"url" text NOT NULL,
	"url_hash" text NOT NULL,
	"label" varchar(120) NOT NULL,
	"target_price" numeric(10, 2) NOT NULL,
	"currency" "currency" NOT NULL,
	"check_interval_minutes" integer DEFAULT 360 NOT NULL,
	"next_check_at" timestamp with time zone NOT NULL,
	"status" "watch_status" DEFAULT 'active' NOT NULL,
	"consecutive_failures" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "watches_url_hash_unique" UNIQUE("url_hash")
);
--> statement-breakpoint
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_watch_id_watches_id_fk" FOREIGN KEY ("watch_id") REFERENCES "public"."watches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_points" ADD CONSTRAINT "price_points_watch_id_watches_id_fk" FOREIGN KEY ("watch_id") REFERENCES "public"."watches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scrape_runs" ADD CONSTRAINT "scrape_runs_watch_id_watches_id_fk" FOREIGN KEY ("watch_id") REFERENCES "public"."watches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "price_points_watch_observed_idx" ON "price_points" USING btree ("watch_id","observed_at");