import { relations } from "drizzle-orm/relations";
import { applications, directories, modules, directoryDefs, applicationMembers, users, applicationUsers, fieldCategories, fieldDefs } from "./schema";

export const directoriesRelations = relations(directories, ({one, many}) => ({
	application: one(applications, {
		fields: [directories.applicationId],
		references: [applications.id]
	}),
	module: one(modules, {
		fields: [directories.moduleId],
		references: [modules.id]
	}),
	directoryDefs: many(directoryDefs),
	fieldCategories: many(fieldCategories),
}));

export const applicationsRelations = relations(applications, ({many}) => ({
	directories: many(directories),
	directoryDefs: many(directoryDefs),
	applicationMembers: many(applicationMembers),
	applicationUsers: many(applicationUsers),
	fieldCategories: many(fieldCategories),
	modules_applicationId: many(modules, {
		relationName: "modules_applicationId_applications_id"
	}),
	modules_applicationId: many(modules, {
		relationName: "modules_applicationId_applications_id"
	}),
}));

export const modulesRelations = relations(modules, ({one, many}) => ({
	directories: many(directories),
	application_applicationId: one(applications, {
		fields: [modules.applicationId],
		references: [applications.id],
		relationName: "modules_applicationId_applications_id"
	}),
	application_applicationId: one(applications, {
		fields: [modules.applicationId],
		references: [applications.id],
		relationName: "modules_applicationId_applications_id"
	}),
}));

export const directoryDefsRelations = relations(directoryDefs, ({one, many}) => ({
	application: one(applications, {
		fields: [directoryDefs.applicationId],
		references: [applications.id]
	}),
	directory: one(directories, {
		fields: [directoryDefs.directoryId],
		references: [directories.id]
	}),
	fieldDefs: many(fieldDefs),
}));

export const applicationMembersRelations = relations(applicationMembers, ({one}) => ({
	application: one(applications, {
		fields: [applicationMembers.applicationId],
		references: [applications.id]
	}),
	user_userId: one(users, {
		fields: [applicationMembers.userId],
		references: [users.id],
		relationName: "applicationMembers_userId_users_id"
	}),
	user_invitedBy: one(users, {
		fields: [applicationMembers.invitedBy],
		references: [users.id],
		relationName: "applicationMembers_invitedBy_users_id"
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	applicationMembers_userId: many(applicationMembers, {
		relationName: "applicationMembers_userId_users_id"
	}),
	applicationMembers_invitedBy: many(applicationMembers, {
		relationName: "applicationMembers_invitedBy_users_id"
	}),
}));

export const applicationUsersRelations = relations(applicationUsers, ({one}) => ({
	application: one(applications, {
		fields: [applicationUsers.applicationId],
		references: [applications.id]
	}),
}));

export const fieldCategoriesRelations = relations(fieldCategories, ({one, many}) => ({
	application: one(applications, {
		fields: [fieldCategories.applicationId],
		references: [applications.id]
	}),
	directory: one(directories, {
		fields: [fieldCategories.directoryId],
		references: [directories.id]
	}),
	fieldDefs: many(fieldDefs),
}));

export const fieldDefsRelations = relations(fieldDefs, ({one}) => ({
	directoryDef: one(directoryDefs, {
		fields: [fieldDefs.directoryId],
		references: [directoryDefs.id]
	}),
	fieldCategory: one(fieldCategories, {
		fields: [fieldDefs.categoryId],
		references: [fieldCategories.id]
	}),
}));