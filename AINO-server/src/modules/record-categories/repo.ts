import { db } from "../../db"
import { recordCategories } from "../../db/schema"
import { and, eq, desc, asc, isNull, sql, count } from "drizzle-orm"
import type { TCreateRecordCategoryRequest, TUpdateRecordCategoryRequest, TGetRecordCategoriesQuery } from "./dto"

export class RecordCategoriesRepository {
  // 创建记录分类
  async create(data: TCreateRecordCategoryRequest, applicationId: string, directoryId: string) {
    // 计算分类路径和级别
    const { path, level } = await this.calculatePathAndLevel(data.parentId, directoryId)
    
    // 构建插入数据，确保所有字段都有值
    const insertData = {
      applicationId,
      directoryId,
      name: data.name,
      path,
      level,
      parentId: data.parentId || null,
      order: data.order || 0,
      enabled: data.enabled !== false,
    }
    
    console.log("插入记录分类数据:", insertData)
    
    const [category] = await db.insert(recordCategories).values(insertData).returning()
    
    return category
  }

  // 更新记录分类
  async update(id: string, data: TUpdateRecordCategoryRequest, applicationId: string) {
    const updateData: any = { ...data }
    
    // 如果更新了父分类，需要重新计算路径和级别
    if (data.parentId !== undefined) {
      const { path, level } = await this.calculatePathAndLevel(data.parentId, null, id)
      updateData.path = path
      updateData.level = level
    }
    
    const [category] = await db.update(recordCategories)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(and(
        eq(recordCategories.id, id),
        eq(recordCategories.applicationId, applicationId)
      ))
      .returning()
    
    return category
  }

  // 删除记录分类
  async delete(id: string, applicationId: string) {
    // 检查是否有子分类
    const children = await db.select()
      .from(recordCategories)
      .where(and(
        eq(recordCategories.parentId, id),
        eq(recordCategories.applicationId, applicationId)
      ))
    
    if (children.length > 0) {
      throw new Error("无法删除包含子分类的分类")
    }
    
    const [category] = await db.delete(recordCategories)
      .where(and(
        eq(recordCategories.id, id),
        eq(recordCategories.applicationId, applicationId)
      ))
      .returning()
    
    return category
  }

  // 根据ID查找记录分类
  async findById(id: string, applicationId?: string) {
    const conditions = [eq(recordCategories.id, id)]
    
    if (applicationId) {
      conditions.push(eq(recordCategories.applicationId, applicationId))
    }
    
    const [category] = await db.select()
      .from(recordCategories)
      .where(and(...conditions))
      .limit(1)
    
    return category
  }

  // 查找记录分类列表
  async findMany(query: TGetRecordCategoriesQuery, applicationId: string) {
    const { directoryId, level, parentId, enabled, page, limit } = query
    
    // 构建查询条件
    const conditions = [
      eq(recordCategories.applicationId, applicationId),
      eq(recordCategories.directoryId, directoryId),
    ]
    
    if (level !== undefined) {
      conditions.push(eq(recordCategories.level, level))
    }
    
    if (parentId !== undefined) {
      conditions.push(eq(recordCategories.parentId, parentId))
    } else if (level === 1) {
      // 如果指定了级别1，则只查询顶级分类
      conditions.push(isNull(recordCategories.parentId))
    }
    
    if (enabled !== undefined) {
      conditions.push(eq(recordCategories.enabled, enabled))
    }
    
    // 查询总数
    const [{ value: total }] = await db.select({ value: count() })
      .from(recordCategories)
      .where(and(...conditions))
    
    // 查询数据
    const categories = await db.select()
      .from(recordCategories)
      .where(and(...conditions))
      .orderBy(asc(recordCategories.level), asc(recordCategories.order), asc(recordCategories.name))
      .limit(limit)
      .offset((page - 1) * limit)
    
    return {
      categories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  // 获取目录的所有分类（树形结构）
  async getCategoryTree(directoryId: string, applicationId: string) {
    const categories = await db.select()
      .from(recordCategories)
      .where(and(
        eq(recordCategories.applicationId, applicationId),
        eq(recordCategories.directoryId, directoryId),
        eq(recordCategories.enabled, true)
      ))
      .orderBy(asc(recordCategories.level), asc(recordCategories.order), asc(recordCategories.name))
    
    // 构建树形结构
    return this.buildCategoryTree(categories)
  }

  // 计算分类路径和级别
  private async calculatePathAndLevel(parentId: string | undefined, directoryId: string | null, excludeId?: string) {
    if (!parentId) {
      return { path: "/", level: 1 }
    }
    
    const parent = await db.select()
      .from(recordCategories)
      .where(eq(recordCategories.id, parentId))
      .limit(1)
    
    if (parent.length === 0) {
      throw new Error("父分类不存在")
    }
    
    const parentCategory = parent[0]
    const path = parentCategory.path ? `${parentCategory.path}/${parentCategory.name}` : parentCategory.name
    const level = parentCategory.level + 1
    
    if (level > 3) {
      throw new Error("分类层级不能超过3级")
    }
    
    return { path, level }
  }

  // 构建分类树
  private buildCategoryTree(categories: any[]) {
    const categoryMap = new Map()
    const rootCategories: any[] = []
    
    // 创建分类映射
    categories.forEach(category => {
      categoryMap.set(category.id, { ...category, children: [] })
    })
    
    // 构建树形结构
    categories.forEach(category => {
      const categoryNode = categoryMap.get(category.id)
      
      if (category.parentId) {
        const parent = categoryMap.get(category.parentId)
        if (parent) {
          parent.children.push(categoryNode)
        }
      } else {
        rootCategories.push(categoryNode)
      }
    })
    
    return rootCategories
  }

  // 检查用户是否有权限访问应用
  async checkUserAccess(applicationId: string, userId: string): Promise<boolean> {
    // 这里应该检查用户是否有权限访问该应用
    // 暂时返回true，实际应该查询应用成员表
    return true
  }
}
