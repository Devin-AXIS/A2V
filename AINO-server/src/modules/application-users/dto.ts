import { z } from 'zod'

// 应用用户基础信息（包含账号信息和业务数据）
export const ApplicationUser = z.object({
  id: z.string().uuid(),
  applicationId: z.string().uuid(),
  phone: z.string(), // 账号标识
  password: z.string().optional(), // 不返回给前端
  status: z.enum(['active', 'inactive', 'pending']).default('active'),
  role: z.enum(['admin', 'user', 'guest']).default('user'),
  metadata: z.record(z.any()).default({}),
  lastLoginAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  // 业务数据字段（从用户模块获取）
  name: z.string().optional(),
  email: z.string().email().optional(),
  avatar: z.string().url().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  tags: z.array(z.string()).default([]),
})

export type TApplicationUser = z.infer<typeof ApplicationUser>

// 创建应用用户请求（只包含账号信息）
export const CreateApplicationUserRequest = z.object({
  phone_number: z.string().min(1, "手机号不能为空"),
  password: z.string().min(6, "密码至少6位").optional(),
  role: z.enum(['admin', 'user', 'guest']).default('user'),
  status: z.enum(['active', 'inactive', 'pending']).default('active'),
  metadata: z.record(z.any()).default({}),
})

export type TCreateApplicationUserRequest = z.infer<typeof CreateApplicationUserRequest>

// 更新应用用户请求（只包含账号信息）
export const UpdateApplicationUserRequest = z.object({
  phone_number: z.string().optional(),
  password: z.string().min(6, "密码至少6位").optional(),
  status: z.enum(['active', 'inactive', 'pending']).optional(),
  role: z.enum(['admin', 'user', 'guest']).optional(),
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
  sortBy: z.enum(['phone_number', 'createdAt', 'lastLoginAt']).default('createdAt'),
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

// 用户注册请求
export const RegisterUserRequest = z.object({
  phone_number: z.string().min(1, "手机号不能为空"),
  password: z.string().min(6, "密码至少6位"),
  name: z.string().optional(),
  email: z.string().email().optional(),
  gender: z.string().optional(),
  city: z.string().optional(),
  birthday: z.string().optional(),
  avatar: z.string().optional(),
})

export type TRegisterUserRequest = z.infer<typeof RegisterUserRequest>

// 用户合并请求
export const MergeUserRequest = z.object({
  targetUserId: z.string().uuid(),
  sourceUserId: z.string().uuid(),
})

export type TMergeUserRequest = z.infer<typeof MergeUserRequest>

// 应用用户登录请求
export const LoginUserRequest = z.object({
  phone_number: z.string().min(1, "手机号不能为空"),
  password: z.string().min(6, "密码至少6位"),
})

export type TLoginUserRequest = z.infer<typeof LoginUserRequest>

// 应用用户修改密码请求
export const ChangePasswordRequest = z.object({
  phone_number: z.string().min(1, "手机号不能为空"),
  old_password: z.string().min(6, "旧密码至少6位"),
  new_password: z.string().min(6, "新密码至少6位"),
})

export type TChangePasswordRequest = z.infer<typeof ChangePasswordRequest>
