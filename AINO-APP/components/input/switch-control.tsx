"use client"

import { cn } from "@/lib/utils"
import { useChartTheme } from "@/components/providers/unified-chart-theme-provider"
import type React from "react"

interface SwitchControlProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  id?: string
}

export function SwitchControl({ checked, onCheckedChange, id }: SwitchControlProps) {
  const { palette } = useChartTheme()
  const primaryColor = palette[0] || "#3b82f6"

  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-all duration-300 ease-in-out",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white/50",
      )}
      style={
        {
          backgroundColor: checked ? primaryColor : "#e5e7eb", // gray-200
          "--tw-ring-color": primaryColor,
        } as React.CSSProperties
      }
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-300 ease-in-out",
          checked ? "translate-x-5" : "translate-x-0",
        )}
      />
    </button>
  )
}
