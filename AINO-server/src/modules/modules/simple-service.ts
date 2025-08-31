import { db } from "@/db"
import { moduleInstalls } from "@/db/schema"
import { moduleRegistry } from "@/platform/modules/registry"
import { eq, and } from "drizzle-orm"

/**
 * 简化的模块安装服务
 * 遵循开发约束：最小依赖、一次一个API、三层分离
 */
export class SimpleModuleService {
  
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
    
    // 1. 检查模块是否存在于注册表
    const manifest = moduleRegistry.get(moduleKey)
    if (!manifest) {
      throw new Error("模块不存在")
    }
    
    // 2. 检查模块是否已安装
    const isInstalled = await this.isModuleInstalled(applicationId, moduleKey)
    
    if (isInstalled) {
      // 如果已安装，更新配置
      console.log('🔍 模块已安装，更新配置')
      const [updatedModule] = await db
        .update(moduleInstalls)
        .set({
          moduleName: installConfig.name || manifest.name,
          installConfig,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(moduleInstalls.applicationId, applicationId),
            eq(moduleInstalls.moduleKey, moduleKey)
          )
        )
        .returning()
      
      console.log('✅ 模块配置更新成功:', updatedModule)
      return updatedModule
    } else {
      // 如果未安装，创建新模块
      console.log('🔍 模块未安装，创建新模块')
      const [installedModule] = await db
        .insert(moduleInstalls)
        .values({
          applicationId,
          moduleKey,
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
