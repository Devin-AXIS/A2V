import { eq, and, desc, asc, sql } from 'drizzle-orm'
import { db } from '../../db'
import { fieldDefs, directoryDefs } from '../../db/schema'
import type { FieldDef } from '../../lib/processors'

export interface ListFieldDefsQuery {
  directoryId?: string
  page: number
  limit: number
}

export interface CreateFieldDefData {
  directoryId: string
  key: string
  kind: 'primitive' | 'composite' | 'relation' | 'lookup' | 'computed'
  type: string
  schema?: any
  relation?: any
  lookup?: any
  computed?: any
  validators?: any
  readRoles?: string[]
  writeRoles?: string[]
  required?: boolean

}

export interface UpdateFieldDefData extends Partial<CreateFieldDefData> {
  directoryId?: never // 不允许更新目录ID
}

export class FieldDefsService {
  // 创建反向关联字段
  private async createReverseRelationField(params: {
    sourceField: any
    targetDirId: string
    reverseFieldKey: string
    relationType: string
    onDelete: string
  }) {
    const { sourceField, targetDirId, reverseFieldKey, relationType, onDelete } = params
    
    console.log('🔍 开始创建反向关联字段:', {
      sourceFieldKey: sourceField.key,
      sourceDirectoryId: sourceField.directoryId,
      targetDirId,
      reverseFieldKey
    })
    
    // 首先通过目录ID找到对应的目录定义ID
    const [targetDirectoryDef] = await db.select()
      .from(directoryDefs)
      .where(eq(directoryDefs.directoryId, targetDirId))
      .limit(1)
    
    if (!targetDirectoryDef) {
      console.error('❌ 找不到目标目录定义:', targetDirId)
      throw new Error(`目标目录定义不存在: ${targetDirId}`)
    }
    
    console.log('✅ 找到目标目录定义:', {
      directoryId: targetDirId,
      directoryDefId: targetDirectoryDef.id,
      title: targetDirectoryDef.title
    })
    
    // 检查反向字段是否已存在
    const existingReverseField = await db.select()
      .from(fieldDefs)
      .where(and(
        eq(fieldDefs.directoryId, targetDirectoryDef.id),
        eq(fieldDefs.key, reverseFieldKey)
      ))
      .limit(1)
    
    if (existingReverseField[0]) {
      console.log(`反向关联字段 "${reverseFieldKey}" 已存在，跳过创建`)
      return
    }
    
    // 确定反向字段的类型
    const reverseType = relationType === 'relation_one' ? 'relation_many' : 'relation_one'
    
    // 创建反向关联字段
    const [reverseField] = await db.insert(fieldDefs)
      .values({
        directoryId: targetDirectoryDef.id, // 使用目录定义ID，不是目录ID
        key: reverseFieldKey,
        kind: 'relation',
        type: reverseType,
        schema: {
          label: `关联到 ${sourceField.key}`,
          description: `自动生成的反向关联字段，关联到 ${sourceField.key}`,
        },
        relation: {
          targetDirId: sourceField.directoryId,
          mode: reverseType === 'relation_one' ? 'one' : 'many',
          displayFieldKey: null,
          bidirectional: true,
          reverseFieldKey: sourceField.key,
          onDelete: onDelete
        },
        validators: {},
        readRoles: ['admin', 'member'],
        writeRoles: ['admin'],
        required: false,
      })
      .returning()
    
    console.log(`✅ 成功创建反向关联字段: ${reverseFieldKey} -> ${sourceField.key}`)
    return reverseField
  }

  // 获取字段定义列表
  async listFieldDefs(query: ListFieldDefsQuery) {
    const { directoryId, page, limit } = query
    
    let whereClause = undefined
    if (directoryId) {
      whereClause = eq(fieldDefs.directoryId, directoryId)
    }
    
    const offset = (page - 1) * limit
    
    const records = await db.select()
      .from(fieldDefs)
      .where(whereClause)
      .orderBy(asc(fieldDefs.key))
      .limit(limit)
      .offset(offset)
    
    // 查询总数
    const [{ count }] = await db.select({ count: sql<number>`count(*)` })
      .from(fieldDefs)
      .where(whereClause)
    
    return {
      data: records as FieldDef[],
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    }
  }

  // 获取单个字段定义
  async getFieldDef(id: string) {
    const records = await db.select()
      .from(fieldDefs)
      .where(eq(fieldDefs.id, id))
      .limit(1)
    
    return records[0] as FieldDef || null
  }

  // 创建字段定义
  async createFieldDef(data: CreateFieldDefData) {
    // 验证目录定义是否存在
    const [directory] = await db.select()
      .from(directoryDefs)
      .where(eq(directoryDefs.id, data.directoryId))
      .limit(1)
    
    if (!directory) {
      throw new Error('目录定义不存在')
    }
    
    // 检查字段key是否已存在
    const existingField = await db.select()
      .from(fieldDefs)
      .where(and(
        eq(fieldDefs.directoryId, data.directoryId),
        eq(fieldDefs.key, data.key)
      ))
      .limit(1)
    
    if (existingField[0]) {
      throw new Error(`字段key "${data.key}" 已存在`)
    }
    
    // 创建字段定义
    const [newField] = await db.insert(fieldDefs)
      .values({
        directoryId: data.directoryId,
        key: data.key,
        kind: data.kind,
        type: data.type,
        schema: data.schema,
        relation: data.relation,
        lookup: data.lookup,
        computed: data.computed,
        validators: data.validators,
        readRoles: data.readRoles || ['admin', 'member'],
        writeRoles: data.writeRoles || ['admin'],
        required: data.required || false,

      })
      .returning()
    
    // 如果是双向关联字段，在目标目录中创建反向关联字段
    console.log('🔍 检查双向关联配置:', {
      bidirectional: data.relation?.bidirectional,
      targetDirId: data.relation?.targetDirId,
      reverseFieldKey: data.relation?.reverseFieldKey,
      relation: data.relation
    })
    
    if (data.relation?.bidirectional && data.relation?.targetDirId && data.relation?.reverseFieldKey) {
      console.log('✅ 开始创建反向关联字段:', {
        sourceFieldKey: newField.key,
        targetDirId: data.relation.targetDirId,
        reverseFieldKey: data.relation.reverseFieldKey,
        relationType: data.type
      })
      
      try {
        await this.createReverseRelationField({
          sourceField: newField,
          targetDirId: data.relation.targetDirId,
          reverseFieldKey: data.relation.reverseFieldKey,
          relationType: data.type,
          onDelete: data.relation.onDelete || 'restrict'
        })
        console.log('✅ 反向关联字段创建成功')
      } catch (error) {
        console.error('❌ 创建反向关联字段失败:', error)
        // 不抛出错误，避免影响主字段创建
      }
    } else {
      console.log('⏭️ 跳过反向关联字段创建:', {
        reason: !data.relation?.bidirectional ? '非双向关联' : 
                !data.relation?.targetDirId ? '缺少目标目录ID' : 
                !data.relation?.reverseFieldKey ? '缺少反向字段名' : '未知原因'
      })
    }
    
    return newField as FieldDef
  }

  // 更新字段定义
  async updateFieldDef(id: string, data: UpdateFieldDefData) {
    // 检查字段是否存在
    const existingField = await this.getFieldDef(id)
    if (!existingField) {
      return null
    }
    

    
    // 如果更新key，检查是否与其他字段冲突
    if (data.key && data.key !== existingField.key) {
      const conflictingField = await db.select()
        .from(fieldDefs)
        .where(and(
          eq(fieldDefs.directoryId, existingField.directoryId),
          eq(fieldDefs.key, data.key),
          sql`${fieldDefs.id} != ${id}`
        ))
        .limit(1)
      
      if (conflictingField[0]) {
        throw new Error(`字段key "${data.key}" 已存在`)
      }
    }
    
    // 更新字段定义
    const [updatedField] = await db.update(fieldDefs)
      .set({
        key: data.key,
        kind: data.kind,
        type: data.type,
        schema: data.schema,
        relation: data.relation,
        lookup: data.lookup,
        computed: data.computed,
        validators: data.validators,
        readRoles: data.readRoles,
        writeRoles: data.writeRoles,
        required: data.required,
      })
      .where(eq(fieldDefs.id, id))
      .returning()
    
    return updatedField as FieldDef
  }

  // 删除字段定义
  async deleteFieldDef(id: string) {
    // 检查字段是否存在
    const existingField = await this.getFieldDef(id)
    if (!existingField) {
      return false
    }
    
    // 删除字段定义
    await db.delete(fieldDefs)
      .where(eq(fieldDefs.id, id))
    
    return true
  }

  // 根据目录ID获取所有字段定义
  async getFieldDefsByDirectoryId(directoryId: string): Promise<FieldDef[]> {
    const records = await db.select()
      .from(fieldDefs)
      .where(eq(fieldDefs.directoryId, directoryId))
      .orderBy(asc(fieldDefs.key))
    
    return records as FieldDef[]
  }



  // 验证字段定义数据
  validateFieldDefData(data: CreateFieldDefData): string[] {
    const errors: string[] = []
    
    if (!data.key || data.key.trim() === '') {
      errors.push('字段key不能为空')
    } else if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(data.key)) {
      errors.push('字段key只能包含字母、数字和下划线，且必须以字母或下划线开头')
    }
    
    if (!data.kind || !['primitive', 'composite', 'relation', 'lookup', 'computed'].includes(data.kind)) {
      errors.push('字段kind必须是有效的类型')
    }
    
    if (!data.type || data.type.trim() === '') {
      errors.push('字段type不能为空')
    }
    
    if (!data.directoryId || data.directoryId.trim() === '') {
      errors.push('目录ID不能为空')
    }
    
    return errors
  }
}
