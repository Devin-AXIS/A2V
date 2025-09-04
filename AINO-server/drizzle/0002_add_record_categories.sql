-- 创建记录分类表
CREATE TABLE "record_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" uuid NOT NULL,
	"directory_id" uuid NOT NULL,
	"name" text NOT NULL,
	"path" text NOT NULL,
	"level" integer NOT NULL,
	"parent_id" uuid,
	"order" integer DEFAULT 0,
	"enabled" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- 添加外键约束
ALTER TABLE "record_categories" ADD CONSTRAINT "record_categories_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE cascade;
ALTER TABLE "record_categories" ADD CONSTRAINT "record_categories_directory_id_directories_id_fk" FOREIGN KEY ("directory_id") REFERENCES "directories"("id") ON DELETE cascade;
ALTER TABLE "record_categories" ADD CONSTRAINT "record_categories_parent_id_record_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "record_categories"("id") ON DELETE cascade;

-- 创建索引
CREATE INDEX "idx_record_categories_directory_id" ON "record_categories" ("directory_id");
CREATE INDEX "idx_record_categories_parent_id" ON "record_categories" ("parent_id");
CREATE INDEX "idx_record_categories_level" ON "record_categories" ("level");
