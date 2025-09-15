import { db } from "@/db"
import { moduleInstalls, modules, applications, users } from "@/db/schema"
import { eq, and, like, desc, asc, count, sql, or } from "drizzle-orm"
import type { TGetModulesQuery, TInstallModuleRequest, TUpdateModuleConfigRequest, TUpdateModuleStatusRequest } from "./dto"

export class ModuleRepository {
  // 生成唯一实例 key（支持同类型多实例）
  async generateInstanceKey(applicationId: string, baseModuleKey: string): Promise<{ instanceKey: string; instanceIndex: number }> {
    // 查询已存在的该 base 的所有实例
    const existing = await db
      .select({ key: moduleInstalls.moduleKey })
      .from(moduleInstalls)
      .where(
        and(
          eq(moduleInstalls.applicationId, applicationId),
          or(
            eq(moduleInstalls.moduleKey, baseModuleKey),
            like(moduleInstalls.moduleKey, `${baseModuleKey}#%`)
          )!
        )
      )

    if (existing.length === 0) {
      return { instanceKey: baseModuleKey, instanceIndex: 1 }
    }

    // 提取已用的序号，形如 base#N
    let maxIndex = 1
    for (const row of existing) {
      const key = row.key as unknown as string
      if (key === baseModuleKey) {
        maxIndex = Math.max(maxIndex, 1)
      } else {
        const parts = key.split('#')
        const idx = parts.length > 1 ? parseInt(parts[1], 10) : NaN
        if (!Number.isNaN(idx)) {
          maxIndex = Math.max(maxIndex, idx)
        }
      }
    }

    const nextIndex = maxIndex + 1
    return { instanceKey: `${baseModuleKey}#${nextIndex}`, instanceIndex: nextIndex }
  }

  // 获取模块安装列表
  async findMany(query: TGetModulesQuery & { applicationId: string }) {
    const { page, limit, search, type, status, sortBy, sortOrder, applicationId } = query
    const offset = (page - 1) * limit

    // 构建查询条件
    const whereConditions = [eq(moduleInstalls.applicationId, applicationId)]

    if (search) {
      whereConditions.push(
        or(
          like(moduleInstalls.moduleName, `%${search}%`),
          like(moduleInstalls.moduleKey, `%${search}%`)
        )!
      )
    }

    if (type !== "all") {
      whereConditions.push(eq(moduleInstalls.moduleType, type))
    }

    if (status !== "all") {
      whereConditions.push(eq(moduleInstalls.installStatus, status))
    }

    // 排序
    const orderBy = sortOrder === "asc" ? asc : desc
    let orderColumn
    switch (sortBy) {
      case "name":
        orderColumn = moduleInstalls.moduleName
        break
      case "status":
        orderColumn = moduleInstalls.installStatus
        break
      case "installedAt":
      default:
        orderColumn = moduleInstalls.installedAt
        break
    }

    // 查询总数 - 使用原始SQL绕过Drizzle问题
    console.log('🔍 查询模块总数，applicationId:', applicationId)
    const totalResult = await db.execute(sql.raw(`
      SELECT COUNT(*) as count 
      FROM module_installs 
      WHERE application_id = '${applicationId}'
    `))
    const total = parseInt(totalResult.rows[0].count as string)

    // 查询模块列表
    console.log('🔍 查询模块列表，applicationId:', applicationId)
    const modules = await db
      .select()
      .from(moduleInstalls)
      .where(eq(moduleInstalls.applicationId, applicationId))
      .orderBy(sortOrder === "desc" ? desc(orderColumn) : asc(orderColumn))
      .limit(limit)
      .offset((page - 1) * limit)

    return {
      modules,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  // 获取单个模块安装记录
  async findById(id: string) {
    const [module] = await db
      .select()
      .from(moduleInstalls)
      .where(eq(moduleInstalls.id, id))
      .limit(1)

    return module
  }

  // 根据应用ID和模块Key获取安装记录
  async findByAppAndModule(applicationId: string, moduleKey: string) {
    console.log('🔍 findByAppAndModule 查询参数:', { applicationId, moduleKey })

    // 先尝试从 module_installs 表查询
    let [module] = await db
      .select()
      .from(moduleInstalls)
      .where(
        and(
          eq(moduleInstalls.applicationId, applicationId),
          eq(moduleInstalls.moduleKey, moduleKey)
        )
      )
      .limit(1)

    console.log('🔍 module_installs 表查询结果:', module)

    if (module) {
      console.log('✅ 从 module_installs 表找到模块')
      return module
    }

    // 如果 module_installs 表没有数据，从 modules 表查询
    console.log('🔍 尝试从 modules 表查询...')

    // 尝试多种查询方式：按名称、按ID、按类型
    let [moduleFromModules] = await db
      .select()
      .from(modules)
      .where(
        and(
          eq(modules.applicationId, applicationId),
          eq(modules.name, moduleKey)
        )
      )
      .limit(1)

    if (!moduleFromModules) {
      // 如果按名称没找到，尝试按ID查找
      console.log('🔍 按名称没找到，尝试按ID查找...')
      if (moduleKey.length === 36) { // UUID长度
        [moduleFromModules] = await db
          .select()
          .from(modules)
          .where(
            and(
              eq(modules.applicationId, applicationId),
              eq(modules.id, moduleKey)
            )
          )
          .limit(1)
      }

      // 如果还是没找到，尝试模糊匹配名称
      if (!moduleFromModules) {
        console.log('🔍 尝试模糊匹配模块名称...')
        const allModules = await db
          .select()
          .from(modules)
          .where(eq(modules.applicationId, applicationId))

        console.log('🔍 该应用的所有模块:', allModules.map(m => ({ id: m.id, name: m.name, type: m.type })))

        // 查找名称包含 moduleKey 的模块
        moduleFromModules = allModules.find(m =>
          m.name.includes(moduleKey) || moduleKey.includes(m.name)
        )!
      }
    }

    // 如果 modules 表也没找到，尝试从 moduleInstalls 表按名称查找
    if (!moduleFromModules) {
      console.log('🔍 尝试从 moduleInstalls 表按名称查找...')
      const [moduleFromInstalls] = await db
        .select()
        .from(moduleInstalls)
        .where(
          and(
            eq(moduleInstalls.applicationId, applicationId),
            eq(moduleInstalls.moduleName, moduleKey)
          )
        )
        .limit(1)

      if (moduleFromInstalls) {
        console.log('✅ 从 moduleInstalls 表按名称找到模块')
        return moduleFromInstalls
      }

      // 如果按名称没找到，尝试模糊匹配
      console.log('🔍 尝试从 moduleInstalls 表模糊匹配...')
      const allInstalledModules = await db
        .select()
        .from(moduleInstalls)
        .where(eq(moduleInstalls.applicationId, applicationId))

      console.log('🔍 该应用的所有已安装模块:', allInstalledModules.map(m => ({ id: m.id, moduleKey: m.moduleKey, moduleName: m.moduleName, moduleType: m.moduleType })))

      // 查找名称包含 moduleKey 的模块
      const foundModule = allInstalledModules.find(m =>
        m.moduleName.includes(moduleKey) || moduleKey.includes(m.moduleName) ||
        m.moduleKey.includes(moduleKey) || moduleKey.includes(m.moduleKey)
      )

      if (foundModule) {
        console.log('✅ 从 moduleInstalls 表模糊匹配找到模块')
        return foundModule
      }
    }

    console.log('🔍 modules 表查询结果:', moduleFromModules)

    if (moduleFromModules) {
      console.log('✅ 从 modules 表找到模块，转换为兼容格式')
      // 转换为兼容的格式
      return {
        id: moduleFromModules.id,
        applicationId: moduleFromModules.applicationId,
        moduleKey: moduleFromModules.name,
        moduleName: moduleFromModules.name,
        moduleVersion: "1.0.0",
        moduleType: moduleFromModules.type === "system" ? "system" : "local",
        installType: "custom",
        installConfig: moduleFromModules.config,
        installStatus: "active",
        installError: null,
        installedAt: moduleFromModules.createdAt,
        updatedAt: moduleFromModules.updatedAt,
        createdBy: null,
      }
    }

    console.log('❌ 两个表都没有找到模块')
    return null
  }

  // 安装模块
  async install(data: TInstallModuleRequest & {
    applicationId: string
    moduleName: string
    moduleType: "system" | "local" | "remote"
    installType: "system" | "market" | "custom"
    createdBy?: string
  }) {
    const insertData: any = {
      applicationId: data.applicationId,
      moduleKey: data.moduleKey,
      moduleName: data.moduleName,
      moduleVersion: data.moduleVersion,
      moduleType: data.moduleType,
      installType: data.installType,
      installConfig: data.installConfig,
      installStatus: "active",
    }

    // 只有当 createdBy 存在时才添加到插入数据中
    if (data.createdBy) {
      insertData.createdBy = data.createdBy
    }

    const [module] = await db
      .insert(moduleInstalls)
      .values(insertData)
      .returning()

    return module
  }

  // 更新模块配置
  async updateConfig(data: TUpdateModuleConfigRequest & { applicationId: string }) {
    const [module] = await db
      .update(moduleInstalls)
      .set({
        installConfig: data.config,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(moduleInstalls.applicationId, data.applicationId),
          eq(moduleInstalls.moduleKey, data.moduleKey)
        )
      )
      .returning()

    return module
  }

  // 更新模块状态
  async updateStatus(data: TUpdateModuleStatusRequest & { applicationId: string }) {
    const [module] = await db
      .update(moduleInstalls)
      .set({
        installStatus: data.status,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(moduleInstalls.applicationId, data.applicationId),
          eq(moduleInstalls.moduleKey, data.moduleKey)
        )
      )
      .returning()

    return module
  }

  // 设置安装错误
  async setInstallError(applicationId: string, moduleKey: string, error: string) {
    const [module] = await db
      .update(moduleInstalls)
      .set({
        installStatus: "error",
        installError: error,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(moduleInstalls.applicationId, applicationId),
          eq(moduleInstalls.moduleKey, moduleKey)
        )
      )
      .returning()

    return module
  }

  // 卸载模块
  async uninstall(applicationId: string, moduleKey: string) {
    console.log('🔍 卸载模块:', { applicationId, moduleKey })

    // 先尝试从 module_installs 表卸载（按 moduleKey 字段）
    try {
      const [deletedModule] = await db
        .delete(moduleInstalls)
        .where(
          and(
            eq(moduleInstalls.applicationId, applicationId),
            eq(moduleInstalls.moduleKey, moduleKey)
          )
        )
        .returning()

      if (deletedModule) {
        console.log('✅ 从 module_installs 表按 moduleKey 卸载成功')
        return deletedModule
      }
    } catch (error) {
      console.log('⚠️ 从 module_installs 表按 moduleKey 卸载失败:', error)
    }

    // 如果按 moduleKey 没找到，尝试按 moduleName 字段
    try {
      const [deletedModule] = await db
        .delete(moduleInstalls)
        .where(
          and(
            eq(moduleInstalls.applicationId, applicationId),
            eq(moduleInstalls.moduleName, moduleKey)
          )
        )
        .returning()

      if (deletedModule) {
        console.log('✅ 从 module_installs 表按 moduleName 卸载成功')
        return deletedModule
      }
    } catch (error) {
      console.log('⚠️ 从 module_installs 表按 moduleName 卸载失败:', error)
    }

    // 如果 module_installs 表没有数据，从 modules 表卸载
    console.log('🔍 尝试从 modules 表卸载...')
    const [deletedModule] = await db
      .delete(modules)
      .where(
        and(
          eq(modules.applicationId, applicationId),
          eq(modules.name, moduleKey)
        )
      )
      .returning()

    if (deletedModule) {
      console.log('✅ 从 modules 表卸载成功')
      return deletedModule
    }

    console.log('❌ 两个表都没有找到要卸载的模块')
    throw new Error('模块未找到')
  }

  // 检查模块是否已安装
  async isInstalled(applicationId: string, moduleKey: string): Promise<boolean> {
    console.log('🔍 检查模块是否已安装:', { applicationId, moduleKey })

    const result = await db.execute(sql`
      SELECT id FROM module_installs 
      WHERE application_id = ${applicationId} 
      AND module_key = ${moduleKey}
      AND install_status != 'error'
      LIMIT 1
    `)

    console.log('🔍 查询结果:', { rows: result.rows, length: result.rows.length })
    const isInstalled = result.rows.length > 0
    console.log('🔍 是否已安装:', isInstalled)

    return isInstalled
  }

  // 获取应用已安装的模块列表
  async getInstalledModules(applicationId: string) {
    const modules = await db
      .select({
        moduleKey: moduleInstalls.moduleKey,
        moduleName: moduleInstalls.moduleName,
        moduleVersion: moduleInstalls.moduleVersion,
        moduleType: moduleInstalls.moduleType,
        installStatus: moduleInstalls.installStatus,
      })
      .from(moduleInstalls)
      .where(eq(moduleInstalls.applicationId, applicationId))

    return modules
  }

  // 获取模块统计信息
  async getModuleStats(applicationId: string) {
    const [stats] = await db
      .select({
        total: count(),
        active: sql<number>`COUNT(CASE WHEN ${moduleInstalls.installStatus} = 'active' THEN 1 END)`,
        disabled: sql<number>`COUNT(CASE WHEN ${moduleInstalls.installStatus} = 'disabled' THEN 1 END)`,
        error: sql<number>`COUNT(CASE WHEN ${moduleInstalls.installStatus} = 'error' THEN 1 END)`,
        system: sql<number>`COUNT(CASE WHEN ${moduleInstalls.moduleType} = 'system' THEN 1 END)`,
        local: sql<number>`COUNT(CASE WHEN ${moduleInstalls.moduleType} = 'local' THEN 1 END)`,
        remote: sql<number>`COUNT(CASE WHEN ${moduleInstalls.moduleType} = 'remote' THEN 1 END)`,
      })
      .from(moduleInstalls)
      .where(eq(moduleInstalls.applicationId, applicationId))

    return {
      total: stats.total.toString(),
      active: stats.active.toString(),
      disabled: stats.disabled.toString(),
      error: stats.error.toString(),
      system: stats.system.toString(),
      local: stats.local.toString(),
      remote: stats.remote.toString(),
    }
  }
}
