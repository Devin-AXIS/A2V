import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { RelationsService } from "./service"
import { createRelationSchema, updateRelationSchema, queryRelationsSchema } from "./dto"

// Mock authentication middleware (replace with real auth)
const mockRequireAuthMiddleware = async (c: any, next: any) => {
  // Mock user ID - replace with real authentication
  c.set("userId", "mock-user-id")
  c.set("tenantId", "mock-tenant-id")
  await next()
}

const relations = new Hono()

// Apply authentication middleware
relations.use('*', mockRequireAuthMiddleware)

// Create relation
relations.post('/', zValidator('json', createRelationSchema), async (c) => {
  try {
    const data = c.req.valid('json')
    const tenantId = c.get('tenantId')
    const userId = c.get('userId')

    const service = new RelationsService()
    const result = await service.createRelation({
      ...data,
      tenantId: data.tenantId || tenantId,
      createdBy: data.createdBy || userId,
    })

    if (!result.success) {
      return c.json({ success: false, error: result.error }, 400)
    }

    return c.json({ success: true, data: result.data }, 201)
  } catch (error) {
    console.error('Create relation failed:', error)
    return c.json({ success: false, error: 'Create relation failed' }, 500)
  }
})

// Get relation by ID
relations.get('/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const service = new RelationsService()
    const result = await service.getRelation(id)

    if (!result.success) {
      return c.json({ success: false, error: result.error }, 404)
    }

    return c.json({ success: true, data: result.data })
  } catch (error) {
    console.error('Get relation failed:', error)
    return c.json({ success: false, error: 'Get relation failed' }, 500)
  }
})

// Query relations
relations.get('/', zValidator('query', queryRelationsSchema), async (c) => {
  try {
    const query = c.req.valid('query')
    const tenantId = c.get('tenantId')

    const service = new RelationsService()
    const result = await service.queryRelations({
      ...query,
      tenantId: query.tenantId || tenantId,
    })

    if (!result.success) {
      return c.json({ success: false, error: result.error }, 400)
    }

    return c.json({ success: true, ...result.data })
  } catch (error) {
    console.error('Query relations failed:', error)
    return c.json({ success: false, error: 'Query relations failed' }, 500)
  }
})

// Update relation
relations.put('/:id', zValidator('json', updateRelationSchema), async (c) => {
  try {
    const id = c.req.param('id')
    const data = c.req.valid('json')
    const userId = c.get('userId')

    const service = new RelationsService()
    const result = await service.updateRelation(id, {
      ...data,
      createdBy: data.createdBy || userId,
    })

    if (!result.success) {
      return c.json({ success: false, error: result.error }, 400)
    }

    return c.json({ success: true, data: result.data })
  } catch (error) {
    console.error('Update relation failed:', error)
    return c.json({ success: false, error: 'Update relation failed' }, 500)
  }
})

// Delete relation
relations.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const service = new RelationsService()
    const result = await service.deleteRelation(id)

    if (!result.success) {
      return c.json({ success: false, error: result.error }, 404)
    }

    return c.json({ success: true })
  } catch (error) {
    console.error('Delete relation failed:', error)
    return c.json({ success: false, error: 'Delete relation failed' }, 500)
  }
})

// Get relations by URN
relations.get('/urn/:urn', async (c) => {
  try {
    const urn = c.req.param('urn')
    const service = new RelationsService()
    const result = await service.getRelationsByUrn(urn)

    if (!result.success) {
      return c.json({ success: false, error: result.error }, 400)
    }

    return c.json({ success: true, data: result.data })
  } catch (error) {
    console.error('Get relations by URN failed:', error)
    return c.json({ success: false, error: 'Get relations by URN failed' }, 500)
  }
})

export { relations }
