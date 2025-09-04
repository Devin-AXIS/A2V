import { ModuleRepository } from "./repo"
import { moduleRegistry, registerSystemModules } from "../../platform/modules/registry"
import type {
  TInstallModuleRequest,
  TUninstallModuleRequest,
  TUpdateModuleConfigRequest,
  TUpdateModuleStatusRequest,
  TGetModulesQuery,
  TModuleDependencyResponse
} from "./dto"

export class ModuleService {
  private repo = new ModuleRepository()

  // 获取模块列表
  async getModules(query: TGetModulesQuery & { applicationId: string }) {
    console.log('🔍 Service.getModules 调用，query:', query)
    return await this.repo.findMany(query)
  }

  // 获取模块详情
  async getModuleDetail(applicationId: string, moduleKey: string) {
    const module = await this.repo.findByAppAndModule(applicationId, moduleKey)
    if (!module) {
      throw new Error("模块未安装")
    }

    // 获取模块manifest信息
    const manifest = moduleRegistry.get(moduleKey)

    // 获取依赖信息
    const dependencies = await this.checkModuleDependencies(applicationId, moduleKey)

    return {
      module,
      manifest,
      dependencies,
    }
  }

  // 安装模块（支持同类型多实例）
  async installModule(
    applicationId: string,
    data: TInstallModuleRequest,
    createdBy?: string
  ) {
    // 以基础 key 查 manifest（允许传入 base 或含实例后缀的 key）
    const baseKey = data.moduleKey.split('#')[0]

    // 检查模块依赖（基于 baseKey）
    const dependencyCheck = await this.checkModuleDependencies(applicationId, baseKey)
    if (!dependencyCheck.canInstall) {
      throw new Error(`模块依赖不满足: ${dependencyCheck.errors?.join(", ")}`)
    }

    // 获取模块信息
    const manifest = moduleRegistry.get(baseKey)
    if (!manifest) {
      throw new Error("模块不存在")
    }

    // 生成实例 key：若 base 已存在则生成 base#N
    const { instanceKey } = await this.repo.generateInstanceKey(applicationId, baseKey)

    try {
      const module = await this.repo.install({
        moduleKey: instanceKey,
        moduleVersion: data.moduleVersion ?? manifest.version,
        installConfig: data.installConfig ?? {},
        applicationId,
        moduleName: manifest.name,
        moduleType: manifest.kind === "local" ? "local" : "remote",
        installType: "market",
        createdBy,
      })

      if (manifest.kind === "local") {
        registerSystemModules()
      }

      return module
    } catch (error) {
      await this.repo.setInstallError(applicationId, baseKey, error instanceof Error ? error.message : "安装失败")
      throw error
    }
  }

  // 卸载模块
  async uninstallModule(applicationId: string, moduleKey: string, data: TUninstallModuleRequest) {
    // 检查模块是否已安装
    const module = await this.repo.findByAppAndModule(applicationId, moduleKey)
    if (!module) {
      throw new Error("模块未安装")
    }

    // 检查是否为系统模块
    if (module.moduleType === "system") {
      throw new Error("系统模块不能卸载")
    }

    // 检查是否有其他模块依赖此模块
    const dependents = await this.checkModuleDependents(applicationId, moduleKey)
    if (dependents.length > 0) {
      throw new Error(`有其他模块依赖此模块: ${dependents.join(", ")}`)
    }

    // 卸载模块
    const uninstalledModule = await this.repo.uninstall(applicationId, moduleKey)

    // 如果保留数据，只标记为已卸载，不删除数据
    if (data.keepData) {
      // 这里可以添加数据保留逻辑
    }

    return uninstalledModule
  }

  // 更新模块配置
  async updateModuleConfig(applicationId: string, data: TUpdateModuleConfigRequest) {
    const module = await this.repo.findByAppAndModule(applicationId, data.moduleKey)
    if (!module) {
      throw new Error("模块未安装")
    }

    return await this.repo.updateConfig({ ...data, applicationId })
  }

  // 更新模块状态
  async updateModuleStatus(applicationId: string, data: TUpdateModuleStatusRequest) {
    const module = await this.repo.findByAppAndModule(applicationId, data.moduleKey)
    if (!module) {
      throw new Error("模块未安装")
    }

    return await this.repo.updateStatus({ ...data, applicationId })
  }

  // 检查模块依赖
  async checkModuleDependencies(applicationId: string, moduleKey: string): Promise<TModuleDependencyResponse> {
    const baseKey = moduleKey.split('#')[0]
    const manifest = moduleRegistry.get(baseKey)
    if (!manifest) {
      return {
        moduleKey: baseKey,
        dependencies: [],
        canInstall: false,
        errors: ["模块不存在"],
      }
    }

    // 获取已安装的模块
    const installedModules = await this.repo.getInstalledModules(applicationId)
    const installedMap = new Map(installedModules.map(m => [m.moduleKey, m.moduleVersion]))

    // 临时跳过依赖检查，允许安装所有模块
    const dependencies = []
    const canInstall = true
    const errors = []

    return {
      moduleKey: baseKey,
      dependencies,
      canInstall,
      errors: errors.length > 0 ? errors : undefined,
    }
  }

  // 检查模块被依赖情况
  async checkModuleDependents(applicationId: string, moduleKey: string): Promise<string[]> {
    // 这里应该检查哪些模块依赖了当前模块
    // 简化实现，实际应该从模块manifest中获取依赖关系
    const installedModules = await this.repo.getInstalledModules(applicationId)

    // 示例：检查是否有其他模块依赖当前模块
    const dependents: string[] = []
    for (const module of installedModules) {
      if (module.moduleKey !== moduleKey) {
        // 这里应该检查模块的依赖关系
        // 简化处理，假设没有依赖关系
      }
    }

    return dependents
  }

  // 获取模块统计信息
  async getModuleStats(applicationId: string) {
    return await this.repo.getModuleStats(applicationId)
  }

  // 获取可用模块列表（从模块注册表）
  async getAvailableModules() {
    return moduleRegistry.getAll()
  }

  // 获取系统模块列表
  async getSystemModules() {
    return moduleRegistry.getLocalModules()
  }

  // 获取远程模块列表
  async getRemoteModules() {
    return moduleRegistry.getRemoteModules()
  }

  // 初始化应用系统模块 - 只安装真正的系统模块
  async initializeSystemModules(applicationId: string, createdBy?: string) {
    // 只安装用户模块，其他模块由用户主动安装
    const systemModuleKeys = ['user'] // 只包含真正的系统模块
    const installedModules = await this.repo.getInstalledModules(applicationId)
    const installedKeys = new Set(installedModules.map(m => m.moduleKey))

    const results = []
    for (const moduleKey of systemModuleKeys) {
      if (!installedKeys.has(moduleKey)) {
        const module = moduleRegistry.get(moduleKey)
        if (module) {
          try {
            const installed = await this.repo.install({
              applicationId,
              moduleKey: module.key,
              moduleName: module.name,
              moduleVersion: module.version,
              moduleType: "system",
              installType: "system",
              installConfig: {},
              createdBy,
            })
            results.push(installed)
          } catch (error) {
            console.error(`Failed to install system module ${module.key}:`, error)
          }
        }
      }
    }

    return results
  }
}
