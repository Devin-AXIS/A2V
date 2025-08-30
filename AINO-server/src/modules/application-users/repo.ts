import { db } from '../../db'
import { applicationUsers } from '../../db/schema'
import { eq, and, or, like, desc, asc, count, sql } from 'drizzle-orm'
import type { 
  TCreateApplicationUserRequest, 
  TUpdateApplicationUserRequest, 
  TGetApplicationUsersQuery 
} from './dto'

// 创建应用用户
export async function createApplicationUser(
  applicationId: string, 
  data: TCreateApplicationUserRequest
) {
  const [result] = await db.insert(applicationUsers).values({
    applicationId,
    name: data.name,
    email: data.email,
    phone: data.phone,
    avatar: data.avatar,
    role: data.role,
    department: data.department,
    position: data.position,
    tags: data.tags,
    metadata: data.metadata,
  }).returning()

  return result
}

// 获取应用用户列表
export async function getApplicationUsers(
  applicationId: string, 
  query: TGetApplicationUsersQuery
) {
  const { page, limit, search, status, role, department, sortBy, sortOrder } = query
  const offset = (page - 1) * limit

  // 构建查询条件
  const conditions = [eq(applicationUsers.applicationId, applicationId)]
  
  if (search) {
    conditions.push(
      or(
        like(applicationUsers.name, `%${search}%`),
        like(applicationUsers.email, `%${search}%`),
        like(applicationUsers.phone || '', `%${search}%`)
      )
    )
  }
  
  if (status) {
    conditions.push(eq(applicationUsers.status, status))
  }
  
  if (role) {
    conditions.push(eq(applicationUsers.role, role))
  }
  
  if (department) {
    conditions.push(eq(applicationUsers.department || '', department))
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

  return {
    users,
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

// 更新应用用户
export async function updateApplicationUser(
  applicationId: string, 
  userId: string, 
  data: TUpdateApplicationUserRequest
) {
  const updateData: any = {}
  
  if (data.name !== undefined) updateData.name = data.name
  if (data.email !== undefined) updateData.email = data.email
  if (data.phone !== undefined) updateData.phone = data.phone
  if (data.avatar !== undefined) updateData.avatar = data.avatar
  if (data.status !== undefined) updateData.status = data.status
  if (data.role !== undefined) updateData.role = data.role
  if (data.department !== undefined) updateData.department = data.department
  if (data.position !== undefined) updateData.position = data.position
  if (data.tags !== undefined) updateData.tags = data.tags
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

// 检查邮箱是否已存在
export async function checkEmailExists(
  applicationId: string, 
  email: string, 
  excludeUserId?: string
) {
  const conditions = [
    eq(applicationUsers.applicationId, applicationId),
    eq(applicationUsers.email, email)
  ]
  
  if (excludeUserId) {
    conditions.push(sql`${applicationUsers.id} != ${excludeUserId}`)
  }

  const [result] = await db
    .select({ count: count() })
    .from(applicationUsers)
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
