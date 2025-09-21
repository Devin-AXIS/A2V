import React from "react"
import { cn } from "@/lib/utils"
import { useFrostedEffect } from "@/components/providers/frosted-effect-provider"

// ButtonGroup 组件
interface ButtonGroupProps {
  children: React.ReactNode
  className?: string
  variant?: "default" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
}

export function ButtonGroup({ 
  children, 
  className, 
  variant = "default",
  size = "md" 
}: ButtonGroupProps) {
  const { frostedEffect } = useFrostedEffect()
  
  const baseClasses = "inline-flex rounded-lg overflow-hidden"
  const variantClasses = {
    default: "bg-white/80 border border-gray-200",
    outline: "bg-transparent border border-gray-300",
    ghost: "bg-transparent"
  }
  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  }
  
  return (
    <div className={cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      frostedEffect,
      className
    )}>
      {children}
    </div>
  )
}

// ButtonGroupItem 组件
interface ButtonGroupItemProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  active?: boolean
  disabled?: boolean
}

export function ButtonGroupItem({ 
  children, 
  onClick, 
  className,
  active = false,
  disabled = false 
}: ButtonGroupItemProps) {
  const baseClasses = "px-4 py-2 font-medium transition-colors duration-200 border-r border-gray-200 last:border-r-0"
  const stateClasses = {
    default: "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
    active: "bg-blue-50 text-blue-700 border-blue-200",
    disabled: "text-gray-400 cursor-not-allowed hover:bg-transparent"
  }
  
  const currentState = disabled ? "disabled" : active ? "active" : "default"
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        baseClasses,
        stateClasses[currentState],
        className
      )}
    >
      {children}
    </button>
  )
}

// RadioButtonGroup 组件
interface RadioOption {
  value: string
  label: string
  icon?: React.ReactNode
}

interface RadioButtonGroupProps {
  options: RadioOption[]
  value: string
  onChange: (value: string) => void
  className?: string
  variant?: "default" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
}

export function RadioButtonGroup({ 
  options, 
  value, 
  onChange, 
  className,
  variant = "default",
  size = "md" 
}: RadioButtonGroupProps) {
  const { frostedEffect } = useFrostedEffect()
  
  const baseClasses = "inline-flex rounded-lg overflow-hidden"
  const variantClasses = {
    default: "bg-white/80 border border-gray-200",
    outline: "bg-transparent border border-gray-300",
    ghost: "bg-transparent"
  }
  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  }
  
  return (
    <div className={cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      frostedEffect,
      className
    )}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "px-4 py-2 font-medium transition-colors duration-200 border-r border-gray-200 last:border-r-0 flex items-center gap-2",
            value === option.value
              ? "bg-blue-50 text-blue-700 border-blue-200"
              : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
          )}
        >
          {option.icon}
          {option.label}
        </button>
      ))}
    </div>
  )
}
