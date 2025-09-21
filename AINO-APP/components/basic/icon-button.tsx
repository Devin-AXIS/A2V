"use client"

import { cn } from "@/lib/utils"
import type React from "react"
import { useChartTheme } from "@/components/providers/unified-chart-theme-provider"
import { useFrostedEffect } from "@/components/providers/frosted-effect-provider"

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "secondary" | "ghost" | "outline"
  size?: "sm" | "md" | "lg"
  icon: React.ReactNode
  label?: string
}

export function IconButton({ 
  className, 
  variant = "default", 
  size = "md", 
  icon, 
  label,
  ...props 
}: IconButtonProps) {
  const { palette } = useChartTheme()
  const { isFrosted } = useFrostedEffect()
  const primaryColor = palette[0] || "hsl(var(--primary)"

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10", 
    lg: "w-12 h-12"
  }

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  }

  const baseClasses = cn(
    "inline-flex items-center justify-center rounded-xl transition-all duration-300",
    "focus:outline-none focus:ring-2 focus:ring-offset-2",
    "disabled:opacity-50 disabled:pointer-events-none",
    sizeClasses[size],
    className
  )

  const variantClasses = {
    default: cn(
      "bg-white/70 backdrop-blur-lg border border-white/80 shadow-sm",
      "hover:bg-white/90 hover:shadow-md",
      "focus:ring-gray-400"
    ),
    primary: cn(
      "text-white shadow-md",
      "focus:ring-2"
    ),
    secondary: cn(
      "bg-gray-100/80 backdrop-blur-lg border border-gray-200/80",
      "hover:bg-gray-200/80 hover:shadow-md",
      "focus:ring-gray-400"
    ),
    ghost: cn(
      "hover:bg-gray-100/50",
      "focus:ring-gray-400"
    ),
    outline: cn(
      "border border-gray-300 bg-transparent",
      "hover:bg-gray-50 hover:border-gray-400",
      "focus:ring-gray-400"
    )
  }

  const getVariantStyles = () => {
    if (variant === "primary") {
      return {
        backgroundColor: isFrosted ? `${primaryColor}B3` : primaryColor,
        "--tw-ring-color": primaryColor,
      } as React.CSSProperties
    }
    return {}
  }

  return (
    <button
      className={cn(baseClasses, variantClasses[variant])}
      style={getVariantStyles()}
      aria-label={label}
      {...props}
    >
      <div className={cn("flex items-center justify-center", iconSizes[size])}>
        {icon}
      </div>
    </button>
  )
}

