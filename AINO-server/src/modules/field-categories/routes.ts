import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { FieldCategoriesService } from "./service"
import { mockRequireAuthMiddleware } from "../../middleware/auth"
import { TIdentity } from "../../platform/identity"
import {
  CreateFieldCategoryRequest,
  UpdateFieldCategoryRequest,
  GetFieldCategoriesQuery,
  FieldCategoryResponse,
  FieldCategoriesListResponse
} from "./dto"

// 扩展Context类型以包含user
type ContextWithUser = {
  user: TIdentity
}

const app = new Hono()
const service = new FieldCategoriesService()

// 获取字段分类列表
app.get("/",
  mockRequireAuthMiddleware,
  zValidator("query", GetFieldCategoriesQuery),
  async (c) => {
    try {
      const query = c.req.valid("query")
      const user = c.get("user") as TIdentity
      
      // 验证用户是否有权限访问应用
      if (query.applicationId) {
        const hasAccess = await service.checkUserAccess(query.applicationId, user.id)
        if (!hasAccess) {
          return c.json({ 
            success: false, 
            error: "没有权限访问该应用" 
          }, 403)
        }
      }
      
      const result = await service.findMany(query, user.id)
      return c.json({ success: true, data: result })
    } catch (error) {
      console.error("获取字段分类列表失败:", error)
      return c.json({ 
        success: false, 
        error: error instanceof Error ? error.message : "获取字段分类列表失败" 
      }, 500)
    }
  }
)

// 创建字段分类
app.post("/",
  mockRequireAuthMiddleware,
  zValidator("json", CreateFieldCategoryRequest),
  async (c) => {
    try {
      const data = c.req.valid("json")
      const user = c.get("user") as TIdentity
      const applicationId = c.req.query("applicationId")
      const directoryId = c.req.query("directoryId")
      
      if (!applicationId || !directoryId) {
        return c.json({ 
          success: false, 
          error: "缺少必要的参数：applicationId 和 directoryId" 
        }, 400)
      }
      
      // 验证用户是否有权限访问应用
      const hasAccess = await service.checkUserAccess(applicationId, user.id)
      if (!hasAccess) {
        return c.json({ 
          success: false, 
          error: "没有权限访问该应用" 
        }, 403)
      }
      
      const result = await service.create(data, applicationId, directoryId, user.id)
      return c.json({ success: true, data: result }, 201)
    } catch (error) {
      console.error("创建字段分类失败:", error)
      return c.json({ 
        success: false, 
        error: error instanceof Error ? error.message : "创建字段分类失败" 
      }, 500)
    }
  }
)

// 获取字段分类详情
app.get("/:id",
  mockRequireAuthMiddleware,
  async (c) => {
    try {
      const id = c.req.param("id")
      const user = c.get("user") as TIdentity
      
      const result = await service.findById(id, user.id)
      
      if (!result) {
        return c.json({ success: false, error: "字段分类不存在" }, 404)
      }
      
      return c.json({ success: true, data: result })
    } catch (error) {
      console.error("获取字段分类详情失败:", error)
      return c.json({ 
        success: false, 
        error: error instanceof Error ? error.message : "获取字段分类详情失败" 
      }, 500)
    }
  }
)

// 更新字段分类
app.put("/:id",
  mockRequireAuthMiddleware,
  zValidator("json", UpdateFieldCategoryRequest),
  async (c) => {
    try {
      const id = c.req.param("id")
      const data = c.req.valid("json")
      const user = c.get("user") as TIdentity
      
      const result = await service.update(id, data, user.id)
      
      if (!result) {
        return c.json({ success: false, error: "字段分类不存在" }, 404)
      }
      
      return c.json({ success: true, data: result })
    } catch (error) {
      console.error("更新字段分类失败:", error)
      return c.json({ 
        success: false, 
        error: error instanceof Error ? error.message : "更新字段分类失败" 
      }, 500)
    }
  }
)

// 删除字段分类
app.delete("/:id",
  mockRequireAuthMiddleware,
  async (c) => {
    try {
      const id = c.req.param("id")
      const user = c.get("user") as TIdentity
      
      const result = await service.delete(id, user.id)
      
      if (!result) {
        return c.json({ success: false, error: "字段分类不存在" }, 404)
      }
      
      return c.json({ success: true, message: "字段分类删除成功" })
    } catch (error) {
      console.error("删除字段分类失败:", error)
      return c.json({ 
        success: false, 
        error: error instanceof Error ? error.message : "删除字段分类失败" 
      }, 500)
    }
  }
)

export default app
