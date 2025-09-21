"use client"

import type React from "react"
import { useState, useEffect, useRef, cloneElement, isValidElement } from "react"
import {
  Plus,
  Grid3X3,
  LayoutGrid,
  Maximize2,
  X,
  Save,
  Edit3,
  RotateCcw,
  TrendingUp,
  Users,
  Star,
  ShoppingCart,
  Heart,
  Share2,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { CardRegistry } from "@/components/card/registry"
import { BusinessCardWrapper } from "@/components/card/business-cards/business-card-wrapper"
import { AppCard } from "@/components/layout/app-card"
import { PillButton } from "@/components/basic/pill-button"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  DragOverlay,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import { useDraggable, useDroppable } from "@dnd-kit/core"
import { LocalThemeEditorVisibilityProvider } from "@/components/providers/local-theme-editor-visibility"
import { LocalThemeKeyProvider } from "@/components/providers/local-theme-key"

// 全局最小尺寸约束（自由模式为像素；网格模式为网格单元）
const MIN_FREEFORM_WIDTH = 260
const MIN_FREEFORM_HEIGHT = 180
const MIN_GRID_W = 2
const MIN_GRID_H = 2

interface PCCardItem {
  id: string
  type: string
  name: string
  category: string
  component: React.ReactNode
  layout: {
    x: number // 网格位置 x
    y: number // 网格位置 y
    w: number // 宽度（网格单元数）
    h: number // 高度（网格单元数）
    scale?: number // 添加缩放比例
  }
}

interface PCDynamicPageComponentProps {
  category?: string
  locale?: string
  className?: string
}

function ResizeHandle({
  onResize,
  direction,
  onResizeStart,
  onResizeEnd,
}: {
  onResize: (deltaX: number, deltaY: number) => void
  direction: "se" | "e" | "s"
  onResizeStart?: () => void
  onResizeEnd?: () => void
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
    setStartPos({ x: e.clientX, y: e.clientY })
    onResizeStart?.()
  }

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startPos.x
      const deltaY = e.clientY - startPos.y
      onResize(deltaX, deltaY)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      onResizeEnd?.()
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, startPos, onResize])

  const getHandleClass = () => {
    switch (direction) {
      case "se":
        return "absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-primary/20 hover:bg-primary/40 rounded-tl-lg"
      case "e":
        return "absolute top-1/2 right-0 w-2 h-8 -translate-y-1/2 cursor-e-resize bg-primary/20 hover:bg-primary/40 rounded-l-lg"
      case "s":
        return "absolute bottom-0 left-1/2 w-8 h-2 -translate-x-1/2 cursor-s-resize bg-primary/20 hover:bg-primary/40 rounded-t-lg"
      default:
        return ""
    }
  }

  return (
    <div
      className={cn(getHandleClass(), "z-50 pointer-events-auto")}
      onMouseDown={handleMouseDown}
    />
  )
}

function GridCard({
  card,
  isEditing,
  onRemove,
  onResize,
  onScale,
  gridSize = 120,
  layoutMode = "freeform",
}: {
  card: PCCardItem
  isEditing: boolean
  onRemove: (id: string) => void
  onResize: (id: string, w: number, h: number) => void
  onScale: (id: string, scale: number) => void
  gridSize?: number
  layoutMode?: "grid" | "freeform"
}) {
  const [isResizing, setIsResizing] = useState(false)
  const resizeStartSizeRef = useRef<{ baseW: number; baseH: number } | null>(null)
  const [resizeVisualSize, setResizeVisualSize] = useState<{ w: number; h: number } | null>(null)
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card.id,
    disabled: !isEditing || isResizing,
  })

  const scale = card.layout.scale || 1
  const actualWidth = layoutMode === "freeform" ? Math.max(1, Math.round(card.layout.w)) : card.layout.w * gridSize - 8
  const actualHeight = layoutMode === "freeform" ? Math.max(1, Math.round(card.layout.h)) : card.layout.h * gridSize - 8

  // 内容容器引用（用于测量）
  const contentRef = useRef<HTMLDivElement | null>(null)

  // 在注入实例唯一 key，支持局部主题
  const withInstanceId = (element: React.ReactNode, id: string) => {
    return isValidElement(element)
      ? cloneElement(element as React.ReactElement, {
        id,
        "data-theme-key": id,
      })
      : element
  }

  // 外层容器样式（支持缩放中视觉连续大小）
  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    position: "absolute" as const,
    left: layoutMode === "freeform" ? card.layout.x : card.layout.x * gridSize,
    top: layoutMode === "freeform" ? card.layout.y : card.layout.y * gridSize,
    width: isResizing && resizeVisualSize ? resizeVisualSize.w : actualWidth,
    height: isResizing && resizeVisualSize ? resizeVisualSize.h : actualHeight,
    minWidth: layoutMode === "freeform" ? MIN_FREEFORM_WIDTH : MIN_GRID_W * gridSize - 8,
    minHeight: layoutMode === "freeform" ? MIN_FREEFORM_HEIGHT : MIN_GRID_H * gridSize - 8,
    zIndex: isDragging ? 1000 : 1,
    opacity: isDragging ? 0 : 1,
    willChange: "transform" as const,
    transition: isDragging ? "none" : undefined,
    touchAction: "none" as const,
  }

  useEffect(() => {
    if (!contentRef.current || isResizing) return

    let rafId = 0
    const measureAndUpdate = () => {
      if (!contentRef.current) return
      const el = contentRef.current
      const rect = el.getBoundingClientRect()
      if (layoutMode !== "freeform") {
        const visualWidth = Math.max(1, Math.round(rect.width))
        const visualHeight = Math.max(1, Math.round(rect.height))
        const requiredW = Math.max(MIN_GRID_W, Math.ceil((visualWidth + 8) / gridSize))
        const requiredH = Math.max(MIN_GRID_H, Math.ceil((visualHeight + 8) / gridSize))
        if (requiredW !== card.layout.w || requiredH !== card.layout.h) {
          onResize(card.id, requiredW, requiredH)
        }
      }
    }

    const observer = new ResizeObserver(() => {
      rafId = requestAnimationFrame(measureAndUpdate)
    })

    observer.observe(contentRef.current)
    measureAndUpdate()

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      observer.disconnect()
    }
  }, [card.id, card.layout.w, card.layout.h, gridSize, onResize, layoutMode, scale, isResizing])

  const handleResize = (deltaX: number, deltaY: number) => {
    const start = resizeStartSizeRef.current
    if (!start) return
    if (layoutMode === "freeform") {
      const newW = Math.max(MIN_FREEFORM_WIDTH, Math.round(start.baseW + deltaX))
      const newH = Math.max(MIN_FREEFORM_HEIGHT, Math.round(start.baseH + deltaY))
      setResizeVisualSize({ w: newW, h: newH })
    } else {
      // 视觉连续大小（像素级），结束时再网格对齐
      const baseWPx = start.baseW * gridSize - 8
      const baseHPx = start.baseH * gridSize - 8
      const newWPx = Math.max(MIN_GRID_W * gridSize - 8, Math.round(baseWPx + deltaX))
      const newHPx = Math.max(MIN_GRID_H * gridSize - 8, Math.round(baseHPx + deltaY))
      setResizeVisualSize({ w: newWPx, h: newHPx })
    }
  }

  const handleScaleChange = (newScale: number) => {
    onScale(card.id, Math.max(0.5, Math.min(2, newScale)))
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group rounded-lg border-2 border-transparent",
        // isEditing && "hover:border-primary/30 hover:shadow-lg",
        isEditing && "hover:shadow-lg",
        isDragging && "border-primary/50",
      )}
    >
      {isEditing && (
        <div
          className="absolute top-0 left-0 right-0 h-6 z-50 cursor-move pointer-events-auto"
          {...attributes}
          {...listeners}
        />
      )}
      {isEditing && (
        <>
          <div className="absolute -top-12 left-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-white rounded-lg shadow-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={(e) => {
                e.stopPropagation()
                onRemove(card.id)
              }}
            >
              <X className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={(e) => {
                e.stopPropagation()
                const newW = card.layout.w === 1 ? 2 : card.layout.w === 2 ? 3 : 1
                const newH = card.layout.h === 1 ? 2 : card.layout.h === 2 ? 3 : 1
                onResize(card.id, newW, newH)
              }}
            >
              {card.layout.w}×{card.layout.h}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={(e) => {
                e.stopPropagation()
                const newScale = scale === 0.5 ? 1 : scale === 1 ? 1.5 : scale === 1.5 ? 2 : 0.5
                handleScaleChange(newScale)
              }}
            >
              {Math.round(scale * 100)}%
            </Button>
          </div>

          <ResizeHandle
            direction="se"
            onResize={handleResize}
            onResizeStart={() => {
              setIsResizing(true)
              resizeStartSizeRef.current = {
                baseW: layoutMode === "freeform" ? actualWidth : card.layout.w,
                baseH: layoutMode === "freeform" ? actualHeight : card.layout.h,
              }
              setResizeVisualSize({
                w: layoutMode === "freeform" ? actualWidth : card.layout.w * gridSize - 8,
                h: layoutMode === "freeform" ? actualHeight : card.layout.h * gridSize - 8,
              })
            }}
            onResizeEnd={() => {
              setIsResizing(false)
              resizeStartSizeRef.current = null
              // 最终提交尺寸（网格模式对齐）
              if (resizeVisualSize) {
                if (layoutMode === "freeform") {
                  onResize(card.id, resizeVisualSize.w, resizeVisualSize.h)
                } else {
                  const finalW = Math.max(MIN_GRID_W, Math.round((resizeVisualSize.w + 8) / gridSize))
                  const finalH = Math.max(MIN_GRID_H, Math.round((resizeVisualSize.h + 8) / gridSize))
                  onResize(card.id, finalW, finalH)
                }
              }
              setResizeVisualSize(null)
            }}
          />
          <ResizeHandle
            direction="e"
            onResize={(deltaX) => handleResize(deltaX, 0)}
            onResizeStart={() => {
              setIsResizing(true)
              resizeStartSizeRef.current = {
                baseW: layoutMode === "freeform" ? actualWidth : card.layout.w,
                baseH: layoutMode === "freeform" ? actualHeight : card.layout.h,
              }
              setResizeVisualSize({
                w: layoutMode === "freeform" ? actualWidth : card.layout.w * gridSize - 8,
                h: layoutMode === "freeform" ? actualHeight : card.layout.h * gridSize - 8,
              })
            }}
            onResizeEnd={() => {
              setIsResizing(false)
              resizeStartSizeRef.current = null
              if (resizeVisualSize) {
                if (layoutMode === "freeform") {
                  // 只提交宽度，高度保持不变
                  onResize(card.id, resizeVisualSize.w, actualHeight)
                } else {
                  const finalW = Math.max(MIN_GRID_W, Math.round((resizeVisualSize.w + 8) / gridSize))
                  const finalH = card.layout.h
                  onResize(card.id, finalW, finalH)
                }
              }
              setResizeVisualSize(null)
            }}
          />
          <ResizeHandle
            direction="s"
            onResize={(deltaY) => handleResize(0, deltaY)}
            onResizeStart={() => {
              setIsResizing(true)
              resizeStartSizeRef.current = {
                baseW: layoutMode === "freeform" ? actualWidth : card.layout.w,
                baseH: layoutMode === "freeform" ? actualHeight : card.layout.h,
              }
              setResizeVisualSize({
                w: layoutMode === "freeform" ? actualWidth : card.layout.w * gridSize - 8,
                h: layoutMode === "freeform" ? actualHeight : card.layout.h * gridSize - 8,
              })
            }}
            onResizeEnd={() => {
              setIsResizing(false)
              resizeStartSizeRef.current = null
              if (resizeVisualSize) {
                if (layoutMode === "freeform") {
                  // 只提交高度，宽度保持不变
                  onResize(card.id, actualWidth, resizeVisualSize.h)
                } else {
                  const finalW = card.layout.w
                  const finalH = Math.max(MIN_GRID_H, Math.round((resizeVisualSize.h + 8) / gridSize))
                  onResize(card.id, finalW, finalH)
                }
              }
              setResizeVisualSize(null)
            }}
          />
        </>
      )}

      {layoutMode === "freeform" ? (
        <div ref={contentRef} className="rounded-lg" style={{ width: "100%", height: "100%", minWidth: MIN_FREEFORM_WIDTH, minHeight: MIN_FREEFORM_HEIGHT }}>
          <div style={{ width: "100%", height: "100%", transform: `scale(${scale})`, transformOrigin: "top left" }}>
            <div className="h-full w-full flex flex-col min-h-0">
              {withInstanceId(card.component, card.id)}
            </div>
          </div>
        </div>
      ) : (
        <div ref={contentRef} className="rounded-lg" style={{ width: "100%", height: "100%", minWidth: MIN_GRID_W * gridSize - 8, minHeight: MIN_GRID_H * gridSize - 8 }}>
          <div style={{ width: "100%", height: "100%", transform: `scale(${scale})`, transformOrigin: "top left" }}>
            <div className="h-full w-full flex flex-col min-h-0">
              {withInstanceId(card.component, card.id)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function GridDropZone({
  children,
  gridCols,
  gridRows,
  gridSize = 120,
  layoutMode = "freeform",
  containerWidth,
  containerHeight,
}: {
  children: React.ReactNode
  gridCols: number
  gridRows: number
  gridSize?: number
  layoutMode?: "grid" | "freeform"
  containerWidth?: number
  containerHeight?: number
}) {
  const { setNodeRef } = useDroppable({
    id: "grid-container",
  })

  const style =
    layoutMode === "freeform"
      ? { width: containerWidth || 0, height: containerHeight || 0 }
      : { width: gridCols * gridSize + 32, height: gridRows * gridSize + 32 }

  return (
    <div
      ref={setNodeRef}
      className={cn("relative bg-gray-50/30 rounded-xl", layoutMode === "freeform" ? "p-0" : "p-4")}
      style={style}
    >
      {children}
    </div>
  )
}

const BASIC_CARDS = [
  {
    id: "user-info",
    name: "用户信息",
    category: "基础",
    defaultSize: { w: 2, h: 2 },
    component: (
      <AppCard className="p-6 hover:shadow-lg transition-all duration-300 h-full">
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-3">
            <Users className="w-5 h-5 text-primary" />
            <h4 className="text-lg font-bold">用户信息</h4>
          </div>
          <p className="text-sm text-muted-foreground mb-4">查看和编辑用户基本信息</p>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src="/generic-user-avatar.png"
                alt="用户头像"
                className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
            </div>
            <div className="flex-1">
              <p className="font-medium">张三</p>
              <p className="text-sm text-muted-foreground">zhang.san@example.com</p>
              <Badge variant="secondary" className="mt-1 text-xs">
                活跃用户
              </Badge>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full hover:bg-primary hover:text-primary-foreground transition-colors mt-4 bg-transparent"
          >
            <Settings className="w-4 h-4 mr-2" />
            编辑资料
          </Button>
        </div>
      </AppCard>
    ),
  },
  {
    id: "sales-data",
    name: "销售数据",
    category: "基础",
    defaultSize: { w: 2, h: 2 },
    component: (
      <AppCard className="p-6 hover:shadow-lg transition-all duration-300 h-full">
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-3">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h4 className="text-lg font-bold">今日销售</h4>
          </div>
          <p className="text-sm text-muted-foreground mb-4">实时销售数据统计</p>
          <div className="space-y-3">
            <div className="text-3xl font-bold">¥12,345</div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span className="font-medium">+15.2%</span>
                <span className="text-muted-foreground">较昨日</span>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-600/30">
                增长中
              </Badge>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full transition-all duration-500" style={{ width: "75%" }}></div>
            </div>
          </div>
        </div>
      </AppCard>
    ),
  },
  {
    id: "quick-actions",
    name: "快速操作",
    category: "基础",
    defaultSize: { w: 2, h: 2 },
    component: (
      <AppCard className="p-6 hover:shadow-lg transition-all duration-300 h-full">
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-3">
            <Star className="w-5 h-5 text-primary" />
            <h4 className="text-lg font-bold">快速操作</h4>
          </div>
          <p className="text-sm text-muted-foreground mb-4">常用功能快捷入口</p>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              size="sm"
              className="h-12 flex-col space-y-1 hover:bg-primary hover:text-primary-foreground transition-colors bg-transparent"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="text-xs">订单</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-12 flex-col space-y-1 hover:bg-red-500 hover:text-white transition-colors bg-transparent"
            >
              <Heart className="w-4 h-4" />
              <span className="text-xs">收藏</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-12 flex-col space-y-1 hover:bg-blue-500 hover:text-white transition-colors bg-transparent"
            >
              <Share2 className="w-4 h-4" />
              <span className="text-xs">分享</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-12 flex-col space-y-1 hover:bg-yellow-500 hover:text-white transition-colors bg-transparent"
            >
              <Star className="w-4 h-4" />
              <span className="text-xs">评价</span>
            </Button>
          </div>
        </div>
      </AppCard>
    ),
  },
]

const BUSINESS_CARD_DATA = {
  "media-editor": {
    title: "媒体内容编辑",
    coverImage: "",
    actors: ["演员A", "演员B"],
    language: "中文",
    prompt: "萨达说的是v v呈现出萨达说的是大叔大叔是大叔东西啊是大叔萨达说大叔 萨达的爱上大是大叔",
  },
  "ecommerce-product": {
    id: "1",
    name: "iPhone 15 Pro",
    price: "¥7,999",
    image: "/iphone-15-pro-hands.png",
    rating: 4.8,
    inStock: true,
  },
  "news-article": {
    id: "1",
    title: "人工智能技术的最新发展趋势",
    summary: "探讨AI技术在各个领域的应用前景，以及对未来社会发展的深远影响。",
    author: "张三",
    publishTime: "2024-01-15",
    category: "科技",
    image: "/ai-technology.png",
    readTime: "5分钟",
    comments: 23,
  },
}

export function PCDynamicPageComponent({
  category = "workspace",
  locale = "zh",
  className,
}: PCDynamicPageComponentProps) {
  const [cards, setCards] = useState<PCCardItem[]>([])
  const [layoutMode, setLayoutMode] = useState<"grid" | "freeform">("freeform")
  const [gridCols, setGridCols] = useState(12)
  const [gridRows, setGridRows] = useState(10)
  const [showCardSelector, setShowCardSelector] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("全部")
  const [isEditing, setIsEditing] = useState(true)
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
  const dragStartRef = useRef<{ x: number; y: number } | null>(null)

  const STORAGE_KEY = `pc-dynamic-cards-${category}-${locale}`
  const gridSize = 120

  // 当卡片高度总和超出当前网格行数时，自动扩展网格行数以避免内容被裁剪
  useEffect(() => {
    if (layoutMode !== "grid") return
    if (cards.length === 0) return
    const maxBottom = cards.reduce((max, c) => Math.max(max, c.layout.y + c.layout.h), 0)
    if (maxBottom > gridRows) {
      setGridRows(maxBottom)
    }
  }, [cards, gridRows, layoutMode])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 2,
      },
    }),
    useSensor(KeyboardSensor),
  )

  const findEmptyPosition = (w: number, h: number): { x: number; y: number } => {
    for (let y = 0; y <= gridRows - h; y++) {
      for (let x = 0; x <= gridCols - w; x++) {
        const isOccupied = cards.some(
          (card) =>
            !(
              x >= card.layout.x + card.layout.w ||
              x + w <= card.layout.x ||
              y >= card.layout.y + card.layout.h ||
              y + h <= card.layout.y
            ),
        )
        if (!isOccupied) {
          return { x, y }
        }
      }
    }
    return { x: 0, y: 0 }
  }

  // 基于当前占用矩形集合查找空位（用于重叠时重新安置其他卡片）
  const rectanglesOverlap = (
    a: { x: number; y: number; w: number; h: number },
    b: { x: number; y: number; w: number; h: number },
  ) => {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
  }

  const findEmptyPositionInOccupied = (
    occupiedRects: Array<{ x: number; y: number; w: number; h: number }>,
    w: number,
    h: number,
  ): { x: number; y: number } => {
    for (let y = 0; y <= gridRows - h; y++) {
      for (let x = 0; x <= gridCols - w; x++) {
        const candidate = { x, y, w, h }
        const overlaps = occupiedRects.some((rect) => rectanglesOverlap(candidate, rect))
        if (!overlaps) {
          return { x, y }
        }
      }
    }
    return { x: 0, y: 0 }
  }

  const getAllAvailableCards = () => {
    const allCards = []

    allCards.push(...BASIC_CARDS)

    const registeredCards = CardRegistry.getAll()
    registeredCards.forEach((card) => {
      const data = BUSINESS_CARD_DATA[card.name as keyof typeof BUSINESS_CARD_DATA]
      allCards.push({
        id: card.name,
        name: card.displayName || card.name,
        category: card.category,
        defaultSize: { w: 2, h: 2 },
        component: (
          <BusinessCardWrapper
            cardName={card.name}
            data={data}
            onAction={(action, data) => console.log("Card action:", action, data)}
          />
        ),
      })
    })

    return allCards
  }

  const availableCards = getAllAvailableCards()
  const filteredCards =
    selectedCategory === "全部" ? availableCards : availableCards.filter((card) => card.category === selectedCategory)
  const allCategories = ["全部", ...Array.from(new Set(availableCards.map((card) => card.category)))]

  useEffect(() => {
    // 注册完成后再尝试恢复，避免因未注册导致模板找不到而丢失卡片
    if (cards.length > 0) return
    try {
      const savedCards = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null
      if (savedCards) {
        const parsed = JSON.parse(savedCards)
        if (parsed && Array.isArray(parsed.cards)) {
          const restored = parsed.cards
            .map((savedCard: any) => {
              const template = availableCards.find((t) => t.id === savedCard.type)
              if (!template) return null
              return {
                id: savedCard.id || `${template.id}-${Date.now()}`,
                type: template.id,
                name: template.name,
                category: template.category,
                component: template.component,
                layout: savedCard.layout || { x: 0, y: 0, w: 2, h: 2, scale: 1 },
              }
            })
            .filter(Boolean) as PCCardItem[]

          if (restored.length > 0) {
            // 恢复主题：在挂载卡片之前先写回各自实例 key，确保初始渲染就能读取到
            if (parsed.themes && typeof window !== "undefined") {
              Object.entries(parsed.themes as Record<string, any>).forEach(([id, theme]) => {
                try {
                  localStorage.setItem(id, JSON.stringify(theme))
                } catch { }
              })
            }
            setCards(restored)
            setIsEditing(false)
          }
        }
      }
    } catch (error) {
      console.error("Failed to load saved cards:", error)
    }
  }, [STORAGE_KEY, availableCards.length])

  const saveLayout = () => {
    try {
      const payload = {
        cards: cards.map((c) => ({
          id: c.id,
          type: c.type,
          layout: c.layout,
        })),
        // 保存每张卡片的本地主题（如果有）
        themes: cards.reduce((acc: Record<string, any>, c) => {
          try {
            const key = c.id
            const raw = typeof window !== "undefined" ? localStorage.getItem(key) : null
            if (raw) acc[c.id] = JSON.parse(raw)
          } catch { }
          return acc
        }, {}),
        updatedAt: Date.now(),
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch (error) {
      console.error("Failed to save layout:", error)
    }
  }

  const addCard = (cardConfig: any) => {
    const defaultSize = cardConfig.defaultSize || { w: 2, h: 2 }

    if (layoutMode === "freeform") {
      const newWidthPx = Math.max(
        MIN_FREEFORM_WIDTH,
        (defaultSize.w || MIN_GRID_W) * gridSize - 8,
      )
      const newHeightPx = Math.max(
        MIN_FREEFORM_HEIGHT,
        (defaultSize.h || MIN_GRID_H) * gridSize - 8,
      )
      const maxBottomPx = cards.reduce(
        (max, c) => Math.max(max, (c.layout.y || 0) + Math.max(1, Math.round(c.layout.h || 0))),
        0,
      )

      const newCard: PCCardItem = {
        id: `${cardConfig.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: cardConfig.id,
        name: cardConfig.name,
        category: cardConfig.category,
        component: cardConfig.component,
        layout: {
          x: 0,
          y: maxBottomPx + 16,
          w: newWidthPx,
          h: newHeightPx,
          scale: 1,
        },
      }

      setCards((prevCards) => [...prevCards, newCard])
      setShowCardSelector(false)
      return
    }

    // 网格模式：先按照网格找到空位
    const positionCells = findEmptyPosition(
      Math.max(MIN_GRID_W, defaultSize.w),
      Math.max(MIN_GRID_H, defaultSize.h),
    )

    const newCard: PCCardItem = {
      id: `${cardConfig.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: cardConfig.id,
      name: cardConfig.name,
      category: cardConfig.category,
      component: cardConfig.component,
      layout: {
        x: positionCells.x,
        y: positionCells.y,
        w: Math.max(MIN_GRID_W, defaultSize.w),
        h: Math.max(MIN_GRID_H, defaultSize.h),
        scale: 1,
      },
    }

    setCards((prevCards) => [...prevCards, newCard])
    setShowCardSelector(false)
  }

  const removeCard = (cardId: string) => {
    setCards(cards.filter((card) => card.id !== cardId))
  }

  const resizeCard = (cardId: string, w: number, h: number) => {
    setCards(
      cards.map((card) => {
        if (card.id !== cardId) return card
        const clamped = layoutMode === "freeform"
          ? {
            w: Math.max(MIN_FREEFORM_WIDTH, Math.round(w)),
            h: Math.max(MIN_FREEFORM_HEIGHT, Math.round(h)),
          }
          : {
            w: Math.max(MIN_GRID_W, Math.round(w)),
            h: Math.max(MIN_GRID_H, Math.round(h)),
          }
        return { ...card, layout: { ...card.layout, ...clamped } }
      }),
    )
  }

  const scaleCard = (cardId: string, scale: number) => {
    setCards(cards.map((card) => (card.id === cardId ? { ...card, layout: { ...card.layout, scale } } : card)))
  }

  const handleDragStart = (event: DragStartEvent) => {
    const cardId = event.active.id as string
    setActiveId(cardId)
    const card = cards.find((c) => c.id === cardId)
    if (card) {
      dragStartRef.current = { x: card.layout.x, y: card.layout.y }
    } else {
      dragStartRef.current = null
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event
    setActiveId(null)

    const cardId = active.id as string
    const start = dragStartRef.current
    const card = cards.find((c) => c.id === cardId)
    if (!card || !start || !delta) {
      dragStartRef.current = null
      return
    }

    if (layoutMode === "freeform") {
      const newX = Math.max(0, Math.round(start.x + delta.x))
      const newY = Math.max(0, Math.round(start.y + delta.y))
      const targetRect = { x: newX, y: newY, w: Math.round(card.layout.w), h: Math.round(card.layout.h) }
      const overlappingCards = cards.filter(
        (other) =>
          other.id !== cardId &&
          rectanglesOverlap(targetRect, {
            x: other.layout.x,
            y: other.layout.y,
            w: Math.round(other.layout.w),
            h: Math.round(other.layout.h),
          }),
      )

      if (overlappingCards.length === 0) {
        setCards((prevCards) =>
          prevCards.map((c) => (c.id === cardId ? { ...c, layout: { ...c.layout, x: newX, y: newY } } : c)),
        )
        dragStartRef.current = null
        return
      }

      const occupiedRects: Array<{ x: number; y: number; w: number; h: number; id?: string }> = cards
        .filter((c) => c.id !== cardId)
        .map((c) => ({ x: c.layout.x, y: c.layout.y, w: Math.round(c.layout.w), h: Math.round(c.layout.h), id: c.id }))

      const reservedTarget = { x: newX, y: newY, w: Math.round(card.layout.w), h: Math.round(card.layout.h) }
      const movedPositions = new Map<string, { x: number; y: number }>()

      for (const oc of overlappingCards) {
        const idx = occupiedRects.findIndex((r) => r.id === oc.id)
        if (idx !== -1) occupiedRects.splice(idx, 1)
        // 简单策略：向下平移到最近不重叠位置
        let candidateY = oc.layout.y
        const candidateX = oc.layout.x
        while (
          occupiedRects.some((rect) =>
            rectanglesOverlap(
              { x: candidateX, y: candidateY, w: Math.round(oc.layout.w), h: Math.round(oc.layout.h) },
              rect,
            ),
          ) ||
          rectanglesOverlap(
            { x: candidateX, y: candidateY, w: Math.round(oc.layout.w), h: Math.round(oc.layout.h) },
            reservedTarget,
          )
        ) {
          candidateY += 16
        }
        movedPositions.set(oc.id, { x: candidateX, y: candidateY })
        occupiedRects.push({
          x: candidateX,
          y: candidateY,
          w: Math.round(oc.layout.w),
          h: Math.round(oc.layout.h),
          id: oc.id,
        })
      }

      setCards((prev) =>
        prev.map((c) => {
          if (c.id === cardId) {
            return { ...c, layout: { ...c.layout, x: newX, y: newY } }
          }
          const moved = movedPositions.get(c.id)
          if (moved) {
            return { ...c, layout: { ...c.layout, x: moved.x, y: moved.y } }
          }
          return c
        }),
      )

      dragStartRef.current = null
      return
    }

    const newX = Math.max(0, Math.min(gridCols - card.layout.w, start.x + Math.round(delta.x / gridSize)))
    const newY = Math.max(0, Math.min(gridRows - card.layout.h, start.y + Math.round(delta.y / gridSize)))

    const targetRect = { x: newX, y: newY, w: card.layout.w, h: card.layout.h }

    const overlappingCards = cards.filter((other) => other.id !== cardId && rectanglesOverlap(targetRect, other.layout))

    if (overlappingCards.length === 0) {
      setCards((prevCards) =>
        prevCards.map((c) => (c.id === cardId ? { ...c, layout: { ...c.layout, x: newX, y: newY } } : c)),
      )
      dragStartRef.current = null
      return
    }

    const occupiedRects: Array<{ x: number; y: number; w: number; h: number; id?: string }> = cards
      .filter((c) => c.id !== cardId)
      .map((c) => ({ x: c.layout.x, y: c.layout.y, w: c.layout.w, h: c.layout.h, id: c.id }))

    const reservedTarget = { x: newX, y: newY, w: card.layout.w, h: card.layout.h }
    const movedPositions = new Map<string, { x: number; y: number }>()

    for (const oc of overlappingCards) {
      const index = occupiedRects.findIndex((r) => r.id === oc.id)
      if (index !== -1) occupiedRects.splice(index, 1)
      const candidate = findEmptyPositionInOccupied([...occupiedRects, reservedTarget], oc.layout.w, oc.layout.h)
      movedPositions.set(oc.id, { x: candidate.x, y: candidate.y })
      occupiedRects.push({ x: candidate.x, y: candidate.y, w: oc.layout.w, h: oc.layout.h, id: oc.id })
    }

    setCards((prev) =>
      prev.map((c) => {
        if (c.id === cardId) {
          return { ...c, layout: { ...c.layout, x: newX, y: newY } }
        }
        const moved = movedPositions.get(c.id)
        if (moved) {
          return { ...c, layout: { ...c.layout, x: moved.x, y: moved.y } }
        }
        return c
      }),
    )

    dragStartRef.current = null
  }

  const toggleEditMode = () => {
    if (isEditing) {
      saveLayout()
    }
    setIsEditing(!isEditing)
  }

  const resetLayout = () => {
    const resetCards = cards.map((card, index) => ({
      ...card,
      layout: {
        x: (index % gridCols) * 2,
        y: Math.floor(index / gridCols) * 2,
        w: 2,
        h: 2,
        scale: 1, // 重置缩放
      },
    }))
    setCards(resetCards)
  }

  const activeCard = cards.find((card) => card.id === activeId)

  const containerDims = (() => {
    if (layoutMode === "freeform") {
      const maxRight = cards.reduce(
        (max, c) => Math.max(max, (c.layout.x || 0) + Math.max(1, Math.round(c.layout.w || 0))),
        0,
      )
      const maxBottom = cards.reduce(
        (max, c) => Math.max(max, (c.layout.y || 0) + Math.max(1, Math.round(c.layout.h || 0))),
        0,
      )
      return { width: maxRight, height: maxBottom }
    }
    return { width: gridCols * gridSize, height: gridRows * gridSize }
  })()

  return (
    <LocalThemeEditorVisibilityProvider visible={isEditing}>
      <div className={cn("min-h-screen bg-background p-6", className)}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">PC自定义工作台</h1>

            {/* <div className="flex items-center gap-2">
            <button
              onClick={() => setLayoutMode("freeform")}
              className={cn(
                "p-2 rounded-lg transition-colors",
                layoutMode === "freeform" ? "bg-primary text-primary-foreground" : "bg-muted",
              )}
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLayoutMode("grid")}
              className={cn(
                "p-2 rounded-lg transition-colors",
                layoutMode === "grid" ? "bg-primary text-primary-foreground" : "bg-muted",
              )}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
          </div> */}

            {/* <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">网格:</span>
            <select
              value={gridCols}
              onChange={(e) => setGridCols(Number(e.target.value))}
              className="px-2 py-1 rounded border text-sm"
            >
              <option value={6}>6列</option>
              <option value={8}>8列</option>
              <option value={10}>10列</option>
              <option value={12}>12列</option>
            </select>
            <span className="text-xs text-muted-foreground">×</span>
            <select
              value={gridRows}
              onChange={(e) => setGridRows(Number(e.target.value))}
              className="px-2 py-1 rounded border text-sm"
            >
              <option value={4}>4行</option>
              <option value={6}>6行</option>
              <option value={8}>8行</option>
              <option value={10}>10行</option>
            </select>
          </div> */}
          </div>

          <div className="flex gap-2">
            {isEditing && cards.length > 0 && (
              <Button variant="outline" onClick={resetLayout}>
                <RotateCcw className="w-4 h-4 mr-2" />
                重置布局
              </Button>
            )}
            <Button variant={isEditing ? "default" : "outline"} onClick={toggleEditMode}>
              {isEditing ? (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  保存布局
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4 mr-2" />
                  编辑布局
                </>
              )}
            </Button>
            {isEditing && (
              <PillButton onClick={() => setShowCardSelector(true)} className="flex items-center gap-2">
                <Plus className="w-4 h-4 mr-2" />
                添加卡片
              </PillButton>
            )}
          </div>
        </div>

        <div className="">
          {cards.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <LayoutGrid className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">开始构建您的PC工作台</h3>
              <p className="text-muted-foreground mb-4">点击右上角的"添加卡片"按钮来添加功能模块</p>
              {isEditing && (
                <PillButton onClick={() => setShowCardSelector(true)}>
                  <Plus className="w-4 h-4 mr-2" style={{ display: 'inline-block' }} />
                  添加第一个卡片
                </PillButton>
              )}
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <GridDropZone
                gridCols={gridCols}
                gridRows={gridRows}
                gridSize={gridSize}
                layoutMode={layoutMode}
                containerWidth={containerDims.width}
                containerHeight={containerDims.height}
              >
                {cards.map((card) => (
                  <LocalThemeKeyProvider key={card.id} value={card.id}>
                    <GridCard
                      card={card}
                      isEditing={isEditing}
                      onRemove={removeCard}
                      onResize={resizeCard}
                      onScale={scaleCard}
                      gridSize={gridSize}
                      layoutMode={layoutMode}
                    />
                  </LocalThemeKeyProvider>
                ))}
              </GridDropZone>

              <DragOverlay dropAnimation={null}>
                {activeCard ? (
                  <div className="shadow-2xl">
                    <div
                      style={{
                        width:
                          layoutMode === "freeform"
                            ? Math.max(MIN_FREEFORM_WIDTH, Math.round(activeCard.layout.w))
                            : Math.max(MIN_GRID_W * gridSize - 8, activeCard.layout.w * gridSize - 8),
                        height:
                          layoutMode === "freeform"
                            ? Math.max(MIN_FREEFORM_HEIGHT, Math.round(activeCard.layout.h))
                            : Math.max(MIN_GRID_H * gridSize - 8, activeCard.layout.h * gridSize - 8),
                      }}
                    >
                      {activeCard.component}
                    </div>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          )}
        </div>

        {showCardSelector && isEditing && (
          <>
            <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowCardSelector(false)} />
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">选择功能卡片</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowCardSelector(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                  {allCategories.map((cat) => (
                    <Button
                      key={cat}
                      variant={selectedCategory === cat ? "default" : "outline"}
                      size="sm"
                      className="whitespace-nowrap text-sm h-9"
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-160px)]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCards.map((cardConfig) => {
                    const isAdded = cards.some((card) => card.type === cardConfig.id)
                    return (
                      <div
                        key={cardConfig.id}
                        className={`cursor-pointer transition-all border rounded-xl p-4 ${isAdded
                          ? "bg-gray-50 border-gray-200 opacity-50"
                          : "hover:shadow-lg hover:scale-[1.02] border-gray-200 hover:border-primary/30"
                          }`}
                        onClick={() => !isAdded && addCard(cardConfig)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="font-semibold text-base mb-1">{cardConfig.name}</h5>
                            <p className="text-sm text-gray-500 mb-2">{cardConfig.category}分类</p>
                            <Badge variant="outline" className="text-xs">
                              {cardConfig.category}
                            </Badge>
                          </div>
                          {isAdded && (
                            <Badge variant="secondary" className="text-xs ml-2">
                              已添加
                            </Badge>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </LocalThemeEditorVisibilityProvider>
  )
}
