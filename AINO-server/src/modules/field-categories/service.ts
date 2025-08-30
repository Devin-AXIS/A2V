import { FieldCategoriesRepository } from "./repo"
import type {
  CreateFieldCategoryRequest,
  UpdateFieldCategoryRequest,
  GetFieldCategoriesQuery,
  FieldCategoryResponse,
  FieldCategoriesListResponse,
} from "./dto"

export class FieldCategoriesService {
  private repo = new FieldCategoriesRepository()

  // 检查用户是否有权限访问应用
  async checkUserAccess(applicationId: string, userId: string): Promise<boolean> {
    try {
      // 简化权限检查：只有应用所有者可以访问
      const application = await this.repo.findApplicationById(applicationId)
      if (!application) {
        return false
      }
      
      // 检查是否是应用所有者
      return application.ownerId === userId
    } catch (error) {
      console.error("检查用户权限失败:", error)
      return false
    }
  }

  async create(data: CreateFieldCategoryRequest, applicationId: string, directoryId: string, userId: string): Promise<FieldCategoryResponse> {
    // 验证用户权限
    const hasAccess = await this.checkUserAccess(applicationId, userId)
    if (!hasAccess) {
      throw new Error("没有权限访问该应用")
    }

    // 检查名称是否已存在
    const nameExists = await this.repo.checkNameExists(data.name, directoryId)
    if (nameExists) {
      throw new Error("字段分类名称已存在")
    }

    const result = await this.repo.create(data, applicationId, directoryId)
    console.log("创建字段分类成功:", result.id)
    return result
  }

  async findMany(query: GetFieldCategoriesQuery, userId: string): Promise<FieldCategoriesListResponse> {
    // 如果指定了应用ID，验证用户权限
    if (query.applicationId) {
      const hasAccess = await this.checkUserAccess(query.applicationId, userId)
      if (!hasAccess) {
        throw new Error("没有权限访问该应用")
      }
    }

    const result = await this.repo.findMany(query)
    console.log("查询字段分类列表成功，共", result.categories.length, "个分类")
    return result
  }

  async findById(id: string, userId: string): Promise<FieldCategoryResponse | null> {
    const result = await this.repo.findById(id)
    if (!result) {
      return null
    }

    // 验证用户权限
    const hasAccess = await this.checkUserAccess(result.applicationId, userId)
    if (!hasAccess) {
      throw new Error("没有权限访问该字段分类")
    }

    console.log("查询字段分类详情成功:", result.id)
    return result
  }

  async update(id: string, data: UpdateFieldCategoryRequest, userId: string): Promise<FieldCategoryResponse | null> {
    const existing = await this.repo.findById(id)
    if (!existing) {
      return null
    }

    // 验证用户权限
    const hasAccess = await this.checkUserAccess(existing.applicationId, userId)
    if (!hasAccess) {
      throw new Error("没有权限修改该字段分类")
    }

    // 检查是否为系统分类
    if (existing.system) {
      throw new Error("系统分类不能修改")
    }

    // 检查名称是否已存在（排除当前分类）
    if (data.name && data.name !== existing.name) {
      const nameExists = await this.repo.checkNameExists(data.name, existing.directoryId, id)
      if (nameExists) {
        throw new Error("字段分类名称已存在")
      }
    }

    const result = await this.repo.update(id, data)
    console.log("更新字段分类成功:", result?.id)
    return result
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const existing = await this.repo.findById(id)
    if (!existing) {
      return false
    }

    // 验证用户权限
    const hasAccess = await this.checkUserAccess(existing.applicationId, userId)
    if (!hasAccess) {
      throw new Error("没有权限删除该字段分类")
    }

    // 检查是否为系统分类
    if (existing.system) {
      throw new Error("系统分类不能删除")
    }

    // 检查分类下是否有字段
    const fieldsCount = await this.repo.getFieldsCountInCategory(id)
    if (fieldsCount > 0) {
      throw new Error(`该分类下还有 ${fieldsCount} 个字段，请先移除或重新分类这些字段`)
    }

    const result = await this.repo.delete(id)
    console.log("删除字段分类成功:", result)
    return result
  }
}
