import { z } from "zod"

// 应用创建请求
export const CreateApplicationRequest = z.object({
  name: z.string().min(1, "应用名称不能为空").max(64, "应用名称不能超过64个字符"),
  description: z.string().optional(),
  template: z.enum(["blank", "ecom", "edu", "content", "project"]).default("blank"),
  isPublic: z.boolean().default(false),
  config: z.record(z.string(), z.any()).optional(),
})

// 应用更新请求
export const UpdateApplicationRequest = z.object({
  name: z.string().min(1, "应用名称不能为空").max(64, "应用名称不能超过64个字符").optional(),
  description: z.string().optional(),
  status: z.enum(["active", "inactive", "archived"]).optional(),
  isPublic: z.boolean().optional(),
  config: z.record(z.string(), z.any()).optional(),
  databaseConfig: z.record(z.string(), z.any()).optional(),
})

// 应用查询参数
export const GetApplicationsQuery = z.object({
  page: z.coerce.number().min(1, "页码不能少于1").default(1),
  limit: z.coerce.number().min(1, "每页数量不能少于1").max(100, "每页数量不能超过100").default(20),
  search: z.string().optional(),
  status: z.enum(["active", "inactive", "archived"]).optional(),
  template: z.enum(["blank", "ecom", "edu", "content", "project"]).optional(),
})

// 应用响应
export const ApplicationResponse = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  slug: z.string(),
  ownerId: z.string(),
  status: z.string(),
  template: z.string(),
  config: z.record(z.string(), z.any()),
  databaseConfig: z.record(z.string(), z.any()),
  isPublic: z.boolean(),
  version: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  owner: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
  }).optional(),
  _count: z.object({
    modules: z.number(),
    members: z.number(),
  }).optional(),
})

// 应用列表响应
export const ApplicationsListResponse = z.object({
  applications: z.array(ApplicationResponse),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
})

// 应用详情响应（包含模块和目录信息）
export const ApplicationDetailResponse = ApplicationResponse.extend({
  modules: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.string(),
    icon: z.string().nullable(),
    config: z.record(z.string(), z.any()),
    order: z.number(),
    isEnabled: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string(),
    directories: z.array(z.object({
      id: z.string(),
      name: z.string(),
      type: z.string(),
      supportsCategory: z.boolean(),
      config: z.record(z.string(), z.any()),
      order: z.number(),
      isEnabled: z.boolean(),
      createdAt: z.string(),
      updatedAt: z.string(),
      _count: z.object({
        fields: z.number(),
      }),
    })),
  })),
  members: z.array(z.object({
    id: z.string(),
    role: z.string(),
    permissions: z.record(z.string(), z.any()),
    joinedAt: z.string(),
    status: z.string(),
    user: z.object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
      avatar: z.string().nullable(),
    }),
  })),
})

// 类型导出
export type CreateApplicationRequest = z.infer<typeof CreateApplicationRequest>
export type UpdateApplicationRequest = z.infer<typeof UpdateApplicationRequest>
export type GetApplicationsQuery = z.infer<typeof GetApplicationsQuery>
export type ApplicationResponse = z.infer<typeof ApplicationResponse>
export type ApplicationsListResponse = z.infer<typeof ApplicationsListResponse>
export type ApplicationDetailResponse = z.infer<typeof ApplicationDetailResponse>
