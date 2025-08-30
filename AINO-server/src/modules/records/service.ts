import { eq, and, desc, asc, sql, like, or } from 'drizzle-orm'
import { db } from '../../db'
import { dirUsers, dirJobs, directoryDefs, fieldDefs, directories } from '../../../drizzle/schema'
import { fieldProcessorManager, FieldDef } from '../../lib/field-processors'

export interface ListQuery {
  page: number
  limit: number
  search?: string
  sort?: string
  order: 'asc' | 'desc'
  filter?: string
}

export interface ListResult<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export class RecordsService {
  // 通过目录UUID获取目录信息
  private async getDirectoryById(dirId: string) {
    const dir = await db.select().from(directories).where(eq(directories.id, dirId)).limit(1)
    return dir[0]
  }

  // 获取目录表映射
  private getTableByDir(dir: string) {
    switch (dir) {
      case 'users':
        return dirUsers
      case 'jobs':
        return dirJobs
      default:
        throw new Error(`不支持的目录: ${dir}`)
    }
  }

  // 获取目录定义
  private async getDirectoryDef(dirId: string) {
    // 先通过目录ID获取目录信息
    const directory = await this.getDirectoryById(dirId)
    if (!directory) {
      throw new Error(`目录不存在: ${dirId}`)
    }
    
    // 通过目录ID获取目录定义
    const def = await db.select().from(directoryDefs).where(eq(directoryDefs.directoryId, dirId)).limit(1)
    return def[0]
  }

  // 获取字段定义
  private async getFieldDefs(dirId: string) {
    const dirDef = await this.getDirectoryDef(dirId)
    if (!dirDef) {
      return []
    }
    
    return await db.select().from(fieldDefs).where(eq(fieldDefs.directoryId, dirDef.id))
  }

  // 验证和转换记录数据
  private async validateAndTransformRecord(record: Record<string, any>, dir: string) {
    console.log('🔍 开始验证记录:', { record, dir })
    
    const fieldDefsData = await this.getFieldDefs(dir)
    console.log('🔍 获取到字段定义:', fieldDefsData.length, '个字段')
    
    // 转换为FieldDef类型
    const fieldDefs: FieldDef[] = fieldDefsData.map(field => ({
      id: field.id,
      key: field.key,
      kind: field.kind as any,
      type: field.type as any,
      schema: field.schema,
      relation: field.relation,
      lookup: field.lookup,
      computed: field.computed,
      validators: field.validators,
      readRoles: field.readRoles || [],
      writeRoles: field.writeRoles || [],
      required: field.required || false
    }))
    
    // 只验证用户实际提供的字段
    const providedFields = fieldDefs.filter(field => record.hasOwnProperty(field.key))
    console.log('🔍 用户提供的字段:', providedFields.map(f => f.key))
    
    // 验证记录
    const validation = fieldProcessorManager.validateRecord(record, providedFields)
    console.log('🔍 验证结果:', validation)
    
    if (!validation.valid) {
      throw new Error(`数据验证失败: ${JSON.stringify(validation.errors)}`)
    }
    
    // 转换记录
    const transformed = fieldProcessorManager.transformRecord(record, providedFields)
    console.log('🔍 转换后的数据:', transformed)
    
    return transformed
  }

  // 列表查询
  async listRecords(dirId: string, query: ListQuery) {
    console.log('🔍 获取记录列表:', { dirId, query })
    
    try {
      // 获取目录信息
      const directory = await this.getDirectoryById(dirId)
      if (!directory) {
        throw new Error(`目录不存在: ${dirId}`)
      }
      
      // 获取目录定义
      const dirDef = await this.getDirectoryDef(dirId)
      if (!dirDef) {
        throw new Error(`目录定义不存在: ${dirId}`)
      }
      
      console.log('🔍 目录信息:', { directory, dirDef })
      
      // 暂时返回mock数据，因为我们需要先解决表结构问题
      const mockData = [
        {
          id: 'mock-record-1',
          props: {
            name: '测试记录1',
            description: '这是一个测试记录',
            status: 'active'
          },
          version: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'system',
          updatedBy: 'system'
        },
        {
          id: 'mock-record-2', 
          props: {
            name: '测试记录2',
            description: '这是另一个测试记录',
            status: 'inactive'
          },
          version: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'system',
          updatedBy: 'system'
        }
      ]
      
      return {
        data: mockData,
        pagination: {
          page: query.page,
          limit: query.limit,
          total: mockData.length,
          totalPages: 1
        }
      }
    } catch (error) {
      console.error('获取记录列表失败:', error)
      throw error
    }
  }

  // 获取单个记录
  async getRecord(dir: string, id: string) {
    const table = this.getTableByDir(dir)
    
    const records = await db.select()
      .from(table)
      .where(and(
        eq(table.id, id),
        eq(table.tenantId, dir) // 使用目录ID作为tenant_id
      ))
      .limit(1)
    
    return records[0] || null
  }

  // 创建记录
  async createRecord(dir: string, props: Record<string, any>, userId: string) {
    try {
      console.log('🔍 创建记录参数:', { dir, props, userId })
      
      const table = this.getTableByDir(dir)
      console.log('🔍 获取到表:', table)
      
      // 验证和转换数据
      const validatedProps = await this.validateAndTransformRecord(props, dir)
      console.log('🔍 验证后的数据:', validatedProps)
      
      const [record] = await db.insert(table).values({
        tenantId: dir, // 使用目录ID作为tenant_id
        props: validatedProps,
        createdBy: userId,
        updatedBy: userId,
      }).returning()
      
      console.log('🔍 创建成功:', record)
      return record
    } catch (error) {
      console.error('❌ 创建记录失败:', error)
      throw error
    }
  }

  // 更新记录
  async updateRecord(dir: string, id: string, props: Record<string, any>, version?: number, userId?: string) {
    const table = this.getTableByDir(dir)
    
    // 验证和转换数据
    const validatedProps = await this.validateAndTransformRecord(props, dir)
    
    // 构建更新条件
    const conditions = [
      eq(table.id, id),
      eq(table.tenantId, dir) // 使用目录ID作为tenant_id
    ]
    
    // 乐观锁检查
    if (version !== undefined) {
      conditions.push(eq(table.version, version))
    }
    
    const [record] = await db.update(table)
      .set({
        props: validatedProps,
        version: sql`${table.version} + 1`,
        updatedBy: userId,
        updatedAt: new Date(),
      })
      .where(and(...conditions))
      .returning()
    
    return record || null
  }

  // 删除记录
  async deleteRecord(dir: string, id: string, userId: string) {
    const table = this.getTableByDir(dir)
    
    const [record] = await db.update(table)
      .set({
        deletedAt: new Date(),
        updatedBy: userId,
        updatedAt: new Date(),
      })
      .where(and(
        eq(table.id, id),
        eq(table.tenantId, dir) // 使用目录ID作为tenant_id
      ))
      .returning()
    
    return !!record
  }

  // 批量删除记录
  async bulkDeleteRecords(dir: string, recordIds: string[], userId: string) {
    const table = this.getTableByDir(dir)
    const results = []
    
    for (const recordId of recordIds) {
      try {
        const [record] = await db.update(table)
          .set({
            deletedAt: new Date(),
            updatedBy: userId,
            updatedAt: new Date(),
          })
          .where(and(
            eq(table.id, recordId),
            eq(table.tenantId, dir) // 使用目录ID作为tenant_id
          ))
          .returning()
        
        results.push({ 
          recordId, 
          success: !!record,
          error: record ? null : '记录不存在'
        })
      } catch (error) {
        results.push({ 
          recordId, 
          success: false,
          error: error instanceof Error ? error.message : '删除失败'
        })
      }
    }
    
    return results
  }
}
