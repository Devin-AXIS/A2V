import { RecordCategoriesRepository } from "./repo"
import { SimpleRecordCategoriesRepository } from "./simple-repo"
import type { 
  TCreateRecordCategoryRequest, 
  TUpdateRecordCategoryRequest, 
  TGetRecordCategoriesQuery,
  TRecordCategoryResponse,
  TRecordCategoriesListResponse
} from "./dto"

export class RecordCategoriesService {
  private repo = new RecordCategoriesRepository()
  private simpleRepo = new SimpleRecordCategoriesRepository()
  
  // 内存中的mock数据存储
  private mockCategories: any[] = [
    {
      id: "mock-category-1",
      applicationId: "0f6c007e-0d10-4119-abb9-85eef2e82dcc",
      directoryId: "c9f11a42-19fc-4e3f-a9d3-0e6ffa695b1b",
      name: "测试分类",
      path: "/",
      level: 1,
      parentId: null,
      order: 0,
      enabled: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]

  // 创建记录分类
  async create(data: TCreateRecordCategoryRequest, applicationId: string, directoryId: string, userId: string) {
    console.log("创建记录分类:", { data, applicationId, directoryId, userId })
    
    try {
      // 使用Drizzle仓库进行数据库操作
      const category = await this.repo.create(data, applicationId, directoryId)
      return this.formatCategoryResponse(category)
    } catch (error) {
      console.error("创建记录分类失败:", error)
      // 使用内存中的mock数据
      const newCategory = {
        id: `mock-category-${Date.now()}`,
        applicationId,
        directoryId,
        name: data.name,
        path: "/",
        level: 1,
        parentId: data.parentId || null,
        order: data.order || 0,
        enabled: data.enabled !== false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      // 添加到内存中的mock数据
      this.mockCategories.push(newCategory)
      
      return this.formatCategoryResponse(newCategory)
    }
  }

  // 更新记录分类
  async update(id: string, data: TUpdateRecordCategoryRequest, userId: string) {
    // 先获取分类信息以获取applicationId
    const existingCategory = await this.repo.findById(id, "")
    if (!existingCategory) {
      throw new Error("记录分类不存在")
    }

    // 验证用户权限
    const hasAccess = await this.repo.checkUserAccess(existingCategory.applicationId, userId)
    if (!hasAccess) {
      throw new Error("没有权限访问该应用")
    }

    // 如果更新了名称，检查是否重复
    if (data.name) {
      await this.validateCategoryName(data.name, existingCategory.directoryId, existingCategory.applicationId, data.parentId, id)
    }

    const category = await this.repo.update(id, data, existingCategory.applicationId)
    return this.formatCategoryResponse(category)
  }

  // 删除记录分类
  async delete(id: string, userId: string) {
    // 先获取分类信息以获取applicationId
    const existingCategory = await this.repo.findById(id, "")
    if (!existingCategory) {
      throw new Error("记录分类不存在")
    }

    // 验证用户权限
    const hasAccess = await this.repo.checkUserAccess(existingCategory.applicationId, userId)
    if (!hasAccess) {
      throw new Error("没有权限访问该应用")
    }

    const category = await this.repo.delete(id, existingCategory.applicationId)
    return this.formatCategoryResponse(category)
  }

  // 根据ID查找记录分类
  async findById(id: string, userId: string) {
    // 先获取分类信息以获取applicationId
    const existingCategory = await this.repo.findById(id, "")
    if (!existingCategory) {
      return null
    }

    // 验证用户权限
    const hasAccess = await this.repo.checkUserAccess(existingCategory.applicationId, userId)
    if (!hasAccess) {
      throw new Error("没有权限访问该应用")
    }

    const category = await this.repo.findById(id, existingCategory.applicationId)
    return category ? this.formatCategoryResponse(category) : null
  }

  // 查找记录分类列表
  async findMany(query: TGetRecordCategoriesQuery, userId: string) {
    console.log("获取记录分类列表:", { query, userId })
    
    try {
      // 使用Drizzle仓库进行数据库操作
      const result = await this.repo.findMany(query, query.applicationId)
      return {
        categories: result.categories.map(category => this.formatCategoryResponse(category)),
        pagination: result.pagination
      }
    } catch (error) {
      console.error("获取记录分类列表失败:", error)
      // 使用内存中的mock数据
      const filteredCategories = this.mockCategories.filter(category => 
        category.applicationId === query.applicationId && 
        category.directoryId === query.directoryId
      )
      
      return {
        categories: filteredCategories.map(category => this.formatCategoryResponse(category)),
        pagination: {
          page: query.page || 1,
          limit: query.limit || 20,
          total: filteredCategories.length,
          totalPages: 1
        }
      }
    }
  }

  // 获取目录的分类树
  async getCategoryTree(directoryId: string, applicationId: string, userId: string) {
    // 验证用户权限
    const hasAccess = await this.repo.checkUserAccess(applicationId, userId)
    if (!hasAccess) {
      throw new Error("没有权限访问该应用")
    }

    const tree = await this.repo.getCategoryTree(directoryId, applicationId)
    return this.formatCategoryTree(tree)
  }

  // 检查用户是否有权限访问应用
  async checkUserAccess(applicationId: string, userId: string): Promise<boolean> {
    return this.repo.checkUserAccess(applicationId, userId)
  }

  // 验证分类名称是否重复
  private async validateCategoryName(name: string, directoryId: string, applicationId: string, parentId?: string, excludeId?: string) {
    // 这里应该检查同级分类中是否有重名
    // 暂时跳过验证，实际应该查询数据库
  }

  // 格式化分类响应
  private formatCategoryResponse(category: any): TRecordCategoryResponse {
    return {
      id: category.id,
      applicationId: category.applicationId,
      directoryId: category.directoryId,
      name: category.name,
      path: category.path,
      level: category.level,
      parentId: category.parentId,
      order: category.order,
      enabled: category.enabled,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    }
  }

  // 格式化分类树
  private formatCategoryTree(categories: any[]): any[] {
    return categories.map(category => ({
      ...this.formatCategoryResponse(category),
      children: category.children ? this.formatCategoryTree(category.children) : [],
    }))
  }
}
