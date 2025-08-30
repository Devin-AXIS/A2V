import { Hono } from "hono"
import { mockRequireAuthMiddleware } from "../../middleware/auth"
import { SYSTEM_MODULES } from "../../lib/system-modules"
import applicationUsersRoute from "../application-users/routes"
import { moduleRegistry, registerSystemModules, isRemoteModule } from "../../platform/modules/registry"
import remoteProxy from "../../platform/modules/proxy"

const app = new Hono()

// 初始化系统模块注册
registerSystemModules()

// 获取系统模块列表（必须在 /system/:moduleKey/* 之前）
app.get("/system", mockRequireAuthMiddleware, async (c) => {
  const user = c.get("user")
  const systemModules = moduleRegistry.getLocalModules()
  
  return c.json({
    success: true,
    data: {
      modules: systemModules.map(module => ({
        key: module.key,
        name: module.name,
        type: "system",
        icon: getModuleIcon(module.key),
        description: module.description,
        version: module.version,
        routes: module.routes,
      })),
    },
  })
})

// 系统模块路由处理
app.all("/system/:moduleKey/*", mockRequireAuthMiddleware, async (c) => {
  const moduleKey = c.req.param("moduleKey")
  const user = c.get("user")
  
  // 检查模块是否在注册表中
  if (!moduleRegistry.has(moduleKey)) {
    return c.json({
      success: false,
      error: "模块不存在",
    }, 404)
  }

  // 检查是否为远程模块
  if (isRemoteModule(moduleKey)) {
    // 远程模块通过代理处理
    return remoteProxy.fetch(c.req, { user })
  }
  
  // 本地系统模块处理
  const validModules = ["user", "config", "audit"]
  if (!validModules.includes(moduleKey)) {
    return c.json({
      success: false,
      error: "系统模块不存在",
    }, 404)
  }
  
  // 根据模块类型路由到对应的处理器
  switch (moduleKey) {
    case "user":
      return await handleUserModule(c, user)
    case "config":
      return await handleConfigModule(c, user)
    case "audit":
      return await handleAuditModule(c, user)
    default:
      return c.json({
        success: false,
        error: "系统模块暂未实现",
      }, 501)
  }
})

// 用户模块处理器
async function handleUserModule(c: any, user: any) {
  const path = c.req.path.replace("/api/modules/system/user", "")
  const applicationId = c.req.query("applicationId") || c.req.header("x-application-id")
  
  if (!applicationId) {
    return c.json({
      success: false,
      error: "缺少应用ID参数",
    }, 400)
  }
  
  // 设置应用ID到请求头，供子路由使用
  c.req.header("x-application-id", applicationId)
  
  // 路由到应用用户模块
  return applicationUsersRoute.fetch(c.req, {
    applicationId,
  })
}

// 配置模块处理器
async function handleConfigModule(c: any, user: any) {
  const path = c.req.path.replace("/api/modules/system/config", "")
  const applicationId = c.req.query("applicationId") || c.req.header("x-application-id")
  
  if (!applicationId) {
    return c.json({
      success: false,
      error: "缺少应用ID参数",
    }, 400)
  }
  
  // 配置模块的API实现
  switch (c.req.method) {
    case "GET":
      if (path === "/" || path === "") {
        return c.json({
          success: true,
          data: {
            applicationId,
            config: {
              name: "应用配置",
              description: "应用基础配置管理",
              allowRegistration: true,
              requireEmailVerification: false,
            },
          },
        })
      }
      break
      
    case "PUT":
      if (path === "/" || path === "") {
        const body = await c.req.json()
        return c.json({
          success: true,
          data: {
            applicationId,
            config: body,
            updatedAt: new Date().toISOString(),
          },
        })
      }
      break
  }
  
  return c.json({
    success: false,
    error: "配置模块API暂未实现",
  }, 501)
}

// 审计模块处理器
async function handleAuditModule(c: any, user: any) {
  const path = c.req.path.replace("/api/modules/system/audit", "")
  const applicationId = c.req.query("applicationId") || c.req.header("x-application-id")
  
  if (!applicationId) {
    return c.json({
      success: false,
      error: "缺少应用ID参数",
    }, 400)
  }
  
  // 审计模块的API实现
  switch (c.req.method) {
    case "GET":
      if (path === "/" || path === "") {
        return c.json({
          success: true,
          data: {
            applicationId,
            logs: [
              {
                id: "log-1",
                action: "user.login",
                userId: user.id,
                timestamp: new Date().toISOString(),
                details: {
                  ip: "127.0.0.1",
                  userAgent: "Mozilla/5.0...",
                },
              },
            ],
            pagination: {
              page: 1,
              limit: 20,
              total: 1,
              totalPages: 1,
            },
          },
        })
      }
      break
  }
  
  return c.json({
    success: false,
    error: "审计模块API暂未实现",
  }, 501)
}



// 获取所有模块列表（包括本地和远程）
app.get("/", mockRequireAuthMiddleware, async (c) => {
  const user = c.get("user")
  const allModules = moduleRegistry.getAll()
  
  return c.json({
    success: true,
    data: {
      modules: allModules.map(module => ({
        key: module.key,
        name: module.name,
        version: module.version,
        kind: module.kind,
        description: module.description,
        author: module.author,
        homepage: module.homepage,
        routes: module.routes,
        // 远程模块特有信息
        ...(module.kind === 'remote' && {
          baseUrl: module.baseUrl,
        }),
      })),
    },
  })
})

// 获取所有模块列表（兼容性路由）
app.get("/list", mockRequireAuthMiddleware, async (c) => {
  const user = c.get("user")
  const allModules = moduleRegistry.getAll()
  
  return c.json({
    success: true,
    data: {
      modules: allModules.map(module => ({
        key: module.key,
        name: module.name,
        version: module.version,
        kind: module.kind,
        description: module.description,
        author: module.author,
        homepage: module.homepage,
        routes: module.routes,
        // 远程模块特有信息
        ...(module.kind === 'remote' && {
          baseUrl: module.baseUrl,
        }),
      })),
    },
  })
})

// 获取远程模块列表
app.get("/remote", mockRequireAuthMiddleware, async (c) => {
  const user = c.get("user")
  const remoteModules = moduleRegistry.getRemoteModules()
  
  return c.json({
    success: true,
    data: {
      modules: remoteModules.map(module => ({
        key: module.key,
        name: module.name,
        version: module.version,
        baseUrl: module.baseUrl,
        description: module.description,
        author: module.author,
        homepage: module.homepage,
        routes: module.routes,
      })),
    },
  })
})

// 远程模块路由处理（必须在 /:moduleKey 之前）
app.all("/remote/:moduleKey/*", mockRequireAuthMiddleware, async (c) => {
  const user = c.get("user")
  return remoteProxy.fetch(c.req, { user })
})

// 获取特定模块信息
app.get("/:moduleKey", mockRequireAuthMiddleware, async (c) => {
  const moduleKey = c.req.param("moduleKey")
  const user = c.get("user")
  const module = moduleRegistry.get(moduleKey)
  
  if (!module) {
    return c.json({
      success: false,
      error: "模块不存在",
    }, 404)
  }
  
  return c.json({
    success: true,
    data: {
      key: module.key,
      name: module.name,
      version: module.version,
      kind: module.kind,
      description: module.description,
      author: module.author,
      homepage: module.homepage,
      routes: module.routes,
      // 远程模块特有信息
      ...(module.kind === 'remote' && {
        baseUrl: module.baseUrl,
      }),
    },
  })
})

// 获取模块图标
function getModuleIcon(moduleKey: string): string {
  const iconMap: Record<string, string> = {
    user: "users",
    config: "settings",
    audit: "activity",
  }
  return iconMap[moduleKey] || "package"
}

export default app
