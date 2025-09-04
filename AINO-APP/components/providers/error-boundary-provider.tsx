"use client"

import React, { Component, type ReactNode } from "react"

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProviderProps {
  children: ReactNode
  fallback?: ReactNode
}

export class ErrorBoundaryProvider extends Component<ErrorBoundaryProviderProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProviderProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                出现了一些问题
              </h2>
              <p className="text-gray-600 mb-6">
                抱歉，应用程序遇到了一个错误。请尝试刷新页面或稍后再试。
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => this.setState({ hasError: false, error: undefined })}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  重试
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
                >
                  返回首页
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
