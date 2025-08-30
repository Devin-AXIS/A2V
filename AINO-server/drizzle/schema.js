import { pgTable, index, foreignKey, uuid, text, integer, timestamp, jsonb, boolean, varchar, pgEnum } from "drizzle-orm/pg-core";
export const fieldType = pgEnum("field_type", ['text', 'number', 'date', 'datetime', 'boolean', 'email', 'url', 'phone', 'select', 'multiselect', 'textarea', 'rich_text', 'file', 'image', 'relation', 'formula', 'json']);
export const moduleStatus = pgEnum("module_status", ['active', 'inactive', 'error']);
export const moduleType = pgEnum("module_type", ['system', 'custom', 'remote']);
export const relationType = pgEnum("relation_type", ['one_to_one', 'one_to_many', 'many_to_many']);
export const directoryDefs = pgTable("directory_defs", {
    id: uuid().defaultRandom().notNull(),
    slug: text().notNull(),
    title: text().notNull(),
    version: integer().default(1).notNull(),
    status: text().default('active').notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
    applicationId: uuid("application_id"),
    directoryId: uuid("directory_id"),
}, (table) => [
    index("idx_directory_defs_application").using("btree", table.applicationId.asc().nullsLast().op("uuid_ops")),
    index("idx_directory_defs_directory").using("btree", table.directoryId.asc().nullsLast().op("uuid_ops")),
    foreignKey({
        columns: [table.applicationId],
        foreignColumns: [applications.id],
        name: "directory_defs_application_id_fkey"
    }).onDelete("cascade"),
    foreignKey({
        columns: [table.directoryId],
        foreignColumns: [directories.id],
        name: "directory_defs_directory_id_fkey"
    }).onDelete("cascade"),
]);
export const dirUsers = pgTable("dir_users", {
    id: uuid().defaultRandom().notNull(),
    tenantId: uuid("tenant_id").notNull(),
    version: integer().default(1).notNull(),
    props: jsonb().default({}).notNull(),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
    index("idx_dir_users_props_gin").using("gin", table.props.asc().nullsLast().op("jsonb_path_ops")),
    index("idx_dir_users_tenant").using("btree", table.tenantId.asc().nullsLast().op("uuid_ops")),
]);
export const fieldIndexes = pgTable("field_indexes", {
    id: uuid().defaultRandom().notNull(),
    dirSlug: text("dir_slug").notNull(),
    recordId: uuid("record_id").notNull(),
    fieldKey: text("field_key").notNull(),
    searchValue: text("search_value"),
    numericValue: integer("numeric_value"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
    index("idx_field_indexes_record").using("btree", table.recordId.asc().nullsLast().op("uuid_ops")),
]);
export const fieldDefs = pgTable("field_defs", {
    id: uuid().defaultRandom().notNull(),
    directoryId: uuid("directory_id").notNull(),
    key: text().notNull(),
    kind: text().notNull(),
    type: text().notNull(),
    schema: jsonb(),
    relation: jsonb(),
    lookup: jsonb(),
    computed: jsonb(),
    validators: jsonb(),
    readRoles: jsonb("read_roles").default(["admin", "member"]),
    writeRoles: jsonb("write_roles").default(["admin"]),
    required: boolean().default(false),
}, (table) => [
    index("idx_field_defs_directory").using("btree", table.directoryId.asc().nullsLast().op("uuid_ops")),
    foreignKey({
        columns: [table.directoryId],
        foreignColumns: [directoryDefs.id],
        name: "field_defs_directory_id_fkey"
    }).onDelete("cascade"),
]);
export const relations = pgTable("relations", {
    id: uuid().defaultRandom().notNull(),
    tenantId: uuid("tenant_id").notNull(),
    fromUrn: varchar("from_urn", { length: 500 }).notNull(),
    toUrn: varchar("to_urn", { length: 500 }).notNull(),
    type: relationType().notNull(),
    metadata: jsonb().default({}),
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
    createdBy: uuid("created_by"),
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
});
export const applicationUsers = pgTable("application_users", {
    id: uuid().defaultRandom().notNull(),
    applicationId: uuid("application_id").notNull(),
    name: text().notNull(),
    email: text().notNull(),
    phone: text(),
    avatar: text(),
    status: text().default('active').notNull(),
    role: text().default('user').notNull(),
    department: text(),
    position: text(),
    tags: text().array().default([""]),
    metadata: jsonb().default({}),
    lastLoginAt: timestamp("last_login_at", { mode: 'string' }),
    createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
    foreignKey({
        columns: [table.applicationId],
        foreignColumns: [applications.id],
        name: "application_users_application_id_applications_id_fk"
    }).onDelete("cascade"),
]);
export const directories = pgTable("directories", {
    id: uuid().defaultRandom().notNull(),
    applicationId: uuid("application_id").notNull(),
    moduleId: uuid("module_id").notNull(),
    name: text().notNull(),
    type: text().notNull(),
    supportsCategory: boolean("supports_category").default(false),
    config: jsonb().default({}),
    order: integer().default(0),
    isEnabled: boolean("is_enabled").default(true),
    createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
    foreignKey({
        columns: [table.applicationId],
        foreignColumns: [applications.id],
        name: "directories_application_id_applications_id_fk"
    }).onDelete("cascade"),
    foreignKey({
        columns: [table.moduleId],
        foreignColumns: [modules.id],
        name: "directories_module_id_modules_id_fk"
    }).onDelete("cascade"),
]);
export const modules = pgTable("modules", {
    id: uuid().defaultRandom().notNull(),
    applicationId: uuid("application_id").notNull(),
    name: text().notNull(),
    type: text().notNull(),
    icon: text(),
    config: jsonb().default({}),
    order: integer().default(0),
    isEnabled: boolean("is_enabled").default(true),
    createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
    foreignKey({
        columns: [table.applicationId],
        foreignColumns: [applications.id],
        name: "modules_application_id_applications_id_fk"
    }).onDelete("cascade"),
]);
export const users = pgTable("users", {
    id: uuid().defaultRandom().notNull(),
    name: text().notNull(),
    email: text().notNull(),
    password: text().notNull(),
    roles: text().array().default(["user"]).notNull(),
    avatar: text(),
    status: text().default('active').notNull(),
    lastLoginAt: timestamp("last_login_at", { mode: 'string' }),
    createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});
export const applications = pgTable("applications", {
    id: uuid().defaultRandom().notNull(),
    name: text().notNull(),
    description: text(),
    slug: text().notNull(),
    ownerId: uuid("owner_id").notNull(),
    status: text().default('active').notNull(),
    template: text().default('blank'),
    config: jsonb().default({}),
    databaseConfig: jsonb("database_config").default({}),
    isPublic: boolean("is_public").default(false),
    version: text().default('1.0.0'),
    createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});
export const auditLogs = pgTable("audit_logs", {
    id: uuid().defaultRandom().notNull(),
    applicationId: uuid("application_id"),
    userId: uuid("user_id"),
    action: text().notNull(),
    resource: text().notNull(),
    resourceId: text("resource_id"),
    details: jsonb().default({}),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
    foreignKey({
        columns: [table.applicationId],
        foreignColumns: [applications.id],
        name: "audit_logs_application_id_applications_id_fk"
    }).onDelete("cascade"),
    foreignKey({
        columns: [table.userId],
        foreignColumns: [users.id],
        name: "audit_logs_user_id_users_id_fk"
    }),
]);
export const applicationMembers = pgTable("application_members", {
    id: uuid().defaultRandom().notNull(),
    applicationId: uuid("application_id").notNull(),
    userId: uuid("user_id").notNull(),
    role: text().default('member').notNull(),
    permissions: jsonb().default({}),
    joinedAt: timestamp("joined_at", { mode: 'string' }).defaultNow().notNull(),
    invitedBy: uuid("invited_by"),
    status: text().default('active').notNull(),
}, (table) => [
    foreignKey({
        columns: [table.applicationId],
        foreignColumns: [applications.id],
        name: "application_members_application_id_applications_id_fk"
    }).onDelete("cascade"),
    foreignKey({
        columns: [table.userId],
        foreignColumns: [users.id],
        name: "application_members_user_id_users_id_fk"
    }).onDelete("cascade"),
    foreignKey({
        columns: [table.invitedBy],
        foreignColumns: [users.id],
        name: "application_members_invited_by_users_id_fk"
    }),
]);
export const fieldCategories = pgTable("field_categories", {
    id: uuid().defaultRandom().notNull(),
    applicationId: uuid("application_id").notNull(),
    directoryId: uuid("directory_id").notNull(),
    name: text().notNull(),
    description: text(),
    order: integer().default(0),
    enabled: boolean().default(true),
    system: boolean().default(false),
    predefinedFields: jsonb("predefined_fields").default([]),
    createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});
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
});
//# sourceMappingURL=schema.js.map