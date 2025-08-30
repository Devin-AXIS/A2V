import { TModuleManifest, ModuleKind } from './manifest'

// 模块注册表
class ModuleRegistry {
  private modules: Map<string, TModuleManifest> = new Map()

  // 注册模块
  register(manifest: TModuleManifest): void {
    this.modules.set(manifest.key, manifest)
  }

  // 获取模块
  get(key: string): TModuleManifest | undefined {
    return this.modules.get(key)
  }

  // 获取所有模块
  getAll(): TModuleManifest[] {
    return Array.from(this.modules.values())
  }

  // 获取本地模块
  getLocalModules(): TModuleManifest[] {
    return this.getAll().filter(module => module.kind === ModuleKind.LOCAL)
  }

  // 获取远程模块
  getRemoteModules(): TModuleManifest[] {
    return this.getAll().filter(module => module.kind === ModuleKind.REMOTE)
  }

  // 检查模块是否存在
  has(key: string): boolean {
    return this.modules.has(key)
  }

  // 注销模块
  unregister(key: string): boolean {
    return this.modules.delete(key)
  }

  // 清空注册表
  clear(): void {
    this.modules.clear()
  }

  // 获取模块数量
  size(): number {
    return this.modules.size
  }
}

// 全局模块注册表实例
export const moduleRegistry = new ModuleRegistry()

// 注册系统模块
export function registerSystemModules(): void {
  // 用户模块
  moduleRegistry.register({
    key: 'user',
    name: '用户管理',
    version: '1.0.0',
    kind: ModuleKind.LOCAL,
    routes: [
      { method: 'GET', path: '/me', description: '获取当前用户信息' },
      { method: 'POST', path: '/login', description: '用户登录' },
      { method: 'POST', path: '/register', description: '用户注册' },
      { method: 'POST', path: '/logout', description: '用户登出' },
    ],
    description: '应用内用户管理，支持用户注册、登录、权限管理',
  })

  // 配置模块
  moduleRegistry.register({
    key: 'config',
    name: '系统配置',
    version: '1.0.0',
    kind: ModuleKind.LOCAL,
    routes: [
      { method: 'GET', path: '/', description: '获取系统配置' },
      { method: 'PUT', path: '/', description: '更新系统配置' },
    ],
    description: '应用基础配置管理',
  })

  // 审计模块
  moduleRegistry.register({
    key: 'audit',
    name: '审计日志',
    version: '1.0.0',
    kind: ModuleKind.LOCAL,
    routes: [
      { method: 'GET', path: '/logs', description: '获取审计日志' },
      { method: 'POST', path: '/logs', description: '创建审计日志' },
    ],
    description: '记录用户操作和系统事件',
  })
}

// 注册远程模块的辅助函数
export function registerRemoteModule(
  key: string,
  name: string,
  version: string,
  baseUrl: string,
  routes: Array<{ method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'; path: string; description?: string }>,
  options?: {
    description?: string
    author?: string
    homepage?: string
    hmacSecret?: string
  }
): void {
  moduleRegistry.register({
    key,
    name,
    version,
    kind: ModuleKind.REMOTE,
    baseUrl,
    routes,
    description: options?.description,
    author: options?.author,
    homepage: options?.homepage,
    hmacSecret: options?.hmacSecret,
  })
}

// 获取模块路由的辅助函数
export function getModuleRoutes(key: string): Array<{ method: string; path: string; description?: string }> {
  const module = moduleRegistry.get(key)
  return module?.routes || []
}

// 检查模块是否为远程模块
export function isRemoteModule(key: string): boolean {
  const module = moduleRegistry.get(key)
  return module?.kind === ModuleKind.REMOTE
}

// 获取远程模块的基础URL
export function getRemoteModuleBaseUrl(key: string): string | undefined {
  const module = moduleRegistry.get(key)
  return module?.kind === ModuleKind.REMOTE ? module.baseUrl : undefined
}
