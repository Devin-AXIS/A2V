import { Hono } from "hono"
import { z } from "zod"
import { extractTokenFromHeader } from "../../platform/auth"

// 兼容：邮箱/用户名字段名 & 任意内容类型
const LoginBody = z.object({
  email: z.string().email().or(z.string().min(1)).optional(), // 有些前端传非 email
  username: z.string().optional(),
  account: z.string().optional(),
  password: z.string().min(1),
})

// 统一注册请求体验证
const RegisterBody = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
})

// 支持多个测试账号
const users = [
  { id: "u-1", email: "admin@aino.com", name: "Admin", pass: "admin123" },
  { id: "u-2", email: "admin@example.com", name: "Admin", pass: "admin123" },
  { id: "u-3", email: "test@aino.com", name: "Test User", pass: "test123" }
]

export const usersRoute = new Hono()

usersRoute.options("/login", (c) => c.text("ok"))

// 统一解析 JSON / x-www-form-urlencoded / multipart
async function readLoginBody(c: any) {
  const ct = c.req.header("content-type") || ""
  console.log("📋 Content-Type:", ct)

  try {
    if (ct.includes("application/json")) {
      const jsonData = await c.req.json()
      console.log("📋 JSON 数据:", jsonData)
      return jsonData
    }

    // 对于表单数据，先尝试 parseBody
    if (ct.includes("application/x-www-form-urlencoded") || ct.includes("multipart/form-data")) {
      try {
        const formData = await c.req.parseBody()
        console.log("📋 表单数据:", formData)
        return formData
      } catch (formError) {
        console.log("📋 表单解析失败:", formError)
        // 如果 parseBody 失败，尝试作为 JSON 解析
        try {
          const jsonData = await c.req.json()
          console.log("📋 回退到 JSON:", jsonData)
          return jsonData
        } catch (jsonError) {
          console.log("📋 JSON 解析也失败:", jsonError)
          return {}
        }
      }
    }

    // 默认尝试 JSON
    const jsonData = await c.req.json()
    console.log("📋 默认 JSON:", jsonData)
    return jsonData
  } catch (error) {
    console.log("📋 所有解析方法都失败:", error)
    return {}
  }
}

usersRoute.post("/login", async (c) => {
  const raw = await readLoginBody(c)
  console.log("📋 最终原始请求体:", raw)

  // 归一化字段：email 优先，其次 username/account
  const normalized = {
    email: raw.email ?? raw.username ?? raw.account ?? "",
    password: raw.password ?? "",
  }
  console.log("📋 归一化后:", normalized)

  const parsed = LoginBody.safeParse({ ...normalized })
  if (!parsed.success) {
    console.log("📋 验证失败:", parsed.error.flatten())
    // 始终返回结构化 JSON，避免 {}
    return c.json({ success: false, code: "BAD_REQUEST", message: "参数错误", detail: parsed.error.flatten() }, 400)
  }

  const { findUserByEmail, validatePassword } = await import('./repo')
  const user = await findUserByEmail(normalized.email);
  if (!user) {
    console.log("📋 用户验证失败:", { email: normalized.email })
    // 某些前端把非 200 直接当异常，这里返回 200 但 success=false，便于 UI 提示
    return c.json({ success: false, code: "INVALID_CREDENTIALS", message: "登录失败" }, 200)
  }

  const isValid = await validatePassword(normalized.email, normalized.password)
  if (!isValid) {
    console.log("📋 密码校验失败:", { email: normalized.email })
    return c.json({ success: false, code: "INVALID_CREDENTIALS", message: "登录失败" }, 200)
  }

  const { generateToken } = await import('../../platform/auth')
  const token = generateToken(user.id, user.email, user.roles || ['user'])

  // 兼容多种前端期望：同时返回 success/data/token/user/code/message
  return c.json({
    success: true,
    code: 0,
    message: "OK",
    data: {
      token,
      user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar, roles: user.roles },
    },
    // 兼容一些直接取顶层字段的实现
    token,
    user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar, roles: user.roles },
  }, 200)
})

// 获取当前用户信息
usersRoute.get("/me", async (c) => {
  const authHeader = c.req.header('Authorization')
  const token = extractTokenFromHeader(authHeader)
  if (!token) {
    return c.json({ success: false, code: "UNAUTHORIZED", message: "未登录" }, 401)
  }
  // JWT 校验
  const { getUserFromToken } = await import('../../platform/auth')
  const identity = await getUserFromToken(token)
  if (identity) {
    return c.json({ success: true, data: { id: identity.id, email: identity.email, name: identity.name, avatar: identity.avatar, roles: identity.roles } }, 200)
  }
  return c.json({ success: false, code: "UNAUTHORIZED", message: "令牌无效或已过期" }, 401)
})

// 更新当前用户信息
const UpdateMeBody = z.object({
  name: z.string().min(1).optional(),
  avatar: z.string().min(1).optional(),
})

usersRoute.patch("/me", async (c) => {
  const authHeader = c.req.header('Authorization')
  const token = extractTokenFromHeader(authHeader)
  if (!token) {
    return c.json({ success: false, code: "UNAUTHORIZED", message: "未登录" }, 401)
  }

  const { getUserFromToken } = await import('../../platform/auth')
  const identity = await getUserFromToken(token)
  if (!identity) {
    return c.json({ success: false, code: "UNAUTHORIZED", message: "令牌无效或已过期" }, 401)
  }

  let body: any
  try {
    body = await c.req.json()
  } catch {
    body = {}
  }

  const parsed = UpdateMeBody.safeParse(body)
  if (!parsed.success) {
    return c.json({ success: false, code: "BAD_REQUEST", message: "参数错误", detail: parsed.error.flatten() }, 400)
  }

  const { updateUserById } = await import('./repo')
  const updated = await updateUserById(identity.id, parsed.data)
  if (!updated) {
    return c.json({ success: false, code: "NOT_FOUND", message: "用户不存在" }, 404)
  }

  return c.json({
    success: true,
    data: { id: updated.id, email: updated.email, name: updated.name, avatar: updated.avatar, roles: updated.roles },
  }, 200)
})

// 新增：用户注册
usersRoute.post("/register", async (c) => {
  try {
    const bodyRaw = await c.req.json()
    const parsed = RegisterBody.safeParse(bodyRaw)
    if (!parsed.success) {
      return c.json({ success: false, code: "BAD_REQUEST", message: "参数错误", detail: parsed.error.flatten() }, 400)
    }

    const { createUser, findUserByEmail } = await import('./repo')
    const { generateToken } = await import('../../platform/auth')

    const exists = await findUserByEmail(parsed.data.email)
    if (exists) {
      return c.json({ success: false, code: "EMAIL_EXISTS", message: "邮箱已被注册" }, 409)
    }

    const user = await createUser(parsed.data)
    const token = generateToken(user.id, user.email, user.roles || ['user'])

    return c.json({
      success: true,
      code: 0,
      message: 'OK',
      data: {
        token,
        user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar, roles: user.roles },
      },
      token,
      user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar, roles: user.roles },
    }, 200)
  } catch (err: any) {
    console.error('注册失败:', err)
    const detail = { message: String(err?.message || err), stack: err?.stack, cause: err?.cause }
    return c.json({ success: false, code: "INTERNAL_ERROR", message: "注册失败", detail }, 500)
  }
})
