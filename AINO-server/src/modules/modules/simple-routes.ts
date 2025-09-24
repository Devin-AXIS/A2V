import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { mockRequireAuthMiddleware } from "../../middleware/auth"
import { SimpleModuleService } from "./simple-service"
import { DirectoryService } from "../directories/service";
import { CardsConfig } from '../../lib/cards-config'
import { EducationMainCard } from "../../lib/cards-config/education/main";
import { DirectoryDefsService } from "../directory-defs/service"
import { FieldDefsService } from '../field-defs/service'

const app = new Hono()
const dirService = new DirectoryService()

// 简化的模块安装请求DTO
const SimpleInstallRequest = z.object({
  moduleKey: z.string().min(1, "模块标识不能为空"),
  installConfig: z.record(z.string(), z.any()).optional().default({}),
})

// 模块服务实例
const moduleService = new SimpleModuleService()

/**
 * 安装模块 - 简化版本
 * POST /api/modules/simple/install?applicationId=xxx
 */
app.post("/install", mockRequireAuthMiddleware, zValidator("json", SimpleInstallRequest), async (c) => {
  const user = c.get("user")
  const data = c.req.valid("json")
  const applicationId = c.req.query("applicationId")

  console.log('🔍 模块安装请求:', { applicationId, data, userId: user.id })

  if (!applicationId) {
    return c.json({
      success: false,
      error: "缺少应用ID参数",
    }, 400)
  }

  try {
    const moduleResult = await moduleService.installModule(applicationId, data.moduleKey, data.installConfig)

    const dirCreateData = {
      config: {},
      name: data.installConfig.defaultTableName,
      order: 0,
      supportsCategory: false,
      type: "table",
    }
    const dirResult = await dirService.create(dirCreateData, applicationId, moduleResult.id, user.id);
    const defService = new DirectoryDefsService();
    const defResult = await defService.getOrCreateDirectoryDefByDirectoryId(dirResult.id, applicationId)
    const fieldService = new FieldDefsService();
    const currentCardConfig = CardsConfig[data.moduleKey]
    for (let i = 0; i < currentCardConfig.length; i++) {
      try {
        const current = currentCardConfig[i];
        const params = {
          directoryId: defResult.id,
          key: crypto.randomUUID(),
          kind: "primitive",
          required: false,
          schema: {
            description: "",
            label: current.label,
            placeholder: "",
            showInDetail: true,
            showInForm: true,
            showInList: true,
          },
          type: current.type,
        }
        const fieldDef = await fieldService.createFieldDef(params)
      } catch (e) {
        console.log(e)
      }
    }

    return c.json({
      success: true,
      data: moduleResult,
      message: "模块安装成功",
    })
  } catch (error) {
    console.error('❌ 模块安装失败:', error)

    return c.json({
      success: false,
      error: error instanceof Error ? error.message : "模块安装失败",
    }, 500)
  }
})

/**
 * 获取已安装模块列表 - 简化版本
 * GET /api/modules/simple/installed?applicationId=xxx
 */
app.get("/installed", mockRequireAuthMiddleware, async (c) => {
  const user = c.get("user")
  const applicationId = c.req.query("applicationId")

  if (!applicationId) {
    return c.json({
      success: false,
      error: "缺少应用ID参数",
    }, 400)
  }

  try {
    const modules = await moduleService.getInstalledModules(applicationId)

    return c.json({
      success: true,
      data: {
        modules,
        total: modules.length,
      },
    })
  } catch (error) {
    console.error('❌ 获取模块列表失败:', error)

    return c.json({
      success: false,
      error: error instanceof Error ? error.message : "获取模块列表失败",
    }, 500)
  }
})

export default app
