"use client"

import React from "react"
import { createPortal } from "react-dom"
import { PillButton } from "@/components/basic/pill-button"

export interface PrimaryPillBottomNavAction {
  label: string
  onClick: () => void
  disabled?: boolean
  loading?: boolean
  variant?: "default" | "primary"
  icon?: React.ReactNode
}

interface PrimaryPillBottomNavProps {
  actions: PrimaryPillBottomNavAction[]
  className?: string
}

export function PrimaryPillBottomNav({ 
  actions, 
  className = "" 
}: PrimaryPillBottomNavProps) {
  if (!actions || actions.length === 0) return null

  const navigation = (
    <div className={`fixed bottom-6 left-4 right-4 z-[10000] ${className}`}>
      <div className="flex gap-3">
        {actions.map((action, index) => (
          <PillButton
            key={index}
            onClick={action.onClick}
            disabled={action.disabled || action.loading}
            variant={action.variant || (index === 0 ? "primary" : "default")}
            className="flex-1 h-10 flex items-center justify-center gap-2 text-sm"
          >
            {action.loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              action.icon
            )}
            {action.loading ? "处理中..." : action.label}
          </PillButton>
        ))}
      </div>
    </div>
  )

  // 使用Portal确保渲染在body层级，显示在所有内容之上
  // 添加客户端检查避免SSR错误
  if (typeof window === 'undefined') return null
  return createPortal(navigation, document.body)
}
