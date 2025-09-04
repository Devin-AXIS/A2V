"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { useFontSizePreset } from "@/hooks/use-font-size-config"
import { Type, Minus, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface FontSizeToggleButtonProps {
  className?: string
  variant?: "default" | "outline" | "ghost"
  size?: "sm" | "default" | "lg"
  showLabel?: boolean
}

export function FontSizeToggleButton({
  className = "",
  variant = "outline",
  size = "sm",
  showLabel = false
}: FontSizeToggleButtonProps) {
  const { setPreset, current } = useFontSizePreset()
  
  const toggleFontSize = () => {
    const nextPreset = current.current === "normal" ? "large" : 
                      current.current === "large" ? "small" : "normal"
    setPreset(nextPreset)
  }

  const getIcon = () => {
    switch (current.current) {
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

  const getLabel = () => {
    switch (current.current) {
      case "small":
        return "小"
      case "normal":
        return "正常"
      case "large":
        return "大"
      default:
        return "正常"
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleFontSize}
      className={cn("flex items-center gap-2", className)}
      title={`切换字体大小 (当前: ${getLabel()})`}
    >
      {getIcon()}
      {showLabel && (
        <span className="text-xs">
          {getLabel()} ({Math.round(current.scale * 100)}%)
        </span>
      )}
    </Button>
  )
}

// 迷你版本 - 只显示图标
export function FontSizeToggleIcon({ className = "" }: { className?: string }) {
  const { setPreset, current } = useFontSizePreset()
  
  const toggleFontSize = () => {
    const nextPreset = current.current === "normal" ? "large" : 
                      current.current === "large" ? "small" : "normal"
    setPreset(nextPreset)
  }

  const getIcon = () => {
    switch (current.current) {
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

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleFontSize}
      className={cn("h-8 w-8 p-0", className)}
      title={`字体大小：${current.name} (${Math.round(current.scale * 100)}%)`}
    >
      {getIcon()}
    </Button>
  )
}
