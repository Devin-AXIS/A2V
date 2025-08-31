import { db } from "../../db"
import { applications, modules, directories, directoryDefs, fieldDefs } from "../../db/schema"
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
            { key: 'avatar', label: '头像', type: 'profile', required: true, showInList: true, showInForm: true },
            { key: 'bio', label: '个人介绍', type: 'textarea', required: false, showInList: true, showInForm: true },
            { key: 'birthday', label: '生日', type: 'date', required: false, showInList: true, showInForm: true },
            { key: 'city', label: '居住城市', type: 'text', required: false, showInList: true, showInForm: true },
            { key: 'edu_exp', label: '教育经历', type: 'experience', required: false, showInList: true, showInForm: true },
            { key: 'email', label: '邮箱', type: 'text', required: false, showInList: true, showInForm: true },
            { key: 'gender', label: '性别', type: 'select', required: true, showInList: true, showInForm: true, options: ['男', '女', '其他'] },
            { key: 'honors', label: '荣誉证书', type: 'experience', required: false, showInList: true, showInForm: true },
            { key: 'industry', label: '行业', type: 'text', required: false, showInList: true, showInForm: true },
            { key: 'name', label: '姓名', type: 'text', required: true, showInList: true, showInForm: true },
            { key: 'occupation', label: '职业', type: 'text', required: false, showInList: true, showInForm: true },
            { key: 'phone_number', label: '手机号', type: 'text', required: true, showInList: true, showInForm: true },
            { key: 'proj_exp', label: '项目经历', type: 'experience', required: false, showInList: true, showInForm: true },
            { key: 'realname_status', label: '实名认证', type: 'text', required: false, showInList: true, showInForm: true },
            { key: 'skills', label: '技能', type: 'multiselect', required: false, showInList: true, showInForm: true },
            { key: 'socid_status', label: '社会身份认证', type: 'text', required: false, showInList: true, showInForm: true },
            { key: 'user_id', label: '用户ID', type: 'text', required: false, showInList: true, showInForm: true },
            { key: 'work_exp', label: '工作经历', type: 'experience', required: false, showInList: true, showInForm: true },
            { key: 'zodiac_sign', label: '星座', type: 'select', required: false, showInList: true, showInForm: true, options: ['白羊座', '金牛座', '双子座', '巨蟹座', '狮子座', '处女座', '天秤座', '天蝎座', '射手座', '摩羯座', '水瓶座', '双鱼座'] },
          ]
        },
        order: 0,
      },
    ]

    // 找到用户管理模块
    const userModule = modules.find(m => m.name === '用户管理')
    if (userModule) {
      for (const directory of defaultDirectories) {
        // 创建目录
        const [createdDirectory] = await db.insert(directories).values({
          applicationId,
          moduleId: userModule.id,
          name: directory.name,
          type: directory.type,
          supportsCategory: directory.supportsCategory,
          config: directory.config,
          order: directory.order,
          isEnabled: true,
        }).returning()

        // 创建目录定义
        const [directoryDef] = await db.insert(directoryDefs).values({
          applicationId,
          directoryId: createdDirectory.id,
          title: directory.name,
          slug: `${directory.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
          status: 'active',
        }).returning()

        // 创建默认字段定义
        if (directory.config.fields && directory.config.fields.length > 0) {
          for (const field of directory.config.fields) {
            await db.insert(fieldDefs).values({
              directoryId: directoryDef.id,
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
              isDefault: true, // 标记为默认字段
            })
          }
        }
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
