import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { DirectoryService } from "./service"
import { mockRequireAuthMiddleware } from "../../middleware/auth"
import {
  CreateDirectoryRequest,
  UpdateDirectoryRequest,
  GetDirectoriesQuery
} from "./dto"

const app = new Hono()
const service = new DirectoryService()

// 获取可用模块列表 - 必须在 /:id 路由之前定义
app.get("/modules",
  mockRequireAuthMiddleware,
  async (c) => {
    try {
      const applicationId = c.req.query("applicationId")
      const user = c.get("user")

      if (!applicationId) {
        return c.json({
          success: false,
          error: "缺少必要参数：applicationId"
        }, 400)
      }

      // 验证用户权限
      const hasAccess = await service.checkUserAccess(applicationId, user.id)
      if (!hasAccess) {
        return c.json({
          success: false,
          error: "没有权限访问该应用"
        }, 403)
      }

      const modules = await service.getAvailableModules(applicationId)
      return c.json({ success: true, data: modules })
    } catch (error) {
      console.error("获取模块列表失败:", error)
      return c.json({
        success: false,
        error: error instanceof Error ? error.message : "获取模块列表失败"
      }, 500)
    }
  }
)

// 获取目录列表
// 支持分页、搜索、过滤等功能
app.get("/",
  mockRequireAuthMiddleware,
  zValidator("query", GetDirectoriesQuery),
  async (c) => {
    try {
      const query = c.req.valid("query")
      const user = c.get("user")

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
      console.error("获取目录列表失败:", error)
      return c.json({
        success: false,
        error: error instanceof Error ? error.message : "获取目录列表失败"
      }, 500)
    }
  }
)

// 创建目录
// 创建目录并返回目录信息
app.post("/",
  mockRequireAuthMiddleware,
  zValidator("json", CreateDirectoryRequest),
  async (c) => {
    console.log("🚀 创建目录API被调用 - 代码已更新!")
    try {
      const data = c.req.valid("json")
      const user = c.get("user")
      const applicationId = c.req.query("applicationId")
      const moduleId = c.req.query("moduleId")

      console.log("🚀 创建目录参数:", { applicationId, moduleId, data })

      if (!applicationId || !moduleId) {
        return c.json({
          success: false,
          error: "缺少必要的参数：applicationId 和 moduleId"
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

      const result = await service.create(data, applicationId, moduleId, user.id)
      return c.json({ success: true, data: result }, 201)
    } catch (error) {
      console.error("创建目录失败:", error)

      // 根据错误类型返回不同的HTTP状态码
      let statusCode = 500
      let errorMessage = "创建目录失败"

      if (error instanceof Error) {
        errorMessage = error.message

        // 根据错误消息确定状态码
        if (error.message.includes("应用程序不存在") || error.message.includes("模块不存在")) {
          statusCode = 404
        } else if (error.message.includes("目录名称已存在")) {
          statusCode = 409
        } else if (error.message.includes("没有权限")) {
          statusCode = 403
        }
      }

      return c.json({
        success: false,
        error: errorMessage
      }, statusCode)
    }
  }
)

// 获取目录详情
// 根据目录ID获取完整的目录信息
app.get("/:id",
  mockRequireAuthMiddleware,
  async (c) => {
    try {
      const id = c.req.param("id")
      const user = c.get("user")

      const result = await service.findById(id, user.id)

      if (!result) {
        return c.json({ success: false, error: "目录不存在" }, 404)
      }

      return c.json({ success: true, data: result })
    } catch (error) {
      console.error("获取目录详情失败:", error)
      return c.json({
        success: false,
        error: error instanceof Error ? error.message : "获取目录详情失败"
      }, 500)
    }
  }
)

// 更新目录
// 更新目录信息并返回更新后的目录
app.put("/:id",
  mockRequireAuthMiddleware,
  zValidator("json", UpdateDirectoryRequest),
  async (c) => {
    try {
      const id = c.req.param("id")
      const data = c.req.valid("json")
      const user = c.get("user")

      const result = await service.update(id, data, user.id)

      if (!result) {
        return c.json({ success: false, error: "目录不存在" }, 404)
      }

      return c.json({ success: true, data: result })
    } catch (error) {
      console.error("更新目录失败:", error)
      return c.json({
        success: false,
        error: error instanceof Error ? error.message : "更新目录失败"
      }, 500)
    }
  }
)

// 删除目录
// 删除目录并返回删除结果
app.delete("/:id",
  mockRequireAuthMiddleware,
  async (c) => {
    try {
      const id = c.req.param("id")
      const user = c.get("user")

      const result = await service.delete(id, user.id)

      if (!result) {
        return c.json({ success: false, error: "目录不存在" }, 404)
      }

      return c.json({ success: true, message: "目录删除成功" })
    } catch (error) {
      console.error("删除目录失败:", error)
      return c.json({
        success: false,
        error: error instanceof Error ? error.message : "删除目录失败"
      }, 500)
    }
  }
)

export default app
