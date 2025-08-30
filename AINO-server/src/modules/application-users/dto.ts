import { z } from 'zod'

// 应用用户基础信息
export const ApplicationUser = z.object({
  id: z.string().uuid(),
  applicationId: z.string().uuid(),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  avatar: z.string().url().optional(),
  status: z.enum(['active', 'inactive', 'pending']).default('active'),
  role: z.enum(['admin', 'user', 'guest']).default('user'),
  department: z.string().optional(),
  position: z.string().optional(),
  tags: z.array(z.string()).default([]),
  metadata: z.record(z.any()).default({}),
  lastLoginAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type TApplicationUser = z.infer<typeof ApplicationUser>

// 创建应用用户请求
export const CreateApplicationUserRequest = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  avatar: z.string().url().optional(),
  role: z.enum(['admin', 'user', 'guest']).default('user'),
  department: z.string().optional(),
  position: z.string().optional(),
  tags: z.array(z.string()).default([]),
  metadata: z.record(z.any()).default({}),
})

export type TCreateApplicationUserRequest = z.infer<typeof CreateApplicationUserRequest>

// 更新应用用户请求
export const UpdateApplicationUserRequest = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  avatar: z.string().url().optional(),
  status: z.enum(['active', 'inactive', 'pending']).optional(),
  role: z.enum(['admin', 'user', 'guest']).optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
})

export type TUpdateApplicationUserRequest = z.infer<typeof UpdateApplicationUserRequest>

// 获取应用用户列表查询参数
export const GetApplicationUsersQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.enum(['active', 'inactive', 'pending']).optional(),
  role: z.enum(['admin', 'user', 'guest']).optional(),
  department: z.string().optional(),
  sortBy: z.enum(['name', 'email', 'createdAt', 'lastLoginAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export type TGetApplicationUsersQuery = z.infer<typeof GetApplicationUsersQuery>

// 应用用户列表响应
export const ApplicationUserListResponse = z.object({
  success: z.boolean(),
  data: z.object({
    users: z.array(ApplicationUser),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
    }),
  }),
})

export type TApplicationUserListResponse = z.infer<typeof ApplicationUserListResponse>

// 单个应用用户响应
export const ApplicationUserResponse = z.object({
  success: z.boolean(),
  data: ApplicationUser,
})

export type TApplicationUserResponse = z.infer<typeof ApplicationUserResponse>

// 通用响应
export const SuccessResponse = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
})

export type TSuccessResponse = z.infer<typeof SuccessResponse>
