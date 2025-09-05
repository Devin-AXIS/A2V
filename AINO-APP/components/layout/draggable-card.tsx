"use client"

import React, { useState, useRef, useEffect } from "react"
import { useDraggable } from "@dnd-kit/core"
import { cn } from "@/lib/utils"
import { AppCard } from "@/components/layout/app-card"
import { validateCardLayout } from "@/lib/card-layout-constraints"

/**
 * 拖拽卡片组件 - 遵循"卡片是内容承载"的架构原则
 * 
 * 架构原则：
 * 1. 卡片是内容承载 - 通过AppCard提供容器
 * 2. 组件专注于功能 - 只处理拖拽逻辑
 * 3. 主次关系明确 - 卡片容器是主要，拖拽逻辑是次要
 */
interface DraggableCardProps {
  id: string
  children: React.ReactNode
  className?: string
  isEditing?: boolean
  onDragStart?: () => void
  onDragEnd?: () => void
  // 保持现有功能的所有props
  layout?: {
    x: number
    y: number
    w: number
    h: number
    scale?: number
  }
  onResize?: (w: number, h: number) => void
  onScale?: (scale: number) => void
  onRemove?: () => void
  gridSize?: number
  layoutMode?: "grid" | "freeform"
}

export function DraggableCard({
  id,
  children,
  className,
  isEditing = false,
  onDragStart,
  onDragEnd,
  layout,
  onResize,
  onScale,
  onRemove,
  gridSize = 120,
  layoutMode = "grid"
}: DraggableCardProps) {
  const [isResizing, setIsResizing] = useState(false)
  const [resizeStartSize, setResizeStartSize] = useState<{ w: number; h: number } | null>(null)
  const [resizeVisualSize, setResizeVisualSize] = useState<{ w: number; h: number } | null>(null)
  
  const resizeStartRef = useRef<{ x: number; y: number } | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // 使用现有的拖拽逻辑
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    disabled: !isEditing || isResizing,
  })

  // 验证组件是否符合架构原则
  useEffect(() => {
    const validation = validateCardLayout("DraggableCard", {
      id,
      children,
      className,
      isEditing,
      layout
    })
    
    if (!validation.isValid) {
      console.warn("DraggableCard 架构验证:", validation.violations)
      console.log("建议:", validation.recommendations)
    }
  }, [id, children, className, isEditing, layout])

  // 处理拖拽开始
  const handleDragStart = () => {
    onDragStart?.()
  }

  // 处理拖拽结束
  const handleDragEnd = () => {
    onDragEnd?.()
  }

  // 处理缩放开始
  const handleScaleStart = () => {
    if (!layout) return
    setResizeStartSize({
      w: layout.w,
      h: layout.h
    })
  }

  // 处理缩放
  const handleScale = (deltaX: number, deltaY: number) => {
    if (!resizeStartSize || !onResize) return
    
    const newW = Math.max(2, resizeStartSize.w + Math.round(deltaX / gridSize))
    const newH = Math.max(2, resizeStartSize.h + Math.round(deltaY / gridSize))
    
    setResizeVisualSize({ w: newW, h: newH })
  }

  // 处理缩放结束
  const handleScaleEnd = () => {
    if (resizeVisualSize && onResize) {
      onResize(resizeVisualSize.w, resizeVisualSize.h)
    }
    setResizeStartSize(null)
    setResizeVisualSize(null)
    setIsResizing(false)
  }

  // 计算实际尺寸
  const actualWidth = layoutMode === "freeform" 
    ? Math.max(1, Math.round(layout?.w || 2)) 
    : (layout?.w || 2) * gridSize - 8
  
  const actualHeight = layoutMode === "freeform" 
    ? Math.max(1, Math.round(layout?.h || 2)) 
    : (layout?.h || 2) * gridSize - 8

  const scale = layout?.scale || 1

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "relative",
        isDragging && "z-50",
        className
      )}
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        width: actualWidth,
        height: actualHeight,
        transform: `scale(${scale})`,
        transformOrigin: "top left"
      }}
      {...attributes}
      {...listeners}
    >
      {/* 卡片容器 - 遵循"卡片是内容承载"原则 */}
      <AppCard 
        className={cn(
          "w-full h-full",
          isEditing && "ring-2 ring-primary/50 ring-offset-2"
        )}
      >
        {/* 内容区域 - 组件专注于功能 */}
        <div 
          ref={contentRef}
          className="w-full h-full"
          onMouseDown={handleDragStart}
          onMouseUp={handleDragEnd}
        >
          {children}
        </div>

        {/* 编辑控制按钮 - 保持现有功能 */}
        {isEditing && (
          <div className="absolute top-2 right-2 flex gap-1 z-10">
            {/* 缩放按钮 */}
            <button
              className="w-6 h-6 bg-primary/80 text-white rounded text-xs hover:bg-primary"
              onClick={() => onScale?.(scale === 0.5 ? 1 : scale === 1 ? 1.5 : scale === 1.5 ? 2 : 0.5)}
            >
              {Math.round(scale * 100)}%
            </button>
            
            {/* 删除按钮 */}
            {onRemove && (
              <button
                className="w-6 h-6 bg-red-500/80 text-white rounded text-xs hover:bg-red-500"
                onClick={onRemove}
              >
                ×
              </button>
            )}
          </div>
        )}

        {/* 缩放手柄 - 保持现有功能 */}
        {isEditing && onResize && (
          <>
            {/* 东南角缩放 */}
            <div
              className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-primary/20 hover:bg-primary/40 rounded-tl-lg z-10"
              onMouseDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setIsResizing(true)
                setResizeStartSize({ w: layout?.w || 2, h: layout?.h || 2 })
                resizeStartRef.current = { x: e.clientX, y: e.clientY }
              }}
              onMouseMove={(e) => {
                if (!isResizing || !resizeStartRef.current) return
                const deltaX = e.clientX - resizeStartRef.current.x
                const deltaY = e.clientY - resizeStartRef.current.y
                handleScale(deltaX, deltaY)
              }}
              onMouseUp={handleScaleEnd}
            />
            
            {/* 东边缩放 */}
            <div
              className="absolute top-1/2 right-0 w-2 h-8 -translate-y-1/2 cursor-e-resize bg-primary/20 hover:bg-primary/40 rounded-l-lg z-10"
              onMouseDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setIsResizing(true)
                setResizeStartSize({ w: layout?.w || 2, h: layout?.h || 2 })
                resizeStartRef.current = { x: e.clientX, y: e.clientY }
              }}
              onMouseMove={(e) => {
                if (!isResizing || !resizeStartRef.current) return
                const deltaX = e.clientX - resizeStartRef.current.x
                handleScale(deltaX, 0)
              }}
              onMouseUp={handleScaleEnd}
            />
            
            {/* 南边缩放 */}
            <div
              className="absolute bottom-0 left-1/2 w-8 h-2 -translate-x-1/2 cursor-s-resize bg-primary/20 hover:bg-primary/40 rounded-t-lg z-10"
              onMouseDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setIsResizing(true)
                setResizeStartSize({ w: layout?.w || 2, h: layout?.h || 2 })
                resizeStartRef.current = { x: e.clientX, y: e.clientY }
              }}
              onMouseMove={(e) => {
                if (!isResizing || !resizeStartRef.current) return
                const deltaY = e.clientY - resizeStartRef.current.y
                handleScale(0, deltaY)
              }}
              onMouseUp={handleScaleEnd}
            />
          </>
        )}
      </AppCard>
    </div>
  )
}
