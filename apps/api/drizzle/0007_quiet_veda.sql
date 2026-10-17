CREATE TYPE "public"."account_role" AS ENUM('USER', 'ACCOUNT_ADMIN', 'ROOT');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "account_role" "account_role" DEFAULT 'USER' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "must_change_password" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "users_directory_actor_id_unique" ON "users" USING btree ("directory_actor_id") WHERE "users"."directory_actor_id" is not null;