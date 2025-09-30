"use client"

import React from "react"
import { PillButton } from "@/components/basic/pill-button"

export interface TextActionBottomNavAction {
  id: string
  label: string
  onClick: () => void
  icon?: React.ReactNode
  variant?: "default" | "primary"
  disabled?: boolean
  loading?: boolean
}

export interface TextActionBottomNavInfo {
  title?: string
  subtitle?: string
  icon?: React.ReactNode
}

interface TextActionBottomNavProps {
  info: TextActionBottomNavInfo
  actions: TextActionBottomNavAction[]
  className?: string
}

export function TextActionBottomNav({
  info,
  actions,
  className = ""
}: TextActionBottomNavProps) {
  if (!actions || actions.length === 0) return null

  return (
    <div 
      className={`w-full rounded-full px-4 py-2 ${className}`}
      style={{ 
        backgroundColor: "var(--background-secondary, #f8fafc)",
        border: "1px solid var(--border, #e2e8f0)"
      }}
    >
      <div className="flex items-center justify-between gap-3">
        {/* 左侧文字信息 */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {info.icon && (
            <div className="flex-shrink-0">
              <div className="w-4 h-4">
                {info.icon}
              </div>
            </div>
          )}
          
          <div className="min-w-0">
            {info.title && (
              <h3 
                className="font-semibold text-sm truncate"
                style={{ color: "var(--card-title-color, #1f2937)" }}
              >
                {info.title}
              </h3>
            )}
            
            {info.subtitle && (
              <p 
                className="text-xs truncate"
                style={{ color: "var(--card-text-color, #64748b)" }}
              >
                {info.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* 右侧胶囊按钮 */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {actions.map((action) => (
            <PillButton
              key={action.id}
              onClick={action.onClick}
              disabled={action.disabled || action.loading}
              variant={action.variant || "default"}
              className="h-10 px-4 flex items-center justify-center gap-2 text-sm"
            >
              {action.loading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                action.icon
              )}
              {action.loading ? "..." : action.label}
            </PillButton>
          ))}
        </div>
      </div>
    </div>
  )
}
