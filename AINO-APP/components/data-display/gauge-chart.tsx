"use client"

import { useDataChartTheme } from "@/components/providers/unified-chart-theme-provider"
import { ChartCard } from "./chart-card"

interface GaugeChartProps {
  value?: number
  max?: number
  title?: string
  subtitle?: string
}

export function GaugeChart({
  value = 75,
  max = 100,
  title = "Performance Score",
  subtitle = "Current month",
}: GaugeChartProps) {
  const { palette } = useDataChartTheme()
  const percentage = (value / max) * 100
  const strokeDasharray = `${percentage * 2.51} 251.2` // 2.51 is circumference/100

  const getColor = () => {
    if (percentage >= 80) return palette[2] || "hsl(var(--success))" // Green
    if (percentage >= 60) return palette[1] || "hsl(var(--warning))" // Yellow
    return palette[3] || "hsl(var(--destructive))" // Red
  }

  return (
    <ChartCard>
      <h3 className="text-lg font-semibold" style={{ color: "var(--card-title-color)" }}>
        {title}
      </h3>
      <p className="text-sm text-gray-500 mb-4" style={{ color: "var(--card-text-color)" }}>
        {subtitle}
      </p>
      <div className="h-72 flex items-center justify-center">
        <div className="relative w-48 h-48">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="rgba(229, 231, 235, 0.3)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke={getColor()}
              strokeWidth="8"
              fill="none"
              strokeDasharray={strokeDasharray}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
              style={{
                filter: "drop-shadow(0 0 8px rgba(0, 0, 0, 0.1))",
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold" style={{ color: "var(--card-title-color)" }}>
              {value}
            </span>
            <span className="text-sm" style={{ color: "var(--card-text-color)" }}>
              out of {max}
            </span>
          </div>
        </div>
      </div>
    </ChartCard>
  )
}
