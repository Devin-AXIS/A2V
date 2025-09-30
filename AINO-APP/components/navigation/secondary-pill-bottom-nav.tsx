"use client"

import React from "react"
import { createPortal } from "react-dom"
import { PillButton } from "@/components/basic/pill-button"

export interface SecondaryPillBottomNavAction {
  label: string
  onClick: () => void
  disabled?: boolean
  loading?: boolean
  variant?: "default" | "primary"
  icon?: React.ReactNode
  badge?: number
  iconOnly?: boolean // 只显示图标，圆形按钮
  isMain?: boolean // 是否为主操作按钮
}

interface SecondaryPillBottomNavProps {
  actions: SecondaryPillBottomNavAction[]
  className?: string
  position?: "left" | "right" | "center" // 位置配置
}

export function SecondaryPillBottomNav({ 
  actions, 
  className = "",
  position = "center"
}: SecondaryPillBottomNavProps) {
  if (!actions || actions.length === 0) return null

  const positionClasses = {
    left: "left-4 right-auto",
    right: "right-4 left-auto", 
    center: "left-4 right-4"
  }

  const navigation = (
    <div className={`fixed bottom-6 z-[10000] ${positionClasses[position]} ${className}`}>
      <div className="flex items-center gap-2">
        {actions.map((action, index) => (
          <div key={index} className="relative" style={{
            // 主胶囊按钮占满大部分空间，图标按钮固定宽度
            flex: action.iconOnly ? '0 0 40px' : '1'
          }}>
            {action.iconOnly ? (
              // 圆形图标按钮
              <button
                onClick={action.onClick}
                disabled={action.disabled || action.loading}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105"
                style={{
                  backgroundColor: "var(--card-background, #ffffff)",
                  color: "var(--card-text-color, #64748b)",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
                }}
              >
                {action.loading ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  action.icon
                )}
              </button>
            ) : (
              // 主胶囊按钮 - 占满剩余空间
              <PillButton
                onClick={action.onClick}
                disabled={action.disabled || action.loading}
                variant={action.variant || "default"}
                className="w-full h-10 flex items-center justify-center gap-2 px-4 text-sm"
              >
                {action.loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  action.icon
                )}
                {action.loading ? "..." : action.label}
              </PillButton>
            )}
            
            {/* 徽章显示 */}
            {action.badge && action.badge > 0 && (
              <div 
                className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-xs font-bold px-1"
                style={{
                  backgroundColor: "var(--card-error-color, #ef4444)",
                  color: "#ffffff"
                }}
              >
                {action.badge > 99 ? "99+" : action.badge}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )

  // 使用Portal确保渲染在body层级，显示在所有内容之上
  // 添加客户端检查避免SSR错误
  if (typeof window === 'undefined') return null
  return createPortal(navigation, document.body)
}
