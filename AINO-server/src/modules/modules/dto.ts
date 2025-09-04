import { z } from 'zod'

// 模块安装请求
export const InstallModuleRequest = z.object({
  moduleKey: z.string().min(1, "模块标识不能为空"),
  moduleVersion: z.string().optional().default("latest"),
  installConfig: z.record(z.string(), z.any()).optional().default({}),
})

export type TInstallModuleRequest = z.infer<typeof InstallModuleRequest>

// 模块卸载请求
export const UninstallModuleRequest = z.object({
  keepData: z.boolean().optional().default(false), // 是否保留数据
})

export type TUninstallModuleRequest = z.infer<typeof UninstallModuleRequest>

// 模块配置更新请求
export const UpdateModuleConfigRequest = z.object({
  moduleKey: z.string().min(1, "模块标识不能为空"),
  config: z.record(z.string(), z.any()),
})

export type TUpdateModuleConfigRequest = z.infer<typeof UpdateModuleConfigRequest>

// 模块状态更新请求
export const UpdateModuleStatusRequest = z.object({
  moduleKey: z.string().min(1, "模块标识不能为空"),
  status: z.enum(["active", "disabled", "uninstalling"]),
})

export type TUpdateModuleStatusRequest = z.infer<typeof UpdateModuleStatusRequest>

// 模块查询请求
export const GetModulesQuery = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  type: z.enum(["system", "local", "remote", "all"]).optional().default("all"),
  status: z.enum(["active", "disabled", "uninstalling", "error", "all"]).optional().default("all"),
  sortBy: z.enum(["name", "installedAt", "status"]).optional().default("installedAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
})

export type TGetModulesQuery = z.infer<typeof GetModulesQuery>

// 模块安装记录响应
export const ModuleInstallResponse = z.object({
  id: z.string(),
  applicationId: z.string(),
  moduleKey: z.string(),
  moduleName: z.string(),
  moduleVersion: z.string(),
  moduleType: z.enum(["system", "local", "remote"]),
  installType: z.enum(["system", "market", "custom"]),
  installConfig: z.record(z.string(), z.any()),
  installStatus: z.enum(["active", "disabled", "uninstalling", "error"]),
  installError: z.string().nullable(),
  installedAt: z.string(),
  updatedAt: z.string(),
  createdBy: z.string().nullable(),
})

export type TModuleInstallResponse = z.infer<typeof ModuleInstallResponse>

// 模块列表响应
export const ModuleListResponse = z.object({
  modules: z.array(ModuleInstallResponse),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
})

export type TModuleListResponse = z.infer<typeof ModuleListResponse>

// 模块详情响应
export const ModuleDetailResponse = z.object({
  module: ModuleInstallResponse,
  manifest: z.object({
    key: z.string(),
    name: z.string(),
    version: z.string(),
    kind: z.enum(["local", "remote"]),
    description: z.string().optional(),
    author: z.string().optional(),
    homepage: z.string().optional(),
    routes: z.array(z.object({
      method: z.string(),
      path: z.string(),
      description: z.string().optional(),
    })),
  }).optional(),
  dependencies: z.array(z.object({
    moduleKey: z.string(),
    version: z.string(),
    status: z.enum(["installed", "missing", "incompatible"]),
  })).optional(),
})

export type TModuleDetailResponse = z.infer<typeof ModuleDetailResponse>

// 模块操作响应
export const ModuleOperationResponse = z.object({
  success: z.boolean(),
  message: z.string(),
  module: ModuleInstallResponse.optional(),
})

export type TModuleOperationResponse = z.infer<typeof ModuleOperationResponse>

// 模块依赖检查响应
export const ModuleDependencyResponse = z.object({
  moduleKey: z.string(),
  dependencies: z.array(z.object({
    moduleKey: z.string(),
    requiredVersion: z.string(),
    installedVersion: z.string().nullable(),
    status: z.enum(["satisfied", "missing", "incompatible"]),
  })),
  canInstall: z.boolean(),
  errors: z.array(z.string()).optional(),
})

export type TModuleDependencyResponse = z.infer<typeof ModuleDependencyResponse>
