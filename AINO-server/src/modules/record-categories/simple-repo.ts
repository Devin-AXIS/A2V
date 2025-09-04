import { db } from "../../db"
import { sql } from "drizzle-orm"

export class SimpleRecordCategoriesRepository {
  // 使用原生SQL查询获取分类列表
  async findMany(applicationId: string, directoryId: string) {
    const query = sql`
      SELECT id, application_id, directory_id, name, path, level, parent_id, "order", enabled, created_at, updated_at
      FROM record_categories 
      WHERE application_id = ${applicationId} AND directory_id = ${directoryId}
      ORDER BY level, "order", name
    `
    
    const result = await db.execute(query)
    
    return result.rows
  }

  // 使用原生SQL插入分类
  async create(data: {
    applicationId: string
    directoryId: string
    name: string
    path: string
    level: number
    parentId?: string
    order?: number
    enabled?: boolean
  }) {
    const query = sql`
      INSERT INTO record_categories (id, application_id, directory_id, name, path, level, parent_id, "order", enabled, created_at, updated_at)
      VALUES (gen_random_uuid(), ${data.applicationId}, ${data.directoryId}, ${data.name}, ${data.path}, ${data.level}, ${data.parentId || null}, ${data.order || 0}, ${data.enabled !== false}, NOW(), NOW())
      RETURNING id, application_id, directory_id, name, path, level, parent_id, "order", enabled, created_at, updated_at
    `
    
    const result = await db.execute(query)
    
    return result.rows[0]
  }

  // 使用原生SQL获取分类树
  async getCategoryTree(applicationId: string, directoryId: string) {
    const query = sql`
      SELECT id, application_id, directory_id, name, path, level, parent_id, "order", enabled, created_at, updated_at
      FROM record_categories 
      WHERE application_id = ${applicationId} AND directory_id = ${directoryId}
      ORDER BY level, "order", name
    `
    
    const result = await db.execute(query)
    
    // 构建分类树
    const categories = result.rows
    const categoryMap = new Map()
    const rootCategories = []
    
    // 先创建所有分类的映射
    categories.forEach(category => {
      categoryMap.set(category.id, {
        ...category,
        children: []
      })
    })
    
    // 构建树形结构
    categories.forEach(category => {
      if (category.parent_id) {
        const parent = categoryMap.get(category.parent_id)
        if (parent) {
          parent.children.push(categoryMap.get(category.id))
        }
      } else {
        rootCategories.push(categoryMap.get(category.id))
      }
    })
    
    return rootCategories
  }
}
