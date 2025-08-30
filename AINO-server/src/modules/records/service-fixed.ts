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

export class RecordsServiceFixed {
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

  // 🔥 关键修复：生成目录特定的tenant_id
  private generateDirectoryTenantId(dirId: string): string {
    // 使用目录ID作为tenant_id的基础，确保每个目录有独立的数据空间
    return `dir_${dirId.replace(/-/g, '_')}`
  }

  // 🔥 关键修复：获取目录定义
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

  // 🔥 关键修复：获取字段定义
  private async getFieldDefs(dirId: string) {
    const dirDef = await this.getDirectoryDef(dirId)
    if (!dirDef) {
      return []
    }
    
    return await db.select().from(fieldDefs).where(eq(fieldDefs.directoryId, dirDef.id))
  }

  // 验证和转换记录数据
  private async validateAndTransformRecord(record: Record<string, any>, dirId: string) {
    console.log('🔍 开始验证记录:', { record, dirId })
    
    const fieldDefsData = await this.getFieldDefs(dirId)
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

  // 🔥 关键修复：列表查询 - 使用目录特定的tenant_id
  async listRecords(dirId: string, query: ListQuery) {
    console.log('🔍 获取记录列表:', { dirId, query })
    
    try {
      // 获取目录信息
      const directory = await this.getDirectoryById(dirId)
      if (!directory) {
        throw new Error(`目录不存在: ${dirId}`)
      }
      
      // 🔥 关键修复：使用目录特定的tenant_id
      const tenantId = this.generateDirectoryTenantId(dirId)
      console.log('🔍 使用tenant_id:', tenantId)
      
      // 获取目录定义
      const dirDef = await this.getDirectoryDef(dirId)
      if (!dirDef) {
        throw new Error(`目录定义不存在: ${dirId}`)
      }
      
      console.log('🔍 目录信息:', { directory, dirDef, tenantId })
      
      // 根据目录类型选择表
      const table = this.getTableByDir(directory.name.toLowerCase())
      
      // 构建查询条件
      const conditions = [
        eq(table.tenantId, tenantId), // 🔥 关键修复：使用目录特定的tenant_id
        sql`${table.deletedAt} IS NULL`
      ]
      
      // 搜索条件
      if (query.search) {
        conditions.push(
          sql`${table.props}::text ILIKE ${'%' + query.search + '%'}`
        )
      }
      
      // 排序
      const orderBy = query.sort 
        ? query.order === 'asc' 
          ? asc(sql`${table.props}->>${query.sort}`)
          : desc(sql`${table.props}->>${query.sort}`)
        : desc(table.createdAt)
      
      // 分页
      const offset = (query.page - 1) * query.limit
      
      // 执行查询
      const [records, totalResult] = await Promise.all([
        db.select()
          .from(table)
          .where(and(...conditions))
          .orderBy(orderBy)
          .limit(query.limit)
          .offset(offset),
        
        db.select({ count: sql<number>`count(*)` })
          .from(table)
          .where(and(...conditions))
      ])
      
      const total = totalResult[0]?.count || 0
      const totalPages = Math.ceil(total / query.limit)
      
      console.log('🔍 查询结果:', { records: records.length, total, totalPages })
      
      return {
        data: records,
        pagination: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages
        }
      }
    } catch (error) {
      console.error('❌ 获取记录列表失败:', error)
      throw error
    }
  }

  // 🔥 关键修复：创建记录 - 使用目录特定的tenant_id
  async createRecord(dirId: string, props: Record<string, any>, userId?: string) {
    console.log('🔍 创建记录:', { dirId, props, userId })
    
    try {
      // 获取目录信息
      const directory = await this.getDirectoryById(dirId)
      if (!directory) {
        throw new Error(`目录不存在: ${dirId}`)
      }
      
      // 🔥 关键修复：使用目录特定的tenant_id
      const tenantId = this.generateDirectoryTenantId(dirId)
      console.log('🔍 使用tenant_id:', tenantId)
      
      // 验证和转换数据
      const validatedProps = await this.validateAndTransformRecord(props, dirId)
      
      // 根据目录类型选择表
      const table = this.getTableByDir(directory.name.toLowerCase())
      
      const [record] = await db.insert(table).values({
        tenantId: tenantId, // 🔥 关键修复：使用目录特定的tenant_id
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

  // 🔥 关键修复：更新记录 - 使用目录特定的tenant_id
  async updateRecord(dirId: string, id: string, props: Record<string, any>, version?: number, userId?: string) {
    console.log('🔍 更新记录:', { dirId, id, props, version, userId })
    
    try {
      // 获取目录信息
      const directory = await this.getDirectoryById(dirId)
      if (!directory) {
        throw new Error(`目录不存在: ${dirId}`)
      }
      
      // 🔥 关键修复：使用目录特定的tenant_id
      const tenantId = this.generateDirectoryTenantId(dirId)
      console.log('🔍 使用tenant_id:', tenantId)
      
      // 根据目录类型选择表
      const table = this.getTableByDir(directory.name.toLowerCase())
      
      // 验证和转换数据
      const validatedProps = await this.validateAndTransformRecord(props, dirId)
      
      // 构建更新条件
      const conditions = [
        eq(table.id, id),
        eq(table.tenantId, tenantId) // 🔥 关键修复：使用目录特定的tenant_id
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
      
      console.log('🔍 更新结果:', record)
      return record || null
    } catch (error) {
      console.error('❌ 更新记录失败:', error)
      throw error
    }
  }

  // 🔥 关键修复：删除记录 - 使用目录特定的tenant_id
  async deleteRecord(dirId: string, id: string, userId: string) {
    console.log('🔍 删除记录:', { dirId, id, userId })
    
    try {
      // 获取目录信息
      const directory = await this.getDirectoryById(dirId)
      if (!directory) {
        throw new Error(`目录不存在: ${dirId}`)
      }
      
      // 🔥 关键修复：使用目录特定的tenant_id
      const tenantId = this.generateDirectoryTenantId(dirId)
      console.log('🔍 使用tenant_id:', tenantId)
      
      // 根据目录类型选择表
      const table = this.getTableByDir(directory.name.toLowerCase())
      
      const [record] = await db.update(table)
        .set({
          deletedAt: new Date(),
          updatedBy: userId,
          updatedAt: new Date(),
        })
        .where(and(
          eq(table.id, id),
          eq(table.tenantId, tenantId) // 🔥 关键修复：使用目录特定的tenant_id
        ))
        .returning()
      
      console.log('🔍 删除结果:', record)
      return !!record
    } catch (error) {
      console.error('❌ 删除记录失败:', error)
      throw error
    }
  }

  // 🔥 关键修复：批量删除记录 - 使用目录特定的tenant_id
  async bulkDeleteRecords(dirId: string, recordIds: string[], userId: string) {
    console.log('🔍 批量删除记录:', { dirId, recordIds, userId })
    
    try {
      // 获取目录信息
      const directory = await this.getDirectoryById(dirId)
      if (!directory) {
        throw new Error(`目录不存在: ${dirId}`)
      }
      
      // 🔥 关键修复：使用目录特定的tenant_id
      const tenantId = this.generateDirectoryTenantId(dirId)
      console.log('🔍 使用tenant_id:', tenantId)
      
      // 根据目录类型选择表
      const table = this.getTableByDir(directory.name.toLowerCase())
      
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
              eq(table.tenantId, tenantId) // 🔥 关键修复：使用目录特定的tenant_id
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
      
      console.log('🔍 批量删除结果:', results)
      return results
    } catch (error) {
      console.error('❌ 批量删除记录失败:', error)
      throw error
    }
  }

  // 🔥 关键修复：获取单个记录 - 使用目录特定的tenant_id
  async getRecord(dirId: string, id: string) {
    console.log('🔍 获取单个记录:', { dirId, id })
    
    try {
      // 获取目录信息
      const directory = await this.getDirectoryById(dirId)
      if (!directory) {
        throw new Error(`目录不存在: ${dirId}`)
      }
      
      // 🔥 关键修复：使用目录特定的tenant_id
      const tenantId = this.generateDirectoryTenantId(dirId)
      console.log('🔍 使用tenant_id:', tenantId)
      
      // 根据目录类型选择表
      const table = this.getTableByDir(directory.name.toLowerCase())
      
      const [record] = await db.select()
        .from(table)
        .where(and(
          eq(table.id, id),
          eq(table.tenantId, tenantId), // 🔥 关键修复：使用目录特定的tenant_id
          sql`${table.deletedAt} IS NULL`
        ))
        .limit(1)
      
      console.log('🔍 查询结果:', record)
      return record || null
    } catch (error) {
      console.error('❌ 获取记录失败:', error)
      throw error
    }
  }
}
