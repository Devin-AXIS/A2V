import { z } from "zod"

// 创建记录分类请求
export const CreateRecordCategoryRequest = z.object({
  name: z.string().min(1, "分类名称不能为空").max(100, "分类名称不能超过100个字符"),
  parentId: z.string().uuid().optional(),
  order: z.number().int().min(0).default(0),
  enabled: z.boolean().default(true),
})

// 更新记录分类请求
export const UpdateRecordCategoryRequest = z.object({
  name: z.string().min(1, "分类名称不能为空").max(100, "分类名称不能超过100个字符").optional(),
  parentId: z.string().uuid().optional(),
  order: z.number().int().min(0).optional(),
  enabled: z.boolean().optional(),
})

// 获取记录分类列表查询参数
export const GetRecordCategoriesQuery = z.object({
  applicationId: z.string().uuid(),
  directoryId: z.string().uuid(),
  level: z.coerce.number().int().min(1).max(3).optional(),
  parentId: z.string().uuid().optional(),
  enabled: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

// 记录分类响应
export const RecordCategoryResponse = z.object({
  id: z.string().uuid(),
  applicationId: z.string().uuid(),
  directoryId: z.string().uuid(),
  name: z.string(),
  path: z.string(),
  level: z.number().int(),
  parentId: z.string().uuid().nullable(),
  order: z.number().int(),
  enabled: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  children: z.array(z.lazy(() => RecordCategoryResponse)).optional(),
})

// 记录分类列表响应
export const RecordCategoriesListResponse = z.object({
  categories: z.array(RecordCategoryResponse),
  pagination: z.object({
    page: z.number().int(),
    limit: z.number().int(),
    total: z.number().int(),
    totalPages: z.number().int(),
  }),
})

// 类型导出
export type TCreateRecordCategoryRequest = z.infer<typeof CreateRecordCategoryRequest>
export type TUpdateRecordCategoryRequest = z.infer<typeof UpdateRecordCategoryRequest>
export type TGetRecordCategoriesQuery = z.infer<typeof GetRecordCategoriesQuery>
export type TRecordCategoryResponse = z.infer<typeof RecordCategoryResponse>
export type TRecordCategoriesListResponse = z.infer<typeof RecordCategoriesListResponse>
