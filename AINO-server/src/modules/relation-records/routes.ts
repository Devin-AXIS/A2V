import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { RelationRecordsService } from "./service"
import {
  CreateRelationRequest,
  BatchCreateRelationRequest,
  DeleteRelationRequest,
  GetRelationsRequest,
  RelationsListResponse,
  RelatedRecordsListResponse
} from "./dto"

const app = new Hono()
const service = new RelationRecordsService()

// 创建关联关系
app.post("/", zValidator("json", CreateRelationRequest), async (c) => {
  try {
    const data = c.req.valid("json")
    const relation = await service.createRelation(data)
    return c.json({ success: true, data: relation })
  } catch (error) {
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "创建关联关系失败" 
    }, 400)
  }
})

// 批量创建关联关系
app.post("/batch", zValidator("json", BatchCreateRelationRequest), async (c) => {
  try {
    const data = c.req.valid("json")
    const relations = await service.batchCreateRelations(data)
    return c.json({ success: true, data: relations })
  } catch (error) {
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "批量创建关联关系失败" 
    }, 400)
  }
})

// 删除关联关系
app.delete("/", zValidator("json", DeleteRelationRequest), async (c) => {
  try {
    const data = c.req.valid("json")
    const result = await service.deleteRelation(data)
    return c.json({ success: true, data: result })
  } catch (error) {
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "删除关联关系失败" 
    }, 400)
  }
})

// 删除记录的所有关联关系
app.delete("/record/:applicationId/:directoryId/:recordId", async (c) => {
  try {
    const applicationId = c.req.param("applicationId")
    const directoryId = c.req.param("directoryId")
    const recordId = c.req.param("recordId")
    
    const result = await service.deleteRecordRelations(applicationId, directoryId, recordId)
    return c.json({ success: true, data: result })
  } catch (error) {
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "删除记录关联关系失败" 
    }, 400)
  }
})

// 删除字段的所有关联关系
app.delete("/field/:applicationId/:directoryId/:recordId/:fieldKey", async (c) => {
  try {
    const applicationId = c.req.param("applicationId")
    const directoryId = c.req.param("directoryId")
    const recordId = c.req.param("recordId")
    const fieldKey = c.req.param("fieldKey")
    
    const result = await service.deleteFieldRelations(applicationId, directoryId, recordId, fieldKey)
    return c.json({ success: true, data: result })
  } catch (error) {
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "删除字段关联关系失败" 
    }, 400)
  }
})

// 查询关联关系
app.get("/", zValidator("query", GetRelationsRequest), async (c) => {
  try {
    const params = c.req.valid("query")
    const result = await service.getRelations(params)
    return c.json({ success: true, data: result })
  } catch (error) {
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "查询关联关系失败" 
    }, 400)
  }
})

// 查询关联的记录
app.get("/records/:applicationId/:directoryId/:recordId/:fieldKey", async (c) => {
  try {
    const applicationId = c.req.param("applicationId")
    const directoryId = c.req.param("directoryId")
    const recordId = c.req.param("recordId")
    const fieldKey = c.req.param("fieldKey")
    const page = Number(c.req.query("page") || "1")
    const limit = Number(c.req.query("limit") || "20")
    
    const result = await service.getRelatedRecords(applicationId, directoryId, recordId, fieldKey, page, limit)
    return c.json({ success: true, data: result })
  } catch (error) {
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "查询关联记录失败" 
    }, 400)
  }
})

// 同步关联关系
app.post("/sync", async (c) => {
  try {
    const body = await c.req.json()
    const { applicationId, directoryId, recordId, fieldKey, newValue, fieldConfig } = body
    
    if (!applicationId || !directoryId || !recordId || !fieldKey) {
      return c.json({ 
        success: false, 
        error: "缺少必要参数" 
      }, 400)
    }
    
    const result = await service.syncRelations(applicationId, directoryId, recordId, fieldKey, newValue, fieldConfig)
    return c.json({ success: true, data: result })
  } catch (error) {
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "同步关联关系失败" 
    }, 400)
  }
})

export default app
