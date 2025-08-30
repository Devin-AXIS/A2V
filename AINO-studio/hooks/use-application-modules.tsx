import { useState, useEffect, useCallback } from 'react'
import { api, type ApplicationModule, type ApplicationWithModules } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

interface UseApplicationModulesOptions {
  autoFetch?: boolean
}

export function useApplicationModules(
  applicationId: string,
  options: UseApplicationModulesOptions = {}
) {
  const { autoFetch = true } = options
  const { toast } = useToast()
  
  const [data, setData] = useState<ApplicationWithModules | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 获取应用模块
  const fetchModules = useCallback(async () => {
    if (!applicationId) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      console.log("📋 获取应用模块列表...", applicationId)
      const response = await api.applications.getApplicationModules(applicationId)
      
      if (response.success && response.data) {
        setData(response.data)
        console.log("✅ 应用模块获取成功:", response.data.modules.length, "个模块")
      } else {
        throw new Error(response.error || "获取应用模块失败")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "获取应用模块失败"
      setError(errorMessage)
      console.error("❌ 获取应用模块失败:", err)
      toast({
        title: "获取应用模块失败",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [applicationId, toast])

  // 自动获取
  useEffect(() => {
    if (autoFetch && applicationId) {
      fetchModules()
    }
  }, [autoFetch, applicationId, fetchModules])

  return {
    data,
    application: data?.application,
    modules: data?.modules || [],
    isLoading,
    error,
    fetchModules,
  }
}
