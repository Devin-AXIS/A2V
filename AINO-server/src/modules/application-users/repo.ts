import { db } from '../../db'
import { applicationUsers, dirUsers, directories, modules } from '../../db/schema'
import { eq, and, or, like, desc, asc, count, sql } from 'drizzle-orm'
import type { 
  TCreateApplicationUserRequest, 
  TUpdateApplicationUserRequest, 
  TGetApplicationUsersQuery 
} from './dto'

// 创建应用用户（只创建账号，业务数据存储在用户模块中）
export async function createApplicationUser(
  applicationId: string, 
  data: TCreateApplicationUserRequest
) {
  const [result] = await db.insert(applicationUsers).values({
    applicationId,
    phone: data.phone_number,
    password: data.password,
    role: data.role || 'user',
    status: data.status || 'active',
    metadata: data.metadata || {},
  }).returning()

  return result
}

// 获取应用用户列表（联表查询账号和业务数据）
export async function getApplicationUsers(
  applicationId: string, 
  query: TGetApplicationUsersQuery
) {
  const { page, limit, search, status, role, department, sortBy, sortOrder } = query
  const offset = (page - 1) * limit

  // 直接从 dir_users 表获取业务数据，不需要查找用户目录
  console.log('🔍 开始获取用户列表:', { applicationId })
  
  // 构建查询条件
  const conditions = [eq(applicationUsers.applicationId, applicationId)]
  
  if (search) {
    conditions.push(like(applicationUsers.phone, `%${search}%`))
  }
  
  if (status) {
    conditions.push(eq(applicationUsers.status, status))
  }
  
  if (role) {
    conditions.push(eq(applicationUsers.role, role))
  }

  const whereClause = and(...conditions)

  // 获取总数
  const [{ total }] = await db
    .select({ total: count() })
    .from(applicationUsers)
    .where(whereClause)

  // 获取数据
  const orderByClause = sortOrder === 'desc' 
    ? desc(applicationUsers[sortBy as keyof typeof applicationUsers])
    : asc(applicationUsers[sortBy as keyof typeof applicationUsers])

  const users = await db
    .select()
    .from(applicationUsers)
    .where(whereClause)
    .orderBy(orderByClause)
    .limit(limit)
    .offset(offset)

  // 为每个用户查询业务数据
  const mergedUsers = await Promise.all(
    users.map(async (user) => {
      // 查询该用户的业务数据
      let businessData = {}
      try {
        const businessRecords = await db
          .select({ props: dirUsers.props })
          .from(dirUsers)
          .where(
            and(
              eq(dirUsers.tenantId, applicationId),
              sql`${dirUsers.props}->>'userId' = ${user.id}`
            )
          )
          .limit(1)

        const businessRecord = businessRecords[0]
        businessData = businessRecord?.props || {}
        console.log('🔍 业务数据查询结果:', { userPhone: user.phone, businessRecord, businessData })
      } catch (error) {
        console.error('❌ 业务数据查询失败:', error)
        businessData = {}
      }
      
      return {
        ...user,
        // 从业务数据中提取字段
        name: businessData.name || '',
        email: businessData.email || '',
        avatar: businessData.avatar || '',
        department: businessData.department || '',
        position: businessData.position || '',
        tags: businessData.tags || [],
        // 添加phone_number字段（业务数据中的手机号）
        phone_number: businessData.phone_number || user.phone,
      }
    })
  )

  return {
    users: mergedUsers,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

// 根据ID获取应用用户
export async function getApplicationUserById(
  applicationId: string, 
  userId: string
) {
  const [result] = await db
    .select()
    .from(applicationUsers)
    .where(
      and(
        eq(applicationUsers.id, userId),
        eq(applicationUsers.applicationId, applicationId)
      )
    )

  return result
}

// 更新应用用户（只更新账号信息，业务数据通过用户模块更新）
export async function updateApplicationUser(
  applicationId: string, 
  userId: string, 
  data: TUpdateApplicationUserRequest
) {
  const updateData: any = {}
  
  // 只更新账号相关字段
  if (data.phone_number !== undefined) updateData.phone = data.phone_number
  if (data.password !== undefined) updateData.password = data.password
  if (data.status !== undefined) updateData.status = data.status
  if (data.role !== undefined) updateData.role = data.role
  if (data.metadata !== undefined) updateData.metadata = data.metadata
  
  updateData.updatedAt = new Date()

  const [result] = await db
    .update(applicationUsers)
    .set(updateData)
    .where(
      and(
        eq(applicationUsers.id, userId),
        eq(applicationUsers.applicationId, applicationId)
      )
    )
    .returning()

  return result
}

// 删除应用用户
export async function deleteApplicationUser(
  applicationId: string, 
  userId: string
) {
  const [result] = await db
    .delete(applicationUsers)
    .where(
      and(
        eq(applicationUsers.id, userId),
        eq(applicationUsers.applicationId, applicationId)
      )
    )
    .returning()

  return result
}

// 检查邮箱是否已存在（在用户模块的业务数据中检查）
export async function checkEmailExists(
  applicationId: string, 
  email: string, 
  excludeUserId?: string
) {
  // 找到用户模块的用户列表目录
  const [userDirectory] = await db
    .select({ id: directories.id })
    .from(directories)
    .innerJoin(modules, eq(directories.moduleId, modules.id))
    .where(
      and(
        eq(modules.applicationId, applicationId),
        eq(modules.name, '用户管理'),
        eq(directories.name, '用户列表')
      )
    )
    .limit(1)

  if (!userDirectory) {
    return false
  }

  // 在业务数据中检查邮箱
  const conditions = [
    eq(records.directoryId, userDirectory.id),
    sql`${records.data}->>'email' = ${email}`
  ]
  
  if (excludeUserId) {
    // 通过手机号关联到账号表，然后排除指定用户
    conditions.push(sql`NOT EXISTS (
      SELECT 1 FROM application_users au 
      WHERE au.id = ${excludeUserId} 
      AND au.phone = ${records.data}->>'phone'
    )`)
  }

  const [result] = await db
    .select({ count: count() })
    .from(records)
    .where(and(...conditions))

  return result.count > 0
}

// 更新最后登录时间
export async function updateLastLoginTime(
  applicationId: string, 
  userId: string
) {
  const [result] = await db
    .update(applicationUsers)
    .set({ 
      lastLoginAt: new Date(),
      updatedAt: new Date()
    })
    .where(
      and(
        eq(applicationUsers.id, userId),
        eq(applicationUsers.applicationId, applicationId)
      )
    )
    .returning()

  return result
}

// 根据手机号查找用户
export async function findUserByPhone(applicationId: string, phone: string) {
  const [user] = await db
    .select()
    .from(applicationUsers)
    .where(
      and(
        eq(applicationUsers.applicationId, applicationId),
        eq(applicationUsers.phone, phone)
      )
    )
    .limit(1)

  return user
}

// 检查手机号是否存在
export async function checkPhoneExists(applicationId: string, phone: string) {
  const user = await findUserByPhone(applicationId, phone)
  return !!user
}
