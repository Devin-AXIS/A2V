import { db } from "../../db"
import { directories, applications, directoryDefs, modules, moduleInstalls } from "../../db/schema"
import { eq, and, desc, asc, count, sql, or } from "drizzle-orm"
import type {
  CreateDirectoryRequest,
  UpdateDirectoryRequest,
  GetDirectoriesQuery,
  DirectoryResponse,
  DirectoriesListResponse,
} from "./dto"

export class DirectoryRepository {
  async create(data: CreateDirectoryRequest, applicationId: string, moduleId: string): Promise<DirectoryResponse> {
    console.log("🔍 DirectoryRepository.create 开始执行:", { applicationId, moduleId, data })

    // 生成slug
    const slug = this.generateSlug(data.name)
    console.log("🔍 生成的slug:", slug)

    try {
      const [result] = await db.insert(directories).values({
        applicationId,
        moduleId,
        name: data.name,
        slug: slug, // 添加slug字段
        type: data.type,
        supportsCategory: data.supportsCategory,
        config: data.config,
        order: data.order,
        isEnabled: true,
      }).returning()

      console.log("✅ 目录创建成功:", result.id)
      return this.convertToResponse(result)
    } catch (error) {
      console.log("❌ 目录创建失败:", error)

      // 检查是否是外键约束错误
      if (error instanceof Error && error.message.includes('violates foreign key constraint')) {
        if (error.message.includes('directories_module_id_fkey')) {
          console.log("❌ 数据库外键约束错误 - 模块不存在")
          throw new Error(`模块不存在: ${moduleId}`)
        } else if (error.message.includes('directories_application_id_fkey')) {
          console.log("❌ 数据库外键约束错误 - 应用程序不存在")
          throw new Error(`应用程序不存在: ${applicationId}`)
        }
      }

      // 重新抛出其他错误
      throw error
    }
  }

  async findMany(query: GetDirectoriesQuery): Promise<DirectoriesListResponse> {
    const { applicationId, moduleId, type, isEnabled, page = 1, limit = 20 } = query
    const offset = (page - 1) * limit

    const conditions = []
    if (applicationId) {
      conditions.push(eq(directories.applicationId, applicationId))
    }
    if (moduleId) {
      conditions.push(eq(directories.moduleId, moduleId))
    }
    if (type) {
      conditions.push(eq(directories.type, type))
    }
    if (isEnabled !== undefined) {
      conditions.push(eq(directories.isEnabled, isEnabled))
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined

    // 获取总数
    const [{ value: total }] = await db
      .select({ value: count() })
      .from(directories)
      .where(whereClause)

    // 获取分页数据
    const directoriesList = await db
      .select()
      .from(directories)
      .where(whereClause)
      .orderBy(asc(directories.order), desc(directories.createdAt))
      .limit(limit)
      .offset(offset)

    return {
      directories: directoriesList.map(this.convertToResponse.bind(this)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findById(id: string): Promise<any> {
    const [result] = await db
      .select()
      .from(directories)
      .where(eq(directories.id, id))
      .limit(1)

    return result
  }

  async update(id: string, data: UpdateDirectoryRequest): Promise<DirectoryResponse | null> {
    const updateData: any = {}

    if (data.name !== undefined) updateData.name = data.name
    if (data.type !== undefined) updateData.type = data.type
    if (data.supportsCategory !== undefined) updateData.supportsCategory = data.supportsCategory
    if (data.config !== undefined) updateData.config = data.config
    if (data.order !== undefined) updateData.order = data.order
    if (data.isEnabled !== undefined) updateData.isEnabled = data.isEnabled
    updateData.updatedAt = new Date()

    const [result] = await db
      .update(directories)
      .set(updateData)
      .where(eq(directories.id, id))
      .returning()

    return result ? this.convertToResponse(result) : null
  }

  async delete(id: string): Promise<boolean> {
    const [result] = await db
      .delete(directories)
      .where(eq(directories.id, id))
      .returning()

    return !!result
  }

  async checkNameExists(name: string, applicationId: string, excludeId?: string) {
    const conditions = [
      eq(directories.name, name),
      eq(directories.applicationId, applicationId)
    ]

    if (excludeId) {
      conditions.push(sql`${directories.id} != ${excludeId}`)
    }

    const [result] = await db
      .select({ id: directories.id })
      .from(directories)
      .where(and(...conditions))
      .limit(1)

    return !!result
  }

  // 查找应用信息
  async findApplicationById(applicationId: string): Promise<any> {
    const [result] = await db
      .select()
      .from(applications)
      .where(eq(applications.id, applicationId))
      .limit(1)

    return result
  }

  // 查找模块信息 - 支持检查 modules 和 moduleInstalls 两个表
  async findModuleById(moduleId: string): Promise<any> {
    console.log("🔍 DirectoryRepository.findModuleById 开始执行:", moduleId)

    // 首先检查 modules 表
    console.log("🔍 检查 modules 表...")
    const [moduleResult] = await db
      .select()
      .from(modules)
      .where(eq(modules.id, moduleId))
      .limit(1)

    if (moduleResult) {
      console.log("✅ 在 modules 表中找到模块:", moduleResult.name)
      return moduleResult
    }
    console.log("❌ 在 modules 表中未找到模块")

    // 如果 modules 表中没有找到，检查 moduleInstalls 表
    console.log("🔍 检查 module_installs 表...")
    const [moduleInstallResult] = await db
      .select()
      .from(moduleInstalls)
      .where(eq(moduleInstalls.id, moduleId))
      .limit(1)

    if (moduleInstallResult) {
      console.log("✅ 在 module_installs 表中找到模块:", moduleInstallResult.module_name)
    } else {
      console.log("❌ 在 module_installs 表中也未找到模块")
    }

    return moduleInstallResult
  }

  private convertToResponse(dbRecord: any): DirectoryResponse {
    return {
      id: String(dbRecord.id),
      applicationId: String(dbRecord.applicationId),
      moduleId: String(dbRecord.moduleId),
      name: String(dbRecord.name),
      slug: String(dbRecord.slug), // 添加slug字段
      type: String(dbRecord.type),
      supportsCategory: Boolean(dbRecord.supportsCategory),
      config: dbRecord.config || {},
      order: Number(dbRecord.order || 0),
      isEnabled: Boolean(dbRecord.isEnabled),
      createdAt: dbRecord.createdAt instanceof Date ? dbRecord.createdAt.toISOString() : String(dbRecord.createdAt),
      updatedAt: dbRecord.updatedAt instanceof Date ? dbRecord.updatedAt.toISOString() : String(dbRecord.updatedAt),
    }
  }

  // 通过目录ID获取对应的目录定义
  async getDirectoryDefByDirectoryId(directoryId: string): Promise<any> {
    const [result] = await db.select().from(directoryDefs).where(eq(directoryDefs.directoryId, directoryId)).limit(1)
    return result || null
  }

  // 获取可用的模块列表
  async getAvailableModules(applicationId: string): Promise<any[]> {
    console.log("🔍 DirectoryRepository.getAvailableModules 开始执行:", applicationId)

    // 获取 modules 表中的模块
    const modulesList = await db
      .select()
      .from(modules)
      .where(eq(modules.applicationId, applicationId))

    // 获取 module_installs 表中的模块
    const moduleInstallsList = await db
      .select()
      .from(moduleInstalls)
      .where(eq(moduleInstalls.applicationId, applicationId))

    // 合并两个表的数据
    const allModules = [
      ...modulesList.map(m => ({ id: m.id, name: m.name, type: m.type, source: 'modules' })),
      ...moduleInstallsList.map(m => ({ id: m.id, name: m.moduleName, type: m.moduleType, source: 'module_installs' }))
    ]

    console.log("✅ 找到可用模块:", allModules.length, "个")
    return allModules
  }

  // 生成slug的辅助方法
  private generateSlug(name: string): string {
    // 如果是英文，使用原来的逻辑
    if (/^[a-zA-Z0-9\s]+$/.test(name)) {
      return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    }

    // 如果是中文或其他字符，使用时间戳作为slug
    const timestamp = Date.now()
    return `dir-${timestamp}`
  }
}
