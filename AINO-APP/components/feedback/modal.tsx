"use client"

import { cn } from "@/lib/utils"
import type React from "react"
import { X } from "lucide-react"
import { useChartTheme } from "@/components/providers/unified-chart-theme-provider"
import { useFrostedEffect } from "@/components/providers/frosted-effect-provider"
import { useEffect } from "react"
import { createPortal } from "react-dom"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: "sm" | "md" | "lg" | "xl"
  closable?: boolean
  className?: string
}

const sizeConfig = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl"
}

export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = "md",
  closable = true,
  className 
}: ModalProps) {
  const { isFrosted } = useFrostedEffect()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closable) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose, closable])

  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closable) {
      onClose()
    }
  }

  const modalContent = (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* 背景遮罩 */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      
      {/* 模态框内容 */}
      <div className={cn(
        "relative w-full bg-white rounded-2xl shadow-2xl transition-all duration-300",
        "transform scale-100 opacity-100",
        sizeConfig[size],
        isFrosted && "backdrop-blur-lg border border-white/40",
        className
      )}>
        {/* 标题栏 */}
        {title && (
          <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">
              {title}
            </h2>
            {closable && (
              <button
                onClick={onClose}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  "hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
                )}
                aria-label="关闭模态框"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            )}
          </div>
        )}
        
        {/* 内容区域 */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )

  // 使用 Portal 渲染到 body 层级
  return createPortal(modalContent, document.body)
}

// 模态框头部组件
interface ModalHeaderProps {
  children: React.ReactNode
  className?: string
}

export function ModalHeader({ children, className }: ModalHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between pb-4 border-b border-gray-100", className)}>
      {children}
    </div>
  )
}

// 模态框内容组件
interface ModalContentProps {
  children: React.ReactNode
  className?: string
}

export function ModalContent({ children, className }: ModalContentProps) {
  return (
    <div className={cn("py-4", className)}>
      {children}
    </div>
  )
}

// 模态框底部组件
interface ModalFooterProps {
  children: React.ReactNode
  className?: string
}

export function ModalFooter({ children, className }: ModalFooterProps) {
  return (
    <div className={cn("flex items-center justify-end gap-3 pt-4 border-t border-gray-100", className)}>
      {children}
    </div>
  )
}

