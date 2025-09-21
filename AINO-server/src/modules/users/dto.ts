import { z } from "zod"

export const User = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  password: z.string(),
  role: z.enum(["admin", "operator", "viewer"]),
  permissions: z.array(z.string()),
  avatar: z.string().optional(),
  roles: z.array(z.string()).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const LoginReq = z.object({
  email: z.string().email(),
  password: z.string().min(1)
})

export const RegisterReq = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
})

export const LoginResp = z.object({
  success: z.literal(true),
  data: z.object({
    token: z.string(),
    user: z.object({
      id: z.string(),
      email: z.string().email(),
      name: z.string()
    })
  })
})

export type TUser = z.infer<typeof User>
export type TLoginReq = z.infer<typeof LoginReq>
export type TLoginRequest = TLoginReq
export type TRegisterReq = z.infer<typeof RegisterReq>
export type TRegisterRequest = TRegisterReq

// 获取当前用户信息
export const GetCurrentUserResp = z.object({
  success: z.literal(true),
  data: z.object({
    id: z.string(),
    email: z.string().email(),
    name: z.string(),
    role: z.enum(["admin", "operator", "viewer"]),
    permissions: z.array(z.string())
  })
})

export type TGetCurrentUserResp = z.infer<typeof GetCurrentUserResp>
