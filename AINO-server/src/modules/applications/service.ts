import { db } from "../../db"
import { applications, modules, directories, directoryDefs, fieldDefs, fieldCategories, moduleInstalls } from "../../db/schema"
import { eq, and, desc, sql } from "drizzle-orm"
import type { CreateApplicationRequest, UpdateApplicationRequest, GetApplicationsQuery } from "./dto"
import { getAllSystemModules } from "../../lib/system-modules"
import { ModuleService } from "../modules/service"

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
  private moduleService = new ModuleService()

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

    // 自动创建默认目录
    const createdModules = await this.createSystemModules(result.id)
    await this.createDefaultDirectories(result.id, createdModules)

    return result
  }

  // 创建系统模块 - 只创建用户模块
  private async createSystemModules(applicationId: string) {
    const systemModules = getAllSystemModules()
    const createdModules = []

    // 只创建用户模块，其他模块由用户主动安装
    for (let i = 0; i < systemModules.length; i++) {
      const module = systemModules[i]
      // 只创建用户模块
      if (module.key === 'user') {
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
    }

    return createdModules
  }

  // 创建默认目录
  private async createDefaultDirectories(applicationId: string, modules: any[]) {
    // 找到用户管理模块
    const userModule = modules.find(m => m.name === '用户管理')
    if (userModule) {
      // 创建用户列表目录
      const [createdDirectory] = await db.insert(directories).values({
        applicationId,
        moduleId: userModule.id,
        name: '用户列表',
        type: 'table',
        supportsCategory: false,
        config: {
          description: '系统用户管理列表',
          fields: []
        },
        order: 0,
        isEnabled: true,
      }).returning()

      // 创建目录定义
      const [directoryDef] = await db.insert(directoryDefs).values({
        applicationId,
        directoryId: createdDirectory.id,
        title: '用户列表',
        slug: `user-list-${Date.now()}`,
        status: 'active',
      }).returning()

      // 自动创建用户模块的默认字段分类与默认字段（软失败，不阻断应用创建）
      try {
        await this.createUserModuleFieldCategories(applicationId, createdDirectory.id)
      } catch (err) {
        console.error('创建用户模块字段分类失败（已忽略）:', {
          applicationId,
          directoryId: createdDirectory.id,
          error: err instanceof Error ? err.message : String(err),
        })
      }

      try {
        await this.createUserModuleDefaultFields(directoryDef.id, createdDirectory.id)
      } catch (err) {
        console.error('创建用户模块默认字段失败（已忽略）:', {
          applicationId,
          directoryId: createdDirectory.id,
          directoryDefId: directoryDef.id,
          error: err instanceof Error ? err.message : String(err),
        })
      }
    }
  }

  // 创建用户模块字段分类
  private async createUserModuleFieldCategories(applicationId: string, directoryId: string) {
    const categories = [
      {
        applicationId,
        directoryId,
        name: '基础信息',
        description: '用户基本信息',
        order: 1,
        system: true,
        enabled: true,
      },
      {
        applicationId,
        directoryId,
        name: '用户履历',
        description: '用户经历和履历',
        order: 2,
        system: true,
        enabled: true,
      },
      {
        applicationId,
        directoryId,
        name: '实名与认证',
        description: '身份认证信息',
        order: 3,
        system: true,
        enabled: true,
      }
    ]

    await db.insert(fieldCategories).values(categories)
  }

  // 创建用户模块默认字段
  private async createUserModuleDefaultFields(directoryDefId: string, directoryId: string) {
    // 先获取刚创建的分类ID
    const categories = await db.select().from(fieldCategories).where(eq(fieldCategories.directoryId, directoryId))
    const categoryMap: Record<string, string> = {}
    categories.forEach(cat => {
      categoryMap[cat.name] = cat.id
    })

    const fields = [
      // 基础信息 (10个字段)
      { key: 'avatar', label: '头像', type: 'profile', required: true, showInList: true, showInForm: true, category: '基础信息' },
      { key: 'name', label: '姓名', type: 'text', required: true, showInList: true, showInForm: true, category: '基础信息' },
      { key: 'email', label: '邮箱', type: 'email', required: false, showInList: true, showInForm: true, category: '基础信息', preset: 'email' as any },
      { key: 'phone_number', label: '手机号', type: 'phone', required: true, showInList: true, showInForm: true, category: '基础信息', preset: 'phone' as any },
      { key: 'gender', label: '性别', type: 'select', required: true, showInList: true, showInForm: true, options: ['男', '女', '其他'], category: '基础信息' },
      { key: 'birthday', label: '生日', type: 'date', required: false, showInList: true, showInForm: true, category: '基础信息' },
      { key: 'city', label: '居住城市', type: 'text', required: false, showInList: true, showInForm: true, category: '基础信息', preset: 'city' as any },
      { key: 'industry', label: '行业', type: 'text', required: false, showInList: true, showInForm: true, category: '基础信息' },
      { key: 'occupation', label: '职业', type: 'text', required: false, showInList: true, showInForm: true, category: '基础信息' },
      { key: 'bio', label: '个人介绍', type: 'textarea', required: false, showInList: true, showInForm: true, category: '基础信息' },

      // 用户履历 (7个字段)
      { key: 'work_exp', label: '工作经历', type: 'experience', required: false, showInList: true, showInForm: true, category: '用户履历' },
      { key: 'edu_exp', label: '教育经历', type: 'experience', required: false, showInList: true, showInForm: true, category: '用户履历' },
      { key: 'proj_exp', label: '项目经历', type: 'experience', required: false, showInList: true, showInForm: true, category: '用户履历' },
      { key: 'honors', label: '荣誉证书', type: 'experience', required: false, showInList: true, showInForm: true, category: '用户履历' },
      { key: 'skills', label: '技能', type: 'multiselect', required: false, showInList: true, showInForm: true, category: '用户履历' },
      { key: 'zodiac_sign', label: '星座', type: 'select', required: false, showInList: true, showInForm: true, options: ['白羊座', '金牛座', '双子座', '巨蟹座', '狮子座', '处女座', '天秤座', '天蝎座', '射手座', '摩羯座', '水瓶座', '双鱼座'], category: '用户履历' },
      { key: 'user_id', label: '用户ID', type: 'text', required: false, showInList: true, showInForm: true, category: '用户履历' },

      // 实名与认证 (2个字段)
      { key: 'realname_status', label: '实名认证', type: 'identity_verification', required: false, showInList: true, showInForm: true, category: '实名与认证', preset: 'identity_verification' as any },
      { key: 'socid_status', label: '社会身份认证', type: 'other_verification', required: false, showInList: true, showInForm: true, category: '实名与认证', preset: 'other_verification' as any }
    ]

    const fieldValues = fields.map(field => ({
      directoryId: directoryDefId,
      key: field.key,
      kind: 'primitive',
      type: field.type,
      schema: {
        label: field.label,
        showInList: field.showInList,
        showInForm: field.showInForm,
        options: field.options || [],
        // 透传预设，便于前端按预设渲染
        preset: (field as any).preset,
      },
      validators: {},
      required: field.required || false,
      readRoles: ['admin', 'member'],
      writeRoles: ['admin'],
      categoryId: categoryMap[field.category] || null, // 添加分类ID关联
    }))

    try {
      await db.insert(fieldDefs).values(fieldValues)
    } catch (err) {
      // 单条回退：尝试逐条插入以获得更清晰的错误并尽可能插入其余字段
      console.warn('批量插入默认字段失败，尝试逐条插入:', err instanceof Error ? err.message : String(err))
      for (const value of fieldValues) {
        try {
          await db.insert(fieldDefs).values(value)
        } catch (singleErr) {
          console.error('插入单个默认字段失败（已忽略）:', {
            directoryDefId,
            directoryId,
            key: value.key,
            error: singleErr instanceof Error ? singleErr.message : String(singleErr),
          })
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

    // 获取系统预定义模块（modules表）
    const systemModules = await db
      .select()
      .from(modules)
      .where(eq(modules.applicationId, applicationId))
      .orderBy(modules.order)

    // 获取用户安装的模块（moduleInstalls表）
    const installedModules = await db
      .select({
        id: moduleInstalls.id,
        applicationId: moduleInstalls.applicationId,
        name: moduleInstalls.moduleName,
        type: moduleInstalls.moduleType,
        icon: sql<string>`COALESCE(${moduleInstalls.installConfig}->>'icon', 'package')`,
        config: moduleInstalls.installConfig,
        order: sql<number>`0`,
        isEnabled: sql<boolean>`${moduleInstalls.installStatus} = 'active'`,
        createdAt: moduleInstalls.installedAt,
        updatedAt: moduleInstalls.updatedAt,
      })
      .from(moduleInstalls)
      .where(eq(moduleInstalls.applicationId, applicationId))
      .orderBy(moduleInstalls.installedAt)

    // 合并两个表的模块数据
    const allModules = [
      ...systemModules,
      ...installedModules
    ]

    return {
      application,
      modules: allModules,
    }
  }
}
