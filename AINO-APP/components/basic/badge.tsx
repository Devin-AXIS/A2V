"use client"

import { cn } from "@/lib/utils"
import type React from "react"
import { useChartTheme } from "@/components/providers/unified-chart-theme-provider"
import { useFrostedEffect } from "@/components/providers/frosted-effect-provider"

interface BadgeProps {
  children?: React.ReactNode
  variant?: "default" | "primary" | "secondary" | "success" | "warning" | "error" | "info"
  size?: "sm" | "md" | "lg"
  shape?: "rounded" | "pill" | "dot"
  showZero?: boolean
  max?: number
  className?: string
}

const variantConfig = {
  default: {
    bg: "bg-gray-100",
    text: "text-gray-800",
    border: "border-gray-200"
  },
  primary: {
    bg: "bg-blue-100",
    text: "text-blue-800",
    border: "border-blue-200"
  },
  secondary: {
    bg: "bg-gray-100",
    text: "text-gray-800",
    border: "border-gray-200"
  },
  success: {
    bg: "bg-green-100",
    text: "text-green-800",
    border: "border-green-200"
  },
  warning: {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    border: "border-yellow-200"
  },
  error: {
    bg: "bg-red-100",
    text: "text-red-800",
    border: "border-red-200"
  },
  info: {
    bg: "bg-blue-100",
    text: "text-blue-800",
    border: "border-blue-200"
  }
}

const sizeConfig = {
  sm: {
    container: "px-2 py-0.5 text-xs",
    dot: "w-1.5 h-1.5"
  },
  md: {
    container: "px-2.5 py-1 text-sm",
    dot: "w-2 h-2"
  },
  lg: {
    container: "px-3 py-1.5 text-base",
    dot: "w-2.5 h-2.5"
  }
}

const shapeConfig = {
  rounded: "rounded-md",
  pill: "rounded-full",
  dot: "rounded-full"
}

export function Badge({ 
  children, 
  variant = "default",
  size = "md",
  shape = "rounded",
  showZero = false,
  max,
  className 
}: BadgeProps) {
  const { isFrosted } = useFrostedEffect()
  const variantStyles = variantConfig[variant]
  const sizeStyles = sizeConfig[size]
  const shapeStyles = shapeConfig[shape]

  const baseClasses = cn(
    "inline-flex items-center justify-center font-medium border transition-all duration-200",
    variantStyles.bg,
    variantStyles.text,
    variantStyles.border,
    sizeStyles.container,
    shapeStyles,
    isFrosted && "backdrop-blur-sm",
    className
  )

  // 处理数字显示
  const renderContent = () => {
    if (typeof children === 'number') {
      if (children === 0 && !showZero) {
        return null
      }
      
      if (max && children > max) {
        return `${max}+`
      }
      
      return children.toString()
    }
    
    return children
  }

  // 点状徽章
  if (shape === "dot") {
    return (
      <span className={cn(
        "inline-block",
        variantStyles.bg,
        sizeStyles.dot,
        shapeStyles,
        className
      )} />
    )
  }

  const content = renderContent()
  if (!content) return null

  return (
    <span className={baseClasses}>
      {content}
    </span>
  )
}

// 状态徽章
interface StatusBadgeProps {
  status: "online" | "offline" | "away" | "busy"
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
  className?: string
}

const statusConfig = {
  online: {
    bg: "bg-green-500",
    text: "text-green-800",
    label: "在线"
  },
  offline: {
    bg: "bg-gray-500",
    text: "text-gray-800",
    label: "离线"
  },
  away: {
    bg: "bg-yellow-500",
    text: "text-yellow-800",
    label: "离开"
  },
  busy: {
    bg: "bg-red-500",
    text: "text-red-800",
    label: "忙碌"
  }
}

export function StatusBadge({ 
  status, 
  size = "md", 
  showLabel = false,
  className 
}: StatusBadgeProps) {
  const { isFrosted } = useFrostedEffect()
  const sizeStyles = sizeConfig[size]
  const statusStyles = statusConfig[status]

  const baseClasses = cn(
    "inline-flex items-center gap-2 px-2.5 py-1 rounded-full border transition-all duration-200",
    statusStyles.bg,
    statusStyles.text,
    sizeStyles.container,
    isFrosted && "backdrop-blur-sm",
    className
  )

  return (
    <span className={baseClasses}>
      <span className={cn(
        "w-2 h-2 rounded-full",
        status === "online" && "bg-green-400",
        status === "offline" && "bg-gray-400",
        status === "away" && "bg-yellow-400",
        status === "busy" && "bg-red-400"
      )} />
      {showLabel && <span>{statusStyles.label}</span>}
    </span>
  )
}

// 通知徽章
interface NotificationBadgeProps {
  count: number
  max?: number
  showZero?: boolean
  size?: "sm" | "md" | "lg"
  variant?: "default" | "primary" | "secondary" | "success" | "warning" | "error" | "info"
  className?: string
}

export function NotificationBadge({ 
  count, 
  max,
  showZero = false,
  size = "md",
  variant = "error",
  className 
}: NotificationBadgeProps) {
  if (count === 0 && !showZero) return null

  const displayCount = max && count > max ? `${max}+` : count.toString()

  return (
    <Badge
      variant={variant}
      size={size}
      shape="pill"
      className={cn("min-w-[20px] justify-center", className)}
    >
      {displayCount}
    </Badge>
  )
}

// 导出 StatusBadge 的别名
export { StatusBadge as StatusBadgeComponent }

