-- 创建关联关系表
CREATE TABLE IF NOT EXISTS "relation_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" uuid NOT NULL,
	"from_directory_id" uuid NOT NULL,
	"from_record_id" uuid NOT NULL,
	"from_field_key" text NOT NULL,
	"to_directory_id" uuid NOT NULL,
	"to_record_id" uuid NOT NULL,
	"to_field_key" text,
	"relation_type" text NOT NULL,
	"bidirectional" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_by" uuid
);

-- 添加外键约束
DO $$ BEGIN
 ALTER TABLE "relation_records" ADD CONSTRAINT "relation_records_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "relation_records" ADD CONSTRAINT "relation_records_from_directory_id_directory_defs_id_fk" FOREIGN KEY ("from_directory_id") REFERENCES "directory_defs"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "relation_records" ADD CONSTRAINT "relation_records_to_directory_id_directory_defs_id_fk" FOREIGN KEY ("to_directory_id") REFERENCES "directory_defs"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- 创建索引
CREATE INDEX IF NOT EXISTS "relation_records_created_at_idx" ON "relation_records" ("created_at");
CREATE INDEX IF NOT EXISTS "relation_records_from_idx" ON "relation_records" ("from_directory_id","from_record_id","from_field_key");
CREATE INDEX IF NOT EXISTS "relation_records_to_idx" ON "relation_records" ("to_directory_id","to_record_id","to_field_key");
CREATE INDEX IF NOT EXISTS "relation_records_app_idx" ON "relation_records" ("application_id");

-- 创建唯一约束
DO $$ BEGIN
 ALTER TABLE "relation_records" ADD CONSTRAINT "relation_records_unique" UNIQUE("from_directory_id","from_record_id","from_field_key","to_directory_id","to_record_id");
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
