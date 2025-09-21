"use client"

import { cn } from "@/lib/utils"
import type React from "react"
import { CheckCircle, AlertCircle, XCircle, Info, AlertTriangle, X } from "lucide-react"
import { useChartTheme } from "@/components/providers/unified-chart-theme-provider"
import { useFrostedEffect } from "@/components/providers/frosted-effect-provider"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

interface ToastProps {
  id: string
  type?: "success" | "warning" | "error" | "info"
  title?: string
  message: string
  duration?: number
  onClose: (id: string) => void
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center"
}

const typeConfig = {
  success: {
    icon: CheckCircle,
    colors: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-800",
      icon: "text-green-500"
    }
  },
  warning: {
    icon: AlertTriangle,
    colors: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      text: "text-yellow-800",
      icon: "text-yellow-500"
    }
  },
  error: {
    icon: XCircle,
    colors: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-800",
      icon: "text-red-500"
    }
  },
  info: {
    icon: Info,
    colors: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-800",
      icon: "text-blue-500"
    }
  }
}

const positionConfig = {
  "top-right": "top-4 right-4",
  "top-left": "top-4 left-4",
  "bottom-right": "bottom-4 right-4",
  "bottom-left": "bottom-4 left-4",
  "top-center": "top-4 left-1/2 transform -translate-x-1/2",
  "bottom-center": "bottom-4 left-1/2 transform -translate-x-1/2"
}

export function Toast({ 
  id, 
  type = "info", 
  title, 
  message, 
  duration = 5000,
  onClose,
  position = "top-right"
}: ToastProps) {
  const { isFrosted } = useFrostedEffect()
  const config = typeConfig[type]
  const Icon = config.icon
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onClose(id), 300) // 等待动画完成
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, id, onClose])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => onClose(id), 300)
  }

  const toastContent = (
    <div
      className={cn(
        "fixed z-50 w-80 max-w-sm transition-all duration-300",
        positionConfig[position],
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      )}
    >
      <div className={cn(
        "p-4 rounded-xl border shadow-lg",
        config.colors.bg,
        config.colors.border,
        config.colors.text,
        isFrosted && "backdrop-blur-lg border-white/40"
      )}>
        <div className="flex items-start gap-3">
          <Icon className={cn("w-5 h-5 mt-0.5 flex-shrink-0", config.colors.icon)} />
          
          <div className="flex-1 min-w-0">
            {title && (
              <h4 className="font-medium text-sm mb-1">
                {title}
              </h4>
            )}
            <p className="text-sm">
              {message}
            </p>
          </div>
          
          <button
            onClick={handleClose}
            className={cn(
              "ml-2 -mt-1 -mr-1 p-1 rounded-lg transition-colors",
              "hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2",
              config.colors.text
            )}
            aria-label="关闭提示"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(toastContent, document.body)
}

// Toast 容器组件
interface ToastContainerProps {
  toasts: Array<{
    id: string
    type?: "success" | "warning" | "error" | "info"
    title?: string
    message: string
    duration?: number
  }>
  onClose: (id: string) => void
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center"
}

export function ToastContainer({ toasts, onClose, position = "top-right" }: ToastContainerProps) {
  return (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          duration={toast.duration}
          onClose={onClose}
          position={position}
        />
      ))}
    </>
  )
}

