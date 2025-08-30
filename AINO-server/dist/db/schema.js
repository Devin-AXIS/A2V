import { pgTable, text, timestamp, uuid, boolean, integer, jsonb, index } from "drizzle-orm/pg-core";
export const applications = pgTable("applications", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    description: text("description"),
    slug: text("slug").unique().notNull(),
    ownerId: uuid("owner_id").notNull(),
    status: text("status").default("active").notNull(),
    template: text("template").default("blank"),
    config: jsonb("config").default({}),
    databaseConfig: jsonb("database_config").default({}),
    isPublic: boolean("is_public").default(false),
    version: text("version").default("1.0.0"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
    createdAtIdx: index("applications_created_at_idx").on(table.createdAt),
    ownerStatusIdx: index("applications_owner_status_idx").on(table.ownerId, table.status),
}));
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
}));
export const modules = pgTable("modules", {
    id: uuid("id").primaryKey().defaultRandom(),
    applicationId: uuid("application_id").notNull().references(() => applications.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    type: text("type").notNull(),
    icon: text("icon"),
    config: jsonb("config").default({}),
    order: integer("order").default(0),
    isEnabled: boolean("is_enabled").default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
    createdAtIdx: index("modules_created_at_idx").on(table.createdAt),
    appEnabledIdx: index("modules_app_enabled_idx").on(table.applicationId, table.isEnabled),
}));
export const directories = pgTable("directories", {
    id: uuid("id").primaryKey().defaultRandom(),
    applicationId: uuid("application_id").notNull().references(() => applications.id, { onDelete: "cascade" }),
    moduleId: uuid("module_id").notNull().references(() => modules.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    type: text("type").notNull(),
    supportsCategory: boolean("supports_category").default(false),
    config: jsonb("config").default({}),
    order: integer("order").default(0),
    isEnabled: boolean("is_enabled").default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
    createdAtIdx: index("directories_created_at_idx").on(table.createdAt),
    appModuleIdx: index("directories_app_module_idx").on(table.applicationId, table.moduleId),
}));
export const fieldCategories = pgTable("field_categories", {
    id: uuid("id").primaryKey().defaultRandom(),
    applicationId: uuid("application_id").notNull().references(() => applications.id, { onDelete: "cascade" }),
    directoryId: uuid("directory_id").notNull().references(() => directories.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    order: integer("order").default(0),
    enabled: boolean("enabled").default(true),
    system: boolean("system").default(false),
    predefinedFields: jsonb("predefined_fields").default([]),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
    createdAtIdx: index("field_categories_created_at_idx").on(table.createdAt),
    appDirIdx: index("field_categories_app_dir_idx").on(table.applicationId, table.directoryId),
}));
export const recordCategories = pgTable("record_categories", {
    id: uuid("id").primaryKey().defaultRandom(),
    applicationId: uuid("application_id").notNull().references(() => applications.id, { onDelete: "cascade" }),
    directoryId: uuid("directory_id").notNull().references(() => directories.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    path: text("path").notNull(),
    level: integer("level").notNull(),
    parentId: uuid("parent_id").references(() => recordCategories.id, { onDelete: "cascade" }),
    order: integer("order").default(0),
    enabled: boolean("enabled").default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
    createdAtIdx: index("record_categories_created_at_idx").on(table.createdAt),
    appDirIdx: index("record_categories_app_dir_idx").on(table.applicationId, table.directoryId),
    parentIdx: index("record_categories_parent_idx").on(table.parentId),
}));
export const applicationUsers = pgTable("application_users", {
    id: uuid("id").primaryKey().defaultRandom(),
    applicationId: uuid("application_id").notNull().references(() => applications.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    avatar: text("avatar"),
    status: text("status").default("active").notNull(),
    role: text("role").default("user").notNull(),
    department: text("department"),
    position: text("position"),
    tags: text("tags").array().default([]),
    metadata: jsonb("metadata").default({}),
    lastLoginAt: timestamp("last_login_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
    createdAtIdx: index("application_users_created_at_idx").on(table.createdAt),
    appStatusIdx: index("application_users_app_status_idx").on(table.applicationId, table.status),
}));
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
}));
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
}));
export const fieldDefs = pgTable('field_defs', {
    id: uuid('id').primaryKey().defaultRandom(),
    directoryId: uuid('directory_id').notNull().references(() => directoryDefs.id, { onDelete: 'cascade' }),
    key: text('key').notNull(),
    kind: text('kind').notNull(),
    type: text('type').notNull(),
    schema: jsonb('schema'),
    relation: jsonb('relation'),
    lookup: jsonb('lookup'),
    computed: jsonb('computed'),
    validators: jsonb('validators'),
    readRoles: jsonb('read_roles').$type().default(['admin', 'member']),
    writeRoles: jsonb('write_roles').$type().default(['admin']),
    required: boolean('required').default(false),
}, (table) => ({
    directoryIdx: index("field_defs_directory_idx").on(table.directoryId),
    keyIdx: index("field_defs_key_idx").on(table.key),
}));
export const dirUsers = pgTable('dir_users', {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull(),
    version: integer('version').notNull().default(1),
    props: jsonb('props').notNull().$type().default({}),
    createdBy: uuid('created_by'),
    updatedBy: uuid('updated_by'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (table) => ({
    createdAtIdx: index("dir_users_created_at_idx").on(table.createdAt),
    tenantIdx: index("dir_users_tenant_idx").on(table.tenantId),
}));
export const dirJobs = pgTable('dir_jobs', {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull(),
    version: integer('version').notNull().default(1),
    props: jsonb('props').notNull().$type().default({}),
    createdBy: uuid('created_by'),
    updatedBy: uuid('updated_by'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (table) => ({
    createdAtIdx: index("dir_jobs_created_at_idx").on(table.createdAt),
    tenantIdx: index("dir_jobs_tenant_idx").on(table.tenantId),
}));
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
}));
//# sourceMappingURL=schema.js.map