"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useChartTheme } from "@/components/providers/unified-chart-theme-provider"
import { BottomDrawer } from "@/components/feedback/bottom-drawer"

interface ColorPickerProps {
  label: string
}

const presetColors = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#14b8a6",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#d946ef",
]

export function ColorPicker({ label }: ColorPickerProps) {
  const { palette } = useChartTheme()
  const primaryColor = palette[0] || "#3b82f6"
  const [selectedColor, setSelectedColor] = useState(primaryColor)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setSelectedColor(primaryColor)
  }, [primaryColor])

  return (
    <div className="w-full max-w-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <button
          onClick={() => setIsOpen(true)}
          className="w-8 h-8 rounded-full border-2 border-white shadow-md"
          style={{ backgroundColor: selectedColor }}
        />
      </div>

      <BottomDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} title="选择颜色">
        <div className="p-3">
          <div className="grid grid-cols-5 gap-2">
            {presetColors.map((color) => (
              <button
                key={color}
                onClick={() => {
                  setSelectedColor(color)
                  setIsOpen(false)
                }}
                className={cn(
                  "w-8 h-8 rounded-full transition-transform hover:scale-110",
                  selectedColor === color && "ring-2 ring-offset-2",
                )}
                style={{ backgroundColor: color, "--tw-ring-color": primaryColor } as React.CSSProperties}
              />
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">自定义</span>
              <input
                aria-label="自定义颜色"
                type="color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-10 h-10 p-0 border-none bg-transparent cursor-pointer"
              />
            </div>
          </div>
        </div>
      </BottomDrawer>
    </div>
  )
}
