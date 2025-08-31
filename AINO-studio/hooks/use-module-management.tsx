import { useState, useCallback } from 'react'
import { api } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

interface UseModuleManagementOptions {
  applicationId: string
}

export function useModuleManagement({ applicationId }: UseModuleManagementOptions) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  // 获取已安装的模块列表
  const getInstalledModules = useCallback(async (params?: {
    page?: number
    limit?: number
    search?: string
    type?: string
    status?: string
    sortBy?: string
    sortOrder?: string
  }) => {
    setIsLoading(true)
    try {
      const response = await api.modules.getInstalledModules({
        applicationId,
        ...params,
      })
      
      if (response.success) {
        return response.data
      } else {
        throw new Error(response.error || '获取模块列表失败')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '获取模块列表失败'
      toast({
        title: '获取模块列表失败',
        description: errorMessage,
        variant: 'destructive',
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [applicationId, toast])

  // 安装模块
  const installModule = useCallback(async (data: {
    moduleKey: string
    moduleVersion?: string
    installConfig?: any
  }) => {
    setIsLoading(true)
    try {
      const response = await api.modules.installModule(applicationId, data)
      
      if (response.success) {
        toast({
          title: '模块安装成功',
          description: `模块 ${data.moduleKey} 已成功安装`,
        })
        return response.data
      } else {
        throw new Error(response.error || '模块安装失败')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '模块安装失败'
      toast({
        title: '模块安装失败',
        description: errorMessage,
        variant: 'destructive',
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [applicationId, toast])

  // 卸载模块
  const uninstallModule = useCallback(async (moduleKey: string, keepData: boolean = false) => {
    setIsLoading(true)
    try {
      const response = await api.modules.uninstallModule(applicationId, moduleKey, { keepData })
      
      if (response.success) {
        toast({
          title: '模块卸载成功',
          description: `模块 ${moduleKey} 已成功卸载`,
        })
        return response.data
      } else {
        throw new Error(response.error || '模块卸载失败')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '模块卸载失败'
      toast({
        title: '模块卸载失败',
        description: errorMessage,
        variant: 'destructive',
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [applicationId, toast])

  // 更新模块配置
  const updateModuleConfig = useCallback(async (moduleKey: string, config: any) => {
    setIsLoading(true)
    try {
      const response = await api.modules.updateModuleConfig(applicationId, moduleKey, config)
      
      if (response.success) {
        toast({
          title: '配置更新成功',
          description: `模块 ${moduleKey} 的配置已更新`,
        })
        return response.data
      } else {
        throw new Error(response.error || '配置更新失败')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '配置更新失败'
      toast({
        title: '配置更新失败',
        description: errorMessage,
        variant: 'destructive',
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [applicationId, toast])

  // 更新模块状态
  const updateModuleStatus = useCallback(async (moduleKey: string, status: 'active' | 'disabled' | 'uninstalling') => {
    setIsLoading(true)
    try {
      const response = await api.modules.updateModuleStatus(applicationId, moduleKey, status)
      
      if (response.success) {
        toast({
          title: '状态更新成功',
          description: `模块 ${moduleKey} 的状态已更新为 ${status}`,
        })
        return response.data
      } else {
        throw new Error(response.error || '状态更新失败')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '状态更新失败'
      toast({
        title: '状态更新失败',
        description: errorMessage,
        variant: 'destructive',
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [applicationId, toast])

  // 获取可用模块列表
  const getAvailableModules = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await api.modules.getAvailableModules()
      
      if (response.success) {
        return response.data
      } else {
        throw new Error(response.error || '获取可用模块失败')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '获取可用模块失败'
      toast({
        title: '获取可用模块失败',
        description: errorMessage,
        variant: 'destructive',
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // 获取模块统计信息
  const getModuleStats = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await api.modules.getModuleStats(applicationId)
      
      if (response.success) {
        return response.data
      } else {
        throw new Error(response.error || '获取模块统计失败')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '获取模块统计失败'
      toast({
        title: '获取模块统计失败',
        description: errorMessage,
        variant: 'destructive',
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [applicationId, toast])

  return {
    isLoading,
    getInstalledModules,
    installModule,
    uninstallModule,
    updateModuleConfig,
    updateModuleStatus,
    getAvailableModules,
    getModuleStats,
  }
}
