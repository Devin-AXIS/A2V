import { z } from 'zod'

// 统一身份契约 - 所有模块都依赖这个最小用户态
export const Identity = z.object({
  id: z.string(),
  displayName: z.string().optional(),
  roles: z.array(z.string()).default([]),
})

export type TIdentity = z.infer<typeof Identity>

// 身份验证中间件类型
export interface IdentityContext {
  user?: TIdentity
}

// 创建身份对象的辅助函数
export function createIdentity(id: string, displayName?: string, roles: string[] = []): TIdentity {
  return {
    id,
    displayName,
    roles,
  }
}

// 验证身份对象的辅助函数
export function validateIdentity(data: unknown): TIdentity {
  return Identity.parse(data)
}