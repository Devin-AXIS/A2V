import { z } from "zod"

// 创建字段分类请求
export const CreateFieldCategoryRequest = z.object({
  name: z.string().min(1, "分类名称不能为空").max(128, "分类名称不能超过128个字符"),
  description: z.string().optional(),
  order: z.number().int().min(0).default(0),
  enabled: z.boolean().default(true),
  system: z.boolean().default(false),
  predefinedFields: z.array(z.any()).default([]),
})

// 更新字段分类请求
export const UpdateFieldCategoryRequest = CreateFieldCategoryRequest.partial()

// 获取字段分类列表查询参数
export const GetFieldCategoriesQuery = z.object({
  applicationId: z.string().optional(),
  directoryId: z.string().optional(),
  enabled: z.coerce.boolean().optional(),
  system: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

// 字段分类响应
export const FieldCategoryResponse = z.object({
  id: z.string(),
  applicationId: z.string(),
  directoryId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  order: z.number(),
  enabled: z.boolean(),
  system: z.boolean(),
  predefinedFields: z.array(z.any()),
  createdAt: z.string(),
  updatedAt: z.string(),
})

// 字段分类列表响应
export const FieldCategoriesListResponse = z.object({
  categories: z.array(FieldCategoryResponse),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
})

export type CreateFieldCategoryRequest = z.infer<typeof CreateFieldCategoryRequest>
export type UpdateFieldCategoryRequest = z.infer<typeof UpdateFieldCategoryRequest>
export type GetFieldCategoriesQuery = z.infer<typeof GetFieldCategoriesQuery>
export type FieldCategoryResponse = z.infer<typeof FieldCategoryResponse>
export type FieldCategoriesListResponse = z.infer<typeof FieldCategoriesListResponse>
