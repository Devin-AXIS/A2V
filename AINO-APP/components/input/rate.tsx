"use client"
import { useState } from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { useChartTheme } from "@/components/providers/unified-chart-theme-provider"

interface RateProps {
  label: string
  count?: number
  value: number
  onValueChange: (value: number) => void
}

export function Rate({ label, count = 5, value, onValueChange }: RateProps) {
  const { palette } = useChartTheme()
  const primaryColor = palette[0] || "#facc15" // yellow-400 fallback
  const [hoverValue, setHoverValue] = useState(0)

  return (
    <div className="w-full max-w-sm">
      <label className="block text-xs font-medium text-gray-600 mb-2">{label}</label>
      <div className="flex items-center gap-1" onMouseLeave={() => setHoverValue(0)}>
        {Array.from({ length: count }).map((_, index) => {
          const ratingValue = index + 1
          return (
            <button
              key={index}
              type="button"
              onClick={() => onValueChange(ratingValue)}
              onMouseEnter={() => setHoverValue(ratingValue)}
              className="focus:outline-none"
            >
              <Star
                className={cn("h-6 w-6 cursor-pointer transition-colors")}
                style={{
                  color: ratingValue <= (hoverValue || value) ? primaryColor : "#d1d5db",
                }}
                fill={ratingValue <= (hoverValue || value) ? primaryColor : "transparent"}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
