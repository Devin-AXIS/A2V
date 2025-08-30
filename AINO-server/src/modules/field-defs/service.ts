import { eq, and, desc, asc, sql } from 'drizzle-orm'
import { db } from '../../db'
import { fieldDefs, directoryDefs } from '../../../drizzle/schema'
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
