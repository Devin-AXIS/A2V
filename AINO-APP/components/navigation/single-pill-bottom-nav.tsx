"use client"

import React from "react"
import { createPortal } from "react-dom"
import { PillButton } from "@/components/basic/pill-button"

export interface SinglePillBottomNavAction {
  label: string
  onClick: () => void
  icon?: React.ReactNode
  variant?: "default" | "primary"
  disabled?: boolean
  loading?: boolean
}

interface SinglePillBottomNavProps {
  action: SinglePillBottomNavAction
  className?: string
  position?: "left" | "right" | "center" // 位置配置
}

export function SinglePillBottomNav({
  action,
  className = "",
  position = "center"
}: SinglePillBottomNavProps) {
  const navigation = (
    <div className={`fixed bottom-6 left-4 right-4 z-[10000] ${className}`}>
      <PillButton
        onClick={action.onClick}
        disabled={action.disabled || action.loading}
        variant={action.variant || "primary"}
        className="w-full h-10 flex items-center justify-center gap-2 px-6 text-sm"
      >
        {action.loading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          action.icon
        )}
        {action.loading ? "处理中..." : action.label}
      </PillButton>
    </div>
  )

  // 使用Portal确保渲染在body层级，显示在所有内容之上
  // 添加客户端检查避免SSR错误
  if (typeof window === 'undefined') return null
  return createPortal(navigation, document.body)
}
