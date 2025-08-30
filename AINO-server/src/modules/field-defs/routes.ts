import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { FieldDefsService } from './service'
import { mockRequireAuthMiddleware } from '../../middleware/auth'

const fieldDefs = new Hono()

// 中间件
fieldDefs.use('*', mockRequireAuthMiddleware)

// 查询参数验证
const listQuerySchema = z.object({
  directoryId: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
})

// 创建字段定义验证
const createFieldDefSchema = z.object({
  directoryId: z.string(),
  key: z.string(),
  kind: z.enum(['primitive', 'composite', 'relation', 'lookup', 'computed']),
  type: z.string(),
  schema: z.any().optional(),
  relation: z.any().optional(),
  lookup: z.any().optional(),
  computed: z.any().optional(),
  validators: z.any().optional(),
  readRoles: z.array(z.string()).default(['admin', 'member']),
  writeRoles: z.array(z.string()).default(['admin']),
  required: z.boolean().default(false),
})

// 更新字段定义验证
const updateFieldDefSchema = createFieldDefSchema.partial().omit({ directoryId: true })

// 获取字段定义列表
fieldDefs.get('/', zValidator('query', listQuerySchema), async (c) => {
  const query = c.req.valid('query')
  
  try {
    const service = new FieldDefsService()
    const result = await service.listFieldDefs(query)
    return c.json({ success: true, ...result })
  } catch (error) {
    console.error('获取字段定义列表失败:', error)
    return c.json({ success: false, error: '获取字段定义列表失败' }, 500)
  }
})

// 获取单个字段定义
fieldDefs.get('/:id', async (c) => {
  const id = c.req.param('id')
  
  try {
    const service = new FieldDefsService()
    const fieldDef = await service.getFieldDef(id)
    if (!fieldDef) {
      return c.json({ success: false, error: '字段定义不存在' }, 404)
    }
    return c.json({ success: true, data: fieldDef })
  } catch (error) {
    console.error('获取字段定义失败:', error)
    return c.json({ success: false, error: '获取字段定义失败' }, 500)
  }
})

// 创建字段定义
fieldDefs.post('/', zValidator('json', createFieldDefSchema), async (c) => {
  const data = c.req.valid('json')
  
  try {
    const service = new FieldDefsService()
    const fieldDef = await service.createFieldDef(data)
    return c.json({ success: true, data: fieldDef }, 201)
  } catch (error) {
    console.error('创建字段定义失败:', error)
    return c.json({ success: false, error: '创建字段定义失败' }, 500)
  }
})

// 更新字段定义
fieldDefs.patch('/:id', zValidator('json', updateFieldDefSchema), async (c) => {
  const id = c.req.param('id')
  const data = c.req.valid('json')
  
  try {
    const service = new FieldDefsService()
    const fieldDef = await service.updateFieldDef(id, data)
    if (!fieldDef) {
      return c.json({ success: false, error: '字段定义不存在' }, 404)
    }
    return c.json({ success: true, data: fieldDef })
  } catch (error) {
    console.error('更新字段定义失败:', error)
    return c.json({ success: false, error: '更新字段定义失败' }, 500)
  }
})

// 删除字段定义
fieldDefs.delete('/:id', async (c) => {
  const id = c.req.param('id')
  
  try {
    const service = new FieldDefsService()
    const success = await service.deleteFieldDef(id)
    if (!success) {
      return c.json({ success: false, error: '字段定义不存在' }, 404)
    }
    return c.json({ success: true })
  } catch (error) {
    console.error('删除字段定义失败:', error)
    return c.json({ success: false, error: '删除字段定义失败' }, 500)
  }
})

export { fieldDefs }
