"use client"

import { useState, useEffect, useCallback } from "react"
import { api, type Application, type CreateApplicationRequest } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface UseApplicationsOptions {
  autoFetch?: boolean
  page?: number
  limit?: number
}

export function useApplications(options: UseApplicationsOptions = {}) {
  const { autoFetch = true, page = 1, limit = 20 } = options
  const { toast } = useToast()
  
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })

  // 获取应用列表
  const fetchApplications = useCallback(async (params?: {
    page?: number
    limit?: number
    search?: string
    status?: string
    template?: string
  }) => {
    setIsLoading(true)
    setError(null)
    
    try {
      console.log("📋 获取应用列表...")
      const response = await api.applications.getApplications(params)
      
      if (response.success && response.data) {
        setApplications(response.data.applications)
        setPagination(response.data.pagination)
        console.log("✅ 应用列表获取成功:", response.data.applications.length, "个应用")
      } else {
        throw new Error(response.error || "获取应用列表失败")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "获取应用列表失败"
      setError(errorMessage)
      console.error("❌ 获取应用列表失败:", err)
      toast({
        title: "获取应用列表失败",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // 创建应用
  const createApplication = useCallback(async (data: CreateApplicationRequest) => {
    setIsLoading(true)
    setError(null)
    
    try {
      console.log("➕ 创建应用...", data)
      const response = await api.applications.createApplication(data)
      
      if (response.success && response.data) {
        setApplications(prev => [response.data!, ...prev])
        console.log("✅ 应用创建成功:", response.data.name)
        toast({
          title: "应用创建成功",
          description: `应用 "${response.data.name}" 已创建`,
        })
        return response.data
      } else {
        throw new Error(response.error || "创建应用失败")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "创建应用失败"
      setError(errorMessage)
      console.error("❌ 创建应用失败:", err)
      toast({
        title: "创建应用失败",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // 更新应用
  const updateApplication = useCallback(async (id: string, data: Partial<CreateApplicationRequest>) => {
    setIsLoading(true)
    setError(null)
    
    try {
      console.log("✏️ 更新应用...", { id, data })
      const response = await api.applications.updateApplication(id, data)
      
      if (response.success && response.data) {
        setApplications(prev => 
          prev.map(app => app.id === id ? response.data! : app)
        )
        console.log("✅ 应用更新成功:", response.data.name)
        toast({
          title: "应用更新成功",
          description: `应用 "${response.data.name}" 已更新`,
        })
        return response.data
      } else {
        throw new Error(response.error || "更新应用失败")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "更新应用失败"
      setError(errorMessage)
      console.error("❌ 更新应用失败:", err)
      toast({
        title: "更新应用失败",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // 删除应用
  const deleteApplication = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      console.log("🗑️ 删除应用...", id)
      const response = await api.applications.deleteApplication(id)
      
      if (response.success) {
        setApplications(prev => prev.filter(app => app.id !== id))
        console.log("✅ 应用删除成功")
        toast({
          title: "应用删除成功",
          description: "应用已删除",
        })
      } else {
        throw new Error(response.error || "删除应用失败")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "删除应用失败"
      setError(errorMessage)
      console.error("❌ 删除应用失败:", err)
      toast({
        title: "删除应用失败",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // 获取应用详情
  const getApplication = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      console.log("📄 获取应用详情...", id)
      const response = await api.applications.getApplication(id)
      
      if (response.success && response.data) {
        console.log("✅ 应用详情获取成功:", response.data.name)
        return response.data
      } else {
        throw new Error(response.error || "获取应用详情失败")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "获取应用详情失败"
      setError(errorMessage)
      console.error("❌ 获取应用详情失败:", err)
      toast({
        title: "获取应用详情失败",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // 自动获取应用列表
  useEffect(() => {
    if (autoFetch) {
      fetchApplications({ page, limit })
    }
  }, [autoFetch, page, limit, fetchApplications])

  return {
    applications,
    isLoading,
    error,
    pagination,
    fetchApplications,
    createApplication,
    updateApplication,
    deleteApplication,
    getApplication,
  }
}
