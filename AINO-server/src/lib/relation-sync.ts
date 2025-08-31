import { RelationRecordsService } from "../modules/relation-records/service"
import type { FieldDef } from "../lib/processors"

export interface RelationSyncContext {
  applicationId: string
  directoryId: string
  recordId: string
  userId?: string
}

export class RelationSyncService {
  private relationService = new RelationRecordsService()

  // 同步关联字段的关联关系
  async syncRelationField(
    fieldDef: FieldDef,
    newValue: any,
    oldValue: any,
    context: RelationSyncContext
  ) {
    // 只处理关联字段
    if (!['relation_one', 'relation_many'].includes(fieldDef.type)) {
      return
    }

    const relationConfig = fieldDef.relation
    if (!relationConfig || !relationConfig.targetDirId) {
      return
    }

    // 如果值没有变化，不需要同步
    if (JSON.stringify(newValue) === JSON.stringify(oldValue)) {
      return
    }

    try {
      // 删除旧的关联关系
      await this.relationService.deleteFieldRelations(
        context.applicationId,
        context.directoryId,
        context.recordId,
        fieldDef.key
      )

      // 创建新的关联关系
      if (newValue) {
        if (fieldDef.type === 'relation_one') {
          // 一对一关联
          await this.relationService.createRelation({
            applicationId: context.applicationId,
            fromDirectoryId: context.directoryId,
            fromRecordId: context.recordId,
            fromFieldKey: fieldDef.key,
            toDirectoryId: relationConfig.targetDirId,
            toRecordId: newValue,
            toFieldKey: relationConfig.reverseFieldKey || null,
            relationType: "one_to_one",
            bidirectional: relationConfig.bidirectional || false,
          })
        } else if (fieldDef.type === 'relation_many') {
          // 一对多关联
          if (Array.isArray(newValue) && newValue.length > 0) {
            const relations = newValue.map(toRecordId => ({
              applicationId: context.applicationId,
              fromDirectoryId: context.directoryId,
              fromRecordId: context.recordId,
              fromFieldKey: fieldDef.key,
              toDirectoryId: relationConfig.targetDirId,
              toRecordId,
              toFieldKey: relationConfig.reverseFieldKey || null,
              relationType: "one_to_many",
              bidirectional: relationConfig.bidirectional || false,
            }))

            await this.relationService.batchCreateRelations({
              applicationId: context.applicationId,
              relations
            })
          }
        }
      }
    } catch (error) {
      console.error('同步关联关系失败:', error)
      // 不抛出错误，避免影响主流程
    }
  }

  // 批量同步关联字段
  async syncRelationFields(
    fieldDefs: FieldDef[],
    newRecord: Record<string, any>,
    oldRecord: Record<string, any>,
    context: RelationSyncContext
  ) {
    const relationFields = fieldDefs.filter(field => 
      ['relation_one', 'relation_many'].includes(field.type)
    )

    for (const fieldDef of relationFields) {
      const newValue = newRecord[fieldDef.key]
      const oldValue = oldRecord[fieldDef.key]
      
      await this.syncRelationField(fieldDef, newValue, oldValue, context)
    }
  }

  // 删除记录时清理关联关系
  async cleanupRecordRelations(context: RelationSyncContext) {
    try {
      await this.relationService.deleteRecordRelations(
        context.applicationId,
        context.directoryId,
        context.recordId
      )
    } catch (error) {
      console.error('清理记录关联关系失败:', error)
    }
  }

  // 获取关联的记录
  async getRelatedRecords(
    context: RelationSyncContext,
    fieldKey: string,
    page: number = 1,
    limit: number = 20
  ) {
    try {
      return await this.relationService.getRelatedRecords(
        context.applicationId,
        context.directoryId,
        context.recordId,
        fieldKey,
        page,
        limit
      )
    } catch (error) {
      console.error('获取关联记录失败:', error)
      return {
        records: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      }
    }
  }
}
