import { z } from "zod"

// 字段类型枚举
export const FieldTypeEnum = z.enum([
  "text", "textarea", "number", "select", "multiselect", 
  "boolean", "date", "time", "tags", "image", "video", 
  "file", "richtext", "percent", "barcode", "checkbox", 
  "cascader", "relation_one", "relation_many", "experience"
])

// 日期模式枚举
export const DateModeEnum = z.enum(["single", "multiple", "range"])

// 关联元数据
export const RelationMetaSchema = z.object({
  targetDirId: z.string().nullable(),
  mode: z.enum(["one", "many"]),
  displayFieldKey: z.string().nullable().optional(),
})

// 级联节点
export const CascaderNodeSchema = z.object({
  id: z.string(),
  name: z.string(),
  children: z.array(z.lazy(() => CascaderNodeSchema)).optional(),
})

// 创建字段请求
export const CreateFieldRequest = z.object({
  key: z.string().min(1).max(64).regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, {
    message: "字段标识符必须以字母或下划线开头，只能包含字母、数字和下划线"
  }),
  label: z.string().min(1).max(128),
  type: FieldTypeEnum,
  required: z.boolean().default(false),
  unique: z.boolean().default(false),
  locked: z.boolean().default(false),
  enabled: z.boolean().default(true),
  desc: z.string().optional(),
  placeholder: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  
  // 数值配置
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().optional(),
  unit: z.string().optional(),
  
  // 选择配置
  options: z.array(z.string()).optional(),
  default: z.any().optional(),
  
  // 显示配置
  showInList: z.boolean().default(true),
  showInForm: z.boolean().default(true),
  showInDetail: z.boolean().default(true),
  
  // 布尔配置
  trueLabel: z.string().optional(),
  falseLabel: z.string().optional(),
  
  // 媒体配置
  accept: z.string().optional(),
  maxSizeMB: z.number().optional(),
  
  // 关联配置
  relation: RelationMetaSchema.optional(),
  
  // 级联配置
  cascaderOptions: z.array(CascaderNodeSchema).optional(),
  
  // 日期配置
  dateMode: DateModeEnum.optional(),
  
  // 预设配置
  preset: z.string().optional(),
  
  // 特殊配置
  skillsConfig: z.record(z.any()).optional(),
  progressConfig: z.record(z.any()).optional(),
  customExperienceConfig: z.record(z.any()).optional(),
  identityVerificationConfig: z.record(z.any()).optional(),
  certificateConfig: z.record(z.any()).optional(),
  otherVerificationConfig: z.record(z.any()).optional(),
  imageConfig: z.record(z.any()).optional(),
  videoConfig: z.record(z.any()).optional(),
  booleanConfig: z.record(z.any()).optional(),
  multiselectConfig: z.record(z.any()).optional(),
  
  order: z.number().int().min(0).default(0),
})

// 更新字段请求
export const UpdateFieldRequest = CreateFieldRequest.partial().omit({ key: true })

// 查询字段请求
export const GetFieldsRequest = z.object({
  applicationId: z.string().uuid(),
  directoryId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  type: FieldTypeEnum.optional(),
  enabled: z.boolean().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
})

// 字段响应
export const FieldResponse = z.object({
  id: z.string().uuid(),
  applicationId: z.string().uuid(),
  directoryId: z.string().uuid(),
  categoryId: z.string().uuid().nullable(),
  key: z.string(),
  label: z.string(),
  type: FieldTypeEnum,
  required: z.boolean(),
  unique: z.boolean(),
  locked: z.boolean(),
  enabled: z.boolean(),
  desc: z.string().nullable(),
  placeholder: z.string().nullable(),
  
  // 数值配置
  min: z.number().nullable(),
  max: z.number().nullable(),
  step: z.number().nullable(),
  unit: z.string().nullable(),
  
  // 选择配置
  options: z.array(z.string()).nullable(),
  default: z.any().nullable(),
  
  // 显示配置
  showInList: z.boolean(),
  showInForm: z.boolean(),
  showInDetail: z.boolean(),
  
  // 布尔配置
  trueLabel: z.string().nullable(),
  falseLabel: z.string().nullable(),
  
  // 媒体配置
  accept: z.string().nullable(),
  maxSizeMB: z.number().nullable(),
  
  // 关联配置
  relation: z.any().nullable(),
  
  // 级联配置
  cascaderOptions: z.any().nullable(),
  
  // 日期配置
  dateMode: z.string().nullable(),
  
  // 预设配置
  preset: z.string().nullable(),
  
  // 特殊配置
  skillsConfig: z.any().nullable(),
  progressConfig: z.any().nullable(),
  customExperienceConfig: z.any().nullable(),
  identityVerificationConfig: z.any().nullable(),
  certificateConfig: z.any().nullable(),
  otherVerificationConfig: z.any().nullable(),
  imageConfig: z.any().nullable(),
  videoConfig: z.any().nullable(),
  booleanConfig: z.any().nullable(),
  multiselectConfig: z.any().nullable(),
  
  order: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

// 字段列表响应
export const FieldsListResponse = z.object({
  fields: z.array(FieldResponse),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
})

// 字段分类相关DTO
export const CreateFieldCategoryRequest = z.object({
  name: z.string().min(1).max(128),
  description: z.string().optional(),
  order: z.number().int().min(0).default(0),
  enabled: z.boolean().default(true),
  system: z.boolean().default(false),
  predefinedFields: z.array(z.any()).default([]),
})

export const UpdateFieldCategoryRequest = CreateFieldCategoryRequest.partial()

export const FieldCategoryResponse = z.object({
  id: z.string().uuid(),
  applicationId: z.string().uuid(),
  directoryId: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  order: z.number(),
  enabled: z.boolean(),
  system: z.boolean(),
  predefinedFields: z.array(z.any()),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const FieldCategoriesListResponse = z.object({
  categories: z.array(FieldCategoryResponse),
  total: z.number(),
})

// 类型导出
export type CreateFieldRequest = z.infer<typeof CreateFieldRequest>
export type UpdateFieldRequest = z.infer<typeof UpdateFieldRequest>
export type GetFieldsRequest = z.infer<typeof GetFieldsRequest>
export type FieldResponse = z.infer<typeof FieldResponse>
export type FieldsListResponse = z.infer<typeof FieldsListResponse>
export type CreateFieldCategoryRequest = z.infer<typeof CreateFieldCategoryRequest>
export type UpdateFieldCategoryRequest = z.infer<typeof UpdateFieldCategoryRequest>
export type FieldCategoryResponse = z.infer<typeof FieldCategoryResponse>
export type FieldCategoriesListResponse = z.infer<typeof FieldCategoriesListResponse>

