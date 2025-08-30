import { eq, and, desc, sql } from 'drizzle-orm'
import { db } from '../../db'
import { directoryDefs, directories, applications } from '../../../drizzle/schema'

export interface CreateDirectoryDefData {
  slug: string
  title: string
  version?: number
  status?: string
  applicationId: string
  directoryId: string
}

export interface UpdateDirectoryDefData {
  slug?: string
  title?: string
  version?: number
  status?: string
}

export interface ListDirectoryDefsQuery {
  applicationId?: string
  directoryId?: string
  status?: string
  page?: number
  limit?: number
}

export class DirectoryDefsService {
  // 创建目录定义
  async createDirectoryDef(data: CreateDirectoryDefData) {
    // 验证应用是否存在
    const [application] = await db.select()
      .from(applications)
      .where(eq(applications.id, data.applicationId))
      .limit(1)

    if (!application) {
      throw new Error('应用不存在')
    }

    // 验证目录是否存在
    const [directory] = await db.select()
      .from(directories)
      .where(eq(directories.id, data.directoryId))
      .limit(1)

    if (!directory) {
      throw new Error('目录不存在')
    }

    // 检查slug是否已存在
    const [existing] = await db.select()
      .from(directoryDefs)
      .where(eq(directoryDefs.slug, data.slug))
      .limit(1)

    if (existing) {
      throw new Error('目录定义标识符已存在')
    }

    const [result] = await db.insert(directoryDefs)
      .values({
        slug: data.slug,
        title: data.title,
        version: data.version || 1,
        status: data.status || 'active',
        applicationId: data.applicationId,
        directoryId: data.directoryId,
      })
      .returning()

    return result
  }

  // 获取目录定义列表
  async listDirectoryDefs(query: ListDirectoryDefsQuery) {
    const { applicationId, directoryId, status, page = 1, limit = 20 } = query
    const offset = (page - 1) * limit

    const whereConditions = []
    if (applicationId) {
      whereConditions.push(eq(directoryDefs.applicationId, applicationId))
    }
    if (directoryId) {
      whereConditions.push(eq(directoryDefs.directoryId, directoryId))
    }
    if (status) {
      whereConditions.push(eq(directoryDefs.status, status))
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined

    const results = await db.select()
      .from(directoryDefs)
      .where(whereClause)
      .orderBy(desc(directoryDefs.createdAt))
      .limit(limit)
      .offset(offset)

    const [{ count }] = await db.select({ count: sql`count(*)` })
      .from(directoryDefs)
      .where(whereClause)

    return {
      data: results,
      pagination: {
        page,
        limit,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / limit)
      }
    }
  }

  // 获取单个目录定义
  async getDirectoryDef(id: string) {
    const [result] = await db.select()
      .from(directoryDefs)
      .where(eq(directoryDefs.id, id))
      .limit(1)

    if (!result) {
      throw new Error('目录定义不存在')
    }

    return result
  }

  // 根据slug获取目录定义
  async getDirectoryDefBySlug(slug: string) {
    const [result] = await db.select()
      .from(directoryDefs)
      .where(eq(directoryDefs.slug, slug))
      .limit(1)

    if (!result) {
      throw new Error('目录定义不存在')
    }

    return result
  }

  // 更新目录定义
  async updateDirectoryDef(id: string, data: UpdateDirectoryDefData) {
    // 检查是否存在
    const [existing] = await db.select()
      .from(directoryDefs)
      .where(eq(directoryDefs.id, id))
      .limit(1)

    if (!existing) {
      throw new Error('目录定义不存在')
    }

    // 如果更新slug，检查是否与其他记录冲突
    if (data.slug && data.slug !== existing.slug) {
      const [conflict] = await db.select()
        .from(directoryDefs)
        .where(eq(directoryDefs.slug, data.slug))
        .limit(1)

      if (conflict) {
        throw new Error('目录定义标识符已存在')
      }
    }

    const [result] = await db.update(directoryDefs)
      .set({
        ...data,
        updatedAt: new Date().toISOString()
      })
      .where(eq(directoryDefs.id, id))
      .returning()

    return result
  }

  // 删除目录定义
  async deleteDirectoryDef(id: string) {
    const [existing] = await db.select()
      .from(directoryDefs)
      .where(eq(directoryDefs.id, id))
      .limit(1)

    if (!existing) {
      throw new Error('目录定义不存在')
    }

    await db.delete(directoryDefs)
      .where(eq(directoryDefs.id, id))

    return { success: true }
  }

  // 根据旧目录ID获取或创建目录定义
  async getOrCreateDirectoryDefByDirectoryId(directoryId: string, applicationId: string) {
    console.log("🔍 查找目录定义，参数:", { directoryId, applicationId })
    
    // 先尝试查找现有的目录定义
    const [existing] = await db.select()
      .from(directoryDefs)
      .where(eq(directoryDefs.directoryId, directoryId))
      .limit(1)

    if (existing) {
      console.log("✅ 找到现有目录定义:", existing)
      return existing
    }

    console.log("🔍 未找到目录定义，查找目录信息...")
    
    // 如果没有找到，获取目录信息并创建新的目录定义
    const [directory] = await db.select()
      .from(directories)
      .where(eq(directories.id, directoryId))
      .limit(1)

    console.log("🔍 目录查询结果:", directory)

    if (!directory) {
      throw new Error('目录不存在')
    }

    // 生成唯一的slug
    let baseSlug = directory.name.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]/g, '-')
    
    // 如果slug为空或全是连字符，使用目录ID的前8位
    if (!baseSlug || baseSlug.replace(/-/g, '') === '') {
      baseSlug = `dir-${directoryId.substring(0, 8)}`
    }
    
    // 清理多余的连字符
    baseSlug = baseSlug.replace(/-+/g, '-').replace(/^-|-$/g, '')
    
    let slug = baseSlug
    let counter = 1

    while (true) {
      const [conflict] = await db.select()
        .from(directoryDefs)
        .where(eq(directoryDefs.slug, slug))
        .limit(1)

      if (!conflict) {
        break
      }
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // 创建新的目录定义
    return this.createDirectoryDef({
      slug,
      title: directory.name,
      applicationId,
      directoryId,
    })
  }
}
