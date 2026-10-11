ALTER TABLE "watches" DROP CONSTRAINT "watches_url_hash_unique";--> statement-breakpoint
CREATE UNIQUE INDEX "watches_user_url_idx" ON "watches" USING btree ("user_id","url_hash");