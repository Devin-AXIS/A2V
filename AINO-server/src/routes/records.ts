import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { and, eq, desc, sql } from 'drizzle-orm'
import { db } from '../db'
import { dirUsers, directories, directoryDefs, fieldDefs } from '../../drizzle/schema'
import { getDirectoryMeta } from '../lib/meta'
import { zodFromFields, zodFromFieldsPartial } from '../lib/zod-from-fields'
import { runSerialize } from '../lib/processors'
import { buildOrderBy, projectProps, buildJsonbWhere } from '../lib/jsonb'
import { mockRequireAuthMiddleware } from '../middleware/auth'
import { fieldProcessorManager } from '../lib/field-processors'

// 定义Context类型
type AppContext = {
  Variables: {
    tenantId: string
    user: any
  }
}

const records = new Hono<AppContext>()

// 中间件
records.use('*', mockRequireAuthMiddleware)

// 查询参数验证
const listQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(50).default(20),
  sort: z.string().optional(),
  fields: z.string().optional(),
  filter: z.string().optional(),
})

// 批量删除记录验证
const bulkDeleteSchema = z.object({
  recordIds: z.array(z.string().uuid()),
})

// 获取表实例
// 通过目录UUID获取目录信息
async function getDirectoryById(dirId: string) {
  // 验证UUID格式
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(dirId)) {
    console.log('🔍 目录ID不是有效的UUID格式，返回null:', dirId)
    return null
  }

  const dir = await db.select().from(directories).where(eq(directories.id, dirId)).limit(1)
  return dir[0]
}

// 获取目录对应的表（暂时返回mock数据）
function tableFor(dir: string) {
  // 暂时返回dirUsers作为默认表，实际应该根据目录配置动态选择
  // 不再抛出错误，直接返回默认表
  return dirUsers
}

// 列表查询（按目录隔离）
records.get('/:dir', zValidator('query', listQuerySchema), async (c) => {
  const dirId = c.req.param('dir')
  const query = c.req.valid('query')

  try {
    console.log('🔍 获取记录列表:', { dirId, query })

    // 获取目录信息
    const directory = await getDirectoryById(dirId)
    if (!directory) {
      console.log('🔍 目录不存在或ID格式无效，返回空数据:', dirId)
      return c.json({
        success: true,
        data: []
      })
    }

    // 获取表实例
    const t = tableFor(dirId)
    const user = c.get('user') as any
    const tenantId = user?.id || 'f09ebe12-f517-42a2-b41a-7092438b79c3'

    // 计算偏移量
    const offset = (query.page - 1) * query.pageSize

    // 构建查询条件
    const whereConditions = [
      eq(t.tenantId, tenantId),
      sql`${t.deletedAt} is null`,
      // 目录隔离：仅返回当前目录的记录
      sql`(${t.props} ->> '__dirId') = ${dirId}`
    ]

    // 如果有过滤条件，添加到where条件中
    if (query.filter) {
      try {
        const filterObj = JSON.parse(query.filter)
        // 这里可以根据需要添加JSONB字段的过滤逻辑
        console.log('🔍 过滤条件:', filterObj)
      } catch (e) {
        console.log('🔍 过滤条件解析失败，忽略:', query.filter)
      }
    }

    // 构建排序
    let orderBy = desc(t.createdAt) // 默认按创建时间降序
    if (query.sort) {
      try {
        const sortObj = JSON.parse(query.sort)
        if (sortObj.field && sortObj.order) {
          // 这里可以根据需要添加动态排序逻辑
          console.log('🔍 排序条件:', sortObj)
        }
      } catch (e) {
        console.log('🔍 排序条件解析失败，使用默认排序:', query.sort)
      }
    }

    // 查询记录总数
    const [totalResult] = await db.select({ count: sql<number>`count(*)` })
      .from(t)
      .where(and(...whereConditions))

    const total = totalResult.count

    // 查询记录列表
    const rows = await db.select({
      id: t.id,
      version: t.version,
      props: t.props,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      createdBy: t.createdBy,
      updatedBy: t.updatedBy
    })
      .from(t)
      .where(and(...whereConditions))
      .orderBy(orderBy)
      .limit(query.pageSize)
      .offset(offset)

    // 格式化返回数据
    const data = rows.map(row => ({
      id: row.id,
      version: row.version,
      ...(row.props as Record<string, any>),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      createdBy: row.createdBy,
      updatedBy: row.updatedBy
    }))

    // 前端期望直接返回记录数组，不包含pagination信息
    return c.json({
      success: true,
      data
    })
  } catch (error) {
    console.error('获取记录列表失败:', error)
    return c.json({ success: false, error: '获取记录列表失败' }, 500)
  }
})

// 详情查询（按目录隔离）
records.get('/:dir/:id', async (c) => {
  const dir = c.req.param('dir')
  const id = c.req.param('id')

  try {
    const t = tableFor(dir)
    const user = c.get('user') as any
    const tenantId = user?.id || 'f09ebe12-f517-42a2-b41a-7092438b79c3'

    const [row] = await db.select()
      .from(t)
      .where(and(
        eq(t.id, id),
        eq(t.tenantId, tenantId),
        sql`${t.deletedAt} is null`,
        sql`(${t.props} ->> '__dirId') = ${dir}`
      ))
      .limit(1)

    if (!row) {
      return c.json({ success: false, error: '记录不存在' }, 404)
    }

    return c.json({
      success: true,
      data: {
        id: row.id,
        version: row.version,
        ...(row.props as Record<string, any>)
      }
    })
  } catch (error) {
    console.error('获取记录详情失败:', error)
    return c.json({ success: false, error: '获取记录详情失败' }, 500)
  }
})

// 创建记录（写入目录标识）
records.post('/:dir', async (c) => {
  const dir = c.req.param('dir')
  const input = await c.req.json()

  try {
    console.log('🔍 创建记录请求:', { dir, input })
    console.log('🔍 POST路由开始执行 - 这是关键调试点')

    // 验证目录ID格式
    console.log('🔍 验证目录ID格式:', dir)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(dir)) {
      console.log('❌ 目录ID格式无效')
      return c.json({ success: false, error: '目录ID格式无效' }, 400)
    }
    console.log('✅ 目录ID格式验证通过')

    // 获取目录信息
    console.log('🔍 获取目录信息:', dir)
    const directory = await getDirectoryById(dir)
    if (!directory) {
      console.log('❌ 目录不存在')
      return c.json({ success: false, error: '目录不存在' }, 404)
    }
    console.log('✅ 目录信息获取成功')

    const t = tableFor(dir)
    const user = c.get('user') as any
    const tenantId = user?.id || 'f09ebe12-f517-42a2-b41a-7092438b79c3'

    // 获取字段定义进行验证
    // 首先通过directories表找到对应的directoryDefs
    const directoryDef = await db.select().from(directoryDefs).where(eq(directoryDefs.directoryId, dir)).limit(1)
    let fieldDefinitions = []

    if (directoryDef[0]) {
      const fieldDefsResult = await db.select().from(fieldDefs).where(eq(fieldDefs.directoryId, directoryDef[0].id))
      fieldDefinitions = fieldDefsResult.map(fd => ({
        id: fd.id,
        key: fd.key,
        kind: fd.kind,
        type: fd.type,
        schema: fd.schema,
        relation: fd.relation,
        lookup: fd.lookup,
        computed: fd.computed,
        validators: fd.validators,
        readRoles: fd.readRoles || [],
        writeRoles: fd.writeRoles || [],
        required: fd.required
      }))
    }

    // 如果有字段定义，进行验证
    if (fieldDefinitions.length > 0) {
      console.log('🔍 字段定义数量:', fieldDefinitions.length)
      console.log('🔍 字段定义详情:', fieldDefinitions.map(fd => ({ key: fd.key, type: fd.type })))

      const propsData = input.props || input
      console.log('🔍 输入数据:', propsData)

      // 特别检查g_hcj1字段
      const g_hcj1_field = fieldDefinitions.find(fd => fd.key === 'g_hcj1')
      if (g_hcj1_field) {
        console.log('🔍 g_hcj1字段详情:', {
          key: g_hcj1_field.key,
          type: g_hcj1_field.type,
          typeOf: typeof g_hcj1_field.type,
          typeEquals: g_hcj1_field.type === 'experience'
        })

        // 测试单个字段验证
        const g_hcj1_value = propsData.g_hcj1
        console.log('🔍 g_hcj1数据:', g_hcj1_value)

        const singleValidation = fieldProcessorManager.validateField(g_hcj1_value, g_hcj1_field)
        console.log('🔍 g_hcj1单独验证结果:', singleValidation)

        // 测试处理器获取
        const processor = fieldProcessorManager.getProcessor(g_hcj1_field.type)
        console.log('🔍 g_hcj1处理器获取:', {
          exists: !!processor,
          validateType: typeof processor?.validate
        })
      }

      const validation = fieldProcessorManager.validateRecord(propsData, fieldDefinitions)
      console.log('🔍 验证结果:', validation)

      if (!validation.valid) {
        return c.json({
          success: false,
          error: '数据验证失败',
          details: validation.errors
        }, 400)
      }

      // 转换数据
      const transformedData = fieldProcessorManager.transformRecord(propsData, fieldDefinitions)
      console.log('🔍 验证和转换后的数据:', transformedData)

      // 写入目录标识，确保跨目录隔离
      const decoratedData = { ...transformedData, __dirId: dir }

      const [row] = await db.insert(t).values({
        tenantId,
        props: decoratedData
      }).returning()

      return c.json({
        success: true,
        data: {
          id: row.id,
          version: row.version,
          ...(row.props as Record<string, any>)
        }
      }, 201)
    } else {
      // 没有字段定义时，直接使用输入数据
      const propsData = input.props || input
      console.log('🔍 无字段定义，直接使用数据:', propsData)

      // 写入目录标识，确保跨目录隔离
      const decoratedData = { ...propsData, __dirId: dir }

      const [row] = await db.insert(t).values({
        tenantId,
        props: decoratedData
      }).returning()

      return c.json({
        success: true,
        data: {
          id: row.id,
          version: row.version,
          ...(row.props as Record<string, any>)
        }
      }, 201)
    }
  } catch (error) {
    console.error('创建记录失败:', error)
    return c.json({ success: false, error: '创建记录失败' }, 500)
  }
})

// 更新记录（保留目录标识并合并JSONB）
records.patch('/:dir/:id', async (c) => {
  const dir = c.req.param('dir')
  const id = c.req.param('id')
  const input = await c.req.json()

  try {
    // 验证目录ID格式
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(dir)) {
      return c.json({ success: false, error: '目录ID格式无效' }, 400)
    }

    const t = tableFor(dir)
    const user = c.get('user') as any
    const tenantId = user?.id || 'f09ebe12-f517-42a2-b41a-7092438b79c3'

    // 获取字段定义进行验证
    // 首先通过directories表找到对应的directoryDefs
    const directoryDef = await db.select().from(directoryDefs).where(eq(directoryDefs.directoryId, dir)).limit(1)
    let fieldDefinitions = []

    if (directoryDef[0]) {
      const fieldDefsResult = await db.select().from(fieldDefs).where(eq(fieldDefs.directoryId, directoryDef[0].id))
      fieldDefinitions = fieldDefsResult.map(fd => ({
        id: fd.id,
        key: fd.key,
        kind: fd.kind,
        type: fd.type,
        schema: fd.schema,
        relation: fd.relation,
        lookup: fd.lookup,
        computed: fd.computed,
        validators: fd.validators,
        readRoles: fd.readRoles || [],
        writeRoles: fd.writeRoles || [],
        required: fd.required
      }))
    }

    // 如果有字段定义，进行验证
    if (fieldDefinitions.length > 0) {
      const propsData = input.props || input

      // 更新记录时，只验证提供的字段
      const providedFields = Object.keys(propsData)
      const fieldsToValidate = fieldDefinitions.filter(fd => providedFields.includes(fd.key))

      const validation = fieldProcessorManager.validateRecord(propsData, fieldsToValidate)

      if (!validation.valid) {
        return c.json({
          success: false,
          error: '数据验证失败',
          details: validation.errors
        }, 400)
      }

      // 转换数据
      const transformedData = fieldProcessorManager.transformRecord(propsData, fieldsToValidate)
      console.log('🔍 验证和转换后的更新数据:', transformedData)

      const [row] = await db.update(t)
        .set({
          // 合并更新，保留原有props中的目录标识等
          props: sql`coalesce(${t.props}, '{}'::jsonb) || ${JSON.stringify({ ...transformedData, __dirId: dir })}::jsonb`,
          version: sql`${t.version} + 1`,
          updatedAt: sql`now()`
        })
        .where(and(
          eq(t.id, id),
          eq(t.tenantId, tenantId),
          sql`${t.deletedAt} is null`,
          sql`(${t.props} ->> '__dirId') = ${dir}`
        ))
        .returning()

      if (!row) {
        return c.json({ success: false, error: '记录不存在' }, 404)
      }

      return c.json({
        success: true,
        data: {
          id: row.id,
          version: row.version,
          ...(row.props as Record<string, any>)
        }
      })
    } else {
      // 没有字段定义时，直接使用输入数据
      const propsData = input.props || input
      console.log('🔍 无字段定义，直接更新数据:', propsData)

      const [row] = await db.update(t)
        .set({
          // 合并更新，保留原有props中的目录标识等
          props: sql`coalesce(${t.props}, '{}'::jsonb) || ${JSON.stringify({ ...propsData, __dirId: dir })}::jsonb`,
          version: sql`${t.version} + 1`,
          updatedAt: sql`now()`
        })
        .where(and(
          eq(t.id, id),
          eq(t.tenantId, tenantId),
          sql`${t.deletedAt} is null`,
          sql`(${t.props} ->> '__dirId') = ${dir}`
        ))
        .returning()

      if (!row) {
        return c.json({ success: false, error: '记录不存在' }, 404)
      }

      return c.json({
        success: true,
        data: {
          id: row.id,
          version: row.version,
          ...(row.props as Record<string, any>)
        }
      })
    }
  } catch (error) {
    console.error('更新记录失败:', error)
    return c.json({ success: false, error: '更新记录失败' }, 500)
  }
})

// 批量删除记录（按目录隔离）
records.delete('/:dir/batch', zValidator('json', bulkDeleteSchema), async (c) => {
  const dir = c.req.param('dir')
  const { recordIds } = c.req.valid('json')
  const user = c.get('user') as any

  try {
    const t = tableFor(dir)
    const tenantId = user?.id || 'f09ebe12-f517-42a2-b41a-7092438b79c3'
    const results = []

    for (const recordId of recordIds) {
      try {
        const [record] = await db.update(t)
          .set({
            deletedAt: sql`now()`,
            version: sql`${t.version} + 1`
          })
          .where(and(
            eq(t.id, recordId),
            eq(t.tenantId, tenantId),
            sql`${t.deletedAt} is null`,
            sql`(${t.props} ->> '__dirId') = ${dir}`
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

    return c.json({
      success: true,
      data: {
        deletedCount: results.filter(r => r.success).length,
        failedCount: results.filter(r => !r.success).length,
        results
      }
    })
  } catch (error) {
    console.error('批量删除记录失败:', error)
    return c.json({ success: false, error: '批量删除记录失败' }, 500)
  }
})

// 删除记录（按目录隔离）
records.delete('/:dir/:id', async (c) => {
  const dir = c.req.param('dir')
  const id = c.req.param('id')

  try {
    const t = tableFor(dir)
    const user = c.get('user') as any
    const tenantId = user?.id || 'f09ebe12-f517-42a2-b41a-7092438b79c3'

    const [row] = await db.update(t)
      .set({
        deletedAt: sql`now()`,
        version: sql`${t.version} + 1`
      })
      .where(and(
        eq(t.id, id),
        eq(t.tenantId, tenantId),
        sql`${t.deletedAt} is null`,
        sql`(${t.props} ->> '__dirId') = ${dir}`
      ))
      .returning()

    if (!row) {
      return c.json({ success: false, error: '记录不存在' }, 404)
    }

    return c.json({ success: true })
  } catch (error) {
    console.error('删除记录失败:', error)
    return c.json({ success: false, error: '删除记录失败' }, 500)
  }
})

export { records }
