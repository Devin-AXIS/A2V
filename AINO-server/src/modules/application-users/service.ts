import type { 
  TCreateApplicationUserRequest, 
  TUpdateApplicationUserRequest, 
  TGetApplicationUsersQuery,
  TRegisterUserRequest,
  TMergeUserRequest
} from './dto'
import * as repo from './repo'

export class ApplicationUserService {
  // 创建应用用户
  async createApplicationUser(
    applicationId: string, 
    data: TCreateApplicationUserRequest
  ) {
    // 检查邮箱是否已存在
    const emailExists = await repo.checkEmailExists(applicationId, data.email)
    if (emailExists) {
      throw new Error('邮箱已存在')
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

  // 更新应用用户
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

    // 如果更新邮箱，检查是否与其他用户冲突
    if (data.email && data.email !== existingUser.email) {
      const emailExists = await repo.checkEmailExists(applicationId, data.email, userId)
      if (emailExists) {
        throw new Error('邮箱已存在')
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
      // 创建新用户
      const userData = {
        name: data.name || data.phone,
        email: data.email || '',
        phone: data.phone,
        role: 'user',
        status: 'active',
        metadata: {
          password: data.password, // 临时存储密码，后续需要加密
          gender: data.gender,
          city: data.city,
          birthday: data.birthday,
          avatar: data.avatar,
          source: 'register',
          registeredAt: new Date().toISOString()
        }
      }
      
      const user = await repo.createApplicationUser(applicationId, userData)
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
    
    // 合并数据
    const mergedData = {
      // 保留目标用户的基础信息
      name: targetUser.name || registerData.name || registerData.phone,
      email: targetUser.email || registerData.email || '',
      phone: registerData.phone,
      status: 'active', // 激活状态
      metadata: {
        ...targetUser.metadata,
        // 添加注册信息
        password: registerData.password, // 临时存储密码，后续需要加密
        gender: registerData.gender,
        city: registerData.city,
        birthday: registerData.birthday,
        avatar: registerData.avatar,
        source: 'merged',
        mergedAt: new Date().toISOString(),
        originalSource: targetUser.metadata?.source || 'manual'
      }
    }
    
    // 更新用户信息
    const updatedUser = await repo.updateApplicationUser(applicationId, targetUserId, mergedData)
    console.log('✅ 用户合并成功:', updatedUser.id)
    return updatedUser
  }

  // 根据手机号查找用户
  async findUserByPhone(applicationId: string, phone: string) {
    const user = await repo.findUserByPhone(applicationId, phone)
    return user
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
