"use client"

import { cn } from "@/lib/utils"
import type React from "react"

interface TagProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "white" | "outline"
  size?: "sm" | "md"
  icon?: React.ReactNode
}

export function Tag({ className, variant = "white", size = "sm", icon, children, ...props }: TagProps) {
  const baseStyles = "inline-flex items-center gap-1.5 font-medium transition-all duration-200"

  const sizeStyles = {
    sm: "px-2.5 py-1 text-xs rounded-full",
    md: "px-3 py-1.5 text-sm rounded-lg",
  }

  const variantStyles = {
    default: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    white: "bg-white text-gray-700 shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50",
  }

  return (
    <div className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)} {...props}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </div>
  )
}
