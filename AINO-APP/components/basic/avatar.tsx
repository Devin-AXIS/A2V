"use client"

import React, { useMemo } from "react"
import { cn } from "@/lib/utils"
import { useChartTheme } from "@/components/providers/unified-chart-theme-provider"
import { useFrostedEffect } from "@/components/providers/frosted-effect-provider"
import { User, Image } from "lucide-react"

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  size?: "sm" | "md" | "lg" | "xl"
  color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger"
  isBordered?: boolean
  fallback?: React.ReactNode
  showFallbackIcon?: boolean
}

// 获取对比色
function getContrastColor(hexColor: string): string {
  if (!hexColor.startsWith("#")) return "hsl(var(--foreground))"
  const r = parseInt(hexColor.slice(1, 3), 16)
  const g = parseInt(hexColor.slice(3, 5), 16)
  const b = parseInt(hexColor.slice(5, 7), 16)
  const yiq = (r * 299 + g * 587 + b * 114) / 1000
  return yiq >= 128 ? "hsl(var(--foreground))" : "hsl(var(--background))"
}

export function Avatar({
  src,
  alt,
  size = "md",
  color = "default",
  isBordered = false,
  fallback,
  showFallbackIcon = true,
  className,
  ...props
}: AvatarProps) {
  const { palette } = useChartTheme()
  const { isFrosted } = useFrostedEffect()

  // 尺寸配置
  const sizeConfig = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-lg"
  }

  // 颜色配置
  const colorConfig = useMemo(() => {
    const colors = {
      default: palette[0] || "hsl(var(--primary))",
      primary: palette[0] || "hsl(var(--primary))",
      secondary: palette[1] || "hsl(var(--secondary))",
      success: "hsl(var(--success))",
      warning: "hsl(var(--warning))",
      danger: "hsl(var(--destructive))"
    }
    
    return {
      bg: colors[color],
      text: getContrastColor(colors[color])
    }
  }, [color, palette])

  // 基础样式
  const baseStyles = cn(
    "relative inline-flex items-center justify-center rounded-full overflow-hidden transition-all duration-200",
    sizeConfig[size],
    className
  )

  // 边框和阴影样式
  const borderStyles = isBordered ? "ring-2 ring-offset-2" : ""
  const shadowStyles = isFrosted ? "shadow-lg" : "shadow-md"
  const frostedStyles = isFrosted ? "backdrop-blur-sm" : ""

  // 渲染头像内容
  const renderContent = () => {
    if (src) {
      return (
        <img
          src={src}
          alt={alt || "Avatar"}
          className="w-full h-full object-cover"
          onError={(e) => {
            // 图片加载失败时隐藏图片，显示 fallback
            const target = e.target as HTMLImageElement
            target.style.display = "none"
          }}
        />
      )
    }

    if (fallback) {
      return fallback
    }

    if (showFallbackIcon) {
      return <User className="w-1/2 h-1/2" />
    }

    return null
  }

  // 生成首字母 fallback
  const generateInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // 如果没有 src 且没有 fallback，尝试从 alt 生成首字母
  const shouldShowInitials = !src && !fallback && alt && alt.length > 0
  const initials = shouldShowInitials ? generateInitials(alt) : null

  return (
    <div
      className={cn(baseStyles, borderStyles, shadowStyles, frostedStyles)}
      style={{
        backgroundColor: !src ? colorConfig.bg : undefined,
        color: !src ? colorConfig.text : undefined,
        borderColor: isBordered ? colorConfig.bg : undefined,
        "--tw-ring-color": isBordered ? colorConfig.bg : undefined
      } as React.CSSProperties}
      {...props}
    >
      {renderContent()}
      
      {/* 显示首字母 */}
      {shouldShowInitials && (
        <span className="font-semibold">
          {initials}
        </span>
      )}
      
      {/* 图片加载状态指示器 */}
      {src && (
        <div className="absolute inset-0 bg-gray-100/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <Image className="w-4 h-4 text-gray-500" />
        </div>
      )}
    </div>
  )
}

// Avatar 组变体
export function AvatarGroup({
  children,
  max = 4,
  total,
  spacing = "tight",
  isBordered = false,
  className,
  ...props
}: {
  children: React.ReactNode
  max?: number
  total?: number
  spacing?: "tight" | "normal" | "loose"
  isBordered?: boolean
  className?: string
} & React.HTMLAttributes<HTMLDivElement>) {
  const spacingConfig = {
    tight: "-ml-2",
    normal: "-ml-3",
    loose: "-ml-4"
  }

  const childrenArray = React.Children.toArray(children)
  const visibleChildren = childrenArray.slice(0, max)
  
  // 如果提供了 total，使用 total - max 计算隐藏数量
  // 如果没有提供 total，使用 children 数量 - max 计算
  const hiddenCount = total ? total - max : childrenArray.length - max

  return (
    <div className={cn("flex items-center", className)} {...props}>
      {visibleChildren.map((child, index) => (
        <div
          key={index}
          className={cn(
            "transition-transform hover:scale-110",
            index > 0 && spacingConfig[spacing]
          )}
        >
          {child}
        </div>
      ))}
      
      {hiddenCount > 0 && (
        <div className={cn(
          "relative inline-flex items-center justify-center rounded-full bg-gray-200 text-gray-600 font-medium text-sm",
          "w-10 h-10 -ml-3 border-2 border-white shadow-md",
          isBordered && "ring-2 ring-offset-2 ring-gray-300"
        )}>
          +{hiddenCount}
        </div>
      )}
    </div>
  )
}
