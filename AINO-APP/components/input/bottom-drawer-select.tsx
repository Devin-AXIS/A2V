"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { useChartTheme } from "@/components/providers/unified-chart-theme-provider"
import { BottomDrawer } from "@/components/feedback/bottom-drawer"

interface Option {
  value: string
  label: string
}

interface BottomDrawerSelectProps {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  options: Option[]
  className?: string
  title?: string
}

function getContrastColor(hexColor: string): string {
  if (!hexColor.startsWith("#")) return "#000000"
  const r = Number.parseInt(hexColor.slice(1, 3), 16)
  const g = Number.parseInt(hexColor.slice(3, 5), 16)
  const b = Number.parseInt(hexColor.slice(5, 7), 16)
  const yiq = (r * 299 + g * 587 + b * 114) / 1000
  return yiq >= 128 ? "#000000" : "#ffffff"
}

export function BottomDrawerSelect({
  placeholder = "请选择",
  value,
  onChange,
  options,
  className,
  title = "请选择"
}: BottomDrawerSelectProps) {
  const { palette } = useChartTheme()
  const primaryColor = palette[0] || "#000000"
  const textColorForPrimary = useMemo(() => getContrastColor(primaryColor), [primaryColor])

  const [isOpen, setIsOpen] = useState(false)

  const handleSelect = (optionValue: string) => {
    onChange?.(optionValue)
    setIsOpen(false)
  }

  const selectedOption = options.find(option => option.value === value)

  return (
    <div className={cn("w-full max-w-sm", className)}>
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "w-full flex items-center justify-between px-3.5 py-2.5 bg-white/70 backdrop-blur-lg rounded-xl shadow-sm border border-white/80 transition-all duration-300 text-sm",
          isOpen && "ring-2 shadow-lg",
        )}
        style={{ "--tw-ring-color": primaryColor } as React.CSSProperties}
      >
        <span className={selectedOption ? "text-gray-900" : "text-gray-400"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform duration-300", isOpen && "rotate-180")} />
      </button>

      <BottomDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} title={title}>
        <div className="p-3">
          <div className="space-y-1">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm transition-colors",
                  "hover:bg-gray-500/10",
                  value === option.value && "font-semibold"
                )}
                style={
                  value === option.value
                    ? { backgroundColor: `${primaryColor}15`, color: primaryColor }
                    : { color: "var(--card-text-color)" }
                }
              >
                <span>{option.label}</span>
                {value === option.value && (
                  <Check className="w-4 h-4" style={{ color: primaryColor }} />
                )}
              </button>
            ))}
          </div>
        </div>
      </BottomDrawer>
    </div>
  )
}
