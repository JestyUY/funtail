ALTER TABLE "user" ADD COLUMN "last_album_creation_date" timestamp;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "daily_album_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "total_optimizations" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "last_optimization_reset" timestamp;