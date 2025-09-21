"use client"

import { cn } from "@/lib/utils"
import type React from "react"
import { CheckCircle, AlertCircle, XCircle, Info, AlertTriangle } from "lucide-react"
import { useChartTheme } from "@/components/providers/unified-chart-theme-provider"
import { useFrostedEffect } from "@/components/providers/frosted-effect-provider"

interface StatusBadgeProps {
  status: "success" | "warning" | "error" | "info" | "pending"
  label?: string
  size?: "sm" | "md" | "lg"
  variant?: "solid" | "outline" | "ghost"
  className?: string
}

const statusConfig = {
  success: {
    icon: CheckCircle,
    colors: {
      solid: "bg-green-500 text-white",
      outline: "border-green-500 text-green-700 bg-green-50",
      ghost: "text-green-700 bg-green-100/50"
    }
  },
  warning: {
    icon: AlertTriangle,
    colors: {
      solid: "bg-yellow-500 text-white",
      outline: "border-yellow-500 text-yellow-700 bg-yellow-50",
      ghost: "text-yellow-700 bg-yellow-100/50"
    }
  },
  error: {
    icon: XCircle,
    colors: {
      solid: "bg-red-500 text-white",
      outline: "border-red-500 text-red-700 bg-red-50",
      ghost: "text-red-700 bg-red-100/50"
    }
  },
  info: {
    icon: Info,
    colors: {
      solid: "bg-blue-500 text-white",
      outline: "border-blue-500 text-blue-700 bg-blue-50",
      ghost: "text-blue-700 bg-blue-100/50"
    }
  },
  pending: {
    icon: AlertCircle,
    colors: {
      solid: "bg-gray-500 text-white",
      outline: "border-gray-500 text-gray-700 bg-gray-50",
      ghost: "text-gray-700 bg-gray-100/50"
    }
  }
}

const sizeConfig = {
  sm: {
    container: "px-2 py-1 text-xs",
    icon: "w-3 h-3"
  },
  md: {
    container: "px-3 py-1.5 text-sm",
    icon: "w-4 h-4"
  },
  lg: {
    container: "px-4 py-2 text-base",
    icon: "w-5 h-5"
  }
}

export function StatusBadge({ 
  status, 
  label, 
  size = "md", 
  variant = "solid",
  className 
}: StatusBadgeProps) {
  const { isFrosted } = useFrostedEffect()
  const config = statusConfig[status]
  const Icon = config.icon
  const sizeStyles = sizeConfig[size]

  const baseClasses = cn(
    "inline-flex items-center gap-2 rounded-full font-medium transition-all duration-200",
    "focus:outline-none focus:ring-2 focus:ring-offset-2",
    sizeStyles.container,
    className
  )

  const variantClasses = cn(
    variant === "solid" && config.colors.solid,
    variant === "outline" && config.colors.outline,
    variant === "ghost" && config.colors.ghost
  )

  const frostedStyles = isFrosted ? "backdrop-blur-sm border border-white/40" : ""

  return (
    <span className={cn(baseClasses, variantClasses, frostedStyles)}>
      <Icon className={sizeStyles.icon} />
      {label && <span>{label}</span>}
    </span>
  )
}

