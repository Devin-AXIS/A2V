// 错误监控服务
export interface ErrorReport {
  errorId: string
  message: string
  stack?: string
  componentStack?: string
  url: string
  userAgent: string
  timestamp: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: 'runtime' | 'network' | 'validation' | 'unknown'
  metadata?: Record<string, any>
}

class ErrorMonitor {
  private static instance: ErrorMonitor
  private errorQueue: ErrorReport[] = []
  private isReporting = false
  private maxQueueSize = 50

  private constructor() {
    // 初始化错误监控
    this.setupGlobalErrorHandlers()
  }

  static getInstance(): ErrorMonitor {
    if (!ErrorMonitor.instance) {
      ErrorMonitor.instance = new ErrorMonitor()
    }
    return ErrorMonitor.instance
  }

  private setupGlobalErrorHandlers() {
    if (typeof window !== "undefined") {
      // 捕获未处理的JavaScript错误
      window.addEventListener('error', (event) => {
        this.captureError({
          message: event.message,
          stack: event.error?.stack,
          category: 'runtime',
          severity: this.calculateSeverity(event.error),
          metadata: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
          }
        })
      })

      // 捕获未处理的Promise拒绝
      window.addEventListener('unhandledrejection', (event) => {
        this.captureError({
          message: event.reason?.message || 'Unhandled Promise Rejection',
          stack: event.reason?.stack,
          category: 'runtime',
          severity: 'high',
          metadata: {
            reason: event.reason
          }
        })
      })

      // 捕获网络错误
      window.addEventListener('offline', () => {
        this.captureError({
          message: 'Network connection lost',
          category: 'network',
          severity: 'medium'
        })
      })
    }
  }

  private calculateSeverity(error?: Error): 'low' | 'medium' | 'high' | 'critical' {
    if (!error) return 'medium'
    
    const message = error.message.toLowerCase()
    
    // 根据错误信息判断严重程度
    if (message.includes('network') || message.includes('fetch')) {
      return 'medium'
    }
    if (message.includes('syntax') || message.includes('reference')) {
      return 'high'
    }
    if (message.includes('memory') || message.includes('out of memory')) {
      return 'critical'
    }
    
    return 'medium'
  }

  captureError(errorData: Partial<ErrorReport>): string {
    // 验证错误数据的有效性
    if (!errorData || typeof errorData !== 'object') {
      console.error('Invalid error data provided to captureError:', errorData)
      return 'invalid-error-id'
    }
    
    // 确保必要的字段存在
    const errorReport: ErrorReport = {
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message: errorData.message || 'Unknown error',
      stack: errorData.stack || 'No stack trace',
      componentStack: errorData.componentStack || 'No component stack',
      category: errorData.category || 'unknown',
      severity: errorData.severity || 'medium',
      metadata: errorData.metadata || {},
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : ''
    }

    // 添加到错误队列
    this.errorQueue.push(errorReport)

    // 限制队列大小
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift()
    }

    // 记录到控制台
    console.error('Error captured:', errorReport)

    // 尝试发送错误报告
    this.flushErrorQueue()

    return errorReport.errorId
  }

  private async flushErrorQueue() {
    if (this.isReporting || this.errorQueue.length === 0) {
      return
    }

    this.isReporting = true

    try {
      const errorsToSend = [...this.errorQueue]
      this.errorQueue = []

      // 发送到错误报告服务
      await this.sendErrorReports(errorsToSend)
    } catch (error) {
      console.error('Failed to send error reports:', error)
      // 将错误重新加入队列
      this.errorQueue.unshift(...this.errorQueue)
    } finally {
      this.isReporting = false
    }
  }

  private async sendErrorReports(errors: ErrorReport[]) {
    // 这里可以集成实际的错误报告服务
    // 例如：Sentry、LogRocket、Bugsnag等
    
    // 开发环境下，只记录到控制台
    if (process.env.NODE_ENV === 'development') {
      console.group('Error Reports to be sent:')
      errors.forEach(error => {
        console.log('Error:', error)
      })
      console.groupEnd()
      return
    }

    // 生产环境下，发送到错误报告服务
    try {
      // 示例：发送到自定义API端点
      // await fetch('/api/error-reports', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ errors })
      // })
      
      // 或者发送到第三方服务
      // Sentry.captureException(errors)
    } catch (error) {
      console.error('Failed to send error reports to service:', error)
    }
  }

  // 获取错误统计信息
  getErrorStats() {
    const stats = {
      total: this.errorQueue.length,
      bySeverity: {} as Record<string, number>,
      byCategory: {} as Record<string, number>,
      recentErrors: this.errorQueue.slice(-10)
    }

    this.errorQueue.forEach(error => {
      stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1
      stats.byCategory[error.category] = (stats.byCategory[error.category] || 0) + 1
    })

    return stats
  }

  // 清除错误队列
  clearErrorQueue() {
    this.errorQueue = []
  }

  // 手动发送错误报告
  async forceFlush() {
    await this.flushErrorQueue()
  }
}

// 导出单例实例
export const errorMonitor = ErrorMonitor.getInstance()

// 便捷函数
export const captureError = (errorData: Partial<ErrorReport>) => {
  return errorMonitor.captureError(errorData)
}

export const getErrorStats = () => {
  return errorMonitor.getErrorStats()
}
