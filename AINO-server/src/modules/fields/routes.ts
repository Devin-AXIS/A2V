import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { FieldsService } from "./service"
import { 
  CreateFieldRequest, 
  UpdateFieldRequest, 
  GetFieldsRequest,
  CreateFieldCategoryRequest,
  UpdateFieldCategoryRequest,
  FieldResponse,
  FieldsListResponse,
  FieldCategoryResponse,
  FieldCategoriesListResponse
} from "./dto"

const fields = new Hono()
const service = new FieldsService()

// 获取当前用户ID（临时实现，后续需要集成认证中间件）
function getCurrentUserId(c: any): string {
  // 临时返回测试用户ID，后续需要从JWT token中获取
  return "test-user-id"
}

// 字段相关路由
fields.get("/", zValidator("query", GetFieldsRequest), async (c) => {
  try {
    const params = c.req.valid("query")
    const userId = getCurrentUserId(c)
    
    const result = await service.getFields(params, userId)
    
    return c.json({
      success: true,
      data: result
    } as { success: true; data: FieldsListResponse })
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : "未知错误"
    }, 400)
  }
})

fields.get("/directory/:directoryId", async (c) => {
  try {
    const directoryId = c.req.param("directoryId")
    const userId = getCurrentUserId(c)
    
    const fields = await service.getFieldsByDirectory(directoryId, userId)
    
    return c.json({
      success: true,
      data: fields
    })
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : "未知错误"
    }, 400)
  }
})

fields.get("/:id", async (c) => {
  try {
    const id = c.req.param("id")
    const userId = getCurrentUserId(c)
    
    const field = await service.getField(id, userId)
    
    return c.json({
      success: true,
      data: field
    } as { success: true; data: FieldResponse })
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : "未知错误"
    }, 400)
  }
})

fields.post("/", zValidator("json", CreateFieldRequest), async (c) => {
  try {
    const data = c.req.valid("json")
    const userId = getCurrentUserId(c)
    
    // 从URL参数获取applicationId和directoryId
    const applicationId = c.req.query("applicationId")
    const directoryId = c.req.query("directoryId")
    
    if (!applicationId || !directoryId) {
      return c.json({
        success: false,
        error: "缺少必要参数：applicationId 和 directoryId"
      }, 400)
    }
    
    const field = await service.createField({
      ...data,
      applicationId,
      directoryId
    }, userId)
    
    return c.json({
      success: true,
      data: field
    } as { success: true; data: FieldResponse })
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : "未知错误"
    }, 400)
  }
})

fields.put("/:id", zValidator("json", UpdateFieldRequest), async (c) => {
  try {
    const id = c.req.param("id")
    const data = c.req.valid("json")
    const userId = getCurrentUserId(c)
    
    const field = await service.updateField(id, data, userId)
    
    return c.json({
      success: true,
      data: field
    } as { success: true; data: FieldResponse })
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : "未知错误"
    }, 400)
  }
})

fields.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id")
    const userId = getCurrentUserId(c)
    
    const field = await service.deleteField(id, userId)
    
    return c.json({
      success: true,
      data: { success: true }
    })
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : "未知错误"
    }, 400)
  }
})

fields.patch("/:id/order", async (c) => {
  try {
    const id = c.req.param("id")
    const { order } = await c.req.json()
    const userId = getCurrentUserId(c)
    
    if (typeof order !== "number" || order < 0) {
      return c.json({
        success: false,
        error: "order 必须是大于等于0的数字"
      }, 400)
    }
    
    const field = await service.updateFieldOrder(id, order, userId)
    
    return c.json({
      success: true,
      data: field
    } as { success: true; data: FieldResponse })
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : "未知错误"
    }, 400)
  }
})

// 字段分类相关路由
fields.get("/categories", async (c) => {
  try {
    const applicationId = c.req.query("applicationId")
    const directoryId = c.req.query("directoryId")
    const userId = getCurrentUserId(c)
    
    if (!applicationId) {
      return c.json({
        success: false,
        error: "缺少必要参数：applicationId"
      }, 400)
    }
    
    const categories = await service.getFieldCategories(applicationId, directoryId, userId)
    
    return c.json({
      success: true,
      data: {
        categories,
        total: categories.length
      }
    } as { success: true; data: FieldCategoriesListResponse })
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : "未知错误"
    }, 400)
  }
})

fields.get("/categories/:id", async (c) => {
  try {
    const id = c.req.param("id")
    const userId = getCurrentUserId(c)
    
    const category = await service.getFieldCategory(id, userId)
    
    return c.json({
      success: true,
      data: category
    } as { success: true; data: FieldCategoryResponse })
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : "未知错误"
    }, 400)
  }
})

fields.post("/categories", zValidator("json", CreateFieldCategoryRequest), async (c) => {
  try {
    const data = c.req.valid("json")
    const userId = getCurrentUserId(c)
    
    // 从URL参数获取applicationId和directoryId
    const applicationId = c.req.query("applicationId")
    const directoryId = c.req.query("directoryId")
    
    if (!applicationId || !directoryId) {
      return c.json({
        success: false,
        error: "缺少必要参数：applicationId 和 directoryId"
      }, 400)
    }
    
    const category = await service.createFieldCategory({
      ...data,
      applicationId,
      directoryId
    }, userId)
    
    return c.json({
      success: true,
      data: category
    } as { success: true; data: FieldCategoryResponse })
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : "未知错误"
    }, 400)
  }
})

fields.put("/categories/:id", zValidator("json", UpdateFieldCategoryRequest), async (c) => {
  try {
    const id = c.req.param("id")
    const data = c.req.valid("json")
    const userId = getCurrentUserId(c)
    
    const category = await service.updateFieldCategory(id, data, userId)
    
    return c.json({
      success: true,
      data: category
    } as { success: true; data: FieldCategoryResponse })
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : "未知错误"
    }, 400)
  }
})

fields.delete("/categories/:id", async (c) => {
  try {
    const id = c.req.param("id")
    const userId = getCurrentUserId(c)
    
    const category = await service.deleteFieldCategory(id, userId)
    
    return c.json({
      success: true,
      data: { success: true }
    })
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : "未知错误"
    }, 400)
  }
})

export { fields }

