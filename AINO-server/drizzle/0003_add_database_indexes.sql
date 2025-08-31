-- 添加数据库索引以提升查询性能
-- 这些索引遵循"索引最少集"原则，只添加必要的索引

-- applications 表索引
CREATE INDEX IF NOT EXISTS "applications_created_at_idx" ON "applications" ("created_at");
CREATE INDEX IF NOT EXISTS "applications_owner_status_idx" ON "applications" ("owner_id", "status");

-- users 表索引
CREATE INDEX IF NOT EXISTS "users_created_at_idx" ON "users" ("created_at");
CREATE INDEX IF NOT EXISTS "users_status_idx" ON "users" ("status");

-- modules 表索引
CREATE INDEX IF NOT EXISTS "modules_created_at_idx" ON "modules" ("created_at");
CREATE INDEX IF NOT EXISTS "modules_app_enabled_idx" ON "modules" ("application_id", "is_enabled");

-- directories 表索引
CREATE INDEX IF NOT EXISTS "directories_created_at_idx" ON "directories" ("created_at");
CREATE INDEX IF NOT EXISTS "directories_app_module_idx" ON "directories" ("application_id", "module_id");

-- field_categories 表索引
CREATE INDEX IF NOT EXISTS "field_categories_created_at_idx" ON "field_categories" ("created_at");
CREATE INDEX IF NOT EXISTS "field_categories_app_dir_idx" ON "field_categories" ("application_id", "directory_id");

-- record_categories 表索引
CREATE INDEX IF NOT EXISTS "record_categories_created_at_idx" ON "record_categories" ("created_at");
CREATE INDEX IF NOT EXISTS "record_categories_app_dir_idx" ON "record_categories" ("application_id", "directory_id");
CREATE INDEX IF NOT EXISTS "record_categories_parent_idx" ON "record_categories" ("parent_id");

-- application_users 表索引
CREATE INDEX IF NOT EXISTS "application_users_created_at_idx" ON "application_users" ("created_at");
CREATE INDEX IF NOT EXISTS "application_users_app_status_idx" ON "application_users" ("application_id", "status");

-- audit_logs 表索引
CREATE INDEX IF NOT EXISTS "audit_logs_created_at_idx" ON "audit_logs" ("created_at");
CREATE INDEX IF NOT EXISTS "audit_logs_app_user_idx" ON "audit_logs" ("application_id", "user_id");

-- directory_defs 表索引
CREATE INDEX IF NOT EXISTS "directory_defs_created_at_idx" ON "directory_defs" ("created_at");
CREATE INDEX IF NOT EXISTS "directory_defs_app_status_idx" ON "directory_defs" ("application_id", "status");

-- field_defs 表索引
CREATE INDEX IF NOT EXISTS "field_defs_directory_idx" ON "field_defs" ("directory_id");
CREATE INDEX IF NOT EXISTS "field_defs_key_idx" ON "field_defs" ("key");

-- dir_users 表索引
CREATE INDEX IF NOT EXISTS "dir_users_created_at_idx" ON "dir_users" ("created_at");
CREATE INDEX IF NOT EXISTS "dir_users_tenant_idx" ON "dir_users" ("tenant_id");

-- dir_jobs 表索引已移除

-- field_indexes 表索引
CREATE INDEX IF NOT EXISTS "field_indexes_created_at_idx" ON "field_indexes" ("created_at");
CREATE INDEX IF NOT EXISTS "field_indexes_dir_slug_idx" ON "field_indexes" ("dir_slug");
CREATE INDEX IF NOT EXISTS "field_indexes_record_field_idx" ON "field_indexes" ("record_id", "field_key");
