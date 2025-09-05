"use client"

import { cn } from "@/lib/utils"
import type React from "react"
import { useFrostedEffect } from "@/components/providers/frosted-effect-provider"

interface DividerProps {
  orientation?: "horizontal" | "vertical"
  variant?: "solid" | "dashed" | "dotted"
  size?: "sm" | "md" | "lg"
  color?: "default" | "light" | "dark"
  className?: string
}

const variantConfig = {
  solid: "border-solid",
  dashed: "border-dashed",
  dotted: "border-dotted"
}

const sizeConfig = {
  sm: {
    horizontal: "h-px",
    vertical: "w-px"
  },
  md: {
    horizontal: "h-0.5",
    vertical: "w-0.5"
  },
  lg: {
    horizontal: "h-1",
    vertical: "w-1"
  }
}

const colorConfig = {
  default: "border-gray-200",
  light: "border-gray-100",
  dark: "border-gray-300"
}

export function Divider({ 
  orientation = "horizontal", 
  variant = "solid",
  size = "md",
  color = "default",
  className 
}: DividerProps) {
  const { isFrosted } = useFrostedEffect()
  const sizeStyles = sizeConfig[size]
  const variantStyles = variantConfig[variant]
  const colorStyles = colorConfig[color]

  const baseClasses = cn(
    "border-0",
    variantStyles,
    colorStyles,
    isFrosted && "backdrop-blur-sm",
    className
  )

  const orientationClasses = cn(
    orientation === "horizontal" ? sizeStyles.horizontal : sizeStyles.vertical,
    orientation === "horizontal" ? "w-full" : "h-full"
  )

  return (
    <div className={cn(baseClasses, orientationClasses)} />
  )
}

// 带文本的分割线
interface DividerWithTextProps {
  text?: string
  orientation?: "horizontal" | "vertical"
  variant?: "solid" | "dashed" | "dotted"
  size?: "sm" | "md" | "lg"
  color?: "default" | "light" | "dark"
  textPosition?: "left" | "center" | "right"
  className?: string
}

export function DividerWithText({ 
  text,
  orientation = "horizontal",
  variant = "solid",
  size = "md",
  color = "default",
  textPosition = "center",
  className 
}: DividerWithTextProps) {
  if (orientation === "vertical") {
    return <Divider orientation={orientation} variant={variant} size={size} color={color} className={className} />
  }

  const { isFrosted } = useFrostedEffect()
  const sizeStyles = sizeConfig[size]
  const variantStyles = variantConfig[variant]
  const colorStyles = colorConfig[color]

  const baseClasses = cn(
    "flex items-center w-full",
    className
  )

  const lineClasses = cn(
    "flex-1 border-0",
    variantStyles,
    colorStyles,
    sizeStyles.horizontal,
    isFrosted && "backdrop-blur-sm"
  )

  const textClasses = cn(
    "px-3 text-sm text-gray-500 font-medium",
    textPosition === "left" && "order-first",
    textPosition === "center" && "order-none",
    textPosition === "right" && "order-last"
  )

  return (
    <div className={baseClasses}>
      {textPosition === "left" && text && (
        <span className={textClasses}>{text}</span>
      )}
      
      <div className={cn(lineClasses, textPosition === "left" ? "ml-2" : "mr-2")} />
      
      {textPosition === "center" && text && (
        <span className={textClasses}>{text}</span>
      )}
      
      <div className={cn(lineClasses, textPosition === "center" ? "ml-2" : "ml-2")} />
      
      {textPosition === "right" && text && (
        <span className={textClasses}>{text}</span>
      )}
    </div>
  )
}

