import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { mockRequireAuthMiddleware } from "../../middleware/auth"
import { SYSTEM_MODULES } from "../../lib/system-modules"
import applicationUsersRoute from "../application-users/routes"
import { moduleRegistry, registerSystemModules, isRemoteModule } from "../../platform/modules/registry"
import remoteProxy from "../../platform/modules/proxy"
import { ModuleService } from "./service"
import {
  InstallModuleRequest,
  UninstallModuleRequest,
  UpdateModuleConfigRequest,
  UpdateModuleStatusRequest,
  GetModulesQuery,
} from "./dto"

const app = new Hono()

// 添加调试中间件
app.use("*", async (c, next) => {
  console.log('🔍 模块路由请求:', c.req.method, c.req.url)
  await next()
})

// 初始化系统模块注册
registerSystemModules()

// 模块管理服务实例
const moduleService = new ModuleService()

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

// ==================== 模块管理API ====================
app.get("/installed", mockRequireAuthMiddleware, zValidator("query", GetModulesQuery), async (c) => {
  console.log('🔍 /installed 路由被调用')
  const user = c.get("user")
  const query = c.req.valid("query")
  const applicationId = c.req.query("applicationId") || c.req.header("x-application-id")
  
  console.log('🔍 路由参数:', { query, applicationId })
  
  if (!applicationId) {
    return c.json({
      success: false,
      error: "缺少应用ID参数",
    }, 400)
  }

  try {
    console.log('🔍 调用 moduleService.getModules')
    const result = await moduleService.getModules({ ...query, applicationId })
    console.log('✅ 获取模块成功:', result)
    return c.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.log('❌ 获取模块失败:', error)
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : "获取模块列表失败",
    }, 500)
  }
})

app.get("/installed/:moduleKey", mockRequireAuthMiddleware, async (c) => {
  const user = c.get("user")
  const moduleKey = c.req.param("moduleKey")
  const applicationId = c.req.query("applicationId") || c.req.header("x-application-id")
  
  if (!applicationId) {
    return c.json({
      success: false,
      error: "缺少应用ID参数",
    }, 400)
  }

  try {
    const result = await moduleService.getModuleDetail(applicationId, moduleKey)
    return c.json({
      success: true,
      data: result,
    })
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : "获取模块详情失败",
    }, 500)
  }
})

app.post("/install", mockRequireAuthMiddleware, zValidator("json", InstallModuleRequest), async (c) => {
  const user = c.get("user")
  const data = c.req.valid("json")
  const applicationId = c.req.query("applicationId") || c.req.header("x-application-id")
  
  if (!applicationId) {
    return c.json({
      success: false,
      error: "缺少应用ID参数",
    }, 400)
  }

  try {
    const result = await moduleService.installModule(applicationId, data, user.id)
    return c.json({
      success: true,
      data: result,
    })
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : "安装模块失败",
    }, 500)
  }
})

app.delete("/uninstall/:moduleKey", mockRequireAuthMiddleware, zValidator("json", UninstallModuleRequest), async (c) => {
  const user = c.get("user")
  const moduleKey = c.req.param("moduleKey")
  const data = c.req.valid("json")
  const applicationId = c.req.query("applicationId") || c.req.header("x-application-id")
  
  if (!applicationId) {
    return c.json({
      success: false,
      error: "缺少应用ID参数",
    }, 400)
  }

  try {
    const result = await moduleService.uninstallModule(applicationId, moduleKey, data, user.id)
    return c.json({
      success: true,
      data: result,
    })
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : "卸载模块失败",
    }, 500)
  }
})

app.put("/config/:moduleKey", mockRequireAuthMiddleware, zValidator("json", UpdateModuleConfigRequest), async (c) => {
  const user = c.get("user")
  const moduleKey = c.req.param("moduleKey")
  const data = c.req.valid("json")
  const applicationId = c.req.query("applicationId") || c.req.header("x-application-id")
  
  if (!applicationId) {
    return c.json({
      success: false,
      error: "缺少应用ID参数",
    }, 400)
  }

  try {
    const result = await moduleService.updateModuleConfig(applicationId, moduleKey, data.config, user.id)
    return c.json({
      success: true,
      data: result,
    })
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : "更新模块配置失败",
    }, 500)
  }
})

app.patch("/status/:moduleKey", mockRequireAuthMiddleware, zValidator("json", UpdateModuleStatusRequest), async (c) => {
  const user = c.get("user")
  const moduleKey = c.req.param("moduleKey")
  const data = c.req.valid("json")
  const applicationId = c.req.query("applicationId") || c.req.header("x-application-id")
  
  if (!applicationId) {
    return c.json({
      success: false,
      error: "缺少应用ID参数",
    }, 400)
  }

  try {
    const result = await moduleService.updateModuleStatus(applicationId, moduleKey, data.status, user.id)
    return c.json({
      success: true,
      data: result,
    })
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : "更新模块状态失败",
    }, 500)
  }
})

app.get("/dependencies/:moduleKey", mockRequireAuthMiddleware, async (c) => {
  const user = c.get("user")
  const moduleKey = c.req.param("moduleKey")
  const applicationId = c.req.query("applicationId") || c.req.header("x-application-id")
  
  if (!applicationId) {
    return c.json({
      success: false,
      error: "缺少应用ID参数",
    }, 400)
  }

  try {
    const result = await moduleService.checkModuleDependencies(applicationId, moduleKey)
    return c.json({
      success: true,
      data: result,
    })
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : "检查模块依赖失败",
    }, 500)
  }
})

app.get("/stats", mockRequireAuthMiddleware, async (c) => {
  const user = c.get("user")
  const applicationId = c.req.query("applicationId") || c.req.header("x-application-id")
  
  if (!applicationId) {
    return c.json({
      success: false,
      error: "缺少应用ID参数",
    }, 400)
  }

  try {
    const result = await moduleService.getModuleStats(applicationId)
    return c.json({
      success: true,
      data: result,
    })
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : "获取模块统计失败",
    }, 500)
  }
})

app.get("/available", mockRequireAuthMiddleware, async (c) => {
  const user = c.get("user")

  try {
    const result = await moduleService.getAvailableModules()
    return c.json({
      success: true,
      data: result,
    })
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : "获取可用模块失败",
    }, 500)
  }
})

app.post("/initialize-system", mockRequireAuthMiddleware, async (c) => {
  const user = c.get("user")
  const applicationId = c.req.query("applicationId") || c.req.header("x-application-id")
  
  if (!applicationId) {
    return c.json({
      success: false,
      error: "缺少应用ID参数",
    }, 400)
  }

  try {
    const result = await moduleService.initializeSystemModules(applicationId, user.id)
    return c.json({
      success: true,
      data: result,
    })
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : "初始化系统模块失败",
    }, 500)
  }
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
  
  // 本地系统模块处理 - 只支持用户模块
  const validModules = ["user"]
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

// 注释掉配置模块和审计模块的处理器
// 配置模块处理器
// async function handleConfigModule(c: any, user: any) {
//   const path = c.req.path.replace("/api/modules/system/config", "")
//   const applicationId = c.req.query("applicationId") || c.req.header("x-application-id")
//   
//   if (!applicationId) {
//     return c.json({
//       success: false,
//       error: "缺少应用ID参数",
//     }, 400)
//   }
//   
//   // 配置模块的API实现
//   switch (c.req.method) {
//     case "GET":
//       if (path === "/" || path === "") {
//         return c.json({
//           success: true,
//           data: {
//             applicationId,
//             config: {
//               name: "应用配置",
//               description: "应用基础配置管理",
//               allowRegistration: true,
//               requireEmailVerification: false,
//             },
//           },
//         })
//       }
//       break
//       
//     case "PUT":
//       if (path === "/" || path === "") {
//         const body = await c.req.json()
//         return c.json({
//           success: true,
//           data: {
//             applicationId,
//             config: body,
//             updatedAt: new Date().toISOString(),
//           },
//         })
//       }
//       break
//   }
//   
//   return c.json({
//     success: false,
//     error: "配置模块API暂未实现",
//   }, 501)
// }

// 审计模块处理器
// async function handleAuditModule(c: any, user: any) {
//   const path = c.req.path.replace("/api/modules/system/audit", "")
//   const applicationId = c.req.query("applicationId") || c.req.header("x-application-id")
//   
//   if (!applicationId) {
//     return c.json({
//       success: false,
//       error: "缺少应用ID参数",
//     }, 400)
//   }
//   
//   // 审计模块的API实现
//   switch (c.req.method) {
//     case "GET":
//       if (path === "/" || path === "") {
//         return c.json({
//           success: true,
//           data: {
//             applicationId,
//             logs: [
//               {
//                 id: "log-1",
//                 action: "user.login",
//                 userId: user.id,
//                 timestamp: new Date().toISOString(),
//                 details: {
//                   ip: "127.0.0.1",
//                   userAgent: "Mozilla/5.0...",
//                 },
//               },
//             ],
//             pagination: {
//               page: 1,
//               limit: 20,
//               total: 1,
//               totalPages: 1,
//             },
//           },
//         })
//       }
//       break
//   }
//   
//   return c.json({
//     success: false,
//     error: "审计模块API暂未实现",
//   }, 501)
// }



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


// 获取模块图标
function getModuleIcon(moduleKey: string): string {
  const iconMap: Record<string, string> = {
    user: "users",
    // 注释掉配置和审计模块的图标
    // config: "settings",
    // audit: "activity",
  }
  return iconMap[moduleKey] || "package"
}

export default app
