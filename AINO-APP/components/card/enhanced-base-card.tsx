"use client"
import { BaseCard, type BaseCardProps } from "./base-card"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

export interface EnhancedBaseCardProps extends BaseCardProps {
  id: string
  // 强制启用所有必需功能
  isDraggable?: boolean
  showSettings?: boolean
}

/**
 * 增强版基础卡片组件
 * 强制集成所有卡片必需的功能：
 * - 拖拽排序 (默认启用)
 * - 主题配置 (默认启用)
 * - 设置入口 (默认启用)
 * - 统一的交互约束
 */
export function EnhancedBaseCard({
  id,
  isDraggable = true,
  showSettings = true,
  children,
  className = "",
  ...props
}: EnhancedBaseCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled: !isDraggable,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const dragHandleProps = isDraggable
    ? {
      ref: setNodeRef,
      style,
      ...attributes,
      ...listeners,
    }
    : {}

  return (
    <BaseCard
      className={`
        ${isDragging ? "opacity-50 scale-105 z-50" : ""}
        ${className}
      `}
      isDraggable={isDraggable}
      showSettings={showSettings}
      dragHandleProps={dragHandleProps}
      localThemeKey={id}
      {...props}
    >
      {children}
    </BaseCard>
  )
}
