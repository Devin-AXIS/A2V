import { z } from 'zod'

// 系统模块配置
export const SystemModuleConfig = z.object({
  allowRegistration: z.boolean().default(true),
  requireEmailVerification: z.boolean().default(false),
  defaultRole: z.string().default('user'),
  passwordPolicy: z.object({
    minLength: z.number().default(6),
    requireUppercase: z.boolean().default(false),
    requireLowercase: z.boolean().default(false),
    requireNumbers: z.boolean().default(false),
    requireSpecialChars: z.boolean().default(false),
  }).default({}),
})

export type TSystemModuleConfig = z.infer<typeof SystemModuleConfig>

// 系统模块定义
export const SYSTEM_MODULES = [
  {
    key: 'user',
    name: '用户管理',
    type: 'system' as const,
    icon: 'users',
    description: '应用内用户管理，支持用户注册、登录、权限管理',
    config: SystemModuleConfig.parse({
      allowRegistration: true,
      requireEmailVerification: false,
      defaultRole: 'user',
      passwordPolicy: {
        minLength: 6,
        requireUppercase: false,
        requireLowercase: false,
        requireNumbers: false,
        requireSpecialChars: false,
      },
    }),
  },
  {
    key: 'config',
    name: '系统配置',
    type: 'system' as const,
    icon: 'settings',
    description: '应用基础配置管理',
    config: {},
  },
  {
    key: 'audit',
    name: '审计日志',
    type: 'system' as const,
    icon: 'activity',
    description: '记录用户操作和系统事件',
    config: {},
  },
] as const

export type SystemModuleKey = typeof SYSTEM_MODULES[number]['key']

// 获取系统模块配置
export function getSystemModule(key: SystemModuleKey) {
  return SYSTEM_MODULES.find(module => module.key === key)
}

// 获取所有系统模块
export function getAllSystemModules() {
  return SYSTEM_MODULES
}
