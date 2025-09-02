import { db } from "@/db"
import { moduleInstalls } from "@/db/schema"
import { moduleRegistry } from "@/platform/modules/registry"
import { eq, and, like, or } from "drizzle-orm"

/**
 * 简化的模块安装服务
 * 遵循开发约束：最小依赖、一次一个API、三层分离
 */
export class SimpleModuleService {
  // 生成唯一实例 key：base、base#2、base#3 ...
  private async generateInstanceKey(applicationId: string, baseModuleKey: string): Promise<string> {
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

    if (existing.length === 0) return baseModuleKey

    let maxIndex = 1
    for (const row of existing) {
      const key = (row as any).key as string
      if (key === baseModuleKey) {
        maxIndex = Math.max(maxIndex, 1)
      } else {
        const parts = key.split('#')
        const idx = parts.length > 1 ? parseInt(parts[1], 10) : NaN
        if (!Number.isNaN(idx)) maxIndex = Math.max(maxIndex, idx)
      }
    }
    return `${baseModuleKey}#${maxIndex + 1}`
  }

  /**
   * 安装模块 - 核心功能
   * @param applicationId 应用ID
   * @param moduleKey 模块标识
   * @param installConfig 安装配置
   * @returns 安装结果
   */
  async installModule(
    applicationId: string,
    moduleKey: string,
    installConfig: Record<string, any> = {}
  ) {
    console.log('🔍 开始安装模块:', { applicationId, moduleKey, installConfig })

    // 1. 以基础 key 解析 manifest
    const baseKey = moduleKey.split('#')[0]
    const manifest = moduleRegistry.get(baseKey)
    if (!manifest) {
      throw new Error("模块不存在")
    }

    // 2. 生成不冲突的实例 key 并始终创建新实例
    const instanceKey = await this.generateInstanceKey(applicationId, baseKey)
    console.log('🔍 生成实例 key:', { baseKey, instanceKey })

    const [installedModule] = await db
      .insert(moduleInstalls)
      .values({
        applicationId,
        moduleKey: instanceKey,
        moduleName: installConfig.name || manifest.name,
        moduleVersion: manifest.version,
        moduleType: manifest.kind === 'local' ? 'local' : 'remote',
        installType: 'market',
        installConfig,
        installStatus: 'active',
      })
      .returning()

    console.log('✅ 模块安装成功:', installedModule)
    return installedModule
  }

  /**
   * 检查模块是否已安装
   * @param applicationId 应用ID
   * @param moduleKey 模块标识
   * @returns 是否已安装
   */
  private async isModuleInstalled(applicationId: string, moduleKey: string): Promise<boolean> {
    const result = await db
      .select({ id: moduleInstalls.id })
      .from(moduleInstalls)
      .where(
        and(
          eq(moduleInstalls.applicationId, applicationId),
          eq(moduleInstalls.moduleKey, moduleKey),
          eq(moduleInstalls.installStatus, 'active')
        )
      )
      .limit(1)

    return result.length > 0
  }

  /**
   * 获取已安装的模块列表
   * @param applicationId 应用ID
   * @returns 模块列表
   */
  async getInstalledModules(applicationId: string) {
    const modules = await db
      .select({
        id: moduleInstalls.id,
        moduleKey: moduleInstalls.moduleKey,
        moduleName: moduleInstalls.moduleName,
        moduleVersion: moduleInstalls.moduleVersion,
        moduleType: moduleInstalls.moduleType,
        installStatus: moduleInstalls.installStatus,
        installConfig: moduleInstalls.installConfig,
        installedAt: moduleInstalls.installedAt,
      })
      .from(moduleInstalls)
      .where(eq(moduleInstalls.applicationId, applicationId))
      .orderBy(moduleInstalls.installedAt)

    return modules
  }
}
