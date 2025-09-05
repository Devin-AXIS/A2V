"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, X, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { detectEnvironment, getCompatibilityWarnings, getFallbackOptions } from "@/lib/environment-utils"

interface EnvironmentWarningProps {
  onDismiss?: () => void
  showDetails?: boolean
}

export function EnvironmentWarning({ onDismiss, showDetails = false }: EnvironmentWarningProps) {
  const [env, setEnv] = useState<ReturnType<typeof detectEnvironment> | null>(null)
  const [warnings, setWarnings] = useState<string[]>([])
  const [isVisible, setIsVisible] = useState(false)
  const [showFullDetails, setShowFullDetails] = useState(showDetails)

  useEffect(() => {
    const environment = detectEnvironment()
    const compatibilityWarnings = getCompatibilityWarnings(environment)
    
    setEnv(environment)
    setWarnings(compatibilityWarnings)
    setIsVisible(compatibilityWarnings.length > 0)
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    onDismiss?.()
  }

  const handleRefresh = () => {
    window.location.reload()
  }

  if (!isVisible || !env) {
    return null
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50 max-w-2xl mx-auto">
      <Alert className="border-orange-200 bg-orange-50">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertTitle className="text-orange-800">
          环境兼容性警告
        </AlertTitle>
        <AlertDescription className="text-orange-700">
          <div className="space-y-2">
            <p>检测到您的浏览器环境可能存在兼容性问题，这可能导致主题功能无法正常工作。</p>
            
            <div className="space-y-1">
              {warnings.map((warning, index) => (
                <div key={index} className="text-sm">• {warning}</div>
              ))}
            </div>

            {showFullDetails && (
              <div className="mt-3 p-3 bg-orange-100 rounded border border-orange-200">
                <div className="text-sm font-medium mb-2">环境详情：</div>
                <div className="text-xs space-y-1">
                  <div>浏览器: {env.browser} {env.version}</div>
                  <div>localStorage: {env.hasLocalStorage ? '✅' : '❌'}</div>
                  <div>sessionStorage: {env.hasSessionStorage ? '✅' : '❌'}</div>
                  <div>CSS 变量: {env.supportsCSSVariables ? '✅' : '❌'}</div>
                  <div>backdrop-blur: {env.supportsBackdropBlur ? '✅' : '❌'}</div>
                  <div>隐私模式: {env.isPrivateMode ? '⚠️' : '✅'}</div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 mt-3">
              <Button
                size="sm"
                variant="outline"
                onClick={handleRefresh}
                className="text-orange-700 border-orange-300 hover:bg-orange-100"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                刷新页面
              </Button>
              
              {!showFullDetails && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowFullDetails(true)}
                  className="text-orange-700 hover:bg-orange-100"
                >
                  查看详情
                </Button>
              )}
              
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="text-orange-700 hover:bg-orange-100 ml-auto"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}

/**
 * 环境检测 Hook
 */
export function useEnvironmentCheck() {
  const [env, setEnv] = useState<ReturnType<typeof detectEnvironment> | null>(null)
  const [warnings, setWarnings] = useState<string[]>([])
  const [fallbackOptions, setFallbackOptions] = useState<ReturnType<typeof getFallbackOptions> | null>(null)

  useEffect(() => {
    const environment = detectEnvironment()
    const compatibilityWarnings = getCompatibilityWarnings(environment)
    const fallbacks = getFallbackOptions(environment)
    
    setEnv(environment)
    setWarnings(compatibilityWarnings)
    setFallbackOptions(fallbacks)
  }, [])

  return {
    env,
    warnings,
    fallbackOptions,
    hasIssues: warnings.length > 0
  }
}
