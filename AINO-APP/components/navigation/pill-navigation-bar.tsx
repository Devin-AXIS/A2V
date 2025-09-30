"use client"

import React from "react"
import { PillButton } from "@/components/basic/pill-button"

export interface PillNavigationBarItem {
  id: string
  label: string
  icon?: React.ReactNode
  onClick: () => void
  disabled?: boolean
  loading?: boolean
  badge?: number
}

interface PillNavigationBarProps {
  items: PillNavigationBarItem[]
  activeId?: string
  className?: string
}

export function PillNavigationBar({
  items,
  activeId,
  className = ""
}: PillNavigationBarProps) {
  if (!items || items.length === 0) return null

  return (
    <div 
      className={`rounded-full px-4 py-2 ${className}`}
      style={{ 
        backgroundColor: "var(--background-secondary, #f8fafc)",
        border: "1px solid var(--border, #e2e8f0)"
      }}
    >
      <div className="flex gap-2">
        {items.map((item) => (
        <div key={item.id} className="relative flex-1">
          <PillButton
            onClick={item.onClick}
            disabled={item.disabled || item.loading}
            variant={activeId === item.id ? "primary" : "default"}
            className="w-full h-10 flex items-center justify-center gap-2 text-sm"
          >
            {item.loading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              item.icon
            )}
            {item.loading ? "..." : item.label}
          </PillButton>

          {/* 徽章显示 */}
          {item.badge && item.badge > 0 && (
            <div 
              className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-xs font-bold px-1"
              style={{
                backgroundColor: "var(--card-error-color, #ef4444)",
                color: "#ffffff"
              }}
            >
              {item.badge > 99 ? "99+" : item.badge}
            </div>
          )}
          </div>
        ))}
      </div>
    </div>
  )
}
