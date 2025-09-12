-- ===========================================
-- AINO 数据库初始化脚本
-- 生成时间: 2025-01-12
-- 数据库版本: PostgreSQL
-- ===========================================

-- 启用UUID扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 创建表: application_members
CREATE TABLE application_members (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member'::text,
  permissions JSONB NULL DEFAULT '{}'::jsonb,
  joined_at TIMESTAMP NOT NULL DEFAULT now(),
  invited_by UUID NULL,
  status TEXT NOT NULL DEFAULT 'active'::text
);

-- 创建表: application_users
CREATE TABLE application_users (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL,
  phone TEXT NOT NULL,
  password TEXT NULL,
  status TEXT NOT NULL DEFAULT 'active'::text,
  role TEXT NOT NULL DEFAULT 'user'::text,
  metadata JSONB NULL DEFAULT '{}'::jsonb,
  last_login_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  phone_number TEXT NULL
);

-- 创建表: applications
CREATE TABLE applications (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NULL,
  slug TEXT NOT NULL,
  owner_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'active'::text,
  template TEXT NULL DEFAULT 'blank'::text,
  config JSONB NULL DEFAULT '{}'::jsonb,
  database_config JSONB NULL DEFAULT '{}'::jsonb,
  is_public BOOLEAN NULL DEFAULT false,
  version TEXT NULL DEFAULT '1.0.0'::text,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- 创建表: audit_logs
CREATE TABLE audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  application_id UUID NULL,
  user_id UUID NULL,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id TEXT NULL,
  details JSONB NULL DEFAULT '{}'::jsonb,
  ip_address TEXT NULL,
  user_agent TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- 创建表: dir_jobs
CREATE TABLE dir_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  props JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID NULL,
  updated_by UUID NULL,
  created_at TIMESTAMPTZ NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ NULL
);

-- 创建表: dir_users
CREATE TABLE dir_users (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  props JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID NULL,
  updated_by UUID NULL,
  created_at TIMESTAMPTZ NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ NULL
);

-- 创建表: directories
CREATE TABLE directories (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL,
  module_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  supports_category BOOLEAN NULL DEFAULT false,
  config JSONB NULL DEFAULT '{}'::jsonb,
  "order" INTEGER NULL DEFAULT 0,
  is_enabled BOOLEAN NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- 创建表: directory_defs
CREATE TABLE directory_defs (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active'::text,
  application_id UUID NULL,
  directory_id UUID NULL,
  created_at TIMESTAMPTZ NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NULL DEFAULT now()
);

-- 创建表: field_categories
CREATE TABLE field_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL,
  directory_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT NULL,
  "order" INTEGER NULL DEFAULT 0,
  enabled BOOLEAN NULL DEFAULT true,
  system BOOLEAN NULL DEFAULT false,
  predefined_fields JSONB NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- 创建表: field_defs
CREATE TABLE field_defs (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  directory_id UUID NOT NULL,
  key TEXT NOT NULL,
  kind TEXT NOT NULL,
  type TEXT NOT NULL,
  schema JSONB NULL,
  relation JSONB NULL,
  lookup JSONB NULL,
  computed JSONB NULL,
  validators JSONB NULL,
  read_roles JSONB NULL DEFAULT '["admin", "member"]'::jsonb,
  write_roles JSONB NULL DEFAULT '["admin"]'::jsonb,
  required BOOLEAN NULL DEFAULT false,
  category_id UUID NULL,
  is_default BOOLEAN NULL DEFAULT false
);

-- 创建表: field_indexes
CREATE TABLE field_indexes (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  dir_slug TEXT NOT NULL,
  record_id UUID NOT NULL,
  field_key TEXT NOT NULL,
  search_value TEXT NULL,
  numeric_value INTEGER NULL,
  created_at TIMESTAMPTZ NULL DEFAULT now()
);

-- 创建表: module_installs
CREATE TABLE module_installs (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL,
  module_key TEXT NOT NULL,
  module_name TEXT NOT NULL,
  module_version TEXT NOT NULL,
  module_type TEXT NOT NULL,
  install_type TEXT NOT NULL,
  install_config JSONB NULL DEFAULT '{}'::jsonb,
  install_status TEXT NULL DEFAULT 'active'::text,
  install_error TEXT NULL,
  installed_at TIMESTAMP NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  created_by UUID NULL
);

-- 创建表: modules
CREATE TABLE modules (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  icon TEXT NULL,
  config JSONB NULL DEFAULT '{}'::jsonb,
  "order" INTEGER NULL DEFAULT 0,
  is_enabled BOOLEAN NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- 创建表: record_categories
CREATE TABLE record_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL,
  directory_id UUID NOT NULL,
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  level INTEGER NOT NULL,
  parent_id UUID NULL,
  "order" INTEGER NULL DEFAULT 0,
  enabled BOOLEAN NULL DEFAULT true,
  created_at TIMESTAMPTZ NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NULL DEFAULT now()
);

-- 创建表: relation_records
CREATE TABLE relation_records (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL,
  from_directory_id UUID NOT NULL,
  from_record_id UUID NOT NULL,
  from_field_key TEXT NOT NULL,
  to_directory_id UUID NOT NULL,
  to_record_id UUID NOT NULL,
  to_field_key TEXT NULL,
  relation_type TEXT NOT NULL,
  bidirectional BOOLEAN NULL DEFAULT false,
  created_at TIMESTAMPTZ NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NULL DEFAULT now(),
  created_by UUID NULL
);

-- 创建表: users
CREATE TABLE users (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  password TEXT NOT NULL,
  roles TEXT[] NOT NULL DEFAULT '{user}'::text[],
  avatar TEXT NULL,
  status TEXT NOT NULL DEFAULT 'active'::text,
  last_login_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- 添加主键约束
ALTER TABLE application_members ADD CONSTRAINT application_members_pkey PRIMARY KEY (id);
ALTER TABLE application_users ADD CONSTRAINT application_users_pkey PRIMARY KEY (id);
ALTER TABLE applications ADD CONSTRAINT applications_pkey PRIMARY KEY (id);
ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);
ALTER TABLE dir_jobs ADD CONSTRAINT dir_jobs_pkey PRIMARY KEY (id);
ALTER TABLE dir_users ADD CONSTRAINT dir_users_pkey PRIMARY KEY (id);
ALTER TABLE directories ADD CONSTRAINT directories_pkey PRIMARY KEY (id);
ALTER TABLE directory_defs ADD CONSTRAINT directory_defs_pkey PRIMARY KEY (id);
ALTER TABLE field_categories ADD CONSTRAINT field_categories_pkey PRIMARY KEY (id);
ALTER TABLE field_defs ADD CONSTRAINT field_defs_pkey PRIMARY KEY (id);
ALTER TABLE field_indexes ADD CONSTRAINT field_indexes_pkey PRIMARY KEY (id);
ALTER TABLE module_installs ADD CONSTRAINT module_installs_pkey PRIMARY KEY (id);
ALTER TABLE modules ADD CONSTRAINT modules_pkey PRIMARY KEY (id);
ALTER TABLE record_categories ADD CONSTRAINT record_categories_pkey PRIMARY KEY (id);
ALTER TABLE relation_records ADD CONSTRAINT relation_records_pkey PRIMARY KEY (id);
ALTER TABLE users ADD CONSTRAINT users_pkey PRIMARY KEY (id);

-- 添加外键约束
ALTER TABLE application_members ADD CONSTRAINT application_members_application_id_fkey FOREIGN KEY (application_id) REFERENCES applications(id);
ALTER TABLE application_members ADD CONSTRAINT application_members_invited_by_fkey FOREIGN KEY (invited_by) REFERENCES users(id);
ALTER TABLE application_members ADD CONSTRAINT application_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE application_users ADD CONSTRAINT application_users_application_id_fkey FOREIGN KEY (application_id) REFERENCES applications(id);
ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_application_id_fkey FOREIGN KEY (application_id) REFERENCES applications(id);
ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE directories ADD CONSTRAINT directories_application_id_fkey FOREIGN KEY (application_id) REFERENCES applications(id);
ALTER TABLE directories ADD CONSTRAINT directories_module_id_fkey FOREIGN KEY (module_id) REFERENCES modules(id);
ALTER TABLE directory_defs ADD CONSTRAINT directory_defs_application_id_fkey FOREIGN KEY (application_id) REFERENCES applications(id);
ALTER TABLE directory_defs ADD CONSTRAINT directory_defs_directory_id_fkey FOREIGN KEY (directory_id) REFERENCES directories(id);
ALTER TABLE field_categories ADD CONSTRAINT field_categories_application_id_fkey FOREIGN KEY (application_id) REFERENCES applications(id);
ALTER TABLE field_categories ADD CONSTRAINT field_categories_directory_id_fkey FOREIGN KEY (directory_id) REFERENCES directories(id);
ALTER TABLE field_defs ADD CONSTRAINT field_defs_directory_id_fkey FOREIGN KEY (directory_id) REFERENCES directory_defs(id);
ALTER TABLE module_installs ADD CONSTRAINT module_installs_application_id_fkey FOREIGN KEY (application_id) REFERENCES applications(id);
ALTER TABLE module_installs ADD CONSTRAINT module_installs_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id);
ALTER TABLE modules ADD CONSTRAINT modules_application_id_fkey FOREIGN KEY (application_id) REFERENCES applications(id);
ALTER TABLE record_categories ADD CONSTRAINT record_categories_application_id_fkey FOREIGN KEY (application_id) REFERENCES applications(id);
ALTER TABLE record_categories ADD CONSTRAINT record_categories_directory_id_fkey FOREIGN KEY (directory_id) REFERENCES directories(id);
ALTER TABLE record_categories ADD CONSTRAINT record_categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES record_categories(id);
ALTER TABLE relation_records ADD CONSTRAINT relation_records_application_id_fkey FOREIGN KEY (application_id) REFERENCES applications(id);
ALTER TABLE relation_records ADD CONSTRAINT relation_records_from_directory_id_fkey FOREIGN KEY (from_directory_id) REFERENCES directory_defs(id);
ALTER TABLE relation_records ADD CONSTRAINT relation_records_to_directory_id_fkey FOREIGN KEY (to_directory_id) REFERENCES directory_defs(id);

-- 添加唯一约束
ALTER TABLE applications ADD CONSTRAINT applications_slug_unique UNIQUE (slug);
ALTER TABLE directory_defs ADD CONSTRAINT directory_defs_slug_unique UNIQUE (slug);
ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);
ALTER TABLE module_installs ADD CONSTRAINT module_installs_application_id_module_key_key UNIQUE (application_id, module_key);
ALTER TABLE relation_records ADD CONSTRAINT relation_records_unique UNIQUE (from_directory_id, from_record_id, from_field_key, to_directory_id, to_record_id);

-- 添加索引
CREATE INDEX application_members_application_id_idx ON application_members (application_id);
CREATE INDEX application_members_status_idx ON application_members (status);
CREATE INDEX application_members_user_id_idx ON application_members (user_id);
CREATE INDEX application_users_app_phone_idx ON application_users (application_id, phone);
CREATE INDEX application_users_app_phone_number_idx ON application_users (application_id, phone_number);
CREATE INDEX application_users_app_status_idx ON application_users (application_id, status);
CREATE INDEX application_users_created_at_idx ON application_users (created_at);
CREATE INDEX application_users_phone_idx ON application_users (phone);
CREATE INDEX application_users_phone_number_idx ON application_users (phone_number);
CREATE INDEX applications_created_at_idx ON applications (created_at);
CREATE INDEX applications_owner_status_idx ON applications (owner_id, status);
CREATE INDEX applications_slug_unique_idx ON applications (slug);
CREATE INDEX audit_logs_app_user_idx ON audit_logs (application_id, user_id);
CREATE INDEX audit_logs_created_at_idx ON audit_logs (created_at);
CREATE INDEX dir_jobs_created_at_idx ON dir_jobs (created_at);
CREATE INDEX dir_jobs_tenant_idx ON dir_jobs (tenant_id);
CREATE INDEX dir_users_created_at_idx ON dir_users (created_at);
CREATE INDEX dir_users_tenant_idx ON dir_users (tenant_id);
CREATE INDEX directories_app_module_idx ON directories (application_id, module_id);
CREATE INDEX directories_created_at_idx ON directories (created_at);
CREATE INDEX directory_defs_app_status_idx ON directory_defs (application_id, status);
CREATE INDEX directory_defs_created_at_idx ON directory_defs (created_at);
CREATE INDEX directory_defs_slug_unique ON directory_defs (slug);
CREATE INDEX field_categories_app_dir_idx ON field_categories (application_id, directory_id);
CREATE INDEX field_categories_created_at_idx ON field_categories (created_at);
CREATE INDEX field_defs_directory_idx ON field_defs (directory_id);
CREATE INDEX field_defs_key_idx ON field_defs (key);
CREATE INDEX field_indexes_created_at_idx ON field_indexes (created_at);
CREATE INDEX field_indexes_dir_slug_idx ON field_indexes (dir_slug);
CREATE INDEX field_indexes_record_field_idx ON field_indexes (record_id, field_key);
CREATE INDEX idx_module_installs_app ON module_installs (application_id);
CREATE INDEX idx_module_installs_created_at ON module_installs (installed_at);
CREATE INDEX idx_module_installs_status ON module_installs (install_status);
CREATE INDEX idx_module_installs_type ON module_installs (module_type);
CREATE INDEX modules_app_enabled_idx ON modules (application_id, is_enabled);
CREATE INDEX modules_created_at_idx ON modules (created_at);
CREATE INDEX record_categories_app_dir_idx ON record_categories (application_id, directory_id);
CREATE INDEX record_categories_created_at_idx ON record_categories (created_at);
CREATE INDEX record_categories_parent_idx ON record_categories (parent_id);
CREATE INDEX idx_rel_from_field ON relation_records (from_field_key);
CREATE INDEX idx_rel_idempotent ON relation_records (from_directory_id, from_record_id, from_field_key, to_directory_id, to_record_id);
CREATE INDEX idx_rel_in ON relation_records (to_directory_id, to_record_id);
CREATE INDEX idx_rel_out ON relation_records (from_directory_id, from_record_id);
CREATE INDEX idx_rel_to_field ON relation_records (to_field_key);
CREATE INDEX relation_records_app_idx ON relation_records (application_id);
CREATE INDEX relation_records_created_at_idx ON relation_records (created_at);
CREATE INDEX relation_records_from_idx ON relation_records (from_directory_id, from_record_id);
CREATE INDEX relation_records_to_idx ON relation_records (to_directory_id, to_record_id);
CREATE INDEX users_created_at_idx ON users (created_at);
CREATE INDEX users_email_unique_idx ON users (email);
CREATE INDEX users_status_idx ON users (status);

-- 数据库初始化完成
