"use client"
import { Minus, Plus } from "lucide-react"
import { useChartTheme } from "@/components/providers/unified-chart-theme-provider"

interface StepperProps {
  label: string
  value: number
  onValueChange: (value: number) => void
  min?: number
  max?: number
  step?: number
}

export function Stepper({ label, value, onValueChange, min = 0, max = 100, step = 1 }: StepperProps) {
  const { palette } = useChartTheme()
  const primaryColor = palette[0] || "#3b82f6"

  const handleIncrement = () => {
    if (value < max) {
      onValueChange(value + step)
    }
  }

  const handleDecrement = () => {
    if (value > min) {
      onValueChange(value - step)
    }
  }

  return (
    <div className="w-full max-w-sm">
      <label className="block text-xs font-medium text-gray-600 mb-2">{label}</label>
      <div className="flex items-center gap-3">
        <button
          onClick={handleDecrement}
          disabled={value <= min}
          className="h-8 w-8 flex items-center justify-center rounded-full bg-gray-100/80 text-gray-600 hover:bg-gray-200/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Minus className="h-4 w-4" />
        </button>
        <div className="flex-1 text-center text-lg font-semibold" style={{ color: primaryColor }}>
          {value}
        </div>
        <button
          onClick={handleIncrement}
          disabled={value >= max}
          className="h-8 w-8 flex items-center justify-center rounded-full text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          style={{ backgroundColor: primaryColor }}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
