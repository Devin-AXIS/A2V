import type { 
  TCreateApplicationUserRequest, 
  TUpdateApplicationUserRequest, 
  TGetApplicationUsersQuery 
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
