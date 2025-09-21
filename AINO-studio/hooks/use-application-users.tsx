"use client"

import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'

interface UseApplicationUsersOptions {
  autoFetch?: boolean
}

export function useApplicationUsers(
  applicationId: string,
  options: UseApplicationUsersOptions = {}
) {
  const { autoFetch = true } = options
  
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })

  const fetchUsers = useCallback(async (params?: {
    page?: number
    limit?: number
    search?: string
    status?: string
    role?: string
    department?: string
    sortBy?: string
    sortOrder?: string
  }) => {
    if (!applicationId) return

    setIsLoading(true)
    setError(null)

    try {
      console.log('🔍 获取应用用户列表:', { applicationId, params })
      
      const response = await api.applicationUsers.getApplicationUsers(applicationId, {
        page: 1,
        limit: 100, // 获取更多用户
        ...params
      })

      console.log('📡 应用用户API响应:', response)

      if (response.success && response.data) {
        setUsers(response.data.users || [])
        setPagination(response.data.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0
        })
        console.log('✅ 应用用户获取成功:', response.data.users?.length, '个用户')
      } else {
        throw new Error(response.error || '获取用户列表失败')
      }
    } catch (err) {
      console.error('❌ 获取应用用户失败:', err)
      setError(err instanceof Error ? err.message : '获取用户列表失败')
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }, [applicationId])

  const createUser = useCallback(async (userData: any) => {
    if (!applicationId) return

    try {
      console.log('🔍 创建应用用户:', { applicationId, userData })
      
      const response = await api.applicationUsers.createApplicationUser(applicationId, userData)
      
      if (response.success) {
        console.log('✅ 用户创建成功')
        // 刷新用户列表
        await fetchUsers()
        return response.data
      } else {
        throw new Error(response.error || '创建用户失败')
      }
    } catch (err) {
      console.error('❌ 创建用户失败:', err)
      throw err
    }
  }, [applicationId, fetchUsers])

  const registerUser = useCallback(async (userData: any) => {
    if (!applicationId) return

    try {
      console.log('🔍 注册应用用户:', { applicationId, userData })
      
      const response = await api.applicationUsers.registerUser(applicationId, userData)
      
      if (response.success) {
        console.log('✅ 用户注册成功')
        // 刷新用户列表
        await fetchUsers()
        return response.data
      } else {
        throw new Error(response.error || '用户注册失败')
      }
    } catch (err) {
      console.error('❌ 用户注册失败:', err)
      throw err
    }
  }, [applicationId, fetchUsers])

  const updateUser = useCallback(async (userId: string, userData: any) => {
    if (!applicationId) return

    try {
      console.log('🔍 更新应用用户:', { applicationId, userId, userData })
      
      const response = await api.applicationUsers.updateApplicationUser(applicationId, userId, userData)
      
      if (response.success) {
        console.log('✅ 用户更新成功')
        // 刷新用户列表
        await fetchUsers()
        return response.data
      } else {
        throw new Error(response.error || '更新用户失败')
      }
    } catch (err) {
      console.error('❌ 更新用户失败:', err)
      throw err
    }
  }, [applicationId, fetchUsers])

  const deleteUser = useCallback(async (userId: string) => {
    if (!applicationId) return

    try {
      console.log('🔍 删除应用用户:', { applicationId, userId })
      
      const response = await api.applicationUsers.deleteApplicationUser(applicationId, userId)
      
      if (response.success) {
        console.log('✅ 用户删除成功')
        // 刷新用户列表
        await fetchUsers()
        return true
      } else {
        throw new Error(response.error || '删除用户失败')
      }
    } catch (err) {
      console.error('❌ 删除用户失败:', err)
      throw err
    }
  }, [applicationId, fetchUsers])

  // 自动获取数据
  useEffect(() => {
    if (autoFetch && applicationId) {
      fetchUsers()
    }
  }, [autoFetch, applicationId, fetchUsers])

  return {
    users,
    isLoading,
    error,
    pagination,
    fetchUsers,
    createUser,
    registerUser,
    updateUser,
    deleteUser,
    refetch: fetchUsers
  }
}
