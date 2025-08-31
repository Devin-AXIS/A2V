import { pgTable, index, uuid, varchar, jsonb, text, timestamp, foreignKey, boolean, integer, unique, serial } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const auditLogs = pgTable("audit_logs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: varchar("user_id", { length: 36 }).notNull(),
	action: varchar({ length: 64 }).notNull(),
	resource: varchar({ length: 64 }).notNull(),
	resourceId: varchar("resource_id", { length: 36 }),
	details: jsonb(),
	ip: varchar({ length: 45 }),
	userAgent: text("user_agent"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_audit_logs_action").using("btree", table.action.asc().nullsLast().op("text_ops")),
	index("idx_audit_logs_created").using("btree", table.createdAt.asc().nullsLast().op("timestamptz_ops")),
	index("idx_audit_logs_user").using("btree", table.userId.asc().nullsLast().op("text_ops")),
]);

export const directories = pgTable("directories", {
	id: uuid().defaultRandom().primaryKey().notNull(),
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

export const directoryDefs = pgTable("directory_defs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
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
	unique("directory_defs_slug_key").on(table.slug),
	unique("unique_directory_mapping").on(table.applicationId, table.directoryId),
]);

export const applicationMembers = pgTable("application_members", {
	id: uuid().defaultRandom().primaryKey().notNull(),
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

export const applicationUsers = pgTable("application_users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
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

export const fieldIndexes = pgTable("field_indexes", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	dirSlug: text("dir_slug").notNull(),
	recordId: uuid("record_id").notNull(),
	fieldKey: text("field_key").notNull(),
	searchValue: text("search_value"),
	numericValue: integer("numeric_value"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_field_indexes_dir_slug").using("btree", table.dirSlug.asc().nullsLast().op("text_ops")),
	index("idx_field_indexes_field_key").using("btree", table.fieldKey.asc().nullsLast().op("text_ops")),
	index("idx_field_indexes_numeric_value").using("btree", table.numericValue.asc().nullsLast().op("int4_ops")),
	index("idx_field_indexes_query").using("btree", table.dirSlug.asc().nullsLast().op("text_ops"), table.fieldKey.asc().nullsLast().op("text_ops"), table.searchValue.asc().nullsLast().op("text_ops")),
	index("idx_field_indexes_record_id").using("btree", table.recordId.asc().nullsLast().op("uuid_ops")),
	index("idx_field_indexes_search_value").using("btree", table.searchValue.asc().nullsLast().op("text_ops")),
	index("idx_field_indexes_sort").using("btree", table.dirSlug.asc().nullsLast().op("text_ops"), table.fieldKey.asc().nullsLast().op("int4_ops"), table.numericValue.asc().nullsLast().op("text_ops")),
]);

export const fieldCategories = pgTable("field_categories", {
	id: uuid().defaultRandom().primaryKey().notNull(),
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
}, (table) => [
	index("idx_field_categories_directory_id").using("btree", table.directoryId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.applicationId],
			foreignColumns: [applications.id],
			name: "field_categories_application_id_applications_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.directoryId],
			foreignColumns: [directories.id],
			name: "field_categories_directory_id_directories_id_fk"
		}).onDelete("cascade"),
]);

export const applications = pgTable("applications", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	slug: varchar({ length: 255 }).notNull(),
	ownerId: uuid("owner_id").notNull(),
	status: varchar({ length: 50 }).default('active').notNull(),
	template: varchar({ length: 100 }).default('blank'),
	config: jsonb().default({}),
	databaseConfig: jsonb("database_config").default({}),
	isPublic: boolean("is_public").default(false),
	version: varchar({ length: 50 }).default('1.0.0'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("applications_slug_key").on(table.slug),
]);

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	password: varchar({ length: 255 }).notNull(),
	roles: text().array().default(["user"]).notNull(),
	avatar: text(),
	status: varchar({ length: 50 }).default('active').notNull(),
	lastLoginAt: timestamp("last_login_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("users_email_key").on(table.email),
]);

export const modules = pgTable("modules", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	applicationId: uuid("application_id").notNull(),
	name: text().notNull(),
	type: text().notNull(),
	icon: text(),
	config: jsonb().default({}),
	order: integer().default(0),
	isEnabled: boolean("is_enabled").default(true),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_modules_application_id").using("btree", table.applicationId.asc().nullsLast().op("uuid_ops")),
	index("idx_modules_type").using("btree", table.type.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.applicationId],
			foreignColumns: [applications.id],
			name: "modules_application_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.applicationId],
			foreignColumns: [applications.id],
			name: "modules_application_id_applications_id_fk"
		}).onDelete("cascade"),
]);

export const dirUsers = pgTable("dir_users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
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

export const fieldDefs = pgTable("field_defs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	directoryId: uuid("directory_id").notNull(),
	key: text().notNull(),
	kind: text().notNull(),
	type: text().notNull(),
	schema: jsonb(),
	relation: jsonb(),
	lookup: jsonb(),
	computed: jsonb(),
	validators: jsonb(),
	readRoles: jsonb("read_roles").default(["admin","member"]),
	writeRoles: jsonb("write_roles").default(["admin"]),
	required: boolean().default(false),
	categoryId: uuid("category_id"),
	isDefault: boolean("is_default").default(false),
}, (table) => [
	index("idx_field_defs_category").using("btree", table.categoryId.asc().nullsLast().op("uuid_ops")),
	index("idx_field_defs_directory").using("btree", table.directoryId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.directoryId],
			foreignColumns: [directoryDefs.id],
			name: "field_defs_directory_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [fieldCategories.id],
			name: "field_defs_category_id_fkey"
		}).onDelete("set null"),
]);

export const testTable = pgTable("test_table", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 100 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const recordCategories = pgTable("record_categories", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	applicationId: uuid("application_id").notNull(),
	directoryId: uuid("directory_id").notNull(),
	name: text().notNull(),
	path: text().notNull(),
	level: integer().notNull(),
	parentId: uuid("parent_id"),
	order: integer().default(0),
	enabled: boolean().default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_record_categories_directory_id").using("btree", table.directoryId.asc().nullsLast().op("uuid_ops")),
	index("idx_record_categories_level").using("btree", table.level.asc().nullsLast().op("int4_ops")),
	index("idx_record_categories_parent_id").using("btree", table.parentId.asc().nullsLast().op("uuid_ops")),
]);
