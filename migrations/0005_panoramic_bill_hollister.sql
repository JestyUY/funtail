CREATE TABLE IF NOT EXISTS "rate_limits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ip" text NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"last_reset" timestamp DEFAULT now() NOT NULL
);
