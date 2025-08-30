import { relations } from "drizzle-orm/relations";
import { applications, directoryDefs, directories, fieldDefs, applicationUsers, modules, auditLogs, users, applicationMembers } from "./schema";

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

export const applicationsRelations = relations(applications, ({many}) => ({
	directoryDefs: many(directoryDefs),
	applicationUsers: many(applicationUsers),
	directories: many(directories),
	modules: many(modules),
	auditLogs: many(auditLogs),
	applicationMembers: many(applicationMembers),
}));

export const directoriesRelations = relations(directories, ({one, many}) => ({
	directoryDefs: many(directoryDefs),
	application: one(applications, {
		fields: [directories.applicationId],
		references: [applications.id]
	}),
	module: one(modules, {
		fields: [directories.moduleId],
		references: [modules.id]
	}),
}));

export const fieldDefsRelations = relations(fieldDefs, ({one}) => ({
	directoryDef: one(directoryDefs, {
		fields: [fieldDefs.directoryId],
		references: [directoryDefs.id]
	}),
}));

export const applicationUsersRelations = relations(applicationUsers, ({one}) => ({
	application: one(applications, {
		fields: [applicationUsers.applicationId],
		references: [applications.id]
	}),
}));

export const modulesRelations = relations(modules, ({one, many}) => ({
	directories: many(directories),
	application: one(applications, {
		fields: [modules.applicationId],
		references: [applications.id]
	}),
}));

export const auditLogsRelations = relations(auditLogs, ({one}) => ({
	application: one(applications, {
		fields: [auditLogs.applicationId],
		references: [applications.id]
	}),
	user: one(users, {
		fields: [auditLogs.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	auditLogs: many(auditLogs),
	applicationMembers_userId: many(applicationMembers, {
		relationName: "applicationMembers_userId_users_id"
	}),
	applicationMembers_invitedBy: many(applicationMembers, {
		relationName: "applicationMembers_invitedBy_users_id"
	}),
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