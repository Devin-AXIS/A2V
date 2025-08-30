import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { RecordsService } from './service'
import { mockRequireAuthMiddleware } from '../../middleware/auth'

const records = new Hono()

// 中间件
records.use('*', mockRequireAuthMiddleware)

// 查询参数验证
const listQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
  filter: z.string().optional(), // JSON string
})

// 创建记录验证
const createRecordSchema = z.object({
  props: z.record(z.string(), z.any()),
})

// 更新记录验证
const updateRecordSchema = z.object({
  props: z.record(z.string(), z.any()),
  version: z.number().optional(),
})

// 批量删除记录验证
const bulkDeleteSchema = z.object({
  recordIds: z.array(z.string().uuid()),
})

// 获取记录列表
records.get('/:dir', zValidator('query', listQuerySchema), async (c) => {
  const dir = c.req.param('dir')
  const query = c.req.valid('query')
  
  try {
    const service = new RecordsService()
    const result = await service.listRecords(dir, query)
    console.log('🔍 服务层返回结果:', JSON.stringify(result, null, 2))
    return c.json({ success: true, ...result })
  } catch (error) {
    console.error('获取记录列表失败:', error)
    return c.json({ success: false, error: '获取记录列表失败' }, 500)
  }
})

// 获取单个记录
records.get('/:dir/:id', async (c) => {
  const dir = c.req.param('dir')
  const id = c.req.param('id')
  
  try {
    const service = new RecordsService()
    const record = await service.getRecord(dir, id)
    if (!record) {
      return c.json({ success: false, error: '记录不存在' }, 404)
    }
    return c.json({ success: true, data: record })
  } catch (error) {
    console.error('获取记录失败:', error)
    return c.json({ success: false, error: '获取记录失败' }, 500)
  }
})

// 创建记录
records.post('/:dir', zValidator('json', createRecordSchema), async (c) => {
  const dir = c.req.param('dir')
  const data = c.req.valid('json')
  const user = c.get('user') as any
  
  console.log('🔍 modules/records 路由被调用:', { dir, data })
  
  try {
    const service = new RecordsService()
    const record = await service.createRecord(dir, data.props, user?.id || 'system')
    return c.json({ success: true, data: record }, 201)
  } catch (error) {
    console.error('创建记录失败:', error)
    return c.json({ success: false, error: '创建记录失败' }, 500)
  }
})

// 更新记录
records.patch('/:dir/:id', zValidator('json', updateRecordSchema), async (c) => {
  const dir = c.req.param('dir')
  const id = c.req.param('id')
  const data = c.req.valid('json')
  const user = c.get('user') as any
  
  try {
    const service = new RecordsService()
    const record = await service.updateRecord(dir, id, data.props, data.version, user?.id || 'system')
    if (!record) {
      return c.json({ success: false, error: '记录不存在或版本冲突' }, 404)
    }
    return c.json({ success: true, data: record })
  } catch (error) {
    console.error('更新记录失败:', error)
    return c.json({ success: false, error: '更新记录失败' }, 500)
  }
})

// 批量删除记录
records.delete('/:dir/batch', zValidator('json', bulkDeleteSchema), async (c) => {
  const dir = c.req.param('dir')
  const { recordIds } = c.req.valid('json')
  const user = c.get('user') as any
  
  try {
    const service = new RecordsService()
    const results = await service.bulkDeleteRecords(dir, recordIds, user?.id || 'system')
    
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

// 删除记录
records.delete('/:dir/:id', async (c) => {
  const dir = c.req.param('dir')
  const id = c.req.param('id')
  const user = c.get('user') as any
  
  try {
    const service = new RecordsService()
    const success = await service.deleteRecord(dir, id, user?.id || 'system')
    if (!success) {
      return c.json({ success: false, error: '记录不存在' }, 404)
    }
    return c.json({ success: true })
  } catch (error) {
    console.error('删除记录失败:', error)
    return c.json({ success: false, error: '删除记录失败' }, 500)
  }
})

export { records }
