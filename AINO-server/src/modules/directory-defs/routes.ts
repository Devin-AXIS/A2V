import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { DirectoryDefsService } from "./service"
import { mockRequireAuthMiddleware } from "../../middleware/auth"

const directoryDefs = new Hono()

// 中间件
directoryDefs.use('*', mockRequireAuthMiddleware)

// 查询参数验证
const listQuerySchema = z.object({
  applicationId: z.string().optional(),
  directoryId: z.string().optional(),
  status: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
})

// 创建目录定义验证
const createDirectoryDefSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  version: z.number().min(1).optional(),
  status: z.string().optional(),
  applicationId: z.string(),
  directoryId: z.string(),
})

// 更新目录定义验证
const updateDirectoryDefSchema = createDirectoryDefSchema.partial().omit({ applicationId: true, directoryId: true })

// 获取目录定义列表
directoryDefs.get('/', zValidator('query', listQuerySchema), async (c) => {
  const query = c.req.valid('query')
  
  try {
    const service = new DirectoryDefsService()
    const result = await service.listDirectoryDefs(query)
    return c.json({ success: true, ...result })
  } catch (error) {
    console.error('获取目录定义列表失败:', error)
    return c.json({ success: false, error: '获取目录定义列表失败' }, 500)
  }
})

// 获取单个目录定义
directoryDefs.get('/:id', async (c) => {
  const id = c.req.param('id')
  
  try {
    const service = new DirectoryDefsService()
    const result = await service.getDirectoryDef(id)
    return c.json({ success: true, data: result })
  } catch (error) {
    console.error('获取目录定义失败:', error)
    return c.json({ success: false, error: '获取目录定义失败' }, 500)
  }
})

// 根据slug获取目录定义
directoryDefs.get('/slug/:slug', async (c) => {
  const slug = c.req.param('slug')
  
  try {
    const service = new DirectoryDefsService()
    const result = await service.getDirectoryDefBySlug(slug)
    return c.json({ success: true, data: result })
  } catch (error) {
    console.error('获取目录定义失败:', error)
    return c.json({ success: false, error: '获取目录定义失败' }, 500)
  }
})

// 创建目录定义
directoryDefs.post('/', zValidator('json', createDirectoryDefSchema), async (c) => {
  const data = c.req.valid('json')
  
  try {
    const service = new DirectoryDefsService()
    const result = await service.createDirectoryDef(data)
    return c.json({ success: true, data: result })
  } catch (error) {
    console.error('创建目录定义失败:', error)
    return c.json({ success: false, error: '创建目录定义失败' }, 500)
  }
})

// 更新目录定义
directoryDefs.patch('/:id', zValidator('json', updateDirectoryDefSchema), async (c) => {
  const id = c.req.param('id')
  const data = c.req.valid('json')
  
  try {
    const service = new DirectoryDefsService()
    const result = await service.updateDirectoryDef(id, data)
    return c.json({ success: true, data: result })
  } catch (error) {
    console.error('更新目录定义失败:', error)
    return c.json({ success: false, error: '更新目录定义失败' }, 500)
  }
})

// 删除目录定义
directoryDefs.delete('/:id', async (c) => {
  const id = c.req.param('id')
  
  try {
    const service = new DirectoryDefsService()
    const result = await service.deleteDirectoryDef(id)
    return c.json({ success: true, data: result })
  } catch (error) {
    console.error('删除目录定义失败:', error)
    return c.json({ success: false, error: '删除目录定义失败' }, 500)
  }
})

// 根据旧目录ID获取或创建目录定义
directoryDefs.post('/by-directory/:directoryId', async (c) => {
  const directoryId = c.req.param('directoryId')
  const { applicationId } = await c.req.json()
  
  if (!applicationId) {
    return c.json({ success: false, error: '缺少applicationId参数' }, 400)
  }
  
  try {
    const service = new DirectoryDefsService()
    const result = await service.getOrCreateDirectoryDefByDirectoryId(directoryId, applicationId)
    return c.json({ success: true, data: result })
  } catch (error) {
    console.error('获取或创建目录定义失败:', error)
    return c.json({ success: false, error: '获取或创建目录定义失败' }, 500)
  }
})

export { directoryDefs }
