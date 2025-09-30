"use client"

import type React from "react"
import { AppCard } from "@/components/layout/app-card"
import { Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

export interface BaseCardProps {
  children: React.ReactNode
  className?: string
  disableLocalTheme?: boolean
  showSettings?: boolean
  onSettingsClick?: () => void
  // 拖拽相关属性
  isDraggable?: boolean
  dragHandleProps?: any
  // 主题相关属性
  theme?: "default" | "glass" | "minimal" | "vibrant"
  // 数据和动作
  data?: any
  onAction?: (action: string, data?: any) => void
  // 为局部主题持久化提供唯一键（建议来自卡片 id）
  localThemeKey?: string
  // 设备类型属性
  deviceType?: 'universal' | 'mobile' | 'pc'
  // 拖拽排序必需属性
  id?: string
}

/**
 * 统一的卡片基础组件
 * 集成了所有卡片必需的功能：
 * - 主题配置能力
 * - 设置入口
 * - 拖拽支持（可选）
 * - 统一的样式约束
 * 
 * 使用方式：
 * - 简单卡片：<BaseCard>内容</BaseCard>
 * - 可拖拽卡片：<BaseCard id="card-1" isDraggable={true}>内容</BaseCard>
 * - 带设置卡片：<BaseCard showSettings={true}>内容</BaseCard>
 */
export function BaseCard({
  children,
  className = "",
  disableLocalTheme = true,
  showSettings = false, // 默认不显示设置按钮
  onSettingsClick,
  isDraggable = false,
  dragHandleProps,
  theme = "default",
  data,
  onAction,
  localThemeKey,
  id,
  ...props
}: BaseCardProps) {
  // 拖拽排序功能（仅在启用时使用）
  const sortable = isDraggable ? useSortable({
    id: id || "default",
    disabled: false,
  }) : null

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = sortable || {
    attributes: {},
    listeners: {},
    setNodeRef: () => {},
    transform: null,
    transition: null,
    isDragging: false
  }

  const handleSettingsClick = () => {
    if (onSettingsClick) {
      onSettingsClick()
    } else if (onAction) {
      onAction("settings", data)
    }
  }

  // 拖拽样式
  const dragStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  // 合并拖拽属性
  const finalDragHandleProps = isDraggable
    ? {
        ref: setNodeRef,
        style: dragStyle,
        ...attributes,
        ...listeners,
        ...dragHandleProps,
      }
    : dragHandleProps

  return (
    <div className="relative group">
      <AppCard
        className={`
          transition-all duration-200 ease-in-out
          hover:shadow-lg hover:scale-[1.02]
          ${isDraggable ? "cursor-move" : ""}
          ${isDragging ? "opacity-50 scale-105 z-50" : ""}
          ${className}
        `}
        disableLocalTheme={disableLocalTheme}
        data-theme={theme}
        localThemeKey={localThemeKey || id}
        {...finalDragHandleProps}
        {...props}
      >
        {children}

        {/* 统一的设置按钮 - 默认不显示 */}
        {showSettings && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-8 w-8 p-0"
            onClick={handleSettingsClick}
          >
            <Settings className="h-4 w-4" />
          </Button>
        )}
      </AppCard>
    </div>
  )
}
