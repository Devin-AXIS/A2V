import { db } from "../../db";
import { applications, modules, directories, directoryDefs } from "../../db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getAllSystemModules } from "../../lib/system-modules";
function generateSlug(name) {
    if (/^[a-zA-Z0-9\s]+$/.test(name)) {
        return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
    const timestamp = Date.now();
    return `app-${timestamp}`;
}
export class ApplicationService {
    async createApplication(data, userId) {
        const newApp = {
            name: data.name,
            description: data.description || "",
            slug: generateSlug(data.name),
            ownerId: userId,
            status: "active",
            template: data.template || "default",
            config: data.config || {},
            databaseConfig: null,
            isPublic: data.isPublic || false,
            version: "1.0.0",
        };
        const [result] = await db.insert(applications).values(newApp).returning();
        const createdModules = await this.createSystemModules(result.id);
        await this.createDefaultDirectories(result.id, createdModules);
        return result;
    }
    async createSystemModules(applicationId) {
        const systemModules = getAllSystemModules();
        const createdModules = [];
        for (let i = 0; i < systemModules.length; i++) {
            const module = systemModules[i];
            const [createdModule] = await db.insert(modules).values({
                applicationId,
                name: module.name,
                type: module.type,
                icon: module.icon,
                config: module.config,
                order: i,
                isEnabled: true,
            }).returning();
            createdModules.push(createdModule);
        }
        return createdModules;
    }
    async createDefaultDirectories(applicationId, modules) {
        const userModule = modules.find(m => m.name === '用户管理');
        if (userModule) {
            const [createdDirectory] = await db.insert(directories).values({
                applicationId,
                moduleId: userModule.id,
                name: '用户列表',
                type: 'table',
                supportsCategory: false,
                config: {
                    description: '系统用户管理列表',
                    fields: []
                },
                order: 0,
                isEnabled: true,
            }).returning();
            await db.insert(directoryDefs).values({
                applicationId,
                directoryId: createdDirectory.id,
                title: '用户列表',
                slug: `user-list-${Date.now()}`,
                status: 'active',
            });
        }
    }
    async getApplications(query, userId) {
        const { page = 1, limit = 10, search, status, template } = query;
        const offset = (page - 1) * limit;
        let whereConditions = [eq(applications.ownerId, userId)];
        if (search) {
            whereConditions.push(eq(applications.name, search));
        }
        if (status) {
            whereConditions.push(eq(applications.status, status));
        }
        if (template) {
            whereConditions.push(eq(applications.template, template));
        }
        const countResult = await db
            .select({ count: applications.id })
            .from(applications)
            .where(and(...whereConditions));
        const total = countResult.length;
        const applicationsList = await db
            .select()
            .from(applications)
            .where(and(...whereConditions))
            .orderBy(desc(applications.createdAt))
            .limit(limit)
            .offset(offset);
        return {
            applications: applicationsList,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    async getApplicationById(id, userId) {
        const [application] = await db
            .select()
            .from(applications)
            .where(and(eq(applications.id, id), eq(applications.ownerId, userId)));
        if (!application) {
            throw new Error("应用不存在或无权限访问");
        }
        return application;
    }
    async updateApplication(id, data, userId) {
        const updateData = {
            ...data,
            updatedAt: new Date()
        };
        const [result] = await db
            .update(applications)
            .set(updateData)
            .where(and(eq(applications.id, id), eq(applications.ownerId, userId)))
            .returning();
        if (!result) {
            throw new Error("应用不存在或无权限访问");
        }
        return result;
    }
    async deleteApplication(id, userId) {
        const [result] = await db
            .delete(applications)
            .where(and(eq(applications.id, id), eq(applications.ownerId, userId)))
            .returning();
        if (!result) {
            throw new Error("应用不存在或无权限访问");
        }
        return { success: true };
    }
    async createApplicationFromTemplate(data, userId) {
        return await this.createApplication(data, userId);
    }
    async getApplicationModules(applicationId, userId) {
        const application = await this.getApplicationById(applicationId, userId);
        const modulesList = await db
            .select()
            .from(modules)
            .where(eq(modules.applicationId, applicationId))
            .orderBy(modules.order);
        return {
            application,
            modules: modulesList,
        };
    }
}
//# sourceMappingURL=service.js.map