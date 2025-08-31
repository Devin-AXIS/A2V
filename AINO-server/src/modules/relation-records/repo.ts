import { db } from "../../db"
import { relationRecords, directoryDefs } from "../../db/schema"
import { eq, and, or, desc, asc, sql } from "drizzle-orm"
import type { 
  CreateRelationRequest, 
  GetRelationsRequest, 
  DeleteRelationRequest,
  RelationsListResponse,
  RelatedRecordsListResponse
} from "./dto"

export class RelationRecordsRepository {
  // 创建关联关系
  async create(data: CreateRelationRequest) {
    const [relation] = await db.insert(relationRecords).values({
      applicationId: data.applicationId,
      fromDirectoryId: data.fromDirectoryId,
      fromRecordId: data.fromRecordId,
      fromFieldKey: data.fromFieldKey,
      toDirectoryId: data.toDirectoryId,
      toRecordId: data.toRecordId,
      toFieldKey: data.toFieldKey || null,
      relationType: data.relationType,
      bidirectional: data.bidirectional,
      createdBy: null, // TODO: 从上下文获取用户ID
    }).returning()

    return relation
  }

  // 批量创建关联关系
  async batchCreate(applicationId: string, relations: Omit<CreateRelationRequest, 'applicationId'>[]) {
    const values = relations.map(relation => ({
      applicationId,
      fromDirectoryId: relation.fromDirectoryId,
      fromRecordId: relation.fromRecordId,
      fromFieldKey: relation.fromFieldKey,
      toDirectoryId: relation.toDirectoryId,
      toRecordId: relation.toRecordId,
      toFieldKey: relation.toFieldKey || null,
      relationType: relation.relationType,
      bidirectional: relation.bidirectional,
      createdBy: null,
    }))

    const result = await db.insert(relationRecords).values(values).returning()
    return result
  }

  // 删除关联关系
  async delete(data: DeleteRelationRequest) {
    const result = await db.delete(relationRecords).where(
      and(
        eq(relationRecords.applicationId, data.applicationId),
        eq(relationRecords.fromDirectoryId, data.fromDirectoryId),
        eq(relationRecords.fromRecordId, data.fromRecordId),
        eq(relationRecords.fromFieldKey, data.fromFieldKey),
        eq(relationRecords.toDirectoryId, data.toDirectoryId),
        eq(relationRecords.toRecordId, data.toRecordId)
      )
    ).returning()

    return result
  }

  // 删除记录的所有关联关系
  async deleteByRecord(applicationId: string, directoryId: string, recordId: string) {
    const result = await db.delete(relationRecords).where(
      and(
        eq(relationRecords.applicationId, applicationId),
        or(
          and(
            eq(relationRecords.fromDirectoryId, directoryId),
            eq(relationRecords.fromRecordId, recordId)
          ),
          and(
            eq(relationRecords.toDirectoryId, directoryId),
            eq(relationRecords.toRecordId, recordId)
          )
        )
      )
    ).returning()

    return result
  }

  // 删除字段的所有关联关系
  async deleteByField(applicationId: string, directoryId: string, recordId: string, fieldKey: string) {
    const result = await db.delete(relationRecords).where(
      and(
        eq(relationRecords.applicationId, applicationId),
        or(
          and(
            eq(relationRecords.fromDirectoryId, directoryId),
            eq(relationRecords.fromRecordId, recordId),
            eq(relationRecords.fromFieldKey, fieldKey)
          ),
          and(
            eq(relationRecords.toDirectoryId, directoryId),
            eq(relationRecords.toRecordId, recordId),
            eq(relationRecords.toFieldKey, fieldKey)
          )
        )
      )
    ).returning()

    return result
  }

  // 查询关联关系
  async findMany(params: GetRelationsRequest): Promise<RelationsListResponse> {
    const { page, limit, applicationId, directoryId, recordId, fieldKey, relationType, bidirectional } = params
    const offset = (page - 1) * limit

    // 构建查询条件
    const conditions = [eq(relationRecords.applicationId, applicationId)]
    
    if (directoryId && recordId) {
      conditions.push(
        or(
          and(
            eq(relationRecords.fromDirectoryId, directoryId),
            eq(relationRecords.fromRecordId, recordId)
          ),
          and(
            eq(relationRecords.toDirectoryId, directoryId),
            eq(relationRecords.toRecordId, recordId)
          )
        )
      )
    }
    
    if (fieldKey) {
      conditions.push(
        or(
          eq(relationRecords.fromFieldKey, fieldKey),
          eq(relationRecords.toFieldKey, fieldKey)
        )
      )
    }
    
    if (relationType) {
      conditions.push(eq(relationRecords.relationType, relationType))
    }
    
    if (bidirectional !== undefined) {
      conditions.push(eq(relationRecords.bidirectional, bidirectional))
    }

    // 查询总数
    const [totalResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(relationRecords)
      .where(and(...conditions))

    const total = totalResult.count

    // 查询数据
    const relations = await db
      .select()
      .from(relationRecords)
      .where(and(...conditions))
      .orderBy(desc(relationRecords.createdAt))
      .limit(limit)
      .offset(offset)

    return {
      relations,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  // 查询关联的记录
  async findRelatedRecords(
    applicationId: string,
    directoryId: string,
    recordId: string,
    fieldKey: string,
    page: number = 1,
    limit: number = 20
  ): Promise<RelatedRecordsListResponse> {
    const offset = (page - 1) * limit

    // 查询正向关联的记录
    const forwardRelations = await db
      .select({
        toRecordId: relationRecords.toRecordId,
        toDirectoryId: relationRecords.toDirectoryId,
        relationType: relationRecords.relationType,
        createdAt: relationRecords.createdAt,
      })
      .from(relationRecords)
      .where(
        and(
          eq(relationRecords.applicationId, applicationId),
          eq(relationRecords.fromDirectoryId, directoryId),
          eq(relationRecords.fromRecordId, recordId),
          eq(relationRecords.fromFieldKey, fieldKey)
        )
      )

    // 查询反向关联的记录
    const reverseRelations = await db
      .select({
        toRecordId: relationRecords.fromRecordId,
        toDirectoryId: relationRecords.fromDirectoryId,
        relationType: relationRecords.relationType,
        createdAt: relationRecords.createdAt,
      })
      .from(relationRecords)
      .where(
        and(
          eq(relationRecords.applicationId, applicationId),
          eq(relationRecords.toDirectoryId, directoryId),
          eq(relationRecords.toRecordId, recordId),
          eq(relationRecords.toFieldKey, fieldKey)
        )
      )

    // 合并结果
    const allRelations = [...forwardRelations, ...reverseRelations]
    const total = allRelations.length

    // 分页
    const paginatedRelations = allRelations.slice(offset, offset + limit)

    // TODO: 这里需要根据实际的记录表结构来查询记录数据
    // 目前返回基本结构，实际实现时需要根据directoryId查询对应的记录表
    const records = paginatedRelations.map(rel => ({
      id: rel.toRecordId,
      directoryId: rel.toDirectoryId,
      directoryName: '', // TODO: 从directoryDefs查询
      data: {}, // TODO: 从对应的记录表查询
      relationType: rel.relationType,
      createdAt: rel.createdAt.toISOString(),
    }))

    return {
      records,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  // 检查关联关系是否存在
  async exists(data: Omit<CreateRelationRequest, 'applicationId'>) {
    const [relation] = await db
      .select()
      .from(relationRecords)
      .where(
        and(
          eq(relationRecords.fromDirectoryId, data.fromDirectoryId),
          eq(relationRecords.fromRecordId, data.fromRecordId),
          eq(relationRecords.fromFieldKey, data.fromFieldKey),
          eq(relationRecords.toDirectoryId, data.toDirectoryId),
          eq(relationRecords.toRecordId, data.toRecordId)
        )
      )
      .limit(1)

    return !!relation
  }
}
