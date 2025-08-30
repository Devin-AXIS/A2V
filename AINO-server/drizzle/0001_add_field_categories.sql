-- 创建字段分类表
CREATE TABLE "field_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" uuid NOT NULL,
	"directory_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"order" integer DEFAULT 0,
	"enabled" boolean DEFAULT true,
	"system" boolean DEFAULT false,
	"predefined_fields" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- 添加字段分类外键约束
ALTER TABLE "field_categories" ADD CONSTRAINT "field_categories_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE cascade;
ALTER TABLE "field_categories" ADD CONSTRAINT "field_categories_directory_id_directories_id_fk" FOREIGN KEY ("directory_id") REFERENCES "directories"("id") ON DELETE cascade;

-- 扩展字段表，添加新字段
ALTER TABLE "fields" ADD COLUMN "category_id" uuid REFERENCES "field_categories"("id") ON DELETE set null;
ALTER TABLE "fields" ADD COLUMN "unique" boolean DEFAULT false;
ALTER TABLE "fields" ADD COLUMN "desc" text;
ALTER TABLE "fields" ADD COLUMN "placeholder" text;
ALTER TABLE "fields" ADD COLUMN "min" integer;
ALTER TABLE "fields" ADD COLUMN "max" integer;
ALTER TABLE "fields" ADD COLUMN "step" integer;
ALTER TABLE "fields" ADD COLUMN "unit" text;
ALTER TABLE "fields" ADD COLUMN "options" text[];
ALTER TABLE "fields" ADD COLUMN "default" jsonb;
ALTER TABLE "fields" ADD COLUMN "true_label" text;
ALTER TABLE "fields" ADD COLUMN "false_label" text;
ALTER TABLE "fields" ADD COLUMN "accept" text;
ALTER TABLE "fields" ADD COLUMN "max_size_mb" integer;
ALTER TABLE "fields" ADD COLUMN "relation" jsonb;
ALTER TABLE "fields" ADD COLUMN "cascader_options" jsonb;
ALTER TABLE "fields" ADD COLUMN "date_mode" text;
ALTER TABLE "fields" ADD COLUMN "preset" text;
ALTER TABLE "fields" ADD COLUMN "skills_config" jsonb;
ALTER TABLE "fields" ADD COLUMN "progress_config" jsonb;
ALTER TABLE "fields" ADD COLUMN "custom_experience_config" jsonb;
ALTER TABLE "fields" ADD COLUMN "identity_verification_config" jsonb;
ALTER TABLE "fields" ADD COLUMN "certificate_config" jsonb;
ALTER TABLE "fields" ADD COLUMN "other_verification_config" jsonb;
ALTER TABLE "fields" ADD COLUMN "image_config" jsonb;
ALTER TABLE "fields" ADD COLUMN "video_config" jsonb;
ALTER TABLE "fields" ADD COLUMN "boolean_config" jsonb;
ALTER TABLE "fields" ADD COLUMN "multiselect_config" jsonb;

