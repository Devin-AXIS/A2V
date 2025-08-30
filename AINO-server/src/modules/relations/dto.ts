import { z } from "zod"

// Create relation validation schema
export const createRelationSchema = z.object({
  tenantId: z.string().uuid(),
  fromUrn: z.string().max(500),
  toUrn: z.string().max(500),
  type: z.enum(['one_to_one', 'one_to_many', 'many_to_many']),
  metadata: z.record(z.any()).optional(),
  createdBy: z.string().uuid().optional(),
})

// Update relation validation schema
export const updateRelationSchema = createRelationSchema.partial().omit({ tenantId: true })

// Query relations validation schema
export const queryRelationsSchema = z.object({
  tenantId: z.string().uuid().optional(),
  fromUrn: z.string().optional(),
  toUrn: z.string().optional(),
  type: z.enum(['one_to_one', 'one_to_many', 'many_to_many']).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
})

// Relation response schema
export const relationResponseSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  fromUrn: z.string(),
  toUrn: z.string(),
  type: z.enum(['one_to_one', 'one_to_many', 'many_to_many']),
  metadata: z.record(z.any()).nullable(),
  createdAt: z.string(),
  createdBy: z.string().uuid().nullable(),
  deletedAt: z.string().nullable(),
})

export type CreateRelationDto = z.infer<typeof createRelationSchema>
export type UpdateRelationDto = z.infer<typeof updateRelationSchema>
export type QueryRelationsDto = z.infer<typeof queryRelationsSchema>
export type RelationResponseDto = z.infer<typeof relationResponseSchema>
