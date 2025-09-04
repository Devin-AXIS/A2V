"use client"

import { cn } from "@/lib/utils"
import type React from "react"
import { useChartTheme } from "@/components/providers/unified-chart-theme-provider"
import { useFrostedEffect } from "@/components/providers/frosted-effect-provider"

interface ProgressCircleProps {
  value: number // 0-100
  max?: number
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "default" | "success" | "warning" | "error" | "info"
  showLabel?: boolean
  labelPosition?: "center" | "bottom"
  strokeWidth?: number
  className?: string
}

const sizeConfig = {
  sm: {
    container: "w-16 h-16",
    strokeWidth: 4,
    label: "text-xs"
  },
  md: {
    container: "w-24 h-24",
    strokeWidth: 6,
    label: "text-sm"
  },
  lg: {
    container: "w-32 h-32",
    strokeWidth: 8,
    label: "text-base"
  },
  xl: {
    container: "w-40 h-40",
    strokeWidth: 10,
    label: "text-lg"
  }
}

const variantConfig = {
  default: "stroke-blue-500",
  success: "stroke-green-500",
  warning: "stroke-yellow-500",
  error: "stroke-red-500",
  info: "stroke-blue-400"
}

export function ProgressCircle({ 
  value, 
  max = 100, 
  size = "md", 
  variant = "default",
  showLabel = false,
  labelPosition = "center",
  strokeWidth,
  className 
}: ProgressCircleProps) {
  const { isFrosted } = useFrostedEffect()
  const sizeStyles = sizeConfig[size]
  const variantColor = variantConfig[variant]
  const actualStrokeWidth = strokeWidth || sizeStyles.strokeWidth
  
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  const radius = (sizeStyles.container.replace(/w-(\d+)/, '$1').replace(/h-(\d+)/, '$1') as number) / 2 - actualStrokeWidth / 2
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  const baseClasses = cn(
    "relative inline-flex items-center justify-center",
    sizeStyles.container,
    className
  )

  const containerClasses = cn(
    "relative",
    isFrosted && "backdrop-blur-sm"
  )

  const circleClasses = cn(
    "transition-all duration-500 ease-out",
    variantColor
  )

  const labelClasses = cn(
    "font-semibold text-gray-700",
    sizeStyles.label
  )

  const renderLabel = () => {
    if (!showLabel) return null
    
    const labelContent = `${Math.round(percentage)}%`
    
    if (labelPosition === "center") {
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={labelClasses}>{labelContent}</span>
        </div>
      )
    }
    
    return (
      <div className="mt-3 text-center">
        <span className={labelClasses}>{labelContent}</span>
      </div>
    )
  }

  return (
    <div className={baseClasses}>
      <div className={containerClasses}>
        <svg
          className="w-full h-full transform -rotate-90"
          viewBox={`0 0 ${sizeStyles.container.replace(/w-(\d+)/, '$1')} ${sizeStyles.container.replace(/h-(\d+)/, '$1')}`}
        >
          {/* Background circle */}
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            fill="none"
            stroke="currentColor"
            className="text-gray-200"
            strokeWidth={actualStrokeWidth}
          />
          
          {/* Progress circle */}
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            fill="none"
            stroke="currentColor"
            className={circleClasses}
            strokeWidth={actualStrokeWidth}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        
        {labelPosition === "center" && renderLabel()}
      </div>
      
      {labelPosition === "bottom" && renderLabel()}
    </div>
  )
}

