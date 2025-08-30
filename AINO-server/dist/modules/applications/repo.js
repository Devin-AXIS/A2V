import { db } from "@/db";
import { applications, applicationMembers, modules, directories, users } from "@/db/schema";
import { eq, and, like, desc, asc, count, sql } from "drizzle-orm";
export class ApplicationRepository {
    async create(data) {
        const slug = this.generateSlug(data.name);
        const [application] = await db
            .insert(applications)
            .values({
            name: data.name,
            description: data.description,
            slug,
            ownerId: data.ownerId,
            template: data.template,
            isPublic: data.isPublic,
            config: data.config || {},
            databaseConfig: {},
            status: "active",
            version: "1.0.0",
        })
            .returning();
        await db.insert(applicationMembers).values({
            applicationId: application.id,
            userId: data.ownerId,
            role: "owner",
            permissions: { all: true },
            status: "active",
        });
        return application;
    }
    async findMany(query) {
        const { page, limit, search, status, template, userId } = query;
        const offset = (page - 1) * limit;
        const whereConditions = [eq(applicationMembers.userId, userId)];
        if (search) {
            whereConditions.push(like(applications.name, `%${search}%`));
        }
        if (status) {
            whereConditions.push(eq(applications.status, status));
        }
        if (template) {
            whereConditions.push(eq(applications.template, template));
        }
        const [{ value: total }] = await db
            .select({ value: count() })
            .from(applications)
            .innerJoin(applicationMembers, eq(applications.id, applicationMembers.applicationId))
            .where(and(...whereConditions));
        const apps = await db
            .select({
            id: applications.id,
            name: applications.name,
            description: applications.description,
            slug: applications.slug,
            ownerId: applications.ownerId,
            status: applications.status,
            template: applications.template,
            config: applications.config,
            databaseConfig: applications.databaseConfig,
            isPublic: applications.isPublic,
            version: applications.version,
            createdAt: applications.createdAt,
            updatedAt: applications.updatedAt,
            owner: {
                id: users.id,
                name: users.name,
                email: users.email,
            },
            _count: {
                modules: sql `(SELECT COUNT(*) FROM ${modules} WHERE ${modules.applicationId} = ${applications.id})`,
                members: sql `(SELECT COUNT(*) FROM ${applicationMembers} WHERE ${applicationMembers.applicationId} = ${applications.id})`,
            },
        })
            .from(applications)
            .innerJoin(applicationMembers, eq(applications.id, applicationMembers.applicationId))
            .leftJoin(users, eq(applications.ownerId, users.id))
            .where(and(...whereConditions))
            .orderBy(desc(applications.updatedAt))
            .limit(limit)
            .offset(offset);
        return {
            applications: apps,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findById(id, userId) {
        const member = await db
            .select()
            .from(applicationMembers)
            .where(and(eq(applicationMembers.applicationId, id), eq(applicationMembers.userId, userId)))
            .limit(1);
        if (!member.length) {
            return null;
        }
        const [application] = await db
            .select({
            id: applications.id,
            name: applications.name,
            description: applications.description,
            slug: applications.slug,
            ownerId: applications.ownerId,
            status: applications.status,
            template: applications.template,
            config: applications.config,
            databaseConfig: applications.databaseConfig,
            isPublic: applications.isPublic,
            version: applications.version,
            createdAt: applications.createdAt,
            updatedAt: applications.updatedAt,
            owner: {
                id: users.id,
                name: users.name,
                email: users.email,
            },
        })
            .from(applications)
            .leftJoin(users, eq(applications.ownerId, users.id))
            .where(eq(applications.id, id))
            .limit(1);
        if (!application) {
            return null;
        }
        const appModules = await db
            .select({
            id: modules.id,
            name: modules.name,
            type: modules.type,
            icon: modules.icon,
            config: modules.config,
            order: modules.order,
            isEnabled: modules.isEnabled,
            createdAt: modules.createdAt,
            updatedAt: modules.updatedAt,
        })
            .from(modules)
            .where(eq(modules.applicationId, id))
            .orderBy(asc(modules.order));
        const directoriesWithFields = await Promise.all(appModules.map(async (module) => {
            const dirs = await db
                .select({
                id: directories.id,
                name: directories.name,
                type: directories.type,
                supportsCategory: directories.supportsCategory,
                config: directories.config,
                order: directories.order,
                isEnabled: directories.isEnabled,
                createdAt: directories.createdAt,
                updatedAt: directories.updatedAt,
                _count: {
                    fields: sql `0`,
                },
            })
                .from(directories)
                .where(eq(directories.moduleId, module.id))
                .orderBy(asc(directories.order));
            return {
                ...module,
                directories: dirs,
            };
        }));
        const members = await db
            .select({
            id: applicationMembers.id,
            role: applicationMembers.role,
            permissions: applicationMembers.permissions,
            joinedAt: applicationMembers.joinedAt,
            status: applicationMembers.status,
            user: {
                id: users.id,
                name: users.name,
                email: users.email,
                avatar: users.avatar,
            },
        })
            .from(applicationMembers)
            .leftJoin(users, eq(applicationMembers.userId, users.id))
            .where(eq(applicationMembers.applicationId, id))
            .orderBy(asc(applicationMembers.joinedAt));
        return {
            ...application,
            modules: directoriesWithFields,
            members,
        };
    }
    async update(id, data, userId) {
        const member = await db
            .select()
            .from(applicationMembers)
            .where(and(eq(applicationMembers.applicationId, id), eq(applicationMembers.userId, userId)))
            .limit(1);
        if (!member.length || !["owner", "admin"].includes(member[0].role)) {
            return null;
        }
        const [application] = await db
            .update(applications)
            .set({
            ...data,
            updatedAt: new Date(),
        })
            .where(eq(applications.id, id))
            .returning();
        return application;
    }
    async delete(id, userId) {
        const member = await db
            .select()
            .from(applicationMembers)
            .where(and(eq(applicationMembers.applicationId, id), eq(applicationMembers.userId, userId)))
            .limit(1);
        if (!member.length || member[0].role !== "owner") {
            return false;
        }
        await db.delete(applications).where(eq(applications.id, id));
        return true;
    }
    async findMember(applicationId, userId) {
        const [member] = await db
            .select({
            id: applicationMembers.id,
            role: applicationMembers.role,
            permissions: applicationMembers.permissions,
            status: applicationMembers.status,
            joinedAt: applicationMembers.joinedAt,
        })
            .from(applicationMembers)
            .where(and(eq(applicationMembers.applicationId, applicationId), eq(applicationMembers.userId, userId), eq(applicationMembers.status, "active")))
            .limit(1);
        return member;
    }
    generateSlug(name) {
        const baseSlug = name
            .toLowerCase()
            .replace(/[^a-z0-9\u4e00-\u9fa5]/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "");
        return `${baseSlug}-${Date.now()}`;
    }
}
//# sourceMappingURL=repo.js.map