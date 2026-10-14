ALTER TABLE "sessions" ADD COLUMN "previous_token_hash" text;--> statement-breakpoint
CREATE INDEX "sessions_previous_token_hash_idx" ON "sessions" USING btree ("previous_token_hash");