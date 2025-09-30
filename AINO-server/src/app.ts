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
import crawlRoute from "./modules/crawl/routes"
import pageConfigsRoute from "./modules/page-configs/routes"
import moduleConfigsRoute from "./modules/module-configs/routes"
import { databaseMiddleware } from "./middleware/database"

const app = new Hono()

const fileTypes = {
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".avi": "video/avi",
  ".mov": "video/quicktime",
  ".wmv": "video/x-ms-wmv",
  ".flv": "video/x-flv",
  ".webm": "video/webm",
  ".mkv": "video/x-matroska",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
  ".m4a": "audio/mp4",
  ".aac": "audio/aac",
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".ppt": "application/vnd.ms-powerpoint",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".txt": "text/plain",
  ".csv": "text/csv",
  ".zip": "application/zip",
  ".rar": "application/x-rar-compressed",
  ".7z": "application/x-7z-compressed",
  ".json": "application/json",
  ".xml": "application/xml",
}

// Allowed origins for CORS (Studio / App dev servers)
const allowedOrigins = new Set<string>([
  'http://localhost:3006',
  'http://localhost:3007',
  'http://localhost:3003',
  'http://127.0.0.1:3006',
  'http://127.0.0.1:3007',
  'http://127.0.0.1:3003',
  process.env.STUDIO_ORIGIN || '',
  process.env.APP_ORIGIN || '',
].filter(Boolean))

app.use("*", cors({
  origin: (origin) => {
    if (origin && allowedOrigins.has(origin)) return origin
    // Fallback: echo back origin if provided to support local testing
    return origin || "http://localhost:3006"
  },
  allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowHeaders: [
    "*",
    "Content-Type",
    "content-type",
    "Authorization",
    "authorization",
    "x-aino-firecrawl-key",
    "x-aino-openai-endpoint",
    "x-aino-openai-key",
    "X-Requested-With"
  ],
  exposeHeaders: ["Content-Type", "Authorization", "x-aino-firecrawl-key"],
  credentials: true,
  maxAge: 86400,
}))

// 显式处理所有预检请求，确保 CORS 预检稳定通过
app.options("*", (c) => {
  const reqOrigin = c.req.header("Origin") || ""
  const origin = (reqOrigin && allowedOrigins.has(reqOrigin)) ? reqOrigin : (reqOrigin || "http://localhost:3006")
  const reqHeaders = c.req.header("Access-Control-Request-Headers") || "Content-Type, Authorization, x-aino-firecrawl-key"
  c.header("Access-Control-Allow-Origin", origin)
  c.header("Vary", "Origin")
  c.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS")
  c.header("Access-Control-Allow-Headers", reqHeaders)
  c.header("Access-Control-Allow-Credentials", "true")
  c.header("Access-Control-Max-Age", "86400")
  return c.body(null, 204)
})

// 添加数据库中间件
app.use("*", databaseMiddleware)

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

// 爬取服务路由（Firecrawl 集成）
app.route("/api/crawl", crawlRoute)

// 页面配置临时存储/读取
app.route("/api/page-configs", pageConfigsRoute)

// 模块配置CRUD（JSON文件存储）
app.route("/api/module-configs", moduleConfigsRoute)

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
        : fileTypes[ext] ? fileTypes[ext]
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

    // 文件类型与大小校验（最大 50MB）
    const allowed = [
      // 图片类型
      "image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif", "image/svg+xml",
      // 视频类型
      "video/mp4", "video/avi", "video/mov", "video/wmv", "video/flv", "video/webm", "video/mkv",
      // 音频类型
      "audio/mp3", "audio/wav", "audio/ogg", "audio/m4a", "audio/aac",
      // 文档类型
      "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "text/plain", "text/csv",
      // 压缩文件
      "application/zip", "application/x-rar-compressed", "application/x-7z-compressed",
      // 其他常见类型
      "application/json", "application/xml"
    ]
    // @ts-ignore size is available in Node File
    const fileSize = (file as any).size as number | undefined
    if (file.type && !allowed.includes(file.type)) {
      return c.json({ success: false, message: "unsupported file type" }, 400)
    }
    if (fileSize && fileSize > 50 * 1024 * 1024) {
      return c.json({ success: false, message: "file too large" }, 400)
    }

    // 确保目录存在
    await fs.mkdir(uploadsDir, { recursive: true })

    // 生成文件名
    const ext = (() => {
      const m = (file.name || "").match(/\.([a-zA-Z0-9]+)$/)
      if (m) return `.${m[1].toLowerCase()}`
      const map: Record<string, string> = {
        // 图片类型
        "image/png": ".png", "image/jpeg": ".jpg", "image/webp": ".webp", "image/gif": ".gif", "image/svg+xml": ".svg",
        // 视频类型
        "video/mp4": ".mp4", "video/avi": ".avi", "video/mov": ".mov", "video/wmv": ".wmv",
        "video/flv": ".flv", "video/webm": ".webm", "video/mkv": ".mkv",
        // 音频类型
        "audio/mp3": ".mp3", "audio/wav": ".wav", "audio/ogg": ".ogg", "audio/m4a": ".m4a", "audio/aac": ".aac",
        // 文档类型
        "application/pdf": ".pdf", "application/msword": ".doc",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
        "application/vnd.ms-excel": ".xls",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
        "application/vnd.ms-powerpoint": ".ppt",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation": ".pptx",
        "text/plain": ".txt", "text/csv": ".csv",
        // 压缩文件
        "application/zip": ".zip", "application/x-rar-compressed": ".rar", "application/x-7z-compressed": ".7z",
        // 其他类型
        "application/json": ".json", "application/xml": ".xml"
      }
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
