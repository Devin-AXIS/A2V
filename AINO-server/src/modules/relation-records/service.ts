import { RelationRecordsRepository } from "./repo"
import type { 
  CreateRelationRequest, 
  BatchCreateRelationRequest,
  DeleteRelationRequest,
  GetRelationsRequest,
  RelationsListResponse,
  RelatedRecordsListResponse
} from "./dto"

export class RelationRecordsService {
  private repo = new RelationRecordsRepository()

  // 创建关联关系
  async createRelation(data: CreateRelationRequest) {
    // 检查关联关系是否已存在
    const exists = await this.repo.exists(data)
    if (exists) {
      throw new Error("关联关系已存在")
    }

    const relation = await this.repo.create(data)

    // 如果是双向关联，创建反向关联
    if (data.bidirectional && data.toFieldKey) {
      const reverseRelation: CreateRelationRequest = {
        applicationId: data.applicationId,
        fromDirectoryId: data.toDirectoryId,
        fromRecordId: data.toRecordId,
        fromFieldKey: data.toFieldKey,
        toDirectoryId: data.fromDirectoryId,
        toRecordId: data.fromRecordId,
        toFieldKey: data.fromFieldKey,
        relationType: data.relationType,
        bidirectional: true,
      }

      await this.repo.create(reverseRelation)
    }

    return relation
  }

  // 批量创建关联关系
  async batchCreateRelations(data: BatchCreateRelationRequest) {
    const relations = data.relations.map(relation => ({
      ...relation,
      applicationId: data.applicationId,
    }))

    const results = []
    for (const relation of relations) {
      try {
        const result = await this.createRelation(relation)
        results.push(result)
      } catch (error) {
        // 记录错误但继续处理其他关联
        console.error(`创建关联关系失败:`, error)
      }
    }

    return results
  }

  // 删除关联关系
  async deleteRelation(data: DeleteRelationRequest) {
    // 先查询关联关系以确定是否为双向关联
    const relations = await this.repo.findMany({
      applicationId: data.applicationId,
      page: 1,
      limit: 1000, // 获取所有相关关联
    })

    const targetRelation = relations.relations.find(rel => 
      rel.fromDirectoryId === data.fromDirectoryId &&
      rel.fromRecordId === data.fromRecordId &&
      rel.fromFieldKey === data.fromFieldKey &&
      rel.toDirectoryId === data.toDirectoryId &&
      rel.toRecordId === data.toRecordId
    )

    if (!targetRelation) {
      throw new Error("关联关系不存在")
    }

    // 删除正向关联
    await this.repo.delete(data)

    // 如果是双向关联，删除反向关联
    if (targetRelation.bidirectional && targetRelation.toFieldKey) {
      const reverseDeleteData: DeleteRelationRequest = {
        applicationId: data.applicationId,
        fromDirectoryId: data.toDirectoryId,
        fromRecordId: data.toRecordId,
        fromFieldKey: targetRelation.toFieldKey,
        toDirectoryId: data.fromDirectoryId,
        toRecordId: data.fromRecordId,
      }

      await this.repo.delete(reverseDeleteData)
    }

    return { success: true }
  }

  // 删除记录的所有关联关系
  async deleteRecordRelations(applicationId: string, directoryId: string, recordId: string) {
    const result = await this.repo.deleteByRecord(applicationId, directoryId, recordId)
    return { deletedCount: result.length }
  }

  // 删除字段的所有关联关系
  async deleteFieldRelations(applicationId: string, directoryId: string, recordId: string, fieldKey: string) {
    const result = await this.repo.deleteByField(applicationId, directoryId, recordId, fieldKey)
    return { deletedCount: result.length }
  }

  // 查询关联关系
  async getRelations(params: GetRelationsRequest): Promise<RelationsListResponse> {
    return await this.repo.findMany(params)
  }

  // 查询关联的记录
  async getRelatedRecords(
    applicationId: string,
    directoryId: string,
    recordId: string,
    fieldKey: string,
    page: number = 1,
    limit: number = 20
  ): Promise<RelatedRecordsListResponse> {
    return await this.repo.findRelatedRecords(applicationId, directoryId, recordId, fieldKey, page, limit)
  }

  // 同步关联关系（用于字段值变更时）
  async syncRelations(
    applicationId: string,
    directoryId: string,
    recordId: string,
    fieldKey: string,
    newValue: any,
    fieldConfig: any
  ) {
    // 删除旧的关联关系
    await this.deleteFieldRelations(applicationId, directoryId, recordId, fieldKey)

    // 如果新值不为空，创建新的关联关系
    if (newValue && fieldConfig?.relation) {
      const relationConfig = fieldConfig.relation
      
      if (relationConfig.mode === "one") {
        // 一对一关联
        if (newValue) {
          await this.createRelation({
            applicationId,
            fromDirectoryId: directoryId,
            fromRecordId: recordId,
            fromFieldKey: fieldKey,
            toDirectoryId: relationConfig.targetDirId,
            toRecordId: newValue,
            toFieldKey: relationConfig.reverseFieldKey,
            relationType: "one_to_one",
            bidirectional: relationConfig.bidirectional || false,
          })
        }
      } else {
        // 一对多关联
        if (Array.isArray(newValue) && newValue.length > 0) {
          const relations = newValue.map(toRecordId => ({
            applicationId,
            fromDirectoryId: directoryId,
            fromRecordId: recordId,
            fromFieldKey: fieldKey,
            toDirectoryId: relationConfig.targetDirId,
            toRecordId,
            toFieldKey: relationConfig.reverseFieldKey,
            relationType: "one_to_many",
            bidirectional: relationConfig.bidirectional || false,
          }))

          await this.batchCreateRelations({ applicationId, relations })
        }
      }
    }

    return { success: true }
  }
}
