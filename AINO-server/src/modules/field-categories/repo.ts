import { db } from "../../db"
import { fieldCategories, applications } from "../../db/schema"
import { eq, and, desc, asc, count, sql } from "drizzle-orm"
import type {
  CreateFieldCategoryRequest,
  UpdateFieldCategoryRequest,
  GetFieldCategoriesQuery,
  FieldCategoryResponse,
  FieldCategoriesListResponse,
} from "./dto"

export class FieldCategoriesRepository {
  async create(data: CreateFieldCategoryRequest, applicationId: string, directoryId: string): Promise<FieldCategoryResponse> {
    const [result] = await db.insert(fieldCategories).values({
      applicationId,
      directoryId,
      name: data.name,
      description: data.description,
      order: data.order,
      enabled: data.enabled,
      system: data.system,
      predefinedFields: data.predefinedFields,
    }).returning()

    return this.convertToResponse(result)
  }

  async findMany(query: GetFieldCategoriesQuery): Promise<FieldCategoriesListResponse> {
    const { applicationId, directoryId, enabled, system, page = 1, limit = 20 } = query
    const offset = (page - 1) * limit

    const conditions = []
    if (applicationId) {
      conditions.push(eq(fieldCategories.applicationId, applicationId))
    }
    if (directoryId) {
      conditions.push(eq(fieldCategories.directoryId, directoryId))
    }
    if (enabled !== undefined) {
      conditions.push(eq(fieldCategories.enabled, enabled))
    }
    if (system !== undefined) {
      conditions.push(eq(fieldCategories.system, system))
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    // 获取总数
    const [{ value: total }] = await db
      .select({ value: count() })
      .from(fieldCategories)
      .where(whereClause)

    // 获取分页数据
    const categoriesList = await db
      .select()
      .from(fieldCategories)
      .where(whereClause)
      .orderBy(asc(fieldCategories.order), asc(fieldCategories.createdAt))
      .limit(limit)
      .offset(offset)

    return {
      categories: categoriesList.map(this.convertToResponse.bind(this)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findById(id: string): Promise<any> {
    const [result] = await db
      .select()
      .from(fieldCategories)
      .where(eq(fieldCategories.id, id))
      .limit(1)

    return result
  }

  async update(id: string, data: UpdateFieldCategoryRequest): Promise<FieldCategoryResponse | null> {
    const updateData: any = {}
    
    if (data.name !== undefined) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description
    if (data.order !== undefined) updateData.order = data.order
    if (data.enabled !== undefined) updateData.enabled = data.enabled
    if (data.system !== undefined) updateData.system = data.system
    if (data.predefinedFields !== undefined) updateData.predefinedFields = data.predefinedFields
    updateData.updatedAt = new Date()

    const [result] = await db
      .update(fieldCategories)
      .set(updateData)
      .where(eq(fieldCategories.id, id))
      .returning()

    return result ? this.convertToResponse(result) : null
  }

  async delete(id: string): Promise<boolean> {
    const [result] = await db
      .delete(fieldCategories)
      .where(eq(fieldCategories.id, id))
      .returning()

    return !!result
  }

  async checkNameExists(name: string, directoryId: string, excludeId?: string) {
    const conditions = [
      eq(fieldCategories.name, name),
      eq(fieldCategories.directoryId, directoryId)
    ]

    if (excludeId) {
      conditions.push(sql`${fieldCategories.id} != ${excludeId}`)
    }

    const [result] = await db
      .select({ id: fieldCategories.id })
      .from(fieldCategories)
      .where(and(...conditions))
      .limit(1)

    return !!result
  }

    async getFieldsCountInCategory(categoryId: string): Promise<number> {
    // 字段表已删除，返回0
    return 0
  }

  // 查找应用信息
  async findApplicationById(applicationId: string): Promise<any> {
    const [result] = await db
      .select()
      .from(applications)
      .where(eq(applications.id, applicationId))
      .limit(1)

    return result
  }

  private convertToResponse(dbRecord: any): FieldCategoryResponse {
    return {
      id: String(dbRecord.id),
      applicationId: String(dbRecord.applicationId),
      directoryId: String(dbRecord.directoryId),
      name: String(dbRecord.name),
      description: dbRecord.description,
      order: Number(dbRecord.order || 0),
      enabled: Boolean(dbRecord.enabled),
      system: Boolean(dbRecord.system),
      predefinedFields: dbRecord.predefinedFields || [],
      createdAt: dbRecord.createdAt instanceof Date ? dbRecord.createdAt.toISOString() : String(dbRecord.createdAt),
      updatedAt: dbRecord.updatedAt instanceof Date ? dbRecord.updatedAt.toISOString() : String(dbRecord.updatedAt),
    }
  }
}
