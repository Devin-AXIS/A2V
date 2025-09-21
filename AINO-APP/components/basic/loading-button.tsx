"use client"

import { cn } from "@/lib/utils"
import type React from "react"
import { Loader2 } from "lucide-react"
import { useChartTheme } from "@/components/providers/unified-chart-theme-provider"
import { useFrostedEffect } from "@/components/providers/frosted-effect-provider"

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  loadingText?: string
  variant?: "default" | "primary" | "secondary" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
  icon?: React.ReactNode
  iconPosition?: "left" | "right"
}

const sizeConfig = {
  sm: {
    button: "h-8 px-3 text-sm",
    icon: "w-4 h-4",
    spinner: "w-3 h-3"
  },
  md: {
    button: "h-10 px-4 text-base",
    icon: "w-4 h-4",
    spinner: "w-4 h-4"
  },
  lg: {
    button: "h-12 px-6 text-lg",
    icon: "w-5 h-5",
    spinner: "w-5 h-5"
  }
}

const variantConfig = {
  default: {
    base: "bg-white/70 backdrop-blur-lg border border-white/80 text-gray-700",
    hover: "hover:bg-white/90 hover:shadow-md",
    focus: "focus:ring-gray-400",
    disabled: "opacity-50 cursor-not-allowed"
  },
  primary: {
    base: "bg-blue-500 text-white border-blue-500",
    hover: "hover:bg-blue-600 hover:shadow-md",
    focus: "focus:ring-blue-400",
    disabled: "opacity-50 cursor-not-allowed"
  },
  secondary: {
    base: "bg-gray-100/80 backdrop-blur-lg border border-gray-200/80 text-gray-700",
    hover: "hover:bg-gray-200/80 hover:shadow-md",
    focus: "focus:ring-gray-400",
    disabled: "opacity-50 cursor-not-allowed"
  },
  outline: {
    base: "bg-transparent border border-gray-300 text-gray-700",
    hover: "hover:bg-gray-50 hover:border-gray-400",
    focus: "focus:ring-gray-400",
    disabled: "opacity-50 cursor-not-allowed"
  },
  ghost: {
    base: "bg-transparent text-gray-700",
    hover: "hover:bg-gray-100",
    focus: "focus:ring-gray-400",
    disabled: "opacity-50 cursor-not-allowed"
  }
}

export function LoadingButton({ 
  loading = false,
  loadingText,
  variant = "default",
  size = "md",
  icon,
  iconPosition = "left",
  children,
  disabled,
  className,
  ...props 
}: LoadingButtonProps) {
  const { isFrosted } = useFrostedEffect()
  const sizeStyles = sizeConfig[size]
  const variantStyles = variantConfig[variant]

  const baseClasses = cn(
    "inline-flex items-center justify-center font-medium rounded-lg",
    "transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2",
    "disabled:pointer-events-none",
    sizeStyles.button,
    variantStyles.base,
    !loading && !disabled && variantStyles.hover,
    variantStyles.focus,
    (loading || disabled) && variantStyles.disabled,
    isFrosted && "backdrop-blur-sm",
    className
  )

  const renderIcon = () => {
    if (loading) {
      return (
        <Loader2 className={cn("animate-spin", sizeStyles.spinner)} />
      )
    }
    return icon
  }

  const renderContent = () => {
    if (loading && loadingText) {
      return loadingText
    }
    return children
  }

  const iconClasses = cn(
    "flex-shrink-0",
    iconPosition === "left" ? "mr-2" : "ml-2"
  )

  return (
    <button
      className={baseClasses}
      disabled={disabled || loading}
      {...props}
    >
      {iconPosition === "left" && renderIcon() && (
        <span className={iconClasses}>
          {renderIcon()}
        </span>
      )}
      
      <span className="flex-shrink-0">
        {renderContent()}
      </span>
      
      {iconPosition === "right" && renderIcon() && (
        <span className={iconClasses}>
          {renderIcon()}
        </span>
      )}
    </button>
  )
}

// 带加载状态的图标按钮
interface LoadingIconButtonProps extends Omit<LoadingButtonProps, 'children'> {
  icon: React.ReactNode
  label?: string
}

export function LoadingIconButton({ 
  icon,
  label,
  size = "md",
  className,
  ...props 
}: LoadingIconButtonProps) {
  const sizeStyles = sizeConfig[size]
  
  const iconButtonClasses = cn(
    "inline-flex items-center justify-center rounded-lg",
    sizeStyles.button,
    className
  )

  return (
    <LoadingButton
      {...props}
      size={size}
      className={iconButtonClasses}
      icon={icon}
      aria-label={label}
    />
  )
}

