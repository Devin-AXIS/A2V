"use client"

import React, { Component, type ReactNode } from "react"
import { AlertTriangle, RefreshCw, Home, Bug, Info } from "lucide-react"
import { captureError } from "@/lib/error-monitor"

interface EnhancedErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
  errorId?: string
}

interface EnhancedErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  showDebugInfo?: boolean
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

export class EnhancedErrorBoundary extends Component<EnhancedErrorBoundaryProps, EnhancedErrorBoundaryState> {
  constructor(props: EnhancedErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): Partial<EnhancedErrorBoundaryState> {
    return { 
      hasError: true, 
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 验证错误对象的有效性
    if (!error || typeof error !== 'object') {
      console.error("EnhancedErrorBoundary caught an invalid error:", { error, errorInfo })
      return
    }

    // 安全地获取错误信息
    const errorMessage = error?.message || 'Unknown error'
    const errorStack = error?.stack || 'No stack trace'
    const componentStack = errorInfo?.componentStack || 'No component stack'

    console.error("EnhancedErrorBoundary caught an error:", {
      error: errorMessage,
      stack: errorStack,
      componentStack: componentStack,
      errorId: this.state.errorId
    })

    this.setState({ errorInfo })
    
    // 调用自定义错误处理函数
    this.props.onError?.(error, errorInfo)

    // 使用错误监控服务捕获错误
    captureError({
      message: errorMessage,
      stack: errorStack,
      componentStack: componentStack,
      category: 'runtime',
      severity: 'high',
      metadata: {
        errorBoundary: true,
        errorId: this.state.errorId
      }
    })
  }

  private reportError = (error: Error, errorInfo: React.ErrorInfo) => {
    // 这里可以集成错误报告服务，如 Sentry、LogRocket 等
    const errorReport = {
      errorId: this.state.errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      url: typeof window !== "undefined" ? window.location.href : "",
      userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "",
      timestamp: new Date().toISOString()
    }

    console.log("Error Report:", errorReport)
    // 发送到错误报告服务
    // fetch('/api/error-report', { method: 'POST', body: JSON.stringify(errorReport) })
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined, errorId: undefined })
  }

  private handleGoHome = () => {
    if (typeof window !== "undefined") {
      window.location.href = "/"
    }
  }

  private handleCopyError = () => {
    const errorText = `
错误ID: ${this.state.errorId}
错误信息: ${this.state.error?.message || 'Unknown error'}
错误堆栈: ${this.state.error?.stack || 'No stack trace'}
组件堆栈: ${this.state.errorInfo?.componentStack || 'No component stack'}
URL: ${typeof window !== "undefined" ? window.location.href : ""}
时间: ${new Date().toLocaleString()}
    `.trim()

    if (navigator.clipboard) {
      navigator.clipboard.writeText(errorText).then(() => {
        alert("错误信息已复制到剪贴板")
      }).catch(() => {
        // 如果剪贴板API失败，使用降级方案
        this.fallbackCopyTextToClipboard(errorText)
      })
    } else {
      // 降级方案
      this.fallbackCopyTextToClipboard(errorText)
    }
  }

  private fallbackCopyTextToClipboard(text: string) {
    try {
      const textArea = document.createElement("textarea")
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      textArea.style.opacity = '0'
      textArea.style.pointerEvents = 'none'
      
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      const successful = document.execCommand('copy')
      if (successful) {
        alert("错误信息已复制到剪贴板")
      } else {
        alert("复制失败，请手动复制错误信息")
      }
      
      // 安全地移除元素
      if (document.body.contains(textArea)) {
        document.body.removeChild(textArea)
      }
    } catch (err) {
      console.error('Fallback copy failed:', err)
      alert("复制失败，请手动复制错误信息")
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
          <div className="max-w-2xl w-full bg-white shadow-xl rounded-xl p-8 border border-red-200">
            {/* 错误头部 */}
            <div className="flex items-center space-x-3 mb-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  应用程序遇到错误
                </h2>
                <p className="text-sm text-gray-600">
                  错误ID: {this.state.errorId}
                </p>
              </div>
            </div>

            {/* 错误信息 */}
            <div className="mb-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-3">
                  <Bug className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-red-800 mb-1">
                      错误详情
                    </h3>
                    <p className="text-sm text-red-700 font-mono">
                      {this.state.error?.message || "未知错误"}
                    </p>
                  </div>
                </div>
              </div>

              {/* 调试信息 */}
              {this.props.showDebugInfo && this.state.errorInfo && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start space-x-3">
                    <Info className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-800 mb-2">
                        调试信息
                      </h3>
                      <details className="text-sm text-gray-700">
                        <summary className="cursor-pointer hover:text-gray-900">
                          查看组件堆栈
                        </summary>
                        <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </details>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 操作按钮 */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleRetry}
                className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>重试</span>
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="flex-1 flex items-center justify-center space-x-2 bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>返回首页</span>
              </button>
              
              <button
                onClick={this.handleCopyError}
                className="flex-1 flex items-center justify-center space-x-2 bg-orange-600 text-white px-4 py-3 rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Bug className="w-4 h-4" />
                <span>复制错误信息</span>
              </button>
            </div>

            {/* 帮助信息 */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                <p className="mb-2">
                  <strong>如果问题持续存在，请：</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>刷新页面或清除浏览器缓存</li>
                  <li>检查网络连接是否正常</li>
                  <li>联系技术支持并提供错误ID</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
