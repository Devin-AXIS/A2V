import { eq, and, desc, isNull, sql } from "drizzle-orm"
import { db } from "@/db"
import { relations } from "@/db/schema"
import type { CreateRelationDto, UpdateRelationDto, QueryRelationsDto, RelationResponseDto } from "./dto"

export class RelationsRepository {
  /**
   * Create a new relation
   */
  async create(data: CreateRelationDto): Promise<RelationResponseDto> {
    const [relation] = await db
      .insert(relations)
      .values({
        tenantId: data.tenantId,
        fromUrn: data.fromUrn,
        toUrn: data.toUrn,
        type: data.type,
        metadata: data.metadata || {},
        createdBy: data.createdBy,
      })
      .returning()

    return relation as RelationResponseDto
  }

  /**
   * Get relation by ID
   */
  async findById(id: string): Promise<RelationResponseDto | null> {
    const [relation] = await db
      .select()
      .from(relations)
      .where(and(eq(relations.id, id), isNull(relations.deletedAt)))
      .limit(1)

    return relation as RelationResponseDto | null
  }

  /**
   * Query relations with filters and pagination
   */
  async query(query: QueryRelationsDto): Promise<{
    data: RelationResponseDto[]
    total: number
    page: number
    limit: number
  }> {
    const { page, limit, ...filters } = query
    const offset = (page - 1) * limit

    // Build where conditions
    const conditions = [isNull(relations.deletedAt)]
    
    if (filters.tenantId) {
      conditions.push(eq(relations.tenantId, filters.tenantId))
    }
    if (filters.fromUrn) {
      conditions.push(eq(relations.fromUrn, filters.fromUrn))
    }
    if (filters.toUrn) {
      conditions.push(eq(relations.toUrn, filters.toUrn))
    }
    if (filters.type) {
      conditions.push(eq(relations.type, filters.type))
    }

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(relations)
      .where(and(...conditions))

    // Get paginated data
    const data = await db
      .select()
      .from(relations)
      .where(and(...conditions))
      .orderBy(desc(relations.createdAt))
      .limit(limit)
      .offset(offset)

    return {
      data: data as RelationResponseDto[],
      total: count,
      page,
      limit,
    }
  }

  /**
   * Update relation by ID
   */
  async update(id: string, data: UpdateRelationDto): Promise<RelationResponseDto | null> {
    const [relation] = await db
      .update(relations)
      .set({
        fromUrn: data.fromUrn,
        toUrn: data.toUrn,
        type: data.type,
        metadata: data.metadata,
        createdBy: data.createdBy,
      })
      .where(and(eq(relations.id, id), isNull(relations.deletedAt)))
      .returning()

    return relation as RelationResponseDto | null
  }

  /**
   * Soft delete relation by ID
   */
  async delete(id: string): Promise<boolean> {
    const [relation] = await db
      .update(relations)
      .set({ deletedAt: new Date().toISOString() })
      .where(and(eq(relations.id, id), isNull(relations.deletedAt)))
      .returning()

    return !!relation
  }

  /**
   * Get relations by URN (from or to)
   */
  async findByUrn(urn: string): Promise<RelationResponseDto[]> {
    const data = await db
      .select()
      .from(relations)
      .where(and(
        isNull(relations.deletedAt),
        sql`(${relations.fromUrn} = ${urn} OR ${relations.toUrn} = ${urn})`
      ))
      .orderBy(desc(relations.createdAt))

    return data as RelationResponseDto[]
  }

  /**
   * Get relations between two URNs
   */
  async findByUrns(fromUrn: string, toUrn: string): Promise<RelationResponseDto[]> {
    const data = await db
      .select()
      .from(relations)
      .where(and(
        isNull(relations.deletedAt),
        sql`(${relations.fromUrn} = ${fromUrn} AND ${relations.toUrn} = ${toUrn}) OR (${relations.fromUrn} = ${toUrn} AND ${relations.toUrn} = ${fromUrn})`
      ))
      .orderBy(desc(relations.createdAt))

    return data as RelationResponseDto[]
  }
}
