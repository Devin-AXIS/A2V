// 模板工具函数

import { db } from '../../src/db'
import { directories, directoryDefs, fieldDefs, fieldCategories } from '../../src/db/schema'
import { eq } from 'drizzle-orm'
import type { DirectoryTemplate, FieldTemplate, CategoryTemplate, TemplateResult } from './types'

// 生成slug的辅助函数
function generateSlug(name: string): string {
  // 如果是英文，使用原来的逻辑
  if (/^[a-zA-Z0-9\s]+$/.test(name)) {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }

  // 如果是中文或其他字符，使用时间戳作为slug
  const timestamp = Date.now()
  return `dir-${timestamp}`
}

/**
 * 创建目录
 */
export async function createDirectory(
  applicationId: string,
  moduleId: string,
  template: DirectoryTemplate
): Promise<{ directoryId: string; directoryDefId: string }> {
  // 生成slug
  const slug = generateSlug(template.name)

  // 创建目录
  const [createdDirectory] = await db.insert(directories).values({
    applicationId,
    moduleId,
    name: template.name,
    slug: slug, // 添加slug字段
    type: template.type,
    supportsCategory: template.supportsCategory,
    config: {
      description: `${template.name}管理`,
      fields: []
    },
    order: 0,
    isEnabled: true,
  }).returning()

  // 创建目录定义
  const [directoryDef] = await db.insert(directoryDefs).values({
    applicationId,
    directoryId: createdDirectory.id,
    title: template.name,
    name: template.name, // 添加name字段
    slug: `${template.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
    status: 'active',
  }).returning()

  return {
    directoryId: createdDirectory.id,
    directoryDefId: directoryDef.id
  }
}

/**
 * 创建字段分类
 */
export async function createFieldCategories(
  applicationId: string,
  directoryId: string,
  categories: CategoryTemplate[]
): Promise<Record<string, string>> {
  const categoryMap: Record<string, string> = {}

  for (const category of categories) {
    const [createdCategory] = await db.insert(fieldCategories).values({
      applicationId,
      directoryId,
      name: category.name,
      description: category.description,
      order: category.order,
      system: category.system,
      enabled: true,
    }).returning()

    categoryMap[category.name] = createdCategory.id
  }

  return categoryMap
}

/**
 * 创建字段定义
 */
export async function createFieldDefinitions(
  directoryDefId: string,
  fields: FieldTemplate[],
  categoryMap: Record<string, string>
): Promise<string[]> {
  const fieldIds: string[] = []

  for (const field of fields) {
    const categoryId = categoryMap[field.category] || null

    const [createdField] = await db.insert(fieldDefs).values({
      directoryId: directoryDefId,
      key: field.key,
      kind: 'primitive',
      type: field.type,
      schema: {
        label: field.label,
        showInList: field.showInList,
        showInForm: field.showInForm,
        options: field.options || [],
      },
      required: field.required || false,
      readRoles: ['admin', 'member'],
      writeRoles: ['admin'],
    }).returning()

    fieldIds.push(createdField.id)
  }

  return fieldIds
}

/**
 * 查找用户管理模块
 */
export async function findUserModule(applicationId: string): Promise<string | null> {
  // 这里需要根据实际的模块表结构来查询
  // 暂时返回null，实际使用时需要实现
  return null
}
