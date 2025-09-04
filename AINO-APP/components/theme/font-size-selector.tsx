"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { useFontSizePreset } from "@/hooks/use-font-size-config"
import { cn } from "@/lib/utils"
import { 
  Type, 
  Minus, 
  Plus 
} from "lucide-react"

interface FontSizeSelectorProps {
  className?: string
  variant?: "default" | "compact" | "minimal"
  showLabels?: boolean
  showIcons?: boolean
}

export function FontSizeSelector({
  className = "",
  variant = "default",
  showLabels = true,
  showIcons = true
}: FontSizeSelectorProps) {
  const { setPreset, current, options } = useFontSizePreset()

  const getIcon = (preset: string) => {
    switch (preset) {
      case "small":
        return <Minus className="h-4 w-4" />
      case "normal":
        return <Type className="h-4 w-4" />
      case "large":
        return <Plus className="h-4 w-4" />
      default:
        return <Type className="h-4 w-4" />
    }
  }

  const getButtonVariant = (preset: string) => {
    return current.current === preset ? "default" : "outline"
  }

  const getButtonSize = (variant: string) => {
    switch (variant) {
      case "compact":
        return "sm"
      case "minimal":
        return "sm"
      default:
        return "default"
    }
  }

  // 添加调试信息
  console.log("FontSizeSelector render:", { current, options })

  if (variant === "minimal") {
    return (
      <div className={cn("flex items-center space-x-1", className)}>
        {options.map((option) => (
          <Button
            key={option.key}
            variant={getButtonVariant(option.key)}
            size={getButtonSize(variant)}
            onClick={() => {
              console.log("Clicking preset:", option.key)
              setPreset(option.key)
            }}
            className={cn(
              "h-8 w-8 p-0",
              current.current === option.key && "bg-primary text-primary-foreground"
            )}
            title={`字体大小：${option.name}`}
          >
            {showIcons && getIcon(option.key)}
          </Button>
        ))}
      </div>
    )
  }

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center space-x-1", className)}>
        {options.map((option) => (
          <Button
            key={option.key}
            variant={getButtonVariant(option.key)}
            size={getButtonSize(variant)}
            onClick={() => {
              console.log("Clicking preset:", option.key)
              setPreset(option.key)
            }}
            className={cn(
              "h-8 px-2",
              current.current === option.key && "bg-primary text-primary-foreground"
            )}
          >
            {showIcons && getIcon(option.key)}
            {showLabels && (
              <span className="ml-1 text-xs">{option.name}</span>
            )}
          </Button>
        ))}
      </div>
    )
  }

  // 默认样式
  return (
    <div className={cn("flex flex-col space-y-2", className)}>
      <div className="text-sm font-medium text-muted-foreground">
        字体大小
      </div>
      <div className="flex items-center space-x-2">
        {options.map((option) => (
          <Button
            key={option.key}
            variant={getButtonVariant(option.key)}
            size={getButtonSize(variant)}
            onClick={() => {
              console.log("Clicking preset:", option.key)
              setPreset(option.key)
            }}
            className={cn(
              "flex items-center space-x-2",
              current.current === option.key && "bg-primary text-primary-foreground"
            )}
          >
            {showIcons && getIcon(option.key)}
            {showLabels && (
              <span>{option.name}</span>
            )}
          </Button>
        ))}
      </div>
      {current.current !== "normal" && (
        <div className="text-xs text-muted-foreground">
          当前：{current.name} ({Math.round(current.scale * 100)}%)
        </div>
      )}
      
      {/* 调试信息 */}
      <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
        <div>当前预设: {current.current}</div>
        <div>当前名称: {current.name}</div>
        <div>当前缩放: {current.scale}</div>
      </div>
    </div>
  )
}
