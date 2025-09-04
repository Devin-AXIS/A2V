"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCardTheme } from "@/components/providers/card-theme-provider"
import { createPortal } from "react-dom"

interface BottomDrawerProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}

export function BottomDrawer({ isOpen, onClose, title, children, className }: BottomDrawerProps) {
  const { theme } = useCardTheme()

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  // 优化的毛玻璃效果样式
  const drawerStyle: React.CSSProperties = {
    color: theme.textColor,
    fontFamily: theme.fontFamily,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(12px) saturate(120%)",
    WebkitBackdropFilter: "blur(12px) saturate(120%)",
    border: "none",
    boxShadow: "0 -8px 32px rgba(0, 0, 0, 0.12), 0 -2px 8px rgba(0, 0, 0, 0.08)",
  }

  const drawer = (
    <div className="fixed inset-0 z-[9999]">
      <div 
        className="absolute inset-0 bg-black/40 animate-in fade-in-0 duration-300" 
        style={{
          backdropFilter: "blur(2px)",
          WebkitBackdropFilter: "blur(2px)",
        }}
        onClick={onClose} 
      />

      <div className="absolute inset-x-0 bottom-0 z-10">
        <div
          className={cn(
            "w-full max-h-[85vh] rounded-t-3xl animate-in slide-in-from-bottom-full duration-300 ease-out",
            className,
          )}
          style={drawerStyle}
        >
          {/* 标题栏 - 固定高度 */}
          {title && (
            <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-100/60">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-gray-100/80 rounded-full transition-colors duration-200" 
                aria-label="关闭"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          )}

          {/* 内容区域 - 使用CSS scrollbar-gutter和明确高度 */}
          <div 
            className="overflow-y-auto"
            style={{
              height: title ? 'calc(85vh - 80px)' : '85vh',
              maxHeight: title ? 'calc(85vh - 80px)' : '85vh',
              scrollbarGutter: 'stable',
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(0, 0, 0, 0.2) transparent'
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(drawer, document.body)
}
