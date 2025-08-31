import { pgTable, text, timestamp, uuid, boolean, integer, jsonb, index, unique } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

// 应用表 - 支持多租户和独立数据库配置
export const applications = pgTable("applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  slug: text("slug").unique().notNull(), // 应用标识符，用于URL和数据库连接
  ownerId: uuid("owner_id").notNull(), // 应用所有者
  status: text("status").default("active").notNull(), // active, inactive, archived
  template: text("template").default("blank"), // blank, ecom, edu, content, project
  config: jsonb("config").default({}), // 应用配置，包括主题、设置等
  databaseConfig: jsonb("database_config").default({}), // 独立数据库配置
  isPublic: boolean("is_public").default(false), // 是否公开
  version: text("version").default("1.0.0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  createdAtIdx: index("applications_created_at_idx").on(table.createdAt),
  ownerStatusIdx: index("applications_owner_status_idx").on(table.ownerId, table.status),
}))

// 系统用户表 - 登录AINO平台的用户
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").unique().notNull(),
  password: text("password").notNull(),
  roles: text("roles").array().default(["user"]).notNull(),
  avatar: text("avatar"),
  status: text("status").default("active").notNull(),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  createdAtIdx: index("users_created_at_idx").on(table.createdAt),
  statusIdx: index("users_status_idx").on(table.status),
}))

// 模块表
export const modules = pgTable("modules", {
  id: uuid("id").primaryKey().defaultRandom(),
  applicationId: uuid("application_id").notNull().references(() => applications.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type").notNull(), // system, ecom, edu, content, project, custom
  icon: text("icon"),
  config: jsonb("config").default({}),
  order: integer("order").default(0),
  isEnabled: boolean("is_enabled").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  createdAtIdx: index("modules_created_at_idx").on(table.createdAt),
  appEnabledIdx: index("modules_app_enabled_idx").on(table.applicationId, table.isEnabled),
}))

// 模块安装记录表 - 支持模块生命周期管理
export const moduleInstalls = pgTable("module_installs", {
  id: uuid("id").primaryKey().defaultRandom(),
  applicationId: uuid("application_id").notNull().references(() => applications.id, { onDelete: "cascade" }),
  moduleKey: text("module_key").notNull(),
  moduleName: text("module_name").notNull(),
  moduleVersion: text("module_version").notNull(),
  moduleType: text("module_type").notNull(), // system, local, remote
  installType: text("install_type").notNull(), // system, market, custom
  installConfig: jsonb("install_config").default({}),
  installStatus: text("install_status").default("active"), // active, disabled, uninstalling, error
  installError: text("install_error"),
  installedAt: timestamp("installed_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: uuid("created_by").references(() => users.id),
}, (table) => ({
  appModuleIdx: index("module_installs_app_module_idx").on(table.applicationId, table.moduleKey),
  statusIdx: index("module_installs_status_idx").on(table.installStatus),
  typeIdx: index("module_installs_type_idx").on(table.moduleType),
  createdAtIdx: index("module_installs_created_at_idx").on(table.installedAt),
  uniqueAppModule: unique("unique_app_module").on(table.applicationId, table.moduleKey),
}))

// 目录表
export const directories = pgTable("directories", {
  id: uuid("id").primaryKey().defaultRandom(),
  applicationId: uuid("application_id").notNull().references(() => applications.id, { onDelete: "cascade" }),
  moduleId: uuid("module_id").notNull(), // 移除外键约束，支持引用 modules 和 moduleInstalls 表
  name: text("name").notNull(),
  type: text("type").notNull(), // table, category, form
  supportsCategory: boolean("supports_category").default(false),
  config: jsonb("config").default({}),
  order: integer("order").default(0),
  isEnabled: boolean("is_enabled").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  createdAtIdx: index("directories_created_at_idx").on(table.createdAt),
  appModuleIdx: index("directories_app_module_idx").on(table.applicationId, table.moduleId),
}))

// 字段分类表
export const fieldCategories = pgTable("field_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  applicationId: uuid("application_id").notNull().references(() => applications.id, { onDelete: "cascade" }),
  directoryId: uuid("directory_id").notNull().references(() => directories.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  order: integer("order").default(0),
  enabled: boolean("enabled").default(true),
  system: boolean("system").default(false), // 是否为系统分类
  predefinedFields: jsonb("predefined_fields").default([]), // 预定义字段配置
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  createdAtIdx: index("field_categories_created_at_idx").on(table.createdAt),
  appDirIdx: index("field_categories_app_dir_idx").on(table.applicationId, table.directoryId),
}))

// 记录分类表 - 每个目录独立的分类系统
export const recordCategories: any = pgTable("record_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  applicationId: uuid("application_id").notNull().references(() => applications.id, { onDelete: "cascade" }),
  directoryId: uuid("directory_id").notNull().references(() => directories.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  path: text("path").notNull(), // 分类路径，如 "电子产品/手机/智能手机"
  level: integer("level").notNull(), // 分类级别 1, 2, 3
  parentId: uuid("parent_id").references((): any => recordCategories.id, { onDelete: "cascade" }), // 父分类ID
  order: integer("order").default(0),
  enabled: boolean("enabled").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table: any) => ({
  createdAtIdx: index("record_categories_created_at_idx").on(table.createdAt),
  appDirIdx: index("record_categories_app_dir_idx").on(table.applicationId, table.directoryId),
  parentIdx: index("record_categories_parent_idx").on(table.parentId),
}))



// 应用用户账号表 - 只存储账号认证相关字段，业务数据存储在用户模块中
export const applicationUsers = pgTable("application_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  applicationId: uuid("application_id").notNull().references(() => applications.id, { onDelete: "cascade" }),
  phone: text("phone").notNull(), // 手机号作为唯一标识
  password: text("password"), // 用户密码（加密存储）
  status: text("status").default("active").notNull(), // active, inactive, pending
  role: text("role").default("user").notNull(), // admin, user, guest
  metadata: jsonb("metadata").default({}), // 扩展字段（如注册来源、设备信息等）
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  createdAtIdx: index("application_users_created_at_idx").on(table.createdAt),
  appStatusIdx: index("application_users_app_status_idx").on(table.applicationId, table.status),
  appPhoneIdx: index("application_users_app_phone_idx").on(table.applicationId, table.phone),
  phoneIdx: index("application_users_phone_idx").on(table.phone),
}))

// 审计日志表
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  applicationId: uuid("application_id").references(() => applications.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id),
  action: text("action").notNull(),
  resource: text("resource").notNull(),
  resourceId: text("resource_id"),
  details: jsonb("details").default({}),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  createdAtIdx: index("audit_logs_created_at_idx").on(table.createdAt),
  appUserIdx: index("audit_logs_app_user_idx").on(table.applicationId, table.userId),
}))

// 关系定义（暂时注释掉，避免迁移问题）
// 等基础功能稳定后再添加关系定义

// 新字段系统表定义
export const directoryDefs = pgTable('directory_defs', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  version: integer('version').notNull().default(1),
  status: text('status').notNull().default('active'),
  applicationId: uuid('application_id').references(() => applications.id, { onDelete: 'cascade' }),
  directoryId: uuid('directory_id').references(() => directories.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  createdAtIdx: index("directory_defs_created_at_idx").on(table.createdAt),
  appStatusIdx: index("directory_defs_app_status_idx").on(table.applicationId, table.status),
}))

export const fieldDefs = pgTable('field_defs', {
  id: uuid('id').primaryKey().defaultRandom(),
  directoryId: uuid('directory_id').notNull().references(() => directoryDefs.id, { onDelete: 'cascade' }),
  key: text('key').notNull(),
  kind: text('kind').notNull(), // 'primitive' | 'composite' | 'relation' | 'lookup' | 'computed'
  type: text('type').notNull(),
  schema: jsonb('schema'),
  relation: jsonb('relation'),
  lookup: jsonb('lookup'),
  computed: jsonb('computed'),
  validators: jsonb('validators'),
  readRoles: jsonb('read_roles').$type<string[]>().default(['admin', 'member']),
  writeRoles: jsonb('write_roles').$type<string[]>().default(['admin']),
  required: boolean('required').default(false),
  categoryId: uuid('category_id').references(() => fieldCategories.id, { onDelete: 'set null' }),
}, (table) => ({
  directoryIdx: index("field_defs_directory_idx").on(table.directoryId),
  keyIdx: index("field_defs_key_idx").on(table.key),
}))

export const dirUsers = pgTable('dir_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  version: integer('version').notNull().default(1),
  props: jsonb('props').notNull().$type<Record<string, any>>().default({}),
  createdBy: uuid('created_by'),
  updatedBy: uuid('updated_by'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (table) => ({
  createdAtIdx: index("dir_users_created_at_idx").on(table.createdAt),
  tenantIdx: index("dir_users_tenant_idx").on(table.tenantId),
}))



export const fieldIndexes = pgTable('field_indexes', {
  id: uuid('id').primaryKey().defaultRandom(),
  dirSlug: text('dir_slug').notNull(),
  recordId: uuid('record_id').notNull(),
  fieldKey: text('field_key').notNull(),
  searchValue: text('search_value'),
  numericValue: integer('numeric_value'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  createdAtIdx: index("field_indexes_created_at_idx").on(table.createdAt),
  dirSlugIdx: index("field_indexes_dir_slug_idx").on(table.dirSlug),
  recordFieldIdx: index("field_indexes_record_field_idx").on(table.recordId, table.fieldKey),
}))

// 关联关系表
export const relationRecords = pgTable('relation_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  applicationId: uuid('application_id').notNull().references(() => applications.id, { onDelete: 'cascade' }),
  fromDirectoryId: uuid('from_directory_id').notNull().references(() => directoryDefs.id, { onDelete: 'cascade' }),
  fromRecordId: uuid('from_record_id').notNull(),
  fromFieldKey: text('from_field_key').notNull(),
  toDirectoryId: uuid('to_directory_id').notNull().references(() => directoryDefs.id, { onDelete: 'cascade' }),
  toRecordId: uuid('to_record_id').notNull(),
  toFieldKey: text('to_field_key'),
  relationType: text('relation_type').notNull(), // 'one_to_one', 'one_to_many', 'many_to_many'
  bidirectional: boolean('bidirectional').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  createdBy: uuid('created_by'),
}, (table) => ({
  // 基础索引
  createdAtIdx: index("relation_records_created_at_idx").on(table.createdAt),
  fromIdx: index("relation_records_from_idx").on(table.fromDirectoryId, table.fromRecordId, table.fromFieldKey),
  toIdx: index("relation_records_to_idx").on(table.toDirectoryId, table.toRecordId, table.toFieldKey),
  appIdx: index("relation_records_app_idx").on(table.applicationId),
  uniqueRelation: unique("relation_records_unique").on(table.fromDirectoryId, table.fromRecordId, table.fromFieldKey, table.toDirectoryId, table.toRecordId),
  
  // 性能优化索引
  outIdx: index("idx_rel_out").on(table.applicationId, table.fromDirectoryId, table.fromRecordId, table.relationType, table.toDirectoryId),
  inIdx: index("idx_rel_in").on(table.applicationId, table.toDirectoryId, table.toRecordId, table.relationType, table.fromDirectoryId),
  fromFieldIdx: index("idx_rel_from_field").on(table.applicationId, table.fromDirectoryId, table.fromFieldKey, table.fromRecordId),
  toFieldIdx: index("idx_rel_to_field").on(table.applicationId, table.toDirectoryId, table.toFieldKey, table.toRecordId),
  idempotentIdx: index("idx_rel_idempotent").on(table.applicationId, table.fromDirectoryId, table.fromRecordId, table.toDirectoryId, table.toRecordId, table.relationType),
}))
