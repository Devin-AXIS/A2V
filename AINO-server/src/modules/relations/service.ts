import { RelationsRepository } from "./repo"
import type { CreateRelationDto, UpdateRelationDto, QueryRelationsDto, RelationResponseDto } from "./dto"

export class RelationsService {
  private repo: RelationsRepository

  constructor() {
    this.repo = new RelationsRepository()
  }

  /**
   * Create a new relation
   */
  async createRelation(data: CreateRelationDto): Promise<{
    success: boolean
    data?: RelationResponseDto
    error?: string
  }> {
    try {
      // Validate URN format (basic validation)
      if (!this.isValidUrn(data.fromUrn) || !this.isValidUrn(data.toUrn)) {
        return {
          success: false,
          error: "Invalid URN format"
        }
      }

      // Check if relation already exists
      const existing = await this.repo.findByUrns(data.fromUrn, data.toUrn)
      if (existing.length > 0) {
        return {
          success: false,
          error: "Relation already exists between these URNs"
        }
      }

      const relation = await this.repo.create(data)
      return {
        success: true,
        data: relation
      }
    } catch (error) {
      console.error("Failed to create relation:", error)
      return {
        success: false,
        error: "Failed to create relation"
      }
    }
  }

  /**
   * Get relation by ID
   */
  async getRelation(id: string): Promise<{
    success: boolean
    data?: RelationResponseDto
    error?: string
  }> {
    try {
      const relation = await this.repo.findById(id)
      if (!relation) {
        return {
          success: false,
          error: "Relation not found"
        }
      }

      return {
        success: true,
        data: relation
      }
    } catch (error) {
      console.error("Failed to get relation:", error)
      return {
        success: false,
        error: "Failed to get relation"
      }
    }
  }

  /**
   * Query relations
   */
  async queryRelations(query: QueryRelationsDto): Promise<{
    success: boolean
    data?: {
      relations: RelationResponseDto[]
      total: number
      page: number
      limit: number
    }
    error?: string
  }> {
    try {
      const result = await this.repo.query(query)
      return {
        success: true,
        data: {
          relations: result.data,
          total: result.total,
          page: result.page,
          limit: result.limit
        }
      }
    } catch (error) {
      console.error("Failed to query relations:", error)
      return {
        success: false,
        error: "Failed to query relations"
      }
    }
  }

  /**
   * Update relation
   */
  async updateRelation(id: string, data: UpdateRelationDto): Promise<{
    success: boolean
    data?: RelationResponseDto
    error?: string
  }> {
    try {
      // Validate URN format if provided
      if (data.fromUrn && !this.isValidUrn(data.fromUrn)) {
        return {
          success: false,
          error: "Invalid fromUrn format"
        }
      }
      if (data.toUrn && !this.isValidUrn(data.toUrn)) {
        return {
          success: false,
          error: "Invalid toUrn format"
        }
      }

      const relation = await this.repo.update(id, data)
      if (!relation) {
        return {
          success: false,
          error: "Relation not found"
        }
      }

      return {
        success: true,
        data: relation
      }
    } catch (error) {
      console.error("Failed to update relation:", error)
      return {
        success: false,
        error: "Failed to update relation"
      }
    }
  }

  /**
   * Delete relation
   */
  async deleteRelation(id: string): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      const deleted = await this.repo.delete(id)
      if (!deleted) {
        return {
          success: false,
          error: "Relation not found"
        }
      }

      return {
        success: true
      }
    } catch (error) {
      console.error("Failed to delete relation:", error)
      return {
        success: false,
        error: "Failed to delete relation"
      }
    }
  }

  /**
   * Get relations by URN
   */
  async getRelationsByUrn(urn: string): Promise<{
    success: boolean
    data?: RelationResponseDto[]
    error?: string
  }> {
    try {
      const relations = await this.repo.findByUrn(urn)
      return {
        success: true,
        data: relations
      }
    } catch (error) {
      console.error("Failed to get relations by URN:", error)
      return {
        success: false,
        error: "Failed to get relations by URN"
      }
    }
  }

  /**
   * Validate URN format
   * URN format: urn:app:directory:record or urn:app:directory
   */
  private isValidUrn(urn: string): boolean {
    const urnPattern = /^urn:[a-zA-Z0-9_-]+:[a-zA-Z0-9_-]+(:[a-zA-Z0-9_-]+)?$/
    return urnPattern.test(urn)
  }
}
