import { Hono } from "hono"
import { env } from "./env"
import { promises as fs } from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { cors } from "hono/cors"
import { usersRoute } from "./modules/users/routes"
import applicationsRoute from "./modules/applications/routes"
import modulesRoute from "./modules/modules/routes"
import simpleModulesRoute from "./modules/modules/simple-routes"
import applicationUsersRoute from "./modules/application-users/routes"
import directoriesRoute from "./modules/directories/routes"

import fieldCategoriesRoute from "./modules/field-categories/routes"
import recordCategoriesRoute from "./modules/record-categories/routes"
import { records } from "./routes/records"
import { fieldDefs } from "./modules/field-defs/routes"
import { directoryDefs } from "./modules/directory-defs/routes"
import relationRecordsRoute from "./modules/relation-records/routes"

import { docsRoute } from "./docs/routes"
import previewManifestsRoute from "./modules/preview-manifests/routes"
import aiRoute from "./modules/ai/routes"

const app = new Hono()

app.use("*", cors({
  origin: (origin) => origin ?? "*",
  allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 86400,
}))

app.get("/health", (c) => c.text("ok"))

// 添加全局调试中间件
app.use("*", async (c, next) => {
  console.log('🌐 全局路由请求:', c.req.method, c.req.url)
  await next()
})

// 两条前缀都挂上，防止前端写成 /users/login
app.route("/api/users", usersRoute)
app.route("/users", usersRoute)

// 应用路由
app.route("/api/applications", applicationsRoute)
app.route("/applications", applicationsRoute)

// 模块路由系统（包括远程模块代理）
app.route("/api/modules", modulesRoute)
app.route("/api/remote", modulesRoute)

// 简化的模块路由（用于测试）
app.route("/api/modules/simple", simpleModulesRoute)

// 应用用户路由（直接访问）
app.route("/api/application-users", applicationUsersRoute)

// 目录管理路由
app.route("/api/directories", directoriesRoute)

// 字段分类管理路由
app.route("/api/field-categories", fieldCategoriesRoute)

// 记录分类管理路由
app.route("/api/record-categories", recordCategoriesRoute)

// 统一记录CRUD路由
app.route("/api/records", records)

// 字段定义管理路由
app.route("/api/field-defs", fieldDefs)

// 目录定义管理路由
app.route("/api/directory-defs", directoryDefs)

// 关联关系管理路由
app.route("/api/relation-records", relationRecordsRoute)

// API 文档路由
app.route("/docs", docsRoute)

// 预览 Manifest 路由
app.route("/api/preview-manifests", previewManifestsRoute)

// AI 网关路由（OpenAI 兼容）
app.route("/api/ai", aiRoute)

// 静态文件：上传目录（基于运行时代码位置计算，dist/../uploads）
const runtimeDir = path.dirname(fileURLToPath(import.meta.url))
const uploadsDir = path.resolve(runtimeDir, "../uploads")

app.get("/uploads/*", async (c) => {
  try {
    const reqPathRaw = c.req.path.replace(/^\/uploads\//, "")
    const reqPath = decodeURIComponent(reqPathRaw)
    if (reqPath.includes("..")) {
      return c.json({ success: false, message: "Invalid path" }, 400)
    }
    const filePath = path.join(uploadsDir, reqPath)
    console.log("🖼️ 静态文件请求:", { reqPath, filePath })
    const stat = await fs.stat(filePath)
    if (!stat.isFile()) {
      console.warn("🖼️ 非文件或不存在:", filePath)
      return c.json({ success: false, message: "Not Found" }, 404)
    }
    const buf = await fs.readFile(filePath)
    const ext = path.extname(filePath).toLowerCase()
    const type = ext === ".png" ? "image/png"
      : (ext === ".jpg" || ext === ".jpeg") ? "image/jpeg"
        : ext === ".webp" ? "image/webp"
          : ext === ".gif" ? "image/gif"
            : ext === ".svg" ? "image/svg+xml"
              : "application/octet-stream"
    c.header("Content-Type", type)
    return c.body(buf)
  } catch (e) {
    console.error("🖼️ 读取静态文件失败:", e)
    return c.json({ success: false, message: "Not Found" }, 404)
  }
})

// 上传接口：接收单文件并保存，返回 URL
app.post("/api/upload", async (c) => {
  try {
    const contentType = c.req.header("content-type") || ""
    if (!contentType.startsWith("multipart/form-data")) {
      return c.json({ success: false, message: "Content-Type must be multipart/form-data" }, 400)
    }

    const form = await c.req.formData()
    const file = form.get("file") as File | null
    if (!file) {
      return c.json({ success: false, message: "file is required" }, 400)
    }

    // 文件类型与大小简单校验（最大 10MB）
    const allowed = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"]
    // @ts-ignore size is available in Node File
    const fileSize = (file as any).size as number | undefined
    if (file.type && !allowed.includes(file.type)) {
      return c.json({ success: false, message: "unsupported file type" }, 400)
    }
    if (fileSize && fileSize > 10 * 1024 * 1024) {
      return c.json({ success: false, message: "file too large" }, 400)
    }

    // 确保目录存在
    await fs.mkdir(uploadsDir, { recursive: true })

    // 生成文件名
    const ext = (() => {
      const m = (file.name || "").match(/\.([a-zA-Z0-9]+)$/)
      if (m) return `.${m[1].toLowerCase()}`
      const map: Record<string, string> = { "image/png": ".png", "image/jpeg": ".jpg", "image/webp": ".webp", "image/gif": ".gif" }
      return map[file.type] || ""
    })()
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
    const filepath = path.join(uploadsDir, filename)

    // 写入磁盘
    const arrayBuffer = await file.arrayBuffer()
    await fs.writeFile(filepath, Buffer.from(arrayBuffer))

    const origin = `http://localhost:${env.PORT}`
    const url = `${origin}/uploads/${filename}`
    return c.json({ success: true, url })
  } catch (err) {
    console.error("File upload error", err)
    return c.json({ success: false, message: "upload failed" }, 500)
  }
})

// 兜底 404（结构化，不会是空对象）
app.notFound((c) => c.json({ success: false, code: "NOT_FOUND", message: "Not Found" }, 404))

export default app
