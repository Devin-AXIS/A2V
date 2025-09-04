import { z } from "zod"

// 关联类型枚举
export const RelationTypeEnum = z.enum(["one_to_one", "one_to_many", "many_to_many"])

// 创建关联关系请求
export const CreateRelationRequest = z.object({
  applicationId: z.string().uuid(),
  fromDirectoryId: z.string().uuid(),
  fromRecordId: z.string().uuid(),
  fromFieldKey: z.string(),
  toDirectoryId: z.string().uuid(),
  toRecordId: z.string().uuid(),
  toFieldKey: z.string().optional(),
  relationType: RelationTypeEnum,
  bidirectional: z.boolean().default(false),
})

// 批量创建关联关系请求
export const BatchCreateRelationRequest = z.object({
  applicationId: z.string().uuid(),
  relations: z.array(CreateRelationRequest.omit({ applicationId: true })),
})

// 删除关联关系请求
export const DeleteRelationRequest = z.object({
  applicationId: z.string().uuid(),
  fromDirectoryId: z.string().uuid(),
  fromRecordId: z.string().uuid(),
  fromFieldKey: z.string(),
  toDirectoryId: z.string().uuid(),
  toRecordId: z.string().uuid(),
})

// 查询关联关系请求
export const GetRelationsRequest = z.object({
  applicationId: z.string().uuid(),
  directoryId: z.string().uuid().optional(),
  recordId: z.string().uuid().optional(),
  fieldKey: z.string().optional(),
  relationType: RelationTypeEnum.optional(),
  bidirectional: z.boolean().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
})

// 关联关系响应
export const RelationResponse = z.object({
  id: z.string().uuid(),
  applicationId: z.string().uuid(),
  fromDirectoryId: z.string().uuid(),
  fromRecordId: z.string().uuid(),
  fromFieldKey: z.string(),
  toDirectoryId: z.string().uuid(),
  toRecordId: z.string().uuid(),
  toFieldKey: z.string().nullable(),
  relationType: RelationTypeEnum,
  bidirectional: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  createdBy: z.string().uuid().nullable(),
})

// 关联关系列表响应
export const RelationsListResponse = z.object({
  relations: z.array(RelationResponse),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
})

// 关联记录响应（包含关联的记录信息）
export const RelatedRecordResponse = z.object({
  id: z.string().uuid(),
  directoryId: z.string().uuid(),
  directoryName: z.string(),
  data: z.record(z.any()),
  relationType: RelationTypeEnum,
  createdAt: z.string(),
})

// 关联记录列表响应
export const RelatedRecordsListResponse = z.object({
  records: z.array(RelatedRecordResponse),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
})

// 类型导出
export type CreateRelationRequest = z.infer<typeof CreateRelationRequest>
export type BatchCreateRelationRequest = z.infer<typeof BatchCreateRelationRequest>
export type DeleteRelationRequest = z.infer<typeof DeleteRelationRequest>
export type GetRelationsRequest = z.infer<typeof GetRelationsRequest>
export type RelationResponse = z.infer<typeof RelationResponse>
export type RelationsListResponse = z.infer<typeof RelationsListResponse>
export type RelatedRecordResponse = z.infer<typeof RelatedRecordResponse>
export type RelatedRecordsListResponse = z.infer<typeof RelatedRecordsListResponse>
