import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { RecordCategoriesService } from "./service"
import { mockRequireAuthMiddleware } from "../../middleware/auth"
import { TIdentity } from "../../platform/identity"
import {
  CreateRecordCategoryRequest,
  UpdateRecordCategoryRequest,
  GetRecordCategoriesQuery,
} from "./dto"

// 扩展Context类型以包含user
type ContextWithUser = {
  user: TIdentity
}

const app = new Hono()
const service = new RecordCategoriesService()

// 获取记录分类列表
app.get("/",
  mockRequireAuthMiddleware,
  zValidator("query", GetRecordCategoriesQuery),
  async (c) => {
    try {
      const query = c.req.valid("query")
      const user = c.get("user") as TIdentity
      
      const result = await service.findMany(query, user.id)
      return c.json({ success: true, data: result })
    } catch (error) {
      console.error("获取记录分类列表失败:", error)
      return c.json({ 
        success: false, 
        error: error instanceof Error ? error.message : "获取记录分类列表失败" 
      }, 500)
    }
  }
)

// 创建记录分类
app.post("/",
  mockRequireAuthMiddleware,
  zValidator("json", CreateRecordCategoryRequest),
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
      
      const result = await service.create(data, applicationId, directoryId, user.id)
      return c.json({ success: true, data: result }, 201)
    } catch (error) {
      console.error("创建记录分类失败:", error)
      return c.json({ 
        success: false, 
        error: error instanceof Error ? error.message : "创建记录分类失败" 
      }, 500)
    }
  }
)

// 获取记录分类详情
app.get("/:id",
  mockRequireAuthMiddleware,
  async (c) => {
    try {
      const id = c.req.param("id")
      const user = c.get("user") as TIdentity
      
      const result = await service.findById(id, user.id)
      
      if (!result) {
        return c.json({ success: false, error: "记录分类不存在" }, 404)
      }
      
      return c.json({ success: true, data: result })
    } catch (error) {
      console.error("获取记录分类详情失败:", error)
      return c.json({ 
        success: false, 
        error: error instanceof Error ? error.message : "获取记录分类详情失败" 
      }, 500)
    }
  }
)

// 更新记录分类
app.put("/:id",
  mockRequireAuthMiddleware,
  zValidator("json", UpdateRecordCategoryRequest),
  async (c) => {
    try {
      const id = c.req.param("id")
      const data = c.req.valid("json")
      const user = c.get("user") as TIdentity
      
      const result = await service.update(id, data, user.id)
      
      if (!result) {
        return c.json({ success: false, error: "记录分类不存在" }, 404)
      }
      
      return c.json({ success: true, data: result })
    } catch (error) {
      console.error("更新记录分类失败:", error)
      return c.json({ 
        success: false, 
        error: error instanceof Error ? error.message : "更新记录分类失败" 
      }, 500)
    }
  }
)

// 删除记录分类
app.delete("/:id",
  mockRequireAuthMiddleware,
  async (c) => {
    try {
      const id = c.req.param("id")
      const user = c.get("user") as TIdentity
      
      const result = await service.delete(id, user.id)
      
      if (!result) {
        return c.json({ success: false, error: "记录分类不存在" }, 404)
      }
      
      return c.json({ success: true, message: "记录分类删除成功" })
    } catch (error) {
      console.error("删除记录分类失败:", error)
      return c.json({ 
        success: false, 
        error: error instanceof Error ? error.message : "删除记录分类失败" 
      }, 500)
    }
  }
)

// 获取目录的分类树
app.get("/tree/:directoryId",
  mockRequireAuthMiddleware,
  async (c) => {
    try {
      const directoryId = c.req.param("directoryId")
      const applicationId = c.req.query("applicationId")
      const user = c.get("user") as TIdentity
      
      if (!applicationId) {
        return c.json({ 
          success: false, 
          error: "缺少必要的参数：applicationId" 
        }, 400)
      }
      
      const result = await service.getCategoryTree(directoryId, applicationId, user.id)
      return c.json({ success: true, data: result })
    } catch (error) {
      console.error("获取分类树失败:", error)
      return c.json({ 
        success: false, 
        error: error instanceof Error ? error.message : "获取分类树失败" 
      }, 500)
    }
  }
)

export default app
