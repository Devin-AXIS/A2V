"use client"

import type React from "react"
import { cn } from "@/lib/utils"
import { useChartTheme } from "@/components/providers/unified-chart-theme-provider"

interface RadioOption {
  value: string
  label: string
}

interface RadioGroupProps {
  label: string
  options: RadioOption[]
  value: string
  onValueChange: (value: string) => void
}

export function RadioGroup({ label, options, value, onValueChange }: RadioGroupProps) {
  const { palette } = useChartTheme()
  const primaryColor = palette[0] || "#3b82f6"

  return (
    <div className="w-full max-w-sm">
      <label className="block text-xs font-medium text-gray-600 mb-2">{label}</label>
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        {options.map((option) => (
          <div key={option.value} className="flex items-center gap-2">
            <button
              type="button"
              role="radio"
              aria-checked={value === option.value}
              onClick={() => onValueChange(option.value)}
              className={cn(
                "h-5 w-5 flex-shrink-0 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white/50",
              )}
              style={
                {
                  borderColor: value === option.value ? primaryColor : "#d1d5db", // gray-300
                  "--tw-ring-color": primaryColor,
                } as React.CSSProperties
              }
            >
              {value === option.value && (
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: primaryColor }} />
              )}
            </button>
            <span className="text-sm text-gray-700 cursor-pointer" onClick={() => onValueChange(option.value)}>
              {option.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
