import { db } from "../../db"
import { applications, modules, directories } from "../../db/schema"
import { eq, and, desc } from "drizzle-orm"
import type { CreateApplicationRequest, UpdateApplicationRequest, GetApplicationsQuery } from "./dto"
import { getAllSystemModules } from "../../lib/system-modules"

// 生成slug的辅助函数
function generateSlug(name: string): string {
  // 如果是英文，使用原来的逻辑
  if (/^[a-zA-Z0-9\s]+$/.test(name)) {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }
  
  // 如果是中文或其他字符，使用时间戳作为slug
  const timestamp = Date.now()
  return `app-${timestamp}`
}

export class ApplicationService {
  // 创建应用
  async createApplication(data: CreateApplicationRequest, userId: string) {
    const newApp = {
      name: data.name,
      description: data.description || "",
      slug: generateSlug(data.name),
      ownerId: userId,
      status: "active",
      template: data.template || "default",
      config: data.config || {},
      databaseConfig: null,
      isPublic: data.isPublic || false,
      version: "1.0.0",
    }
    
    const [result] = await db.insert(applications).values(newApp).returning()
    
    // 自动创建系统模块
    const createdModules = await this.createSystemModules(result.id)
    
    // 自动创建默认目录
    await this.createDefaultDirectories(result.id, createdModules)
    
    return result
  }

  // 创建系统模块
  private async createSystemModules(applicationId: string) {
    const systemModules = getAllSystemModules()
    const createdModules = []
    
    for (let i = 0; i < systemModules.length; i++) {
      const module = systemModules[i]
      const [createdModule] = await db.insert(modules).values({
        applicationId,
        name: module.name,
        type: module.type,
        icon: module.icon,
        config: module.config,
        order: i,
        isEnabled: true,
      }).returning()
      
      createdModules.push(createdModule)
    }
    
    return createdModules
  }

  // 创建默认目录
  private async createDefaultDirectories(applicationId: string, modules: any[]) {
    const defaultDirectories = [
      // 用户管理模块的默认目录 - 管理系统用户
      {
        name: '用户列表',
        type: 'table' as const,
        supportsCategory: false,
        config: {
          description: '系统用户管理列表',
          fields: [
            { key: 'name', label: '姓名', type: 'text', required: true, showInList: true, showInForm: true },
            { key: 'email', label: '邮箱', type: 'email', required: true, showInList: true, showInForm: true },
            { key: 'roles', label: '角色', type: 'multiselect', required: true, showInList: true, showInForm: true, options: ['admin', 'user', 'editor', 'viewer'] },
            { key: 'status', label: '状态', type: 'select', required: true, showInList: true, showInForm: true, options: ['active', 'inactive', 'pending'] },
            { key: 'avatar', label: '头像', type: 'image', required: false, showInList: true, showInForm: true },
            { key: 'lastLoginAt', label: '最后登录', type: 'datetime', required: false, showInList: true, showInForm: false },
            { key: 'createdAt', label: '创建时间', type: 'datetime', required: false, showInList: true, showInForm: false },
          ]
        },
        order: 0,
      },
      {
        name: '用户注册',
        type: 'form' as const,
        supportsCategory: false,
        config: {
          description: '系统用户注册表单',
          fields: [
            { key: 'name', label: '姓名', type: 'text', required: true, showInList: false, showInForm: true },
            { key: 'email', label: '邮箱', type: 'email', required: true, showInList: false, showInForm: true },
            { key: 'password', label: '密码', type: 'password', required: true, showInList: false, showInForm: true },
            { key: 'confirmPassword', label: '确认密码', type: 'password', required: true, showInList: false, showInForm: true },
            { key: 'roles', label: '角色', type: 'multiselect', required: true, showInList: false, showInForm: true, options: ['user', 'editor', 'viewer'] },
          ]
        },
        order: 1,
      },
    ]

    // 找到用户管理模块
    const userModule = modules.find(m => m.name === '用户管理')
    if (userModule) {
      for (const directory of defaultDirectories) {
        await db.insert(directories).values({
          applicationId,
          moduleId: userModule.id,
          name: directory.name,
          type: directory.type,
          supportsCategory: directory.supportsCategory,
          config: directory.config,
          order: directory.order,
          isEnabled: true,
        })
      }
    }
  }

  // 获取应用列表
  async getApplications(query: GetApplicationsQuery, userId: string) {
    const { page = 1, limit = 10, search, status, template } = query
    const offset = (page - 1) * limit
    
    // 构建查询条件 - 只查询用户拥有的应用
    let whereConditions = [eq(applications.ownerId, userId)]
    
    if (search) {
      whereConditions.push(eq(applications.name, search))
    }
    
    if (status) {
      whereConditions.push(eq(applications.status, status))
    }
    
    if (template) {
      whereConditions.push(eq(applications.template, template))
    }
    
    // 获取总数
    const countResult = await db
      .select({ count: applications.id })
      .from(applications)
      .where(and(...whereConditions))
    
    const total = countResult.length
    
    // 获取分页数据
    const applicationsList = await db
      .select()
      .from(applications)
      .where(and(...whereConditions))
      .orderBy(desc(applications.createdAt))
      .limit(limit)
      .offset(offset)
    
    return {
      applications: applicationsList,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  // 获取应用详情
  async getApplicationById(id: string, userId: string) {
    const [application] = await db
      .select()
      .from(applications)
      .where(and(eq(applications.id, id), eq(applications.ownerId, userId)))
    
    if (!application) {
      throw new Error("应用不存在或无权限访问")
    }

    return application
  }

  // 更新应用
  async updateApplication(id: string, data: UpdateApplicationRequest, userId: string) {
    const updateData = {
      ...data,
      updatedAt: new Date()
    }
    
    const [result] = await db
      .update(applications)
      .set(updateData)
      .where(and(eq(applications.id, id), eq(applications.ownerId, userId)))
      .returning()
    
    if (!result) {
      throw new Error("应用不存在或无权限访问")
    }

    return result
  }

  // 删除应用
  async deleteApplication(id: string, userId: string) {
    const [result] = await db
      .delete(applications)
      .where(and(eq(applications.id, id), eq(applications.ownerId, userId)))
      .returning()
    
    if (!result) {
      throw new Error("应用不存在或无权限访问")
    }

    return { success: true }
  }

  // 根据模板创建应用
  async createApplicationFromTemplate(data: CreateApplicationRequest, userId: string) {
    return await this.createApplication(data, userId)
  }

  // 获取应用的模块列表
  async getApplicationModules(applicationId: string, userId: string) {
    // 先检查用户是否有权限访问该应用
    const application = await this.getApplicationById(applicationId, userId)
    
    // 获取应用的模块列表
    const modulesList = await db
      .select()
      .from(modules)
      .where(eq(modules.applicationId, applicationId))
      .orderBy(modules.order)
    
    return {
      application,
      modules: modulesList,
    }
  }
}
