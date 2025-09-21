"use client"

import { cn } from "@/lib/utils"
import { Check } from "lucide-react"
import { useChartTheme } from "@/components/providers/unified-chart-theme-provider"
import type React from "react"

interface CheckboxProps {
  id: string
  label: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

export function Checkbox({ id, label, checked, onCheckedChange }: CheckboxProps) {
  const { palette } = useChartTheme()
  const primaryColor = palette[0] || "#3b82f6"

  return (
    <div className="flex items-center gap-2.5">
      <button
        id={id}
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          "h-5 w-5 flex-shrink-0 rounded-md border-2 flex items-center justify-center transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white/50",
          !checked && "bg-gray-200/80 backdrop-blur-sm border-transparent",
        )}
        style={
          {
            backgroundColor: checked ? primaryColor : undefined,
            borderColor: checked ? primaryColor : "transparent",
            color: "white",
            "--tw-ring-color": primaryColor,
          } as React.CSSProperties
        }
      >
        {checked && <Check className="h-3.5 w-3.5" />}
      </button>
      <label htmlFor={id} className="text-sm text-gray-700 cursor-pointer">
        {label}
      </label>
    </div>
  )
}
