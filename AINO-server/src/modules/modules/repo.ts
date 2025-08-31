import { db } from "@/db"
import { moduleInstalls, applications, users } from "@/db/schema"
import { eq, and, like, desc, asc, count, sql, or } from "drizzle-orm"
import type { TGetModulesQuery, TInstallModuleRequest, TUpdateModuleConfigRequest, TUpdateModuleStatusRequest } from "./dto"

export class ModuleRepository {
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

    // 查询总数
    const [totalResult] = await db
      .select({ count: count() })
      .from(moduleInstalls)
      .where(and(...whereConditions))

    const total = totalResult.count

    // 查询数据
    const modules = await db
      .select({
        id: moduleInstalls.id,
        applicationId: moduleInstalls.applicationId,
        moduleKey: moduleInstalls.moduleKey,
        moduleName: moduleInstalls.moduleName,
        moduleVersion: moduleInstalls.moduleVersion,
        moduleType: moduleInstalls.moduleType,
        installType: moduleInstalls.installType,
        installConfig: moduleInstalls.installConfig,
        installStatus: moduleInstalls.installStatus,
        installError: moduleInstalls.installError,
        installedAt: moduleInstalls.installedAt,
        updatedAt: moduleInstalls.updatedAt,
        createdBy: moduleInstalls.createdBy,
      })
      .from(moduleInstalls)
      .where(and(...whereConditions))
      .orderBy(orderBy(orderColumn))
      .limit(limit)
      .offset(offset)

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
    const [module] = await db
      .select()
      .from(moduleInstalls)
      .where(
        and(
          eq(moduleInstalls.applicationId, applicationId),
          eq(moduleInstalls.moduleKey, moduleKey)
        )
      )
      .limit(1)

    return module
  }

  // 安装模块
  async install(data: TInstallModuleRequest & { 
    applicationId: string
    moduleName: string
    moduleType: "system" | "local" | "remote"
    installType: "system" | "market" | "custom"
    createdBy?: string
  }) {
    const [module] = await db
      .insert(moduleInstalls)
      .values({
        applicationId: data.applicationId,
        moduleKey: data.moduleKey,
        moduleName: data.moduleName,
        moduleVersion: data.moduleVersion,
        moduleType: data.moduleType,
        installType: data.installType,
        installConfig: data.installConfig,
        installStatus: "active",
        createdBy: data.createdBy,
      })
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
    const [module] = await db
      .delete(moduleInstalls)
      .where(
        and(
          eq(moduleInstalls.applicationId, applicationId),
          eq(moduleInstalls.moduleKey, moduleKey)
        )
      )
      .returning()

    return module
  }

  // 检查模块是否已安装
  async isInstalled(applicationId: string, moduleKey: string): Promise<boolean> {
    const [module] = await db
      .select({ id: moduleInstalls.id })
      .from(moduleInstalls)
      .where(
        and(
          eq(moduleInstalls.applicationId, applicationId),
          eq(moduleInstalls.moduleKey, moduleKey)
        )
      )
      .limit(1)

    return !!module
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

    return stats
  }
}
