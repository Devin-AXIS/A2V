import type { 
  TCreateApplicationUserRequest, 
  TUpdateApplicationUserRequest, 
  TGetApplicationUsersQuery,
  TRegisterUserRequest,
  TMergeUserRequest
} from './dto'
import * as repo from './repo'
import { db } from '../../db'
import { dirUsers } from '../../db/schema'
import { and, eq, sql } from 'drizzle-orm'

export class ApplicationUserService {
  // 创建应用用户（只创建账号）
  async createApplicationUser(
    applicationId: string, 
    data: TCreateApplicationUserRequest
  ) {
    // 检查手机号是否已存在
    const phoneExists = await repo.checkPhoneExists(applicationId, data.phone)
    if (phoneExists) {
      throw new Error('手机号已存在')
    }

    const user = await repo.createApplicationUser(applicationId, data)
    return user
  }

  // 获取应用用户列表
  async getApplicationUsers(
    applicationId: string, 
    query: TGetApplicationUsersQuery
  ) {
    const result = await repo.getApplicationUsers(applicationId, query)
    return result
  }

  // 根据ID获取应用用户
  async getApplicationUserById(
    applicationId: string, 
    userId: string
  ) {
    const user = await repo.getApplicationUserById(applicationId, userId)
    if (!user) {
      throw new Error('用户不存在')
    }
    return user
  }

  // 更新应用用户（只更新账号信息）
  async updateApplicationUser(
    applicationId: string, 
    userId: string, 
    data: TUpdateApplicationUserRequest
  ) {
    // 检查用户是否存在
    const existingUser = await repo.getApplicationUserById(applicationId, userId)
    if (!existingUser) {
      throw new Error('用户不存在')
    }

    // 如果更新手机号，检查是否与其他用户冲突
    if (data.phone && data.phone !== existingUser.phone) {
      const phoneExists = await repo.checkPhoneExists(applicationId, data.phone)
      if (phoneExists) {
        throw new Error('手机号已存在')
      }
    }

    const user = await repo.updateApplicationUser(applicationId, userId, data)
    return user
  }

  // 删除应用用户
  async deleteApplicationUser(
    applicationId: string, 
    userId: string
  ) {
    // 检查用户是否存在
    const existingUser = await repo.getApplicationUserById(applicationId, userId)
    if (!existingUser) {
      throw new Error('用户不存在')
    }

    // 检查是否为最后一个管理员
    if (existingUser.role === 'admin') {
      const adminCount = await this.getAdminCount(applicationId)
      if (adminCount <= 1) {
        throw new Error('不能删除最后一个管理员')
      }
    }

    const user = await repo.deleteApplicationUser(applicationId, userId)
    return user
  }

  // 更新最后登录时间
  async updateLastLoginTime(
    applicationId: string, 
    userId: string
  ) {
    const user = await repo.updateLastLoginTime(applicationId, userId)
    return user
  }

  // 获取管理员数量
  private async getAdminCount(applicationId: string) {
    const result = await repo.getApplicationUsers(applicationId, {
      page: 1,
      limit: 1000,
      role: 'admin',
    })
    return result.users.length
  }

  // 批量操作
  async batchUpdateUsers(
    applicationId: string, 
    userIds: string[], 
    data: Partial<TUpdateApplicationUserRequest>
  ) {
    const results = []
    for (const userId of userIds) {
      try {
        const result = await this.updateApplicationUser(applicationId, userId, data)
        results.push({ userId, success: true, data: result })
      } catch (error) {
        results.push({ userId, success: false, error: error instanceof Error ? error.message : '未知错误' })
      }
    }
    return results
  }

  // 用户注册
  async registerUser(
    applicationId: string, 
    data: TRegisterUserRequest
  ) {
    console.log('🔍 开始用户注册:', { applicationId, phone: data.phone })
    
    // 检查手机号是否已存在
    const existingUser = await repo.findUserByPhone(applicationId, data.phone)
    
    if (existingUser) {
      console.log('🔍 发现相同手机号用户，执行合并:', existingUser.id)
      // 合并用户
      return await this.mergeUser(applicationId, existingUser.id, data)
    } else {
      console.log('🔍 创建新用户')
      // 创建新用户（只创建账号）
      const userData = {
        phone: data.phone,
        password: data.password, // 临时存储密码，后续需要加密
        role: 'user',
        status: 'active',
        metadata: {
          source: 'register',
          registeredAt: new Date().toISOString()
        }
      }
      
      const user = await repo.createApplicationUser(applicationId, userData)
      
      // 在用户模块中创建对应的业务数据记录
      await this.createUserBusinessRecord(applicationId, user.id, user.phone, data)
      
      console.log('✅ 用户注册成功:', user.id)
      return user
    }
  }

  // 合并用户
  async mergeUser(
    applicationId: string, 
    targetUserId: string, 
    registerData: TRegisterUserRequest
  ) {
    console.log('🔍 开始合并用户:', { targetUserId, phone: registerData.phone })
    
    // 获取目标用户信息
    const targetUser = await repo.getApplicationUserById(applicationId, targetUserId)
    if (!targetUser) {
      throw new Error('目标用户不存在')
    }
    
    // 合并数据（只更新账号信息）
    const mergedData = {
      phone: registerData.phone,
      status: 'active', // 激活状态
      metadata: {
        ...targetUser.metadata,
        // 添加注册信息
        password: registerData.password, // 临时存储密码，后续需要加密
        source: 'merged',
        mergedAt: new Date().toISOString(),
        originalSource: targetUser.metadata?.source || 'manual'
      }
    }
    
    // 更新用户信息
    const updatedUser = await repo.updateApplicationUser(applicationId, targetUserId, mergedData)
    
    // 更新业务数据记录（以注册用户数据为准）
    await this.updateUserBusinessRecord(applicationId, targetUserId, registerData)
    
    console.log('✅ 用户合并成功:', updatedUser.id)
    return updatedUser
  }

  // 根据手机号查找用户
  async findUserByPhone(applicationId: string, phone: string) {
    const user = await repo.findUserByPhone(applicationId, phone)
    return user
  }

  // 创建用户业务数据记录
  private async createUserBusinessRecord(
    applicationId: string, 
    userId: string, 
    phone: string, 
    userData: TRegisterUserRequest
  ) {
    try {
      // 在 dir_users 表中创建业务数据记录
      const [businessRecord] = await db.insert(dirUsers).values({
        tenantId: applicationId,
        props: {
          // 基础信息
          name: userData.name || '',
          phone: phone,
          email: userData.email || '',
          avatar: userData.avatar || '',
          gender: userData.gender || '',
          city: userData.city || '',
          birthday: userData.birthday || '',
          // 其他字段
          department: '',
          position: '',
          tags: [],
          // 关联信息
          userId: userId,
          source: 'register',
          registeredAt: new Date().toISOString()
        }
      }).returning()

      console.log('✅ 用户业务数据记录创建成功:', businessRecord.id)
      return businessRecord
    } catch (error) {
      console.error('❌ 创建用户业务数据记录失败:', error)
      throw error
    }
  }

  // 更新用户业务数据记录（合并时使用，以注册用户数据为准）
  private async updateUserBusinessRecord(
    applicationId: string, 
    userId: string, 
    registerData: TRegisterUserRequest
  ) {
    try {
      // 查找现有的业务数据记录
      const existingRecords = await db
        .select()
        .from(dirUsers)
        .where(
          and(
            eq(dirUsers.tenantId, applicationId),
            sql`${dirUsers.props}->>'userId' = ${userId}`
          )
        )
        .limit(1)

      if (existingRecords.length > 0) {
        // 更新现有记录（以注册用户数据为准）
        const existingRecord = existingRecords[0]
        const updatedProps = {
          ...existingRecord.props,
          // 以注册用户数据为准，覆盖现有数据
          name: registerData.name || existingRecord.props.name || '',
          email: registerData.email || existingRecord.props.email || '',
          avatar: registerData.avatar || existingRecord.props.avatar || '',
          gender: registerData.gender || existingRecord.props.gender || '',
          city: registerData.city || existingRecord.props.city || '',
          birthday: registerData.birthday || existingRecord.props.birthday || '',
          phone: registerData.phone, // 手机号以注册为准
          // 保留其他字段
          department: existingRecord.props.department || '',
          position: existingRecord.props.position || '',
          tags: existingRecord.props.tags || [],
          // 更新合并信息
          source: 'merged',
          mergedAt: new Date().toISOString(),
          originalSource: existingRecord.props.source || 'manual'
        }

        await db
          .update(dirUsers)
          .set({ props: updatedProps })
          .where(eq(dirUsers.id, existingRecord.id))

        console.log('✅ 用户业务数据记录更新成功（合并）:', existingRecord.id)
      } else {
        // 如果没有现有记录，创建新记录
        await this.createUserBusinessRecord(applicationId, userId, registerData.phone, registerData)
        console.log('✅ 用户业务数据记录创建成功（合并）')
      }
    } catch (error) {
      console.error('❌ 更新用户业务数据记录失败:', error)
      throw error
    }
  }

  async batchDeleteUsers(
    applicationId: string, 
    userIds: string[]
  ) {
    const results = []
    for (const userId of userIds) {
      try {
        const result = await this.deleteApplicationUser(applicationId, userId)
        results.push({ userId, success: true, data: result })
      } catch (error) {
        results.push({ userId, success: false, error: error instanceof Error ? error.message : '未知错误' })
      }
    }
    return results
  }
}
