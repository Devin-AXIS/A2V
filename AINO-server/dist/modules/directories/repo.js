import { db } from "../../db";
import { directories, applications, directoryDefs } from "../../db/schema";
import { eq, and, desc, asc, count, sql } from "drizzle-orm";
export class DirectoryRepository {
    async create(data, applicationId, moduleId) {
        const [result] = await db.insert(directories).values({
            applicationId,
            moduleId,
            name: data.name,
            type: data.type,
            supportsCategory: data.supportsCategory,
            config: data.config,
            order: data.order,
            isEnabled: true,
        }).returning();
        return this.convertToResponse(result);
    }
    async findMany(query) {
        const { applicationId, moduleId, type, isEnabled, page = 1, limit = 20 } = query;
        const offset = (page - 1) * limit;
        const conditions = [];
        if (applicationId) {
            conditions.push(eq(directories.applicationId, applicationId));
        }
        if (moduleId) {
            conditions.push(eq(directories.moduleId, moduleId));
        }
        if (type) {
            conditions.push(eq(directories.type, type));
        }
        if (isEnabled !== undefined) {
            conditions.push(eq(directories.isEnabled, isEnabled));
        }
        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
        const [{ value: total }] = await db
            .select({ value: count() })
            .from(directories)
            .where(whereClause);
        const directoriesList = await db
            .select()
            .from(directories)
            .where(whereClause)
            .orderBy(asc(directories.order), desc(directories.createdAt))
            .limit(limit)
            .offset(offset);
        return {
            directories: directoriesList.map(this.convertToResponse.bind(this)),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findById(id) {
        const [result] = await db
            .select()
            .from(directories)
            .where(eq(directories.id, id))
            .limit(1);
        return result;
    }
    async update(id, data) {
        const updateData = {};
        if (data.name !== undefined)
            updateData.name = data.name;
        if (data.type !== undefined)
            updateData.type = data.type;
        if (data.supportsCategory !== undefined)
            updateData.supportsCategory = data.supportsCategory;
        if (data.config !== undefined)
            updateData.config = data.config;
        if (data.order !== undefined)
            updateData.order = data.order;
        if (data.isEnabled !== undefined)
            updateData.isEnabled = data.isEnabled;
        updateData.updatedAt = new Date();
        const [result] = await db
            .update(directories)
            .set(updateData)
            .where(eq(directories.id, id))
            .returning();
        return result ? this.convertToResponse(result) : null;
    }
    async delete(id) {
        const [result] = await db
            .delete(directories)
            .where(eq(directories.id, id))
            .returning();
        return !!result;
    }
    async checkNameExists(name, applicationId, excludeId) {
        const conditions = [
            eq(directories.name, name),
            eq(directories.applicationId, applicationId)
        ];
        if (excludeId) {
            conditions.push(sql `${directories.id} != ${excludeId}`);
        }
        const [result] = await db
            .select({ id: directories.id })
            .from(directories)
            .where(and(...conditions))
            .limit(1);
        return !!result;
    }
    async findApplicationById(applicationId) {
        const [result] = await db
            .select()
            .from(applications)
            .where(eq(applications.id, applicationId))
            .limit(1);
        return result;
    }
    convertToResponse(dbRecord) {
        return {
            id: String(dbRecord.id),
            applicationId: String(dbRecord.applicationId),
            moduleId: String(dbRecord.moduleId),
            name: String(dbRecord.name),
            type: String(dbRecord.type),
            supportsCategory: Boolean(dbRecord.supportsCategory),
            config: dbRecord.config || {},
            order: Number(dbRecord.order || 0),
            isEnabled: Boolean(dbRecord.isEnabled),
            createdAt: dbRecord.createdAt instanceof Date ? dbRecord.createdAt.toISOString() : String(dbRecord.createdAt),
            updatedAt: dbRecord.updatedAt instanceof Date ? dbRecord.updatedAt.toISOString() : String(dbRecord.updatedAt),
        };
    }
    async getDirectoryDefByDirectoryId(directoryId) {
        const [result] = await db.select().from(directoryDefs).where(eq(directoryDefs.directoryId, directoryId)).limit(1);
        return result || null;
    }
}
//# sourceMappingURL=repo.js.map