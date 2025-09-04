"use client"

import { cn } from "@/lib/utils"
import type React from "react"
import { Plus } from "lucide-react"
import { useMemo } from "react"
import { useChartTheme } from "@/components/providers/unified-chart-theme-provider"

interface FloatingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode
}

function getContrastColor(hexColor: string): string {
  if (!hexColor.startsWith("#")) return "hsl(var(--foreground))"
  const r = parseInt(hexColor.slice(1, 3), 16)
  const g = parseInt(hexColor.slice(3, 5), 16)
  const b = parseInt(hexColor.slice(5, 7), 16)
  const yiq = (r * 299 + g * 587 + b * 114) / 1000
  return yiq >= 128 ? "hsl(var(--foreground))" : "hsl(var(--background))"
}

export function FloatingButton({ className, icon, ...props }: FloatingButtonProps) {
  const { palette } = useChartTheme()
  const primaryColor = palette[0] || "hsl(var(--primary))"
  const textColorForPrimary = useMemo(() => getContrastColor(primaryColor), [primaryColor])

  return (
    <button
      className={cn(
        "w-14 h-14 flex items-center justify-center rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transform transition-all duration-300 focus:outline-none focus:ring-4",
        className,
      )}
      style={
        {
          backgroundColor: primaryColor,
          color: textColorForPrimary,
          "--tw-ring-color": primaryColor,
          ringOffsetColor: "white",
        } as React.CSSProperties
      }
      {...props}
    >
      {icon || <Plus className="w-7 h-7" />}
    </button>
  )
}
