"use client"

import { cn } from "@/lib/utils"
import type React from "react"
import { useFrostedEffect } from "@/components/providers/frosted-effect-provider"

interface SkeletonProps {
  variant?: "text" | "circular" | "rectangular" | "rounded"
  size?: "sm" | "md" | "lg" | "xl"
  width?: string | number
  height?: string | number
  className?: string
}

const variantConfig = {
  text: "rounded",
  circular: "rounded-full",
  rectangular: "rounded-none",
  rounded: "rounded-lg"
}

const sizeConfig = {
  sm: {
    text: "h-3",
    circular: "w-6 h-6",
    rectangular: "h-4",
    rounded: "h-4"
  },
  md: {
    text: "h-4",
    circular: "w-8 h-8",
    rectangular: "h-6",
    rounded: "h-6"
  },
  lg: {
    text: "h-5",
    circular: "w-12 h-12",
    rectangular: "h-8",
    rounded: "h-8"
  },
  xl: {
    text: "h-6",
    circular: "w-16 h-16",
    rectangular: "h-10",
    rounded: "h-10"
  }
}

export function Skeleton({ 
  variant = "text", 
  size = "md", 
  width,
  height,
  className 
}: SkeletonProps) {
  const { isFrosted } = useFrostedEffect()
  const sizeStyles = sizeConfig[size]
  
  const baseClasses = cn(
    "animate-pulse bg-gray-200",
    variantConfig[variant],
    sizeStyles[variant],
    className
  )

  const customStyles: React.CSSProperties = {}
  
  if (width) {
    customStyles.width = typeof width === 'number' ? `${width}px` : width
  }
  
  if (height) {
    customStyles.height = typeof height === 'number' ? `${height}px` : height
  }

  const frostedStyles = isFrosted ? "backdrop-blur-sm border border-white/40" : ""

  return (
    <div 
      className={cn(baseClasses, frostedStyles)}
      style={customStyles}
    />
  )
}

// 复合骨架屏组件
interface SkeletonGroupProps {
  children: React.ReactNode
  className?: string
}

export function SkeletonGroup({ children, className }: SkeletonGroupProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {children}
    </div>
  )
}

// 文本骨架屏组
interface SkeletonTextProps {
  lines?: number
  className?: string
}

export function SkeletonText({ lines = 3, className }: SkeletonTextProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton 
          key={index} 
          variant="text" 
          size="md"
          width={index === lines - 1 ? "75%" : "100%"}
        />
      ))}
    </div>
  )
}

// 卡片骨架屏
interface SkeletonCardProps {
  className?: string
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div className={cn("p-4 space-y-4", className)}>
      <div className="flex items-center space-x-4">
        <Skeleton variant="circular" size="md" />
        <div className="space-y-2 flex-1">
          <Skeleton variant="text" size="md" width="60%" />
          <Skeleton variant="text" size="sm" width="40%" />
        </div>
      </div>
      <Skeleton variant="rounded" size="lg" />
      <div className="space-y-2">
        <Skeleton variant="text" size="md" />
        <Skeleton variant="text" size="md" />
        <Skeleton variant="text" size="sm" width="70%" />
      </div>
    </div>
  )
}

