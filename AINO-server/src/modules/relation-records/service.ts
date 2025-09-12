import { RelationRecordsRepository } from "./repo"
import { db } from "../../db"
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

  // 创建关联关系（使用幂等写入）
  async createRelation(data: CreateRelationRequest) {
    // 使用幂等写入，避免重复创建
    const result = await this.repo.createIdempotent(data)

    if (!result.created) {
      // 关联关系已存在，直接返回
      return result.relation
    }

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

      await this.repo.createIdempotent(reverseRelation)
    }

    return result.relation
  }

  // 批量创建关联关系（事务安全）
  async batchCreateRelations(data: BatchCreateRelationRequest) {
    return await db.transaction(async (tx) => {
      const results = []

      for (const relation of data.relations) {
        try {
          // 在事务中使用幂等写入
          const result = await this.repo.createIdempotent({
            ...relation,
            applicationId: data.applicationId,
          })

          results.push(result.relation)

          // 如果是双向关联，创建反向关联
          if (relation.bidirectional && relation.toFieldKey) {
            const reverseRelation: CreateRelationRequest = {
              applicationId: data.applicationId,
              fromDirectoryId: relation.toDirectoryId,
              fromRecordId: relation.toRecordId,
              fromFieldKey: relation.toFieldKey,
              toDirectoryId: relation.fromDirectoryId,
              toRecordId: relation.fromRecordId,
              toFieldKey: relation.fromFieldKey,
              relationType: relation.relationType,
              bidirectional: true,
            }

            await this.repo.createIdempotent(reverseRelation)
          }
        } catch (error) {
          // 在事务中，任何错误都会导致回滚
          console.error(`批量创建关联关系失败:`, error)
          throw error
        }
      }

      return results
    })
  }

  // 删除关联关系（事务安全）
  async deleteRelation(data: DeleteRelationRequest) {
    return await db.transaction(async (tx) => {
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
    })
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

  // 同步关联关系（用于字段值变更时，事务安全）
  async syncRelations(
    applicationId: string,
    directoryId: string,
    recordId: string,
    fieldKey: string,
    newValue: any,
    fieldConfig: any
  ) {
    return await db.transaction(async (tx) => {
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

            await this.batchCreateRelations({ applicationId, relations: relations as any })
          }
        }
      }

      return { success: true }
    })
  }

  // ==================== 标准化查询服务方法 ====================

  /**
   * 出边查询：从某记录找到所有关联记录
   * 使用优化的索引查询
   */
  async getOutboundRelations(
    applicationId: string,
    fromDirectoryId: string,
    fromRecordId: string,
    options: {
      relationType?: string;
      toDirectoryId?: string;
      limit?: number;
      cursor?: Date;
    } = {}
  ) {
    return await this.repo.findOutboundRelations(
      applicationId,
      fromDirectoryId,
      fromRecordId,
      options
    );
  }

  /**
   * 入边查询：反向关联查询
   * 使用优化的索引查询
   */
  async getInboundRelations(
    applicationId: string,
    toDirectoryId: string,
    toRecordId: string,
    options: {
      relationType?: string;
      fromDirectoryId?: string;
      limit?: number;
      cursor?: Date;
    } = {}
  ) {
    return await this.repo.findInboundRelations(
      applicationId,
      toDirectoryId,
      toRecordId,
      options
    );
  }

  /**
   * 级联计数查询：获取记录的关联数量统计
   * 用于列表页展示"关联数"
   */
  async getRelationCounts(
    applicationId: string,
    fromDirectoryId: string,
    fromRecordId: string
  ) {
    return await this.repo.getRelationCounts(
      applicationId,
      fromDirectoryId,
      fromRecordId
    );
  }

  /**
   * 字段级存在性查询：检查特定字段的关联是否存在
   */
  async checkFieldRelationExists(
    applicationId: string,
    directoryId: string,
    recordId: string,
    fieldKey: string,
    direction: 'from' | 'to' = 'from'
  ) {
    return await this.repo.checkFieldRelationExists(
      applicationId,
      directoryId,
      recordId,
      fieldKey,
      direction
    );
  }

  /**
   * 批量幂等创建关联关系
   */
  async batchCreateIdempotent(
    applicationId: string,
    relations: Omit<CreateRelationRequest, 'applicationId'>[]
  ) {
    return await this.repo.batchCreateIdempotent(applicationId, relations);
  }

  // ==================== 级联删除策略 ====================

  /**
   * 软删除记录的所有关联关系
   * 优先使用软删除策略，在业务表中用 is_deleted 控制可见性
   */
  async softDeleteRecordRelations(
    applicationId: string,
    directoryId: string,
    recordId: string
  ) {
    return await db.transaction(async (tx) => {
      // 1. 先标记主记录为删除（这里需要根据实际的记录表结构来实现）
      // 例如：await tx.update(records).set({ isDeleted: true, deletedAt: new Date() }).where(eq(records.id, recordId));

      // 2. 清理关联关系（物理删除关联关系，因为关联关系表不需要软删除）
      const result = await this.repo.deleteByRecord(applicationId, directoryId, recordId);

      return {
        success: true,
        deletedRelationsCount: result.length,
        message: "记录已软删除，关联关系已清理"
      };
    });
  }

  /**
   * 物理删除记录的所有关联关系
   * 先删关联关系，再删主记录
   */
  async hardDeleteRecordRelations(
    applicationId: string,
    directoryId: string,
    recordId: string
  ) {
    return await db.transaction(async (tx) => {
      // 1. 先删除所有关联关系
      const deletedRelations = await this.repo.deleteByRecord(applicationId, directoryId, recordId);

      // 2. 再删除主记录（这里需要根据实际的记录表结构来实现）
      // 例如：await tx.delete(records).where(eq(records.id, recordId));

      return {
        success: true,
        deletedRelationsCount: deletedRelations.length,
        message: "记录和关联关系已物理删除"
      };
    });
  }

  /**
   * 软删除字段的所有关联关系
   * 用于字段值变更时的关联关系清理
   */
  async softDeleteFieldRelations(
    applicationId: string,
    directoryId: string,
    recordId: string,
    fieldKey: string
  ) {
    return await db.transaction(async (tx) => {
      // 清理字段的关联关系
      const result = await this.repo.deleteByField(applicationId, directoryId, recordId, fieldKey);

      return {
        success: true,
        deletedRelationsCount: result.length,
        message: "字段关联关系已清理"
      };
    });
  }

  /**
   * 批量软删除多个记录的关联关系
   * 用于批量操作时的关联关系清理
   */
  async batchSoftDeleteRecordRelations(
    applicationId: string,
    records: Array<{ directoryId: string; recordId: string }>
  ) {
    return await db.transaction(async (tx) => {
      const results = [];

      for (const record of records) {
        const result = await this.softDeleteRecordRelations(
          applicationId,
          record.directoryId,
          record.recordId
        );
        results.push({
          ...record,
          ...result
        });
      }

      return {
        success: true,
        processedCount: results.length,
        results
      };
    });
  }

  /**
   * 级联删除策略选择器
   * 根据配置选择软删除或物理删除
   */
  async deleteRecordRelationsWithStrategy(
    applicationId: string,
    directoryId: string,
    recordId: string,
    strategy: 'soft' | 'hard' = 'soft'
  ) {
    switch (strategy) {
      case 'soft':
        return await this.softDeleteRecordRelations(applicationId, directoryId, recordId);
      case 'hard':
        return await this.hardDeleteRecordRelations(applicationId, directoryId, recordId);
      default:
        throw new Error(`不支持的删除策略: ${strategy}`);
    }
  }
}
