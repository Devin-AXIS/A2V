"use client"

import { cn } from "@/lib/utils"
import type React from "react"
import { AlertCircle, CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react"
import { useChartTheme } from "@/components/providers/unified-chart-theme-provider"
import { useFrostedEffect } from "@/components/providers/frosted-effect-provider"
import { useState } from "react"

interface AlertProps {
  variant?: "success" | "warning" | "error" | "info"
  title?: string
  description?: string
  closable?: boolean
  onClose?: () => void
  className?: string
}

const variantConfig = {
  success: {
    icon: CheckCircle,
    colors: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-800",
      icon: "text-green-400"
    }
  },
  warning: {
    icon: AlertTriangle,
    colors: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      text: "text-yellow-800",
      icon: "text-yellow-400"
    }
  },
  error: {
    icon: XCircle,
    colors: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-800",
      icon: "text-red-400"
    }
  },
  info: {
    icon: Info,
    colors: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-800",
      icon: "text-blue-400"
    }
  }
}

export function Alert({ 
  variant = "info", 
  title, 
  description, 
  closable = false,
  onClose,
  className 
}: AlertProps) {
  const { isFrosted } = useFrostedEffect()
  const config = variantConfig[variant]
  const Icon = config.icon
  const [isVisible, setIsVisible] = useState(true)

  const handleClose = () => {
    setIsVisible(false)
    onClose?.()
  }

  if (!isVisible) return null

  const baseClasses = cn(
    "relative p-4 rounded-xl border transition-all duration-200",
    config.colors.bg,
    config.colors.border,
    config.colors.text,
    isFrosted && "backdrop-blur-sm",
    className
  )

  return (
    <div className={baseClasses}>
      <div className="flex items-start gap-3">
        <Icon className={cn("w-5 h-5 mt-0.5 flex-shrink-0", config.colors.icon)} />
        
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="font-medium text-sm mb-1">
              {title}
            </h4>
          )}
          {description && (
            <p className="text-sm opacity-90">
              {description}
            </p>
          )}
        </div>
        
        {closable && (
          <button
            onClick={handleClose}
            className={cn(
              "ml-auto -mt-1 -mr-1 p-1 rounded-lg transition-colors",
              "hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2",
              config.colors.text
            )}
            aria-label="关闭提示"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

// 复合警告提示组件
interface AlertGroupProps {
  children: React.ReactNode
  className?: string
}

export function AlertGroup({ children, className }: AlertGroupProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {children}
    </div>
  )
}

