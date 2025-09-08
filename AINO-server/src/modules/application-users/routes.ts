import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { ApplicationUserService } from "./service"
import { mockRequireAuthMiddleware } from "../../middleware/auth"
import {
  CreateApplicationUserRequest,
  UpdateApplicationUserRequest,
  GetApplicationUsersQuery,
  RegisterUserRequest,
  LoginUserRequest,
  ChangePasswordRequest
} from "./dto"

const app = new Hono()
const service = new ApplicationUserService()

// 获取应用用户列表
app.get("/",
  mockRequireAuthMiddleware,
  zValidator("query", GetApplicationUsersQuery),
  async (c) => {
    try {
      const query = c.req.valid("query")
      const user = c.get("user")

      // 从查询参数或请求头获取应用ID
      const applicationId = c.req.query("applicationId") || c.req.header("x-application-id")
      if (!applicationId) {
        return c.json({
          success: false,
          error: "缺少应用ID参数",
        }, 400)
      }

      const result = await service.getApplicationUsers(applicationId, query)

      return c.json({
        success: true,
        data: result,
      })
    } catch (error) {
      console.error("获取应用用户列表失败:", error)
      return c.json({
        success: false,
        error: error instanceof Error ? error.message : "获取应用用户列表失败",
      }, 500)
    }
  }
)

// 创建应用用户
app.post("/",
  mockRequireAuthMiddleware,
  zValidator("json", CreateApplicationUserRequest),
  async (c) => {
    try {
      const data = c.req.valid("json")
      const user = c.get("user")

      // 从查询参数或请求头获取应用ID
      const applicationId = c.req.query("applicationId") || c.req.header("x-application-id")
      if (!applicationId) {
        return c.json({
          success: false,
          error: "缺少应用ID参数",
        }, 400)
      }

      const applicationUser = await service.createApplicationUser(applicationId, data)

      return c.json({
        success: true,
        data: applicationUser,
      }, 201)
    } catch (error) {
      console.error("创建应用用户失败:", error)
      return c.json({
        success: false,
        error: error instanceof Error ? error.message : "创建应用用户失败",
      }, 400)
    }
  }
)

// 获取应用用户详情
app.get("/:id",
  mockRequireAuthMiddleware,
  async (c) => {
    try {
      const id = c.req.param("id")
      const user = c.get("user")

      // 从查询参数或请求头获取应用ID
      const applicationId = c.req.query("applicationId") || c.req.header("x-application-id")
      if (!applicationId) {
        return c.json({
          success: false,
          error: "缺少应用ID参数",
        }, 400)
      }

      const applicationUser = await service.getApplicationUserById(applicationId, id)

      return c.json({
        success: true,
        data: applicationUser,
      })
    } catch (error) {
      console.error("获取应用用户详情失败:", error)
      return c.json({
        success: false,
        error: error instanceof Error ? error.message : "获取应用用户详情失败",
      }, 404)
    }
  }
)

// 更新应用用户
app.put("/:id",
  mockRequireAuthMiddleware,
  zValidator("json", UpdateApplicationUserRequest),
  async (c) => {
    try {
      const id = c.req.param("id")
      const data = c.req.valid("json")
      const user = c.get("user")

      // 从查询参数或请求头获取应用ID
      const applicationId = c.req.query("applicationId") || c.req.header("x-application-id")
      if (!applicationId) {
        return c.json({
          success: false,
          error: "缺少应用ID参数",
        }, 400)
      }

      const applicationUser = await service.updateApplicationUser(applicationId, id, data)

      return c.json({
        success: true,
        data: applicationUser,
      })
    } catch (error) {
      console.error("更新应用用户失败:", error)
      return c.json({
        success: false,
        error: error instanceof Error ? error.message : "更新应用用户失败",
      }, 400)
    }
  }
)

// 删除应用用户
app.delete("/:id",
  mockRequireAuthMiddleware,
  async (c) => {
    try {
      const id = c.req.param("id")
      const user = c.get("user")

      // 从查询参数或请求头获取应用ID
      const applicationId = c.req.query("applicationId") || c.req.header("x-application-id")
      if (!applicationId) {
        return c.json({
          success: false,
          error: "缺少应用ID参数",
        }, 400)
      }

      await service.deleteApplicationUser(applicationId, id)

      return c.json({
        success: true,
        message: "应用用户删除成功",
      })
    } catch (error) {
      console.error("删除应用用户失败:", error)
      return c.json({
        success: false,
        error: error instanceof Error ? error.message : "删除应用用户失败",
      }, 400)
    }
  }
)

// 批量更新应用用户
app.patch("/batch",
  mockRequireAuthMiddleware,
  zValidator("json", z.object({
    userIds: z.array(z.string().uuid()),
    data: UpdateApplicationUserRequest,
  })),
  async (c) => {
    try {
      const { userIds, data } = c.req.valid("json")
      const user = c.get("user")

      // 从查询参数或请求头获取应用ID
      const applicationId = c.req.query("applicationId") || c.req.header("x-application-id")
      if (!applicationId) {
        return c.json({
          success: false,
          error: "缺少应用ID参数",
        }, 400)
      }

      const results = await service.batchUpdateUsers(applicationId, userIds, data)

      return c.json({
        success: true,
        data: results,
      })
    } catch (error) {
      console.error("批量更新应用用户失败:", error)
      return c.json({
        success: false,
        error: error instanceof Error ? error.message : "批量更新应用用户失败",
      }, 400)
    }
  }
)

// 批量删除应用用户
app.delete("/batch",
  mockRequireAuthMiddleware,
  zValidator("json", z.object({
    userIds: z.array(z.string().uuid()),
  })),
  async (c) => {
    try {
      const { userIds } = c.req.valid("json")
      const user = c.get("user")

      // 从查询参数或请求头获取应用ID
      const applicationId = c.req.query("applicationId") || c.req.header("x-application-id")
      if (!applicationId) {
        return c.json({
          success: false,
          error: "缺少应用ID参数",
        }, 400)
      }

      const results = await service.batchDeleteUsers(applicationId, userIds)

      return c.json({
        success: true,
        data: results,
      })
    } catch (error) {
      console.error("批量删除应用用户失败:", error)
      return c.json({
        success: false,
        error: error instanceof Error ? error.message : "批量删除应用用户失败",
      }, 400)
    }
  }
)

// 用户注册
app.post("/register",
  zValidator("json", RegisterUserRequest),
  async (c) => {
    try {
      const data = c.req.valid("json")

      // 从查询参数或请求头获取应用ID
      const applicationId = c.req.query("applicationId") || c.req.header("x-application-id")
      if (!applicationId) {
        return c.json({
          success: false,
          error: "缺少应用ID参数",
        }, 400)
      }

      const result = await service.registerUser(applicationId, data)

      return c.json({
        success: true,
        data: result,
        message: "用户注册成功"
      }, 201)
    } catch (error) {
      console.error("用户注册失败:", error)
      return c.json({
        success: false,
        error: error instanceof Error ? error.message : "用户注册失败",
      }, 400)
    }
  }
)

// 查询手机号是否已注册（公开）
app.get("/exists",
  zValidator("query", z.object({ phone_number: z.string().min(1, "手机号不能为空") })),
  async (c) => {
    try {
      const { phone_number } = c.req.valid("query") as { phone_number: string }
      const applicationId = c.req.query("applicationId") || c.req.header("x-application-id")
      if (!applicationId) {
        return c.json({ success: false, error: "缺少应用ID参数" }, 400)
      }
      const user = await service.findUserByPhone(applicationId, phone_number)
      return c.json({ success: true, data: { exists: !!user } })
    } catch (error) {
      return c.json({ success: false, error: error instanceof Error ? error.message : "查询失败" }, 400)
    }
  }
)

// 用户登录（应用用户）
app.post("/login",
  zValidator("json", LoginUserRequest),
  async (c) => {
    try {
      const data = c.req.valid("json")
      const applicationId = c.req.query("applicationId") || c.req.header("x-application-id")
      if (!applicationId) {
        return c.json({ success: false, error: "缺少应用ID参数" }, 400)
      }

      const result = await service.login(applicationId, data)
      return c.json({ success: true, data: result })
    } catch (error) {
      return c.json({ success: false, error: error instanceof Error ? error.message : "登录失败" }, 400)
    }
  }
)

// 修改密码（应用用户）
app.post("/change-password",
  zValidator("json", ChangePasswordRequest),
  async (c) => {
    try {
      const data = c.req.valid("json")
      const applicationId = c.req.query("applicationId") || c.req.header("x-application-id")
      if (!applicationId) {
        return c.json({ success: false, error: "缺少应用ID参数" }, 400)
      }

      await service.changePassword(applicationId, data)
      return c.json({ success: true, message: "密码修改成功" })
    } catch (error) {
      return c.json({ success: false, error: error instanceof Error ? error.message : "修改密码失败" }, 400)
    }
  }
)

export default app
