"use client"

import { cn } from "@/lib/utils"
import type React from "react"
import { useChartTheme } from "@/components/providers/unified-chart-theme-provider"
import { useFrostedEffect } from "@/components/providers/frosted-effect-provider"

interface ProgressBarProps {
  value: number // 0-100
  max?: number
  size?: "sm" | "md" | "lg"
  variant?: "default" | "success" | "warning" | "error" | "info"
  showLabel?: boolean
  labelPosition?: "top" | "bottom" | "inside"
  className?: string
}

const sizeConfig = {
  sm: {
    container: "h-2",
    label: "text-xs"
  },
  md: {
    container: "h-3",
    label: "text-sm"
  },
  lg: {
    container: "h-4",
    label: "text-base"
  }
}

const variantConfig = {
  default: "bg-blue-500",
  success: "bg-green-500",
  warning: "bg-yellow-500",
  error: "bg-red-500",
  info: "bg-blue-400"
}

export function ProgressBar({ 
  value, 
  max = 100, 
  size = "md", 
  variant = "default",
  showLabel = false,
  labelPosition = "top",
  className 
}: ProgressBarProps) {
  const { isFrosted } = useFrostedEffect()
  const sizeStyles = sizeConfig[size]
  const variantColor = variantConfig[variant]
  
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  const baseClasses = cn(
    "w-full transition-all duration-300",
    className
  )

  const containerClasses = cn(
    "relative overflow-hidden rounded-full bg-gray-200/50",
    sizeStyles.container,
    isFrosted && "backdrop-blur-sm border border-white/40"
  )

  const progressClasses = cn(
    "h-full transition-all duration-500 ease-out",
    variantColor
  )

  const labelClasses = cn(
    "font-medium text-gray-700",
    sizeStyles.label
  )

  const renderLabel = () => {
    if (!showLabel) return null
    
    const labelContent = `${Math.round(percentage)}%`
    
    if (labelPosition === "inside" && percentage > 20) {
      return (
        <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium">
          {labelContent}
        </span>
      )
    }
    
    return (
      <div className={cn(
        "mb-2",
        labelPosition === "bottom" && "mt-2 mb-0"
      )}>
        <span className={labelClasses}>{labelContent}</span>
      </div>
    )
  }

  return (
    <div className={baseClasses}>
      {labelPosition === "top" && renderLabel()}
      
      <div className={containerClasses}>
        <div 
          className={progressClasses}
          style={{ width: `${percentage}%` }}
        />
        {labelPosition === "inside" && percentage <= 20 && renderLabel()}
      </div>
      
      {labelPosition === "bottom" && renderLabel()}
    </div>
  )
}

