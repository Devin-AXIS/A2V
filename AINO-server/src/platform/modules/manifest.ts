import { z } from 'zod'

// 模块路由定义
export const ModuleRoute = z.object({
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
  path: z.string(),
  description: z.string().optional(),
})

// 模块Manifest最小模型
export const ModuleManifest = z.object({
  key: z.string(),
  name: z.string(),
  version: z.string(),
  kind: z.enum(['local', 'remote']),
  routes: z.array(ModuleRoute),
  description: z.string().optional(),
  author: z.string().optional(),
  homepage: z.string().optional(),
  // 远程模块特有字段
  baseUrl: z.string().optional(), // 远程模块的基础URL
  hmacSecret: z.string().optional(), // HMAC签名密钥
})

export type TModuleManifest = z.infer<typeof ModuleManifest>
export type TModuleRoute = z.infer<typeof ModuleRoute>

// 模块类型枚举
export const ModuleKind = {
  LOCAL: 'local' as const,
  REMOTE: 'remote' as const,
} as const

// 创建本地模块Manifest的辅助函数
export function createLocalModuleManifest(
  key: string,
  name: string,
  version: string,
  routes: TModuleRoute[],
  options?: {
    description?: string
    author?: string
    homepage?: string
  }
): TModuleManifest {
  return {
    key,
    name,
    version,
    kind: ModuleKind.LOCAL,
    routes,
    description: options?.description,
    author: options?.author,
    homepage: options?.homepage,
  }
}

// 创建远程模块Manifest的辅助函数
export function createRemoteModuleManifest(
  key: string,
  name: string,
  version: string,
  baseUrl: string,
  routes: TModuleRoute[],
  options?: {
    description?: string
    author?: string
    homepage?: string
    hmacSecret?: string
  }
): TModuleManifest {
  return {
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
  }
}

// 验证模块Manifest的辅助函数
export function validateModuleManifest(data: unknown): TModuleManifest {
  return ModuleManifest.parse(data)
}
