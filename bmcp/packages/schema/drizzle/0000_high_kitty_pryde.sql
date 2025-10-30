CREATE TABLE IF NOT EXISTS "calls" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mapping_id" uuid NOT NULL,
	"caller_id" uuid NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"duration_ms" integer NOT NULL,
	"req_bytes" integer NOT NULL,
	"resp_bytes" integer NOT NULL,
	"status" integer NOT NULL,
	"fingerprint" varchar(64),
	"error_message" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chain_configs" (
	"chain_id" integer PRIMARY KEY NOT NULL,
	"name" varchar(20) NOT NULL,
	"rpc_url" varchar(200) NOT NULL,
	"registry_address" varchar(42) NOT NULL,
	"vault_address" varchar(42) NOT NULL,
	"tokens" jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "goals" (
	"call_id" uuid PRIMARY KEY NOT NULL,
	"goal_type" varchar(50),
	"goal_score" integer,
	"goal_success" boolean,
	"feedback" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"caller_id" uuid NOT NULL,
	"period" varchar(10) NOT NULL,
	"amount" numeric(20, 8) NOT NULL,
	"status" varchar(20) NOT NULL,
	"chain_id" integer NOT NULL,
	"token" varchar(20) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"paid_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mappings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"original_url" varchar(500) NOT NULL,
	"publisher_id" uuid NOT NULL,
	"kind" varchar(20) NOT NULL,
	"gateway_url" varchar(500) NOT NULL,
	"enable_402" boolean DEFAULT true NOT NULL,
	"settlement_token" varchar(20) DEFAULT 'USDC' NOT NULL,
	"chain_id" integer DEFAULT 56 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "meters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"call_id" uuid NOT NULL,
	"policy" varchar(30) NOT NULL,
	"units" integer NOT NULL,
	"unit" varchar(20) DEFAULT 'CREDIT' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "publisher_configs" (
	"publisher_id" uuid PRIMARY KEY NOT NULL,
	"pricing_json" jsonb NOT NULL,
	"splits_json" jsonb NOT NULL,
	"wallet_addr" varchar(42) NOT NULL,
	"chain_pref" varchar(20) NOT NULL,
	"incentives_json" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "receipts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"call_id" uuid NOT NULL,
	"receipt_hash" varchar(66) NOT NULL,
	"signature" text NOT NULL,
	"chain_hint" varchar(20) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "calls" ADD CONSTRAINT "calls_mapping_id_mappings_id_fk" FOREIGN KEY ("mapping_id") REFERENCES "mappings"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "goals" ADD CONSTRAINT "goals_call_id_calls_id_fk" FOREIGN KEY ("call_id") REFERENCES "calls"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "meters" ADD CONSTRAINT "meters_call_id_calls_id_fk" FOREIGN KEY ("call_id") REFERENCES "calls"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "receipts" ADD CONSTRAINT "receipts_call_id_calls_id_fk" FOREIGN KEY ("call_id") REFERENCES "calls"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
